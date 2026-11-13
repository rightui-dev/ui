# Native demo

`examples/native` is the macOS and iOS showcase. It imports the library's shared Contract sources: 66 components, 21 AI patterns, 27 blocks and 10 charts. The UI package is a workspace dependency. Bun 1.4.2 links the registry directly to this checkout, so Exact resolves one shared copy of the UI tokens. No published rightui package is needed.

rightui's current platform scope is **web, iOS and macOS only**. Windows, Android and Linux are not supported targets for this project. A target's presence does not establish validation: macOS has been built and tested locally; the iOS toolchain blocker is documented below.

## Setup

From the components repository root, with Git and **Bun 1.4.2** installed:

```sh
bun run native:setup
```

Setup clones [Exact](https://github.com/expo/exact) into `../.tooling/exact` when absent and checks out revision `53426cf02bf986a5e781abc4f953d79989c6dc05`. It installs the new SDK's dependencies, then registers this checkout with `bun link` and installs the repository and demo dependencies. The link is local to the current user; it does not publish the package. An existing SDK must already have that revision; setup refuses a different revision and never changes an existing SDK checkout. Existing SDK dependencies remain the owner's responsibility.

For another SDK location, set `EXACT` to its absolute path and keep that variable set for subsequent commands:

```sh
export EXACT=/absolute/path/to/exact
bun run native:setup
```

The source distribution requires the components repository and the pinned SDK. Generated native workspaces and local build caches are not substitutes for these sources.

## Platform checks

From `examples/native`, check the target's prerequisites before building:

```sh
EXACT_FEEDBACK=0 bun "${EXACT:-../../../.tooling/exact}/scripts/exact.mjs" setup --check --platform macos
EXACT_FEEDBACK=0 bun "${EXACT:-../../../.tooling/exact}/scripts/exact.mjs" setup --check --platform ios
```

Follow the SDK's reported Rust, Apple toolchain and optional Hermes installation requirements. A TypeScript data source uses Exact's pinned Hermes bundle; Node or DOM APIs cannot be imported into that source.

## Build and validate

Run these commands from the components repository root. Each command refreshes the local source link and generates the catalog before building:

```sh
EXACT_IDENTITY=- bun run native:mac
bun run native:ios
EXACT_IDENTITY=- bun run native:test:mac
```

`EXACT_IDENTITY=-` requests a local ad hoc Mac signature. A successful build produces an artifact; it does not prove that every control works on a device. Inspect the native app and exercise navigation, menus, dialogs, file pickers and AI progression separately. The SDK provides `test macos` and `verify ios`; there is no `verify macos` command.

The pinned Exact iOS Swift host requires the **iOS 27.1 SDK** from a compatible full Xcode installation. The macOS SDK floor is 26.0. Do not lower the SDK requirement or alter the pinned SDK to bypass this check.

An iOS Simulator build needs no Apple signing team. Installing on a physical iPhone requires an appropriate Apple identity, provisioning profile and device registration. Build and launch are separate steps; setup does neither.

## Sharing

The source project can be copied with the library and rebuilt using these instructions. Local Mac builds use ad hoc signing and are **not notarized**. This setup does not produce an App Store submission or promise installable distribution to other Macs or iPhones.

## AppDrop

[AppDrop](https://docs.appdrop.app/) is the selected demo distribution service. It accepts an iPhone/iPad device `.ipa`, signed or unsigned, and a Mac `.app` or ZIP containing it, up to 500 MB. A simulator build cannot be installed on an iPhone. No installable rightui iOS archive or AppDrop link is available yet.

From the repository root, with the required toolchain:

```sh
# Produce a local device IPA without uploading it.
bun run native:ios:archive
# Build and upload through Exact's official AppDrop integration.
bun run native:share:ios
```

The archive command writes `dist/rightui-demo.ipa` using `ios --device --archive ... --unsigned`. This mode uses an ad hoc signature and needs no developer identity or provisioning profile at build time. Device compilation also needs Rust's `aarch64-apple-ios` target for Exact's pinned toolchain. The share command runs `bun exact.mjs share` in `examples/native`; Exact invokes its pinned AppDrop CLI, prints the public install link and records it in the ignored `.exact/appdrop.json`. Subsequent shares update that link and increment the iOS build number. A branch mismatch is refused; do not override it without choosing which testers should receive the update. Node.js 18+ is required by AppDrop's CLI.

Open the share link on the physical iPhone. On first use, the tester sets up AppDrop's installation mechanism, signs with their own Apple Account and enables Developer Mode if requested. AppDrop re-signs the app for that tester: free-account signatures expire after seven days, paid-account signatures after about a year. Installation and opening the actual app on the phone remain separate validation steps; an uploaded IPA alone does not prove them.

AppDrop changes each iOS copy's bundle identifier. Features tied to the original identifier or team, including push notifications, Sign in with Apple, universal links, iCloud, shared App Groups and in-app purchases, do not carry over. Extensions require a paid account. The current rightui demo is a local UI showcase and does not rely on those services. See [AppDrop's caveats](https://docs.appdrop.app/#caveats).

For Mac, build with `bun run native:mac`. Set `APP_BUNDLE` to the actual bundle path printed in its JSON result, then run:

```sh
npx appdrop "$APP_BUNDLE"
```

AppDrop distributes but **does not sign or notarize** Mac applications. The current ad hoc build can therefore trigger macOS security warnings. AppDrop supports adding a Mac build to an existing iPhone share link with `--update`. The pinned Exact Mac builder currently fixes its plist to version `0.1.0`, build `1`; unlike iOS, `EXACT_BUILD_NUMBER` does not change that Mac value. Resolve proper Mac bundle versioning before automating successive Mac updates; do not mask it with repeated `--force` uploads.

Keep AppDrop update links (`/manage#…`), management keys and login state private. They grant update authority and must not appear in committed files, screenshots or CI logs. Apple credentials are entered directly by the tester in AppDrop; rightui does not collect them.

## Validation status

Recorded on November 13, 2026 with the pinned Exact SDK:

- The macOS showcase built with an ad hoc signature. Its AppKit catalog, split navigation and dashboard were inspected.
- `bun exact.mjs test macos`: **2 passed, 0 failed**. Tests cover catalog search/navigation to the Button example and the shared Reasoning replay clock. They do not certify every interaction in the 124 previews.
- Theme checks covered sidebar, content and native chrome in both color schemes. Button transitions use the authored 150 ms duration.
- iOS validation is incomplete. No successful iOS compilation, launch, physical-device check, IPA or AppDrop upload is recorded.
- Shared-component warnings remain, including authored dialog semantics and fixed-size examples. Full keyboard/VoiceOver coverage and native interaction coverage need further validation. No 120 fps guarantee is made.

The demo manifest includes an opaque 1024 × 1024 distribution icon generated by `tools/generate-demo-icon.swift`. Device builds require Rust's `aarch64-apple-ios` target. Run the SDK setup check before building; standalone Command Line Tools do not supply the iPhoneOS SDK.
