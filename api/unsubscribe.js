// GET /api/unsubscribe?e=<email>&t=<token> — marks every Season Pass row for that
// email UNSUBSCRIBED in Notion. The sender skips that status before every send.
"use strict";
const unsub = require("./_unsub.js");
const page = (title, line) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} — VNMSFX TV</title><meta name="robots" content="noindex"><style>body{margin:0;background:#101010;color:#fff;font:16px/1.5 Archivo,Arial,sans-serif;display:grid;place-items:center;min-height:100svh;padding:24px}main{max-width:520px}h1{font:400 clamp(40px,8vw,72px)/1 Anton,'Arial Narrow',sans-serif;text-transform:uppercase;letter-spacing:-.02em;margin:0 0 16px}h1 span{color:#d9ff5d}p{color:#ddd}a{color:#d9ff5d}</style></head><body><main><h1>${title}<span>.</span></h1><p>${line}</p><p><a href="https://vnmsfx.com/tv">vnmsfx.com/tv</a></p></main></body></html>`;
module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store"); res.setHeader("Content-Type", "text/html; charset=utf-8");
  const q = req.query || {}; const email = String(q.e || "").trim().toLowerCase(), t = String(q.t || "");
  if (!email || !unsub.valid(email, t)) return res.status(400).send(page("That link didn’t work", "Reply to any Season Pass email with “stop” and I’ll take you off by hand."));
  const { NOTION_TOKEN, NOTION_DATABASE_ID } = process.env;
  const H = { Authorization: "Bearer " + NOTION_TOKEN, "Notion-Version": "2022-06-28", "Content-Type": "application/json" };
  try {
    const r = await fetch("https://api.notion.com/v1/databases/" + NOTION_DATABASE_ID + "/query", { method: "POST", headers: H,
      body: JSON.stringify({ page_size: 50, filter: { and: [{ property: "Email", email: { equals: email } }, { property: "Sells", rich_text: { equals: "Season Pass" } }] } }) });
    if (!r.ok) throw new Error("notion " + r.status);
    const d = await r.json(); let n = 0;
    for (const p of d.results) {
      const u = await fetch("https://api.notion.com/v1/pages/" + p.id, { method: "PATCH", headers: H, body: JSON.stringify({ properties: { "Status": { select: { name: "UNSUBSCRIBED" } }, "Notes": { rich_text: [{ text: { content: "Unsubscribed via link " + new Date().toISOString() } }] } } }) });
      if (u.ok) n++;
    }
    console.log("[unsubscribe]", email, n, "rows");
    return res.status(200).send(page("You’re off the list", "No more Season Pass emails. If that was a mistake, join again from any drop page."));
  } catch (e) {
    console.error("[unsubscribe] failed", e && e.message);
    return res.status(500).send(page("Couldn’t reach the list", "Reply to any Season Pass email with “stop” and I’ll take you off by hand."));
  }
};
