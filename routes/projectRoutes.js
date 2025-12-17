const express = require("express");
const router = express.Router();
const multer = require("multer");
const Project = require("../models/Project");
const connectDB = require("../db");

// ===============================
// MULTER CONFIG (VERCEL SAFE)
// ===============================
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files allowed"));
  },
});

// --------------------------------
// GET all projects
// --------------------------------
router.get("/", async (req, res) => {
  try {
    await connectDB();
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --------------------------------
// CREATE project
// --------------------------------
router.post("/", upload.single("icon"), async (req, res) => {
  try {
    await connectDB();

    const {
      title,
      description,
      category,
      liveUrl,
      status = "Active",
    } = req.body;

    // ✅ REQUIRED VALIDATION
    if (!title || !description || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ ENUM SAFE
    const allowedCategories = ["Web", "Mobile", "Cloud"];
    if (!allowedCategories.includes(category)) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const project = new Project({
      title,
      description,
      category,
      liveUrl,
      status,
      features: safeParseArray(req.body.features),
      techStack: safeParseArray(req.body.techStack),
      icon: req.file
        ? `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`
        : null,
    });

    await project.save();
    res.status(201).json(project);
  } catch (err) {
    console.error("CREATE PROJECT ERROR:", err);
    res.status(400).json({ message: err.message });
  }
});

// --------------------------------
// UPDATE project
// --------------------------------
router.put("/:id", upload.single("icon"), async (req, res) => {
  try {
    await connectDB();

    const updateData = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      liveUrl: req.body.liveUrl,
      status: req.body.status,
      features: safeParseArray(req.body.features),
      techStack: safeParseArray(req.body.techStack),
    };

    if (req.file) {
      updateData.icon = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json(project);
  } catch (err) {
    res.status(400).json({ message: err.message });
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
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ===============================
// SAFE JSON ARRAY PARSER
// ===============================
function safeParseArray(value) {
  try {
    if (!value) return [];
    return Array.isArray(value) ? value : JSON.parse(value);
  } catch {
    return [];
  }
}

module.exports = router;
