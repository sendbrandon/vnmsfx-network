#!/usr/bin/env node
// Drop-day email by hand (the cron in api/send-drop.js does this automatically):
//   NOTION_TOKEN=… NOTION_DATABASE_ID=… RESEND_API_KEY=… node scripts/send-drop.js the-recipient [--dry]
"use strict";
const drops = require("../api/_drops.js");
const mail = require("../api/_drop-mail.js");
const [,, dropId, flag] = process.argv;
const drop = drops.byId(dropId);
if (!drop) { console.error("unknown drop:", dropId, "— known:", drops.DROPS.map((d) => d.id).join(", ")); process.exit(1); }
mail.sendDrop({ drop, dry: flag === "--dry", env: process.env, log: console.log })
  .then((r) => console.log("sent " + r.sent + ", failed " + r.failed))
  .catch((e) => { console.error(e.message || e); process.exit(1); });
