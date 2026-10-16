# Saints interaction instrumentation

## Current status: local events, no collection or dashboard

`assets/saints/analytics.js` dispatches a validated `saints:analytics` CustomEvent on `window`. It does **not** send data anywhere, install an analytics provider, save events, create an identifier, or provide a reporting dashboard. A `true` return from `track()` means only that local dispatch completed. It does not prove that an observer exists or that an event was collected. Events are lost when the page closes or navigates unless a separately approved collector is added.

This is deliberately instrumentation-ready, not a claim that campaign analytics are live. No publication, campaign outreach, new provider configuration, or deployment is included. An approved collector and its privacy configuration must be selected and verified before these events can produce aggregate campaign reports. Until then, do not report visitor totals, attributed viewers, completed downloads, or conversion rates from these hooks.

## Audit and adapter decision

The repository uses a sparse checkout. The audit used `git ls-tree -r --name-only HEAD`, targeted `git show` reads, and `git grep` against the committed tree, rather than concluding that an omitted root file did not exist. Root HTML and readable JavaScript were checked separately from generated `assets/saints/account.bundle.js` and `player.bundle.js`.

- `assets/conversion-events.js` is a lead-funnel helper. It keeps attribution and events in session storage, accepts arbitrary bounded attribution text, and can mirror its events to `gtag` when present. It is unsuitable for this storage-free, enum-only implementation.
- Other root pages, including `studio.html` and `privacy.html`, configure Google Analytics, Microsoft Clarity, Apollo and Vercel page views. These are not configured on `saints-of-bad-luck.html` or `saints-watch.html`; the Saints bundles do not provide a configured analytics transport either. Site-wide provider existence does not establish a configured, approved Saints custom-event adapter.
- The committed `privacy.html` and `site-content.test.js` describe the current Vercel plan as page-view-only for this existing funnel. This was repository evidence, not a live account/plan verification. No Vercel custom-event endpoint was assumed or configured.
- No commerce, auth, member database, or payment instrumentation was added or changed.

## Public helper contract

Load `/assets/saints/analytics.js` before `/assets/saints/page.js` or `watch.js`.

```js
window.SaintsAnalytics.track('character_select', { character: 'rook' });
window.SaintsAnalytics.watchUrl('episode');
// '/saints-watch?video=episode' with only approved current-page UTM values appended
```

`track(name, fields)` returns `false` for an unknown event, invalid required field, wrong page, privacy opt-out, unavailable event API or internal error. It only copies the defined fields below. Unknown fields are discarded, even when supplied by a caller. The immutable detail always contains `event` and `page` (`landing` or `watch`), plus the event's required fields and approved current-page UTMs. Exact raw pathnames, URLs and timestamps are not included.

Event names and meanings:

- `view_landing`: one initial landing-page initialization per document. This is not a unique visitor count. Duplicate initialization is suppressed.
- `character_select`: a visitor explicitly selects a character through the landing character controls. Required `character`: `nix`, `rook`, `brick`, `vernon`. Initial default rendering emits no event. An explicit first selection (including the default character) is counted; repeated selection of the already-active character is then suppressed.
- `asset_download_clicked`: an ordinary collectible file link is activated. Required `character`: one of the four characters or `all`; `asset`: `front`, `back`, `wallpaper`, `print_pdf`, `collection_zip`; `format`: `png`, `pdf`, `zip`. Individual artwork requires a real character and PNG. The PDF and ZIP require `character: 'all'` and their matching format. Invalid combinations are rejected. This records a file request, **not** a confirmed save, successful transfer, file open or social share. A browser can block or cancel it, and a network request can fail. This supersedes the unpublished generated-card prototype's event name.
- `click_watch`: a watch control is activated. Required `placement`: `hero`, `episode`, `character`; `video`: `episode`, `trailer`. It does not mean playback started. Navigation is not delayed for analytics.
- `video_start`: first observed native `playing` event or official YouTube PLAYING state in that document. Required `video`: `episode`, `trailer`; `player`: `native`, `youtube`.
- `video_25`, `video_50`, `video_75`: first observed playhead at or beyond the respective percentage while playing, with known finite duration. Same `video`/`player` fields. They measure playhead position, **not** percentage of unique seconds watched. Seeking forward can cross multiple thresholds.
- `video_complete`: observed native `ended` event or YouTube ENDED state after an observed start. It is not inferred from a click, iframe load, timer duration, 100% position, buffering, or an error. Seeking to the end can also produce this event.

