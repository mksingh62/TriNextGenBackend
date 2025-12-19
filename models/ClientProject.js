// FILE 2: models/ClientProject.js
// =====================================================
const mongoose = require("mongoose");

const ClientProjectSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true
    },
    title: { type: String, required: true },
    status: { type: String, default: "Active" },
    
    // Financial fields
    totalAmount: { type: Number, default: 0 },
    advancePaid: { type: Number, default: 0 },
    remainingAmount: { type: Number, default: 0 },
    
    // Project details
    liveUrl: String,
    description: String,
    startDate: Date,
    deadline: Date
  },
  { timestamps: true }
);

// Calculate remaining amount before saving
ClientProjectSchema.pre('save', function(next) {
  if (this.totalAmount !== undefined && this.advancePaid !== undefined) {
    this.remainingAmount = this.totalAmount - this.advancePaid;
  }
  next();
});

module.exports = mongoose.model("ClientProject", ClientProjectSchema);
