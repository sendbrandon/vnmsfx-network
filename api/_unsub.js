// Signed one-click unsubscribe links for the Season Pass. Key: CRON_SECRET (already set).
"use strict";
const crypto = require("crypto");
function token(email) {
  const key = process.env.CRON_SECRET; if (!key) return null;
  return crypto.createHmac("sha256", key).update(String(email).trim().toLowerCase()).digest("hex").slice(0, 24);
}
function url(email) {
  const t = token(email); if (!t) return "mailto:brandon@vnmsfx.com?subject=" + encodeURIComponent("Unsubscribe from the Season Pass");
  return "https://vnmsfx.com/api/unsubscribe?e=" + encodeURIComponent(String(email).trim().toLowerCase()) + "&t=" + t;
}
function valid(email, t) { const want = token(email); return !!want && typeof t === "string" && t.length === want.length && crypto.timingSafeEqual(Buffer.from(want), Buffer.from(t)); }
module.exports = { token, url, valid };
