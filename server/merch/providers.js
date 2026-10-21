"use strict";
const Stripe = require("stripe");
const { createClient } = require("@supabase/supabase-js");
const { MerchError, assertTestKey } = require("./catalog");
function need(env, key) {
  if (!env[key])
    throw new MerchError(503, "Merch backend configuration is incomplete.");
  return env[key];
}
function createProviders(env) {
  assertTestKey(env.MERCH_STRIPE_SECRET_KEY);
  const stripe = new Stripe(env.MERCH_STRIPE_SECRET_KEY, {
    timeout: 10000,
    maxNetworkRetries: 1,
  });
  const supabase = createClient(
    need(env, "SUPABASE_URL"),
    need(env, "SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (url, options) =>
          fetch(url, { ...options, signal: AbortSignal.timeout(10000) }),
      },
    },
  );
  async function result(query) {
    const { data, error } = await query;
    if (error) {
      const known = [
        "edition_sold_out",
        "request_conflict",
        "request_expired",
        "session_conflict",
        "payment_conflict",
        "payment_after_release",
      ];
      if (known.some((x) => (error.message || "").includes(x)))
        throw new MerchError(
          409,
          (error.message || "").includes("sold_out")
            ? "This edition is currently fully reserved."
            : "Order state needs review.",
        );
      throw new MerchError(503, "Order storage is temporarily unavailable.");
    }
    return data;
  }
  const rpc = (name, args) => result(supabase.rpc(name, args));
  const db = {
    reserve: (id, cart) =>
      rpc("merch_reserve", { p_request_id: id, p_cart: cart }),
    bindSession: (id, sid) =>
      rpc("merch_bind_session", { p_order_id: id, p_session_id: sid }),
    get: (id) =>
      result(
        supabase.from("merch_orders").select("*").eq("id", id).maybeSingle(),
      ),
    markPaid: (id, sid, total, customer, intent) =>
      rpc("merch_mark_paid", {
        p_order_id: id,
        p_session_id: sid,
        p_subtotal: total,
        p_customer: customer,
        p_payment_intent: intent,
      }),
    release: (id, sid) =>
      rpc("merch_release", { p_order_id: id, p_session_id: sid }),
    recordEvent: (id, type, orderId) =>
      result(
        supabase
          .from("merch_stripe_events")
          .upsert(
            { event_id: id, event_type: type, order_id: orderId },
            { onConflict: "event_id", ignoreDuplicates: true },
          ),
      ),
    recordTracking: (externalId, tracking, complete) =>
      result(
        supabase
          .from("merch_orders")
          .update({
            status: complete ? "shipped" : "submitted",
            tracking,
            updated_at: new Date().toISOString(),
          })
          .eq("id", externalId)
          .eq("status", "submitted")
          .select("id"),
      ),
  };
  return { stripe, db };
}
module.exports = { createProviders, need };
