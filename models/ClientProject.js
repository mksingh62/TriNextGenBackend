const mongoose = require("mongoose");

const ClientProjectSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true
    },
    title: String,
    status: String,
    earnings: { type: Number, default: 0 },
    liveUrl: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("ClientProject", ClientProjectSchema);
