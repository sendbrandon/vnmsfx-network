# Saints show page format

Keep the established Saints photographic hero, warm paper on charcoal palette, typography, viewing and purchase flows. Apply only the requested information architecture changes inspired by the MobLand show page.

- Landing: existing genre labels, Season 1 and the owner-specified Mature label; two compact episode cards; a separate Clips shelf containing the owner-supplied 43-second The Depot Gate side mission; four name-only cast portraits linking to a dedicated cast page.
- Cast page: preserve the approved character decks, bios, artwork and free downloads. Character query keys select the matching dossier; unknown keys fall back to Nix. No actor identities or credits are invented.
- Structure: move character behavior from page.js to cast.js; page.js retains landing playback, pricing and section navigation. Reuse page.css and the existing asset catalog. The local review server adds the cast route; Vercel clean URLs serve the new HTML directly.
- Verification: character tab/download tests move with their owner; check landing/cast deep links, actual downloads, keyboard controls and responsive widths in a real browser.
- Release: update the existing feature branch and preview; production remains pending review of this revised preview.

## Selected portrait revision

Brandon selected four 2896×2172 Wonder upscales derived from the generated neutral-studio frontal headshots. The landing cast shelf uses those PNGs unchanged. A CSS alpha mask fades only the lower part into the page; existing cinematic dossier stills and collectible artwork stay unchanged. The Depot Gate thumbnail uses its native 1920:836 ratio to remove the former 16:9 container letterboxing without cropping the film.

## October 16 — shared clip cinema

Both Clips cards now open the existing Episode 1 viewing shell at `/saints-watch?video=depot-gate` and `/saints-watch?video=come-home`. The legacy Depot Gate route redirects to the shared cinema. Public clips use a fixed allowlisted local media catalog, without episode YouTube lookup, account/auth requests, or the Episode 2 purchase end card. Back returns to the Clips shelf. Existing playback/fullscreen/error behavior is reused.

Brandon supplied the 40.375-second Road Fight · Come Home final cut with baked subtitles. Its source master is preserved; the 1920×836, 24 fps fast-start H.264 derivative preserves timing and copies AAC audio verbatim (stream hash verified). The 20-second source frame supplies its poster. This is a Clip, not a newly released episode; no pricing/release or canon changes.

Portrait prompts v2 are a prompt-only handoff for Brandon's chosen image model, grounded in the actual hero and original character sheets. Four self-contained prompts specify expressive headshots, full lighting/camera/color treatment and no added grain or logo. No images are generated or swapped from this prompt handoff.
