"use strict";
const crypto = require("node:crypto");
const {
  MerchError,
  PRODUCTS,
  SIZES,
  UNIT_AMOUNT,
  assertTestKey,
} = require("../server/merch/catalog");
const { createProviders } = require("../server/merch/providers");
const { createService, UUID } = require("../server/merch/service");
const { buildPayload, verifyTracking } = require("../server/merch/apliiq");
async function rawBody(req) {
  // Do not touch Vercel's lazy parsed body getter before reading the raw stream.
  if (typeof req.on === "function")
    return new Promise((resolve, reject) => {
      const chunks = [];
      let size = 0;
      req.on("data", (chunk) => {
        const b = Buffer.from(chunk);
        size += b.length;
        if (size > 32768) {
          reject(new MerchError(413, "Request too large."));
          return;
        }
        chunks.push(b);
      });
      req.on("end", () => resolve(Buffer.concat(chunks)));
      req.on("error", reject);
    });
  if (Buffer.isBuffer(req.body) || typeof req.body === "string") {
    const raw = Buffer.from(req.body);
    if (raw.length > 32768) throw new MerchError(413, "Request too large.");
    return raw;
  }
  throw new MerchError(400, "Raw request bytes required.");
}
function operator(req, env) {
  const secret = env.MERCH_ADMIN_TOKEN || "",
    value = req.headers.authorization || "";
  const a = Buffer.from(value),
    b = Buffer.from("Bearer " + secret);
  if (
    secret.length < 32 ||
    a.length !== b.length ||
    !crypto.timingSafeEqual(a, b)
  )
    throw new MerchError(401, "Operator authentication required.");
}
function createHandler(env = process.env, providerFactory = createProviders) {
  return async (req, res) => {
    const requestId = crypto.randomUUID();
    res.setHeader("X-Request-Id", requestId);
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    try {
      const url = new URL(req.url, "https://vnmsfx.com"),
        action = url.searchParams.get("action") || "config";
      const methods = {
        config: "GET",
        status: "GET",
        checkout: "POST",
        webhook: "POST",
        "apliiq-webhook": "POST",
        reconcile: "POST",
        "dispatch-preview": "POST",
      };
      if (!methods[action]) throw new MerchError(404, "Not found.");
      if (req.method !== methods[action]) {
        res.setHeader("Allow", methods[action]);
        throw new MerchError(405, "Method not allowed.");
      }
      if (action === "config") {
        let testKey = false;
        try {
          assertTestKey(env.MERCH_STRIPE_SECRET_KEY);
          testKey = true;
        } catch {}
        return res
          .status(200)
          .json({
            version: 1,
            testMode: true,
            liveCheckoutEnabled: false,
            checkoutReady:
              env.MERCH_CHECKOUT_ENABLED === "true" &&
              testKey &&
              !!(
                env.SUPABASE_URL &&
                env.SUPABASE_SERVICE_ROLE_KEY &&
                env.MERCH_SITE_ORIGIN
              ),
            productionEnabled: false,
            market: "US",
            currency: "usd",
            unitAmount: UNIT_AMOUNT,
            editionCapPerCharacter: 100,
            products: PRODUCTS,
            sizes: SIZES,
          });
      }
      if (["reconcile", "dispatch-preview"].includes(action))
        operator(req, env);
      if (
        action === "checkout" &&
        (!env.MERCH_SITE_ORIGIN ||
          req.headers.origin !== new URL(env.MERCH_SITE_ORIGIN).origin)
      )
        throw new MerchError(403, "Invalid checkout origin.");
      if (action === "checkout" && env.MERCH_CHECKOUT_ENABLED !== "true")
        throw new MerchError(
          503,
          "Checkout is in setup. Orders are not open yet.",
        );
      const raw = req.method === "POST" ? await rawBody(req) : null;
      if (action === "apliiq-webhook") {
        if (
          env.MERCH_APLIIQ_PROTOCOL_VERIFIED !== "true" ||
          !verifyTracking(
            raw,
            req.headers["x-apliiq-hmac"],
            env.APLIIQ_SHARED_SECRET,
          )
        )
          throw new MerchError(400, "Invalid supplier signature.");
        let payload;
        try {
          payload = JSON.parse(raw);
        } catch {
          throw new MerchError(400, "Invalid JSON.");
        }
        const f = payload?.fulfillment;
        if (
          !f ||
          !UUID.test(f.order_id || "") ||
          f.status !== "success" ||
          !Array.isArray(f.tracking_numbers) ||
          !f.tracking_numbers.length ||
          f.tracking_numbers.length > 10 ||
          f.tracking_numbers.some(
            (n) => typeof n !== "string" || n.length > 100,
          )
        )
          throw new MerchError(400, "Invalid tracking data.");
        const { db } = providerFactory(env),
          order = await db.get(f.order_id);
        if (!order || !["submitted", "shipped"].includes(order.status))
          throw new MerchError(409, "Order is not submitted for production.");
        const complete = order.cart.every((x, i) =>
          f.line_items?.some(
            (l) => l.id === order.id + "-" + i && l.quantity === x.qty,
          ),
        );
        await db.recordTracking(
          order.id,
          {
            carrier: String(f.tracking_company || "").slice(0, 80),
            numbers: f.tracking_numbers,
          },
          complete,
        );
        return res.status(200).json({ received: true });
      }
      const p = providerFactory(env),
        service = createService({ db: p.db, stripe: p.stripe, env });
      if (action === "webhook") {
        let event;
        try {
          if (!env.MERCH_STRIPE_WEBHOOK_SECRET) throw new Error();
          event = p.stripe.webhooks.constructEvent(
            raw,
            req.headers["stripe-signature"],
            env.MERCH_STRIPE_WEBHOOK_SECRET,
          );
        } catch {
          throw new MerchError(400, "Invalid payment signature.");
        }
        return res.status(200).json(await service.webhook(event));
      }
      if (action === "status")
        return res
          .status(200)
          .json(await service.status(url.searchParams.get("session_id")));
      let body;
      try {
        body = JSON.parse(raw);
      } catch {
        throw new MerchError(400, "Invalid JSON.");
      }
      if (!body || typeof body !== "object" || Array.isArray(body))
        throw new MerchError(400, "Invalid request.");
      if (action === "checkout")
        return res.status(200).json(await service.checkout(body));
      if (action === "reconcile")
        return res.status(200).json(await service.reconcile(body.sessionId));
      if (action === "dispatch-preview") {
        if (!UUID.test(body.orderId || ""))
          throw new MerchError(400, "Invalid order.");
        const order = await p.db.get(body.orderId);
        if (!order || order.status !== "paid_hold")
          throw new MerchError(409, "No held paid order found.");
        return res
          .status(200)
          .json({
            dryRun: true,
            productionEnabled: false,
            payload: buildPayload(order, env),
          });
      }
    } catch (error) {
      const status = error instanceof MerchError ? error.status : 503;
      console.error(
        JSON.stringify({
          scope: "saints-merch",
          requestId,
          status,
          errorClass: error.name,
        }),
      );
      return res
        .status(status)
        .json({
          error:
            status === 503
              ? "Merch checkout is not ready yet. Please try again later."
              : error.message,
          requestId,
        });
    }
  };
}
module.exports = createHandler();
module.exports.createHandler = createHandler;
module.exports.rawBody = rawBody;
module.exports.config = { api: { bodyParser: false } };
