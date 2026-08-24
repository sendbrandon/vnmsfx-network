// Regression test for lead deduplication.  Run:  node api/_lead-store.test.js
//
// Guards the bug found in production on 2026-08-11: the reference number is
// LC-<date>-<hash> and was also the idempotency key, so the same submission
// six minutes apart — 11:55 PM and 12:01 AM Eastern — produced two keys, two
// leads and two receipt emails to one person.
//
// It also guards the two ways a careless fix would be WORSE than the bug:
// matching on the short hash alone would silently discard a different
// person's lead, and matching forever would swallow a genuine re-take.
//
// No network. A stub stands in for Notion and answers queries out of an array.

process.env.NOTION_TOKEN = "stub";
process.env.NOTION_DATABASE_ID = "stubdb";
delete process.env.AIRTABLE_TOKEN;

const store = require("./_lead-store.js");

let DB = [], LAST_CREATE = null;
global.fetch = async (url, opts) => {
  const body = opts && opts.body ? JSON.parse(opts.body) : {};
  if (String(url).endsWith("/query")) {
    const c = body.filter.and;
    const email = c.find((x) => x.property === "Email").email.equals;
    const suffix = c.find((x) => x.property === "Submission ID").title.ends_with;
    const since = c.find((x) => x.property === "Received").date.on_or_after;
    const hit = DB.filter((r) =>
      r.email === email && r.id.endsWith(suffix) && Date.parse(r.received) >= Date.parse(since));
    return { ok: true, json: async () => ({ results: hit.slice(0, 1).map((r) => ({ id: "page-" + r.id })) }) };
  }
  const p = body.properties;
  LAST_CREATE = body;
  DB.push({
    id: p["Submission ID"].title[0].text.content,
    email: p["Email"].email,
    received: p["Received"].date.start,
  });
  return { ok: true, json: async () => ({ id: "page-new" }) };
};

const lead = (over) => Object.assign({
  submissionId: "LC-20260810-ABC123", fingerprint: "ABC123",
  firstName: "Dana", email: "dana@example.com", channelLabel: "Direct",
  process: "x", points: 4, answered: 10, financeTouched: false,
  notedText: "-", transcriptText: "-", source: "", campaign: "", contentId: "",
  surveyVersion: "v3", replyDueIso: "2026-08-11T21:00:00.000Z",
  receivedIso: "2026-08-10T23:55:00.000Z",
}, over);

const CASES = [
  ["identical retry across midnight -> duplicate", true,
    { submissionId: "LC-20260811-ABC123", receivedIso: "2026-08-11T00:01:00.000Z" }],
  ["exact same-day retry -> duplicate", true, {}],
  ["same hash, different person -> NOT a duplicate", false,
    { email: "someone.else@example.com" }],
  ["identical re-take 30 days later -> NOT a duplicate", false,
    { submissionId: "LC-20260910-ABC123", receivedIso: "2026-09-09T12:00:00.000Z" }],
  ["same person, different answers -> NOT a duplicate", false,
    { submissionId: "LC-20260810-ZZZ999", fingerprint: "ZZZ999" }],
];

(async () => {
  let failed = 0;

  for (const [name, wantDuplicate, second] of CASES) {
    DB = [];
    await store.createLead(lead());
    const r = await store.createLead(lead(second));
    const ok = (r.duplicate === true) === wantDuplicate && DB.length === (wantDuplicate ? 1 : 2);
    if (!ok) failed++;
    console.log(`  ${ok ? "PASS" : "FAIL"}  ${name.padEnd(50)} rows=${DB.length}`);
  }

  // The store must still deduplicate if a caller forgets to pass the hash.
  DB = [];
  await store.createLead(lead({ fingerprint: undefined }));
  const r = await store.createLead(lead({
    fingerprint: undefined, submissionId: "LC-20260811-ABC123", receivedIso: "2026-08-11T00:01:00.000Z",
  }));
  const ok = r.duplicate === true && DB.length === 1;
  if (!ok) failed++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${"hash not passed -> derived from the ID".padEnd(50)} rows=${DB.length}`);

  // A complete answer transcript must not be cut at Notion's single-item
  // 2,000-character limit, and the record must carry exactly one clear task.
  DB = []; LAST_CREATE = null;
  const completeTranscript = "answer-receipt-".repeat(320);
  await store.createLead(lead({ transcriptText: completeTranscript }));
  const properties = LAST_CREATE && LAST_CREATE.properties;
  const savedTranscript = properties && properties.Answers.rich_text
    .map((item) => item.text.content).join("");
  const taskOk = savedTranscript === completeTranscript &&
    properties.Status.select.name === "NEW" &&
    properties.Owner.rich_text[0].text.content === "Brandon" &&
    properties["Next Action"].rich_text[0].text.content === "Send the personal reply" &&
    Boolean(properties["Reply Due"].date.start);
  if (!taskOk) failed++;
  console.log(`  ${taskOk ? "PASS" : "FAIL"}  ${"complete transcript + one reply task".padEnd(50)} chars=${savedTranscript ? savedTranscript.length : 0}`);

  console.log(failed ? `\n${failed} FAILING` : `\nAll ${CASES.length + 2} pass.`);
  process.exit(failed ? 1 : 0);
})();
