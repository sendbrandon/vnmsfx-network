// Drop-day email to Season Pass holders. Shared by the cron route
// (api/send-drop.js) and the by-hand script (scripts/send-drop.js).
"use strict";
const drops = require("./_drops.js");
const unsub = require("./_unsub.js");

const esc = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function build(drop) {
  const filmUrl = "https://vnmsfx.com" + drop.film;
  const publicAt = new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',weekday:'long',month:'long',day:'numeric',hour:'numeric'}).format(new Date(drop.release)) + ' ET';
  const notes = drop.notes || [];
  const subject = drop.title + " — watch it 24 hours early";
  const offer = 'First-time client? Your Season Pass saves $500 on an eligible 15-second commercial: $1,500 instead of $2,000. Scope, eligibility and delivery date are agreed before payment.';
  const text = (name,email) => `Hi ${name || 'there'},

${drop.title} is ready for you, 24 hours before the public release.
Watch with sound: ${filmUrl}
Public release: ${publicAt}.

${drop.noteTitle}

${notes.map(note => note.heading.toUpperCase()+'\n'+note.text).join('\n\n')}

${drop.takeaway}

WANT AN AD FOR YOUR PRODUCT?
${offer}
https://vnmsfx.com/#project-inquiry

Brandon Adams
Founder, VNMSFX

New ads and production notes by email. Unsubscribe: ${unsub.url(email)}`;
  const html = (name,email) => `<!doctype html><html><body style="margin:0;background:#101010;color:#fff;font-family:Arial,sans-serif"><div style="max-width:560px;margin:auto;padding:32px 24px"><p style="font-size:14px;color:#d9ff5d">SEASON PASS / 24 HOURS EARLY</p><h1 style="font-size:38px;margin:14px 0">${esc(drop.title)}</h1><p style="font-size:17px;line-height:1.5">Hi ${esc(name || 'there')}, the ad is ready for you. Public release: ${esc(publicAt)}.</p><a href="${filmUrl}" style="display:inline-block;background:#d9ff5d;color:#101010;font-weight:bold;text-decoration:none;padding:16px 20px">Watch with sound ↗</a><h2 style="font-size:28px;line-height:1.15;margin:32px 0 20px">${esc(drop.noteTitle)}</h2>${notes.map(note=>`<section style="border-top:1px solid #444;padding-top:18px;margin-top:20px"><h3 style="font-size:21px;margin:0 0 8px">${esc(note.heading)}</h3><p style="font-size:16px;line-height:1.5;color:#ddd;margin:0">${esc(note.text)}</p></section>`).join('')}<p style="font-size:20px;line-height:1.4;color:#d9ff5d;margin:26px 0">${esc(drop.takeaway)}</p><section style="border-top:1px solid #444;padding-top:24px"><h2 style="font-size:23px;margin:0 0 10px">Want an ad for your product?</h2><p style="font-size:16px;line-height:1.5;color:#ddd">${offer}</p><a href="https://vnmsfx.com/#project-inquiry" style="color:#d9ff5d;font-weight:bold">Tell me about your product ↗</a></section><p style="font-size:16px;line-height:1.5;margin-top:28px"><strong>Brandon Adams</strong><br>Founder, VNMSFX</p><p style="font-size:13px;color:#aaa;margin-top:32px">New ads and production notes by email. <a href="${unsub.url(email)}" style="color:#aaa">Unsubscribe</a>.</p></div></body></html>`;
  return {subject,text,html};
}

async function subscribers({ NOTION_TOKEN, NOTION_DATABASE_ID }) {
  const out = []; let cursor;
  do {
    const r = await fetch("https://api.notion.com/v1/databases/" + NOTION_DATABASE_ID + "/query", { method: "POST", headers: { Authorization: "Bearer " + NOTION_TOKEN, "Notion-Version": "2022-06-28", "Content-Type": "application/json" },
      body: JSON.stringify({ page_size: 100, start_cursor: cursor, filter: { property: "Sells", rich_text: { equals: "Season Pass" } } }) });
    if (!r.ok) throw new Error("notion " + r.status + " " + (await r.text()).slice(0, 200));
    const d = await r.json();
    d.results.forEach((p) => { const status = ((p.properties.Status || {}).select || {}).name || ""; if (/UNSUBSCRIBED|BOUNCED/i.test(status)) return; const email = p.properties.Email && p.properties.Email.email; const fn = ((p.properties["First Name"] || {}).rich_text || []).map((t) => t.plain_text).join(""); if (email) out.push({ email, name: fn && fn !== "—" ? fn : "there" }); });
    cursor = d.has_more ? d.next_cursor : null;
  } while (cursor);
  const seen = new Set(); return out.filter((s) => (seen.has(s.email) ? false : seen.add(s.email)));
}

// Refuse to send incomplete production notes.
function ready(drop) {
  const notes = drop.notes || [];
  const fields = [drop.noteTitle, drop.takeaway, ...notes.flatMap(note => [note.heading,note.text])];
  return notes.length >= 3 && fields.every(value => typeof value === 'string' && value.trim() && !/TBD|TODO|XXX/i.test(value));
}

async function sendDrop({ drop, dry, env, log = () => {} }) {
  const { NOTION_TOKEN, NOTION_DATABASE_ID, RESEND_API_KEY } = env;
  if (!NOTION_TOKEN || !NOTION_DATABASE_ID || !RESEND_API_KEY) throw new Error("need NOTION_TOKEN, NOTION_DATABASE_ID, RESEND_API_KEY");
  if (!dry && !ready(drop)) throw new Error("drop " + drop.id + " still has incomplete production notes — not sending");
  const { subject, text, html } = build(drop);
  const list = await subscribers({ NOTION_TOKEN, NOTION_DATABASE_ID });
  log((dry ? "[dry] " : "") + list.length + " subscribers for " + drop.id);
  let sent = 0, failed = 0; const failures = [];
  for (const s of list) {
    if (dry) { log("  would send → " + s.email); continue; }
    const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: "Bearer " + RESEND_API_KEY, "Content-Type": "application/json", "Idempotency-Key": "drop/" + drop.id + "/" + s.email },
      body: JSON.stringify({ from: "Brandon Adams <brandon@vnmsfx.com>", to: [s.email], reply_to: "brandon@vnmsfx.com", subject, text: text(s.name, s.email), html: html(s.name, s.email), headers: { "List-Unsubscribe": "<" + unsub.url(s.email) + ">" } }) });
    if (r.ok) sent++; else { failed++; const t = (await r.text()).slice(0, 120); failures.push(s.email + " " + r.status + " " + t); log("  failed → " + s.email + " " + r.status + " " + t); }
    await new Promise((res) => setTimeout(res, 600)); // Resend rate limit: 2/s
  }
  return { drop: drop.id, dry: !!dry, subscribers: list.length, sent, failed, failures, ready: ready(drop), subject };
}

// The drop whose early-access moment falls inside [now - 30 min, now + 90 min]:
// the cron fires daily at 16:00 UTC and only sends on the day a drop is due.
function due(now) {
  const t = (now || new Date()).getTime();
  return drops.DROPS.find((d) => { const e = Date.parse(d.early); return t >= e - 30 * 60e3 && t <= e + 90 * 60e3; }) || null;
}

module.exports = { build, subscribers, sendDrop, ready, due };
