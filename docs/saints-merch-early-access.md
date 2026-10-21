# Hoodie early access — compact implementation

User wants email signup for Nix or Rook plus S–3XL on the approved page while samples are pending. Preserve artwork, video, headings, descriptions and prices. Replace purchase entry buttons with Get early access; a dialog collects email, character and size with explicit release-email consent. No reservation, order, inventory deduction or automatic email is implied.

Expertise-engine DRILL: a browser acknowledgement is not durable consent. Server validates bounded email/allowlisted product and size, origin and consent, rejects a honeypot, then stores a purpose-scoped record before returning success. Retries use a deterministic fingerprint; no client email/preferences in localStorage or logs. On storage failure show retryable error without success. Existing Notion/Airtable lead-store path is already configured in Vercel previews; reuse its isolated campaign/channel labels rather than create new storage or use the unconfigured Stripe/Supabase providers.

Architecture: approved product card -> early-access dialog -> same-origin /api/saints-merch?action=early-access -> server/merch/early-access.js -> existing private lead store -> saved acknowledgement. No new function slot. Existing film, checkout and fulfillment gates unchanged. No subscriber email sends in this slice.

Program: new early-access.js createHandler({store, env}), POST(email,product,size,consent,company_website); GET returns acceptingSignups. Merch HTTP delegates this action before payment-provider construction. New standalone client/dialog code preselects card product/size and overrides only purchase CTAs and header bag access. Durable receipt stores consent version, release campaign, product/size, timestamp and source. Form resets sensitive fields after close; no reflected email output. Input/state + failure tests, existing regression suite, live saved record readback, desktop/mobile browser verification.

Rollout: branch preview plus local approved page first; only a real saved record can produce success. Public page/media hosting and public release verified separately. Do not represent localhost or authenticated preview as a public signup URL.
