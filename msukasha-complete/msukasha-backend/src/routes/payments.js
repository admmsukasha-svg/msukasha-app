const router = require("express").Router();
const { z } = require("zod");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const { asyncHandler, validate, ApiError } = require("../utils");
const { protect } = require("../middleware/auth");
const jazzcash = require("../services/jazzcash");

router.get("/methods", (_req, res) => {
  res.json({
    methods: [
      { id: "cod", label: "Cash on Delivery", enabled: true },
      { id: "bank_transfer", label: "Bank Transfer", enabled: true, instructions: {
          bank: process.env.BANK_NAME || null,
          accountTitle: process.env.BANK_ACCOUNT_TITLE || null,
          accountNumber: process.env.BANK_ACCOUNT_NUMBER || null,
          iban: process.env.BANK_IBAN || null } },
      { id: "jazzcash", label: "JazzCash", enabled: jazzcash.configured() },
      { id: "easypaisa", label: "EasyPaisa", enabled: false },
      { id: "card", label: "Credit / Debit Card", enabled: false },
    ],
  });
});

async function ownOrder(req, method) {
  if (!mongoose.isValidObjectId(req.params.orderId)) throw new ApiError(404, "Order not found");
  const order = await Order.findOne({ _id: req.params.orderId, buyer: req.user._id });
  if (!order) throw new ApiError(404, "Order not found");
  if (order.paymentMethod !== method) throw new ApiError(400, `This order uses ${order.paymentMethod}`);
  if (["paid", "refunded"].includes(order.paymentStatus) || order.status === "cancelled") throw new ApiError(409, "Order is not payable");
  return order;
}

// Buyer submits their transfer reference; an admin verifies it.
router.post("/:orderId/bank-transfer", protect, validate(z.object({ reference: z.string().trim().min(4).max(80) })), asyncHandler(async (req, res) => {
  const order = await ownOrder(req, "bank_transfer");
  order.paymentRef = req.body.reference;
  order.paymentStatus = "awaiting_verification";
  await order.save();
  res.json({ order });
}));

// Returns a payload for the app to POST to JazzCash in a WebView.
router.post("/:orderId/jazzcash", protect, asyncHandler(async (req, res) => {
  if (!jazzcash.configured()) throw new ApiError(501, "JazzCash is not configured yet");
  const order = await ownOrder(req, "jazzcash");
  const payload = jazzcash.buildPayload(order);
  order.paymentRef = payload.txnRef;
  await order.save();
  res.json(payload);
}));

// JazzCash redirects the buyer's browser here with form-encoded fields.
router.post("/jazzcash/callback", asyncHandler(async (req, res) => {
  const b = req.body || {};
  if (!jazzcash.configured() || !jazzcash.verifyCallback(b)) return res.status(400).send("Invalid signature");
  const order = mongoose.isValidObjectId(b.ppmpf_1) ? await Order.findById(b.ppmpf_1) : null;
  if (!order) return res.status(404).send("Order not found");
  if (String(Math.round(order.total * 100)) !== String(b.pp_Amount)) return res.status(400).send("Amount mismatch");
  if (order.paymentStatus !== "paid") {
    order.paymentStatus = b.pp_ResponseCode === "000" ? "paid" : "failed";
    order.paymentRef = b.pp_RetreivalReferenceNo || b.pp_TxnRefNo || order.paymentRef;
    await order.save();
  }
  const ok = order.paymentStatus === "paid";
  res.type("html").send(`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><body style="font-family:sans-serif;text-align:center;padding:48px"><h2>${ok ? "Payment successful" : "Payment failed"}</h2><p>Order ${order.orderNumber}</p><p>You can close this window and return to the app.</p></body>`);
}));

// EasyPaisa / card: hooks intentionally not implemented until merchant credentials exist.
router.post("/:orderId/:method(easypaisa|card)", protect, (_req, _res, next) =>
  next(new ApiError(501, "This payment method is not enabled yet")));

module.exports = router;
