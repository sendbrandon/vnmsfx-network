# Saints shop continuity — 2026-10-23

COMPACT / Expertise Engine TRANSLATE: extend the approved dark film-home merchandising into the collection without changing the artwork or commerce contract. Observable success: film → shop retains charcoal/bone values, serif heading hierarchy and the same transparent garments; all sizes, views, zoom and signup still work. The approved white product stages are retained with an explicit local theme reset.

## Locked / revised
- Main collection now uses film charcoal#242628, bone#e8e1d5, Georgia headline family as on the film page, system sans body and preserved IBM Plex Mono utility controls.
- Transparent Back/Front/Portrait assets extend the exterior-only matte of approved studio pixels. Main gallery and detail lens use these; zoom and individual product stage use the original white studio assets. Source hashes and zero-delta print guards are enforced by the matte script.
- Header/footer/release marks remain their original bone colors. Buttons, inputs, focus state and native select options get contrast appropriate to the dark collection; product CTA remains white-on-charcoal on its white stage.
- Existing portrait film, grade, autoplay/mute and controls unchanged. Text remains above the centered film.
- Brandon rejected the first local split hero: "Don't do that thing where you put the text on the side for the hero because that looks very cheesy with the 9:16." That layout was removed before commit/publication. No replacement hero concept is implied or shipped.

## Evidence / references
- User-approved live film /saints-of-bad-luck#shop, actual screenshot and CSS: continuous charcoal, bone serif section heading, unboxed garments and quiet controls. Transfer these exact relationships; no invented palette or font identification.
- Reused and re-inspected Flim TYPOGRAPHY/ATLAS — TYPOGRAPHY — ADVERTISING AND BRAND FILMS/0002-this-is-love-hero-2024-00-00-27.png, still00:27: large display type contrasted against smaller utility text. Borrow hierarchy only, exclude yellow/overlay/obscured product. Approved Saints fonts and placement override reference. No motion inference from still.
- Prior inspected Flim negative-fill00:59:40 receipt in saints-home-merch.md remains applicable to background separation; no new grade or lighting applied to garment pixels.

## Program and verification
- saints-hoodies.html includes film-continuity.css after existing styles. Preserve markup/disclosure/control order; no sidebar hero wrapper.
- film-continuity.css owns scoped dark collection and explicit white #piece/#zoom resets. Existing home.css remains the prior approved foundation.
- app.js separates collectionSource from original source so cutout gallery and original zoom do not cross themes. Decode-before-swap unchanged.
- matte script adds border-corner flood fill for the two500×600portrait crops; approved full garment exports remain identical.

Checks:163tests pass; JS/build pass. Local browser:390px viewport0horizontal overflow and film centered atx195; white Rook product stage retained; CTA disabled untilsize, RookXL transfers to signup; signup contrast checked; collection arrows work. No signup submitted and no payment/manufacturing changes. Hosted verification and proof in the local QA report.
