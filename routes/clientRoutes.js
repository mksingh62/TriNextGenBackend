const express = require("express");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Client = require("../models/Client");
const connectDB = require("../lib/db"); // ✅ REQUIRED FOR VERCEL

const router = express.Router();

/* ================= ADMIN AUTH ================= */
const checkAdmin = async (req) => {
  try {
    const authHeader =
      req.headers.authorization || req.headers.Authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET missing");
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.id) return null;

    const admin = await Admin.findById(decoded.id);
    return admin || null;
  } catch (err) {
    console.error("Admin auth failed:", err.message);
    return null;
  }
};

/* ================= CREATE CLIENT ================= */
router.post("/", async (req, res) => {
  await connectDB(); // 🔥 MUST for serverless

  const admin = await checkAdmin(req);
  if (!admin) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const client = await Client.create(req.body);
    res.json(client);
  } catch (err) {
    console.error("Create client error:", err);
    res.status(500).json({ message: "Failed to create client" });
  }
});

/* ================= GET ALL CLIENTS ================= */
router.get("/", async (req, res) => {
  await connectDB();

  const admin = await checkAdmin(req);
  if (!admin) {
    return res.status(401).json([]);
  }

  const clients = await Client.find().sort({ createdAt: -1 });
  res.json(clients);
});

/* ================= UPDATE CLIENT ================= */
router.put("/:id", async (req, res) => {
  await connectDB();

  const admin = await checkAdmin(req);
  if (!admin) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const updated = await Client.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(updated);
});

/* ================= DELETE CLIENT ================= */
router.delete("/:id", async (req, res) => {
  await connectDB();

  const admin = await checkAdmin(req);
  if (!admin) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  await Client.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
