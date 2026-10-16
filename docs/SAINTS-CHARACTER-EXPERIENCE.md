# Saints character experience

## Scope and story

The landing page now has a name-only Cast shelf at `#characters`. Each portrait links to its matching dossier on `/saints-cast?character=KEY#characters`; descriptions and free downloads live on that dedicated page. A permanent character next step remains below the player and the footer links to the existing press page. No quiz, account requirement or email gate is added. Prices, payment eligibility, member access, release facts and existing character-story copy remain unchanged.

The landing heading is **Cast**. The dedicated page heading is **Meet the cast.** Supporting text: **Get to know Nix, Rook, Brick and Vernon. Take their card with you.** See [SAINTS-SHOW-FORMAT.md](SAINTS-SHOW-FORMAT.md) for the October 16 format revision.

The story is a rescue built around earned trust and loyalty: Nix and Brick return for Rook, who previously helped them escape. Vernon Voss is connected to Nix’s former service. This implementation preserves the existing short dossier copy; it does not introduce romance, a love triangle, an unproven betrayal, new character origins or a definitive claim about Brick’s fate. The separate “Official Trailer” versus “Episode 1” packaging discrepancy remains a release-review decision.

## Native art direction

The current page’s final CSS overrides establish a continuous charcoal film-print design. They take precedence over older green/Anton declarations near the beginning of `page.css`.

The extension keeps charcoal `#242628`, warm paper `#e8e1d5`, muted text `#c0bcb4`, amber `#d6b98d`, the Georgia/Times editorial heading, system-sans interface text, subtle rules, rounded selection pills and existing portrait color wash.

The original full-width 1984 × 864 on-page still remains the main image. It is not replaced by a collectible thumbnail or cropped card grid. New styles are scoped to the dossier and the watch-page follow-up; the older page cascade is not globally redesigned. The short dossier fade is skipped for reduced motion, and a minimum description height reduces layout movement when switching people.

The collectible files are separate, supplied artwork: portrait fronts and backs with the actual Saints logo, original source photography, approved typography and a muted ink-textured finish. The website does not redraw them, apply a new treatment or generate an alternative card in the browser.

## Download flow

1. **Initial:** Nix remains the default dossier. The front-image link says “Get Nix’s crew card.” The default card and package links are ordinary HTML links and work without JavaScript once the verified assets are present. Merely seeing default Nix is not a selection event.
2. **Select:** A pill immediately updates the still, name, role, description and all three character-specific download links. The biography closes on a change. There is no extra confirmation button.
3. **Keyboard:** Left/right arrows wrap through the four tabs; Home/End select the first/last. Only the selected tab is in the normal tab order, and the dossier is a focusable labelled tab panel.
4. **Primary action:** The selected front is a direct high-resolution PNG download. Watching remains an independent, always-available link. The quiet note reads “Free character artwork · No sign-up.”
5. **More downloads:** A native disclosure reveals the selected card back and phone wallpaper, plus the all-character print PDF and complete digital ZIP. The disclosure may remain open when switching characters; its selected-character links update with the dossier.
6. **File request:** A polite status says the download was requested and that the browser handles saving. The site does not claim the file was saved, opened or shared. There is no artificial progress bar, upload, asynchronous canvas export or download queue.
7. **Network failure:** The browser handles the ordinary file request, including its retry/error behavior. Assets are tested for presence and checksums before release; the interface does not falsely announce successful delivery.
8. **Missing catalog script:** If the page script runs but the asset catalog fails to load, potentially mismatched download controls are hidden and a reload message appears. Character browsing and the watch link remain available. With JavaScript entirely disabled, the original default-Nix HTML links remain usable.

On phones the primary download fills the row, with a comfortable watch link below. Extra formats remain inside the same dossier and are hidden until requested. Their format labels are small, secondary text.

## Asset contract

`assets/saints/character-cards.js` is now a fixed same-origin download catalog. It replaces the earlier browser-generated SVG/PNG prototype. It accepts only the four character keys and known file types, rejects arbitrary paths and prototype names, and has no fetch, storage, canvas or blob-URL code.

