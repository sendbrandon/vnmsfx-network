// Drop-day email to Season Pass holders. Shared by the cron route
// (api/send-drop.js) and the by-hand script (scripts/send-drop.js).
"use strict";
const drops = require("./_drops.js");
const money = (n) => "$" + n.toLocaleString("en-US");

function build(drop) {
const et = (iso, o) => new Intl.DateTimeFormat("en-US", Object.assign({ timeZone: "America/New_York" }, o)).format(new Date(iso));
  const acid = "#d9ff5d", ink = "#101010", grey = "#aaaaaa";
  const display = "font-family:Anton,'Arial Narrow',Impact,'Helvetica Neue',Arial,sans-serif;text-transform:uppercase;letter-spacing:-0.01em;";
  const mono = "font-family:'Space Mono','Courier New',Courier,monospace;letter-spacing:0.08em;text-transform:uppercase;";
  const body = "font-family:Archivo,'Helvetica Neue',Helvetica,Arial,sans-serif;";
  const filmUrl = "https://vnmsfx.com" + drop.film;
  const pageUrl = "https://vnmsfx.com/drops/" + drop.id;
  const close = et(drop.close, { weekday: "long", month: "long", day: "numeric", hour: "numeric" }) + " ET";
  const publicAt = et(drop.release, { weekday: "long", hour: "numeric" }) + " ET";
  const subject = drop.title + " — yours 24 hours early";
  const text = (name) => `Hey ${name} —
  
  ${drop.title} is yours a day before anyone else. Direct link, sound on:
  ${filmUrl}
  
  It goes public ${publicAt}. Until then it's just the list.
  
  The brief: ${drop.brief}
  
  What it took: ${drop.took}

THE SAUCE — ${drop.sauce.label}
${drop.sauce.lines.map((l) => "  - " + l).join("\n")}
  
  Want one for your product? The drop rate is open until ${close}: Creative Sprint at ${money(drops.DROP_RATE)} instead of ${money(drops.LIST_RATE)}. The rate is applied on the page and confirmed by email before you pay. Start the brief:
  https://vnmsfx.com/creative-sprint?rate=drop&drop=${drop.id}
  
  Brandon
  VNMSFX TV — ${pageUrl}
  
  You're getting this because you're on the Season Pass. One email per drop. Reply "stop" and you're off.`;
  const html = (name) => `<!doctype html><html><body style="margin:0;padding:0;background:#000;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#000;"><tr><td align="center" style="padding:28px 12px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:${ink};">
  <tr><td><a href="${filmUrl}"><img src="https://vnmsfx.com${drop.cards[2]}" width="600" alt="${drop.title}" style="display:block;width:100%;height:auto;border:0;"></a></td></tr>
  <tr><td style="padding:28px 32px 0 32px;"><div style="${mono}font-size:11px;color:${grey};">SEASON PASS · 24 HOURS EARLY</div><div style="${display}font-size:44px;line-height:1.02;color:#fff;margin-top:10px;">${drop.title.toUpperCase()}<span style="color:${acid};">.</span></div></td></tr>
  <tr><td style="padding:18px 32px 0 32px;${body}font-size:16px;line-height:1.6;color:#ddd;">Hey ${name} — it's yours a day before anyone else. Public ${publicAt}. Until then it's just the list.</td></tr>
  <tr><td style="padding:22px 32px 0 32px;"><a href="${filmUrl}" style="${body}display:inline-block;background:${acid};color:${ink};text-decoration:none;font-weight:700;font-size:14px;padding:16px 20px;">Watch with sound &nbsp;↗</a></td></tr>
  <tr><td style="padding:26px 32px 0 32px;"><div style="${mono}font-size:11px;color:${grey};">THE BRIEF</div><div style="${body}font-size:15px;line-height:1.6;color:#fff;margin-top:6px;">${drop.brief}</div><div style="${mono}font-size:11px;color:${grey};margin-top:16px;">WHAT IT TOOK</div><div style="${body}font-size:15px;line-height:1.6;color:#fff;margin-top:6px;">${drop.took}</div></td></tr>
<tr><td style="padding:26px 32px 0 32px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${acid};"><tr><td style="padding:18px 20px;"><div style="${mono}font-size:11px;color:${acid};">THE SAUCE · ${drop.sauce.label}</div>${drop.sauce.lines.map((l, i) => `<div style="${body}font-size:15px;line-height:1.6;color:#fff;margin-top:${i ? 8 : 12}px;"><span style="color:${acid};">${String(i + 1).padStart(2, "0")}</span>&nbsp; ${l}</div>`).join("")}</td></tr></table></td></tr>
  <tr><td style="padding:28px 32px 0 32px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #333;"><tr><td style="padding:18px 0 0 0;"><div style="${mono}font-size:11px;color:${grey};">DROP RATE · OPEN UNTIL ${close.toUpperCase()}</div><div style="${display}font-size:30px;line-height:1.05;color:#fff;margin-top:8px;">WANT ONE FOR YOUR PRODUCT<span style="color:${acid};">?</span></div><div style="${body}font-size:15px;line-height:1.5;color:#fff;margin-top:8px;">Creative Sprint at <strong>${money(drops.DROP_RATE)}</strong> until ${close}. The rate is applied on the page and confirmed by email before you pay.</div><div style="${body}font-size:15px;line-height:1.5;color:#ddd;margin-top:8px;">One finished ad, two alternate hooks, two campaign images, one round of changes. List price ${money(drops.LIST_RATE)}. Closes when the drop does.</div><a href="https://vnmsfx.com/creative-sprint?rate=drop&amp;drop=${drop.id}" style="${body}display:inline-block;margin-top:14px;color:${acid};font-weight:700;font-size:14px;">Start a Sprint at the drop rate ↗</a></td></tr></table></td></tr>
  <tr><td style="padding:28px 32px 30px 32px;${body}font-size:14px;line-height:1.6;color:#fff;"><strong>Brandon Adams</strong><br><span style="color:${grey};">VNMSFX TV — New York</span><br><a href="${pageUrl}" style="color:${grey};">${pageUrl.replace("https://", "")}</a></td></tr>
  </table><div style="max-width:600px;${body}font-size:12px;line-height:1.7;color:#777;padding:16px 8px 0 8px;">You're getting this because you're on the Season Pass. One email per drop. Reply &ldquo;stop&rdquo; and you're off.</div></td></tr></table></body></html>`;
  return { subject, text, html };
}

