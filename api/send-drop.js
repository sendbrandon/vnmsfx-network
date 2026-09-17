// Vercel cron: daily at 16:00 UTC (12 PM ET). Sends the drop-day email to
// Season Pass holders on the day a drop's early-access moment is due, and
// does nothing on every other day. Idempotent per subscriber per drop.
//
// Manual: GET /api/send-drop?drop=the-recipient&dry=1   (needs the cron secret)
// Vercel adds "Authorization: Bearer <CRON_SECRET>" to cron invocations itself.
"use strict";
const drops = require("./_drops.js");
const mail = require("./_drop-mail.js");

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.authorization || "";
  if (!secret || auth !== "Bearer " + secret) return res.status(401).json({ ok: false, error: secret ? "unauthorized" : "CRON_SECRET is not set" });
  const q = req.query || {};
  const dry = q.dry === "1" || q.dry === "true";
  const drop = q.drop ? drops.byId(String(q.drop)) : mail.due(new Date());
  if (!drop) return res.status(200).json({ ok: true, skipped: true, reason: q.drop ? "unknown drop" : "no drop due now" });
  try {
    const out = await mail.sendDrop({ drop, dry, env: process.env, log: (m) => console.log("[send-drop]", m) });
    return res.status(200).json(Object.assign({ ok: true }, out));
  } catch (e) {
    console.error("[send-drop] failed", e && e.message);
    return res.status(500).json({ ok: false, error: String(e && e.message || e) });
  }
};
