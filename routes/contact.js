const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// @route  POST api/contact
// @desc   Save contact form data
// @access Public
router.post('/', async (req, res) => {
  const { name, email, company, subject, message } = req.body;

  try {
    const newContact = new Contact({
      name,
      email,
      company,
      subject,
      message,
    });

    const contact = await newContact.save();
    res.json(contact);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
