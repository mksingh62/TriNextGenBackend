// FILE 4: routes/clients.js
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

/* ================= CREATE CLIENT ================= */
router.post("/", async (req, res) => {
  try {
    await connectDB();
    const admin = await checkAdmin(req);
    if (!admin) return res.status(401).json({ message: "Unauthorized" });
    
    const client = await Client.create(req.body);
    res.status(201).json(client);
  } catch (err) {
    console.error("Create client error:", err);
    res.status(500).json({ message: "Failed to create client" });
  }
});

/* ================= GET ALL CLIENTS ================= */
router.get("/", async (req, res) => {
  try {
    await connectDB();
    const admin = await checkAdmin(req);
    if (!admin) return res.status(401).json([]);
    
    const clients = await Client.find().sort({ createdAt: -1 });
    
    const data = await Promise.all(
      clients.map(async (c) => {
        const projectsCount = await ClientProject.countDocuments({
          client: c._id,
        });
        
        // Calculate total deal value and remaining amounts
        const projects = await ClientProject.find({ client: c._id });
        const totalDealValue = projects.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
        const totalAdvance = projects.reduce((sum, p) => sum + (p.advancePaid || 0), 0);
        const totalRemaining = projects.reduce((sum, p) => sum + (p.remainingAmount || 0), 0);
        
        return { 
          ...c.toObject(), 
          projectsCount,
          totalDealValue,
          totalAdvance,
          totalRemaining
        };
      })
    );
    
    res.json(data);
  } catch (err) {
    console.error("Get clients error:", err);
    res.status(500).json([]);
  }
});

