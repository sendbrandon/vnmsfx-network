// Durable lead record — Notion (preferred) or Airtable.
//
// The lead is written BEFORE any email is sent, so an email-provider problem
// can never erase a prospect. Writes are idempotent on Submission ID: the same
// submission retried produces one record, never two.
//
// Backend selection is by environment, so the store can change without
// touching the handler:
//   NOTION_TOKEN + NOTION_DATABASE_ID   -> Notion
//   AIRTABLE_TOKEN + AIRTABLE_BASE_ID   -> Airtable
//   neither                             -> not persisted (email still sends)
//
// With no backend configured the caller still proceeds and the response says
// the lead was not persisted, rather than implying a durable record exists.

const NOTION_VERSION = "2022-06-28";

function backend() {
  if (process.env.NOTION_TOKEN && process.env.NOTION_DATABASE_ID) {
    return { kind: "notion", token: process.env.NOTION_TOKEN, db: process.env.NOTION_DATABASE_ID };
  }
  if (process.env.AIRTABLE_TOKEN && process.env.AIRTABLE_BASE_ID) {
    return {
      kind: "airtable",
      token: process.env.AIRTABLE_TOKEN,
      base: process.env.AIRTABLE_BASE_ID,
      table: process.env.AIRTABLE_TABLE || "Leads",
    };
  }
  return null;
}

/* ───────────────────────────── Notion ───────────────────────────── */

