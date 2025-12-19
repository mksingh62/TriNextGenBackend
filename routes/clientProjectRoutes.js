const express = require("express");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const ClientProject = require("../models/ClientProject");
const Client = require("../models/Client");

const router = express.Router();

/* -------- INLINE ADMIN AUTH -------- */
const checkAdmin = async (req) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return await Admin.findById(decoded.id);
  } catch {
    return null;
  }
};

/* -------- CREATE CLIENT PROJECT -------- */
router.post("/", async (req, res) => {
  const admin = await checkAdmin(req);
  if (!admin) return res.status(401).json({ message: "Unauthorized" });

  const project = await ClientProject.create(req.body);

  // update client earnings
  await Client.findByIdAndUpdate(project.client, {
    $inc: { totalEarnings: project.earnings },
  });

  res.json(project);
});

/* -------- GET PROJECTS BY CLIENT -------- */
router.get("/:clientId", async (req, res) => {
  const admin = await checkAdmin(req);
  if (!admin) return res.status(401).json({ message: "Unauthorized" });

  const projects = await ClientProject.find({
    client: req.params.clientId,
  }).sort({ createdAt: -1 });

  res.json(projects);
});

module.exports = router;
