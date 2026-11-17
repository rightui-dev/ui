# rightui library

Public UI is written in Exact Contract. `packages/ui/index.contract` is the public entry.
Use English docs and examples. Keep demos in `examples/`, using `@rightui/ui`.
Target web, iOS and macOS only. Do not expand platform support without an explicit request; distinguish target support from executed validation.
No React, DOM adapters or fake Rust widget APIs. Keep existing accessibility and reduced motion.
The website is the sibling `../landing` repository; avoid edits outside your assigned files.
Exact SDK is `../.tooling/exact`. Builds belong to the parent integration agent.

## Autonomous beta delivery

Delivery uses the sibling website's local engine: `../landing/release npm` (or `bun run release:npm` here). See `../landing/docs/RELEASING.md`. GitHub Actions runs only `.github/workflows/publish-npm.yml`, which verifies and publishes the existing validated archive with OIDC. Never publish npm locally or add web/native builds to Actions. Keep setup/testing authority distinct from product-release authority. Resume the same recorded delivery after an interruption; never overwrite an existing archive or tag.

Agents own versioning end to end. Follow `docs/VERSIONING.md` for every delivered batch; keep the package name `@rightui/ui`.
Only `0.x.y-beta.N` releases are allowed now. Increment the beta serial for package behavior, API, tokens, assets or packaging changes. Breaking public contracts, imports, props or behavior require the next minor, patch zero, beta one and migration notes. Docs/site-only work needs no UI release unless redistribution is required.
Use root `bun run version:ui <exact-version>` with nonempty `## Unreleased` notes in `packages/ui/CHANGELOG.md`. Keep the manifest, Bun lock, versioned changelog and installation docs aligned, with an exact Exact SDK pin.
Every library delivery includes updated documentation, a documentation build, meaningful package validation, an immutable versioned archive, a conventional release commit and an annotated `v<version>` tag. Authorized release delivery also creates a GitHub pre-release with the archive, checksum and matching changelog notes; never mark it stable/latest. Commit, tag and push only within session authorization; reuse existing authorization without asking again, and never infer it from these rules. The version tool does not commit, tag, push or publish.
Never overwrite a released archive/tag or republish a version. Never run npm publish without explicit authorization and verified ownership of the npm `@rightui` scope; a GitHub organization proves no npm ownership. Stable versions and the npm `latest` channel require an explicit user request; the current release policy remains beta only.

Keep `metadata/compatibility.json` tied to actual validation evidence. After changing platform behavior or checking a component, update the affected rows and run `bun run compatibility`; a build alone is never full compatibility. Keep Windows/Android marked unsupported until scope and validation change explicitly.
