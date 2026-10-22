# Hoodie editorial storefront

The frontend pairs Neue Montreal Regular/Medium with Editorial New Italic, contracts the hero film frame on native scroll, staggers Nix/Rook product images, and adds controlled image inspection plus an inline character/size signup. Approved garment imagery, two-sentence product descriptions, $150 price, 100-per-character edition cap and the December4 movie date remain unchanged. Paid checkout and manufacturing remain disabled.

## Release gate

This draft intentionally excludes font binaries from the public repository. The supplied local font packs have trial/personal-use README labels, despite the owner's stated purchased web licenses. Before production publication, resolve whether those licenses cover these exact files or supply the licensed web downloads; upload authorized binaries to the existing media store, then replace all three local font URLs in `assets/hoodies/style.css`. A deployment without those files uses fallback type and is not the approved typography preview.

The hero derivative has no audio and uses a deliberate Nix-back → Rook-back cut. The full approved master remains available in the explicit preview dialog. Public media provenance is recorded in `saints-hoodie-editorial-media.json`.

## Validation

`npm test` passes163 tests, including durable signup receipt/failure boundary tests. `npm run build` passes. Browser review covers1280×800 and390×844, no mobile horizontal overflow, S-first ordering, card-to-modal Rook XL transfer, failed-save retry, successful inline Rook/Small save against an existing TEST record, cleared email/consent after reset, gallery portrait zoom and Escape.

The site-wide legacy content suite has12 baseline failures in unrelated pages/assets, including an untracked/missing homepage `index.html`; it is not claimed passing. This change is limited to the hoodie storefront.

The requested hero has no manual pause control; reduced-motion preference disables autoplay and transitions. This follows the owner's explicit no-controls direction, with the continuous-motion accessibility tradeoff retained for review.
