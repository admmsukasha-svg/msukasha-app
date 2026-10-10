require("dotenv").config();
const app = require("./app");
const { connectDB } = require("./db");

const port = process.env.PORT || 4000;
connectDB()
  .then(() => app.listen(port, () => console.log(`MSUKASHA API listening on :${port}`)))
  .catch((e) => { console.error("DB connection failed:", e.message); process.exit(1); });
