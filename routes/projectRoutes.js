const express = require("express");
const router = express.Router();
const multer = require("multer");
const Project = require("../models/Project");
const connectDB = require("../db");

// ===============================
// MULTER CONFIG (NO EXTRA FOLDER)
// ===============================
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files allowed"), false);
    }
  },
});

// --------------------------------
// GET all projects (Public)
// --------------------------------
router.get("/", async (req, res) => {
  try {
    await connectDB();
    const projects = await Project.find({ status: "Active" }).sort({
      createdAt: -1,
    });
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
// CREATE project (WITH ICON IMAGE)
// --------------------------------
router.post("/", upload.single("icon"), async (req, res) => {
  try {
    await connectDB();

    if (!req.file) {
      return res.status(400).json({ message: "Icon image is required" });
    }

    const project = new Project({
      title: req.body.title,
      description: req.body.description,
      features: JSON.parse(req.body.features || "[]"),
      techStack: JSON.parse(req.body.techStack || "[]"),
      category: req.body.category,
      liveUrl: req.body.liveUrl,
      status: req.body.status || "Active",

      // 🔥 IMAGE STORED AS BASE64
      icon: `data:${req.file.mimetype};base64,${req.file.buffer.toString(
        "base64"
      )}`,
    });

    await project.save();
    res.status(201).json(project);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

// --------------------------------
// UPDATE project (icon optional)
// --------------------------------
router.put("/:id", upload.single("icon"), async (req, res) => {
  try {
    await connectDB();

    const updateData = {
      title: req.body.title,
      description: req.body.description,
      features: JSON.parse(req.body.features || "[]"),
      techStack: JSON.parse(req.body.techStack || "[]"),
      category: req.body.category,
      liveUrl: req.body.liveUrl,
      status: req.body.status,
    };

    // Agar naya icon upload hua hai
    if (req.file) {
      updateData.icon = `data:${req.file.mimetype};base64,${req.file.buffer.toString(
        "base64"
      )}`;
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

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
