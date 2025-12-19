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

    if (!decoded?.admin?.id) return null;

    return await Admin.findById(decoded.admin.id);
  } catch (err) {
    console.error("Admin auth failed:", err.message);
    return null;
  }
};

/* ================= GET PROJECTS BY CLIENT ================= */
router.get("/:clientId/projects", async (req, res) => {
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

/* ================= ADD PROJECT TO CLIENT ================= */
router.post("/:clientId/projects", async (req, res) => {
  try {
    await connectDB();

    const admin = await checkAdmin(req);
    if (!admin) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { title, earnings, status, liveUrl } = req.body;

    if (!title || earnings === undefined) {
      return res
        .status(400)
        .json({ message: "Title and earnings are required" });
    }

    const project = await ClientProject.create({
      client: req.params.clientId,
      title,
      earnings,
      status: status || "Active",
      liveUrl,
    });

    // 🔥 AUTO UPDATE CLIENT TOTAL EARNINGS
    await Client.findByIdAndUpdate(req.params.clientId, {
      $inc: { totalEarnings: Number(earnings) },
    });

    res.status(201).json(project);
  } catch (err) {
    console.error("Add project error:", err);
    res.status(500).json({ message: "Failed to add project" });
  }
});

module.exports = router;
