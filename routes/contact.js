const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");
const connectDB = require("../db");

router.post("/", async (req, res) => {
  try {
    await connectDB();
    const contact = new Contact(req.body);
    await contact.save();
    res.json(contact);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
