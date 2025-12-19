const express = require("express");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const ClientProject = require("../models/ClientProject");

const router = express.Router();

const checkAdmin = async (req) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) return null;

    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return await Admin.findById(decoded.id);
  } catch {
    return null;
  }
};


router.get("/:clientId", async (req, res) => {
  const admin = await checkAdmin(req);
  if (!admin) return res.status(401).json({ message: "Unauthorized" });

  const projects = await ClientProject.find({
    client: req.params.clientId
  });

  res.json(projects);
});

module.exports = router;
