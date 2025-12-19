const express = require("express");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Client = require("../models/Client");
const ClientProject = require("../models/ClientProject");

const router = express.Router();

/* ---------- ADMIN AUTH ---------- */
const checkAdmin = async (req) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) return null;

    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return await Admin.findOne({ email: decoded.email });
  } catch {
    return null;
  }
};

/* ---------- CREATE CLIENT ---------- */
router.post("/", async (req, res) => {
  const admin = await checkAdmin(req);
  if (!admin) return res.status(401).json({ message: "Unauthorized" });

  const client = await Client.create(req.body);
  res.status(201).json(client);
});

/* ---------- GET ALL CLIENTS ---------- */
router.get("/", async (req, res) => {
  const admin = await checkAdmin(req);
  if (!admin) return res.json([]);

  const clients = await Client.find().sort({ createdAt: -1 });

  const data = await Promise.all(
    clients.map(async (c) => {
      const projectsCount = await ClientProject.countDocuments({
        client: c._id
      });
      return { ...c.toObject(), projectsCount };
    })
  );

  res.json(data);
});

/* ---------- GET CLIENT ---------- */
router.get("/:id", async (req, res) => {
  const admin = await checkAdmin(req);
  if (!admin) return res.status(401).json({ message: "Unauthorized" });

  const client = await Client.findById(req.params.id);
  res.json(client);
});

/* ---------- UPDATE CLIENT ---------- */
router.put("/:id", async (req, res) => {
  const admin = await checkAdmin(req);
  if (!admin) return res.status(401).json({ message: "Unauthorized" });

  const client = await Client.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(client);
});

/* ---------- DELETE CLIENT ---------- */
router.delete("/:id", async (req, res) => {
  const admin = await checkAdmin(req);
  if (!admin) return res.status(401).json({ message: "Unauthorized" });

  await Client.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
