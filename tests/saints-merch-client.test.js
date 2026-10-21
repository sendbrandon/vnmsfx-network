"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createMerchClient } = require("../src/saints-merch-client");
test("lost response reuses request ID and strips browser-supplied prices", async () => {
  const store = new Map(),
    requests = [];
  let n = 0;
  const c = createMerchClient({
    uuid: () => String(++n),
    storage: {
      getItem: (k) => store.get(k),
      setItem: (k, v) => store.set(k, v),
    },
    fetchImpl: async (_url, req) => {
      requests.push(JSON.parse(req.body));
      if (requests.length === 1) throw new Error("network");
      return {
        ok: true,
        json: async () => ({ url: "https://checkout.stripe.com/c/pay/test" }),
      };
    },
  });
  const items = [{ id: "nix", size: "M", qty: 1, price: 1 }];
  await assert.rejects(c.checkout(items), /network/);
  assert.match(await c.checkout(items), /^https:/);
  assert.deepEqual(requests[0], requests[1]);
  assert.equal(requests[0].items[0].price, undefined);
  await c.checkout([{ ...items[0], qty: 2 }]);
  assert.notEqual(requests[2].requestId, requests[0].requestId);
});
test("client never redirects to an arbitrary response URL", async () => {
  const c = createMerchClient({
    uuid: () => "fixture",
    storage: { getItem: () => null, setItem: () => {} },
    fetchImpl: async () => ({
      ok: true,
      json: async () => ({ url: "https://attacker.example.com" }),
    }),
  });
  await assert.rejects(
    c.checkout([{ id: "nix", size: "M", qty: 1 }]),
    /destination/,
  );
});
