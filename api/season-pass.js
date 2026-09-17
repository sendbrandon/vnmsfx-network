// Season Pass — Vercel serverless function. Same pattern as leak-check:
// the subscriber is written to the durable lead store FIRST, then two emails
// go out through Resend: a welcome to the subscriber, a note to Brandon.
// Idempotent on email + drop, so a double-submit never creates two records.

"use strict";

const leadStore = require("./_lead-store.js");
const drops = require("./_drops.js");
const money = (n) => "$" + n.toLocaleString("en-US");

const ORIGINS = new Set(["https://vnmsfx.com", "https://www.vnmsfx.com"]);

function esc(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function et(iso, opts) {
  return new Intl.DateTimeFormat("en-US", Object.assign({ timeZone: "America/New_York" }, opts)).format(new Date(iso));
}

function welcomeText(firstName, drop, rateOpen) {
  const name = firstName || "there";
  const release = et(drop.release, { weekday: "long", month: "long", day: "numeric", hour: "numeric" }) + " ET";
  const early = et(drop.early, { weekday: "long", hour: "numeric" }) + " ET";
  const close = et(drop.close, { weekday: "long", month: "long", day: "numeric", hour: "numeric" }) + " ET";
  return `Hey ${name} —

You're on the Season Pass.

What the pass gets your brand:
  - Every new spot, 24 hours before it's public — with the brief it answered.
  - What it took: shots, days, and what the client actually got.
  - First claim on the drop rate — the Creative Sprint at ${money(drops.DROP_RATE)} instead of ${money(drops.LIST_RATE)}, only while a drop is live.

Next: ${drop.title}. Public ${release}. You'll get it ${early}.
${rateOpen ? `
The drop rate is open now and closes ${close}. If one of your products has a truth worth a 15-second spot, start the brief here:
https://vnmsfx.com/creative-sprint?rate=drop&drop=${drop.id}
` : ""}
The menu — one spot, a launch, or a standing creative partner. Every way to work with VNMSFX is on one page: Campaign Pilot, Campaign Launch, Brand World, product images and motion, and the retainer.
https://vnmsfx.com/tv#services

Brandon Adams
VNMSFX TV — New York
vnmsfx.com/tv

You're getting this because you joined the Season Pass at vnmsfx.com/drops. One email per drop, nothing else. Reply "stop" and you're off the list.`;
}

function welcomeHtml(firstName, drop, rateOpen) {
  const name = esc(firstName || "there");
  const release = esc(et(drop.release, { weekday: "long", month: "long", day: "numeric", hour: "numeric" }) + " ET");
  const early = esc(et(drop.early, { weekday: "long", hour: "numeric" }) + " ET");
  const close = esc(et(drop.close, { weekday: "long", month: "long", day: "numeric", hour: "numeric" }) + " ET");
  const acid = "#d9ff5d", ink = "#101010", grey = "#aaaaaa";
  const display = "font-family:Anton,'Arial Narrow',Impact,'Helvetica Neue',Arial,sans-serif;text-transform:uppercase;letter-spacing:-0.01em;";
  const mono = "font-family:'Space Mono','Courier New',Courier,monospace;letter-spacing:0.08em;text-transform:uppercase;";
  const body = "font-family:Archivo,'Helvetica Neue',Helvetica,Arial,sans-serif;";
  const rateBlock = rateOpen ? `
  <tr><td style="padding:26px 32px 0 32px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${acid};">
      <tr><td style="padding:20px 22px;">
        <div style="${mono}font-size:11px;color:${ink};">DROP RATE · OPEN UNTIL ${close}</div>
        <div style="${display}font-size:30px;line-height:1.05;color:${ink};margin-top:8px;">CREATIVE SPRINT&nbsp;${money(drops.DROP_RATE)}.</div>
        <div style="${body}font-size:15px;line-height:1.5;color:${ink};margin-top:10px;">One finished ad, two alternate hooks, two campaign images, one round of changes. List price is ${money(drops.LIST_RATE)}. The drop rate closes when the drop does.</div>
        <a href="https://vnmsfx.com/creative-sprint?rate=drop&amp;drop=${esc(drop.id)}" style="${body}display:inline-block;margin-top:16px;background:${ink};color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 18px;">Start a Sprint at the drop rate &nbsp;↗</a>
      </td></tr>
    </table>
  </td></tr>` : "";
  return `<!doctype html><html><body style="margin:0;padding:0;background:#000000;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">You're on the Season Pass. ${esc(drop.title)} drops ${release}. You get it ${early}.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#000000;">
<tr><td align="center" style="padding:28px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:${ink};">
  <tr><td style="padding:0;"><img src="https://vnmsfx.com/tv/drops/email-header.jpg" width="600" alt="VNMSFX TV" style="display:block;width:100%;height:auto;border:0;"></td></tr>
  <tr><td style="padding:28px 32px 0 32px;">
    <div style="${mono}font-size:11px;color:${grey};">VNMSFX TV / SEASON PASS</div>
    <div style="${display}font-size:44px;line-height:1.02;color:#ffffff;margin-top:10px;">YOU'RE ON<br>THE <span style="color:${acid};">LIST.</span></div>
  </td></tr>
  <tr><td style="padding:20px 32px 0 32px;${body}font-size:16px;line-height:1.6;color:#dddddd;">
    Hey ${name} — three things the pass gets your brand:
  </td></tr>
  <tr><td style="padding:14px 32px 0 32px;${body}font-size:16px;line-height:1.7;color:#ffffff;">
    <span style="color:${acid};">01</span>&nbsp; Every new spot, 24 hours before it's public — with the brief it answered.<br>
    <span style="color:${acid};">02</span>&nbsp; What it took: shots, days, and what the client actually got.<br>
    <span style="color:${acid};">03</span>&nbsp; First claim on the drop rate — the Creative Sprint at ${money(drops.DROP_RATE)} instead of ${money(drops.LIST_RATE)}, only while a drop is live.
  </td></tr>
  <tr><td style="padding:26px 32px 0 32px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #333333;">
      <tr><td style="padding:18px 0 0 0;">
        <div style="${mono}font-size:11px;color:${grey};">NEXT DROP</div>
        <div style="${display}font-size:34px;line-height:1.05;color:#ffffff;margin-top:6px;">${esc(drop.title).toUpperCase()}<span style="color:${acid};">.</span></div>
        <div style="${body}font-size:15px;line-height:1.6;color:#dddddd;margin-top:8px;">Public <strong style="color:#ffffff;">${release}</strong>. You get it <strong style="color:#ffffff;">${early}</strong> — watch for the email.</div>
      </td></tr>
    </table>
  </td></tr>
  ${rateBlock}
  <tr><td style="padding:26px 32px 0 32px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #333333;">
      <tr><td style="padding:18px 0 0 0;">
        <div style="${mono}font-size:11px;color:${grey};">THE MENU</div>
        <div style="${display}font-size:30px;line-height:1.05;color:#ffffff;margin-top:6px;">ONE IDEA. MANY WAYS <span style="color:${acid};">IN.</span></div>
        <div style="${body}font-size:15px;line-height:1.6;color:#dddddd;margin-top:8px;">One spot, a launch, or a standing creative partner. Every way to work with VNMSFX is on one page — Campaign Pilot, Campaign Launch, Brand World, product images and motion, and the retainer.</div>
        <a href="https://vnmsfx.com/tv#services" style="${body}display:inline-block;margin-top:14px;color:${acid};font-weight:700;font-size:14px;">See the menu ↗</a>
      </td></tr>
    </table>
  </td></tr>
  <tr><td style="padding:28px 32px 30px 32px;${body}font-size:14px;line-height:1.6;color:#ffffff;">
    <strong>Brandon Adams</strong><br><span style="color:${grey};">VNMSFX TV — New York</span><br><a href="https://vnmsfx.com/tv" style="color:${grey};">vnmsfx.com/tv</a>
  </td></tr>
</table>
<div style="max-width:600px;${body}font-size:12px;line-height:1.7;color:#777777;padding:16px 8px 0 8px;text-align:left;">
  You're getting this because you joined the Season Pass at vnmsfx.com/drops. One email per drop, nothing else. Reply &ldquo;stop&rdquo; and you're off the list.
</div>
</td></tr></table></body></html>`;
}

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
      channelLabel: "Season Pass", process: "Send the drop email " + et(drop.early, { month: "short", day: "numeric", hour: "numeric" }) + " ET",
      points: 0, answered: 0, financeTouched: false,
      notedText: "Season Pass" + (brand ? " · " + brand : "") + " · joined during " + drop.id + (rateOpen ? " · DROP RATE OPEN at join" : " · outside a drop window"),
      transcriptText: "Joined the Season Pass from " + String(body.page || "/drops") + "\nBrand: " + (brand || "—") + "\nDrop: " + drop.id + "\nRate open at join: " + (rateOpen ? "yes" : "no"),
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

  let welcomeId = null, welcomeOk = false;
  try {
    const r = await send({
      from: "Brandon Adams <brandon@vnmsfx.com>", to: [email], reply_to: "brandon@vnmsfx.com",
      subject: "You're on the Season Pass — " + drop.title + " drops " + et(drop.release, { weekday: "long" }),
      text: welcomeText(firstName, drop, rateOpen), html: welcomeHtml(firstName, drop, rateOpen),
    }, fingerprint + "/welcome");
    const d = await r.json().catch(() => null); welcomeOk = r.ok && !!(d && d.id); welcomeId = welcomeOk ? d.id : null;
  } catch (e) { console.error("welcome send failed", e && e.message); }

  try {
    await send({
      from: "VNMSFX Season Pass <brandon@vnmsfx.com>", to: ["brandon@vnmsfx.com"], reply_to: email,
      subject: "[Season Pass] " + (firstName || email) + (brand ? " · " + brand : "") + (rateOpen ? " · drop rate open" : ""),
      text: `New Season Pass subscriber\n\nName: ${firstName || "—"}\nBrand: ${brand || "—"}\nEmail: ${email}\nDrop: ${drop.id}\nRate open at join: ${rateOpen ? "yes" : "no"}\nFrom: ${String(body.page || "/drops")}\nReference: ${submissionId}\n\nWelcome email: ${welcomeOk ? "sent" : "FAILED — send by hand"}`,
    }, fingerprint + "/notify");
  } catch (e) { console.error("notify send failed", e && e.message); }

  await leadStore.markDelivery(saved.recordId, {
    status: welcomeOk ? "RECEIPT SENT" : "NEW", receiptMessageId: welcomeId, receiptDelivered: welcomeOk,
    note: welcomeOk ? "Season Pass welcome sent." : "Season Pass welcome FAILED to send — send by hand.",
  }).catch(() => false);

  return reply(200, { ok: true, rateOpen, drop: drop.id, welcomeSent: welcomeOk });
};
