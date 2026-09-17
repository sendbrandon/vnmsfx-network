#!/usr/bin/env node
// Drop-day email to Season Pass holders — run by hand 24h before release:
//   NOTION_TOKEN=… NOTION_DATABASE_ID=… RESEND_API_KEY=… node scripts/send-drop.js the-recipient [--dry]
// Reads subscribers ("Sells" = Season Pass) from the same Notion database the
// site writes to, sends one email each through Resend with an idempotency key
// per subscriber per drop, so a re-run never double-sends.
"use strict";
const drops = require("../api/_drops.js");
const money = (n) => "$" + n.toLocaleString("en-US");
const [,, dropId, flag] = process.argv;
const drop = drops.byId(dropId);
if (!drop) { console.error("unknown drop:", dropId, "— known:", drops.DROPS.map((d) => d.id).join(", ")); process.exit(1); }
const DRY = flag === "--dry";
const { NOTION_TOKEN, NOTION_DATABASE_ID, RESEND_API_KEY } = process.env;
if (!NOTION_TOKEN || !NOTION_DATABASE_ID || !RESEND_API_KEY) { console.error("need NOTION_TOKEN, NOTION_DATABASE_ID, RESEND_API_KEY"); process.exit(1); }
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

Want one for your product? The drop rate is open until ${close}: Creative Sprint at ${money(drops.DROP_RATE)} instead of ${money(drops.LIST_RATE)}. Start the brief:
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
<tr><td style="padding:28px 32px 0 32px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #333;"><tr><td style="padding:18px 0 0 0;"><div style="${mono}font-size:11px;color:${grey};">DROP RATE · OPEN UNTIL ${close.toUpperCase()}</div><div style="${display}font-size:30px;line-height:1.05;color:#fff;margin-top:8px;">WANT ONE FOR YOUR PRODUCT<span style="color:${acid};">?</span></div><div style="${body}font-size:15px;line-height:1.5;color:#fff;margin-top:8px;">Creative Sprint at <strong>${money(drops.DROP_RATE)}</strong> until ${close}.</div><div style="${body}font-size:15px;line-height:1.5;color:#ddd;margin-top:8px;">One finished ad, two alternate hooks, two campaign images, one round of changes. List price ${money(drops.LIST_RATE)}. Closes when the drop does.</div><a href="https://vnmsfx.com/creative-sprint?rate=drop&amp;drop=${drop.id}" style="${body}display:inline-block;margin-top:14px;color:${acid};font-weight:700;font-size:14px;">Start a Sprint at the drop rate ↗</a></td></tr></table></td></tr>
<tr><td style="padding:28px 32px 30px 32px;${body}font-size:14px;line-height:1.6;color:#fff;"><strong>Brandon Adams</strong><br><span style="color:${grey};">VNMSFX TV — New York</span><br><a href="${pageUrl}" style="color:${grey};">${pageUrl.replace("https://", "")}</a></td></tr>
</table><div style="max-width:600px;${body}font-size:12px;line-height:1.7;color:#777;padding:16px 8px 0 8px;">You're getting this because you're on the Season Pass. One email per drop. Reply &ldquo;stop&rdquo; and you're off.</div></td></tr></table></body></html>`;

async function subscribers() {
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
(async () => {
  const list = await subscribers();
  console.log((DRY ? "[dry] " : "") + list.length + " subscribers for " + drop.id);
  let sent = 0, failed = 0;
  for (const s of list) {
    if (DRY) { console.log("  would send →", s.email); continue; }
    const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: "Bearer " + RESEND_API_KEY, "Content-Type": "application/json", "Idempotency-Key": "drop/" + drop.id + "/" + s.email },
      body: JSON.stringify({ from: "Brandon Adams <brandon@vnmsfx.com>", to: [s.email], reply_to: "brandon@vnmsfx.com", subject, text: text(s.name), html: html(s.name) }) });
    if (r.ok) sent++; else { failed++; console.error("  failed →", s.email, r.status, (await r.text()).slice(0, 120)); }
    await new Promise((res) => setTimeout(res, 600)); // Resend rate limit: 2/s
  }
  console.log("sent " + sent + ", failed " + failed);
})().catch((e) => { console.error(e); process.exit(1); });
