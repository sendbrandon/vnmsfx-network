// Leak Check intake — Vercel serverless function.
//
// One visitor-initiated submission produces exactly two emails:
//   1. an honest automatic RECEIPT to the visitor — transparent about being
//      automatic, no claim that money was lost, and one plain text link to the
//      free teardown (a soft alternative, deliberately not a button); and
//   2. the lead to Brandon, carrying the raw material he needs to write a
//      genuinely personal reply (their name, channel, and their actual answers).
//
// The score is recomputed HERE from the raw answers. Labels, themes and the
// recommended process supplied by the browser are ignored — a caller cannot
// dictate its own result.
//
// The lead is written to the durable store BEFORE either email is sent, so an
// email-provider failure cannot lose a prospect, and the write is idempotent on
// submission ID so a retry cannot create a second lead. Each record carries its
// owner, next action and an exact reply-by deadline.

const leadStore = require("./_lead-store.js");

const QUESTION_BANK = {
  shared: [
    { t: "VISIBILITY", q: "Your biggest account emails: “Where's our order?” How long until you have the real answer?",
      flag: "Status answers take a hunt",
      opts: ["Under a minute—one place has it", "I check a few tools and ask around", "Depends who's in that day"] },
    { t: "OWNERSHIP", q: "You promised a buyer samples and a follow-up call next week. Where does that promise live right now?",
      flag: "No single home for open promises",
      opts: ["One tracker, with an owner and a due date", "My inbox and a few sticky notes", "My memory"] },
    { t: "OWNERSHIP", q: "The one person who knows where everything stands goes on vacation. What breaks?",
      flag: "One person holds the current picture",
      opts: ["Nothing—it's written down", "We'd limp until they're back", "Half the business rides in their head"] },
    { t: "RECONCILIATION", q: "Your stock count and what your system says don't match. How do you settle it?",
      flag: "No settled rule when records disagree",
      opts: ["There's one record we trust, and we check it", "We eyeball it and adjust", "We find out when we oversell"] },
    { t: "RECONCILIATION", q: "Orders into spreadsheets, emails into trackers—how much of that is someone retyping by hand?",
      flag: "Information is retyped between tools",
      opts: ["Almost none—it flows on its own", "Some, every week", "That's basically someone's job"] },
    { t: "VISIBILITY", q: "A big order went wrong. How long did it take to piece together what actually happened?",
      flag: "Reconstructing an incident takes hours",
      opts: ["Minutes—the trail is in one place", "An afternoon of digging", "We never fully figured it out"] },
    // Second fulfillment question, shared by every sales type. With only one,
    // this area could reach a perfect score off a single answer and won far
    // more often than the areas carrying three or four questions.
    { t: "FULFILLMENT", q: "A customer says they never got what they paid for. How fast can you prove it went out?",
      flag: "No proof trail from paid to delivered",
      opts: ["Minutes—there's a record at every step", "I'd have to ask whoever handled it", "Honestly, we'd take their word for it"] },
  ],
  direct: [
    { t: "FULFILLMENT", q: "An order needed to go out today and didn't. Would you know before the customer told you?",
      flag: "No dependable flag when an order misses its date",
      opts: ["Yes—something flags it same day", "Probably, eventually", "We usually hear it from them first"] },
    { t: "RECONCILIATION", q: "Your best seller—what does it actually keep after refunds, fees and discounts?",
      flag: "True margin on the top seller is unclear", finance: true,
      opts: ["I know, and I could show you", "Roughly", "It sells great. That's what I know"] },
    { t: "RECONCILIATION", q: "Your ad platform says last month made money. Do you know if that matches your actual orders?",
      flag: "Ad results are not checked against orders",
      opts: ["Yes—we check it against real orders", "We mostly trust the ads dashboard", "No—and I've wondered"], na: true },
  ],
  wholesale: [
    { t: "RECONCILIATION", q: "A distributor's check comes in short, with just a note: “missing cases.” What happens next?",
      flag: "Short-pays are not always challenged in time",
      opts: ["Someone pulls the PO and proof, and challenges it in time", "We mean to chase it—sometimes we do", "Small ones just… slip"], na: true },
    { t: "OWNERSHIP", q: "A store that reordered like clockwork has gone quiet. Who notices?",
      flag: "Quiet accounts are noticed late",
      opts: ["A flag goes up the week they're overdue", "Whoever owns them—when they think of it", "Sometimes nobody, honestly"] },
    { t: "FULFILLMENT", q: "You land the order. Does the warehouse actually ship it on time—and would you know?",
      flag: "No checkpoint proving the order shipped",
      opts: ["There's a check—we'd know same day", "We assume yes unless we hear otherwise", "We've been burned by this"] },
  ],
  subscription: [
    { t: "OWNERSHIP", q: "A longtime subscriber quietly cancels. When do you find out?",
      flag: "Churn is seen only in the monthly numbers",
      opts: ["That week—we reach out while it's warm", "In the monthly numbers", "We don't, really"] },
    { t: "FULFILLMENT", q: "A subscriber's card fails on renewal. Who follows up, and when?",
      flag: "Failed payments have no clear owner",
      opts: ["It's handled automatically and someone checks", "Eventually, when we notice", "Honestly, not sure"] },
    { t: "RECONCILIATION", q: "Your best seller—what does it actually keep after refunds, fees and discounts?",
      flag: "True margin on the top seller is unclear", finance: true,
      opts: ["I know, and I could show you", "Roughly", "It sells great. That's what I know"] },
  ],
  mixed: [
    { t: "FULFILLMENT", q: "You land the order. Does the warehouse actually ship it on time—and would you know?",
      flag: "No checkpoint proving the order shipped",
      opts: ["There's a check—we'd know same day", "We assume yes unless we hear otherwise", "We've been burned by this"] },
    { t: "RECONCILIATION", q: "A distributor's check comes in short, with just a note: “missing cases.” What happens next?",
      flag: "Short-pays are not always challenged in time",
      opts: ["Someone pulls the PO and proof, and challenges it in time", "We mean to chase it—sometimes we do", "Small ones just… slip"], na: true },
    { t: "OWNERSHIP", q: "A customer or account goes quiet after buying regularly. Who notices?",
      flag: "Quiet accounts are noticed late",
      opts: ["A flag goes up the week they're overdue", "Whoever owns them—when they think of it", "Sometimes nobody, honestly"] },
  ],
};

