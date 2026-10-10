const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, default: "Home" },
    fullName: String,
    phone: String,
    line1: { type: String, required: true },
    city: { type: String, required: true },
    province: String,
    postalCode: String,
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["buyer", "seller", "admin"], default: "buyer", index: true },
    isActive: { type: Boolean, default: true },
    addresses: [addressSchema],
    seller: {
      storeName: String,
      description: String,
      city: String,
      status: { type: String, enum: ["pending", "approved", "rejected", "suspended"] },
    },
  },
  { timestamps: true }
);

userSchema.methods.toPublic = function () {
  const o = this.toObject();
  delete o.passwordHash;
  delete o.__v;
  return o;
};

module.exports = mongoose.model("User", userSchema);
