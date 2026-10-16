# Saints show page format

Keep the established Saints photographic hero, warm paper on charcoal palette, typography, viewing and purchase flows. Apply only the requested information architecture changes inspired by the MobLand show page.

- Landing: existing genre labels, Season 1 and the owner-specified Mature label; two compact episode cards; a Clips coming soon slot without invented media; four name-only cast portraits linking to a dedicated cast page.
- Cast page: preserve the approved character decks, bios, artwork and free downloads. Character query keys select the matching dossier; unknown keys fall back to Nix. No actor identities or credits are invented.
- Structure: move character behavior from page.js to cast.js; page.js retains landing playback, pricing and section navigation. Reuse page.css and the existing asset catalog. The local review server adds the cast route; Vercel clean URLs serve the new HTML directly.
- Verification: character tab/download tests move with their owner; check landing/cast deep links, actual downloads, keyboard controls and responsive widths in a real browser.
- Release: update the existing feature branch and preview; production remains pending review of this revised preview.
