# rightui

[npm package](https://www.npmjs.com/package/@rightui/ui) · [Documentation](https://rightui.dev/docs/installation)

Composable Exact Contract components and Tamber themes, inspired by shadcn/ui. The installable package is **@rightui/ui 0.3.0-beta.3**. Exact compiles the Contract UI; TypeScript or Rust supplies data logic.

Official public repositories: [UI sources](https://github.com/rightui-dev/ui) and [website](https://github.com/rightui-dev/website).

## Install

Use **Bun 1.4.2** for Exact. In an existing Exact app:

```sh
bun add --exact @rightui/ui@0.3.0-beta.3
```

Follow the [installation guide](docs/INSTALLATION.md) for app creation, registration of Geist and Newsreader (regular and italic), and the root `uiFont` provider. Set `uiFont = "theme"` in the root's `provide` block to use your configured body family. The public npm package does not require GitHub access. The private root package `@rightui/registry` is development infrastructure, not the consumer package. See [distribution](docs/DISTRIBUTION.md).

For a source/offline build, run `bun run native:setup` and `bun run package:ui`; install `dist/rightui-ui-0.3.0-beta.3.tgz` in the consumer app.

Unlike shadcn's source-copy workflow, this delivery installs Contract sources and theme tokens as a package.

## Sources and examples

- `packages/ui/index.contract`: public component exports.
- `packages/ui/ui.tamber`: theme tokens.
- `integrations/typescript/`: Contract UI and TypeScript data logic; generate `app.contract.d.ts` with the pinned Exact compiler before type checking.
- `integrations/rust/`: Rust DataSource example; a host must wire the source. There is no rightui Rust widgets crate.
- `generated/registry.json`: generated `rightui-contract/v1` manifest, not a shadcn registry.

The website belongs in sibling `../landing`, cloned from the website repository by users with access.

## Compatibility

See the [complete compatibility matrix](docs/COMPATIBILITY.md) for all components, AI patterns, blocks and charts, with iOS, macOS, Web, Windows and Android columns and links to validation evidence.

## Platform scope

Targets **web, iOS and macOS** using official [Expo Exact](https://github.com/expo/exact), pinned to `53426cf02bf986a5e781abc4f953d79989c6dc05`. Exact is pre-1.0; update deliberately.

Web has build and test coverage. The documentation app has been built for iOS and macOS, with targeted simulator checks and installation on a physical iPhone. Full catalog and native accessibility validation remain incomplete. No exhaustive coverage or 120 fps guarantee is implied. See [native requirements](docs/NATIVE.md).

MIT licensed; retain the licenses and [third-party notices](THIRD_PARTY_NOTICES.md), including the bundled fonts' OFL licenses.

## Beta releases

rightui is in beta. No stable release is available. See the [versioning policy](https://github.com/rightui-dev/ui/blob/main/docs/VERSIONING.md) and [changelog](https://github.com/rightui-dev/ui/blob/main/packages/ui/CHANGELOG.md) before upgrading. Install an exact published beta with `bun add --exact @rightui/ui@<version>`, then commit your app’s `package.json` and `bun.lock`. Keep the previous version for rollback.

For Dialog, Drawer, Sheet and Toast, load the packaged `assets/sheet.css` in the web head. See [Window overlays](docs/OVERLAYS.md) for controlled visibility and keyboard setup.
