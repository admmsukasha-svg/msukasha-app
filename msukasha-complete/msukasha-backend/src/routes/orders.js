const router = require("express").Router();
const { z } = require("zod");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const { asyncHandler, validate, ApiError } = require("../utils");
const { protect } = require("../middleware/auth");
const { checkout, restock } = require("../services/orders");

router.use(protect);

const checkoutSchema = z.object({
  shippingAddress: z.object({
    fullName: z.string().trim().min(2).max(80),
    phone: z.string().trim().regex(/^[+0-9\s-]{7,16}$/, "Invalid phone number"),
    line1: z.string().trim().min(3).max(200),
    city: z.string().trim().min(2).max(60),
    province: z.string().max(60).optional(),
    postalCode: z.string().max(12).optional(),
  }),
  paymentMethod: z.enum(["cod", "jazzcash", "easypaisa", "bank_transfer", "card"]),
  note: z.string().max(300).optional(),
});

// Creates one order per seller found in the cart.
router.post("/checkout", validate(checkoutSchema), asyncHandler(async (req, res) => {
  const orders = await checkout(req.user, req.body);
  res.status(201).json({ orders });
}));

router.get("/", asyncHandler(async (req, res) => {
  const orders = await Order.find({ buyer: req.user._id }).sort("-createdAt").limit(100).lean();
  res.json({ orders });
}));

router.get("/:id", asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(404, "Order not found");
  const order = await Order.findOne({ _id: req.params.id, buyer: req.user._id }).populate("seller", "seller.storeName").lean();
  if (!order) throw new ApiError(404, "Order not found");
  res.json({ order });
}));

router.post("/:id/cancel", asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(404, "Order not found");
  const order = await Order.findOne({ _id: req.params.id, buyer: req.user._id });
  if (!order) throw new ApiError(404, "Order not found");
  if (!["placed", "confirmed"].includes(order.status)) throw new ApiError(409, "This order can no longer be cancelled");
  order.status = "cancelled";
  order.history.push({ status: "cancelled" });
  if (order.paymentStatus === "paid") order.paymentStatus = "refunded";
  await order.save();
  await restock(order);
  res.json({ order });
}));

module.exports = router;
