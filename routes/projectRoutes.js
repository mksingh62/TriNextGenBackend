const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const connectDB = require("../db");

// --------------------------------
// GET all projects
// --------------------------------
router.get("/", async (req, res) => {
  try {
    await connectDB();
    const projects = await Project.find({ status: "Active" }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --------------------------------
// GET single project by ID
// --------------------------------
router.get("/:id", async (req, res) => {
  try {
    await connectDB();
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --------------------------------
// CREATE project (Admin use)
// --------------------------------
router.post("/", async (req, res) => {
  try {
    await connectDB();
    const project = new Project(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// --------------------------------
// UPDATE project
// --------------------------------
router.put("/:id", async (req, res) => {
  try {
    await connectDB();
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// --------------------------------
// DELETE project
// --------------------------------
router.delete("/:id", async (req, res) => {
  try {
    await connectDB();
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: "Project deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