async function subscribers({ NOTION_TOKEN, NOTION_DATABASE_ID }) {
  const out = []; let cursor;
  do {
    const r = await fetch("https://api.notion.com/v1/databases/" + NOTION_DATABASE_ID + "/query", { method: "POST", headers: { Authorization: "Bearer " + NOTION_TOKEN, "Notion-Version": "2022-06-28", "Content-Type": "application/json" },
      body: JSON.stringify({ page_size: 100, start_cursor: cursor, filter: { property: "Sells", rich_text: { equals: "Season Pass" } } }) });
    if (!r.ok) throw new Error("notion " + r.status + " " + (await r.text()).slice(0, 200));
    const d = await r.json();
    d.results.forEach((p) => { const email = p.properties.Email && p.properties.Email.email; const fn = ((p.properties["First Name"] || {}).rich_text || []).map((t) => t.plain_text).join(""); if (email) out.push({ email, name: fn && fn !== "—" ? fn : "there" }); });
    cursor = d.has_more ? d.next_cursor : null;
  } while (cursor);
  const seen = new Set(); return out.filter((s) => (seen.has(s.email) ? false : seen.add(s.email)));
}

// Refuse to send while any sauce line is still a placeholder.
function ready(drop) {
  const lines = (drop.sauce && drop.sauce.lines) || [];
  return lines.length > 0 && !lines.some((l) => /TBD|TODO|XXX/i.test(l)) && !/TBD/i.test(drop.brief || "") && !/TBD/i.test(drop.took || "");
}

async function sendDrop({ drop, dry, env, log = () => {} }) {
  const { NOTION_TOKEN, NOTION_DATABASE_ID, RESEND_API_KEY } = env;
  if (!NOTION_TOKEN || !NOTION_DATABASE_ID || !RESEND_API_KEY) throw new Error("need NOTION_TOKEN, NOTION_DATABASE_ID, RESEND_API_KEY");
  if (!dry && !ready(drop)) throw new Error("drop " + drop.id + " still has placeholder copy (sauce/brief/took) — not sending");
  const { subject, text, html } = build(drop);
  const list = await subscribers({ NOTION_TOKEN, NOTION_DATABASE_ID });
  log((dry ? "[dry] " : "") + list.length + " subscribers for " + drop.id);
  let sent = 0, failed = 0; const failures = [];
  for (const s of list) {
    if (dry) { log("  would send → " + s.email); continue; }
    const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: "Bearer " + RESEND_API_KEY, "Content-Type": "application/json", "Idempotency-Key": "drop/" + drop.id + "/" + s.email },
      body: JSON.stringify({ from: "Brandon Adams <brandon@vnmsfx.com>", to: [s.email], reply_to: "brandon@vnmsfx.com", subject, text: text(s.name), html: html(s.name) }) });
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
