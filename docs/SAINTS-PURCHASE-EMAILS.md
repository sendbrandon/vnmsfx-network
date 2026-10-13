# Saints purchase confirmations and memberships

Product: paid viewers receive a branded VNMSFX email linking to their library. All three approved recurring plans cover released Saints episodes while active: $7.99/month, $39.99 every six months, $69.99/year. Renew automatically; cancel at paid-period end. Episode 2 and all sales stay closed until the film is ready.

Architecture: signed Stripe Checkout webhook → canonical payment verification → existing purchase receipt → durable immutable email record → Resend → sent checkpoint. A failed send returns a retryable webhook response after preserving the purchase. Supabase account email determines recipient, not Stripe form data. Stripe continues sending financial receipts separately. Initial membership confirmation includes price, renewal date and a library link to Manage billing. Renewal receipts remain Stripe's responsibility.

Program design: server/saints/purchase-email.js renders inline table HTML/plain text; providers.js supplies verified account lookup, email reservation RPC, send and checkpoint. service.js reuses settled-subscription validation for access and initial email. docs/saints-email-schema.sql owns the server-only table and row-lock lease. Email key is the Checkout Session ID. Immutable payload survives retries. Leases serialize overlapping webhooks; Resend's same key bridges uncertain network responses for 24 hours. A permanent sent checkpoint suppresses later duplicate events. An ambiguous unsent email older than 23 hours requires manual Resend reconciliation rather than an unsafe automatic duplicate.

Guards: send only for complete canonical paid non-refunded/non-disputed purchases or settled memberships; customer account must have confirmed email. No browser endpoint can request a purchase email. No payment details or authentication tokens in email links. Sandbox sends restricted to the setup inbox; tests must prove wrong-owner/unpaid/duplicate/retry behavior. Existing press page and unrelated email credentials remain unchanged.

Slices: (1) verified email delivery with durable duplicate suppression and rendered preview; (2) live/test recurring prices, dedicated cancellation portal, truthful terms and shared pending membership checkout; (3) sandbox checkout, email, access, cancellation and deployed verification before publish with sales flags false.

Professional success: one confirmed purchase yields one branded email to its verified owner; replays do not resend; missing email delivery does not remove paid access; an active paid subscriber can watch released episodes and schedule cancellation without losing the paid remainder.

References: https://resend.com/docs/dashboard/emails/idempotency-keys ; https://docs.stripe.com/checkout/fulfillment ; https://docs.stripe.com/payments/checkout/build-subscriptions ; https://docs.stripe.com/customer-management
