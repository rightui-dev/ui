# rightui — @rightui/ui

Composable Exact Contract components with a shared Tamber design system, inspired by shadcn/ui. Targets web, iOS and macOS.

This package contains Contract sources, theme tokens and the Geist font. It is used by Exact's compiler, not imported as a JavaScript module. The same UI can be connected to TypeScript or Rust data sources.

## Install

Version: **0.1.0-beta.5**. This is a preview release. Use **Bun exactly 1.4.2** for Exact compilation. From an existing Exact app:

```sh
bun add --exact @rightui/ui@0.1.0-beta.5
mkdir -p assets/fonts
cp node_modules/@rightui/ui/assets/fonts/Geist.ttf assets/fonts/
cp node_modules/@rightui/ui/assets/fonts/OFL.txt assets/fonts/
```

npm, pnpm and Yarn can also install this package from the npm registry. See the [complete installation guide](https://rightui.dev/docs/installation) for creating an app with the pinned Exact SDK. GitHub access is not required to install the public package.

For an offline install, use the immutable `rightui-ui-0.1.0-beta.5.tgz` archive with `bun add ./rightui-ui-0.1.0-beta.5.tgz`. Source contributors can produce it with `bun run package:ui` from the UI repository.

```contract
font "Geist"
  100 900 = "assets/fonts/Geist.ttf"

use Button from "@rightui/ui"

component App
  state count = 0
  action increment
    count = count + 1
  view
    column padding=24 gap=12 color="ui.foreground" background-color="ui.background" font-family="Geist"
      text count.toString()
      Button(id="increment", label="Increment", variant="primary", disabled=false, press=increment)
```

Exact resolves the package's `exports` and loads its `ui.tamber` tokens. No React, Tailwind or separate rightui Rust crate is required. Keep the generated Exact app configuration and run `bun exact.mjs web`.

Tested SDK revision: `53426cf02bf986a5e781abc4f953d79989c6dc05`. Exact is pre-1.0; update deliberately. Targets are web, iOS and macOS. Targeted macOS checks have passed; catalog coverage is not exhaustive. iOS validation is incomplete. No 120 fps guarantee is made. See the repository's native guide and validation notes for current limits.

MIT licensed. Retain `LICENSE`, `THIRD_PARTY_NOTICES.md` and the bundled font's OFL license when redistributing.

## Beta releases

rightui is in beta. No stable release is available. See the [versioning policy](https://github.com/rightui-dev/ui/blob/main/docs/VERSIONING.md) and [changelog](https://github.com/rightui-dev/ui/blob/main/packages/ui/CHANGELOG.md) before upgrading. Install the next exact beta with `bun add --exact @rightui/ui@<version>`, then commit your app’s `package.json` and `bun.lock`. Reinstall the previous exact version to roll back.
