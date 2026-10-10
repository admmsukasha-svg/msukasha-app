const router = require("express").Router();
const { z } = require("zod");
const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { asyncHandler, validate, ApiError } = require("../utils");
const { protect } = require("../middleware/auth");
const { unitPriceFor, shippingFor } = require("../services/pricing");

router.use(protect);

async function view(userId) {
  const cart = await Cart.findOne({ user: userId }).populate("items.product").lean();
  const items = (cart?.items || [])
    .filter((i) => i.product)
    .map(({ product: p, qty }) => {
      const unitPrice = unitPriceFor(p, qty);
      return {
        product: { _id: p._id, title: p.title, image: p.images?.[0], stock: p.stock, minOrderQty: p.minOrderQty, status: p.status, seller: p.seller },
        qty,
        unitPrice,
        lineTotal: unitPrice * qty,
        issue: p.status !== "active" ? "unavailable" : qty > p.stock ? "insufficient_stock" : qty < p.minOrderQty ? "below_min_qty" : undefined,
      };
    });
  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
  return { items, subtotal, estimatedShipping: shippingFor(subtotal) };
}

router.get("/", asyncHandler(async (req, res) => res.json(await view(req.user._id))));

// Set the quantity of a product (adds it if missing). qty 0 removes it.
router.put(
  "/items",
  validate(z.object({ productId: z.string(), qty: z.number().int().min(0).max(100000) })),
  asyncHandler(async (req, res) => {
    const { productId, qty } = req.body;
    if (!mongoose.isValidObjectId(productId)) throw new ApiError(400, "Invalid product");
    const cart = (await Cart.findOne({ user: req.user._id })) || new Cart({ user: req.user._id, items: [] });
    if (qty === 0) {
      cart.items = cart.items.filter((i) => !i.product.equals(productId));
    } else {
      const p = await Product.findOne({ _id: productId, status: "active" });
      if (!p) throw new ApiError(404, "Product not found");
      if (p.seller.equals(req.user._id)) throw new ApiError(400, "You cannot buy your own product");
      if (qty > p.stock) throw new ApiError(409, `Only ${p.stock} in stock`);
      const line = cart.items.find((i) => i.product.equals(productId));
      if (line) line.qty = qty;
      else cart.items.push({ product: productId, qty });
    }
    await cart.save();
    res.json(await view(req.user._id));
  })
);

router.delete("/", asyncHandler(async (req, res) => {
  await Cart.updateOne({ user: req.user._id }, { $set: { items: [] } });
  res.json(await view(req.user._id));
}));

module.exports = router;
