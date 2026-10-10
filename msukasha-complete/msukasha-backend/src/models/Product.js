const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", index: true },
    images: [String],
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    // B2B: minimum order quantity and wholesale price tiers
    minOrderQty: { type: Number, min: 1, default: 1 },
    tierPricing: [{ _id: false, minQty: { type: Number, min: 2, required: true }, price: { type: Number, min: 0, required: true } }],
    // b2b = wholesale, c2c = retail/individual, both = shown in both marketplaces
    type: { type: String, enum: ["b2b", "c2c", "both"], default: "c2c", index: true },
    status: { type: String, enum: ["active", "draft", "archived"], default: "active", index: true },
  },
  { timestamps: true }
);
productSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Product", productSchema);
