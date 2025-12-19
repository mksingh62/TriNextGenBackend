const mongoose = require("mongoose");

const ClientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: String,
    phone: String,
    address: String,
    status: { type: String, default: "Active" },
    advance: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Client", ClientSchema);
