# Sheet regression fixture

Run `bun tools/check-sheet.ts` from the repository root. It packs the candidate, installs its archive in a temporary app, builds it and runs these eight tests. The demo uses controlled `open`, `dismiss` and `focusIds`, not the platform dialog lifecycle. The `/initial` fixture starts with a bottom sheet open and uses F8 to toggle its parent state, including reopening during an exit.

Copy this fixture to a temporary app, add the current package at `node_modules/@rightui/ui`, copy `examples/sheet.contract` to `sheet-demo.contract`, copy package `assets/` and `ui.tamber` to the app, and add the generated Exact CLI wrapper. Run `exact.mjs web-build --out dist` and `exact.mjs test web` with the pinned SDK. Never build in the fixture source directory.

The transformed, clipped container deliberately reproduces the original defect. In a browser also verify viewport bounds at 1280x800 and 390x844 after scrolling the document, Tab/Shift+Tab containment, keyboard focus containment, return focus, internal scrolling and reduced motion. Measure both entrance and exit in all four directions, with the backdrop retained until the panel reaches its edge. These geometry checks are distinct from the Contract interaction tests.

For the pointer-focus animation regression, load `tools/check-sheet-motion.browser.js` in the documentation page, arm a trigger with `rightuiSheetMotion.arm(triggerId, sheetId, side)`, then click it with a real pointer. Read `rightuiSheetMotion.result` after 800ms. Check `sheet-open-no-close` / `sheet-profile` / `right`, and the four `sheet-open-<side>` / `sheet-<side>` pairs. A DOM `.click()` has detail zero and misses this regression.

The motion probe checks the manual popover transport (`rightui-modal-<sheetId>-layer`) and the authored Sheet wrapper. It must not mistake a mounted but hidden layer for an open sheet. Native checks must also confirm that no system sheet card or scaled background is presented.
