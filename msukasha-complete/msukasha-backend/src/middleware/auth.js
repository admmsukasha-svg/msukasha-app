const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { ApiError, asyncHandler } = require("../utils");

const sign = (user) =>
  jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const protect = asyncHandler(async (req, _res, next) => {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) throw new ApiError(401, "Authentication required");
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new ApiError(401, "Invalid or expired token");
  }
  const user = await User.findById(payload.sub).select("-passwordHash");
  if (!user || !user.isActive) throw new ApiError(401, "Account not available");
  req.user = user;
  next();
});

const requireRole = (...roles) => (req, _res, next) =>
  roles.includes(req.user.role) ? next() : next(new ApiError(403, "Forbidden"));

const requireApprovedSeller = (req, _res, next) => {
  if (req.user.role !== "seller") return next(new ApiError(403, "Seller account required"));
  if (req.user.seller?.status !== "approved")
    return next(new ApiError(403, "Seller account is not approved yet"));
  next();
};

module.exports = { sign, protect, requireRole, requireApprovedSeller };