Files live under `assets/saints/collectibles/v4/`:

- Four front PNGs, 1200 × 1800 pixels, under `fronts/`.
- Four back PNGs, 1200 × 1800 pixels, under `backs/`.
- Four phone-wallpaper PNGs, 1080 × 1920 pixels, under `wallpapers/`.
- A separate 2 × 3 inch duplex print PDF under `print/`.
- The complete digital ZIP at the collection root.
- A manifest containing exact relative paths, dimensions where applicable, byte sizes and SHA-256 values.

The digital ZIP contains the digital artwork and portable SVG layouts with linked original imagery, preview sheets and instructions. The print PDF is a separate download, not silently assumed to be inside the ZIP. Print instructions and bleed/crop information belong with the verified PDF package. Test printer alignment and color on plain paper before printing a final set.

The local preview server uses correct PNG, PDF and ZIP MIME types. Production static hosting should serve the same bytes. The `download` attribute suggests saving; some mobile browsers may open the image or PDF first. This behavior still needs real-device acceptance.

The artifact manifest must be refreshed after any approved copy or artwork revision. Do not publish a provisional Nix file or package assembled from superseded versions.

## Watch and press navigation

The below-player “Pick your accomplice” section is present before and after playback and does not depend on YouTube API events. It links to the existing character anchor. The player remains unobstructed; fullscreen uses the cinema container where supported. Approved campaign parameters can survive the return to characters without storage.

The main footer links directly to the existing `/saints-press` destination. No unapproved biography, credits, release date, signup or indexing change is implied by that link.

## Analytics

See [SAINTS-ANALYTICS.md](SAINTS-ANALYTICS.md) for event fields, the finite campaign dictionary, privacy rules, player semantics and collection limits.

Character selection is emitted on explicit tab interaction or a recognized character query selected through a cast link. Unknown character query values retain Nix; merely loading the default cast page is not a selection event. `asset_download_clicked` identifies the requested front, back, wallpaper, print PDF or digital ZIP and its actual file format. It records a link activation, not a saved-file or sharing confirmation. Watch clicks, actual playback starts, seekable playhead progress and ended callbacks are distinct.

## Verification and release gate

`tests/saints-characters.test.js` verifies the fixed catalog, all file signatures/dimensions/checksums, direct no-JavaScript links, exact per-character link updates, collection links, keyboard navigation, default-versus-explicit selection, reduced motion, script-failure recovery, request-event meaning, watch navigation and permanent press/player next steps.

Run:

- `npm ci`
- `npm test`
- `npm run build`
- `git diff --check`
- `npm run dev` for the local preview server on port 4317

Missing final PDF or ZIP files are real failing release checks, not skipped successes. The full repository checkout has 5 passes and 10 matching baseline failures in `npm run test:site`: most expect a missing `index.html`; another expects older TV-page copy. This was compared against the untouched base commit. The earlier lightweight handoff recorded an additional missing-media failure. These do not establish a successful full-site regression run and must be reported separately.

Source/DOM-mocked tests do not establish browser rendering. Local browser checks now cover all four tabs, keyboard wrap, responsive widths and direct PNG/PDF/ZIP downloads; the previous hosted preview also delivered the Rook download. Cross-browser/device and extended acceptance remain separate. Before release, check desktop Chromium/Safari and iOS/Android for:

- No horizontal overflow at 320, 390, 768 and 1440 CSS pixels, including 200% text zoom.
- Touch targets, roving focus, status announcements, biography and format disclosures.
- All 12 PNG links and both package links, including correct filenames and offline/retry behavior.
- Repeated downloads and switching character with the disclosure open.
- JavaScript disabled and catalog-script failure.
- Reduced motion and Back/Forward navigation.
- Actual YouTube/native play, pause, seek, end, replay and fullscreen behavior.
- Expected local event payloads with no identifiers, form data or arbitrary query values.

See [SAINTS-RELEASE-CHECKLIST.md](SAINTS-RELEASE-CHECKLIST.md) for unresolved release/commerce/signup decisions, publication approval and rollback. Local preparation is not deployment.
