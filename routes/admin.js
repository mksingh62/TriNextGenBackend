const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Contact = require("../models/Contact");
const connectDB = require("../db");

// 🔐 JWT Middleware
const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded.admin;
    next();
  } catch {
    res.status(401).json({ msg: "Invalid token" });
  }
};

// 🧾 Register Admin
router.post("/register", async (req, res) => {
  try {
    await connectDB();

    const { username, email, password } = req.body;

    let admin = await Admin.findOne({ $or: [{ username }, { email }] });
    if (admin) {
      return res.status(400).json({ msg: "Admin already exists" });
    }

    admin = new Admin({ username, email, password });

    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(password, salt);

    await admin.save();
    res.status(201).json({ msg: "Admin registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔑 Login Admin
router.post("/login", async (req, res) => {
  try {
    await connectDB();

    const { email, password } = req.body;

    const admin = await Admin.findOne({
      $or: [
        { email: new RegExp("^" + email + "$", "i") },
        { username: new RegExp("^" + email + "$", "i") },
      ],
    });

    if (!admin) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const payload = { admin: { id: admin.id } };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => res.json({ token })
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📬 Get Contacts
router.get("/contacts", authMiddleware, async (req, res) => {
  try {
    await connectDB();
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
