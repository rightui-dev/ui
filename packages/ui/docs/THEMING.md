# Theming RightUI

RightUI uses one shared design source: `packages/ui/theme.ts`. It generates the
package's `ui.tamber`, complete application configurations and the site's theme
choices. Components consume those tokens through semantic roles and recipes.

The default configuration keeps the neutral palette and comfortable spacing.
Light, dark and system are independent of the visual preset.

## Use a theme in an Exact application

Install `@rightui/ui`, then generate your application configuration:

```ts
import { writeFileSync } from "node:fs";
import { createTheme } from "@rightui/ui/theme";

writeFileSync("app.tamber", createTheme({
  preset: "forest",
  density: "compact",
  radius: "sharp",
  font: "serif",
}));
```

This is a complete, static theme. It has no application axes and needs no
RightUI website code at runtime. Copy theme produces this same Tamber format.
Merge it deliberately if your application already has an `app.tamber`; keep a
single `tamber app` declaration and a single `theme` block.

The JavaScript helper is a **build/setup API**. Exact captures an application's
data module and does not admit this package import directly from `app.ts` at
this SDK version. If a Copy theme action needs the text at runtime, generate
the configurations during the build and expose those generated application
data/assets to the action.

Copy the bundled fonts and retain their licenses:

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

Register the real regular and italic faces at the top of `app.contract`:

```contract
use defaultFontWeights from "@rightui/ui"
font "Geist"
  100 900 = "assets/fonts/Geist.ttf"
  100 900 italic = "assets/fonts/Geist-Italic.ttf"

font "Newsreader"
  200 800 = "assets/fonts/Newsreader.ttf"
  200 800 italic = "assets/fonts/Newsreader-Italic.ttf"

use Button, Input, Card from "@rightui/ui"

component App
  provide
    uiFont = "theme"
    uiWeights = defaultFontWeights()
  view
    Card(id="welcome", title="Your application", description="A shared theme")
```

`createFontDeclaration()` returns both Contract font declarations. Its four
optional arguments are the Geist regular and italic paths, followed by the
Newsreader regular and italic paths. `createTheme()` accepts the same paths as
`fontPath`, `italicFontPath`, `serifFontPath` and `serifItalicFontPath` for its
setup comments. A font declaration belongs in Contract, not in Tamber. Naming
a family does not load its file.

The serif choice uses the bundled `"Newsreader", serif` family with real
regular and italic faces, each covering weights 200–800. Its source revision,
file hashes and OFL license are recorded in `assets/fonts/provenance.json`.
Keep the same `serif` setting when upgrading; only its registered family changes.
Mono uses the platform's monospace family. Code keeps its separate monospace role.

Every application consuming the typography-aware components must provide
`uiFont`. The value `"theme"` uses the body family selected in the exported
Tamber configuration; `"sans"`, `"serif"` and `"mono"` choose their respective
static family roles. Exact injects have no implicit default. See
[Migrating to 0.2](./MIGRATION-0.2.md) for the required application changes.

The components also emit `data-rightui-font` markers. Add `rightui-font` to
the top-level `data` array in your application's `app.json`; preserve existing
entries. Exact validates these names on all targets. If your website also
authors the initial-font transport, declare its own `rightui-font-choice`,
`rightui-font-ready` and `rightui-font-scope` attributes there too.

## Offer runtime choices

Generate `createTheme({ interactive: true })` to include these axes:

| Choice | Exact axis | Values |
| --- | --- | --- |
| Preset | `ui-preset` | `neutral`, `indigo`, `forest`, `rose`, `amber`, `violet` |
| Density | `ui-density` | `comfortable`, `compact` |
| Radius | `ui-radius` | `default`, `sharp`, `round` |

Their product is 36 combinations, below this Exact version's limit of 64.
Do not add independent axes without recounting the product. A static export
avoids that cost when the application does not need runtime choices.

Each preset includes light and dark colors for page and card surfaces, text,
controls, focus, borders, sidebars and charts. Rose combines pale pink surfaces
with a deep rose accent; Amber combines warm ivory surfaces with a dark amber
accent; Violet combines pale violet surfaces with a saturated purple accent.
Their dark modes use lighter accents with dark button text. Density,
corners and typeface remain separate choices.

