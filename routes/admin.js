const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// @route  POST api/admin/register
// @desc   Register a new admin
// @access Public (should be protected in a real app)
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if admin already exists
    let admin = await Admin.findOne({ $or: [{ username }, { email }] });
    if (admin) {
      return res.status(400).json({ msg: 'Admin with this username or email already exists' });
    }

    // Create new admin instance
    admin = new Admin({
      username,
      email,
      password,
    });

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

// @route  POST api/admin/login
// @desc   Authenticate admin & get token
// @access Public


router.post('/login', async (req, res) => {
  // Front-end sends a single field, which we check against both username and email
  const { username, email, password } = req.body;
  const identifier = username || email;

  try {
    // Check if admin exists by username or email
    const admin = await Admin.findOne({
      $or: [
        { username: identifier },
        { email: new RegExp('^' + identifier + '$', 'i') }
      ]
    });

    if (!admin) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Create and sign JWT
    const payload = {
      admin: {
        id: admin.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your_default_secret', // Use an environment variable for your secret
      { expiresIn: 3600 }, // Token expires in 1 hour
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

module.exports = router;
