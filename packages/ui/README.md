# rightui — @rightui/ui

This checkout prepares the local **0.4.0-beta.2** candidate. Install its archive for local review; npm commands for this version apply only after a separately authorized publication.


Composable Exact Contract components with a shared Tamber design system, inspired by shadcn/ui. Targets web, iOS and macOS.

This package contains Contract sources, theme tokens and the Geist and Newsreader fonts, including their italic faces. It is used by Exact's compiler, not imported as a JavaScript module. The same UI can be connected to TypeScript or Rust data sources.

## Install

Version: **0.4.0-beta.2**. This is a preview release. Use **Bun exactly 1.4.2** for Exact compilation. From an existing Exact app:

```sh
bun add --exact @rightui/ui@0.4.0-beta.2
mkdir -p assets/fonts
cp node_modules/@rightui/ui/assets/fonts/Geist.ttf assets/fonts/
cp node_modules/@rightui/ui/assets/fonts/Geist-Italic.ttf assets/fonts/
cp node_modules/@rightui/ui/assets/fonts/Newsreader.ttf assets/fonts/
cp node_modules/@rightui/ui/assets/fonts/Newsreader-Italic.ttf assets/fonts/
cp node_modules/@rightui/ui/assets/fonts/OFL.txt assets/fonts/
cp node_modules/@rightui/ui/assets/fonts/OFL-Italic.txt assets/fonts/
cp node_modules/@rightui/ui/assets/fonts/OFL-Newsreader.txt assets/fonts/
```

npm, pnpm and Yarn can also install this package from the npm registry. See the [complete installation guide](https://rightui.dev/docs/installation) for creating an app with the pinned Exact SDK. GitHub access is not required to install the public package.

For an offline install, use the immutable `rightui-ui-0.4.0-beta.2.tgz` archive with `bun add ./rightui-ui-0.4.0-beta.2.tgz`. Source contributors can produce it with `bun run package:ui` from the UI repository.

In your application's `app.json`, add `rightui-font` to the top-level `data`
array, keeping existing names and all other configuration:

```json
{
  "data": ["rightui-font"]
}
```

Exact requires this declaration for RightUI's custom typography markers on
web and native targets. The names omit the `data-` prefix.

```contract
use defaultFontWeights from "@rightui/ui"
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
    uiWeights = defaultFontWeights()
  state count = 0
  action increment
    count = count + 1
  view
    column padding="ui.space-24" gap="ui.space-12" color="ui.foreground" background-color="ui.background"
      text count.toString() font-family=uiFontFamily("theme") data-rightui-font="body"
      Button(id="increment", label="Increment", variant="primary", disabled=false, press=increment)
```

The root must provide `uiFont`. `"theme"` follows the body family configured in `app.tamber`; `"sans"` selects Geist, `"serif"` selects Newsreader and `"mono"` uses the platform's monospace family. RightUI components inherit it. Reusable custom text components inject `uiFont: string` and apply `font-family=uiFontFamily(uiFont)` with `data-rightui-font="body"` to their text, input or textarea leaves. The marker lets a web host apply a saved font before Exact starts; code keeps `ui.font-code`.

Exact resolves the package's `exports` and loads its `ui.tamber` tokens. No React, Tailwind or separate rightui Rust crate is required. Keep the generated Exact app configuration and run `bun exact.mjs web`.

Tested SDK revision: `53426cf02bf986a5e781abc4f953d79989c6dc05`. Exact is pre-1.0; update deliberately. Targets are web, iOS and macOS. Targeted macOS checks have passed; catalog coverage is not exhaustive. iOS validation is incomplete. No 120 fps guarantee is made. See the repository's native guide and validation notes for current limits.

MIT licensed. Retain `LICENSE`, `THIRD_PARTY_NOTICES.md` and the bundled fonts' licenses (`OFL.txt`, `OFL-Italic.txt`, `OFL-Newsreader.txt`) when redistributing.

## Beta releases

rightui is in beta. No stable release is available. See the [versioning policy](https://github.com/rightui-dev/ui/blob/main/docs/VERSIONING.md) and [changelog](CHANGELOG.md) before upgrading. Install the next exact beta with `bun add --exact @rightui/ui@<version>`, then commit your app’s `package.json` and `bun.lock`. Reinstall the previous exact version to roll back.

## Clipboard controller

Exact timers belong to the application root. Add this state, provider, actions and
task to the first component in your app's root Contract file, merging the provider
with your existing `provide` block:

```contract
use defaultFontWeights from "@rightui/ui"
use CodeBlock from "@rightui/ui"

component App
  state copiedId = ""
  state copiedText = ""
  state copyVersion = 0
  provide
    uiFont = "theme"
    uiWeights = defaultFontWeights()
    uiCopiedId = copiedId
    uiCopiedText = copiedText
    uiCopyCode = copyCode
  action copyCode(id: string, text: string)
    copyText(text)
    copiedId = id
    copiedText = text
    copyVersion = copyVersion + 1
  action clearCopyFeedback
    copiedId = ""
    copiedText = ""
  task copiedFeedback when copiedId != "" key=copyVersion
    after(3000, clearCopyFeedback)
  view
    CodeBlock(id="example", title="hello.ts", language="ts", code="console.log('Hello')", numbers=false, diff=false)
```

Declare the fonts used by your theme as shown above.

The injected contract is `uiCopiedId: string`, `uiCopiedText: string` and
`uiCopyCode: action`. The action takes the block's unique, nonempty `id` followed
by its current source text. Copy text directly; do not reconstruct it from
highlighted tokens or visible DOM nodes.

Only the most recently copied block shows the check and its polite status message.
The root schedules their reset after **3,000 milliseconds**. Every copy increments
`copyVersion`, so copying the same text again restarts the full delay. Copying
another block immediately clears the previous block's feedback and starts a new
delay. Matching both the ID and text prevents confirmation from appearing on a
different source after switching tabs. No repeating timer runs while idle.

`copyText` is Exact's platform clipboard command. The pinned SDK does not return
a success or failure result to Contract; the feedback confirms that this command
was dispatched, not a verified read-back of the operating system clipboard.
Web clipboard availability depends on the browser context and permissions.


## Migration and customization

Read the bundled [0.2 migration](docs/MIGRATION-0.2.md), [theming guide](docs/THEMING.md), [code-block guide](docs/CODE-BLOCK.md), [composition guide](docs/COMPONENT-COMPOSITION.md) and [Markdown guide](docs/MARKDOWN.md). These guides are available after installation in `node_modules/@rightui/ui/docs/`; no GitHub access is needed.

For Dialog, Drawer, Sheet and Toast, load the packaged `assets/sheet.css` in the web head. See [Window overlays](docs/OVERLAYS.md) for controlled visibility and keyboard setup.
