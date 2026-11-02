'use strict';

// VNMSFX Originals — new-episode list. Same contract as the Bad Luck Club:
// the subscriber is written to the existing private lead store first, and the
// page only shows success after that write is confirmed. No email is sent from
// here; Season Pass mailings filter on their own channel and never reach these
// records.

const {createHash} = require('node:crypto');
const leadStore = require('./_lead-store.js');
const SHOWS = {satire: 'Satire side quests', horror: 'Horror side quests', saints: 'Saints of Bad Luck'};
// VIP is a reservation only: no payment is taken here and nothing is promised beyond first contact.
const TIERS = {free: 'Free — new episodes by email', vip: 'VIP reservation — $4.99/mo, no charge taken'};
const ORIGINS = new Set(['https://vnmsfx.com', 'https://www.vnmsfx.com']);
const MAX_BYTES = 4000;

function allowedOrigin(origin) {
  if (ORIGINS.has(origin)) return true;
  if (process.env.VERCEL_URL && origin === 'https://' + process.env.VERCEL_URL) return true;
  return process.env.NODE_ENV !== 'production' && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin || '');
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  const reply = (status, body) => res.status(status).json(body);
  if (req.method === 'GET') return reply(200, {acceptingSubscribers: leadStore.configured()});
  if (req.method !== 'POST') { res.setHeader('Allow', 'GET, POST'); return reply(405, {ok: false, error: 'Please use the sign-up form.'}); }
  if (req.headers.origin && !allowedOrigin(req.headers.origin)) return reply(403, {ok: false, error: 'Please sign up from vnmsfx.com.'});
  if (!/^application\/json(?:;|$)/i.test(req.headers['content-type'] || '')) return reply(415, {ok: false, error: 'Please use the sign-up form on the page.'});
  let body = req.body;
  try {
    if (Buffer.byteLength(typeof body === 'string' ? body : JSON.stringify(body) || '') > MAX_BYTES) return reply(413, {ok: false, error: 'That was too long. Please try again.'});
    if (typeof body === 'string') body = JSON.parse(body);
    if (!body || Array.isArray(body) || typeof body !== 'object') throw new Error('body');
  } catch { return reply(400, {ok: false, error: 'Please check the form and try again.'}); }
  if (body.company_website) return reply(400, {ok: false, error: 'We couldn’t accept this sign-up.'});
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/.test(email)) return reply(400, {ok: false, error: 'That email doesn’t look right.'});
  const shows = Array.isArray(body.shows) ? [...new Set(body.shows)].sort() : null;
  if (!shows || !shows.length || shows.length > 3 || shows.some(show => typeof show !== 'string' || !Object.hasOwn(SHOWS, show))) return reply(400, {ok: false, error: 'Pick at least one kind of episode.'});
  const tier = body.tier == null ? 'free' : body.tier;
  if (typeof tier !== 'string' || !Object.hasOwn(TIERS, tier)) return reply(400, {ok: false, error: 'Please choose Free or VIP.'});
  if (!leadStore.configured()) return reply(503, {ok: false, error: 'Sign-ups are down for a moment. You haven’t been added. Try again later, or email brandon@vnmsfx.com.'});
  const fingerprint = createHash('sha256').update('originals-v1|' + tier + '|' + email).digest('hex').slice(0, 32).toUpperCase();
  const submissionId = (tier === 'vip' ? 'VIP-' : 'VO-') + fingerprint;
  const now = new Date();
  const source = typeof body.source === 'string' ? body.source.slice(0, 120) : 'originals';
  let saved;
  try {
    saved = await leadStore.createLead({
      submissionId, fingerprint, firstName: '—', email,
      channelLabel: tier === 'vip' ? 'VNMSFX Originals VIP' : 'VNMSFX Originals', process: tier === 'vip' ? 'Contact when VIP opens' : 'Email when a new episode is out',
      points: 0, answered: 1, financeTouched: false,
      notedText: TIERS[tier] + ' · ' + shows.map(show => SHOWS[show]).join('; '),
      transcriptText: [
        'VNMSFX ORIGINALS — NEW EPISODE LIST',
        'Email: ' + email,
        'Tier: ' + TIERS[tier],
        'Wants: ' + shows.map(show => SHOWS[show]).join('; '),
        'Consent: may email when a new episode is out (originals-v1).',
        'Signed up from: ' + source
      ].join('\n\n'),
      replyDueIso: now.toISOString(), receivedIso: now.toISOString(),
      source, campaign: tier === 'vip' ? 'originals-vip-reserve' : 'originals-new-episodes', contentId: tier + ':' + shows.join('+'), surveyVersion: 'originals-v1'
    });
  } catch { console.error('Originals sign-up storage failed'); }
  if (!saved?.persisted) return reply(503, {ok: false, error: 'We couldn’t confirm you were added. Please try again, or email brandon@vnmsfx.com.'});
  return reply(200, {ok: true, persisted: true, tier, duplicate: !!saved.duplicate});
};
