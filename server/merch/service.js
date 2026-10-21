"use strict";
const {
  MerchError,
  normalizeCart,
  PRODUCTS,
  UNIT_AMOUNT,
  assertTestKey,
} = require("./catalog");
const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function createService({ db, stripe, env }) {
  async function checkout(input) {
    if (env.MERCH_CHECKOUT_ENABLED !== "true")
      throw new MerchError(
        503,
        "Checkout is in setup. Orders are not open yet.",
      );
    assertTestKey(env.MERCH_STRIPE_SECRET_KEY);
    if (!UUID.test(input.requestId || ""))
      throw new MerchError(400, "Invalid checkout request.");
    const cart = normalizeCart(input.items);
    const order = await db.reserve(input.requestId, cart.lines);
    if (order.status !== "reserved")
      throw new MerchError(409, "This checkout has already been completed.");
    if (order.session_id) {
      const existing = await stripe.checkout.sessions.retrieve(
        order.session_id,
      );
      if (existing.status === "open" && existing.url)
        return { url: existing.url };
      throw new MerchError(
        409,
        "This checkout has ended. Start a new checkout.",
      );
    }
    const origin = new URL(env.MERCH_SITE_ORIGIN);
    if (origin.protocol !== "https:" && origin.hostname !== "localhost")
      throw new MerchError(503, "Checkout origin is not configured.");
    const params = {
      mode: "payment",
      payment_method_types: ["card"],
      client_reference_id: order.id,
      metadata: { scope: "saints-merch-v1", order_id: order.id },
      line_items: order.cart.map((x) => ({
        quantity: x.qty,
        price_data: {
          currency: "usd",
          unit_amount: UNIT_AMOUNT,
          product_data: {
            name: PRODUCTS.find((p) => p.id === x.id).name + " · " + x.size,
            metadata: { merch_id: x.id, size: x.size },
          },
        },
      })),
      shipping_address_collection: { allowed_countries: ["US"] },
      billing_address_collection: "required",
      expires_at: Math.floor(new Date(order.expires_at).getTime() / 1000),
      success_url:
        origin.origin +
        "/saints-merch-checkout?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: origin.origin + "/saints-merch-checkout?cancelled=1",
      allow_promotion_codes: false,
    };
    if (env.MERCH_STRIPE_SHIPPING_RATE_ID)
      params.shipping_options = [
        { shipping_rate: env.MERCH_STRIPE_SHIPPING_RATE_ID },
      ];
    // On timeout retain the hold: repeating this request reuses these exact params/key.
    const session = await stripe.checkout.sessions.create(params, {
      idempotencyKey: "saints-merch/" + order.id,
    });
    if (session.livemode || !session.url)
      throw new MerchError(503, "Test checkout could not be created.");
    await db.bindSession(order.id, session.id);
    return { url: session.url };
  }
  async function reconcile(sessionId) {
    const s = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items.data.price.product"],
    });
    if (s.metadata?.scope !== "saints-merch-v1") return { ignored: true };
    if (s.livemode !== false)
      throw new MerchError(409, "Live merch payments are not enabled.");
    if (!UUID.test(s.metadata.order_id || ""))
      throw new MerchError(409, "Order reference mismatch.");
    const order = await db.get(s.metadata.order_id);
    if (
      !order ||
      (order.session_id && order.session_id !== s.id) ||
      s.client_reference_id !== order.id
    )
      throw new MerchError(409, "Order reference mismatch.");
    if (s.status === "expired" && s.payment_status === "unpaid")
      return db.release(order.id, s.id);
    if (s.payment_status !== "paid") return { pending: true };
    if (
      s.status !== "complete" ||
      s.currency !== "usd" ||
      s.amount_subtotal !== order.subtotal ||
      s.total_details?.amount_discount !== 0 ||
      s.line_items?.has_more
    )
      throw new MerchError(409, "Paid order needs review.");
    const paidCart = normalizeCart(
      s.line_items?.data?.map((l) => ({
        id: l.price?.product?.metadata?.merch_id,
        size: l.price?.product?.metadata?.size,
        qty: l.quantity,
      })),
    );
    if (
      JSON.stringify(paidCart.lines) !==
        JSON.stringify(normalizeCart(order.cart).lines) ||
      s.line_items.data.some(
        (l) =>
          l.price.unit_amount !== UNIT_AMOUNT || l.price.currency !== "usd",
      )
    )
      throw new MerchError(409, "Paid items need review.");
    const shipping =
      s.collected_information?.shipping_details || s.shipping_details;
    if (
      !shipping?.name ||
      shipping.address?.country !== "US" ||
      !shipping.address.line1 ||
      !shipping.address.city ||
      !shipping.address.state ||
      !shipping.address.postal_code ||
      !s.customer_details?.email
    )
      throw new MerchError(409, "Delivery details need review.");
    return db.markPaid(
      order.id,
      s.id,
      order.subtotal,
      {
        email: s.customer_details.email,
        name: shipping.name,
        address: shipping.address,
      },
      typeof s.payment_intent === "string"
        ? s.payment_intent
        : s.payment_intent?.id,
    );
  }
  async function webhook(event) {
    const types = [
      "checkout.session.completed",
      "checkout.session.async_payment_succeeded",
      "checkout.session.expired",
    ];
    if (!types.includes(event.type)) return { received: true };
    const result = await reconcile(event.data.object.id);
    if (!result.ignored)
      await db.recordEvent(event.id, event.type, result.id || null);
    return { received: true };
  }
  async function status(sessionId) {
    if (!/^cs_test_[a-zA-Z0-9_]+$/.test(sessionId || ""))
      throw new MerchError(400, "Invalid test session.");
    const s = await stripe.checkout.sessions.retrieve(sessionId);
    if (s.livemode !== false || s.metadata?.scope !== "saints-merch-v1")
      throw new MerchError(404, "Test order not found.");
    const order = await db.get(s.metadata.order_id);
    if (!order || order.session_id !== s.id)
      throw new MerchError(404, "Test order not found.");
    // Never expose recipient, email, address, cart, supplier credentials or payment details.
    return { testMode: true, status: order.status, productionEnabled: false };
  }
  return { checkout, reconcile, webhook, status };
}
module.exports = { createService, UUID };
