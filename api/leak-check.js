// Leak Check intake — Vercel serverless function.
//
// One visitor-initiated submission produces exactly two emails:
//   1. an honest automatic RECEIPT to the visitor — transparent about being
//      automatic, no booking CTA, no claim that money was lost; and
//   2. the lead to Brandon, carrying the raw material he needs to write a
//      genuinely personal reply (their name, channel, and their actual answers).
//
// The score is recomputed HERE from the raw answers. Labels, themes and the
// recommended process supplied by the browser are ignored — a caller cannot
// dictate its own result. Nothing is stored by this function; the lead email
// carries a submission ID and an exact reply-by deadline so the promise on the
// page is traceable in the inbox.

const QUESTION_BANK = {
  shared: [
    { t: "VISIBILITY", q: "Your biggest account emails: “Where's our order?” How long until you have the real answer?",
      flag: "Status answers take a hunt",
      opts: ["Under a minute—one place has it", "I check a few tools and ask around", "Depends who's in that day"] },
    { t: "OWNERSHIP", q: "You promised a buyer samples and a follow-up call next week. Where does that promise live right now?",
      flag: "Promises live in memory",
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
  ],
  direct: [
    { t: "FULFILLMENT", q: "An order needed to go out today and didn't. Would you know before the customer told you?",
      flag: "Late shipments surface from the customer",
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

// Next business day at the same clock time, rendered in Eastern time.
function replyDeadline(now) {
  const due = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const dayET = Number(
    new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "short" })
      .format(due) === "Sat" ? 2 : 0
  );
  let adjusted = new Date(due.getTime() + dayET * 24 * 60 * 60 * 1000);
  const wd = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "short" }).format(adjusted);
  if (wd === "Sun") adjusted = new Date(adjusted.getTime() + 24 * 60 * 60 * 1000);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York", weekday: "long", month: "long", day: "numeric",
    hour: "numeric", minute: "2-digit",
  }).format(adjusted) + " ET";
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
    answered++; points += w; themes[q.t] += w;
    transcript.push({ q: q.q, a: q.opts[w] });
    if (w > 0) {
      noted.push({ flag: q.flag, severity: w === 2 ? "worth checking" : "keep an eye on" });
      if (q.finance) financeTouched = true;
      if (!worst[q.t] || w > worst[q.t]) worst[q.t] = w;
    }
  });

  if (!answered) return bad(res, 400, "no scored answers");

  let top = THEME_ORDER[0];
  THEME_ORDER.forEach((t) => {
    if (themes[t] > themes[top]) top = t;
    else if (themes[t] === themes[top] && (worst[t] || 0) > (worst[top] || 0)) top = t;
  });
  const recommended = points === 0 ? null : PROCESS[top];

  const now = new Date();
  const submissionId = "LC-" + now.toISOString().slice(0, 10).replace(/-/g, "") + "-" +
    Math.abs(Array.from(email).reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7)).toString(36).slice(0, 5).toUpperCase();
  const deadline = replyDeadline(now);
  const received = receivedStamp(now);
  const channelLabel = CHANNEL_LABEL[channel] || channel;

  const send = (payload) =>
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

  // ── 1. The lead to Brandon: raw material for a genuinely personal reply ──
  const transcriptText = transcript.map((t) => "  Q: " + t.q + "\n  A: " + t.a).join("\n\n");
  const notedText = noted.length
    ? noted.map((n) => "- " + n.flag + " (" + n.severity + ")").join("\n")
    : "- none";

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
      `RECOMMENDED FIRST PROCESS: ${recommended ? recommended.name : "none indicated (all settled answers)"}\n` +
      `Score: ${points} across ${answered} scored answers\n` +
      (financeTouched ? `NOTE: a margin/cost answer was flagged — route that judgment to their finance owner.\n` : "") +
      `\nWHAT THEY FLAGGED\n${notedText}\n\n` +
      `THEIR ANSWERS (quote these back in your reply)\n\n${transcriptText}\n\n` +
      (recommended ? `SUGGESTED FIRST CHECK\n${recommended.check}\n` : ""),
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

You can expect that reply by ${deadline}.

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
    You can expect that reply by <strong>${esc(deadline)}</strong>.
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
    return res.status(207).json({
      ok: true, leadDelivered: true, receiptDelivered: false,
      submissionId, deadline,
      note: "Lead reached Brandon; the visitor receipt failed to send.",
      providerStatus: toVisitor.status,
    });
  }

  res.status(200).json({ ok: true, leadDelivered: true, receiptDelivered: true, submissionId, deadline });
};