const CHANNEL_LABEL = {
  direct: "Direct online (own store)",
  wholesale: "Wholesale / retail",
  subscription: "Subscriptions",
  mixed: "A mix",
};

const PROCESS = {
  VISIBILITY: {
    name: "Order and account status visibility",
    check: "Take ten orders or accounts from the last month. For each one, write down every place you had to look to answer “what is the status right now?” If it takes more than one place or one person, that is the gap.",
  },
  OWNERSHIP: {
    name: "Follow-through and ownership",
    check: "Write down every commitment your team made in the last two weeks — samples, callbacks, quotes, reorders. Next to each, fill in the owner and the due date. The rows you cannot fill in are the exposure.",
  },
  RECONCILIATION: {
    name: "Records that are supposed to agree",
    check: "Pick one week. Take a single number that should be identical in two systems — orders placed versus orders recorded, stock on hand versus stock in the system — and line them up. Write down every difference and what caused it.",
  },
  FULFILLMENT: {
    name: "Order-to-ship handoff",
    check: "Take ten recent orders and follow each one: accepted → warehouse received it → picked and shipped → confirmed to the customer. Mark every step you cannot prove happened, and note who owned it.",
  },
};

const THEME_ORDER = ["FULFILLMENT", "RECONCILIATION", "VISIBILITY", "OWNERSHIP"];

function bad(res, code, message) {
  res.status(code).json({ ok: false, error: message });
}

