const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    items: [
      {
        _id: false,
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        title: String,
        image: String,
        unitPrice: Number,
        qty: Number,
      },
    ],
    shippingAddress: {
      fullName: String,
      phone: String,
      line1: String,
      city: String,
      province: String,
      postalCode: String,
    },
    note: String,
    subtotal: Number,
    shippingFee: Number,
    total: Number,
    currency: { type: String, default: "PKR" },
    paymentMethod: { type: String, enum: ["cod", "jazzcash", "easypaisa", "bank_transfer", "card"], required: true },
    paymentStatus: { type: String, enum: ["pending", "awaiting_verification", "paid", "failed", "refunded"], default: "pending" },
    paymentRef: String,
    status: { type: String, enum: ["placed", "confirmed", "shipped", "delivered", "cancelled"], default: "placed", index: true },
    history: [{ _id: false, status: String, at: { type: Date, default: Date.now } }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
