# Saints merch backend — test-first setup

## Product brief
Preserve the approved Nix/Rook storefront and add guest Stripe Checkout with automatic Apliiq fulfillment after physical samples are approved. Both hoodies are USD150, black, S–3XL, US-only, edition cap100 each shared across sizes. December4 is the movie release, not the opening date. This branch starts backend setup, not live sales. Successful setup means a simulated/test paid session creates exactly one durable order and consumes the correct edition units; duplicate delivery, stock races and supplier uncertainty do not create extra garments. Existing film checkout/library/subscriptions remain untouched.

## Expertise-engine DRILL: paid-order ownership
A payment event is neither an inventory ledger nor supplier acceptance. Store inventory reservations and immutable order contents in Postgres, verify the Stripe event and re-fetch payment state, then hold paid orders until production is approved. Separate reference IDs for customer order, Stripe session and Apliiq order make uncertainty diagnosable. Source raster pixels and supplier print boundaries limit physical output; backend completion cannot certify sample quality. Current provider facts checked2026-10-21: Stripe checkout/fulfillment docs, Apliiq Create Order, fulfillment URL and API test guide. Apliiq has no sandbox; network order creation is a real paid action. Public auth examples contain an apparent SHA265 typo: protocol stays unverified until a supplier-provided signing fixture is confirmed.

## Architecture
Existing static site/Vercel CommonJS functions, Stripe SDK and Supabase are reused. Dedicated `/api/saints-merch` endpoint and `server/merch/` modules isolate this from film commerce. Dedicated MERCH Stripe key/webhook secret prevent changing existing payment endpoints. This version accepts TEST Stripe keys only; live checkout is explicitly rejected. Default checkout off, fulfillment off. Supabase migration is additive and shipped unapplied for review; RLS restricts all merch tables to service role.

Buyer → POST checkout(cart,requestId) → validate server catalog → atomic reserve RPC → Stripe test session with idempotency key → redirect.
Stripe signed webhook → retrieve session → verify test/paid/currency/subtotal/US address/cart → atomic mark-paid RPC → paid_hold. Duplicate events are harmless.
Expired Stripe session → atomic release RPC. Local clock alone never releases a possibly-paid reservation.
Protected dispatch preview → exact Apliiq payload from saved order/SKU map. Actual transport is guarded; test orders can never enter real production. Signed Apliiq tracking callback updates submitted orders only; no client data can claim shipment.

## Program design
+server/merch/catalog.js: normalizeCart(raw) → canonical lines/15000-cent subtotal.
+server/merch/service.js: checkout; Stripe event reconciliation; dispatch preview.
+server/merch/providers.js: Stripe test client + Supabase RPC adapter.
+server/merch/apliiq.js: payload/signature adapter, strict production guards, response ambiguity handling.
+api/saints-merch.js: methods/origin/raw body/signatures/operator auth; sanitized errors.
+docs/saints-merch-schema.sql: test edition ledger, orders, events, reservation/payment/release RPCs; no changes to film tables.
+tests/saints-merch*.test.js: real Postgres semantics via PGlite, route mocks, provider transport, catalog failures.
+scripts/check-merch-readiness.js: names/flags only; never values; explicit missing launch prerequisites.
+.env.merch.example: server-only variables and all12 supplier SKU placeholders.
Frontend seam: retain preview bag; only exchange canonical id/size/qty and random requestId with API; never trust browser prices. No media committed in this backend branch. Browser page remains local4173 until asset hosting and approved preview integration are configured.

## Invariants / recovery
1. Reserved+sold ≤100 per design; all sizes share same ledger row. SQL locks rows in consistent order. Test inventory is explicitly test namespace, not real sales tally.
2. Same requestId + same cart returns original order; different cart is rejected. Stripe params/expiry fixed by reservation, not regenerated on retries.
3. A lost create-session response retains reservation. Retry same requestId; never release uncertain payment or blindly create another checkout. Orphans require Stripe reconciliation; do not time-expire locally.
4. Only verified expired/unpaid Stripe state releases linked holds; paid counts move exactly once.
5. Durable paid_hold survives process exit. This phase does not automatically manufacture or email customers. Future production worker must claim order before send, freeze payload/SKUs, retain uncertain sends as needs_review and reconcile before retries.
6. Service-role DB access only; secrets stay in Vercel, no customer PII/logged webhook payloads in Git/logs.
7. Current live gate is hard test-only. Sample approval alone does not enable live sale; deployment/production release stays a separate user decision.

## Vertical slices / acceptance
1. Closed catalog/config route, strict cart validation, readiness diagnostics: tests+HTTP503 for unconfigured checkout.
2. Durable reservation → test Checkout → signed event → paid_hold: transaction tests, duplicate/race/expiry/error cases.
3. Apliiq dry-run payload and verified tracking boundary; sample manifest/quote prerequisites. No real supplier POST, no spend.
4. GitHub PR and Vercel preview with checkout/fulfillment disabled, endpoint verification. No master merge.

## Open setup requirements
MERCH_STRIPE_SECRET_KEY/WEBHOOK_SECRET test credentials, isolated test Supabase migration, saved Apliiq account/SKUs and signing confirmation, finished flat production masters, exact per-size proof, decorated samples and delivered quote. Existing production Supabase/film Stripe credentials are not copied into preview. No real card/order tests until priced and approved.

## Verification receipt
2026-10-21: `npm run test:merch` passes23 tests; `npm test` passes152 tests; `npm run build` passes. Merch SQL executed in actual embedded Postgres (PGlite), including cap/rollback/idempotency/privilege checks. Concurrent Promise requests are serialized by the embedded engine; production multi-connection lock contention has not been exercised. Payment session creation/retrieval is mocked; Stripe webhook signature test uses the real installed SDK. Apliiq requests use mocked transport only. No real Stripe charge, supplier POST, email or production database migration occurred. Vercel preview configuration/HTTP checks are recorded in the task handoff, not asserted here before deployment.

## Operator next steps
1. Provision an isolated Supabase test project and apply the additive SQL. Do not point test reservations at the production film database by accident.
2. Set dedicated MERCH Stripe TEST key and webhook secret in branch-preview environment. Create webhook to `/api/saints-merch?action=webhook` for completed/expired/async-success Checkout sessions. Preserve existing film Stripe settings/webhooks.
3. Set MERCH_SITE_ORIGIN to the chosen preview origin. Use `.env.merch.example` for required names; run `npm run merch:check` (prints names/booleans only). Enable checkout only in this protected test preview.
4. Test with Stripe test cards: paid order must become paid_hold exactly once. Fulfillment remains off even with test payment success. Check signed expiry frees the exact units. Abandoned create-session attempts with uncertain responses retain units until reconciled; no unsafe local-time expiry.
5. Complete sample SKU/artwork/quote/protocol checks. Supplier's API has no sandbox; a real API test is a separately approved purchase, not a cancellation-based free test.
6. Live release needs a separate production migration/mode, durable dispatch claim/outbox worker with reconciliation, customer confirmation/tracking delivery, rate limiting/abuse controls, shipping/tax/returns configuration, and physical sample approval. Those are not silently activated by setting one flag in this test-only branch. Before production, review customer-data retention and deletion procedures.

## Source references
- https://docs.stripe.com/checkout/fulfillment.md?payment-ui=stripe-hosted
- https://help.apliiq.com/portal/en/kb/articles/create-order
- https://help.apliiq.com/portal/en/kb/articles/fulfillment-url
- https://help.apliiq.com/portal/en/kb/articles/how-to-test-orders-with-apliiq-api
