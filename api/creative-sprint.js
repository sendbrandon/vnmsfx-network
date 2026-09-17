'use strict';

const { createHash } = require('node:crypto');
const leadStore = require('./_lead-store.js');
const drops = require('./_drops.js');
const FIELDS = { name: 80, email: 254, product: 200, goal: 1400, deadline: 150, rate: 20, drop: 60 };
const ORIGINS = new Set(['https://vnmsfx.com', 'https://www.vnmsfx.com']);

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const reply = (status, body) => res.status(status).json(body);
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return reply(405, { ok: false, error: 'Use the project form to send a brief.' });
  }
  // Reject cross-site browser submissions. Local verification uses a loopback host.
  const origin = req.headers.origin;
  if (origin && !ORIGINS.has(origin) && !(process.env.NODE_ENV !== 'production' && /^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(origin))) {
    return reply(403, { ok: false, error: 'Please submit the form from vnmsfx.com.' });
  }
  if (!/^application\/json(?:;|$)/i.test(req.headers['content-type'] || '')) {
    return reply(415, { ok: false, error: 'Please use the form on the page.' });
  }
  let body = req.body;
  try {
    if (typeof body === 'string') {
      if (Buffer.byteLength(body) > 12000) return reply(413, { ok: false, error: 'Please shorten your brief.' });
      body = JSON.parse(body);
    }
    if (!body || Array.isArray(body) || typeof body !== 'object') throw new Error('body');
  } catch {
    return reply(400, { ok: false, error: 'Please check the form and try again.' });
  }
  if (body.company_website) return reply(400, { ok: false, error: 'Unable to accept this submission.' });
  const data = {};
  for (const [key, max] of Object.entries(FIELDS)) {
    const value = body[key] === undefined && ['name', 'deadline', 'rate', 'drop'].includes(key) ? '' : body[key];
    if (typeof value !== 'string' || value.length > max) {
      return reply(400, { ok: false, error: 'Please check the form fields and their lengths.' });
    }
    data[key] = value.trim();
  }
  if (!data.product || !data.goal || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/.test(data.email) || /[\r\n]/.test(data.name)) {
    return reply(400, { ok: false, error: 'Please add your email, product and goal.' });
  }
  data.email = data.email.toLowerCase();
  if (!leadStore.configured() || !process.env.RESEND_API_KEY) {
    return reply(503, { ok: false, error: 'The form is unavailable right now. Please email your brief to Brandon.' });
  }
  const hash = createHash('sha256').update(JSON.stringify(data)).digest('hex').slice(0, 24).toUpperCase();
  const submissionId = 'CS-' + hash;
  const now = new Date();
  // The drop rate is decided HERE by the clock, never by the browser: a "rate=drop"
  // request outside a window is recorded as a list-price inquiry that asked.
  const askedDropRate = data.rate === 'drop';
  const windowOpen = drops.rateOpen(now);
  const dropRate = askedDropRate && windowOpen;
  const price = dropRate ? drops.DROP_RATE : drops.LIST_RATE;
  const text = [
    'CREATIVE SPRINT INQUIRY — $' + price.toLocaleString('en-US') + (dropRate ? ' (DROP RATE — window open, ' + (drops.current(now) || {}).id + ')' : askedDropRate ? ' (asked for the drop rate OUTSIDE a window — list price applies)' : ''),
    'Reference: ' + submissionId,
    'Name: ' + (data.name || 'Not provided') + '\nEmail: ' + data.email,
    'Brand / product:\n' + data.product,
    'Audience / goal:\n' + data.goal,
    'Ideal deadline:\n' + (data.deadline || 'To be agreed'),
    'Next action: Review the brief and reply personally. Agree the project, usage, cancellation terms and delivery date before payment.',
    'Submitted through vnmsfx.com/creative-sprint. This is an inquiry, not a paid booking.'
  ].join('\n\n');
  let saved;
  try {
    saved = await leadStore.createLead({
      submissionId, fingerprint: hash, firstName: data.name, email: data.email,
      channelLabel: dropRate ? 'Creative Sprint · DROP RATE $' + drops.DROP_RATE : 'Creative Sprint', process: 'Review creative brief', points: 0, answered: 0,
      financeTouched: false, notedText: (dropRate ? 'DROP RATE $' + drops.DROP_RATE + ' — window open at submission. ' : askedDropRate ? 'Asked for drop rate outside a window — list price. ' : '') + 'Creative Sprint inquiry — not a paid booking', transcriptText: text,
      // An internal follow-up task, not a promised customer response SLA.
      replyDueIso: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      receivedIso: now.toISOString(), source: 'creative-sprint', campaign: 'creative-sprint-20260914',
      contentId: 'landing-page', surveyVersion: 'creative-sprint-v1'
    });
  } catch {
    console.error('Creative Sprint inquiry storage failed');
  }
  if (!saved?.persisted) return reply(503, { ok: false, error: 'Your brief could not be saved. Please try again or email Brandon.' });

  // Repeated requests keep the same payload/key. Resend deduplicates for 24h.
  // Persisted is independent of notified: a provider failure cannot erase a lead.
  let notificationSent = false;
  let notificationId;
  try {
    const sent = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + process.env.RESEND_API_KEY,
        'Content-Type': 'application/json',
        'Idempotency-Key': 'creative-sprint/' + hash
      },
      signal: AbortSignal.timeout(10000),
      body: JSON.stringify({
        from: 'VNMSFX Creative Sprint <brandon@vnmsfx.com>', to: ['brandon@vnmsfx.com'],
        reply_to: data.email, subject: '[Creative Sprint' + (dropRate ? ' · DROP RATE $' + drops.DROP_RATE : '') + '] ' + (data.name || data.email), text
      })
    });
    const result = await sent.json().catch(() => null);
    notificationSent = sent.ok && typeof result?.id === 'string';
    notificationId = notificationSent ? result.id : undefined;
  } catch {
    console.error('Creative Sprint notification unavailable; inquiry is stored');
  }
  await leadStore.markDelivery(saved.recordId, {
    status: 'NEW', leadMessageId: notificationId,
    note: notificationSent ? 'Creative brief saved; Brandon notification accepted by email provider.' : 'Creative brief saved; check the lead record because the notification was not confirmed.'
  }).catch(() => false);
  return reply(notificationSent ? 200 : 202, {
    ok: true, persisted: true, notificationSent, submissionId, price, dropRate
  });
};
