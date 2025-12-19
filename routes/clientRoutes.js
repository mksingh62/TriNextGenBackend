const express = require("express");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Client = require("../models/Client");

const router = express.Router();

/* ================= ADMIN AUTH ================= */
const checkAdmin = async (req) => {
  try {
    const authHeader =
      req.headers.authorization || req.headers.Authorization;

    if (!authHeader) return null;
    if (!authHeader.startsWith("Bearer ")) return null;

    const token = authHeader.replace("Bearer ", "").trim();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ token payload me id hai
    const admin = await Admin.findById(decoded.id);
    return admin || null;
  } catch (err) {
    console.error("Admin auth failed:", err.message);
    return null;
  }
};

/* ================= CREATE CLIENT ================= */
router.post("/", async (req, res) => {
  const admin = await checkAdmin(req);
  if (!admin) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const client = await Client.create(req.body);
    res.json(client);
  } catch (err) {
    res.status(500).json({ message: "Failed to create client" });
  }
});

/* ================= GET ALL CLIENTS ================= */
router.get("/", async (req, res) => {
  const admin = await checkAdmin(req);
  if (!admin) {
    return res.status(401).json([]);
  }

  const clients = await Client.find().sort({ createdAt: -1 });
  res.json(clients);
});

/* ================= UPDATE CLIENT ================= */
router.put("/:id", async (req, res) => {
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
  const admin = await checkAdmin(req);
  if (!admin) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  await Client.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
const express = require("express");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Client = require("../models/Client");

const router = express.Router();

/* ================= ADMIN AUTH ================= */
const checkAdmin = async (req) => {
  try {
    const authHeader =
      req.headers.authorization || req.headers.Authorization;

    if (!authHeader) return null;
    if (!authHeader.startsWith("Bearer ")) return null;

    const token = authHeader.replace("Bearer ", "").trim();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ token payload me id hai
    const admin = await Admin.findById(decoded.id);
    return admin || null;
  } catch (err) {
    console.error("Admin auth failed:", err.message);
    return null;
  }
};

/* ================= CREATE CLIENT ================= */
router.post("/", async (req, res) => {
  const admin = await checkAdmin(req);
  if (!admin) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const client = await Client.create(req.body);
    res.json(client);
  } catch (err) {
    res.status(500).json({ message: "Failed to create client" });
  }
});

/* ================= GET ALL CLIENTS ================= */
router.get("/", async (req, res) => {
  const admin = await checkAdmin(req);
  if (!admin) {
    return res.status(401).json([]);
  }

  const clients = await Client.find().sort({ createdAt: -1 });
  res.json(clients);
});

/* ================= UPDATE CLIENT ================= */
router.put("/:id", async (req, res) => {
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
  const admin = await checkAdmin(req);
  if (!admin) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  await Client.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
const express = require("express");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Client = require("../models/Client");

const router = express.Router();

/* ================= ADMIN AUTH ================= */
const checkAdmin = async (req) => {
  try {
    const authHeader =
      req.headers.authorization || req.headers.Authorization;

    if (!authHeader) return null;
    if (!authHeader.startsWith("Bearer ")) return null;

    const token = authHeader.replace("Bearer ", "").trim();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ token payload me id hai
    const admin = await Admin.findById(decoded.id);
    return admin || null;
  } catch (err) {
    console.error("Admin auth failed:", err.message);
    return null;
  }
};

/* ================= CREATE CLIENT ================= */
router.post("/", async (req, res) => {
  const admin = await checkAdmin(req);
  if (!admin) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const client = await Client.create(req.body);
    res.json(client);
  } catch (err) {
    res.status(500).json({ message: "Failed to create client" });
  }
});

/* ================= GET ALL CLIENTS ================= */
router.get("/", async (req, res) => {
  const admin = await checkAdmin(req);
  if (!admin) {
    return res.status(401).json([]);
  }

  const clients = await Client.find().sort({ createdAt: -1 });
  res.json(clients);
});

/* ================= UPDATE CLIENT ================= */
router.put("/:id", async (req, res) => {
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
  const admin = await checkAdmin(req);
  if (!admin) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  await Client.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
