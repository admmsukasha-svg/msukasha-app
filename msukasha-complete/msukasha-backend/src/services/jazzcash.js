const crypto = require("crypto");

// JazzCash Hosted Checkout (Page Redirection).
// NOTE: Verify field names/URLs against the docs for your merchant account before going live.
const endpoints = {
  sandbox: "https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/",
  live: "https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/",
};

const pad = (n) => String(n).padStart(2, "0");
const stamp = (d) =>
  `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;

function secureHash(fields, salt) {
  const str = Object.keys(fields)
    .filter((k) => k !== "pp_SecureHash" && fields[k] !== "" && fields[k] != null)
    .sort()
    .map((k) => fields[k])
    .join("&");
  return crypto.createHmac("sha256", salt).update(`${salt}&${str}`).digest("hex").toUpperCase();
}

function configured() {
  return !!(process.env.JAZZCASH_MERCHANT_ID && process.env.JAZZCASH_PASSWORD && process.env.JAZZCASH_INTEGRITY_SALT);
}

function buildPayload(order) {
  const now = new Date();
  const fields = {
    pp_Version: "1.1",
    pp_TxnType: "",
    pp_Language: "EN",
    pp_MerchantID: process.env.JAZZCASH_MERCHANT_ID,
    pp_SubMerchantID: "",
    pp_Password: process.env.JAZZCASH_PASSWORD,
    pp_BankID: "TBANK",
    pp_ProductID: "RETL",
    pp_TxnRefNo: `T${stamp(now)}${order._id.toString().slice(-4)}`,
    pp_Amount: String(Math.round(order.total * 100)), // paisa
    pp_TxnCurrency: "PKR",
    pp_TxnDateTime: stamp(now),
    pp_BillReference: order.orderNumber.replace(/[^A-Za-z0-9]/g, ""),
    pp_Description: `Order ${order.orderNumber}`,
    pp_TxnExpiryDateTime: stamp(new Date(now.getTime() + 60 * 60 * 1000)),
    pp_ReturnURL: `${process.env.API_PUBLIC_URL}/api/payments/jazzcash/callback`,
    ppmpf_1: order._id.toString(),
    ppmpf_2: "",
    ppmpf_3: "",
    ppmpf_4: "",
    ppmpf_5: "",
  };
  fields.pp_SecureHash = secureHash(fields, process.env.JAZZCASH_INTEGRITY_SALT);
  return {
    url: endpoints[process.env.JAZZCASH_ENV === "live" ? "live" : "sandbox"],
    method: "POST",
    fields,
    txnRef: fields.pp_TxnRefNo,
  };
}

function verifyCallback(body) {
  if (!body?.pp_SecureHash) return false;
  const expected = secureHash(body, process.env.JAZZCASH_INTEGRITY_SALT);
  const a = Buffer.from(expected);
  const b = Buffer.from(String(body.pp_SecureHash).toUpperCase());
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

module.exports = { configured, buildPayload, verifyCallback, secureHash };
