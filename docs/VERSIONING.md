# Beta versioning and delivery

Agents manage versioning completely, including release notes, synchronized files, validation and authorized delivery. The package name is always `@rightui/ui`. Releases currently use `0.x.y-beta.N` only, starting with `0.1.0-beta.1`. Every authorized npm delivery aligns `beta` and `latest` to the validated beta version. No stable version is allowed without an explicit user request.

## Choose the next version

- A delivered batch changing package behavior, API, tokens, assets or packaging increments the beta serial on the current base: `0.1.0-beta.1` → `0.1.0-beta.2`.
- A breaking public contract, import, prop or behavior change increments the minor, resets patch to zero and beta to one: `0.1.0-beta.2` → `0.2.0-beta.1`. Include migration instructions.
- Docs-only and site-only changes do not release the UI unless consumers need a redistributed package.

## Release procedure

The delivery implementation is the sibling website's local engine: `../landing/release npm` or `../landing/release all`, as authorized. See `../landing/docs/RELEASING.md`. Prepare and commit/push the source version first. The engine then performs local validation, tags, immutable GitHub prereleases and the npm-only GitHub Actions dispatch. Website/native builds and uploads never run on GitHub. The numbered procedure below describes the invariants; do not duplicate completed engine steps manually.

1. Fetch remote tags with `git fetch origin --tags`, then record meaningful changes in nonempty `## Unreleased` notes in `packages/ui/CHANGELOG.md`. Describe affected behavior and any migration. From the components repository root, run `bun run version:ui <exact-version>` with the chosen exact beta version. It consumes those notes into a version entry, updates the manifest, Bun lock and current version in `README.md`, `docs/INSTALLATION.md` and `packages/ui/README.md`, and validates prerelease monotonicity. It does not commit, tag, push or publish.
2. Keep the Exact SDK pinned to an exact version/revision and document compatibility. Run `bun run check:version` for beta policy, lockfile, documentation and changelog consistency. Run `bun run test:version` when release tooling changes. Run `bun run check:package`, which packs the UI, installs the archive in isolation and builds it without browser scenarios. Keep checks fast and useful; browser suites require an explicit user request. Refresh and build the documentation site using its documented commands; report platform validation actually executed.
3. Review the versioned changelog, archive contents and installation instructions. The site generator substitutes `{{UI_VERSION}}` in `content/guides.json` from the installed sibling manifest. Preserve that placeholder instead of maintaining another version literal.
4. When session authorization covers delivery, create a conventional release commit such as `chore(release): @rightui/ui 0.1.0-beta.2`, create an annotated Git tag `v0.1.0-beta.2`, and push the authorized commit and tag. Create a GitHub pre-release (never a stable/latest release) with the versioned `.tgz`, its `.sha256` file and the matching changelog notes when release delivery is authorized. Authorization already given remains valid; do not ask again. These rules do not authorize commits or remote actions by themselves. If authorization is absent, prepare the reviewable result and report the remaining delivery step.
5. Preserve released versions, archives and tags forever. Never replace a released archive, move/overwrite a tag or republish the same version. Fix mistakes with a new beta version. Report the exact version, artifact location, checks and delivery state.

## Updating a friend's app

Install an exact published beta in the consuming app:

```sh
bun add --exact @rightui/ui@<version>
```

Build/test the app against its pinned Exact SDK, then commit both `package.json` and `bun.lock`. For rollback, reinstall the previous exact version and validate again. Do not automatically upgrade the SDK with the UI package.

The immutable `.tgz` and `.sha256` remain available for offline installation. Keep them at a durable path available to anyone reinstalling the app. Verify the archive with `shasum -a 256 -c <archive>.sha256`.

## npm distribution

Local archive delivery does not require npm publication. Never run `npm publish` without explicit session authorization to publish and verified ownership/access to the npm `@rightui` scope. The GitHub organization and npm scope are separate. Once authorized and verified, publish a new beta version on the npm `beta` channel, verify its bytes, then align `latest` to that exact version. Stable versions remain forbidden unless explicitly requested. Publication is separate from version preparation, commits, tags and pushes.

Publication runs only in `.github/workflows/publish-npm.yml`, through the configured npm trusted publisher and GitHub OIDC. The workflow downloads the locally validated GitHub release archive, checks its checksum and tagged source contents, and publishes those exact bytes on beta without rebuilding. Do not run npm publish locally or store an npm publishing token. Initial trusted-publisher setup may require interactive login/2FA, separately from subsequent automated publication. A successful upload may precede public registry availability; the engine verifies the exact archive before updating consumers.

Run `bun tools/check-package.ts --registry` after the package becomes available. This creates an isolated app, installs the exact npm version, builds it without launching a browser. Add `--browser` only when browser testing is explicitly requested. Its temporary Bun configuration exempts only `@rightui/ui` from a developer's minimum-release-age rule; it does not change global settings or relax the rule for other dependencies.

Since November 17, 2026, the standing delivery policy is to make every validated published beta the default installation. The npm workflow runs `npm dist-tag add @rightui/ui@<version> latest` after verifying the published archive, then requires both `latest` and `beta` to match. It refuses to roll a newer version back. A `latest` tag does not change the prerelease version into a stable version; GitHub releases remain prereleases. The npm trusted publisher must allow both direct publishing and dist-tag management. A `tags_only` workflow run can repair an existing beta's tags without publishing another package.
