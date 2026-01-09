// FILE: models/ClientProject.js
// =====================================================

const mongoose = require("mongoose");

// Sub-schema for project-level files (attachments)
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
    type: String, // MIME type, e.g., image/jpeg, application/pdf
    required: true,
  },
});

// Sub-schema for each requirement (NO files attached to individual requirements)
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

    // Requirements (text only)
    requirements: [requirementSchema],

    // NEW: Project-level attachments
    projectFiles: [fileSchema],
  },
  { timestamps: true }
);

// Pre-save middleware: Recalculate remainingAmount
ClientProjectSchema.pre("save", function (next) {
  this.remainingAmount = this.totalAmount - this.advancePaid;
  next();
});

// Indexes
ClientProjectSchema.index({ client: 1, status: 1 });
ClientProjectSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("ClientProject", ClientProjectSchema);
