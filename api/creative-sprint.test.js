'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const store = require('./_lead-store.js');
const handler = require('./creative-sprint.js');
const original = { createLead: store.createLead, markDelivery: store.markDelivery, configured: store.configured, fetch: global.fetch, key: process.env.RESEND_API_KEY };
const valid = { name: 'Buyer Example', email: 'buyer@example.com', product: 'Example product', goal: 'Launch an ad for our new product', deadline: 'To be agreed', company_website: '' };
let calls, mail, storageFails, notificationFails, duplicate;
test.beforeEach(() => {
  calls = []; mail = []; storageFails = false; notificationFails = false; duplicate = false;
  process.env.RESEND_API_KEY = 'test-only';
  store.configured = () => true;
  store.createLead = async lead => {
    calls.push({ kind: 'store', lead });
    if (storageFails) throw new Error('offline');
    return { persisted: true, recordId: 'test-record', duplicate };
  };
  store.markDelivery = async (id, patch) => { calls.push({ kind: 'mark', id, patch }); return true; };
  global.fetch = async (url, init) => {
    calls.push({ kind: 'email' }); mail.push({ url, init, body: JSON.parse(init.body) });
    return { ok: !notificationFails, json: async () => notificationFails ? { error: 'offline' } : { id: 'test-message' } };
  };
});
test.after(() => {
  Object.assign(store, { createLead: original.createLead, markDelivery: original.markDelivery, configured: original.configured });
  global.fetch = original.fetch;
  if (original.key === undefined) delete process.env.RESEND_API_KEY; else process.env.RESEND_API_KEY = original.key;
});
async function invoke(body = valid, overrides = {}) {
  const req = { method: 'POST', headers: { origin: 'https://vnmsfx.com', 'content-type': 'application/json' }, body, ...overrides };
  const res = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(s) { this.code = s; return this; }, json(b) { this.body = b; return this; } };
  await handler(req, res); return res;
}
test('valid brief is saved before one notification to Brandon and no visitor email', async () => {
  const res = await invoke();
  assert.equal(res.code, 200); assert.equal(res.body.persisted, true);
  assert.deepEqual(calls.map(x => x.kind), ['store', 'email', 'mark']);
  assert.equal(mail.length, 1); assert.deepEqual(mail[0].body.to, ['brandon@vnmsfx.com']);
  assert.equal(mail[0].body.reply_to, valid.email);
  assert.match(mail[0].body.text, /Brand \/ product:\nExample product\n\nAudience/);
  assert.equal(calls[0].lead.source, 'creative-sprint');
});
test('storage failure never sends or claims success', async () => {
  storageFails = true;
  const res = await invoke(); assert.equal(res.code, 503); assert.equal(res.body.ok, false); assert.equal(mail.length, 0);
});
test('the three-field public form accepts a brief without a name or separate deadline', async () => {
  const res = await invoke({ email: valid.email, product: valid.product, goal: valid.goal });
  assert.equal(res.code, 200);
  assert.equal(res.body.persisted, true);
  assert.equal(mail.length, 1);
  assert.equal(mail[0].body.reply_to, valid.email);
  assert.match(mail[0].body.text, /Name: Not provided/);
});
test('notification failure still reports the saved lead accurately', async () => {
  notificationFails = true;
  const res = await invoke(); assert.equal(res.code, 202); assert.equal(res.body.persisted, true); assert.equal(res.body.notificationSent, false);
});
test('retry after notification failure uses the same payload and idempotency key', async () => {
  notificationFails = true; await invoke();
  duplicate = true; notificationFails = false; const res = await invoke();
  assert.equal(res.body.notificationSent, true);
  assert.equal(mail[0].init.headers['Idempotency-Key'], mail[1].init.headers['Idempotency-Key']);
  assert.deepEqual(mail[0].body, mail[1].body);
});
test('invalid input and cross-site requests perform no writes', async () => {
  for (const body of [null, [], '{bad json', { ...valid, email: 'bad' }, { ...valid, name: 'x\nBcc: bad' }, { ...valid, goal: ' ' }, { ...valid, product: { nested: 'x' } }, { ...valid, goal: 'x'.repeat(1401) }, { ...valid, company_website: 'spam' }]) {
    const res = await invoke(body); assert.equal(res.body.ok, false);
  }
  assert.equal((await invoke(valid, { headers: { origin: 'https://unrelated.example', 'content-type': 'application/json' } })).code, 403);
  assert.equal(calls.length, 0);
});
test('missing configuration and unsupported requests do not pretend to accept', async () => {
  store.configured = () => false;
  assert.equal((await invoke()).code, 503);
  assert.equal((await invoke(valid, { method: 'GET' })).code, 405);
  assert.equal((await invoke(valid, { headers: { 'content-type': 'text/plain' } })).code, 415);
  assert.equal(calls.length, 0);
});
