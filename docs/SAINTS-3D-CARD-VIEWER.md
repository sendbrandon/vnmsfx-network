# Saints 3D collectible preview

Review draft, October 17, 2026. Added below each profile on the cast page, per Brandon’s placement choice. Production is unchanged pending review.

The interactive card keeps the existing 2:3 proportions. Its front uses the exact Meet the Cast portrait in a square upper image area with a CSS fade into the card color. The name, number and existing approved campaign line are HTML; no portrait pixels are regenerated or edited. Its reverse uses that character’s existing v4 card-back PNG.

Front / Back controls, one-turn Spin, horizontal pointer dragging, and arrow/Home/End keys provide equivalent views. Reduced motion disables rotation animation. Switching profiles resets to the front and updates both portrait and reverse. The 3px card thickness uses separate front/back planes and edge surfaces.

The viewer is separate from the existing v4 downloadable PNG/PDF/ZIP files; those exports remain unchanged. This is a browser 3D presentation, not a downloadable Blender/GLB model.

Validation: all 120 Saints tests and build pass. Browser verified front/back, full spin, Rook selection, pointer drag to reverse, and 390px layout with no horizontal overflow. New tests cover cross-character face pairing, accessibility visibility, reduced motion and keyboard/pointer cancellation.
