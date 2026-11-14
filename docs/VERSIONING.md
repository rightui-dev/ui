# Beta versioning and delivery

Agents manage versioning completely, including release notes, synchronized files, validation and authorized delivery. The package name is always `@rightui/ui`. Releases currently use `0.x.y-beta.N` only, starting with `0.1.0-beta.1`. No stable release or npm `latest` channel is allowed without an explicit user request.

## Choose the next version

- A delivered batch changing package behavior, API, tokens, assets or packaging increments the beta serial on the current base: `0.1.0-beta.1` → `0.1.0-beta.2`.
- A breaking public contract, import, prop or behavior change increments the minor, resets patch to zero and beta to one: `0.1.0-beta.2` → `0.2.0-beta.1`. Include migration instructions.
- Docs-only and site-only changes do not release the UI unless consumers need a redistributed package.

## Release procedure

1. Fetch remote tags with `git fetch origin --tags`, then record meaningful changes in nonempty `## Unreleased` notes in `packages/ui/CHANGELOG.md`. Describe affected behavior and any migration. From the components repository root, run `bun run version:ui <exact-version>` with the chosen exact beta version. It consumes those notes into a version entry, updates the manifest, Bun lock and current version in `README.md`, `docs/INSTALLATION.md` and `packages/ui/README.md`, and validates prerelease monotonicity. It does not commit, tag, push or publish.
2. Keep the Exact SDK pinned to an exact version/revision and document compatibility. Run `bun run check:version` for beta policy, lockfile, documentation and changelog consistency. Run `bun run test:version` when release tooling changes. Run `bun run check:package`, which packs the UI, installs the archive in isolation and builds/tests it. Add meaningful checks for the changed behavior. Refresh and build the documentation site using its documented commands; report platform validation actually executed.
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

Local archive delivery does not require npm publication. Never run `npm publish` without explicit session authorization to publish and verified ownership/access to the npm `@rightui` scope. The GitHub organization and npm scope are separate. Once authorized and verified, publish only a new beta version on the npm `beta` channel. Stable versions and `latest` remain forbidden unless explicitly requested. Publication is separate from version preparation, commits, tags and pushes.

For an interactive publication with a security key, run npm in a real terminal and use its web authentication link; do not request a numeric OTP or a new token when the account uses WebAuthn. A successful upload may precede public availability while npm processes the package. Verify the registry version and archive integrity before changing consumer installation commands.

Run `bun tools/check-package.ts --registry` after the package becomes available. This creates an isolated app, installs the exact npm version, builds it and tests the Button interaction. Its temporary Bun configuration exempts only `@rightui/ui` from a developer's minimum-release-age rule; it does not change global settings or relax the rule for other dependencies.

Check `npm dist-tag ls @rightui/ui` after publication. When explicitly authorized to make a beta the default installation, point `latest` to that exact published version with `npm dist-tag add @rightui/ui@<version> latest`, then verify both `latest` and `beta`. A `latest` tag does not change the prerelease version into a stable release. Fabio explicitly authorized making beta.5 the default on November 14, 2026. Do not remove an intentionally authorized `latest` tag.
