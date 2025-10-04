const mongoose = require('mongoose');

const careerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  location: { type: String, required: true },
  type: { type: String, required: true }, // Full-time, Part-time, etc.
  level: { type: String, required: true }, // Junior, Mid, Senior, Lead
  salary: { type: String },
  tags: [{ type: String }],
  description: { type: String, required: true }
});

module.exports = mongoose.model('Career', careerSchema);
