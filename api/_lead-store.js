// Durable lead record (Airtable).
//
// The lead is written BEFORE any email is sent, so an email-provider problem
// can never erase a prospect. Writes are idempotent on Submission ID: the same
// submission retried produces one record, never two.
//
// If the Airtable environment is absent the caller still proceeds — email keeps
// working — but the response says the lead was not persisted rather than
// implying a durable record exists.

const TABLE_DEFAULT = "Leads";

function cfg() {
  const token = process.env.AIRTABLE_TOKEN;
  const base = process.env.AIRTABLE_BASE_ID;
  if (!token || !base) return null;
  return {
    token,
    base,
    table: process.env.AIRTABLE_TABLE || TABLE_DEFAULT,
  };
}

function api(c, path, init) {
  return fetch(
    "https://api.airtable.com/v0/" + c.base + "/" + encodeURIComponent(c.table) + (path || ""),
    Object.assign({ headers: { Authorization: "Bearer " + c.token, "Content-Type": "application/json" } }, init)
  );
}

// Returns the existing record id for this submission, or null.
async function findExisting(c, submissionId) {
  const formula = encodeURIComponent(`{Submission ID}="${submissionId}"`);
  const r = await api(c, "?maxRecords=1&filterByFormula=" + formula, { method: "GET" });
  if (!r.ok) throw new Error("airtable lookup " + r.status + " " + (await r.text().catch(() => "")).slice(0, 200));
  const data = await r.json();
  return data.records && data.records.length ? data.records[0].id : null;
}

/**
 * Create the lead record. Idempotent: returns {duplicate:true} if this exact
 * submission already exists.
 */
async function createLead(lead) {
  const c = cfg();
  if (!c) return { persisted: false, reason: "airtable not configured" };

  const existing = await findExisting(c, lead.submissionId);
  if (existing) return { persisted: true, duplicate: true, recordId: existing };

  const fields = {
    "Submission ID": lead.submissionId,
    "First Name": lead.firstName,
    "Email": lead.email,
    "Sells": lead.channelLabel,
    "Status": "NEW",
    "Owner": "Brandon",
    "Next Action": "Send the personal reply",
    "Reply Due": lead.replyDueIso,
    "Recommended Process": lead.process,
    "Score": lead.points,
    "Answered": lead.answered,
    "Finance Flagged": !!lead.financeTouched,
    "Areas Noted": lead.notedText,
    "Answers": lead.transcriptText,
    "Source": lead.source || "",
    "Campaign": lead.campaign || "",
    "Content ID": lead.contentId || "",
    "Survey Version": lead.surveyVersion || "",
    "Received": lead.receivedIso,
  };
  // Drop empty optional values so a missing Airtable column cannot fail the write.
  Object.keys(fields).forEach((k) => { if (fields[k] === "" || fields[k] === undefined) delete fields[k]; });

  const r = await api(c, "", {
    method: "POST",
    body: JSON.stringify({ records: [{ fields }], typecast: true }),
  });
  if (!r.ok) {
    const detail = (await r.text().catch(() => "")).slice(0, 300);
    throw new Error("airtable create " + r.status + " " + detail);
  }
  const data = await r.json();
  return { persisted: true, duplicate: false, recordId: data.records[0].id };
}

/** Record what actually happened with delivery, after the sends. */
async function markDelivery(recordId, patch) {
  const c = cfg();
  if (!c || !recordId) return false;
  const fields = {};
  if (patch.status) fields["Status"] = patch.status;
  if (patch.leadMessageId) fields["Lead Message ID"] = patch.leadMessageId;
  if (patch.receiptMessageId) fields["Receipt Message ID"] = patch.receiptMessageId;
  if (typeof patch.receiptDelivered === "boolean") fields["Receipt Delivered"] = patch.receiptDelivered;
  if (patch.note) fields["Notes"] = patch.note;
  if (!Object.keys(fields).length) return false;
  const r = await api(c, "/" + recordId, { method: "PATCH", body: JSON.stringify({ fields, typecast: true }) });
  return r.ok;
}

module.exports = { createLead, markDelivery, configured: () => !!cfg() };
