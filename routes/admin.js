const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Contact = require('../models/Contact'); // <-- make sure this model exists

// -----------------------------
// 🔐 Middleware to verify JWT
// -----------------------------
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_default_secret');
    req.admin = decoded.admin;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// -----------------------------
// 🧾 Register Admin
// -----------------------------
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if admin already exists
    let admin = await Admin.findOne({ $or: [{ username }, { email }] });
    if (admin) {
      return res.status(400).json({ msg: 'Admin with this username or email already exists' });
    }

    // Create new admin instance
    admin = new Admin({ username, email, password });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(password, salt);

    // Save admin to DB
    await admin.save();

    res.status(201).json({ msg: 'Admin registered successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// -----------------------------
// 🔑 Login Admin (email + password)
// -----------------------------
router.post('/login', async (req, res) => {
  const { email, password } = req.body; // frontend sends email + password

  try {
    // Find admin by email or username
    const admin = await Admin.findOne({
      $or: [
        { email: new RegExp('^' + email + '$', 'i') },
        { username: new RegExp('^' + email + '$', 'i') }
      ]
    });

    if (!admin) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Create JWT payload
    const payload = { admin: { id: admin.id } };

    // Sign and return token
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your_default_secret',
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// -----------------------------
// 📬 Get All Contacts (Protected)
// -----------------------------
router.get('/contacts', authMiddleware, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ date: -1 });
    res.json(contacts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
