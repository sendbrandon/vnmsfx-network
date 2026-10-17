# Saints 3D collectible preview

Review draft, October 17, 2026. Added below each profile on the cast page, per Brandon’s placement choice. Production is unchanged pending review.

The interactive card keeps the existing 2:3 proportions. Its front uses the exact Meet the Cast portrait in a square upper image area with a CSS fade into the card color. The name, number and existing approved campaign line are HTML; no portrait pixels are regenerated or edited. Its reverse uses that character’s existing v4 card-back PNG.

Front / Back controls, one-turn Spin, horizontal pointer dragging, and arrow/Home/End keys provide equivalent views. Reduced motion disables rotation animation. Switching profiles resets to the front and updates both portrait and reverse. The 3px card thickness uses separate front/back planes and edge surfaces.

The viewer is separate from the existing v4 downloadable PNG/PDF/ZIP files; those exports remain unchanged. This is a browser 3D presentation, not a downloadable Blender/GLB model.

Validation: all 120 Saints tests and build pass. Browser verified front/back, full spin, Rook selection, pointer drag to reverse, and 390px layout with no horizontal overflow. New tests cover cross-character face pairing, accessibility visibility, reduced motion and keyboard/pointer cancellation.


## Motion and material revision

All ten requested card refinements are implemented in the review branch: two-axis dragging (unlimited yaw, vertical tilt limited to ±70°), automatic 360° idle rotation at 25°/second, release momentum with exponential friction, spring settling into front/back reading views, lift while grabbed, four edge surfaces, orientation-driven softbox sheen, matte portrait/satin type, a responsive ground shadow and a restrained 1.2px portrait/type parallax. These are browser CSS 3D and lighting cues, not a physically based WebGL renderer.

Rotation pauses on hover/focus and when offscreen or the document is hidden. Pause/Resume is explicit; reduced-motion settings stop idle rotation and preserve nonanimated side controls. Pointer cancellation settles safely. No perpetual rotation when the component is out of view. Front/back selection holds a reading view before idle can return; keyboard focus keeps it still.

Validation: 122 tests pass, including frame-time motion, both axes, inertia, 360° idle, pause/resume, hidden-document suspension and reduced motion. Browser verified idle rotation, diagonal drag/tilt and 390px sizing. Page-arrangement ideas are proposals only; no broader layout changes are part of this revision.


## Approved page arrangement

Brandon approved all ten layout proposals. The character page now leads with the interactive card beside the character file, with no duplicate standalone portrait. The compact introduction and portrait selectors bring the object into the opening screen. The character name is larger, a restrained lighting zone surrounds the card, controls sit directly below it, and the download action sits beside the description. A related scene and next-character portrait teaser follow the profile.

Existing approved descriptions and download packages are unchanged. Nix/Rook/Vernon link to Road Fight · Come Home; Brick links to Episode 1. No new footage or story facts are introduced. Portrait tabs update the next character and scene with the profile; next-character links use explicit same-site character URLs.

Validation: build and all 123 tests pass. Browser verified the next-character route, Brick’s episode pairing, and no horizontal overflow at 320/390px. At 1280×720 the card and controls appear in the opening viewport. Production remains unchanged while the combined card/layout preview is reviewed.
