# Website photographic finish — FFmpeg v2, 2026-10-16

Brandon rejected the generative v1 finish because it reconstructed detail and reduced resolution. The website now uses conventional FFmpeg processing from the untouched selected upscales and original episode stills. No v1 generated pixels enter this pipeline.

## Current process

- Monotonic RGB tone curve gently lowers midtones and compresses highlights, with a slight shadow toe.
- RGB channel matrix reduces saturation to 94%, without YUV chroma subsampling.
- Restrained shadow/highlight color balance preserves lightness.
- Seeded strength-1 uniform noise adds a trace of texture; equal channel seeds avoid colored speckles.
- Lossless RGB PNG output, full range with sRGB transfer metadata.

No resizing, cropping, warping, sharpening, blurring, inpainting or regeneration. Cast files retain **2896×2172** and episode stills retain **1984×864**. Source hashes are checked before and after processing. Hair, skin, wardrobe and facial geometry come from the original supplied files.

Reproduce with `python3 scripts/finish-saints-photos.py`. The v2 manifest records exact commands, filter values, source/output hashes, dimensions and FFmpeg version. Original source files are preserved; v1 derivatives remain archived as rejected history.

Both the landing cast shelf and character detail page use identical v2 portrait URLs, including the default HTML and all tab/query selections. Existing CSS shoulder fades, subdued episode overlays and punchy Character file copy remain. Hero, Depot Gate, collectible downloads, prices and access rules are untouched. Production publication remains pending review.

## Archived v1 record — rejected, not current

# Website photographic finish — review v1, 2026-10-16

Brandon requested a restrained match to the existing hero and The Depot Gate. Six native image edits supply the landing-page display assets. A follow-up consistency repair also reuses the four exact cast files on the character detail page. Original selected upscales and shared episode stills remain intact. This is a finishing preview, not a canon or production-publish decision.

## Ten small moves

1. Modestly lower exposure.
2. Gently roll off highlights.
3. Add midtone density.
4. Soften the shadow toe while retaining fabric detail.
5. Tame excess pink/orange skin chroma.
6. Restrain bright digital whites.
7. Add a trace of muted olive/blue-gray in shadows.
8. Reduce brittle upscale microcontrast.
9. Integrate fine irregular photographic grain.
10. Add barely perceptible optical softness to bright transitions.

Episode badges and arrow are separately softened with scoped charcoal CSS overlays. Portrait shoulder fades remain CSS-only. No global filter or heavy vignette is applied.

## Provenance and review

The asset manifest records the edit target, native output, color/texture references, complete instruction, dimensions and SHA-256 for each derivative. Native outputs are 1448×1086 for cast and 1900×828 for episode cards. These are newly generated finishing derivatives, not pixel-identical copies or retained source-resolution masters. Character identity, framing, wardrobe and scene relationships were visually reviewed. Native editing can reconstruct fine facial detail; originals are retained for comparison.

The hero, Depot Gate film/poster, original dossier still masters, download masters, copy, pricing, eligibility and release flags are unchanged.

## Character detail consistency repair

The default HTML portrait and all four JavaScript selections use the same finished portrait URLs as the landing cards. The detail frame preserves the 4:3 composition and soft shoulder fade. “What drives them” becomes “Character file”, with punchy public-facing profiles grounded in the existing website facts. No new backstory, spoiler, or canonical record is introduced.
