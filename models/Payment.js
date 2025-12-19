// FILE 3: models/Payment.js (NEW MODEL)
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
      required: true
    },
    amount: { type: Number, required: true },
    paymentDate: { type: Date, required: true },
    paymentMethod: { 
      type: String, 
      enum: ["Bank Transfer", "UPI", "Cash", "Cheque", "PayPal"],
      default: "Bank Transfer" 
    },
    notes: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", PaymentSchema);
