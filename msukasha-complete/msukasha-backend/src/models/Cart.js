const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Cart",
  new mongoose.Schema(
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
      items: [
        {
          _id: false,
          product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
          qty: { type: Number, min: 1, required: true },
        },
      ],
    },
    { timestamps: true }
  )
);
