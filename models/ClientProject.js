const mongoose = require("mongoose");

const ClientProjectSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },

    title: { type: String, required: true },
    description: String,

    status: {
      type: String,
      enum: ["Active", "Completed", "On Hold"],
      default: "Active",
    },

    earnings: { type: Number, default: 0 },
    liveUrl: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("ClientProject", ClientProjectSchema);
