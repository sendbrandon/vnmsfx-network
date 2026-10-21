"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { Readable } = require("node:stream");
const Stripe = require("stripe");
const { createHandler, rawBody } = require("../api/saints-merch");
function res() {
  return {
    headers: {},
    setHeader(k, v) {
      this.headers[k] = v;
    },
    status(n) {
      this.statusCode = n;
      return this;
    },
    json(v) {
      this.body = v;
      return this;
    },
  };
}
const env = {
  MERCH_SITE_ORIGIN: "https://preview.example.com",
  MERCH_CHECKOUT_ENABLED: "true",
  MERCH_STRIPE_SECRET_KEY: "sk_test_fixture",
  MERCH_STRIPE_WEBHOOK_SECRET: "whsec_fixture",
};
test("unconfigured config is available and reports closed test-only checkout without providers", async () => {
  const r = res();
  await createHandler({}, () => assert.fail("providers created"))(
    { url: "/api/saints-merch", method: "GET", headers: {} },
    r,
  );
  assert.equal(r.statusCode, 200);
  assert.equal(r.body.checkoutReady, false);
  assert.equal(r.body.liveCheckoutEnabled, false);
  assert.equal(r.body.productionEnabled, false);
  assert.equal(r.body.unitAmount, 15000);
  assert.equal(r.body.editionCapPerCharacter, 100);
});
test("closed checkout never calls payment/storage; wrong methods and origins fail", async () => {
  for (const [req, expected] of [
    [
      {
        url: "/api/saints-merch?action=checkout",
        method: "POST",
        headers: { origin: env.MERCH_SITE_ORIGIN },
        body: "{}",
      },
      503,
    ],
    [
      { url: "/api/saints-merch?action=checkout", method: "GET", headers: {} },
      405,
    ],
    [
      {
        url: "/api/saints-merch?action=checkout",
        method: "POST",
        headers: { origin: "https://other.example.com" },
        body: "{}",
      },
      403,
    ],
    [
      {
        url: "/api/saints-merch?action=dispatch-preview",
        method: "POST",
        headers: {},
        body: "{}",
      },
      401,
    ],
  ]) {
    const r = res();
    await createHandler({ ...env, MERCH_CHECKOUT_ENABLED: "false" }, () =>
      assert.fail("providers created"),
    )(req, r);
    assert.equal(r.statusCode, expected);
  }
});
test("raw stream wins over Vercel lazy body getter and rejects large/parsed input", async () => {
  const req = Readable.from([Buffer.from('{"x":1}')]);
  Object.defineProperty(req, "body", {
    get() {
      assert.fail("lazy getter accessed");
    },
  });
  assert.equal((await rawBody(req)).toString(), '{"x":1}');
  await assert.rejects(rawBody({ body: { x: 1 } }), /Raw request/);
  await assert.rejects(rawBody({ body: "x".repeat(32769) }), /large/);
  await assert.rejects(rawBody(Readable.from([Buffer.alloc(33000)])), /large/);
});
test("real Stripe SDK verifies webhook raw signature; invalid signatures never touch storage", async () => {
  const sdk = new Stripe("sk_test_fixture"),
    body = JSON.stringify({
      id: "evt_fixture",
      type: "unhandled.event",
      data: { object: {} },
    }),
    header = Stripe.webhooks.generateTestHeaderString({
      payload: body,
      secret: env.MERCH_STRIPE_WEBHOOK_SECRET,
    });
  const factory = () => ({ stripe: sdk, db: {} });
  let r = res();
  await createHandler(env, factory)(
    {
      url: "/api/saints-merch?action=webhook",
      method: "POST",
      headers: { "stripe-signature": header },
      body,
    },
    r,
  );
  assert.equal(r.statusCode, 200);
  r = res();
  await createHandler(env, factory)(
    {
      url: "/api/saints-merch?action=webhook",
      method: "POST",
      headers: { "stripe-signature": header },
      body: body + " ",
    },
    r,
  );
  assert.equal(r.statusCode, 400);
});
test("supplier callback rejects disabled/unverified protocol before providers", async () => {
  const r = res();
  await createHandler(env, () => assert.fail("providers created"))(
    {
      url: "/api/saints-merch?action=apliiq-webhook",
      method: "POST",
      headers: {},
      body: "{}",
    },
    r,
  );
  assert.equal(r.statusCode, 400);
});
test("signed tracking is accepted only for submitted orders; partial is not called shipped", async () => {
  const crypto = require("node:crypto"),
    id = crypto.randomUUID();
  let result;
  const e = {
    ...env,
    MERCH_APLIIQ_PROTOCOL_VERIFIED: "true",
    APLIIQ_SHARED_SECRET: "fixture",
  };
  for (const complete of [false, true]) {
    const payload = {
        fulfillment: {
          order_id: id,
          status: "success",
          tracking_company: "USPS",
          tracking_numbers: ["TEST123"],
          line_items: complete ? [{ id: id + "-0", quantity: 1 }] : [],
        },
      },
      raw = JSON.stringify(payload),
      signature = crypto
        .createHmac("sha256", e.APLIIQ_SHARED_SECRET)
        .update(Buffer.from(raw).toString("base64"))
        .digest("base64");
    const r = res();
    await createHandler(e, () => ({
      db: {
        get: async () => ({
          id,
          status: "submitted",
          cart: [{ id: "nix", size: "M", qty: 1 }],
        }),
        recordTracking: async (_id, _tracking, isComplete) =>
          (result = isComplete),
      },
    }))(
      {
        url: "/api/saints-merch?action=apliiq-webhook",
        method: "POST",
        headers: { "x-apliiq-hmac": signature },
        body: raw,
      },
      r,
    );
    assert.equal(r.statusCode, 200);
    assert.equal(result, complete);
  }
});
