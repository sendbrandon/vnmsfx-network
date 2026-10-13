# Saints streaming — implementation contract

Status: local implementation, external services/configuration and live acceptance pending. Existing advertising site and free marketing Season Pass are separate products and remain unchanged.

## Product
Episode 1 is the complete Opening 2 film, free without login. Episode 2 is unreleased, paid at USD 2.99 when enabled. Viewers sign in by email, choose a purchase, pay through Stripe, and return to My Library. Approved subscriptions are USD 7.99/month, 39.99 every six months, and 69.99/year: automatic renewal, all released Saints episodes while active, cancellation at paid-period end. Membership sales are open; Episode 2 purchases remain closed until the finished video is ready. Downloads are outside this first implementation.

## Architecture / trust boundary
Static storefront and library → Vercel `api/saints.js` → Supabase verified user and service-role purchase records → Stripe authoritative payment/subscription status → short-lived Mux RS256 playback JWT. The browser cannot write purchase records, choose prices, authorize itself or supply a playback ID. Browser return URLs never grant access. Signed Stripe webhooks persist checkout-session receipts idempotently; playback rechecks current Stripe objects, including refunds and disputes, so a stale receipt is not entitlement. Failure of a dependency denies new paid playback.

## Program design
- server/saints/catalog.js: server-owned episodes/prices/release flags.
- server/saints/service.js: user-owned receipt validation, checkout, entitlement and library orchestration; injected adapters for tests.
- server/saints/providers.js: Supabase, Stripe, Mux signing adapters.
- api/saints.js: method/origin/body/auth gates and error translation.
- src/saints-account.js: TokenHash email sign-in, library, playback, checkout, portal and resume position.
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

### October 13 verification and remaining launch gates

- Stripe sandbox browser purchase: USD 2.99 paid successfully. Repeated fulfillment creates one receipt; another account cannot use the receipt; refund revokes access.
- Paid playback fixture used Episode 1's signed Mux asset with Episode 2 released only inside an isolated test process. The deployed Episode 2 remains unreleased.
- Supabase receipt, progress and checkout tables allow server access and deny anonymous access. Dedicated test viewer authentication succeeds.
- Library header now uses the supplied VNMSFX Originals and Saints logo artwork.
- Regular page episode purchase controls are wired to the library checkout route and remain disabled unless server configuration permits the released episode or preorder. Membership checkout remains disabled.
- Preview configuration confirms authentication and playback readiness with sales off. Production is unchanged.
- The `pushto6` Resend account contains a failed historical vnmsfx.com domain entry. On restart, Resend reported that another team claimed it. An approved attempted DKIM correction was rolled back to the exact original value; SPF, MX and Private Email records were untouched. Resolve the current owner account or approve a separate login-email subdomain before SMTP setup. Do not transfer the root domain.
- A preview-only signature verification secret is for synthetic deployed API tests. It is not a registered Stripe webhook endpoint secret. Register and verify the actual Stripe delivery endpoint before production sales.
- Before launch: confirm Episode 2 content/release or approved preorder terms, connect live Stripe price/key and actual webhook signing secret, verify customer email delivery and full browser login/checkout/library flow, then enable sales.

Deployed POST verification exposed Vercel’s lazy parsed req.body helper. The handler now reads the restored original stream before touching that property; 42 tests pass including a lazy-body regression. Re-run deployed signed/invalid webhook and playback checks against the updated preview before launch.


Completed email setup: `brandon@vnmsfx.com` signs into the current `vnmsfx` Resend team, whose vnmsfx.com domain is verified. The exact original Namecheap DKIM record remains in place. A sending-only key restricted to vnmsfx.com is saved in Supabase SMTP (smtp.resend.com, TLS port 465, username resend, sender VNMSFX Originals <brandon@vnmsfx.com>). An actual browser-requested signup email was delivered successfully to brandon@vnmsfx.com. The unused initial setup key was revoked with explicit approval.

Deployed preview verification now succeeds: authenticated library 200, anonymous free playback 200 with signed stream 200, unreleased Episode 2 returns 404, sales-disabled Checkout returns 409, a correctly signed synthetic webhook returns 200 and an invalid signature returns 400. Test result evidence is saved in the setup task outputs/preview-verification.json. Actual Stripe webhook endpoint delivery remains a separate launch gate.

Browser callback verification exposed a PKCE link/session failure. Saints-only branches in the existing signup and magic-link templates now link directly to the allowed library URL with TokenHash; the page verifies it on an explicit confirmation click, clears sensitive callback parameters, and displays expired-link recovery messages. Other applications retain their original ConfirmationURL templates. The actual user email flow now opens an authenticated brandon@vnmsfx.com library.

Actual browser playback also exposed Chrome native-HLS failure despite reported support. Prefer HLS.js when supported, retaining native HLS as fallback. Verified signed Episode 1 playing in Chrome: readyState 4, duration 310.751s, currentTime advancing, paused false, no error. Fully refunded completed checkout reservations can retire after verified full refund so a viewer can repurchase; 43 server tests pass.


Final launch decision: user approved live Stripe connection with sales kept off and selected sales closed until Episode 2’s finished video is ready. Remove October 16 preorder promises from the regular page. No automatic preorder launch or recurring memberships. Actual Stripe sandbox webhook delivery, receipt creation and refund revocation verified on vnmsfx.com; evidence in setup outputs/real-webhook-verification.json.

## Purchase emails and memberships — October 13 final setup

Three live and sandbox recurring prices are configured. A dedicated Saints Stripe portal supports payment-method updates, invoice history, and cancellation at paid-period end; plan switching is disabled. Membership checkout shares one persistent reservation across terms to prevent parallel subscriptions. The billing portal prefers the verified membership customer when simultaneous purchases created more than one customer.

Branded episode and initial membership confirmations use the existing website Resend credential. They send only after canonical settled payment verification, to the confirmed Supabase account email, with real brand artwork and a token-free https://vnmsfx.com/saints-library button. Stripe sends payment/renewal/refund receipts separately. Email delivery failures retain the purchase and return a retryable webhook status. The additive private email schema is docs/saints-email-schema.sql; sent checkpoints plus Resend idempotency suppress duplicate notifications. See docs/SAINTS-PURCHASE-EMAILS.md for failure recovery.

Updated user launch decision: sales and memberships are enabled. Episode 2 remains unreleased and its purchases/preorders remain disabled. At release, upload Episode 2 with signed Mux playback, set MUX_SAINTS_02_PLAYBACK_ID and duration, mark it released, test playback and purchase access, then open the released-episode purchase option. No automatic launch or preorder is scheduled.

User explicitly approved opening all three subscription plans on October 13 while keeping Episode 2 purchases closed. Membership checkout discloses the free Episode 1 and unannounced Episode 2. SAINTS_SALES_ENABLED=true, SAINTS_MEMBERSHIPS_ENABLED=true, SAINTS_PREORDERS_ENABLED=false; Episode 2 released=false.
