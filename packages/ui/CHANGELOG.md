# Changelog

rightui is in beta. No stable version has been released. Versions and their Git tags are immutable.

## Unreleased

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
