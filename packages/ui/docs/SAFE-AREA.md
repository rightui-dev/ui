# Safe Area

`SafeArea` adds the current document's safe-area padding on the edges you select. Use it to keep controls clear of the status bar, display cutouts and home indicator while the surrounding background reaches the window edges.

```contract
use SafeArea from "@rightui/ui"

component Example
  view
    column viewport-fit="cover" width="100%" height="100%" background-color="ui.surface"
      SafeArea(top=true, bottom=true, left=true, right=true)
        column padding="ui.space-16"
          text "Content clear of the system insets"
```

The background belongs outside `SafeArea`; the controls belong inside it. The component itself has no background, border, minimum height or forced flex growth. Ordinary content spacing belongs in a child container and is separate from the system insets.

## Edges

All four boolean props are required:

| Prop | Padding when enabled |
| --- | --- |
| `top` | `env(safe-area-inset-top)` |
| `bottom` | `env(safe-area-inset-bottom)` |
| `left` | `env(safe-area-inset-left)` |
| `right` | `env(safe-area-inset-right)` |

A disabled edge contributes zero padding. Exact resolves these values from the document and updates them when the window or insets change. On native hosts, the document receives device insets with `viewport-fit="cover"`; `auto` uses zero because the host already keeps the document inside the safe area. On web, the values come from the browser and may also be zero.

These are document insets, not the remaining distance from each nested container to the screen edge. Apply each edge once. If a shared navbar already consumes the top inset, set `top=false` for the page below it. If a parent already uses bottom safe-area padding, do not add it again inside the footer. A small card in the middle of a page normally needs ordinary spacing, not `SafeArea`.

For separate chrome, a top bar can use `top=true, bottom=false`; a footer can use `top=false, bottom=true`. Keep horizontal edges enabled where landscape cutouts need clearance. Components that already provide their own safe-area padding, such as RightUI overlay controls, should not be wrapped with the same edges again.

The documentation example uses real window values and allows each edge to be toggled. It deliberately does not invent a notch, minimum padding or simulated inset when those values are zero.

## Validation

This composition is pending targeted web, iOS and macOS validation. Its use of supported Exact inset expressions is not a claim that all device orientations or accessibility settings have been tested. Windows and Android are outside the project's current scope.
