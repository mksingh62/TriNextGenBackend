const express = require("express");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Client = require("../models/Client");
const ClientProject = require("../models/ClientProject");
const connectDB = require("../db");

const router = express.Router();

/* ================= ADMIN AUTH ================= */
const checkAdmin = async (req) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) return null;

    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ ADMIN TOKEN PAYLOAD
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

    // 🔥 project count per client
    const data = await Promise.all(
      clients.map(async (c) => {
        const count = await ClientProject.countDocuments({
          client: c._id,
        });
        return { ...c.toObject(), projectsCount: count };
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
    if (!admin)
      return res.status(401).json({ message: "Unauthorized" });

    const client = await Client.findById(req.params.clientId);
    if (!client)
      return res.status(404).json({ message: "Client not found" });

    res.json(client);
  } catch (err) {
    console.error("Get client error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= ADD PROJECT TO CLIENT ================= */
router.post("/:clientId/projects", async (req, res) => {
  try {
    await connectDB();

    const admin = await checkAdmin(req);
    if (!admin)
      return res.status(401).json({ message: "Unauthorized" });

    const project = await ClientProject.create({
      ...req.body,
      client: req.params.clientId,
    });

    // 🔥 update client earnings
    await Client.findByIdAndUpdate(req.params.clientId, {
      $inc: { totalEarnings: project.earnings || 0 },
    });

    res.status(201).json(project);
  } catch (err) {
    console.error("Add project error:", err);
    res.status(500).json({ message: "Failed to add project" });
  }
});

/* ================= GET PROJECTS BY CLIENT ================= */
router.get("/:clientId/projects", async (req, res) => {
  try {
    await connectDB();

    const admin = await checkAdmin(req);
    if (!admin)
      return res.status(401).json({ message: "Unauthorized" });

    const projects = await ClientProject.find({
      client: req.params.clientId,
    }).sort({ createdAt: -1 });

    res.json(projects);
  } catch (err) {
    console.error("Get projects error:", err);
    res.status(500).json([]);
  }
});

module.exports = router;
