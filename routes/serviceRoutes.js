const express = require("express");
const router = express.Router();
const Service = require("../models/service.js");

// @route  GET api/services
// @desc   Get all services
// @access Public
router.get("/", async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route  POST api/services
// @desc   Add a new service
// @access Public
router.post("/", async (req, res) => {
  try {
    const newService = new Service(req.body);
    await newService.save();
    res.status(201).json(newService);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;