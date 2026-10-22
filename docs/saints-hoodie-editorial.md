# Hoodie editorial storefront

The frontend pairs Neue Montreal Regular/Medium with Editorial New Italic, contracts the hero film frame on native scroll, staggers Nix/Rook product images, and adds controlled image inspection plus an inline character/size signup. Approved garment imagery, two-sentence product descriptions, $150 price, 100-per-character edition cap and the December4 movie date remain unchanged. Paid checkout and manufacturing remain disabled.

## Fonts and media

The owner confirmed on October21,2026 that the purchased web licenses cover these exact supplied font files. Neue Montreal Regular/Medium and PP Editorial New Italic are hosted in the existing media store; font binaries remain outside this public repository. URLs, byte counts and SHA256 hashes are recorded in `saints-hoodie-editorial-media.json`. Each CSS face declares its actual weight/style with `font-display: swap`.

The hero derivative has no audio and uses a deliberate Nix-back → Rook-back cut. The full approved master remains available in the explicit preview dialog. Public media provenance is recorded in `saints-hoodie-editorial-media.json`.

## Validation

`npm test` passes163 tests, including durable signup receipt/failure boundary tests. `npm run build` passes. Browser review covers1280×800 and390×844, no mobile horizontal overflow, S-first ordering, card-to-modal Rook XL transfer, failed-save retry, successful inline Rook/Small save against an existing TEST record, cleared email/consent after reset, gallery portrait zoom and Escape.

The site-wide legacy content suite has12 baseline failures in unrelated pages/assets, including an untracked/missing homepage `index.html`; it is not claimed passing. This change is limited to the hoodie storefront.

The requested hero has no manual pause control; reduced-motion preference disables autoplay and transitions. This follows the owner's explicit no-controls direction, with the continuous-motion accessibility tradeoff retained for review.
