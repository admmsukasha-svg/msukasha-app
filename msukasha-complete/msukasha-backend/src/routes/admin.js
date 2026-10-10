const router = require("express").Router();
const { z } = require("zod");
const mongoose = require("mongoose");
const User = require("../models/User");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { asyncHandler, validate, ApiError } = require("../utils");
const { protect, requireRole } = require("../middleware/auth");

router.use(protect, requireRole("admin"));

router.get("/stats", asyncHandler(async (_req, res) => {
  const [users, sellersPending, products, orders, revenue] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "seller", "seller.status": "pending" }),
    Product.countDocuments({ status: "active" }),
    Order.countDocuments(),
    Order.aggregate([{ $match: { paymentStatus: "paid" } }, { $group: { _id: null, total: { $sum: "$total" } } }]),
  ]);
  res.json({ users, sellersPending, products, orders, paidRevenue: revenue[0]?.total || 0 });
}));

router.get("/sellers", asyncHandler(async (req, res) => {
  const filter = { role: "seller", ...(req.query.status ? { "seller.status": String(req.query.status) } : {}) };
  res.json({ sellers: await User.find(filter).select("-passwordHash").sort("-createdAt").lean() });
}));

router.patch("/sellers/:id", validate(z.object({ status: z.enum(["approved", "rejected", "suspended"]) })), asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(404, "Seller not found");
  const s = await User.findOneAndUpdate({ _id: req.params.id, role: "seller" }, { "seller.status": req.body.status }, { new: true }).select("-passwordHash");
  if (!s) throw new ApiError(404, "Seller not found");
  if (req.body.status === "suspended") await Product.updateMany({ seller: s._id, status: "active" }, { status: "draft" });
  res.json({ seller: s });
}));

router.get("/orders", asyncHandler(async (req, res) => {
  const filter = req.query.paymentStatus ? { paymentStatus: String(req.query.paymentStatus) } : {};
  res.json({ orders: await Order.find(filter).sort("-createdAt").limit(200).lean() });
}));

// Verify a bank transfer (or fix a payment status manually).
router.patch("/orders/:id/payment", validate(z.object({ status: z.enum(["paid", "failed", "refunded"]) })), asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(404, "Order not found");
  const o = await Order.findByIdAndUpdate(req.params.id, { paymentStatus: req.body.status }, { new: true });
  if (!o) throw new ApiError(404, "Order not found");
  res.json({ order: o });
}));

module.exports = router;
