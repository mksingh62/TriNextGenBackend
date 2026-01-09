// =====================================================
// FILE: routes/projects.js - COMPLETE PROJECT ROUTES
// =====================================================
const express = require("express");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Client = require("../models/Client");
const ClientProject = require("../models/ClientProject");
const Payment = require("../models/Payment");
const connectDB = require("../db");

const router = express.Router();

/* ================= ADMIN AUTH ================= */
const checkAdmin = async (req) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) return null;
    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.admin?.id) return null;
    return await Admin.findById(decoded.admin.id);
  } catch (err) {
    console.error("Admin auth failed:", err.message);
    return null;
  }
};

/* ================= GET ALL PROJECTS ================= */
router.get("/", async (req, res) => {
  try {
    await connectDB();
    const admin = await checkAdmin(req);
    if (!admin) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const projects = await ClientProject.find()
      .populate('client', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(projects);
  } catch (err) {
    console.error("Get all projects error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});



/* ================= GET PROJECTS BY CLIENT ================= */
router.get("/client/:clientId", async (req, res) => {
  try {
    await connectDB();
    const admin = await checkAdmin(req);
    if (!admin) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const projects = await ClientProject.find({
      client: req.params.clientId,
    }).sort({ createdAt: -1 });
    
    res.json(projects);
  } catch (err) {
    console.error("Get client projects error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/* ================= GET SINGLE PROJECT ================= */
router.get("/:projectId", async (req, res) => {
  try {
    await connectDB();
    const admin = await checkAdmin(req);
    if (!admin) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const project = await ClientProject.findById(req.params.projectId)
      .populate('client', 'name email phone');
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (err) {
    console.error("Get project error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/* ================= CREATE PROJECT ================= */
router.post("/", async (req, res) => {
  try {
    await connectDB();
    const admin = await checkAdmin(req);
    if (!admin) return res.status(401).json({ message: "Unauthorized" });

    const {
      client,
      title,
      category = "Web App",              // new field
      totalAmount,
      advancePaid = 0,
      status = "Active",
      liveUrl,
      description,
      startDate,
      deadline,
      requirements = []                   // ← requirements with files
    } = req.body;

    // Validation
    if (!client || !title || totalAmount === undefined) {
      return res.status(400).json({
        message: "Client, title, and total amount are required"
      });
    }

    const remainingAmount = Number(totalAmount) - Number(advancePaid);

    // Create the project
    const project = await ClientProject.create({
      client,
      title,
      category,
      totalAmount: Number(totalAmount),
      advancePaid: Number(advancePaid),
      remainingAmount,
      status,
      liveUrl,
      description,
      startDate: startDate ? new Date(startDate) : undefined,
      deadline: deadline ? new Date(deadline) : undefined,
      requirements // ← saved directly (includes text, createdAt, files with base64)
    });

    // Update client's total earnings
    await Client.findByIdAndUpdate(client, {
      $inc: { totalEarnings: Number(totalAmount) }
    });

    // Return populated project
    const populatedProject = await ClientProject.findById(project._id)
      .populate("client", "name email phone");

    res.status(201).json(populatedProject);
  } catch (err) {
    console.error("Create project error:", err);
    res.status(500).json({ 
      message: "Failed to create project", 
      error: err.message 
    });
  }
});

/* ================= UPDATE PROJECT ================= */
router.put("/:projectId", async (req, res) => {
  try {
    await connectDB();
    const admin = await checkAdmin(req);
    if (!admin) return res.status(401).json({ message: "Unauthorized" });

    const { projectId } = req.params;
    let updateData = { ...req.body };

    const oldProject = await ClientProject.findById(projectId);
    if (!oldProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    // === Handle Financial Updates ===
    if (updateData.totalAmount !== undefined || updateData.advancePaid !== undefined) {
      const newTotal = updateData.totalAmount !== undefined 
        ? Number(updateData.totalAmount) 
        : oldProject.totalAmount;

      const newAdvance = updateData.advancePaid !== undefined 
        ? Number(updateData.advancePaid) 
        : oldProject.advancePaid;

      updateData.remainingAmount = newTotal - newAdvance;

      // Adjust client totalEarnings if totalAmount changed
      if (updateData.totalAmount !== undefined) {
        const diff = newTotal - oldProject.totalAmount;
        await Client.findByIdAndUpdate(oldProject.client, {
          $inc: { totalEarnings: diff }
        });
      }
    }

    // === Handle Requirements Update ===
    if (updateData.requirements) {
      updateData.requirements = updateData.requirements.map(req => ({
        text: req.text?.trim() || "",
        createdAt: req.createdAt ? new Date(req.createdAt) : new Date(),
        files: Array.isArray(req.files) ? req.files : []
      }));
    }

    // === Handle Dates ===
    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.deadline) updateData.deadline = new Date(updateData.deadline);

    // === Perform Update ===
    const updatedProject = await ClientProject.findByIdAndUpdate(
      projectId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate("client", "name email phone");

    res.json(updatedProject);
  } catch (err) {
    console.error("Update project error:", err);
    res.status(500).json({ 
      message: "Update failed", 
      error: err.message 
    });
  }
});

/* ================= DELETE PROJECT ================= */
router.delete("/:projectId", async (req, res) => {
  try {
    await connectDB();
    const admin = await checkAdmin(req);
    if (!admin) return res.status(401).json({ message: "Unauthorized" });

    const { projectId } = req.params;

    const project = await ClientProject.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Use a sequence to ensure the Client record is updated before project is gone
    await Payment.deleteMany({ project: projectId });
    
    await Client.findByIdAndUpdate(project.client, {
      $inc: { totalEarnings: -project.totalAmount },
    });

    await ClientProject.findByIdAndDelete(projectId);

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Server Error" });
  }
});
/* ================= UPDATE PROJECT STATUS ================= */
router.patch("/:projectId/status", async (req, res) => {
  try {
    await connectDB();
    const admin = await checkAdmin(req);
    if (!admin) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const project = await ClientProject.findByIdAndUpdate(
      req.params.projectId,
      { status },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (err) {
    console.error("Update project status error:", err);
    res.status(500).json({ message: "Failed to update status" });
  }
});

/* ================= GET PROJECT PAYMENTS ================= */
router.get("/:projectId/payments", async (req, res) => {
  try {
    await connectDB();
    const admin = await checkAdmin(req);
    if (!admin) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const payments = await Payment.find({ 
      project: req.params.projectId 
    }).sort({ paymentDate: -1 });

    res.json(payments);
  } catch (err) {
    console.error("Get project payments error:", err);
    res.status(500).json([]);
  }
});

/* ================= GET PROJECT STATISTICS ================= */
router.get("/:projectId/stats", async (req, res) => {
  try {
    await connectDB();
    const admin = await checkAdmin(req);
    if (!admin) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const project = await ClientProject.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const payments = await Payment.find({ project: req.params.projectId });
    const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
    const paymentCount = payments.length;

    const stats = {
      totalAmount: project.totalAmount,
      advancePaid: project.advancePaid,
      remainingAmount: project.remainingAmount,
      totalPayments,
      paymentCount,
      completionPercentage: project.totalAmount > 0 
        ? ((project.advancePaid / project.totalAmount) * 100).toFixed(2)
        : 0,
      status: project.status,
      isCompleted: project.remainingAmount === 0
    };

    res.json(stats);
  } catch (err) {
    console.error("Get project stats error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/* ================= BULK DELETE PROJECTS ================= */
router.post("/bulk-delete", async (req, res) => {
  try {
    await connectDB();
    const admin = await checkAdmin(req);
    if (!admin) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { projectIds } = req.body;
    if (!Array.isArray(projectIds) || projectIds.length === 0) {
      return res.status(400).json({ message: "Project IDs array is required" });
    }

    const projects = await ClientProject.find({ _id: { $in: projectIds } });

    // Delete associated payments
    await Payment.deleteMany({ project: { $in: projectIds } });

    // Update client earnings for each project
    for (const project of projects) {
      await Client.findByIdAndUpdate(project.client, {
        $inc: { totalEarnings: -project.totalAmount },
      });
    }

    const result = await ClientProject.deleteMany({ _id: { $in: projectIds } });

    res.json({ 
      message: "Projects deleted successfully",
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error("Bulk delete projects error:", err);
    res.status(500).json({ message: "Failed to delete projects" });
  }
});

module.exports = router;
