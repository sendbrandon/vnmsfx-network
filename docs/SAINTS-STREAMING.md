# Saints streaming — implementation contract

Status: local implementation, external services/configuration and live acceptance pending. Existing advertising site and free marketing Season Pass are separate products and remain unchanged.

## Product
Episode 1 is the complete Opening 2 film, free without login. Episode 2 is unreleased, paid at USD 2.99 when enabled. Viewers sign in by email, choose a purchase, pay through Stripe, and return to My Library. Subscription options are draft USD 7.99/month, 39.99/6 months, 69.99/year; do not enable sales until renewal/access terms and cadence are approved. Downloads are outside this first implementation.

## Architecture / trust boundary
Static storefront and library → Vercel `api/saints.js` → Supabase verified user and service-role purchase records → Stripe authoritative payment/subscription status → short-lived Mux RS256 playback JWT. The browser cannot write purchase records, choose prices, authorize itself or supply a playback ID. Browser return URLs never grant access. Signed Stripe webhooks persist checkout-session receipts idempotently; playback rechecks current Stripe objects, including refunds and disputes, so a stale receipt is not entitlement. Failure of a dependency denies new paid playback.

## Program design
- server/saints/catalog.js: server-owned episodes/prices/release flags.
- server/saints/service.js: user-owned receipt validation, checkout, entitlement and library orchestration; injected adapters for tests.
- server/saints/providers.js: Supabase, Stripe, Mux signing adapters.
- api/saints.js: method/origin/body/auth gates and error translation.
- src/saints-account.js: PKCE email sign-in, library, playback, checkout, portal and resume position.
- scripts/build-saints.js: deterministic local browser bundles, no CDN SDK dependency.
- docs/saints-schema.sql: private receipt and progress tables, no client write policies.

## Invariants
Never trust a client user ID, amount, price ID, paid flag, playback ID or session redirect. Receipts bind verified user to Stripe Session; the current Session must carry the same metadata and catalog price. Paid access requires released episode plus a settled non-refunded/non-disputed purchase OR an active paid membership before its paid period expires. Cancellation-at-period-end retains paid access until period end; past_due/unpaid/canceled denies new tokens. Full or partial refund denies the corresponding purchase (conservative initial policy). Duplicate webhook delivery is an upsert; out-of-order events cannot restore a refunded payment because access reads current payment state. Tokens expire after 15 minutes; already-issued tokens cannot be immediately revoked. No DRM/screen-recording prevention claim.

## Slices and acceptance
1. Catalog/free player + login: free episode without account, expired/invalid auth denied for library.
2. Checkout/receipt/library: server price selection, unknown/unreleased SKU denied, duplicate receipts harmless, another account cannot inherit a session.
3. Playback: unpaid/refunded/disputed/expired denied, valid owner receives signed playback token only for requested canonical asset.
4. Browser/account: sign in/out, return from checkout waiting state, library, playback, billing portal, resume.

## Operations / go-live blockers
Need configured Supabase project with schema + production email sender/redirect allowlist and rate limiting/CAPTCHA; Stripe test and live products/prices + webhook secret; Mux signed playback assets/signing key; Vercel project authorization. No account/service was purchased. Enable checkout only after real sandbox end-to-end test and approved terms. Keep SALES_ENABLED=false for rollback; never remove existing purchase records. Log request IDs and error classes, not auth tokens or signed URLs. Register webhook checkout.session.completed and checkout.session.async_payment_succeeded. Keep products live/test environments separate.

## Expertise constraints
FULL route: money and identity. First implement denial paths; then payment path. Use trusted server receipts with live payment checks, exact price IDs and USD amounts, RLS deny-by-default, bounded bodies/timeouts, no-store responses and short-lived playback. Preserve existing site contracts. Test unauthorized access, forged webhook signatures, missing configuration, expired memberships and price tampering. Follow Stripe fulfillment, Supabase passwordless auth and Mux signed playback primary documentation.

## Verified 2026-10-11
- Vercel browser login works. vnmsfx-network contains email/Notion configuration; no Stripe, Supabase or Mux variables, and no linked shared variables. vnmsfx-hub contains public Supabase URL/anon key only. Values were not exposed.
- 35 local unit/handler tests pass, including real Stripe signature verification and RSA JWT verification. External payment/auth/streaming end-to-end remains untested.
- Local free player was observed playing the 1920×836 Opening 2 master with duration 310.708333 seconds. This is not evidence of a remote upload.
- Mobile 390px layout has no document overflow; episode row scrolls horizontally. Character and pricing interactions remain local preview features.
- Remaining engineering acceptance: checkout concurrency across distinct request IDs must be tested/guarded before sales opens; live email callback, database RLS, webhook retries and protected stream tests require configured sandbox services.

## October 11 publication
Production master receives only Saints additions; original working branch untouched. Release commits 9c791d4 and 9edaf6f. October 16th notices are disabled HTML buttons, not timed checkout activation. Sales and preorder flags remain default off. Full Episode 1 streaming is not configured: public buttons show streaming coming soon; trailer remains available. Do not mark streaming or commerce operational until live verification. Episode 2 supplied source used only for still extraction (6.5s Nix portrait, 17s episode hero), not published as playable media.

## October 13 setup — active work

Brandon approved launch with one-time USD 2.99 episode purchases only. Membership checkout now requires a separate SAINTS_MEMBERSHIPS_ENABLED=true flag, which is off by default. Page imagery, typography, press content and character material remain unchanged.

### Checkout concurrency design
The private saints_checkouts table owns one pending attempt per user/SKU. The saints_reserve_checkout RPC returns the same UUID and immutable Stripe parameters to concurrent callers. The Stripe idempotency key derives from that persistent UUID, rather than the browser request ID. A timeout after Stripe creation safely retries the same call. A completed checkout is reconciled into the user's library; only a Stripe-confirmed expired checkout is retired, allowing a new attempt. A stale/unknown reservation fails closed rather than risking a second charge. No in-memory locks or time-bucket idempotency keys.

Verification: both added regression checks failed before the repair (membership checkout was permitted; two request IDs created two Sessions). 41 unit/handler tests now pass, including concurrency across service instances, completed-checkout reconciliation and confirmed-expiration handling. External end-to-end testing remains pending.

Observed: existing Supabase project olltrmfxwzvrsxlcyvhu resumed and Saints private schema applied successfully; Stripe test product prod_VQzkiR8NuPWyuQ with one-time price price_1UQ7knP2E4gRJNvGgPRrHGL7 at USD 2.99 created; Mux organization qjcduv and Saints development environment nvdkj1 prepared. A video-only setup token and signing key were approved by Brandon and created. Secret values are not recorded here. Paid sales remain off.
