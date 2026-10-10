// Unit price for a quantity, applying the best wholesale tier (B2B).
function unitPriceFor(product, qty) {
  let price = product.price;
  const tiers = [...(product.tierPricing || [])].sort((a, b) => b.minQty - a.minQty);
  const hit = tiers.find((t) => qty >= t.minQty);
  if (hit) price = hit.price;
  return price;
}

function shippingFor(subtotal) {
  const fee = Number(process.env.SHIPPING_FEE ?? 250);
  const free = Number(process.env.FREE_SHIPPING_THRESHOLD ?? 5000);
  return subtotal >= free ? 0 : fee;
}

module.exports = { unitPriceFor, shippingFor };
