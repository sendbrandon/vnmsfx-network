"use strict";
class MerchError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "MerchError";
    this.status = status;
  }
}
const SIZES = Object.freeze(["S", "M", "L", "XL", "2XL", "3XL"]);
const PRODUCTS = Object.freeze([
  { id: "nix", name: "Nix hoodie" },
  { id: "rook", name: "Rook hoodie" },
]);
const UNIT_AMOUNT = 15000;
function normalizeCart(raw) {
  if (!Array.isArray(raw) || !raw.length || raw.length > 12)
    throw new MerchError(400, "Choose at least one hoodie.");
  const merged = new Map();
  for (const item of raw) {
    if (
      !item ||
      typeof item !== "object" ||
      Array.isArray(item) ||
      !PRODUCTS.some((p) => p.id === item.id) ||
      !SIZES.includes(item.size) ||
      !Number.isInteger(item.qty) ||
      item.qty < 1 ||
      item.qty > 10
    )
      throw new MerchError(400, "Invalid hoodie or size.");
    const key = item.id + ":" + item.size;
    merged.set(key, {
      id: item.id,
      size: item.size,
      qty: (merged.get(key)?.qty || 0) + item.qty,
    });
  }
  const lines = [...merged.values()].sort((a, b) =>
    (a.id + ":" + a.size).localeCompare(b.id + ":" + b.size),
  );
  if (lines.reduce((s, x) => s + x.qty, 0) > 10)
    throw new MerchError(400, "Maximum 10 hoodies per checkout.");
  return {
    lines,
    subtotal: lines.reduce((s, x) => s + x.qty * UNIT_AMOUNT, 0),
  };
}
function skuKey(item) {
  return `MERCH_APLIIQ_${item.id.toUpperCase()}_${item.size}`;
}
function assertTestKey(key) {
  if (!/^(sk|rk)_test_/.test(key || ""))
    throw new MerchError(503, "Merch test payments are not configured.");
}
module.exports = {
  MerchError,
  SIZES,
  PRODUCTS,
  UNIT_AMOUNT,
  normalizeCart,
  skuKey,
  assertTestKey,
};
