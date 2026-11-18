# Changelog

rightui is in beta. No stable version has been released. Versions and their Git tags are immutable.

## Unreleased

## [0.4.0-beta.4] - 2026-11-18

- Add configurable DialogContent with optional close control and right-to-left layout.
- Support full-width carousel tracks and independently placed previous and next controls.
- Add responsive multi-slide and right-to-left carousel layouts. Correct vertical slide and swipe positioning.
- Add described, invalid and selectable card checkbox fields with a single focus target.

## [0.4.0-beta.3] - 2026-11-18

- Share the themed focus ring across editable fields, including OTP, grouped inputs and native selects.

- Use a 1px default focus ring and support disabling it in theme exports. Add DialogFrameWithFocus for dialogs that open directly on a field.

- Slide and resize the open Menubar panel through its full padded height between groups, with immediate switching when reduced motion is enabled.

- Keep overlay backdrops square and viewport-sized, balance drawer close-button insets and reduce space above drawer content.

- Align the first Menubar panel with the outer bar edge and add a small gap below the bar and beside submenus.

- Draw rounded borders on the outer Input OTP cells so the corners stay continuous.

- Menubar now uses the Dropdown Menu panel for trigger alignment, item layout and scrolling.

## [0.4.0-beta.2] - 2026-11-17

- Align Dropdown Menu, Navigation Menu and Popover with their triggers, prefer a horizontal flip when space is limited, and slide the shared navigation panel between triggers.
- Remove Popover exit ghosts that briefly redraw lower in the page after dismissal.
- Animate Accordion and AccordionMultiple with observed numeric heights in both directions, including Firefox, so content and following items close smoothly without relying on intrinsic-size interpolation; preserve reduced-motion behavior.
- Keep Code Block highlighted and diff backgrounds across the full content width when scrolling horizontally.
- Fix Accordion and AccordionMultiple trigger hover/press fills and restore matching horizontal insets for headings, content and chevrons.

## [0.4.0-beta.1] - 2026-11-17

- Add the required `uiWeights` context with `FontWeights`, `defaultFontWeights` and `scaleFontWeights` for proportional semantic weights. Applications must add the provider; custom weight token overrides migrate into the base record. See `docs/MIGRATION-0.4.md`.

## [0.3.0-beta.8] - 2026-11-15

- Add MessageTyping with a one-second staggered three-dot wave and reduced-motion support.
- Correct Message composition: compact conversations, intentional reactions, aligned headers and working retry actions.
- Add a composable MessageScroller viewport and jump control, plus a timed chat demo with stop/resume and preserved reading position.
- Separate navigation panels from their triggers and align their edges within the viewport.

## [0.3.0-beta.7] - 2026-11-15

- Add composable Message groups, metadata and actions; preserve the existing Message API.
- Add bounded MessageScroller transcript variants, rich viewport and manual progressive reply example while preserving the legacy scroller.
- Add grouped NavigationMenu sections with direct links, keyboard navigation and panel motion while preserving the single-trigger menu.

## [0.3.0-beta.6] - 2026-11-15

- Keep FieldLabel and Checkbox hover and pressed backgrounds transparent while preserving activation, mixed state and keyboard focus.
- Replace Attachment demo photography with local document previews and fresh project-oriented filenames.

## [0.3.0-beta.5] - 2026-11-15

- Extend Accordion keyboard navigation and disabled items, and add mixed-state and grouped Checkbox compositions while preserving legacy signatures.
- Add configurable Card frame, header, content and footer spacing, complete interactive card examples, and a public AspectRatioFrame. Bundle the documentation cover image with its provenance.
- Add composable Attachment media, actions, groups and modal previews, plus Bubble content, reactions, collapse and contextual actions through additive Options APIs.
- Add composable Badge icons, spinners, real links and RTL options, and Breadcrumb links, menus and responsive Drawer navigation.
- Add configurable Chart tooltips, legends, formats, visible-series totals, keyboard inspection and RTL across bar, line and area charts. Preserve all existing public call signatures.

## [0.3.0-beta.4] - 2026-11-15

- Add a viewport-level toast stack with directional entrance and exit motion, status icons, loading feedback and configurable top or bottom placement. Preserve the original Toast call signature.
- Add configurable Tooltip sides with centered content and arrows, preserving the original Tooltip call signature.
- Use the public Avatar in Hover Card and remove unrelated upstream branding from example content. Keep inspiration and license attribution.

