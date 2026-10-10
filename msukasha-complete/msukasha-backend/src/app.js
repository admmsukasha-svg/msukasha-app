require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { connectDB } = require("./db");
const { errorHandler, asyncHandler } = require("./utils");

const app = express();
app.set("trust proxy", 1); // behind Vercel / a reverse proxy

const origins = (process.env.CORS_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
app.use(helmet());
app.use(cors({ origin: (o, cb) => cb(null, !o || origins.includes(o)) })); // no Origin header = native app / server
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "100kb" })); // payment gateway callbacks
if (process.env.NODE_ENV !== "test") app.use(morgan("tiny"));

app.get("/", (_req, res) => res.json({ name: "MSUKASHA API", status: "ok" }));
app.get("/health", (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.use("/api", asyncHandler(async (_req, _res, next) => { await connectDB(); next(); }));
app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false }));

app.use("/api/auth", require("./routes/auth"));
app.use("/api", require("./routes/catalog"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/payments", require("./routes/payments"));
app.use("/api/seller", require("./routes/seller"));
app.use("/api/admin", require("./routes/admin"));

app.use((_req, res) => res.status(404).json({ error: "Not found" }));
app.use(errorHandler);

module.exports = app;
