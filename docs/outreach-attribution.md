# Outreach attribution

## Link contract

Use an ordinary, visible `vnmsfx.com` hyperlink with this destination (test token only):

```
https://vnmsfx.com/?utm_source=vnmsfx_outreach&utm_medium=email&utm_campaign=vnmsfx_outreach_2026_09&utm_content=m_00000000000000000000000000000000
```

Generate a fresh `m_` plus 16 cryptographically random bytes in hexadecimal for each **message**, not a name, email, hashed email, company slug or permanent person ID. Keep the token-to-message/recipient mapping outside this public repository. Never use real message tokens in automated QA, screenshots or public fixtures. The hyperlink label stays `vnmsfx.com`; no redirect service or new vendor is needed.

An opened link is not proof that its original recipient visited: mail security scanners, previews and forwarded links can all open it. Do not label these events verified reads or email opens.

## What the code measures

- The five standard UTMs (and first-party `ref`) are kept in the current tab's session storage. A new tagged landing replaces the whole campaign, avoiding a stale message token on a different campaign. Untagged navigation retains it. Storage failure leaves the current page usable.
- The homepage's direct `https://cal.com/vnmsfx/creative-call` link receives the standard UTMs, including the opaque token in `utm_content`. Other VNMSFX Cal links retain the existing `/book-teardown` route with an allowlisted event slug; the route now honors that slug.
- `booking_click` means a direct calendar link was activated. `teardown_click` means the existing calendar redirect ran. Neither is a booked meeting. `inquiry_draft_open` means the homepage prepared a mailto draft, not that the email was sent.
- GA4 receives only allowlisted, slug-like campaign and placement values. Arbitrary event details, form contents, booking IDs, names and email addresses are not forwarded by this module. The outreach source requires an opaque token format for `utm_content`.
- `/booking-confirmed` removes its entire query and fragment before analytics code, sends no booking-success event and directs the visitor to Cal's actual confirmation. A caller-controlled `uid` cannot prove a booking.

The module adds no trackers, account integrations, credentials or consent grants. New state/events respect GPC, DNT, the existing GA disable flag, `window.vxAnalyticsConsent === false`, and an explicit Google `analytics_storage: 'denied'` command. A consent manager can dispatch `vx:consentchange` to refresh links immediately. Existing site-wide analytics loaders are independent of this module. Older inline attribution snippets on secondary pages also decorate Stripe URLs before this helper; their Stripe behavior is unchanged and is not sanitized or made consent-aware by this patch. Consequently, this patch is **not** a site-wide consent-management implementation or a claim of regulatory compliance.

## How to verify actual bookings

Cal automatically saves `utm_source`, `utm_medium`, `utm_campaign`, `utm_term` and `utm_content` with a completed booking. The host can view these in the booking's details. Match its opaque content token to the private message ledger, and inspect the booking's actual status. No hidden custom booking question is needed for these standard five fields.

The current homepage uses an external Cal link, so the website cannot listen to its completion event. Cal's `bookingSuccessfulV2` is for an **embedded** booking; Cal also says a newly created booking may still require confirmation. Do not attach that event to a button click, a guessed postMessage shape, a return URL, or a dry-run/reschedule event. A future verified server-side conversion or embed integration needs a separate design and authorized account configuration. Do not create credentials/webhooks merely to make a dashboard look complete.

## Validation and rollout

1. Run `node --test assets/conversion-events.test.js api/*.test.js` and `node --test --test-name-pattern='Hobby-safe' site-content.test.js`.
2. Serve locally with the repository's `.claude/launch.json` command (`python3 -m http.server 8765`). The live homepage is `tv.html`, rewritten from `/` by Vercel; a bare Python server does not implement that rewrite.
3. In a local browser, use only the all-zero test token. Block third-party requests during tests. Verify the direct Cal destination, reload, untagged navigation, a newer campaign, repeated/middle clicks, denied consent, blocked storage and the confirmation page with synthetic attendee parameters. Do not submit a real booking or email.
4. After approved deployment, inspect GA4 DebugView/Realtime for a clearly marked QA visit and click; verify the receiving property and Clarity project separately. Installed tags do not prove that collection/reporting works. Normal GA campaign acquisition comes from the landing UTMs. The additional event `utm_*` fields are custom event parameters, not registered custom dimensions or a configured report.
5. Verify the five UTMs on the next authorized Cal booking. No test booking was created for this patch. Count actual bookings from Cal, not a click or confirmation-page view.

Existing repository-wide `site-content.test.js` also contains stale expectations for a missing `index.html` and an older TV film index. Report those baseline failures separately; the focused tests are not a claim that the full old suite passes.

## Primary references

- [Cal: UTM Parameter Tracking](https://cal.com/help/bookings/utm-tracking)
- [Cal: Embed Events](https://cal.com/help/embedding/embed-events)
- [Google: Avoid sending personally identifiable information](https://support.google.com/analytics/answer/6366371?hl=en)
- [Google: User-ID](https://developers.google.com/analytics/devguides/collection/ga4/user-id) (not used for these unauthenticated, per-message links)
