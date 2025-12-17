const express = require("express");
const router = express.Router();
const Service = require("../models/service");
const connectDB = require("../db");

router.get("/", async (req, res) => {
  try {
    await connectDB();
    const services = await Service.find();
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    await connectDB();
    const service = new Service(req.body);
    await service.save();
    res.status(201).json(service);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