## [0.3.0-beta.3] - 2026-11-15

- Keep SheetContent a simple edge panel on all four sides. The bottom variant no longer uses Drawer dragging, snap points, spring bounce or a handle; Drawer keeps those interactions.
- Give every Sheet side matching directional entrance and exit animations with a coordinated backdrop fade and reduced-motion support. Existing SheetContent props and focus callbacks remain unchanged.

## [0.3.0-beta.2] - 2026-11-15

- First published 0.3 beta; includes the window overlays and SafeArea from the local beta.1 candidate below. Breaking: migrate SheetContent to controlled `open`, ordered `focusIds` and a `dismiss` callback, and load assets/sheet.css on web. See docs/SHEET.md.
- Add controlled DrawerContent with configurable detached presentation, handle and close controls, backdrop opacity/dismissal, spring bounce and scroll behavior. Preserve Drawer and DrawerAdvanced call signatures.
- Add DrawerInset, fixed DrawerFooter and independently scrollable DrawerBody compositions. Attached panels keep regular content margins; detached panels can use compact margins. A scroll-to-expand mode animates to the full available height with the same controls and progressively restored corners; it does not claim continuous scroll/resize gesture handoff.
- Increase the resize handle's touch target and native hit slop while keeping a compact visual grip. Keep the full surface and backdrop synchronized through drag, bounce and dismissal.
- Keep bottom safe-area spacing inside automatic scrolling content, so it does not cover the visible body with a fixed blank strip.
- Add PopoverTrigger with a declared native invoker relationship. Fix repeat-trigger dismissal in Popover and controlled popovers without changing existing DisclosureButton or Popover signatures.

## [0.3.0-beta.1] - 2026-11-15

- Add SafeArea with independently configurable edges backed by Exact's real safe-area values.
- Add continuous Drawer and bottom Sheet dragging with 30% / 90% default stops, momentum-aware snapping, keyboard resizing and pull-down dismissal. DrawerAdvanced exposes custom snapPoints and initialSnap; the spring is a shared theme token.

- Render Dialog, AlertDialog, Drawer, Sheet and Toast in the window-level painted RightUI layer, outside clipped or transformed demo containers. Keep the authored surfaces on iOS and macOS instead of presenting an operating-system sheet.
- Preserve controlled visibility, modal keyboard handling, editable content and focus restoration. Toast remains non-modal and appears at the viewport edge.
- Breaking: SheetContent now takes `open`, `focusIds` and `dismiss`. Replace `showModal`/`close` calls with state changes and restore focus in the dismiss callback. See docs/SHEET.md. Load assets/sheet.css for web overlay positioning and scroll locking.

## [0.2.0-beta.5] - 2026-11-14

- Keep decorative Avatar images out of pointer hit testing so the first click reaches an enclosing button and activates the server-rendered app. Preserve image loading, error recovery and interactive badge slots.

## [0.2.0-beta.4] - 2026-11-14

- Refine Avatar image loading and failed-source recovery while preserving existing props. Keep one accessible name and reserve the image dimensions.
- Add theme-linked avatar geometry, status tones, custom group overflow, explicit RTL overlap and an AvatarMenu that shares the existing keyboard-accessible menu behavior.
- Bundle original user icons on flat color backgrounds and rebuild the Avatar examples with basic, fallback, badge, group, size, dropdown and RTL compositions.

## [0.2.0-beta.3] - 2026-11-14

- Add SheetContent, SheetBody and SheetFooter with native modal focus, four viewport-edge layouts and a scoped web stylesheet for positioning and scroll locking. Preserve the existing controlled Sheet API.
- Export the new modal composition from the optional `@rightui/ui/sheet` entry, so existing root imports do not require additional app configuration.
- Rebuild the Sheet demo with editable profile fields, four sides and an optional corner close control.
- Prevent focus-driven dialog scrolling from interrupting right and bottom Sheet entrance animations, including the no-close-button example.
- The beta.2 candidate was local only; this release includes its additions and the final animation correction.

## [0.2.0-beta.1] - 2026-11-14

