// Season Pass — Vercel serverless function. Same pattern as leak-check:
// the subscriber is written to the durable lead store FIRST, then two emails
// go out through Resend: a welcome to the subscriber, a note to Brandon.
// Idempotent on email + drop, so a double-submit never creates two records.

"use strict";

const leadStore = require("./_lead-store.js");
const drops = require("./_drops.js");
const unsub = require("./_unsub.js");
const ORIGINS = new Set(["https://vnmsfx.com", "https://www.vnmsfx.com"]);

const { welcome } = require("./_season-pass-copy.js");

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const reply = (status, body) => res.status(status).json(body);
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return reply(405, { ok: false, error: "POST only" }); }
  const origin = req.headers.origin;
  if (origin && !ORIGINS.has(origin) && !(process.env.NODE_ENV !== "production" && /^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(origin))) {
    return reply(403, { ok: false, error: "Please join from vnmsfx.com." });
  }
  let body = req.body;
  try {
    if (typeof body === "string") { if (Buffer.byteLength(body) > 4000) return reply(413, { ok: false, error: "Too long." }); body = JSON.parse(body); }
    if (!body || Array.isArray(body) || typeof body !== "object") throw new Error("body");
  } catch { return reply(400, { ok: false, error: "Please check the form and try again." }); }
  if (body.company_website) return reply(200, { ok: true }); // honeypot

  const email = String(body.email || "").trim().toLowerCase().slice(0, 254);
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/.test(email)) return reply(400, { ok: false, error: "That email doesn't look right." });
  const firstName = String(body.firstName || "").trim().slice(0, 60).replace(/[<>\r\n]/g, "");
  const brand = String(body.brand || "").trim().slice(0, 80).replace(/[<>\r\n]/g, "");
  const dropId = String(body.drop || "").trim().slice(0, 60);
  const drop = drops.byId(dropId) || drops.DROPS[drops.DROPS.length - 1];
  const now = new Date();
  const rateOpen = drops.rateOpen(now);

  const key = process.env.RESEND_API_KEY;
  if (!leadStore.configured() || !key) return reply(503, { ok: false, error: "The list is unavailable right now. Email brandon@vnmsfx.com and I'll add you by hand." });

  // Idempotent on email + drop: the same person joining twice is one record.
  const fingerprint = Math.abs(Array.from(email + "|pass|" + drop.id).reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7)).toString(36).slice(0, 6).toUpperCase();
  const submissionId = "SP-" + now.toISOString().slice(0, 10).replace(/-/g, "") + "-" + fingerprint;

  let saved;
  try {
    saved = await leadStore.createLead({
      submissionId, fingerprint, firstName: firstName || "—", email,
      channelLabel: "Season Pass", process: "Send new ads and production notes",
      points: 0, answered: 0, financeTouched: false,
      notedText: "Season Pass" + (brand ? " · " + brand : "") + " · joined during " + drop.id + " · first-client saving subject to eligibility",
      transcriptText: "Joined the Season Pass from " + String(body.page || "/drops") + "\nBrand: " + (brand || "—") + "\nDrop: " + drop.id + "\nFirst-client saving: $500 on an eligible 15-second commercial; confirm eligibility before payment.",
      replyDueIso: drop.early, receivedIso: now.toISOString(),
      source: String(body.source || "drops").slice(0, 200), campaign: "season-pass", contentId: drop.id, surveyVersion: "season-pass-v1",
    });
  } catch (e) { console.error("season pass persist failed", e && e.message); }
  if (!saved || !saved.persisted) return reply(503, { ok: false, error: "Couldn't save that. Try again, or email brandon@vnmsfx.com." });
  if (saved.duplicate) return reply(200, { ok: true, duplicate: true, rateOpen, drop: drop.id });

  const send = (payload, idem) => fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: "Bearer " + key, "Content-Type": "application/json", "Idempotency-Key": "season-pass/" + idem },
    signal: AbortSignal.timeout(10000),
    body: JSON.stringify(payload),
  });

  const message = welcome({name:firstName,drop,unsubscribeUrl:unsub.url(email),now});
  let welcomeId = null, welcomeOk = false;
  try {
    const r = await send({
      from: "Brandon Adams <brandon@vnmsfx.com>", to: [email], reply_to: "brandon@vnmsfx.com",
      subject: message.subject, text: message.text, html: message.html,
      headers: { "List-Unsubscribe": "<" + unsub.url(email) + ">" },
    }, fingerprint + "/welcome");
    const d = await r.json().catch(() => null); welcomeOk = r.ok && !!(d && d.id); welcomeId = welcomeOk ? d.id : null;
  } catch (e) { console.error("welcome send failed", e && e.message); }

  try {
    await send({
      from: "VNMSFX Season Pass <brandon@vnmsfx.com>", to: ["brandon@vnmsfx.com"], reply_to: email,
      subject: "[Season Pass] " + (firstName || email) + (brand ? " · " + brand : ""),
      text: `New Season Pass subscriber\n\nName: ${firstName || "—"}\nBrand: ${brand || "—"}\nEmail: ${email}\nDrop: ${drop.id}\nFirst-client saving: $500, subject to eligibility\nFrom: ${String(body.page || "/drops")}\nReference: ${submissionId}\n\nWelcome email: ${welcomeOk ? "sent" : "FAILED — send by hand"}`,
    }, fingerprint + "/notify");
  } catch (e) { console.error("notify send failed", e && e.message); }

  await leadStore.markDelivery(saved.recordId, {
    status: welcomeOk ? "RECEIPT SENT" : "NEW", receiptMessageId: welcomeId, receiptDelivered: welcomeOk,
    note: welcomeOk ? "Season Pass welcome sent." : "Season Pass welcome FAILED to send — send by hand.",
  }).catch(() => false);

  return reply(200, { ok: true, rateOpen, drop: drop.id, welcomeSent: welcomeOk });
};