```contract
use defaultFontWeights from "@rightui/ui"
component App
  state fontChoice = "theme"
  provide
    uiFont = fontChoice
    uiWeights = defaultFontWeights()
  action useForest
    setMode("ui-preset", "forest")
    setMode("ui-density", "compact")
    setMode("ui-radius", "sharp")
    fontChoice = "serif"
  action useDark
    setScheme("dark")
  view
    Button(id="use-forest", label="Use Forest", variant="primary", disabled=false, press=useForest)
```

Typeface is a regular Contract context value, separate from the three design
axes. All six palettes, two densities, three corner styles and three typefaces
remain independently selectable. The 108 possible appearance settings require
only 36 Tamber mode tuples. `setMode("ui-font", ...)` is no longer supported.

An application-authored text uses the same public helper as the components:

```contract
use uiFontFamily from "@rightui/ui"

component Introduction
  inject
    uiFont: string
  view
    text "Welcome" font-family=uiFontFamily(uiFont)
```

The helper selects `ui.font-sans`, `ui.font-serif` or `ui.font-mono`; any other
value falls back to `ui.font-body`. Those are static family tokens, so bundled
faces are resolved by Exact. Override their `ui.foundation-font-*` foundations
to substitute actual registered or installed fonts. Keep literal family names
in the theme, not in application selector logic.

`themeOptions`, `themeAxes`, `defaultTheme`, `normalizeTheme()` and `themeMode()`
are exported for application selectors and validation. `ThemeSettings` is derived
from `themeOptions`; iterate those options instead of maintaining another preset
list. `themeMode()` returns
the space-separated value accepted by `-exact-mode` for a subtree preview. It
contains preset, density and radius only. A typeface preview must provide its
own `uiFont` from a component that instantiates its preview content.
Exact's generated HTML mode tuple uses commas; application code should use the
Contract actions instead of editing generated HTML attributes at runtime.

Persistence, URL choices and iframe propagation belong to the consuming
application. Apply initial choices before the first visible render. Prerendered
Exact boundaries contain full mode tuples; initialize their inherited axes too,
while preserving each preview's explicit pins. The RightUI website's
`tools/ssr-modes.ts` handles this during HTML parsing without replacing compiler
CSS, hiding the page or waiting for activation. Typography uses a temporary
transport in `tools/ssr-fonts.ts`: hidden texts supply the compiler's actual
family stacks, marked body text uses those values until its runtime binding
is ready, then the temporary rules are removed. Code typography stays separate.
Applications do not need this website helper for ordinary Contract rendering.

## Change foundations, roles or recipes

`themeTokens` is the machine-readable token manifest: each entry includes its
name, kind, default value and optional axis variants. The dependency graph is
intentional:

```text
ui.foundation-radius
  -> ui.radius-lg
    -> ui.radius-control
      -> ui.radius (compatible legacy alias)
        -> Button and Field recipes

ui.foundation-space-unit
  -> ui.space-24
    -> ui.card-inset
      -> Card and CardStyle

ui.palette-primary
  -> ui.primary
    -> ui.primary-hover
      -> Button states
```

Override a foundation to affect every linked role, or override a role for an
intentional difference. For example, after generating a static configuration,
change these existing entries in its `theme` block:

```tamber
  ui.foundation-radius: length = 12px
  ui.foundation-border-width: length = 2px
  ui.foundation-icon-stroke: length = 2px
```

The old `ui.radius` and `ui.panel-radius` names remain aliases of
`ui.radius-control` and `ui.radius-panel`. They no longer store independent
duplicate values. AI components keep their larger radius recipes linked to the
same radius foundation. Circles and flat joins use explicit `radius-full` and
`radius-flat` roles.

Exact replaces an overridden package token **including all its `when`
branches**. Preserve every desired branch when editing an interactive export.
The generator emits the full configuration to make this replacement explicit.

Components can expose narrower recipe controls through Exact params. Every
instance of that component shares the configured value:

```tamber
params
  Card.inset = ui.space-20
  Card.radius = ui.radius-card
  InputControl.insetX = ui.space-16
  ButtonFrame.outlineWidth = ui.border-strong-width
```