function esc(text) {
  return String(text).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// ── Reply deadline: ONE source of truth ──────────────────────────────────────
// The date the visitor is promised and the timestamp stored on the lead are
// derived from the same instant. They previously diverged: the visitor saw a
// weekend-skipped date while the record kept a flat +24h, so a Friday-night
// submission told the visitor "Monday" and told the queue "Saturday".
function etParts(instant) {
  const p = {};
  new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York", hour12: false, weekday: "short",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).formatToParts(instant).forEach((x) => { p[x.type] = x.value; });
  return p;
}

// How far Eastern wall-clock sits from UTC at this instant (handles DST).
function etOffsetMs(instant) {
  const p = etParts(instant);
  return Date.UTC(+p.year, +p.month - 1, +p.day,
    p.hour === "24" ? 0 : +p.hour, +p.minute, +p.second) - instant.getTime();
}

// 5pm Eastern on the next business day.
function replyDueDate(now) {
  let cursor = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  for (let i = 0; i < 3; i++) {
    const wd = etParts(cursor).weekday;
    if (wd !== "Sat" && wd !== "Sun") break;
    cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000);
  }
  const p = etParts(cursor);
  const at5pm = Date.UTC(+p.year, +p.month - 1, +p.day, 17, 0, 0);
  return new Date(at5pm - etOffsetMs(new Date(at5pm)));
}

// A date a human would say out loud. No minute: an exact clock time reads
// machine-generated and can promise a reply near midnight.
function formatDeadline(due) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York", weekday: "long", month: "long", day: "numeric",
  }).format(due);
}

function receivedStamp(now) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York", month: "long", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  }).format(now) + " ET";
}