- Breaking: typography now requires a root `provide uiFont` binding. Use `"theme"` to retain the body family selected by the exported Tamber configuration, or choose `"sans"`, `"serif"` or `"mono"` dynamically. See `docs/MIGRATION-0.2.md`.
- Add a shared `uiFontFamily()` Contract helper and three static family roles. Move typography out of the design axes so all six palettes, two densities and three corner styles remain independently selectable within 36 Exact mode combinations, supporting 108 appearance settings with the three typefaces.
- Bundle Newsreader regular and italic variable faces (weights 200–800) for the existing `serif` choice, with the original OFL license, pinned source revision and file hashes. Extend font setup helpers and registry resources to include both faces.
- Add Violet as a complete light/dark palette for backgrounds, cards, text, controls, borders, focus, sidebars and charts; verify targeted text, button and focus contrast.
- Keep copied configurations self-contained, including their chosen body family. Remove the former `ui-font` axis; typography previews now use an explicit provider.
- Breaking: code-block variants with copy feedback require the root clipboard controller documented in `docs/CODE-BLOCK.md`. Feedback clears after three seconds; another copy restarts the interval.
- Add a segmented variant to `RadioGroupAdvanced` for shared application selectors.
- Declare `rightui-font` in consuming applications' `app.json` data arrays; document the required typography and clipboard migration.
- Add shared theme foundations, semantic aliases and component recipes, plus neutral, indigo, forest, rose and amber presets with independent density, corners and typeface settings.
- Give Rose and Amber complete light/dark surface, control and chart palettes with targeted text, button and focus contrast checks. Exported settings types and palette branches derive from the same options.
- Export a pure `@rightui/ui/theme` configuration helper and document app-level axes and system-owned appearance boundaries.
- Share code surfaces, control primitives and presentation recipes with consuming applications; migrate examples, blocks, charts and AI patterns to the same configuration.
- Add a themeable MarkdownDocument renderer for explicit supported syntax and AST input. Preserve the legacy Markdown renderer and document its host-owned appearance limitations.
- Export PopoverFrame for controlled popovers with a custom trigger, shared styling, Escape focus return and outside-click dismissal.
- Fix Switch state rendering and shared recipe sizing. Separate desktop and mobile dashboard sidebar state, and keep the mobile menu above content.
- Include migration, theming, code-block, composition and Markdown guides in the npm archive.

## [0.1.0-beta.5] - 2026-11-14

### Components

- Refine Trace spacing, status icons, disclosure focus and source links. Export TraceTitle and TraceDescription for richer compositions, with a replayable reasoning and tool-result example.
- Add CodeBlockAdvanced, CodeToken and CodeLine for syntax tokens, highlighted lines, custom line numbers, constrained height and optional UTF-8 file export.
- Improve existing CodeBlock rendering with a file header, line wrapping, copy feedback and semantic diff colors. Add light/dark syntax colors and a reproducible Shiki-highlighted example.
- Existing component imports and required props remain compatible. No migration or Exact SDK upgrade is required.

## [0.1.0-beta.4] - 2026-11-13

### Fixed

- Add consistent horizontal padding to Accordion and AccordionMultiple so headings, expanded content and chevrons stay inset from their container edges. Public props and the Exact SDK pin are unchanged.

## [0.1.0-beta.3] - 2026-11-13

### Documentation and distribution

- Refresh the distributed README with concise platform validation status and official npm installation guidance.
- Publish from the clean source history; replace the earlier GitHub prereleases with this new version.
- Component APIs, Contract sources, theme tokens, fonts and the pinned Exact SDK are unchanged from beta.2. No application migration is required.

## [0.1.0-beta.2] - 2026-11-13

### Distribution

- Prepare public npm distribution of `@rightui/ui` on the beta channel, with explicit public registry settings.
- Add exact-version npm installation and update guidance; preserve immutable archives for offline installs.
- Link the package to the public documentation at https://rightui.dev.
- Component APIs, theme tokens and the Exact SDK pin are unchanged from beta.1.

## [0.1.0-beta.1] - 2026-11-13

### Added

- Initial packaged Exact Contract components, shared Tamber theme and Geist font.
- Component examples, AI patterns, blocks and area charts in the source repository.
- Versioned archive installation, isolated web build and interaction validation.
- TypeScript and Rust data integration examples and a native showcase project.

### Compatibility

- Exact SDK: `53426cf02bf986a5e781abc4f953d79989c6dc05`; Bun: `1.4.2`.
- Targets: web, iOS and macOS. Web and targeted macOS checks passed; iOS validation is incomplete. Full catalog visual/accessibility coverage remains incomplete.
- No previous published rightui package to migrate from. The earlier untagged `0.1.0` development manifest was never a stable release.
