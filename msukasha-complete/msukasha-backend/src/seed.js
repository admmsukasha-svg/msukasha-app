require("dotenv").config();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { connectDB } = require("./db");
const User = require("./models/User");
const Category = require("./models/Category");
const Product = require("./models/Product");
const { slugify } = require("./utils");

const CATEGORIES = ["Electronics", "Fashion", "Home & Kitchen", "Groceries", "Industrial & Wholesale", "Beauty", "Sports", "Books"];

(async () => {
  await connectDB();
  const email = (process.env.ADMIN_EMAIL || "").toLowerCase();
  if (!email || !process.env.ADMIN_PASSWORD) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD");
  if (!(await User.findOne({ email }))) {
    await User.create({ name: "MSUKASHA Admin", email, role: "admin", passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD, 12) });
    console.log("Admin created:", email);
  }
  for (const name of CATEGORIES) await Category.updateOne({ slug: slugify(name) }, { $setOnInsert: { name, slug: slugify(name) } }, { upsert: true });
  console.log("Categories ready");

  if (process.argv.includes("--demo")) {
    let seller = await User.findOne({ email: "demo-seller@msukasha.com" });
    if (!seller) seller = await User.create({ name: "Demo Seller", email: "demo-seller@msukasha.com", role: "seller", passwordHash: await bcrypt.hash("DemoSeller#123", 12), seller: { storeName: "Demo Store", city: "Islamabad", status: "approved" } });
    if (!(await Product.countDocuments({ seller: seller._id }))) {
      const cat = (n) => Category.findOne({ slug: slugify(n) }).then((c) => c._id);
      await Product.insertMany([
        { seller: seller._id, title: "Wireless Earbuds", description: "Bluetooth 5.3, 24h battery", price: 3500, stock: 100, type: "c2c", category: await cat("Electronics") },
        { seller: seller._id, title: "Cotton T-Shirt (bulk)", description: "Plain cotton tee, wholesale", price: 650, stock: 5000, minOrderQty: 20, tierPricing: [{ minQty: 100, price: 550 }, { minQty: 500, price: 480 }], type: "b2b", category: await cat("Fashion") },
      ]);
    }
    console.log("Demo data ready (demo-seller@msukasha.com / DemoSeller#123)");
  }
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
