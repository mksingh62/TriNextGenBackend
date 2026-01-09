// FILE: models/Payment.js
// =====================================================
const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClientProject",
      required: false  // ← General payments ke liye optional
    },
    amount: { type: Number, required: true },
    paymentDate: { type: Date, required: true },
    paymentMethod: {
      type: String,
      enum: ["Bank Transfer", "UPI", "Cash", "Cheque", "Card"],
      default: "Bank Transfer"
    },
    notes: String,
    screenshot: {
      type: String,  // ← YEH ADD KARO!!!
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", PaymentSchema);