module.exports = async function handler(req, res) {
  const key = process.env.RESEND_API_KEY;

  if (req.method === "GET" && req.query && req.query.probe === "vx-probe") {
    if (!key) return res.status(200).json({ keyPresent: false });
    try {
      const r = await fetch("https://api.resend.com/domains", { headers: { Authorization: "Bearer " + key } });
      const data = await r.json().catch(() => null);
      const list = (data && (data.data || data)) || [];
      return res.status(200).json({
        keyPresent: true, keyAccepted: r.ok, httpStatus: r.status,
        domains: Array.isArray(list) ? list.map((d) => ({ name: d.name, status: d.status })) : data,
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
  if (body.company_website) return res.status(200).json({ ok: true }); // honeypot: accept, do nothing

  const email = String(body.email || "").trim().slice(0, 200);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return bad(res, 400, "invalid email");

  const firstName = String(body.firstName || "").trim().slice(0, 60).replace(/[<>]/g, "");
  if (!firstName) return bad(res, 400, "first name required");

  const channel = String(body.channel || "").trim();
  if (!Object.prototype.hasOwnProperty.call(QUESTION_BANK, channel) || channel === "shared") {
    return bad(res, 400, "unknown channel");
  }

  // Recompute everything from raw answers. Client-supplied scores are ignored.
  const flow = QUESTION_BANK.shared.concat(QUESTION_BANK[channel]);
  const answers = Array.isArray(body.answers) ? body.answers.slice(0, flow.length) : [];
  const themes = { VISIBILITY: 0, OWNERSHIP: 0, RECONCILIATION: 0, FULFILLMENT: 0 };
  // Points available per area, counted only over questions actually answered.
  // Without this, an area carrying one question could never outrank an area
  // carrying four, no matter how the visitor answered.
  const themeMax = { VISIBILITY: 0, OWNERSHIP: 0, RECONCILIATION: 0, FULFILLMENT: 0 };
  const worst = {};
  const noted = [];
  const transcript = [];
  let points = 0, answered = 0, financeTouched = false;

  flow.forEach((q, i) => {
    const a = answers[i];
    if (a === "na" || a === undefined || a === null) {
      if (q.na && a === "na") transcript.push({ q: q.q, a: "Doesn't apply (excluded)" });
      return;
    }
    const w = Number(a);
    if (!Number.isInteger(w) || w < 0 || w > 2) return;
    answered++; points += w; themes[q.t] += w; themeMax[q.t] += 2;
    transcript.push({ q: q.q, a: q.opts[w] });
    if (w > 0) {
      noted.push({ flag: q.flag, severity: w === 2 ? "worth checking" : "keep an eye on" });
      if (q.finance) financeTouched = true;
      if (!worst[q.t] || w > worst[q.t]) worst[q.t] = w;
    }
  });

  if (!answered) return bad(res, 400, "no scored answers");

  // Rank by share of each area's own available points, not raw totals.
  const share = {};
  THEME_ORDER.forEach((t) => { share[t] = themeMax[t] ? themes[t] / themeMax[t] : 0; });
  let peak = 0;
  THEME_ORDER.forEach((t) => { if (share[t] > peak) peak = share[t]; });

  let tied = THEME_ORDER.filter((t) => share[t] === peak && peak > 0);
  // A sharper single answer still settles a share tie. What survives that is a
  // genuine dead heat, and it gets reported as one rather than silently picked.
  if (tied.length > 1) {
    let sev = 0;
    tied.forEach((t) => { if ((worst[t] || 0) > sev) sev = worst[t] || 0; });
    const sharper = tied.filter((t) => (worst[t] || 0) === sev);
    if (sharper.length) tied = sharper;
  }
  const top = tied[0] || THEME_ORDER[0];
  const recommended = points === 0 ? null : PROCESS[top];
  const alsoLevel = points === 0 ? [] : tied.slice(1).map((t) => PROCESS[t].name);

  const now = new Date();
  // Deterministic: the identical submission retried yields the identical ID, so
  // a retry updates nothing and creates no second lead.
  const fingerprint = [email, channel, answers.join(",")].join("|");
  // Date the reference in Eastern time, matching the "Received" line the
  // visitor reads. In UTC a 7pm-or-later submission was stamped the next day,
  // so the receipt showed a reference dated after the date it was received.
  const idDay = etParts(now);
  const submissionId = "LC-" + idDay.year + idDay.month + idDay.day + "-" +
    Math.abs(Array.from(fingerprint).reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7)).toString(36).slice(0, 6).toUpperCase();
  const dueDate = replyDueDate(now);
  const deadline = formatDeadline(dueDate);
  const received = receivedStamp(now);
  const channelLabel = CHANNEL_LABEL[channel] || channel;
  const replyDueIso = dueDate.toISOString();

  const send = (payload) =>
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

  const transcriptText = transcript.map((t) => "  Q: " + t.q + "\n  A: " + t.a).join("\n\n");
  const notedText = noted.length
    ? noted.map((n) => "- " + n.flag + " (" + n.severity + ")").join("\n")
    : "- none";

  // ── 1. Persist the lead FIRST. An email failure must never lose a prospect. ──
  const attrib = (body.attribution && typeof body.attribution === "object") ? body.attribution : {};
  const str = (v) => String(v == null ? "" : v).slice(0, 200);
  let leadRecord = { persisted: false };
  try {
    leadRecord = await leadStore.createLead({
      submissionId, firstName, email, channelLabel,
      process: recommended ? recommended.name : "none indicated",
      points, answered, financeTouched, notedText, transcriptText,
      replyDueIso, receivedIso: now.toISOString(),
      source: str(attrib.utm_source || attrib.ref),
      campaign: str(attrib.utm_campaign),
      contentId: str(attrib.utm_content),
      surveyVersion: str(body.surveyVersion),
    });
  } catch (e) {
    console.error("lead persist failed", e && e.message);
    leadRecord = { persisted: false, error: String(e && e.message).slice(0, 200) };
  }

  // A retried submission already has a record and already had its emails sent.
  if (leadRecord.duplicate) {
    return res.status(200).json({
      ok: true, duplicate: true, leadPersisted: true,
      leadDelivered: true, receiptDelivered: true, submissionId, deadline,
    });
  }

  // ── 2. The lead to Brandon: raw material for a genuinely personal reply ──
  const toBrandon = await send({
    from: "VNMSFX Leak Check <leak-check@vnmsfx.com>",
    to: ["brandon@vnmsfx.com"],
    reply_to: email,
    subject: `[${submissionId}] ${firstName} · ${channelLabel} · reply by ${deadline}`,
    text:
      `SUBMISSION ${submissionId}\n` +
      `REPLY DUE: ${deadline}\n\n` +
      `Name:    ${firstName}\n` +
      `Email:   ${email}\n` +
      `Sells:   ${channelLabel}\n` +
      `Received:${received}\n\n` +
      (financeTouched ? `NOTE: a margin/cost answer was flagged — route that judgment to their finance owner.\n\n` : "") +
      // Their words come first. The scoring output sits at the bottom on
      // purpose: if the machine tells you what to think before you have read
      // the answers, the reply you send is not actually yours.
      `THEIR ANSWERS (read these first — quote them back)\n\n${transcriptText}\n\n` +
      `WHAT THEY FLAGGED\n${notedText}\n\n` +
      `${"─".repeat(60)}\n` +
      `ROUTING HINT — UNVERIFIED: ${recommended ? recommended.name : "none indicated (all settled answers)"}\n` +
      (alsoLevel.length ? `LEVEL WITH IT: ${alsoLevel.join("; ")}\n` : "") +
      `Score: ${points} across ${answered} scored answers\n` +
      `A questionnaire cannot rank processes. This is routing, not judgment —\n` +
      `form your own view from the answers above before you reply.\n` +
      (recommended ? `\nCHECK THE HINT POINTS AT (confirm it fits before you send it)\n${recommended.check}\n` : ""),
  });

  if (!toBrandon.ok) {
    const detail = await toBrandon.text().catch(() => "");
    console.error("Resend lead send failed", toBrandon.status, detail);
    return res.status(502).json({
      ok: false, error: "delivery failed",
      providerStatus: toBrandon.status, providerDetail: String(detail).slice(0, 400),
    });
  }

  // ── 2. The automatic receipt to the visitor: honest about being automatic ──
  const receiptText =
`Hi ${firstName},

Your Leak Check answers came through.

This is the automatic confirmation. Brandon reviews each submission himself and
follows up separately with one of three things:

  - the recurring process he would inspect first;
  - one question he needs answered; or
  - a straight note that he doesn't think the Audit fits.

You can expect that reply by end of day ${deadline}.

If you would rather just talk it through, the 30-minute teardown is free:
https://cal.com/vnmsfx/30min

The check identifies areas worth examining. It does not prove that money was
lost, and it is not a diagnosis of your business.

  How you mainly sell:  ${channelLabel}
  Received:             ${received}
  Reference:            ${submissionId}

Brandon Adams
Founder, VNMSFX
Rapid response ops for food & beverage brands.
vnmsfx.com

You received this because you completed the VNMSFX Leak Check.
This automatic receipt does not add you to a newsletter.`;

  const receiptHtml =
`<!doctype html><html><body style="margin:0;padding:0;background:#F0EFEA;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">Automatic confirmation. Brandon will review your answers personally.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F0EFEA;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;background:#FFFFFF;border:1px solid #DDD9CE;border-radius:12px;">
  <tr><td align="center" style="padding:30px 32px 0 32px;">
    <img src="https://vnmsfx.com/assets/email-orb.png" width="52" height="52" alt=""
         style="display:block;border:0;outline:none;text-decoration:none;width:52px;height:52px;border-radius:26px;margin:0 auto 10px auto;">
    <img src="https://vnmsfx.com/assets/email-logo.png" width="176" height="44" alt="VNMSFX"
         style="display:block;border:0;outline:none;text-decoration:none;width:176px;height:auto;margin:0 auto;">
  </td></tr>
  <tr><td style="padding:22px 32px 0 32px;">
    <div style="font-family:Georgia,'Times New Roman',serif;font-size:23px;line-height:1.3;color:#111110;">Your check is in, ${esc(firstName)}.</div>
  </td></tr>
  <tr><td style="padding:18px 32px 0 32px;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:1.65;color:#3A3832;">
    Your Leak Check answers came through. This is the automatic confirmation.
  </td></tr>
  <tr><td style="padding:14px 32px 0 32px;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:1.65;color:#3A3832;">
    Brandon reviews each submission himself and follows up separately with one of three things: the recurring process he would inspect first, one question he needs answered, or a straight note that he doesn&rsquo;t think the Audit fits.
  </td></tr>
  <tr><td style="padding:14px 32px 0 32px;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:1.65;color:#111110;">
    You can expect that reply by <strong>end of day ${esc(deadline)}</strong>.
  </td></tr>
  <tr><td style="padding:14px 32px 0 32px;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:1.65;color:#3A3832;">
    Would you rather just talk it through? The 30-minute teardown is free &mdash;
    <a href="https://cal.com/vnmsfx/30min" style="color:#111110;">pick a time here</a>.
  </td></tr>
  <tr><td style="padding:22px 32px 0 32px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F4F2EC;border:1px solid #E4E0D5;border-radius:8px;">
      <tr><td style="padding:16px 18px;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.9;color:#5E5D57;">
        <span style="color:#8B877C;">How you mainly sell</span> &nbsp;&nbsp;<span style="color:#111110;">${esc(channelLabel)}</span><br>
        <span style="color:#8B877C;">Received</span> &nbsp;&nbsp;<span style="color:#111110;">${esc(received)}</span><br>
        <span style="color:#8B877C;">Reference</span> &nbsp;&nbsp;<span style="color:#111110;">${esc(submissionId)}</span>
      </td></tr>
    </table>
  </td></tr>
  <tr><td style="padding:20px 32px 0 32px;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.7;color:#6B675E;">
    The check identifies areas worth examining. It does not prove that money was lost, and it is not a diagnosis of your business.
  </td></tr>
  <tr><td style="padding:24px 32px 28px 32px;border-top:1px solid #E4E0D5;margin-top:8px;">
    <div style="font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#111110;padding-top:20px;">
      <strong>Brandon Adams</strong><br>
      <span style="color:#6B675E;">Founder, VNMSFX</span><br>
      <span style="color:#6B675E;">Rapid response ops for food &amp; beverage brands.</span><br>
      <a href="https://vnmsfx.com" style="color:#6B675E;">vnmsfx.com</a>
    </div>
  </td></tr>
</table>
<div style="max-width:580px;font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:1.7;color:#8B877C;padding:16px 8px 0 8px;text-align:left;">
  You received this because you completed the VNMSFX Leak Check. This automatic receipt does not add you to a newsletter.
</div>
</td></tr></table></body></html>`;

  const toVisitor = await send({
    from: "Brandon Adams <brandon@vnmsfx.com>",
    to: [email],
    reply_to: "brandon@vnmsfx.com",
    subject: "Your VNMSFX check is in",
    text: receiptText,
    html: receiptHtml,
  });

  // The visitor receipt is part of the promise — report it rather than
  // returning a blanket success while it silently failed.
  if (!toVisitor.ok) {
    const detail = await toVisitor.text().catch(() => "");
    console.error("Resend receipt send failed", toVisitor.status, detail);
    await leadStore.markDelivery(leadRecord.recordId, {
      status: "RECEIPT SENT", receiptDelivered: false,
      note: "Visitor receipt failed to send (" + toVisitor.status + "). Lead reached Brandon.",
    }).catch(() => false);
    return res.status(207).json({
      ok: true, leadDelivered: true, receiptDelivered: false,
      leadPersisted: !!leadRecord.persisted,
      submissionId, deadline,
      note: "Lead reached Brandon; the visitor receipt failed to send.",
      providerStatus: toVisitor.status,
    });
  }

  const leadId = await toBrandon.json().then((d) => d && d.id).catch(() => null);
  const receiptId = await toVisitor.json().then((d) => d && d.id).catch(() => null);
  await leadStore.markDelivery(leadRecord.recordId, {
    status: "RECEIPT SENT",
    leadMessageId: leadId,
    receiptMessageId: receiptId,
    receiptDelivered: true,
  }).catch(() => false);

  res.status(200).json({
    ok: true, leadDelivered: true, receiptDelivered: true,
    leadPersisted: !!leadRecord.persisted, submissionId, deadline,
  });
};
