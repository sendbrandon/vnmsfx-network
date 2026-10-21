"use strict";
// Adapter for the approved storefront. Does not alter its art, copy or bag.
function createMerchClient({
  fetchImpl = fetch,
  storage = globalThis.sessionStorage,
  uuid = () => crypto.randomUUID(),
} = {}) {
  async function configuration() {
    const r = await fetchImpl("/api/saints-merch");
    if (!r.ok) throw new Error("Checkout setup is unavailable.");
    return r.json();
  }
  async function checkout(items) {
    const normalized = items
        .map((x) => ({ id: x.id, size: x.size, qty: x.qty }))
        .sort((a, b) =>
          (a.id + ":" + a.size).localeCompare(b.id + ":" + b.size),
        ),
      fingerprint = JSON.stringify(normalized);
    let attempt;
    try {
      attempt = JSON.parse(storage.getItem("sobl-checkout-attempt"));
    } catch {}
    if (!attempt || attempt.cart !== fingerprint) {
      attempt = { cart: fingerprint, id: uuid() };
      storage.setItem("sobl-checkout-attempt", JSON.stringify(attempt));
    }
    const response = await fetchImpl("/api/saints-merch?action=checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: normalized, requestId: attempt.id }),
    });
    const result = await response.json();
    if (!response.ok)
      throw new Error(result.error || "Checkout is unavailable.");
    const url = new URL(result.url);
    if (url.protocol !== "https:" || url.hostname !== "checkout.stripe.com")
      throw new Error("Checkout destination could not be verified.");
    return url.href;
  }
  return { configuration, checkout };
}
if (typeof window !== "undefined") window.SaintsMerch = { createMerchClient };
if (typeof module !== "undefined") module.exports = { createMerchClient };
