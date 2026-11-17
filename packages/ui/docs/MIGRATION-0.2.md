# Migrating to RightUI 0.2

The typography context is a breaking change. Add a `uiFont` provider to the
application component that instantiates RightUI components. Other component
imports and existing props remain unchanged by this typography migration.

## Keep the current configured appearance

```contract
use defaultFontWeights from "@rightui/ui"
use Button from "@rightui/ui"

component App
  state saved = false
  provide
    uiFont = "theme"
    uiWeights = defaultFontWeights()
  action save
    saved = true
  view
    Button(id="save", label=(saved ? "Saved" : "Save"), variant="primary", disabled=false, press=save)
```

`"theme"` uses `ui.font-body` from your application's Tamber configuration.
Generate that configuration with `createTheme({ font: "sans" })`, `"serif"`
or `"mono"`. The export records the selected family as a static alias; it has
no dependency on the RightUI website. Keep the real regular and italic Geist
declarations and add the bundled Newsreader regular and italic declarations
(weights 200–800) described in [Theming](./THEMING.md). Copy both Newsreader
font files and `OFL-Newsreader.txt` into your application's assets. The existing
`serif` preference now selects Newsreader; no preference-key migration is needed.

Exact requires every `inject` to have a matching provider. An `option<string>`
inject still requires a provider and inject declarations cannot have defaults.
If compilation reports `syntax-missing-provide` for `uiFont`, add the provider
on that component's actual caller path. Do this for independent app roots,
test fixtures and native showcase roots as well.

Add the typography marker to the top-level `data` array in `app.json`:

```json
{
  "data": ["rightui-font"]
}
```

Merge it with any existing entries; keep the rest of the generated manifest.
The names omit `data-`. This is required on native targets too. Without the
declaration, Exact reports `bake-undeclared-data`. A website that authors
`data-rightui-font-choice`, `data-rightui-font-ready` or
`data-rightui-font-scope` must also declare those names without the prefix.

## Offer three typefaces

```contract
use defaultFontWeights from "@rightui/ui"
use Button from "@rightui/ui"

component App
  state fontChoice = "sans"
  provide
    uiFont = fontChoice
    uiWeights = defaultFontWeights()
  action chooseFont(value: string)
    fontChoice = value
  view
    column
      Button(id="font-sans", label="Sans", variant="outline", disabled=false, press=chooseFont("sans"))
      Button(id="font-serif", label="Serif", variant="outline", disabled=false, press=chooseFont("serif"))
      Button(id="font-mono", label="Mono", variant="outline", disabled=false, press=chooseFont("mono"))
```

Use ordinary application state for persistence and URL overrides. Validate
choices against `themeOptions.font` in setup/data code. The shared
`uiFontFamily()` Contract helper maps the three choices to static family
tokens and maps `"theme"` or unknown values to the configured body family.
This keeps bundled font resolution in Exact, rather than relying on a runtime
string to load a font file.

For application text that should follow the setting:

```contract
use uiFontFamily from "@rightui/ui"

component PageTitle
  inject
    uiFont: string
  view
    text "Your workspace" font-family=uiFontFamily(uiFont)
```

Code text should continue using `ui.font-code`. Fixed illustrations, logos
and intentionally styled media do not need the body typeface context.

## Add the code-block clipboard controller

Applications using `CodeBlock` or `CodeBlockAdvanced` must also supply the
shared clipboard controller:
`uiCopiedId: string`, `uiCopiedText: string` and `uiCopyCode: action`.
The action receives `(id: string, text: string)`. Follow the complete
[Clipboard controller recipe](./CODE-BLOCK.md#clipboard-controller) at the
application root; Exact timed tasks belong there.

The controller shows feedback on the last copied block for three seconds,
and copying again restarts that interval. The composition-only
`CodeBlockSurface`, `CodeBlockHeader` and `CodeBlockBody` do not require this
controller. This requirement is separate from the typography provider.

## Replace the former font axis

Regenerate `app.tamber` with `createTheme()`. Remove the old `ui-font` axis,
its `when ui-font=...` branches, `setMode("ui-font", ...)` actions and
`ui-font=...` segments in `-exact-mode` preview strings. Set `fontChoice`
instead. `themeAxes` and `themeMode()` now describe preset, density and radius
only; `themeOptions` still includes all four appearance choices.

Six presets, two densities and three corner styles use 36 Tamber tuples.
The three independent typefaces produce 108 possible appearance settings
without exceeding Exact's 64-tuple limit. Light/dark/system remains separate.

The underlying corner values remain `sharp`, `round` and `default`; an
application can label them Sharp, Rounded and Neutral without changing
configuration values or old saved preferences.

## Preserve preview and slot scope

To pin a preview's typeface, create a component that provides `uiFont` and
instantiates the preview components in its own view. A provider wrapper that
merely renders `children` does not override slot content: Exact preserves the
slot caller's providers. Place the provider in that caller instead.

For prerendered websites, resolve the initial preference before visible text
appears and transfer control to the compiled runtime once it is ready. The
RightUI website uses compiled font probes for this transport; it does not
maintain a second font-family configuration. Check direct URLs, saved choices,
previews, inputs and code text before and after activation.
