const express = require("express");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Client = require("../models/Client");
const ClientProject = require("../models/ClientProject");

const router = express.Router();

/* -------- INLINE ADMIN AUTH -------- */
const checkAdmin = async (req) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔥 FIX: use email instead of id
    return await Admin.findOne({ email: decoded.email });
  } catch (err) {
    return null;
  }
};

/* -------- CREATE CLIENT -------- */
router.post("/", async (req, res) => {
  const admin = await checkAdmin(req, res);
  if (!admin) return res.status(401).json([]);

  const client = await Client.create(req.body);
  res.json(client);
});

/* -------- GET ALL CLIENTS -------- */
router.get("/", async (req, res) => {
  const admin = await checkAdmin(req, res);
  if (!admin) return res.status(401).json([]);

  const clients = await Client.find().sort({ createdAt: -1 });

  const result = await Promise.all(
    clients.map(async (c) => {
      const projectsCount = await ClientProject.countDocuments({
        client: c._id,
      });

      return { ...c.toObject(), projectsCount };
    })
  );

  res.json(result);
});

/* -------- GET SINGLE CLIENT -------- */
router.get("/:id", async (req, res) => {
  const admin = await checkAdmin(req, res);
  if (!admin) return res.status(401).json([]);

  const client = await Client.findById(req.params.id);
  if (!client) return res.status(404).json({ message: "Client not found" });

  res.json(client);
});

/* -------- UPDATE CLIENT -------- */
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

/* -------- DELETE CLIENT -------- */
router.delete("/:id", async (req, res) => {
  const admin = await checkAdmin(req);
  if (!admin) return res.status(401).json({ message: "Unauthorized" });

  await Client.findByIdAndDelete(req.params.id);

  res.json({ success: true });
});


module.exports = router;
