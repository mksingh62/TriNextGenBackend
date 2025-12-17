const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    features: [
      {
        type: String,
      },
    ],

    techStack: [
      {
        type: String,
      },
    ],

    category: {
      type: String,
      enum: ["Web", "Mobile", "Cloud"],
      required: true,
    },

    icon: {
      type: String,
      required: true, // e.g. "Globe", "Smartphone", "Code"
    },

    color: {
      type: String,
      default: "from-green-500 to-emerald-600",
    },

    liveUrl: {
      type: String,
    },

    status: {
      type: String,
      enum: ["Active", "Completed", "Draft"],
      default: "Active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
