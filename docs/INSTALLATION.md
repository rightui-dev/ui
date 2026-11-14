# Install rightui

## Existing Exact app

Use **Bun exactly 1.4.2** for Exact compilation. Install the public beta from npm:

```sh
bun add --exact @rightui/ui@0.2.0-beta.3
```

Equivalent package-manager commands are `npm install --save-exact @rightui/ui@0.2.0-beta.3`, `pnpm add --save-exact @rightui/ui@0.2.0-beta.3` and `yarn add --exact @rightui/ui@0.2.0-beta.3`. Exact still requires Bun 1.4.2. No GitHub access is needed to install the public package.

## 1. Create a new Exact app

Skip this step if your app already exists. From a workspace directory, obtain the official SDK at the tested revision:

```sh
mkdir -p rightui/.tooling
cd rightui
git clone https://github.com/expo/exact.git .tooling/exact
git -C .tooling/exact checkout --detach 53426cf02bf986a5e781abc4f953d79989c6dc05
(cd .tooling/exact && bun install --frozen-lockfile)
bun .tooling/exact/scripts/exact.mjs new my-app
cd my-app
bun add --exact @rightui/ui@0.2.0-beta.3
```

Keep the generated Exact app configuration. The package exports `index.contract` and supplies `ui.tamber`; Exact resolves these during compilation. The private repository root `@rightui/registry` is development infrastructure, not the consumer package. TypeScript or Rust supplies data logic; both use the same Contract UI.

Add `rightui-font` to the top-level `data` array in your app's `app.json`,
preserving any names already present:

```json
{
  "data": ["rightui-font"]
}
```

Merge this entry into the generated manifest; do not replace the rest of the
file. Exact requires custom attribute names without their `data-` prefix.
RightUI's typography markers need this declaration on web and native targets.

## 2. Register the shared fonts

Register Geist for Sans and Newsreader for Serif, including their italic faces.
Mono uses the platform's monospace family. From your app:

```sh
mkdir -p assets/fonts
cp node_modules/@rightui/ui/assets/fonts/Geist.ttf assets/fonts/
cp node_modules/@rightui/ui/assets/fonts/Geist-Italic.ttf assets/fonts/
cp node_modules/@rightui/ui/assets/fonts/Newsreader.ttf assets/fonts/
cp node_modules/@rightui/ui/assets/fonts/Newsreader-Italic.ttf assets/fonts/
cp node_modules/@rightui/ui/assets/fonts/OFL.txt assets/fonts/
cp node_modules/@rightui/ui/assets/fonts/OFL-Italic.txt assets/fonts/
cp node_modules/@rightui/ui/assets/fonts/OFL-Newsreader.txt assets/fonts/
```

## 3. Use Contract components

In the generated app's `app.contract`:

```contract
font "Geist"
  100 900 = "assets/fonts/Geist.ttf"
  100 900 italic = "assets/fonts/Geist-Italic.ttf"

font "Newsreader"
  200 800 = "assets/fonts/Newsreader.ttf"
  200 800 italic = "assets/fonts/Newsreader-Italic.ttf"

use Button, uiFontFamily from "@rightui/ui"

component App
  provide
    uiFont = "theme"
  state count = 0
  action increment
    count = count + 1
  view
    column padding="ui.space-24" gap="ui.space-12" color="ui.foreground" background-color="ui.background"
      text count.toString() testId="counter" font-family=uiFontFamily("theme") data-rightui-font="body"
      Button(id="increment", label="Increment", variant="primary", disabled=false, press=increment)
```

The root `uiFont` provider is required. `"theme"` uses the body family configured in `app.tamber`; `"sans"`, `"serif"` and `"mono"` select the shared font stacks. RightUI components inherit this choice. Reusable components with custom text should `inject uiFont: string` and use `font-family=uiFontFamily(uiFont)` on their text, input or textarea leaves. Keep `data-rightui-font="body"` on these leaves for web hosts that apply the saved font before Exact starts. Code keeps its separate `ui.font-code` family. See [Theming](THEMING.md) for configuration and runtime selection.

Run the generated web app with `bun exact.mjs web`. See `integrations/typescript/app.contract` for a resource-backed example. TypeScript or Rust implements data logic; the UI remains Contract compiled by Exact, without React, DOM adapters or a rightui Rust widgets crate.

## Validation and limits

Maintainers can run `bun run check:package` from `components` to validate isolated package installation. Exact needs Chromium for its browser test; set `CHROME` to an existing executable if it is not in the default location. This does not establish native device behavior or exhaustive component coverage.

Targets are web, iOS and macOS. Targeted macOS checks have passed. iOS validation is incomplete; no successful iOS build or device check is claimed. See [Native demo](NATIVE.md) for platform requirements. No 120 fps guarantee is made.

Retain `LICENSE`, `THIRD_PARTY_NOTICES.md` and all three font license files (`OFL.txt`, `OFL-Italic.txt`, `OFL-Newsreader.txt`) when redistributing the package or fonts.

## Beta releases

rightui is in beta. No stable release is available. See the [versioning policy](https://github.com/rightui-dev/ui/blob/main/docs/VERSIONING.md) and [changelog](https://github.com/rightui-dev/ui/blob/main/packages/ui/CHANGELOG.md) before upgrading. Install an exact published beta with `bun add --exact @rightui/ui@<version>`, then commit your app’s `package.json` and `bun.lock`. Reinstall the previous exact version to roll back.

## Offline and manual installation

The versioned archive remains available for offline distribution. From the UI source checkout, `bun run native:setup` and `bun run package:ui` produce `dist/rightui-ui-0.2.0-beta.3.tgz` and its SHA-256 sidecar. GitHub access is required to clone the currently private UI repository or download its GitHub release; npm installation above does not require it.

For the public npm archive, run from your app:

```sh
mkdir -p vendor/rightui
npm pack @rightui/ui@0.2.0-beta.3 --pack-destination vendor/rightui
bun add ./vendor/rightui/rightui-ui-0.2.0-beta.3.tgz
```

For editable local sources, extract that archive and install the entire package:

```sh
mkdir -p vendor/rightui-ui
tar -xzf ./vendor/rightui/rightui-ui-0.2.0-beta.3.tgz -C vendor/rightui-ui --strip-components=1
bun add file:./vendor/rightui-ui
```

Keep `package.json`, all relative Contract dependencies, `ui.tamber`, assets and licenses together. Keep local archives or vendored sources available to collaborators and CI; a lockfile does not contain those files. Register Geist and Newsreader as above.
