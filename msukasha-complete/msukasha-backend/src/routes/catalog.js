const router = require("express").Router();
const { z } = require("zod");
const mongoose = require("mongoose");
const Category = require("../models/Category");
const Product = require("../models/Product");
const { asyncHandler, validate, ApiError, slugify } = require("../utils");
const { protect, requireRole } = require("../middleware/auth");

router.get("/categories", asyncHandler(async (_req, res) => {
  res.json({ categories: await Category.find().sort("name").lean() });
}));

router.post(
  "/categories",
  protect,
  requireRole("admin"),
  validate(z.object({ name: z.string().trim().min(2).max(60), parent: z.string().optional() })),
  asyncHandler(async (req, res) => {
    const c = await Category.create({ name: req.body.name, slug: slugify(req.body.name), parent: req.body.parent || null });
    res.status(201).json({ category: c });
  })
);

const listQuery = z.object({
  q: z.string().trim().max(100).optional(),
  category: z.string().optional(),
  type: z.enum(["b2b", "c2c"]).optional(),
  seller: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sort: z.enum(["newest", "price_asc", "price_desc"]).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

router.get(
  "/products",
  validate(listQuery, "query"),
  asyncHandler(async (req, res) => {
    const { q, category, type, seller, minPrice, maxPrice, sort, page, limit } = req.validQuery;
    const isId = (v) => mongoose.isValidObjectId(v);
    const filter = { status: "active" };
    if (q) filter.$text = { $search: q };
    if (category) { if (!isId(category)) throw new ApiError(400, "Invalid category"); filter.category = category; }
    if (seller) { if (!isId(seller)) throw new ApiError(400, "Invalid seller"); filter.seller = seller; }
    if (type) filter.type = { $in: [type, "both"] };
    if (minPrice != null || maxPrice != null) filter.price = { ...(minPrice != null && { $gte: minPrice }), ...(maxPrice != null && { $lte: maxPrice }) };
    const sorting = { newest: { createdAt: -1 }, price_asc: { price: 1 }, price_desc: { price: -1 } }[sort];
    const [items, total] = await Promise.all([
      Product.find(filter).sort(sorting).skip((page - 1) * limit).limit(limit).populate("seller", "seller.storeName").lean(),
      Product.countDocuments(filter),
    ]);
    res.json({ items, page, limit, total, pages: Math.ceil(total / limit) });
  })
);

router.get(
  "/products/:id",
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(404, "Product not found");
    const p = await Product.findOne({ _id: req.params.id, status: "active" })
      .populate("seller", "seller.storeName seller.city")
      .populate("category", "name slug")
      .lean();
    if (!p) throw new ApiError(404, "Product not found");
    res.json({ product: p });
  })
);

module.exports = router;
