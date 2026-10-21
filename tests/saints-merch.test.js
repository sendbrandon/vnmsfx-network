"use strict";
const { test, before, after, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const { PGlite } = require("@electric-sql/pglite");
const { normalizeCart } = require("../server/merch/catalog");
const { createService } = require("../server/merch/service");
const {
  buildPayload,
  submit,
  sign,
  verifyTracking,
} = require("../server/merch/apliiq");
let pg;
before(async () => {
  pg = new PGlite();
  await pg.exec(
    "create role anon;create role authenticated;create role service_role bypassrls;",
  );
  await pg.exec(fs.readFileSync("docs/saints-merch-schema.sql", "utf8"));
});
after(async () => {
  await pg.close();
});
beforeEach(async () => {
  await pg.exec(
    "truncate merch_stripe_events,merch_orders restart identity;update merch_editions set reserved=0,sold=0;",
  );
});
const cart = [{ id: "nix", size: "M", qty: 1 }];
async function rpc(name, args) {
  const r = await pg.query(
    `select ${name}(${args.map((_, i) => "$" + (i + 1)).join(",")}) as result`,
    args.map((x) => (typeof x === "object" ? JSON.stringify(x) : x)),
  );
  return r.rows[0].result;
}
function db() {
  return {
    reserve: (id, c) => rpc("merch_reserve", [id, c]),
    bindSession: (id, sid) => rpc("merch_bind_session", [id, sid]),
    get: async (id) =>
      (await pg.query("select * from merch_orders where id=$1", [id])).rows[0],
    markPaid: (id, sid, n, c, pi) =>
      rpc("merch_mark_paid", [id, sid, n, c, pi]),
    release: (id, sid) => rpc("merch_release", [id, sid]),
    recordEvent: async (id, type, oid) => {
      await pg.query(
        "insert into merch_stripe_events(event_id,event_type,order_id) values($1,$2,$3) on conflict do nothing",
        [id, type, oid],
      );
    },
  };
}
const env = {
  MERCH_CHECKOUT_ENABLED: "true",
  MERCH_STRIPE_SECRET_KEY: "sk_test_fixture",
  MERCH_SITE_ORIGIN: "https://preview.example.com",
};
function fixture() {
  const store = db(),
    sessions = new Map(),
    created = [],
    keys = new Map();
  let loseResponse = false;
  const stripe = {
    checkout: {
      sessions: {
        create: async (params, opts) => {
          created.push({ params, opts });
          let session = keys.get(opts.idempotencyKey);
          if (!session) {
            session = {
              id: "cs_test_" + crypto.randomBytes(12).toString("hex"),
              url: "https://checkout.stripe.com/test",
              livemode: false,
              status: "open",
              payment_status: "unpaid",
              client_reference_id: params.client_reference_id,
              metadata: params.metadata,
              currency: "usd",
              amount_subtotal: params.line_items.reduce(
                (s, x) => s + x.quantity * x.price_data.unit_amount,
                0,
              ),
              total_details: { amount_discount: 0 },
              line_items: {
                has_more: false,
                data: params.line_items.map((x) => ({
                  quantity: x.quantity,
                  price: {
                    unit_amount: x.price_data.unit_amount,
                    currency: "usd",
                    product: { metadata: x.price_data.product_data.metadata },
                  },
                })),
              },
              customer_details: { email: "test@example.com" },
              collected_information: {
                shipping_details: {
                  name: "Sample Recipient",
                  address: {
                    line1: "123 Test St",
                    city: "Los Angeles",
                    state: "CA",
                    postal_code: "90001",
                    country: "US",
                  },
                },
              },
              payment_intent: "pi_test_fixture",
            };
            sessions.set(session.id, session);
            keys.set(opts.idempotencyKey, session);
          }
          if (loseResponse) {
            loseResponse = false;
            throw new Error("lost-response");
          }
          return session;
        },
        retrieve: async (id) => {
          if (!sessions.has(id)) throw new Error("missing session");
          return sessions.get(id);
        },
      },
    },
  };
  return {
    service: createService({ db: store, stripe, env }),
    store,
    sessions,
    created,
    loseNextResponse() {
      loseResponse = true;
    },
    paid() {
      const s = [...sessions.values()][0];
      s.status = "complete";
      s.payment_status = "paid";
      return s;
    },
  };
}
test("catalog ignores client pricing; merges lines and rejects invalid size/quantity", () => {
  assert.deepEqual(
    normalizeCart([
      { ...cart[0], qty: 2, price: 1 },
      { ...cart[0], qty: 1 },
    ]),
    { lines: [{ ...cart[0], qty: 3 }], subtotal: 45000 },
  );
  for (const input of [
    [],
    [{ id: "nix", size: "XS", qty: 1 }],
    [{ ...cart[0], qty: 0 }],
    [{ ...cart[0], qty: 1.1 }],
    [{ ...cart[0], qty: 11 }],
    [
      { ...cart[0], qty: 6 },
      { ...cart[0], size: "L", qty: 6 },
    ],
  ])
    assert.throws(() => normalizeCart(input));
});
test("database reserves once per request; changed cart conflicts", async () => {
  const id = crypto.randomUUID(),
    a = await db().reserve(id, cart),
    b = await db().reserve(id, cart);
  assert.equal(a.id, b.id);
  await assert.rejects(
    db().reserve(id, [{ ...cart[0], qty: 2 }]),
    /request_conflict/,
  );
  const r = await pg.query(
    "select reserved from merch_editions where product_id='nix'",
  );
  assert.equal(r.rows[0].reserved, 1);
});
test("all sizes share cap; more than100 requests cannot oversell", async () => {
  const attempts = await Promise.allSettled(
    Array.from({ length: 110 }, (_, i) =>
      db().reserve(crypto.randomUUID(), [
        { id: "nix", size: ["S", "M", "L", "XL", "2XL", "3XL"][i % 6], qty: 1 },
      ]),
    ),
  );
  assert.equal(attempts.filter((x) => x.status === "fulfilled").length, 100);
  const r = await pg.query(
    "select reserved,sold from merch_editions where product_id='nix'",
  );
  assert.deepEqual(r.rows[0], { reserved: 100, sold: 0 });
});
test("two-product reservation rolls back fully when second product is full", async () => {
  await pg.exec("update merch_editions set sold=100 where product_id='rook'");
  await assert.rejects(
    db().reserve(crypto.randomUUID(), [
      { id: "nix", size: "S", qty: 1 },
      { id: "rook", size: "S", qty: 1 },
    ]),
    /edition_sold_out/,
  );
  assert.equal(
    (
      await pg.query(
        "select reserved from merch_editions where product_id='nix'",
      )
    ).rows[0].reserved,
    0,
  );
});
test("database independently rejects malformed carts and anonymous access", async () => {
  await assert.rejects(
    db().reserve(crypto.randomUUID(), [{ id: "nix", size: "XS", qty: 1 }]),
    /invalid_cart/,
  );
  await assert.rejects(
    db().reserve(crypto.randomUUID(), [{ ...cart[0], qty: 0 }]),
    /invalid_cart/,
  );
  const r = await pg.query(
    "select has_table_privilege('anon','merch_orders','SELECT') as readable,has_function_privilege('anon','merch_reserve(uuid,jsonb)','EXECUTE') as executable",
  );
  assert.deepEqual(r.rows[0], { readable: false, executable: false });
});
test("test checkout uses server15000 prices, US address, stable retry params after lost response", async () => {
  const f = fixture(),
    id = crypto.randomUUID();
  f.loseNextResponse();
  await assert.rejects(
    f.service.checkout({ requestId: id, items: cart }),
    /lost-response/,
  );
  await f.service.checkout({ requestId: id, items: cart });
  assert.deepEqual(f.created[0], f.created[1]);
  assert.deepEqual(
    f.created[0].params.shipping_address_collection.allowed_countries,
    ["US"],
  );
  assert.equal(f.created[0].params.line_items[0].price_data.unit_amount, 15000);
  assert.equal(f.sessions.size, 1);
  assert.equal(
    (
      await pg.query(
        "select reserved from merch_editions where product_id='nix'",
      )
    ).rows[0].reserved,
    1,
  );
});
test("repeated payment deliveries produce one held order, one sold unit, one event", async () => {
  const f = fixture();
  await f.service.checkout({ requestId: crypto.randomUUID(), items: cart });
  const s = f.paid(),
    event = {
      id: "evt_fixture",
      type: "checkout.session.completed",
      data: { object: { id: s.id } },
    };
  await Promise.all([f.service.webhook(event), f.service.webhook(event)]);
  assert.deepEqual(
    (
      await pg.query(
        "select reserved,sold from merch_editions where product_id='nix'",
      )
    ).rows[0],
    { reserved: 0, sold: 1 },
  );
  assert.equal(
    (await pg.query("select status from merch_orders")).rows[0].status,
    "paid_hold",
  );
  assert.equal(
    (await pg.query("select count(*)::int as n from merch_stripe_events"))
      .rows[0].n,
    1,
  );
});
test("unpaid completion cannot consume or manufacture stock", async () => {
  const f = fixture();
  await f.service.checkout({ requestId: crypto.randomUUID(), items: cart });
  const s = [...f.sessions.values()][0];
  s.status = "complete";
  assert.deepEqual(await f.service.reconcile(s.id), { pending: true });
  assert.equal((await f.store.get(s.metadata.order_id)).status, "reserved");
});
test("signed expired-unpaid state releases once; late duplicate expiry cannot release paid units", async () => {
  const f = fixture();
  await f.service.checkout({ requestId: crypto.randomUUID(), items: cart });
  const s = [...f.sessions.values()][0];
  s.status = "expired";
  await f.service.reconcile(s.id);
  await f.service.reconcile(s.id);
  assert.equal(
    (
      await pg.query(
        "select reserved from merch_editions where product_id='nix'",
      )
    ).rows[0].reserved,
    0,
  );
  const g = fixture();
  await g.service.checkout({ requestId: crypto.randomUUID(), items: cart });
  const paid = g.paid();
  await g.service.reconcile(paid.id);
  await g.store.release(paid.metadata.order_id, paid.id);
  assert.equal((await g.store.get(paid.metadata.order_id)).status, "paid_hold");
});
test("paid event can recover missing session binding after storage interruption", async () => {
  const f = fixture();
  await f.service.checkout({ requestId: crypto.randomUUID(), items: cart });
  const s = f.paid();
  await pg.query("update merch_orders set session_id=null where id=$1", [
    s.metadata.order_id,
  ]);
  await f.service.reconcile(s.id);
  assert.equal((await f.store.get(s.metadata.order_id)).session_id, s.id);
});
test("wrong amount, item, currency, country, live mode and other-session binding are held for review", async () => {
  for (const mutate of [
    (s) => (s.amount_subtotal = 1),
    (s) => (s.line_items.data[0].price.product.metadata.size = "L"),
    (s) => (s.currency = "eur"),
    (s) => (s.collected_information.shipping_details.address.country = "CA"),
    (s) => (s.livemode = true),
    (s) => (s.client_reference_id = crypto.randomUUID()),
  ]) {
    const f = fixture();
    await f.service.checkout({ requestId: crypto.randomUUID(), items: cart });
    const s = f.paid();
    mutate(s);
    await assert.rejects(f.service.reconcile(s.id));
    assert.equal((await f.store.get(s.metadata.order_id)).status, "reserved");
  }
});
test("live key and closed switch fail before database/payment calls", async () => {
  for (const e of [
    { ...env, MERCH_CHECKOUT_ENABLED: "false" },
    { ...env, MERCH_STRIPE_SECRET_KEY: "sk_live_fixture" },
  ]) {
    const s = createService({
      env: e,
      db: { reserve: () => assert.fail("DB called") },
      stripe: {},
    });
    await assert.rejects(
      s.checkout({ requestId: crypto.randomUUID(), items: cart }),
    );
  }
});
test("test order can produce mapped dry-run payload but never calls real manufacturing", async () => {
  const f = fixture();
  await f.service.checkout({ requestId: crypto.randomUUID(), items: cart });
  const s = f.paid();
  await f.service.reconcile(s.id);
  const order = await f.store.get(s.metadata.order_id),
    e = {
      MERCH_APLIIQ_NIX_M: "APQ-123S1A1",
      MERCH_FULFILLMENT_ENABLED: "true",
      MERCH_SAMPLES_APPROVED: "true",
      MERCH_APLIIQ_PROTOCOL_VERIFIED: "true",
    };
  const payload = buildPayload(order, e);
  assert.equal(payload.line_items[0].sku, "APQ-123S1A1");
  assert.equal(payload.shipping_address.country_code, "US");
  await assert.rejects(
    submit(order, e, () => assert.fail("real network called")),
    /disabled/,
  );
  assert.throws(() => buildPayload(order, {}), /SKU/);
});
test("supplier adapter checks status200 only; pending202 is not success", async () => {
  const order = {
    id: crypto.randomUUID(),
    order_number: 1,
    environment: "live",
    status: "submitting",
    cart,
    customer: {
      name: "Test Name",
      address: {
        line1: "123 Test",
        city: "Los Angeles",
        state: "CA",
        postal_code: "90001",
        country: "US",
      },
    },
  };
  const e = {
    MERCH_APLIIQ_NIX_M: "APQ-123S1A1",
    APLIIQ_APP_ID: "fixture",
    APLIIQ_SHARED_SECRET: "fixture",
    MERCH_FULFILLMENT_ENABLED: "true",
    MERCH_SAMPLES_APPROVED: "true",
    MERCH_APLIIQ_PROTOCOL_VERIFIED: "true",
  };
  await assert.rejects(
    submit(order, e, async () => ({ status: 202 })),
    /reconciliation/,
  );
  assert.deepEqual(
    await submit(order, e, async () => ({
      status: 200,
      json: async () => ({ id: 123 }),
    })),
    { providerOrderId: "123" },
  );
});
test("supplier signatures reject altered tracking bytes and wrong length", () => {
  const raw = Buffer.from('{"fulfillment":{}}'),
    secret = "fixture",
    signature = crypto
      .createHmac("sha256", secret)
      .update(raw.toString("base64"))
      .digest("base64");
  assert.equal(verifyTracking(raw, signature, secret), true);
  assert.equal(verifyTracking(Buffer.from("{}"), signature, secret), false);
  assert.equal(verifyTracking(raw, "x", secret), false);
  assert.equal(
    sign("{}", "id", "secret", { timestamp: 1, nonce: "nonce" }),
    sign("{}", "id", "secret", { timestamp: 1, nonce: "nonce" }),
  );
});
