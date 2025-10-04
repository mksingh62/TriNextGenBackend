const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  features: [{ type: String }],
  icon: { type: String, required: true }, // icon name (e.g. "Code", "Cloud")
  color: { type: String, default: "from-blue-500 to-purple-600" }
});

module.exports = mongoose.model("Service", serviceSchema);