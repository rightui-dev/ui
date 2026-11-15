# Feedback components: targeted validation

Release candidate: `0.3.0-beta.4`. Checked on 2026-11-15.

## Installed archive

`bun tools/check-feedback.ts` installs the actual archive into an independent Exact app. All six tests pass: stacking without blocking the page, action dismissal, persistent loading with Spinner, loading-to-success followed by expiry, Hover Card content and dismissal, and all four Tooltip orientations.

`bun run check:package` also installs the archive separately and checks the public Button integration. These checks cover selected behavior, not the entire library.

## Browser checks

Real pointer clicks were used. At 1280×800, a bottom stack has a 384px front card and two narrower cards with 12px exposed steps. Four persistent notifications produce only three visible cards, both collapsed and expanded. The older notification remains queued. The stack is outside a transformed, clipped example container.

Frame samples show directional movement and opacity across the 500ms transition. A top notification moves from above the viewport to a 16px inset; dismissal returns it above the viewport before removal. These are motion checks, not a device frame-rate guarantee.

At 390px width, all Tooltip sides remain inside the viewport. Center differences are less than 0.01px on the relevant axis. Hover Card uses the shared 40px circular AvatarFrame and an original user-icon image.

## Native checks

The Mac application was exercised with real clicks: four Tooltip directions and centered arrows, Hover Card's circular avatar, bottom and top notification stacks, repeated Loading notifications and dismissal revealing an older message. The final Mac archive passes strict signature and ZIP validation.

The iOS device archive compiles, passes ZIP and strict signature checks, and identifies the intended arm64 iPhoneOS build. Device interaction and performance were not rechecked for this release.
