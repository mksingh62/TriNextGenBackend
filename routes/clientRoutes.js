const express = require("express");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Client = require("../models/Client");
const connectDB = require("../db");

const router = express.Router();

/* ================= ADMIN AUTH ================= */
const checkAdmin = async (req) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.split(" ")[1];
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
    if (!admin) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const client = await Client.create(req.body);
    res.status(201).json(client);
  } catch (err) {
    console.error("Create client error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/* ================= GET CLIENTS ================= */
router.get("/", async (req, res) => {
  try {
    await connectDB();

    const admin = await checkAdmin(req);
    if (!admin) {
      return res.status(401).json([]);
    }

    const clients = await Client.find().sort({ createdAt: -1 });
    res.json(clients);
  } catch (err) {
    console.error("Get clients error:", err);
    res.status(500).json([]);
  }
});

/* ================= UPDATE CLIENT ================= */
router.put("/:id", async (req, res) => {
  try {
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
  } catch (err) {
    console.error("Update client error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/* ================= DELETE CLIENT ================= */
router.delete("/:id", async (req, res) => {
  try {
    await connectDB();

    const admin = await checkAdmin(req);
    if (!admin) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await Client.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error("Delete client error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