function notionFetch(b, path, init) {
  return fetch("https://api.notion.com/v1" + path, Object.assign({
    headers: {
      Authorization: "Bearer " + b.token,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
  }, init));
}

const text = (v) => ({ rich_text: [{ text: { content: String(v == null ? "" : v).slice(0, 1900) } }] });

// The reference number ends with a date-free hash of email+channel+answers.
// Deduplicate on THAT, never on the whole reference number, which carries the
// date and so failed to match an identical retry across midnight.
function fingerprintOf(lead) {
  return lead.fingerprint || String(lead.submissionId).split("-").pop();
}

// A week. Long enough to catch any retry or double-submit; short enough that
// someone re-taking the check months later still reaches Brandon as new
// information rather than being silently swallowed as a duplicate.
const DEDUPE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

function dedupeSince(lead) {
  const base = Date.parse(lead.receivedIso);
  return new Date((Number.isFinite(base) ? base : Date.now()) - DEDUPE_WINDOW_MS).toISOString();
}

async function notionFind(b, lead) {
  const r = await notionFetch(b, "/databases/" + b.db + "/query", {
    method: "POST",
    body: JSON.stringify({
      page_size: 1,
      // Email is part of the match on purpose. The hash is short, so on its own
      // a collision could silently drop a different person's lead — a worse
      // failure than the duplicate this fixes. Both must agree.
      filter: {
        and: [
          { property: "Email", email: { equals: lead.email } },
          { property: "Submission ID", title: { ends_with: "-" + fingerprintOf(lead) } },
          { property: "Received", date: { on_or_after: dedupeSince(lead) } },
        ],
      },
    }),
  });
  if (!r.ok) throw new Error("notion query " + r.status + " " + (await r.text().catch(() => "")).slice(0, 200));
  const data = await r.json();
  return data.results && data.results.length ? data.results[0].id : null;
}

async function notionCreate(b, lead) {
  const existing = await notionFind(b, lead);
  if (existing) return { persisted: true, duplicate: true, recordId: existing };

  const properties = {
    "Submission ID": { title: [{ text: { content: lead.submissionId } }] },
    "First Name": text(lead.firstName),
    "Email": { email: lead.email },
    "Sells": text(lead.channelLabel),
    "Status": { select: { name: "NEW" } },
    "Owner": text("Brandon"),
    "Next Action": text("Send the personal reply"),
    "Reply Due": { date: { start: lead.replyDueIso } },
    // Named a hint, not a recommendation: a questionnaire cannot rank
    // processes, and the column heading should not imply that it can.
    "Routing Hint (unverified)": text(lead.process),
    "Score": { number: lead.points },
    "Answered": { number: lead.answered },
    "Finance Flagged": { checkbox: !!lead.financeTouched },
    "Areas Noted": text(lead.notedText),
    "Answers": text(lead.transcriptText),
    "Source": text(lead.source),
    "Campaign": text(lead.campaign),
    "Content ID": text(lead.contentId),
    "Survey Version": text(lead.surveyVersion),
    "Received": { date: { start: lead.receivedIso } },
  };

  const r = await notionFetch(b, "/pages", {
    method: "POST",
    body: JSON.stringify({ parent: { database_id: b.db }, properties }),
  });
  if (!r.ok) throw new Error("notion create " + r.status + " " + (await r.text().catch(() => "")).slice(0, 300));
  const data = await r.json();
  return { persisted: true, duplicate: false, recordId: data.id };
}

async function notionPatch(b, recordId, patch) {
  const properties = {};
  if (patch.status) properties["Status"] = { select: { name: patch.status } };
  if (patch.leadMessageId) properties["Lead Message ID"] = text(patch.leadMessageId);
  if (patch.receiptMessageId) properties["Receipt Message ID"] = text(patch.receiptMessageId);
  if (typeof patch.receiptDelivered === "boolean") properties["Receipt Delivered"] = { checkbox: patch.receiptDelivered };
  if (patch.note) properties["Notes"] = text(patch.note);
  if (!Object.keys(properties).length) return false;
  const r = await notionFetch(b, "/pages/" + recordId, { method: "PATCH", body: JSON.stringify({ properties }) });
  return r.ok;
}

/* ──────────────────────────── Airtable ──────────────────────────── */

function airFetch(b, path, init) {
  return fetch("https://api.airtable.com/v0/" + b.base + "/" + encodeURIComponent(b.table) + (path || ""),
    Object.assign({ headers: { Authorization: "Bearer " + b.token, "Content-Type": "application/json" } }, init));
}

async function airCreate(b, lead) {
  // Same rule as Notion: match the date-free hash plus the email, inside the
  // dedupe window — never the dated reference number.
  const fp = String(fingerprintOf(lead)).replace(/"/g, "");
  const addr = String(lead.email || "").replace(/"/g, "");
  const formula = encodeURIComponent(
    `AND({Email}="${addr}",RIGHT({Submission ID},${fp.length + 1})="-${fp}",` +
    `IS_AFTER({Received},"${dedupeSince(lead)}"))`
  );
  const look = await airFetch(b, "?maxRecords=1&filterByFormula=" + formula, { method: "GET" });
  if (!look.ok) throw new Error("airtable lookup " + look.status);
  const found = await look.json();
  if (found.records && found.records.length) {
    return { persisted: true, duplicate: true, recordId: found.records[0].id };
  }
  const fields = {
    "Submission ID": lead.submissionId, "First Name": lead.firstName, "Email": lead.email,
    "Sells": lead.channelLabel, "Status": "NEW", "Owner": "Brandon",
    "Next Action": "Send the personal reply", "Reply Due": lead.replyDueIso,
    "Routing Hint (unverified)": lead.process, "Score": lead.points, "Answered": lead.answered,
    "Finance Flagged": !!lead.financeTouched, "Areas Noted": lead.notedText,
    "Answers": lead.transcriptText, "Source": lead.source, "Campaign": lead.campaign,
    "Content ID": lead.contentId, "Survey Version": lead.surveyVersion, "Received": lead.receivedIso,
  };
  Object.keys(fields).forEach((k) => { if (fields[k] === "" || fields[k] === undefined) delete fields[k]; });
  const r = await airFetch(b, "", { method: "POST", body: JSON.stringify({ records: [{ fields }], typecast: true }) });
  if (!r.ok) throw new Error("airtable create " + r.status + " " + (await r.text().catch(() => "")).slice(0, 300));
  const data = await r.json();
  return { persisted: true, duplicate: false, recordId: data.records[0].id };
}

async function airPatch(b, recordId, patch) {
  const fields = {};
  if (patch.status) fields["Status"] = patch.status;
  if (patch.leadMessageId) fields["Lead Message ID"] = patch.leadMessageId;
  if (patch.receiptMessageId) fields["Receipt Message ID"] = patch.receiptMessageId;
  if (typeof patch.receiptDelivered === "boolean") fields["Receipt Delivered"] = patch.receiptDelivered;
  if (patch.note) fields["Notes"] = patch.note;
  if (!Object.keys(fields).length) return false;
  const r = await airFetch(b, "/" + recordId, { method: "PATCH", body: JSON.stringify({ fields, typecast: true }) });
  return r.ok;
}

/* ───────────────────────────── Public ───────────────────────────── */

async function createLead(lead) {
  const b = backend();
  if (!b) return { persisted: false, reason: "no lead store configured" };
  return b.kind === "notion" ? notionCreate(b, lead) : airCreate(b, lead);
}

async function markDelivery(recordId, patch) {
  const b = backend();
  if (!b || !recordId) return false;
  return b.kind === "notion" ? notionPatch(b, recordId, patch) : airPatch(b, recordId, patch);
}

module.exports = { createLead, markDelivery, configured: () => !!backend(), backendKind: () => (backend() || {}).kind || null };
