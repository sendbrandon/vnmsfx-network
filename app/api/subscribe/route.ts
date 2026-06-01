import { NextResponse } from "next/server";
import crypto from "node:crypto";
import {
  getInterestLabel,
  normalizeInterestIds,
  type ShowInterestId,
} from "@/app/lib/audience";

const MAILCHIMP_API_VERSION = "3.0";
const TAG_BY_INTEREST: Record<ShowInterestId, string> = {
  hank_beans_roar: "VNMSFX: Hank, Beans & Roar",
  checkpoint_chisme: "VNMSFX: Checkpoint Chisme",
  rex_and_crow: "VNMSFX: Rex & Crow",
  gptea: "VNMSFX: GPTea",
  everything: "VNMSFX: Everything",
};

function isEmail(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  );
}

function getMailchimpServerPrefix(apiKey: string) {
  return (
    process.env.MAILCHIMP_SERVER_PREFIX ||
    apiKey.split("-").at(-1) ||
    ""
  ).trim();
}

function getSubscriberHash(email: string) {
  return crypto
    .createHash("md5")
    .update(email.trim().toLowerCase())
    .digest("hex");
}

async function readMailchimpError(response: Response) {
  const payload = (await response.json().catch(() => null)) as {
    detail?: string;
    title?: string;
  } | null;

  return payload?.detail || payload?.title || "Mailchimp request failed.";
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as {
    email?: unknown;
    interests?: unknown;
    source?: unknown;
  } | null;

  if (!payload || !isEmail(payload.email)) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );
  }

  const interests = normalizeInterestIds(payload.interests);

  if (!interests.length) {
    return NextResponse.json(
      { error: "Pick at least one VNMSFX drop." },
      { status: 400 },
    );
  }

  const apiKey = process.env.MAILCHIMP_API_KEY;
  const audienceId = process.env.MAILCHIMP_AUDIENCE_ID;
  const serverPrefix = apiKey ? getMailchimpServerPrefix(apiKey) : "";

  if (!apiKey || !audienceId || !serverPrefix) {
    return NextResponse.json(
      { error: "Email service is not configured yet." },
      { status: 503 },
    );
  }

  const source = typeof payload.source === "string" ? payload.source : "site";
  const interestLabels = interests.map(getInterestLabel);
  const normalizedEmail = payload.email.trim().toLowerCase();
  const subscriberHash = getSubscriberHash(normalizedEmail);
  const baseUrl = `https://${serverPrefix}.api.mailchimp.com/${MAILCHIMP_API_VERSION}`;
  const authHeader = `Basic ${Buffer.from(`vnmsfx:${apiKey}`).toString(
    "base64",
  )}`;
  const statusIfNew =
    process.env.MAILCHIMP_DOUBLE_OPT_IN === "true" ? "pending" : "subscribed";

  const memberPayload = {
    email_address: normalizedEmail,
    status_if_new: statusIfNew,
  };

  const memberResponse = await fetch(
    `${baseUrl}/lists/${audienceId}/members/${subscriberHash}`,
    {
      method: "PUT",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(memberPayload),
    },
  );

  if (!memberResponse.ok) {
    const error = await readMailchimpError(memberResponse);
    console.error("Mailchimp subscribe failed", {
      status: memberResponse.status,
      error,
      source,
      interests: interestLabels,
    });

    return NextResponse.json(
      { error: "Could not finish signup. Try again in a minute." },
      { status: 502 },
    );
  }

  const tagResponse = await fetch(
    `${baseUrl}/lists/${audienceId}/members/${subscriberHash}/tags`,
    {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tags: [
          { name: "VNMSFX Correspondent", status: "active" },
          ...interests.map((interest) => ({
            name: TAG_BY_INTEREST[interest],
            status: "active",
          })),
        ],
      }),
    },
  );

  if (!tagResponse.ok) {
    const error = await readMailchimpError(tagResponse);
    console.error("Mailchimp tag update failed", {
      status: tagResponse.status,
      error,
      source,
      interests: interestLabels,
    });

    return NextResponse.json(
      { error: "Signup saved, but show preferences could not be tagged." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
