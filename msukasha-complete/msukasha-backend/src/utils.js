const { ZodError } = require("zod");

class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// validate(schema, "body" | "query") -> parsed data on req.body / req.validQuery
const validate = (schema, source = "body") => (req, _res, next) => {
  const r = schema.safeParse(req[source]);
  if (!r.success) return next(r.error);
  if (source === "query") req.validQuery = r.data;
  else req[source] = r.data;
  next();
};

function errorHandler(err, _req, res, _next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Validation failed",
      details: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    });
  }
  if (err instanceof ApiError) return res.status(err.status).json({ error: err.message, details: err.details });
  if (err.name === "CastError") return res.status(400).json({ error: "Invalid id" });
  if (err.code === 11000) return res.status(409).json({ error: "Already exists", details: err.keyValue });
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}

const slugify = (s) =>
  String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

module.exports = { ApiError, asyncHandler, validate, errorHandler, slugify };
