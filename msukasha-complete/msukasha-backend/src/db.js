const mongoose = require("mongoose");

// Cached connection so serverless (Vercel) reuses it between invocations.
const cache = global.__mongoose || (global.__mongoose = { conn: null, promise: null });

async function connectDB() {
  if (cache.conn) return cache.conn;
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set");
  if (!cache.promise) {
    mongoose.set("strictQuery", true);
    cache.promise = mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
      bufferCommands: false,
    });
  }
  try {
    cache.conn = await cache.promise;
  } catch (e) {
    cache.promise = null;
    throw e;
  }
  return cache.conn;
}

module.exports = { connectDB };
