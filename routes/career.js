const express = require("express");
const router = express.Router();
const Career = require("../models/Career");
const Application = require("../models/Application");
const connectDB = require("../db");

// Get all careers
router.get("/", async (req, res) => {
  try {
    await connectDB();
    const careers = await Career.find();
    res.json(careers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create career
router.post("/", async (req, res) => {
  try {
    await connectDB();
    const career = new Career(req.body);
    await career.save();
    res.status(201).json(career);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update career
router.put("/:id", async (req, res) => {
  try {
    await connectDB();
    const career = await Career.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(career);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete career
router.delete("/:id", async (req, res) => {
  try {
    await connectDB();
    await Career.findByIdAndDelete(req.params.id);
    res.json({ message: "Career deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Apply job
router.post("/apply", async (req, res) => {
  try {
    await connectDB();

    const job = await Career.findById(req.body.jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const application = new Application({
      ...req.body,
      jobTitle: job.title,
    });

    await application.save();
    res.status(201).json({ message: "Application submitted", application });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get applications
router.get("/applications", async (req, res) => {
  try {
    await connectDB();
    const apps = await Application.find().sort({ createdAt: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update application status
router.put("/applications/:id", async (req, res) => {
  try {
    await connectDB();
    const app = await Application.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(app);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
