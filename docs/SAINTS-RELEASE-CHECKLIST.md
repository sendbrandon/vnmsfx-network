# Saints site completion and release checklist

## Ready to prepare locally

- Keep the original film-led dossier and stills on the dedicated cast page. The landing page uses the owner-requested name-only cast shelf, compact episode cards, show facts and an honest Clips placeholder.
- Add real collectible front/back images, phone wallpapers, print PDF and a complete ZIP only after the final files and their manifest have been verified.
- Preserve accessible tab selection and provide ordinary download links that do not need an account, email address or successful analytics call.
- Keep an unobtrusive character next step below the player, including when the YouTube API is blocked or the film has not ended.
- Link the existing press page from the main-page footer.
- Keep privacy-minimal events and a bounded campaign dictionary. Clearly distinguish a file-link click, a player start, a playhead milestone and an ended callback.

## Decisions required before wider copy or service changes

### Release facts

Confirm exactly what becomes available on December 4, 2026: title/item, what is new, viewing access, time and timezone. The currently available 5:11 video and the unannounced Episode 2 must not be assigned that date by inference. Do not add a countdown before the release time is established.

### Video packaging

The site presents the embedded video as Episode 1, “Get Her Back.” The verified YouTube upload uses “Official Trailer” in its title. Confirm the intended packaging before changing site descriptions or YouTube metadata. The character/download work does not resolve or silently change this discrepancy.

### Memberships and commerce

Confirm the intended current sales state and approved disclosure language before reconciling static “coming soon” wording with runtime membership availability. Do not change pricing, purchase eligibility, paid access, release flags or billing terms to make copy appear consistent. Test with authorized test-mode configuration only; no production purchase is part of QA.

### Release alerts

A genuine release-alert form needs an approved provider, consent copy, confirmation behavior, duplicate handling, unsubscribe and verified delivery/error behavior. Club applications have a different purpose. Do not automatically enroll applicants or press contacts, and do not display a working signup claim before this flow exists.

### Press facts

The existing press destination remains linked. A new biography, credits, portrait, production description and editorial-use terms require verified, approved content. Do not infer credits, budget, awards, team size, production tools or broad reuse rights from possession of artwork.

### Analytics collection

The event helper dispatches local browser events only. Select and approve a collector and its privacy configuration before reporting aggregate visitor counts or campaign conversions. Any future confirmed-subscriber event must originate from an actual provider/backend confirmation, not a form click.

## Final review and deployment sequence

1. Verify the approved downloadable files against their checksums and inspect every image, PDF and ZIP.
2. Run the full Saints test suite, build, syntax checks and whitespace checks against the final source.
3. Review the desktop and mobile layouts, touch/keyboard controls, reduced motion, every download, offline failures, player end/replay/fullscreen and Back/Forward in a functioning authorized browser. Clearly label source-derived visual proofs separately from browser screenshots.
4. Review the complete code and asset diff, including unchanged price/access/release values and the local-only analytics limitation.
5. Obtain final publication approval. A local implementation or visual review is not production deployment.
6. Publish a review branch and verify the exact remote commit. Inspect any available preview and its build result before considering production.
7. Deploy only through an authorized project/workflow, verify the expected commit and test the public URLs signed out. Do not work around an access denial.
8. Record the final deployed commit and acceptance results. Until then, describe the work as local or preview-ready, never live.

## Rollback

This feature does not need database migrations, account changes, credential changes or payment configuration. If a published version fails verification, revert only the reviewed feature commit and restore the prior static page/assets through the same authorized deployment workflow. Do not disable existing memberships or alter stored member data as part of rollback. Keep the prior approved release available until the new deployment has been verified.