/* ================= GET SINGLE CLIENT ================= */
router.get("/:clientId", async (req, res) => {
  try {
    await connectDB();
    const admin = await checkAdmin(req);
    if (!admin) return res.status(401).json({ message: "Unauthorized" });
    
    const client = await Client.findById(req.params.clientId);
    if (!client) return res.status(404).json({ message: "Client not found" });
    
    // Add aggregated data
    const projects = await ClientProject.find({ client: req.params.clientId });
    const totalDealValue = projects.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
    const totalAdvance = projects.reduce((sum, p) => sum + (p.advancePaid || 0), 0);
    const totalRemaining = projects.reduce((sum, p) => sum + (p.remainingAmount || 0), 0);
    
    res.json({
      ...client.toObject(),
      totalDealValue,
      totalAdvance,
      totalRemaining
    });
  } catch (err) {
    console.error("Get client error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= UPDATE CLIENT ================= */
router.put("/:clientId", async (req, res) => {
  try {
    await connectDB();
    const admin = await checkAdmin(req);
    if (!admin) return res.status(401).json({ message: "Unauthorized" });
    
    const client = await Client.findByIdAndUpdate(
      req.params.clientId,
      req.body,
      { new: true }
    );
    
    if (!client) return res.status(404).json({ message: "Client not found" });
    res.json(client);
  } catch (err) {
    console.error("Update client error:", err);
    res.status(500).json({ message: "Failed to update client" });
  }
});

/* ================= DELETE CLIENT ================= */
router.delete("/:clientId", async (req, res) => {
  try {
    await connectDB();
    const admin = await checkAdmin(req);
    if (!admin) return res.status(401).json({ message: "Unauthorized" });
    
    // Delete all associated projects and payments
    await ClientProject.deleteMany({ client: req.params.clientId });
    await Payment.deleteMany({ client: req.params.clientId });
    
    const client = await Client.findByIdAndDelete(req.params.clientId);
    if (!client) return res.status(404).json({ message: "Client not found" });
    
    res.json({ message: "Client deleted successfully" });
  } catch (err) {
    console.error("Delete client error:", err);
    res.status(500).json({ message: "Failed to delete client" });
  }
});

/* ================= GET PROJECTS BY CLIENT ================= */
router.get("/:clientId/projects", async (req, res) => {
  try {
    await connectDB();
    const admin = await checkAdmin(req);
    if (!admin) return res.status(401).json({ message: "Unauthorized" });
    
    const projects = await ClientProject.find({
      client: req.params.clientId,
    }).sort({ createdAt: -1 });
    
    res.json(projects);
  } catch (err) {
    console.error("Get projects error:", err);
    res.status(500).json([]);
  }
});

/* ================= ADD PROJECT TO CLIENT ================= */
router.post("/:clientId/projects", async (req, res) => {
  try {
    await connectDB();
    const admin = await checkAdmin(req);
    if (!admin) return res.status(401).json({ message: "Unauthorized" });
    
    const { 
      title, 
      totalAmount, 
      advancePaid, 
      status, 
      liveUrl, 
      description,
      startDate,
      deadline
    } = req.body;
    
    if (!title || totalAmount === undefined) {
      return res.status(400).json({ 
        message: "Title and total amount are required" 
      });
    }
    
    const remainingAmount = (totalAmount || 0) - (advancePaid || 0);
    
    const project = await ClientProject.create({
      client: req.params.clientId,
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
    await Client.findByIdAndUpdate(req.params.clientId, {
      $inc: { totalEarnings: Number(totalAmount) },
    });
    
    res.status(201).json(project);
  } catch (err) {
    console.error("Add project error:", err);
    res.status(500).json({ message: "Failed to add project" });
  }
});

/* ================= UPDATE PROJECT ================= */
router.put("/:clientId/projects/:projectId", async (req, res) => {
  try {
    await connectDB();
    const admin = await checkAdmin(req);
    if (!admin) return res.status(401).json({ message: "Unauthorized" });
    
    const oldProject = await ClientProject.findById(req.params.projectId);
    if (!oldProject) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    // Calculate new remaining amount if total or advance changed
    if (req.body.totalAmount !== undefined || req.body.advancePaid !== undefined) {
      const totalAmount = req.body.totalAmount !== undefined 
        ? req.body.totalAmount 
        : oldProject.totalAmount;
      const advancePaid = req.body.advancePaid !== undefined 
        ? req.body.advancePaid 
        : oldProject.advancePaid;
      req.body.remainingAmount = totalAmount - advancePaid;
    }
    
    const project = await ClientProject.findByIdAndUpdate(
      req.params.projectId,
      req.body,
      { new: true }
    );
    
    // Update client total earnings if total amount changed
    if (req.body.totalAmount !== undefined) {
      const difference = req.body.totalAmount - oldProject.totalAmount;
      await Client.findByIdAndUpdate(req.params.clientId, {
        $inc: { totalEarnings: difference },
      });
    }
    
    res.json(project);
  } catch (err) {
    console.error("Update project error:", err);
    res.status(500).json({ message: "Failed to update project" });
  }
});

/* ================= DELETE PROJECT ================= */
router.delete("/:clientId/projects/:projectId", async (req, res) => {
  try {
    await connectDB();
    const admin = await checkAdmin(req);
    if (!admin) return res.status(401).json({ message: "Unauthorized" });
    
    const project = await ClientProject.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    // Delete associated payments
    await Payment.deleteMany({ project: req.params.projectId });
    
    // Update client total earnings
    await Client.findByIdAndUpdate(req.params.clientId, {
      $inc: { totalEarnings: -project.totalAmount },
    });
    
    await ClientProject.findByIdAndDelete(req.params.projectId);
    
    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error("Delete project error:", err);
    res.status(500).json({ message: "Failed to delete project" });
  }
});

/* ================= GET PAYMENTS BY CLIENT ================= */
router.get("/:clientId/payments", async (req, res) => {
  try {
    await connectDB();
    const admin = await checkAdmin(req);
    if (!admin) return res.status(401).json({ message: "Unauthorized" });
    
    const payments = await Payment.find({
      client: req.params.clientId,
    })
    .populate('project', 'title')
    .sort({ paymentDate: -1 });
    
    res.json(payments);
  } catch (err) {
    console.error("Get payments error:", err);
    res.status(500).json([]);
  }
});

/* ================= ADD PAYMENT ================= */
router.post("/:clientId/payments", async (req, res) => {
  try {
    await connectDB();
    const admin = await checkAdmin(req);
    if (!admin) return res.status(401).json({ message: "Unauthorized" });
    
    const { projectId, amount, paymentDate, paymentMethod, notes } = req.body;
    
    if (!projectId || !amount || !paymentDate) {
      return res.status(400).json({ 
        message: "Project, amount, and date are required" 
      });
    }
    
    // Verify project belongs to client
    const project = await ClientProject.findOne({
      _id: projectId,
      client: req.params.clientId
    });
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    const payment = await Payment.create({
      client: req.params.clientId,
      project: projectId,
      amount: Number(amount),
      paymentDate,
      paymentMethod: paymentMethod || "Bank Transfer",
      notes
    });
    
    // Update project remaining amount
    await ClientProject.findByIdAndUpdate(projectId, {
      $inc: { 
        advancePaid: Number(amount),
        remainingAmount: -Number(amount)
      }
    });
    
    res.status(201).json(payment);
  } catch (err) {
    console.error("Add payment error:", err);
    res.status(500).json({ message: "Failed to add payment" });
  }
});

/* ================= DELETE PAYMENT ================= */
router.delete("/:clientId/payments/:paymentId", async (req, res) => {
  try {
    await connectDB();
    const admin = await checkAdmin(req);
    if (!admin) return res.status(401).json({ message: "Unauthorized" });
    
    const payment = await Payment.findById(req.params.paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    
    // Revert project amounts
    await ClientProject.findByIdAndUpdate(payment.project, {
      $inc: { 
        advancePaid: -payment.amount,
        remainingAmount: payment.amount
      }
    });
    
    await Payment.findByIdAndDelete(req.params.paymentId);
    
    res.json({ message: "Payment deleted successfully" });
  } catch (err) {
    console.error("Delete payment error:", err);
    res.status(500).json({ message: "Failed to delete payment" });
  }
});

module.exports = router;
