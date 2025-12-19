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

/* ================= CREATE PROJECT ================= */
router.post("/", async (req, res) => {
  try {
    await connectDB();
    const admin = await checkAdmin(req);
    if (!admin) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { 
      client,
      title, 
      totalAmount, 
      advancePaid, 
      status, 
      liveUrl, 
      description,
      startDate,
      deadline
    } = req.body;

    if (!client || !title || totalAmount === undefined) {
      return res.status(400).json({ 
        message: "Client, title and total amount are required" 
      });
    }

    const remainingAmount = (totalAmount || 0) - (advancePaid || 0);

    const project = await ClientProject.create({
      client,
      title,
      totalAmount: Number(totalAmount),
      advancePaid: Number(advancePaid || 0),
      remainingAmount,
      status: status || "Active",
      liveUrl,
      description,
      startDate,
      deadline
    });

    // Update client total earnings
    await Client.findByIdAndUpdate(client, {
      $inc: { totalEarnings: Number(totalAmount) },
    });

    res.status(201).json(project);
  } catch (err) {
    console.error("Create project error:", err);
    res.status(500).json({ message: "Failed to create project" });
  }
});



/* ================= UPDATE PROJECT ================= */
// URL: PUT /api/projects/:projectId
router.put("/:projectId", adminAuth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const updateData = req.body;

    const oldProject = await ClientProject.findById(projectId);
    if (!oldProject) return res.status(404).json({ message: "Project not found" });

    // recalculate financials if amounts changed
    if (updateData.totalAmount !== undefined || updateData.advancePaid !== undefined) {
      const total = updateData.totalAmount !== undefined ? Number(updateData.totalAmount) : oldProject.totalAmount;
      const advance = updateData.advancePaid !== undefined ? Number(updateData.advancePaid) : oldProject.advancePaid;
      updateData.remainingAmount = total - advance;

      // Update client earnings if the total deal value changed
      if (updateData.totalAmount !== undefined) {
        const diff = Number(updateData.totalAmount) - oldProject.totalAmount;
        await Client.findByIdAndUpdate(oldProject.client, { $inc: { totalEarnings: diff } });
      }
    }

    const updatedProject = await ClientProject.findByIdAndUpdate(
      projectId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.json(updatedProject);
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
});

/* ================= DELETE PROJECT ================= */
// URL: DELETE /api/projects/:projectId
router.delete("/:projectId", async (req, res) => {
  try {
    await connectDB();
    const admin = await checkAdmin(req);
    if (!admin) return res.status(401).json({ message: "Unauthorized" });

    const projectId = req.params.projectId;

    // 1. Find project first to get client ID and Amount
    const project = await ClientProject.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // 2. Use Promise.all to ensure all cleanup tasks finish before sending response
    await Promise.all([
      Payment.deleteMany({ project: projectId }),
      Client.findByIdAndUpdate(project.client, {
        $inc: { totalEarnings: -project.totalAmount },
      }),
      ClientProject.findByIdAndDelete(projectId)
    ]);

    return res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
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
