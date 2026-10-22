# Homepage gallery repair

Expertise-engine TRANSLATE + scoped repair. Rejected:220ms opacity0.35→1 animation on every show(), compounded by pointerenter/leave swaps. Locked: approved imagery, product dialogs, white/Mono layout, labels, copy, video and signup. Editable: homepage gallery controls/change behavior only.

Constraint bank: retain current image until replacement decode resolves; reject stale decode results after rapid navigation; remove opacity animation completely; labels select only on click; arrows cycle the same back/front/detail state and synchronize aria-pressed; preserve zoom/size paths; match existing product-dialog arrow styling.

Dependencies: inspect existing gallery→remove flash/hover swaps→reuse arrow styling→browser-test forward/back/wraparound/labels at desktop and390px mobile→tests/build→publish. Named failures: opacity flash, unintended hover swap, stale asynchronous image commit, arrow/label state disagreement. Professional success: each intentional navigation produces one fully decoded image, stable opacity and correct label, without changing approved design.

Validation:163 tests pass, build/diff checks pass. Browser verified Nix Back→Front→Portrait→Back and Rook Back→Portrait→Back, correct labels, opacity1/animation none,4accessible arrows and390px no horizontal overflow. No signup submitted.

## Plain controls revision
Brandon requested bare arrows, removal of the visible Inspect detail label and magnification over the image. Expertise TRANSLATE repair constraints: remove only homepage arrow backgrounds/radii and zoom label; make the existing accessible enlarge button transparent across the entire image with zoom-in cursor; preserve click-to-enlarge and the existing moving lens. Allow lens pointer tracking through the new image button, but suppress it over arrow controls. Keep arrows above the transparent image button/lens so navigation remains clickable. Product dialog, media and all other layout remain unchanged.

Verified both arrows transparent/radius0, image button empty/transparent with zoom-in cursor and full-image bounds; arrow advances Front and image click opens NIX/FRONT zoom dialog.163tests/build/diff checks pass.
