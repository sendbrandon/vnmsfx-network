# Saints product detail — local review

## Expert translation (TRANSLATE)
Give each hoodie a dedicated white product stage, reached from the collection. Center approved garment imagery with a horizontal front/back/portrait gallery; place name, $150 USD, ascending S–3XL sizes and early access immediately below. Keep enough character-specific description to make the piece legible without film lore. Reveal release, sizing and delivery information in disclosures. Preserve the editorial landing page and approved art.

## Evidence and constraints
- Primary reference: https://yeezy.com/, actual HD-03 detail inspected in browser October 21, 2026. Centered garment, white canvas, broad gallery arrows, small indicators, name/price/size and expandable information. Next-image transition observed moving horizontally before settling. Borrow hierarchy and gallery motion; exclude Yeezy codes, copy, branding and proprietary imagery.
- Flim source: TYPOGRAPHY / ADVERTISING AND BRAND FILMS / `0002-this-is-love-hero-2024-00-00-27.png`, inspected actual still at 00:27. Observed small plain uppercase text against one expressive large typographic gesture. Borrow plain utility labels plus a single existing Editorial italic character name; exclude yellow, layered letters and text across the product. Failure: expressive type competes with artwork. No motion inferred from this still.
- Materials/instruments: existing WebP mockups, hosted licensed fonts, semantic HTML, native dialog, CSS transform gallery. Do not regenerate, recolor, crop garment prints or invent production specifications.
- Process: inspect reference → lock unchanged assets and signup contract → build view → verify gallery/size/signup handoff → desktop/mobile review. Publishing is separate from this local review.
- Medium limits: object-fit contain preserves whole garment; white stage avoids rectangular image borders. One transform track gives spatial continuity; reduced-motion removes sliding. Constrain controls to viewport and let details scroll.
- Current commerce: early access only, 100 of each across all sizes, planned $150 USD, December 4 movie release. No payment or shipping guarantee. Reservation copy was subsequently authorized by Brandon; the existing intake records reservation signups but does not yet enforce the 100-per-character allocation.
- Defects to reject: image stretching, clipped artwork, layout jump, focus escaping modal, size resetting during signup, background scroll, stale character selection, unverified fit claims.

## Compact implementation contract
Product: existing collection launches a shareable `?piece=nix|rook` view. Existing hero and early access remain.
Architecture: static product-view.js reads existing rendered cards; reuses SOBLShop selection and native zoom/signup via narrow custom events. No API or storage changes.
Program: native modal, gallery track, semantic view/size button groups, disclosure details. Synchronize size changes through existing selection event. Guard dialog Escape when nested signup/zoom is active.
Success: user can open either hoodie, inspect all three images, choose S–3XL and reach the existing signup with the exact character and size on desktop/mobile, with no checkout enabled. Back closes to the same collection position. Direct links work. Reduced motion and Escape work.

## Verification
- `npm test`: 163 passed, 0 failed.
- `npm run build`: passed. `git diff --check`: passed.
- Browser desktop 1280×720 and mobile390×844: actual full garment visible, all three Rook images loaded; mobile dialog scrollWidth390 equals clientWidth390.
- Next image changed Nix Back→Front; character switch updated artwork, title and URL; inspect opened existing Rook zoom; disclosure revealed correct release details.
- Rook/M and Nix/3XL handed to existing early-access form correctly. No form submitted and no records created. Escape restored collection/title/URL. View buttons reopened detail. S remains first/default on fresh page.
- Reduced-motion rule disables gallery transition; not separately simulated in browser.
- Screenshot gate PASS (1280×720); temporal grain SKIP because website screenshot. Manual relevant checklist: approved existing mockup pixels unchanged; no type across faces/artwork; website fonts distinct from Lemon on garments; price/release/ascending sizes correct; no invented stock-sales, fit or delivery claims. Video/audio/post packaging checks N/A.

## October 21 follow-up — scoped interaction repair
Rejected: exposed description, always-open size row, automatic S selection in the dedicated view, off-white page, uneven plus glyphs, and sample-approval/no-reservation copy.
Locked: existing garment assets, gallery, price, fonts, hero, original early-access form structure and consent.
Change: native Information disclosure wraps original description/details. Choose your size disclosure starts unselected, S first; CTA remains disabled until explicit selection and guarded again in its handler. Character changes clear the explicit choice. Pure white paper/header; one consistent CSS-line icon per row, plus becomes minus on open. Removed inherited duplicate summary glyph; scoped open-state selector to direct summary only.
Copy: “Sales open soon. Sign up to reserve your hoodie. No payment today.” Signup receipt and future intake record text agree. Existing historical records unchanged.
Verification: 163 tests pass, build passes. Browser verified unselected/disabled state, Rook/M handoff to unchanged form, Information content and new copy. Reservation allocation is not enforced by this existing Notion intake; must add capacity handling before publishing reservation guarantees.
Reference reuse: same inspected Yeezy HD-03 structure and Flim typography receipt above; no font/art/motion changes in this patch.
