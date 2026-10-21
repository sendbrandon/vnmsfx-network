"use strict";
const crypto = require("node:crypto");
const { MerchError, skuKey, PRODUCTS } = require("./catalog");
function buildPayload(order, env) {
  if (!order?.customer?.address || order.customer.address.country !== "US")
    throw new MerchError(409, "A US delivery address is required.");
  const c = order.customer,
    a = c.address,
    names = c.name.trim().split(/\s+/);
  return {
    id: order.id,
    number: order.order_number,
    name: "SOBL-" + order.order_number,
    order_number: order.order_number,
    line_items: order.cart.map((x, i) => {
      const sku = env[skuKey(x)];
      if (!/^APQ-[A-Za-z0-9]+$/.test(sku || ""))
        throw new MerchError(
          503,
          "Approved supplier SKU mapping is incomplete.",
        );
      return {
        id: order.id + "-" + i,
        title: PRODUCTS.find((p) => p.id === x.id).name,
        quantity: x.qty,
        price: "150.00",
        grams: 0,
        sku,
        name: x.id + " / " + x.size,
      };
    }),
    shipping_address: {
      first_name: names[0],
      last_name: names.slice(1).join(" ") || names[0],
      name: c.name,
      address1: a.line1,
      address2: a.line2 || "",
      city: a.city,
      province: a.state,
      province_code: a.state,
      zip: a.postal_code,
      country: "United States",
      country_code: "US",
    },
    shipping_lines: [{ code: "standard" }],
  };
}
// Provisional SHA256 interpretation of supplier's documented SHA265 typo.
// A real supplier signing fixture must be verified before turning protocol flag on.
function sign(
  body,
  key,
  secret,
  {
    timestamp = Math.floor(Date.now() / 1000),
    nonce = crypto.randomBytes(16).toString("hex"),
  } = {},
) {
  const digest = crypto
    .createHmac("sha256", secret)
    .update(key + timestamp + nonce + Buffer.from(body).toString("base64"))
    .digest("base64");
  return `${timestamp}:${digest}:${key}:${nonce}`;
}
function verifyTracking(raw, signature, secret) {
  if (typeof signature !== "string" || !secret) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(Buffer.from(raw).toString("base64"))
    .digest("base64");
  const a = Buffer.from(signature),
    b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
async function submit(order, env, fetcher = fetch) {
  // This branch's database creates test-only orders. Test payments NEVER manufacture.
  if (
    order.environment !== "live" ||
    env.MERCH_FULFILLMENT_ENABLED !== "true" ||
    env.MERCH_SAMPLES_APPROVED !== "true" ||
    env.MERCH_APLIIQ_PROTOCOL_VERIFIED !== "true"
  )
    throw new MerchError(409, "Real manufacturing is disabled.");
  if (
    order.status !== "submitting" ||
    !env.APLIIQ_APP_ID ||
    !env.APLIIQ_SHARED_SECRET
  )
    throw new MerchError(409, "Order is not claimed for production.");
  const body = JSON.stringify(buildPayload(order, env));
  // No automatic retries. A timeout may mean the supplier accepted the order.
  const response = await fetcher("https://api.apliiq.com/v1/Order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-apliiq-auth": sign(body, env.APLIIQ_APP_ID, env.APLIIQ_SHARED_SECRET),
    },
    body,
    signal: AbortSignal.timeout(15000),
  });
  if (response.status !== 200)
    throw new MerchError(
      503,
      "Supplier result requires reconciliation. Do not resend automatically.",
    );
  const data = await response.json();
  if (!data.id)
    throw new MerchError(503, "Supplier result requires reconciliation.");
  return { providerOrderId: String(data.id) };
}
module.exports = { buildPayload, sign, verifyTracking, submit };