`CardStyle`, `FeatureCardStyle`, `InsetCardStyle`, `MutedStyle`, `Hit`,
`QuietLink`, `Heading` and `Paragraph` are shared recipes for application
composition. `InputControl` provides a field with an accessible name without
rendering a separate visible label; `Input` includes the label and error hint.

## Implementation boundaries

- Typography context is read on text and input leaves. This Exact version
  rejects varying inherited family tokens on containers; keeping typeface
  outside the axes also avoids multiplying every color and geometry tuple.
- Border width is a length token. Border pattern is an explicit component
  recipe (`solid`, `dashed`, etc.); Tamber has no general string/enum token.
- SVG stroke-width uses length tokens, including `ui.icon-stroke`. Gradient
  opacity is carried by semantic stop colors because this Exact version does
  not accept number tokens for `stop-opacity` or `fill-opacity`.
- Density changes spacing and control sizes. Minimum touch targets, viewport
  geometry, chart coordinates and interaction calculations have separate
  constraints; a spacing multiplier cannot safely replace every number.
- This Exact version rejects length/number tokens in several keyframe rows.
  Those motion coordinates and opacity endpoints are explicitly inventoried
  SDK constraints. Duration and easing still use shared tokens; changing them
  does not make the unsupported keyframe values configurable.
- `ui.chart-1` through `ui.chart-5` provide default chart colors. Explicit
  series colors remain supported. QR/media contrast can use the fixed
  `ui.media-paper` and `ui.media-ink` roles.
- Native OS menus, picker popups, scrollbars, window chrome and embedded media
  do not become fully customizable through RightUI tokens. Interactive themes
  keep the OS `AccentColor` at the initial preset because this Exact version
  rejects app-axis-dependent platform roles. A static export links it to
  `ui.primary`.

These controls cover RightUI's authored surfaces. They are not a claim that
every platform-owned pixel is customizable, or that a web check validates
native rendering.

## Maintain and verify the source

Edit `packages/ui/theme.ts`, then run:

```sh
bun tools/generate-theme.ts
bun tools/check-theme.ts
bun test tools/check-theme.test.ts tools/check-theme-colors.test.ts
```

The check validates generated output, token references and cycles, legacy
aliases, axis combinations, font provenance and the explicit structural
inventory. The source scan is a regression guard, not a rendering engine or a
percentage of customization coverage. Compile a consuming Exact app and inspect
meaningful states whenever a new token kind or SDK behavior is involved.

The Rose, Amber and Violet color checks calculate contrast from the actual token aliases
in both modes: main and muted text and primary button labels reach at least 4.5:1
on the tested surfaces, including the primary hover blend. Their focus color and
opaque chart colors reach at least 3:1 against page and card backgrounds. This is
a targeted palette check, not a full accessibility audit of every component or
translucent chart layer.

When the sibling website checkout is available, `bun tools/check-theme.ts --site`
also checks its authored components and application template. The separate
`theme-structure-site.json` inventory includes that scope. Generated native
`app.contract` is excluded; review its generator and compile the generated app.
To update an inventory after an intentional source change, run the command with
`--write-inventory` and review the diff. Unclassified entries still fail; this
flag does not approve them. The inventory explicitly records viewport layouts,
SVG/chart coordinates, hidden test geometry and unsupported keyframe controls.

Local verification for this contract used an independent Exact app containing
the public Button, Input and Card. Both runtime mode changes and a copied static
forest/compact/sharp/serif export were built and exercised in a browser. The
static app also verified a Card param override. A separate small web build
verified the three-family helper with a real bundled italic face, a context
provider and an input. This evidence does not include iOS or macOS device
validation, nor replace validation of the consuming application's migration.

## Proportional weights

Provide `uiWeights = scaleFontWeights(defaultFontWeights(), 100)` at the root. 110 scales regular 400 to 440 and semibold 600 to 660. Custom base weights use a `FontWeights` record. Apply the regular field to the app root and the appropriate field to custom text. Stay within the font’s supported range. See [Migration to 0.4](MIGRATION-0.4.md).
