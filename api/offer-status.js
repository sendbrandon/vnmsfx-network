// Read-only offer status: the page renders the price from this, never from a URL flag.
"use strict";
const drops = require("./_drops.js");
module.exports = function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const now = new Date(), d = drops.current(now);
  res.status(200).json({ ok: true, list: drops.LIST_RATE, rate: drops.DROP_RATE, rateOpen: !!d, now: now.toISOString(),
    drop: d ? { id: d.id, title: d.title, opens: d.liveFrom, closes: d.close } : null });
};
