const express = require("express");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
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

    // ✅ CORRECT PAYLOAD
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
    console.error("Client projects error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