Start, percentage and completion events are each attempted once per document's video, including pauses, repeated callbacks, seeking and replay. Replay still works but does not inflate the document's milestone counts. A fresh page load starts a fresh lifecycle; there is no visitor/session identity to deduplicate across pages. If a privacy signal suppresses an event, it is not queued for later backfill. Resuming a page from the browser's back-forward cache preserves its existing in-memory milestone flags.

## Campaign attribution dictionary

The single runtime source of truth is the `campaigns` dictionary in `assets/saints/analytics.js`. Values are lowercased and must exactly match a listed enum, with a maximum of 32 characters. Unknown values, duplicate keys, full URLs, free-text descriptions, emails and other unrecognized text are dropped. `utm_term`, `ref`, arbitrary query parameters and the document referrer are never recorded or propagated.

Accepted values:

- `utm_source`: `instagram`, `tiktok`, `youtube`, `facebook`, `x`, `threads`, `bluesky`, `reddit`, `newsletter`, `email`, `linkedin`, `vnmsfx`, `creativebloq`, `thedaringcreatives`, `forbes`, `filmfactual`, `variety`, `curiousrefuge`, `brothers_saga`, `brooklynscifi`, `aicca`, `theoreticallymedia`, `morehorror`, `gossipgoblin`
- `utm_medium`: `social`, `organic_social`, `paid_social`, `video`, `email`, `referral`, `dm`, `bio`, `story`, `editorial`, `screening`, `profile`
- `utm_campaign`: `saints`, `saints_of_bad_luck`, `saints_dec4`, `episode_1`, `character_cards`
- `utm_content`: `nix`, `rook`, `brick`, `vernon`, `trailer`, `episode_1`, `hero`, `character_card`, `campaign_poster`, `founder_quote`, `scene_breakdown`, `crew_card`, `reel_01`, `reel_02`, `screening_01`, `screening_02`, `screening_03`

These are permitted labels for proposed campaign links; their inclusion does not mean an outlet has published, a screening is booked, or outreach has occurred. The campaign label is not a release-date announcement.

Before using a new public outlet or creative label, explicitly review and add its bounded slug to this dictionary and its regression tests, then update this documentation. Do not loosen the validation to arbitrary strings to make a link work. Never put recipient names, email addresses, private account IDs, or sensitive facts into campaign values.

`charactersUrl()` creates only the fixed `/saints-of-bad-luck` route, the same approved campaign values, and `#characters`. The persistent below-player link uses it and rechecks privacy preferences on activation. It never carries the watch page's raw query, video parameter or private values back to the landing page.

`watchUrl(video)` creates only the fixed same-site `/saints-watch` path with `video=episode` or `video=trailer`. It copies approved current-page UTMs directly into that navigation URL without storage. If privacy checks fail or a privacy signal is active, it returns the video-only URL. Invalid video input defaults to `episode`. Attribution reflects the current page URL only; no earlier visit, external referrer or cross-session source is reconstructed. These static enums cannot establish per-person attribution across the landing/watch journey.

## Privacy and robustness

