const test = require('node:test');
const assert = require('node:assert/strict');

process.env.RESEND_API_KEY = 'stub-resend-key';

const leadStore = require('./_lead-store.js');
const handler = require('./leak-check.js');

function response() {
  return {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = value; return this; },
  };
}

function request(body) {
  return { method: 'POST', query: {}, body };
}

function completeBody(overrides) {
  return Object.assign({
    firstName: 'Dana',
    email: 'dana@example.com',
    channel: 'direct',
    answers: [0, 1, 2, 0, 1, 2, 0, 1, 2, 'na'],
    attribution: {
      utm_source: 'apollo',
      utm_medium: 'email',
      utm_campaign: 'aug24-wave1',
      utm_content: 'example-brand',
      utm_term: 'quiet-accounts',
      ref: 'cold-email',
    },
    funnelEvents: {
      leak_check_start: '2026-08-24T14:00:00.000Z',
      leak_check_complete: '2026-08-24T14:04:00.000Z',
      leak_check_email_submit: '2026-08-24T14:04:30.000Z',
    },
    surveyVersion: 'v4-2026-08-24',
    page: 'leak-check',
  }, overrides || {});
}

test('complete submission persists every answer, attribution and milestone before email', async () => {
  const order = [];
  let stored = null;
  let deliveryPatch = null;
  leadStore.createLead = async (lead) => {
    order.push('persist');
    stored = lead;
    return { persisted: true, duplicate: false, recordId: 'lead-1' };
  };
  leadStore.markDelivery = async (_id, patch) => { deliveryPatch = patch; return true; };
  global.fetch = async (url) => {
    assert.equal(url, 'https://api.resend.com/emails');
    order.push('email');
    return { ok: true, status: 200, json: async () => ({ id: 'message-' + order.length }) };
  };

  const res = response();
  await handler(request(completeBody()), res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.ok, true);
  assert.equal(res.body.leadPersisted, true);
  assert.deepEqual(order, ['persist', 'email', 'email']);
  assert.ok(stored, 'the durable lead should be written');
  assert.equal(stored.answered, 9, 'one valid not-applicable answer is excluded from scoring');
  assert.equal((stored.transcriptText.match(/  Q: /g) || []).length, 10, 'all ten scored questions survive');
  assert.match(stored.transcriptText, /utm_source=apollo/);
  assert.match(stored.transcriptText, /utm_medium=email/);
  assert.match(stored.transcriptText, /utm_term=quiet-accounts/);
  assert.match(stored.transcriptText, /leak_check_start=2026-08-24T14:00:00.000Z/);
  assert.match(stored.transcriptText, /leak_check_complete=2026-08-24T14:04:00.000Z/);
  assert.match(stored.transcriptText, /leak_check_email_submit=2026-08-24T14:04:30.000Z/);
  assert.equal(stored.source, 'apollo');
  assert.equal(stored.medium, 'email');
  assert.equal(stored.campaign, 'aug24-wave1');
  assert.equal(stored.contentId, 'example-brand');
  assert.equal(stored.term, 'quiet-accounts');
  assert.equal(stored.ref, 'cold-email');
  assert.match(stored.replyDueIso, /^\d{4}-\d{2}-\d{2}T/);
  assert.equal(deliveryPatch.status, 'RECEIPT SENT');
});

test('partial answer arrays fail closed before persistence or email', async () => {
  let called = false;
  leadStore.createLead = async () => { called = true; return { persisted: true }; };
  global.fetch = async () => { called = true; throw new Error('should not send'); };
  const res = response();
  await handler(request(completeBody({ answers: [0, 1] })), res);
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.error, 'all 10 scored answers required');
  assert.equal(called, false);
});

test('an unavailable lead store fails closed before provider email', async () => {
  let emailed = false;
  leadStore.createLead = async () => ({ persisted: false, reason: 'not configured' });
  global.fetch = async () => { emailed = true; throw new Error('should not send'); };
  const res = response();
  await handler(request(completeBody()), res);
  assert.equal(res.statusCode, 503);
  assert.equal(res.body.error, 'lead storage unavailable');
  assert.equal(emailed, false);
});
