const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  coverLetter: { type: String, required: true },
  resume: { type: String }, // URL to uploaded resume
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Career', required: true },
  jobTitle: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'reviewed', 'interview', 'rejected', 'hired'], 
    default: 'pending' 
  },
  appliedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Application', applicationSchema);