- Global Privacy Control (`navigator.globalPrivacyControl === true`) and Do Not Track (`navigator.doNotTrack`, `navigator.msDoNotTrack`, `window.doNotTrack`) suppress event dispatch and campaign propagation. Checks run at the time of each call.
- No cookies, local/session storage, user/session IDs, fingerprint, email, form values, full URL, referrer, raw media URL, IP address or precise playback timestamp is added by this helper.
- `analytics.js` makes no network requests and does not call a preexisting `gtag`, Vercel function, lead helper or data layer just because one exists.
- A future listener must preserve this field contract and opt-out behavior, undergo privacy review, and be explicitly authorized/configured. Do not forward the whole browser event, URL or user object to a provider.
- Helper failure cannot block character selection, navigation, downloads or playback. There is no retry queue, unload beacon or persistent data.
- The existing hosted video itself still makes video-provider requests. The official YouTube iframe-control script is loaded for actual playback state, endcard and replay behavior. The privacy-enhanced embed domain remains `youtube-nocookie.com`; this does not guarantee that YouTube makes no network requests or handles no data. This local event helper is not a site-wide consent manager and does not change existing hosting/video-provider behavior.

## Playback implementation and limitations

YouTube uses the validated 11-character ID in `press-video.json`, the existing privacy-enhanced iframe, `enablejsapi=1`, and the current HTTP(S) origin. `YT.Player` is attached to that existing iframe. Its official state callbacks and `getCurrentTime()` / `getDuration()` drive events; there is no custom unvalidated `message` listener. Progress is sampled once per second only while observed playing. Pausing, buffering, errors and `pagehide` stop the timer; `pageshow` rechecks actual player state before resuming.

If the API is blocked or never arrives, the existing iframe and its native controls remain. No YouTube playback metrics or custom endcard can be inferred in that case. Invalid/unavailable optional YouTube configuration falls back to the existing native-player path; it does not block that path. Native playback uses media events and ignores paused/seeking samples and non-finite durations. The next-episode content and commercial availability remain unchanged. A permanent, unobtrusive character link below the player provides a real next step even when the API is blocked or never reports an ended event. It makes no release-signup claim.

The custom full-screen button prefers the cinema container for YouTube, so its sibling endcard remains in the same fullscreen subtree where supported. Player-native fullscreen or platform-specific iframe-only fullscreen can still keep the page overlay out of view until fullscreen is exited. This requires real-browser/device QA. Native fullscreen support, autoplay policies, YouTube availability and ad timing are controlled by the browser/provider.

Official references checked during implementation:

- [YouTube IFrame Player API](https://developers.google.com/youtube/iframe_api_reference): attaching to an existing iframe, readiness/state callbacks, time/duration and replay control.
- [YouTube embedded-player parameters](https://developers.google.com/youtube/player_parameters): `enablejsapi`, `origin`, `playsinline`.

## Verification and release gate

Focused automated verification:

```sh
node --test tests/saints-analytics.test.js
node --check assets/saints/analytics.js
node --check assets/saints/watch.js
```

The tests use local Node VM/DOM/player mocks with no external network. They cover strict field projection, invalid input, finite campaign enums and planned outlet/creative variants, DNT/GPC, safe same-site UTM propagation, repeat initialization, native playback/autoplay rejection/seeking/replay, real API callback semantics, late or absent API, config failure, player error, timer cleanup, back-forward restoration and custom container fullscreen routing. These are unit/static checks, not proof of live YouTube playback or browser rendering.

Real-browser QA was unavailable in this execution environment because browser/socket access was blocked. No live network request, dashboard receipt, fullscreen rendering, real video progress, or mobile behavior is claimed verified. Before publishing, use an authorized functioning browser environment to check:

1. Landing selection, card download, watch navigation, and a sanitized campaign link on desktop and mobile.
2. YouTube play, pause, seek, end, replay and full-screen exit; confirm each milestone once per page, and no completion on mere load.
3. Native trailer/fallback play, autoplay-denied prompt and replay; confirm trailer does not show the episode endcard.
4. API blocked/offline cases, Back/Forward and repeated navigation.
5. DNT/GPC suppress events and UTM propagation, with normal interaction still working.
6. If a collector is separately approved, inspect its outgoing payloads and actual receipts before claiming reporting is live. No such collector is included here.
