'use strict';

const {createHash} = require('node:crypto');
const leadStore = require('./_lead-store.js');
const ROLES = {share: 'Share the film', gather: 'Get people watching', create: 'Make something', explore: 'Talk story and characters'};
const ORIGINS = new Set(['https://vnmsfx.com', 'https://www.vnmsfx.com']);
const MAX_BYTES = 12000;

function allowedOrigin(origin) {
  if (ORIGINS.has(origin)) return true;
  // Only this deployment's Vercel-generated hostname; never accept arbitrary previews.
  if (process.env.VERCEL_URL && origin === 'https://' + process.env.VERCEL_URL) return true;
  return process.env.NODE_ENV !== 'production' && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin || '');
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  const reply = (status, body) => res.status(status).json(body);
  if (req.method === 'GET') return reply(200, {acceptingApplications: leadStore.configured()});
  if (req.method !== 'POST') { res.setHeader('Allow', 'GET, POST'); return reply(405, {ok: false, error: 'Please use the club application form.'}); }
  if (req.headers.origin && !allowedOrigin(req.headers.origin)) return reply(403, {ok: false, error: 'Please send your application from vnmsfx.com.'});
  if (!/^application\/json(?:;|$)/i.test(req.headers['content-type'] || '')) return reply(415, {ok: false, error: 'Please use the application form on the page.'});
  let body = req.body;
  try {
    if (Buffer.byteLength(typeof body === 'string' ? body : JSON.stringify(body) || '') > MAX_BYTES) return reply(413, {ok: false, error: 'Please shorten your answers and try again.'});
    if (typeof body === 'string') body = JSON.parse(body);
    if (!body || Array.isArray(body) || typeof body !== 'object') throw new Error('body');
  } catch { return reply(400, {ok: false, error: 'Please check your answers and try again.'}); }
  if (body.company_website) return reply(400, {ok: false, error: 'We couldn’t accept this application.'});
  const data = {};
  for (const [key, max] of Object.entries({name: 80, email: 254, moment: 1400, social: 300})) {
    const value = body[key] ?? (key === 'social' ? '' : null);
    if (typeof value !== 'string' || value.length > max) return reply(400, {ok: false, error: 'Please check your answers and their lengths.'});
    data[key] = value.trim();
  }
  if (!data.name || /[\r\n\x00-\x1f]/.test(data.name) || !data.moment || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/.test(data.email)) return reply(400, {ok: false, error: 'Please add your name, a valid email, and what stayed with you.'});
  if (!Array.isArray(body.roles) || !body.roles.length || body.roles.length > 4 || body.roles.some(role => typeof role !== 'string' || !Object.hasOwn(ROLES, role))) return reply(400, {ok: false, error: 'Choose at least one way you would enjoy taking part.'});
  if (body.consent !== true) return reply(400, {ok: false, error: 'Please allow us to email you about your application.'});
  data.email = data.email.toLowerCase();
  data.roles = [...new Set(body.roles)].sort();
  if (!leadStore.configured()) return reply(503, {ok: false, error: 'Applications are temporarily unavailable. Your answers haven’t been saved. Please try again later or email brandon@vnmsfx.com.'});
  const fingerprint = createHash('sha256').update('saints-club-v1|' + JSON.stringify(data)).digest('hex').slice(0, 32).toUpperCase();
  const submissionId = 'BLC-' + fingerprint;
  const now = new Date();
  const transcript = [
    'BAD LUCK CLUB — FOUNDING AUDIENCE APPLICATION',
    'Name: ' + data.name, 'Email: ' + data.email,
    'What stayed with them:\n' + data.moment,
    'Ways to participate: ' + data.roles.map(role => ROLES[role]).join('; '),
    'Social / community: ' + (data.social || 'Not provided'),
    'Consent: may email about application and club participation (saints-club-v1).',
    'Application only. No admission, payment, paid episode access, or newsletter enrollment.',
    'Next action: Review for the founding audience and contact selected applicants.'
  ].join('\n\n');
  let saved;
  try {
    saved = await leadStore.createLead({
      submissionId, fingerprint, firstName: data.name, email: data.email,
      channelLabel: 'Bad Luck Club', process: 'Review founding audience application',
      points: 0, answered: 4, financeTouched: false,
      notedText: data.roles.map(role => ROLES[role]).join('; '), transcriptText: transcript,
      replyDueIso: new Date(now.getTime() + 86400000).toISOString(),
      receivedIso: now.toISOString(), source: 'saints-of-bad-luck/club', campaign: 'saints-founding-audience',
      contentId: 'club-application', surveyVersion: 'saints-club-v1'
    });
  } catch { console.error('Bad Luck Club application storage failed'); }
  if (!saved?.persisted) return reply(503, {ok: false, error: 'We couldn’t confirm your application was saved. Please try again, or email brandon@vnmsfx.com.'});
  return reply(200, {ok: true, persisted: true, submissionId});
};
