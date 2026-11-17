# Migration to 0.4

Import the weight helpers and add the `uiWeights` context to the existing root provider:

```contract
use defaultFontWeights, scaleFontWeights from "@rightui/ui"

component App
  derive weights = scaleFontWeights(defaultFontWeights(), 100)
  provide
    uiFont = "theme"
    uiWeights = weights
  view
    column font-weight=weights.regular
      text "Body text"
```

The context is required even without a slider. At 100%, default weights are 400, 500, 600, 700 and 800. At 110%, they are 440, 550, 660, 770 and 880. The scalar changes each role independently, preserving their ratios within the font's supported range.

For custom base weights, import `FontWeights` and pass `FontWeights(regular=400, medium=500, semibold=600, bold=700, heavy=800)` with your own values to `scaleFontWeights`. These provided values now drive component weights; when migrating custom `ui.weight-*` token overrides, copy those base values into this record. Give custom application text the corresponding `weights` field and set its root's weight to `weights.regular`.

Keep global `wght` variation settings unset: they override each text's semantic weight.
