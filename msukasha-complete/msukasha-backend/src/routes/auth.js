const router = require("express").Router();
const bcrypt = require("bcryptjs");
const { z } = require("zod");
const User = require("../models/User");
const { asyncHandler, validate, ApiError } = require("../utils");
const { sign, protect } = require("../middleware/auth");

const phone = z.string().trim().regex(/^[+0-9\s-]{7,16}$/, "Invalid phone number");

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().toLowerCase(),
  phone: phone.optional(),
  password: z.string().min(8).max(100),
  role: z.enum(["buyer", "seller"]).default("buyer"),
  seller: z.object({ storeName: z.string().trim().min(2).max(80), description: z.string().max(500).optional(), city: z.string().max(60).optional() }).optional(),
});

router.post(
  "/register",
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const { password, role, seller, ...rest } = req.body;
    if (role === "seller" && !seller) throw new ApiError(400, "Seller details (storeName) are required");
    const user = await User.create({
      ...rest,
      role,
      passwordHash: await bcrypt.hash(password, 12),
      ...(role === "seller" ? { seller: { ...seller, status: "pending" } } : {}),
    });
    res.status(201).json({ token: sign(user), user: user.toPublic() });
  })
);

router.post(
  "/login",
  validate(z.object({ email: z.string().trim().email().toLowerCase(), password: z.string().min(1) })),
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    const ok = user && user.isActive && (await bcrypt.compare(req.body.password, user.passwordHash));
    if (!ok) throw new ApiError(401, "Invalid email or password");
    res.json({ token: sign(user), user: user.toPublic() });
  })
);

router.get("/me", protect, (req, res) => res.json({ user: req.user }));

const addr = z.object({
  label: z.string().max(30).optional(),
  fullName: z.string().max(80).optional(),
  phone: phone.optional(),
  line1: z.string().min(3).max(200),
  city: z.string().min(2).max(60),
  province: z.string().max(60).optional(),
  postalCode: z.string().max(12).optional(),
});

router.patch(
  "/me",
  protect,
  validate(z.object({ name: z.string().trim().min(2).max(80).optional(), phone: phone.optional(), addresses: z.array(addr).max(10).optional() })),
  asyncHandler(async (req, res) => {
    Object.assign(req.user, req.body);
    await req.user.save();
    res.json({ user: req.user.toPublic() });
  })
);

router.post(
  "/change-password",
  protect,
  validate(z.object({ currentPassword: z.string(), newPassword: z.string().min(8).max(100) })),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!(await bcrypt.compare(req.body.currentPassword, user.passwordHash))) throw new ApiError(400, "Current password is wrong");
    user.passwordHash = await bcrypt.hash(req.body.newPassword, 12);
    await user.save();
    res.json({ ok: true });
  })
);

module.exports = router;
