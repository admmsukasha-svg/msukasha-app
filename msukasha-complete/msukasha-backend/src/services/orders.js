const crypto = require("crypto");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { ApiError } = require("../utils");
const { unitPriceFor, shippingFor } = require("./pricing");

const orderNumber = () => `MS-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;

async function restock(order) {
  await Promise.all(order.items.map((i) => Product.updateOne({ _id: i.product }, { $inc: { stock: i.qty } })));
}

// Turns the buyer's cart into one order per seller. Stock is reserved atomically.
async function checkout(user, { shippingAddress, paymentMethod, note }) {
  const cart = await Cart.findOne({ user: user._id }).populate("items.product");
  const lines = (cart?.items || []).filter((i) => i.product);
  if (!lines.length) throw new ApiError(400, "Cart is empty");

  for (const { product, qty } of lines) {
    if (product.status !== "active") throw new ApiError(409, `"${product.title}" is no longer available`);
    if (product.seller.equals(user._id)) throw new ApiError(400, "You cannot buy your own product");
    if (qty < product.minOrderQty) throw new ApiError(400, `"${product.title}" requires a minimum order of ${product.minOrderQty}`);
  }

  // Reserve stock atomically, roll back on any failure.
  const reserved = [];
  try {
    for (const { product, qty } of lines) {
      const r = await Product.updateOne({ _id: product._id, stock: { $gte: qty } }, { $inc: { stock: -qty } });
      if (r.modifiedCount !== 1) throw new ApiError(409, `Not enough stock for "${product.title}"`);
      reserved.push({ product: product._id, qty });
    }
  } catch (e) {
    await Promise.all(reserved.map((r) => Product.updateOne({ _id: r.product }, { $inc: { stock: r.qty } })));
    throw e;
  }

  const bySeller = new Map();
  for (const { product, qty } of lines) {
    const k = product.seller.toString();
    if (!bySeller.has(k)) bySeller.set(k, []);
    bySeller.get(k).push({
      product: product._id,
      title: product.title,
      image: product.images?.[0],
      unitPrice: unitPriceFor(product, qty),
      qty,
    });
  }

  try {
    const orders = [];
    for (const [seller, items] of bySeller) {
      const subtotal = items.reduce((s, i) => s + i.unitPrice * i.qty, 0);
      const shippingFee = shippingFor(subtotal);
      orders.push(
        await Order.create({
          orderNumber: orderNumber(),
          buyer: user._id,
          seller,
          items,
          shippingAddress,
          note,
          subtotal,
          shippingFee,
          total: subtotal + shippingFee,
          paymentMethod,
          history: [{ status: "placed" }],
        })
      );
    }
    cart.items = [];
    await cart.save();
    return orders;
  } catch (e) {
    await Promise.all(reserved.map((r) => Product.updateOne({ _id: r.product }, { $inc: { stock: r.qty } })));
    throw e;
  }
}

module.exports = { checkout, restock };
