const test = require("node:test");
const assert = require("node:assert/strict");
const { save } = require("../assets/hoodies/signup-client");
const payload = {
  email: "qa@example.com",
  product: "rook",
  size: "S",
  consent: true,
  company_website: "",
};
test("signup sends exact selection and only accepts a durable confirmation", async () => {
  let sent;
  const receipt = await save(payload, async (url, options) => {
    sent = { url, options };
    return { ok: true, json: async () => ({ ok: true, persisted: true }) };
  });
  assert.equal(sent.url, "/api/saints-merch?action=early-access");
  assert.deepEqual(JSON.parse(sent.options.body), payload);
  assert.deepEqual(receipt, { product: "rook", size: "S" });
});
test("a 200 without durable persistence cannot produce a success receipt", async () => {
  await assert.rejects(
    save(payload, async () => ({
      ok: true,
      json: async () => ({ ok: true, persisted: false }),
    })),
    /could not confirm/,
  );
});
test("server errors, malformed JSON, and network failures remain retryable errors", async () => {
  await assert.rejects(
    save(payload, async () => ({
      ok: false,
      json: async () => ({ ok: false, error: "Try again later" }),
    })),
    /Try again later/,
  );
  await assert.rejects(
    save(payload, async () => ({
      ok: true,
      json: async () => {
        throw Error("bad json");
      },
    })),
    /temporarily unavailable/,
  );
  await assert.rejects(
    save(payload, async () => {
      throw Error("Network unavailable");
    }),
    /Network unavailable/,
  );
});
