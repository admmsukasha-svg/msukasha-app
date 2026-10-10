const router = require("express").Router();
const { z } = require("zod");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { asyncHandler, validate, ApiError } = require("../utils");
const { protect, requireApprovedSeller } = require("../middleware/auth");
const { restock } = require("../services/orders");

router.use(protect, requireApprovedSeller);

const productBase = z.object({
  title: z.string().trim().min(3).max(150),
  description: z.string().max(5000).default(""),
  category: z.string().optional(),
  images: z.array(z.string().url()).max(10).default([]),
  price: z.number().min(0),
  compareAtPrice: z.number().min(0).optional(),
  stock: z.number().int().min(0),
  minOrderQty: z.number().int().min(1).default(1),
  tierPricing: z.array(z.object({ minQty: z.number().int().min(2), price: z.number().min(0) })).max(6).default([]),
  type: z.enum(["b2b", "c2c", "both"]).default("c2c"),
  status: z.enum(["active", "draft", "archived"]).default("active"),
});

router.get("/products", asyncHandler(async (req, res) => {
  res.json({ items: await Product.find({ seller: req.user._id }).sort("-createdAt").lean() });
}));

router.post("/products", validate(productBase), asyncHandler(async (req, res) => {
  const p = await Product.create({ ...req.body, seller: req.user._id });
  res.status(201).json({ product: p });
}));

router.patch("/products/:id", validate(productBase.partial()), asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(404, "Product not found");
  const p = await Product.findOneAndUpdate({ _id: req.params.id, seller: req.user._id }, { $set: req.body }, { new: true, runValidators: true });
  if (!p) throw new ApiError(404, "Product not found");
  res.json({ product: p });
}));

// Soft delete so old orders keep their references.
router.delete("/products/:id", asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(404, "Product not found");
  const p = await Product.findOneAndUpdate({ _id: req.params.id, seller: req.user._id }, { status: "archived" }, { new: true });
  if (!p) throw new ApiError(404, "Product not found");
  res.json({ product: p });
}));

router.get("/orders", asyncHandler(async (req, res) => {
  const filter = { seller: req.user._id, ...(req.query.status ? { status: String(req.query.status) } : {}) };
  res.json({ orders: await Order.find(filter).sort("-createdAt").limit(200).populate("buyer", "name phone").lean() });
}));

const NEXT = { placed: ["confirmed", "cancelled"], confirmed: ["shipped", "cancelled"], shipped: ["delivered"] };

router.patch("/orders/:id/status", validate(z.object({ status: z.enum(["confirmed", "shipped", "delivered", "cancelled"]) })), asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(404, "Order not found");
  const order = await Order.findOne({ _id: req.params.id, seller: req.user._id });
  if (!order) throw new ApiError(404, "Order not found");
  if (!(NEXT[order.status] || []).includes(req.body.status)) throw new ApiError(409, `Cannot move order from ${order.status} to ${req.body.status}`);
  order.status = req.body.status;
  order.history.push({ status: order.status });
  if (order.status === "delivered" && order.paymentMethod === "cod") order.paymentStatus = "paid";
  if (order.status === "cancelled") {
    if (order.paymentStatus === "paid") order.paymentStatus = "refunded";
    await restock(order);
  }
  await order.save();
  res.json({ order });
}));

module.exports = router;
