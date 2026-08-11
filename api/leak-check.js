// Leak Check intake — Vercel serverless function.
//
// Receives one visitor-initiated submission from /leak-check and, when a
// RESEND_API_KEY is configured, sends exactly two transactional emails:
//   1. the full result to Brandon (the lead + their answers), and
//   2. a single confirmation to the visitor promising a personal reply
//      within 24 hours.
// No list subscription, no sequence, no storage: this function keeps nothing.
// Without the key it returns 503 and the page falls back to a prefilled
// mail-app draft, so no lead is ever lost to missing infrastructure.

const MAX_FLAGS = 12;

function bad(res, code, message) {
  res.status(code).json({ ok: false, error: message });
}

function esc(text) {
  return String(text).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

module.exports = async function handler(req, res) {
  const key = process.env.RESEND_API_KEY;

  // No-send diagnostic: reports whether the key works and which sending
  // domains this account has verified. Sends no email and reveals no secret.
  if (req.method === "GET" && req.query && req.query.probe === "vx-probe") {
    if (!key) return res.status(200).json({ keyPresent: false });
    try {
      const r = await fetch("https://api.resend.com/domains", {
        headers: { Authorization: "Bearer " + key },
      });
      const data = await r.json().catch(function () { return null; });
      const list = (data && (data.data || data)) || [];
      return res.status(200).json({
        keyPresent: true,
        keyAccepted: r.ok,
        httpStatus: r.status,
        domains: Array.isArray(list)
          ? list.map(function (d) { return { name: d.name, status: d.status, region: d.region }; })
          : data,
      });
    } catch (e) {
      return res.status(200).json({ keyPresent: true, probeError: String(e && e.message) });
    }
  }

  if (req.method !== "POST") return bad(res, 405, "POST only");
  if (!key) return bad(res, 503, "intake not configured");

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { return bad(res, 400, "malformed JSON"); }
  }
  if (!body || typeof body !== "object") return bad(res, 400, "malformed body");

  const email = String(body.email || "").trim().slice(0, 200);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return bad(res, 400, "invalid email");

  const sells = String(body.sells || "Unstated").slice(0, 60);
  const count = Math.min(Math.max(parseInt(body.count, 10) || 0, 0), MAX_FLAGS);
  const flags = Array.isArray(body.flags)
    ? body.flags.slice(0, MAX_FLAGS).map(function (f) {
        return {
          name: String((f && f.name) || "").slice(0, 120),
          severity: (f && f.severity) === "flagged" ? "flagged" : "worth-a-look",
        };
      }).filter(function (f) { return f.name; })
    : [];

  const flagLines = flags
    .map(function (f) { return "- " + f.name + (f.severity === "flagged" ? "" : " (worth a look)"); })
    .join("\n") || "- none";

  const send = function (payload) {
    return fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  };

  // 1. The lead, to Brandon. Reply-to is the visitor so answering is one click.
  const toBrandon = await send({
    from: "VNMSFX Leak Check <leak-check@vnmsfx.com>",
    to: ["brandon@vnmsfx.com"],
    reply_to: email,
    subject: "Leak Check: " + count + " flagged — " + email + " (" + sells + ")",
    text:
      "New Leak Check submission\n\n" +
      "Email: " + email + "\n" +
      "Sells: " + sells + "\n" +
      "Flags: " + count + "\n\n" +
      flagLines + "\n\n" +
      "Promise made on the page: personal reply within 24 hours.",
  });
  if (!toBrandon.ok) {
    // Surface the provider's actual reason (unverified domain, bad key, etc.)
    // instead of a generic failure that hides the cause.
    const detail = await toBrandon.text().catch(function () { return ""; });
    console.error("Resend send failed", toBrandon.status, detail);
    return res.status(502).json({
      ok: false,
      error: "delivery failed",
      providerStatus: toBrandon.status,
      providerDetail: String(detail).slice(0, 400),
    });
  }

  // 2. One confirmation to the visitor. Transactional only — no list, no sequence.
  await send({
    from: "Brandon Adams <brandon@vnmsfx.com>",
    to: [email],
    subject: "Got your Leak Check — reply coming within 24 hours",
    text:
      "Thanks for running the Leak Check.\n\n" +
      "Your result: " + count + (count === 1 ? " leak" : " leaks") + " flagged.\n" +
      flagLines + "\n\n" +
      "I read every submission myself. Within 24 hours you'll get my reply with " +
      "the first check I'd run on each flag for a brand that sells the way yours " +
      "does. One personal reply — you're not on a list and there's no sequence " +
      "behind this.\n\n" +
      "If it's urgent, book the free 30-minute teardown: https://cal.com/vnmsfx/30min\n\n" +
      "— Brandon Adams\nVNMSFX, New York\nbrandon@vnmsfx.com",
    html:
      "<p>Thanks for running the Leak Check.</p>" +
      "<p><strong>Your result: " + count + (count === 1 ? " leak" : " leaks") + " flagged.</strong></p>" +
      "<pre style=\"font-family:inherit;white-space:pre-wrap\">" + esc(flagLines) + "</pre>" +
      "<p>I read every submission myself. Within 24 hours you'll get my reply with the " +
      "first check I'd run on each flag for a brand that sells the way yours does. " +
      "One personal reply — you're not on a list and there's no sequence behind this.</p>" +
      "<p>If it's urgent, <a href=\"https://cal.com/vnmsfx/30min\">book the free 30-minute teardown</a>.</p>" +
      "<p>— Brandon Adams<br>VNMSFX, New York<br>brandon@vnmsfx.com</p>",
  });

  res.status(200).json({ ok: true });
};
