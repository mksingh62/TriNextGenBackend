const express = require('express');
const router = express.Router();
const Career = require('../models/Career');
const Application = require('../models/Application');

// Get all careers
router.get('/', async (req, res) => {
  try {
    const careers = await Career.find();
    res.json(careers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new career
router.post('/', async (req, res) => {
  try {
    const newCareer = new Career(req.body);
    await newCareer.save();
    res.status(201).json(newCareer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a career
router.put('/:id', async (req, res) => {
  try {
    const updatedCareer = await Career.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedCareer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a career
router.delete('/:id', async (req, res) => {
  try {
    await Career.findByIdAndDelete(req.params.id);
    res.json({ message: 'Career deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Apply for a job
router.post('/apply', async (req, res) => {
  try {
    const { name, email, phone, coverLetter, resume, jobId, jobTitle } = req.body;
    
    // Check if job exists
    const job = await Career.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    const application = new Application({
      name,
      email,
      phone,
      coverLetter,
      resume,
      jobId,
      jobTitle: job.title
    });
    
    await application.save();
    res.status(201).json({ message: 'Application submitted successfully', application });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all applications
router.get('/applications', async (req, res) => {
  try {
    const applications = await Application.find().sort({ appliedAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update application status
router.put('/applications/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Application.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    );
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    res.json(application);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;