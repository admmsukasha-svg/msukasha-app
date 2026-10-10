const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Category",
  new mongoose.Schema(
    {
      name: { type: String, required: true, trim: true },
      slug: { type: String, required: true, unique: true },
      parent: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
    },
    { timestamps: true }
  )
);
