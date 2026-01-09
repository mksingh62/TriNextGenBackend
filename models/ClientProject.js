// FILE: models/ClientProject.js
// =====================================================

const mongoose = require("mongoose");

// Sub-schema for individual files attached to a requirement
const fileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  data: {
    type: String, // Base64 encoded string
    required: true,
  },
  type: {
    type: String, // MIME type, e.g., image/png, application/pdf
    required: true,
  },
});

// Sub-schema for each requirement
const requirementSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  files: [fileSchema], // Array of attached files (images, PDFs, docs, etc.)
});

const ClientProjectSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["Web App", "Mobile App", "UI/UX Design", "SEO/Marketing", "Maintenance"],
      default: "Web App",
    },
    status: {
      type: String,
      enum: ["Active", "In Progress", "Completed", "On Hold"],
      default: "Active",
    },

    // Financial fields
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    advancePaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    remainingAmount: {
      type: Number,
      default: 0,
    },

    // Project details
    liveUrl: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    startDate: Date,
    deadline: Date,

    // NEW: Requirements array
    requirements: [requirementSchema],
  },
  { timestamps: true }
);

// Pre-save middleware: Recalculate remainingAmount
ClientProjectSchema.pre("save", function (next) {
  this.remainingAmount = this.totalAmount - this.advancePaid;
  next();
});

// Optional: Index for faster queries by client + status
ClientProjectSchema.index({ client: 1, status: 1 });
// Optional: Text index for searching in title/description
ClientProjectSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("ClientProject", ClientProjectSchema);
