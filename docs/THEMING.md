# Theming RightUI

See the [complete guide](../packages/ui/docs/THEMING.md), also included in the npm package.

Use `scaleFontWeights(defaultFontWeights(), 110)` to scale each role to 110%. Provide its result as `uiWeights` and apply its regular field to the app root. Custom base weights use a `FontWeights` record. See [Migration to 0.4](MIGRATION-0.4.md).

RightUI focus rings use `ui.foundation-focus-width` (1px by default). Use `createTheme({ focusRing: false })` to export a theme with rings disabled.
