// Almano enrollment (in-world form on /almano). Same pattern as season-pass:
// the applicant is written to the durable lead store FIRST, then a confirmation
// goes to the applicant and a note to Brandon through Resend. Idempotent on email.
"use strict";

const leadStore = require("./_lead-store.js");
const ORIGINS = new Set(["https://vnmsfx.com", "https://www.vnmsfx.com"]);

const { confirmation } = require("./_almano-copy.js");
const unsub = require("./_unsub.js");

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const reply = (status, body) => res.status(status).json(body);
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return reply(405, { ok: false, error: "POST only" }); }
  const origin = req.headers.origin;
  if (origin && !ORIGINS.has(origin) && !(process.env.NODE_ENV !== "production" && /^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(origin))) {
    return reply(403, { ok: false, error: "Please enroll from vnmsfx.com." });
  }
  let body = req.body;
  try {
    if (typeof body === "string") { if (Buffer.byteLength(body) > 4000) return reply(413, { ok: false, error: "Too long." }); body = JSON.parse(body); }
    if (!body || Array.isArray(body) || typeof body !== "object") throw new Error("body");
  } catch { return reply(400, { ok: false, error: "Please check the form and try again." }); }
  if (body.company_website) return reply(200, { ok: true, applicationId: "ALM-0000-0000" }); // honeypot

  const clean = (v, n) => String(v || "").trim().slice(0, n).replace(/[<>\r\n]/g, "");
  const name = clean(body.name, 80);
  const kin = clean(body.kin, 80);
  const birthYear = clean(body.birthYear, 4);
  const day = clean(body.day, 3);
  const email = String(body.email || "").trim().toLowerCase().slice(0, 254);
  if (!name || !kin || !/^\d{4}$/.test(birthYear)) return reply(400, { ok: false, error: "A Steward cannot file an incomplete application." });
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/.test(email)) return reply(400, { ok: false, error: "That email doesn't look right." });

  const now = new Date();
  const key = process.env.RESEND_API_KEY;
  if (!leadStore.configured() || !key) return reply(503, { ok: false, error: "The enrollment office is closed right now. Please try again later." });

  const fingerprint = Math.abs(Array.from(email + "|almano").reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7)).toString(36).slice(0, 6).toUpperCase();
  const applicationId = "ALM-" + now.toISOString().slice(0, 4) + "-" + fingerprint.slice(0, 4);
  const submissionId = "ALM-" + now.toISOString().slice(0, 10).replace(/-/g, "") + "-" + fingerprint;

  let saved;
  try {
    saved = await leadStore.createLead({
      submissionId, fingerprint, firstName: name, email,
      channelLabel: "Almano Enrollment", process: "Series audience · in-world form",
      points: 0, answered: 0, financeTouched: false,
      notedText: "Almano enrollment · " + applicationId + " · born " + birthYear + " · kin: " + kin + " · day " + (day || "—"),
      transcriptText: "Applied to Almano from " + String(body.page || "/almano") + "\nName: " + name + "\nYear of birth: " + birthYear + "\nNext of kin: " + kin + "\nDay of review: " + (day || "—") + "\nApplication: " + applicationId,
      replyDueIso: now.toISOString(), receivedIso: now.toISOString(),
      source: "almano", campaign: "almano-enrollment", contentId: "almano", surveyVersion: "almano-v1",
    });
  } catch (e) { console.error("almano persist failed", e && e.message); }
  if (!saved || !saved.persisted) return reply(503, { ok: false, error: "Almano could not file your application. Please try again." });
  if (saved.duplicate) return reply(200, { ok: true, duplicate: true, applicationId });

  const send = (payload, idem) => fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: "Bearer " + key, "Content-Type": "application/json", "Idempotency-Key": "almano/" + idem },
    signal: AbortSignal.timeout(10000),
    body: JSON.stringify(payload),
  });
  const m = confirmation({ name, applicationId, kin, birthYear, day, unsubscribeUrl: unsub.url(email) });
  try { await send({ from: "Almano <brandon@vnmsfx.com>", to: [email], reply_to: "brandon@vnmsfx.com", subject: m.subject, text: m.text, html: m.html, headers: { "List-Unsubscribe": "<" + unsub.url(email) + ">" } }, fingerprint + "/confirm"); }
  catch (e) { console.error("almano confirm send failed", e && e.message); }
  try { await send({ from: "Almano <brandon@vnmsfx.com>", to: ["brandon@vnmsfx.com"], subject: "Almano enrollment · " + applicationId + " · " + name, text: "New Almano application\n\n" + name + " (" + email + ")\nBorn " + birthYear + "\nNext of kin: " + kin + "\nDay " + (day || "—") + "\n" + applicationId }, fingerprint + "/note"); }
  catch (e) { console.error("almano note send failed", e && e.message); }

  return reply(200, { ok: true, applicationId });
};
