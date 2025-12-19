const express = require("express");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Client = require("../models/Client");
const ClientProject = require("../models/ClientProject");
const connectDB = require("../db");

const router = express.Router();

/* ========== ADMIN AUTH ========== */
const checkAdmin = async (req) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) return null;

    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.admin?.id) return null;
    return await Admin.findById(decoded.admin.id);
  } catch {
    return null;
  }
};

/* ========== CLIENT CRUD ========== */

// CREATE
router.post("/", async (req, res) => {
  await connectDB();
  const admin = await checkAdmin(req);
  if (!admin) return res.status(401).json({ message: "Unauthorized" });

  const client = await Client.create(req.body);
  res.json(client);
});

// GET ALL
router.get("/", async (req, res) => {
  await connectDB();
  const admin = await checkAdmin(req);
  if (!admin) return res.status(401).json([]);

  const clients = await Client.find().sort({ createdAt: -1 });
  res.json(clients);
});

// GET ONE
router.get("/:id", async (req, res) => {
  await connectDB();
  const admin = await checkAdmin(req);
  if (!admin) return res.status(401).json({});

  const client = await Client.findById(req.params.id);
  if (!client) return res.status(404).json({ message: "Not found" });

  res.json(client);
});

// UPDATE
router.put("/:id", async (req, res) => {
  await connectDB();
  const admin = await checkAdmin(req);
  if (!admin) return res.status(401).json({});

  const updated = await Client.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(updated);
});

// DELETE
router.delete("/:id", async (req, res) => {
  await connectDB();
  const admin = await checkAdmin(req);
  if (!admin) return res.status(401).json({});

  await Client.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

/* ========== CLIENT PROJECTS ========== */

// GET PROJECTS OF CLIENT
router.get("/:clientId/projects", async (req, res) => {
  await connectDB();
  const admin = await checkAdmin(req);
  if (!admin) return res.status(401).json({ message: "Unauthorized" });

  const projects = await ClientProject.find({
    client: req.params.clientId,
  }).sort({ createdAt: -1 });

  res.json(projects);
});

module.exports = router;
