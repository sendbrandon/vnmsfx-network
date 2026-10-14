# Saints of Bad Luck — founding audience

Route: COMPACT. Expertise-engine mode: TRANSLATE, converting the existing Saints design and the approved fan-program idea into a working companion page.

Product: viewers can learn about the Bad Luck Club, choose how they would enjoy helping, and apply without a purchase or an account. Acceptance is separate from application. The completion state appears only after durable storage succeeds. Existing playback, billing and paid memberships retain their behavior.

Design constraints: load the original assets/saints/page.css unchanged; inherit its final warm-paper/charcoal tokens, Georgia editorial headings, system body typography, optical text treatment, rounded controls, gutters, photographic fades and reduced-motion behavior. Use original film stills and the wordmark. Keep new styles scoped to club components. Do not introduce a new accent color, font, icon library, visual treatment, stock imagery or generated artwork. Use plain, labeled fields with visible focus, inline errors, retained answers after failure, and a keyboard-reachable success state. Make club membership free and distinguish it from paid viewing access. Do not promise event dates, admission or release dates.

Flow: main-page link → saints-of-bad-luck/club.html → assets/saints/club.js → POST /api/saints-club → existing _lead-store → private Notion/Airtable record tagged Bad Luck Club. No automatic email or newsletter enrollment. Existing Season Pass sender filters for its own channel and excludes club records.

Files: add companion HTML, scoped CSS/JS, a validated serverless handler and focused handler tests; add main-page navigation/invitation, privacy disclosure and sitemap entry; extend the local preview allowlist. API returns {ok, persisted, submissionId} only after saving, and an actionable error on failure. Form content never enters URLs or analytics. A SHA-256 fingerprint enables existing store retry matching within its seven-day window; this is best-effort retry deduplication, not a database uniqueness guarantee.

Slices: (1) complete branded page and real form contract; (2) validation/persistence, failure/retry tests and desktop/mobile browser verification; (3) staged production build, verify configuration and durable test submission, promote exact tested build, verify main and club URLs.

Professional success test: the two pages share computed design tokens; a phone user can read and complete the form without horizontal scrolling; invalid requests do not write records; a storage failure never produces a success claim; a valid request is visible in the existing private lead system; the production film and checkout routes remain available.

Failure checks: design drift (different computed tokens or typography); false success (storage failed but UI says received); lost application (client clears answers after failure); accidental mailing (club application included in Season Pass queries); cross-site writes (unapproved Origin); unrelated deployment changes (source diff includes other features).
