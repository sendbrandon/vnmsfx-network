# Film-home merch integration — 2026-10-23

Approved scope: remove white-backed merch panels on the dark film homepage; use the latest approved garment pixels, integrate with charcoal, preserve silhouette/print, add quiet front/back reveal and touch controls. Collection/product pages remain white and unchanged.

Expertise Engine DRILL constraints: key only border-connected white background, keep enclosed bone lettering opaque, unmatte white edge contribution only in the outer two-pixel band, retain all opaque core RGB, retain900×1000resolution, export lossless RGBA. Never multiply the garment or regenerate it. Source hashes match docs/saints-hoodie-studio-media.json. Front source is identical for both approved designs, so one asset is reused. Output/provenance hashes: saints-home-merch-media.json.

References reused from the inspected working brief: live film #shop screenshot; COMPOSITION-01/MET-438817 full preview for purposeful spacing (exclude painting palette); Flim LIGHTING/LOW-KEY AND NEGATIVE FILL/0003-no-country-for-old-men-2007-00-59-40.png still00:59:40 for relative silhouette/background value separation only (exclude amber grade, patterned light and crushed product detail). No motion inferred from a still.

## Program / interaction
- saints-of-bad-luck.html: two article cards link directly to the corresponding piece, layered transparent images and native Back/Front buttons.
- landing-experience.css: continuous page charcoal, broad low-contrast neutral backing, aligned garments, one column on small screens; no boxed border/radius or global print grade.
- home-merch.js: desktop pointer/focus preview; persistent button selection for touch/keyboard. Decode before swap; revision token rejects stale requests. Aria-pressed and image visibility reflect displayed view. Reduced motion removes the short opacity transition. No signup/payment/API changes.
- scripts/matte-saints-home-merch.py: conventional pixel-only reproducible asset preparation; source/output dirs passed explicitly, binaries outside Git.

## Checks
163 existing tests pass; build and JS syntax pass. Browser checks cover original back state, front and back control, all three assets loaded, mobile342px single-column content at390px viewport with zero horizontal overflow. Source print guard regions have0changedRGBpixels and alpha255; opaque garment core unchanged. Final production and screenshot checks recorded in the local review report.
