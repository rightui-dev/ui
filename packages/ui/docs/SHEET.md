# Sheet

`SheetContent` renders an authored RightUI surface above the whole application window. Its content is transported out of the surrounding layout, including clipped or transformed demo containers. It does not request an iOS system sheet or a macOS sheet. Left/right panels use 75% of the window, capped at 24rem. The top panel uses the full width and is capped at half the window height. The bottom panel shares `DrawerSurface` with Drawer: it opens at 30% of the window height and can be dragged between 30% and 90%. It is not capped at 50%. The backdrop covers the window in every orientation.

The parent controls visibility with `open` and `dismiss`. Keep form state in that parent so values survive closing and reopening. `SheetBody` scrolls between the header and `SheetFooter`; the controls account for safe-area insets. `showCloseButton=false` hides the corner control, so keep a visible footer close action. `reduced=true` disables entrance and snap motion.

Import these components from `@rightui/ui/sheet`.

## Bottom sheet

Set `side="bottom"` to use the shared RightUI drawer surface, retaining the same `open`, `focusIds` and `dismiss` API. Drag its handle to resize, release to settle at 30% or 90%, or pull down to dismiss. Each opening starts at 30%. The handle remains available when `showCloseButton=false`.

ArrowUp/ArrowDown move to the next/previous stop; Home/End select the smallest/largest stop. Enter, Space or pressing the handle cycles through the stops. Escape, the backdrop and a visible close action dismiss. The snap motion uses the `ui.easing-drawer` spring token, unless reduced motion is enabled. This is an authored RightUI panel, not a system sheet card.

Use [DrawerAdvanced](DRAWER.md) when you need custom snap points. SheetContent keeps the standard 30%/90% behavior for its bottom side.

## Migration from the dialog lifecycle

This is a breaking change to `SheetContent`. Replace `showModal(id)` and `close(id)` with a boolean state and a dismissal action. Add these required props:

- `open`: whether this sheet is visible.
- `dismiss`: closes the state and restores focus to the trigger.
- `focusIds`: the enabled, focusable content controls in their intended keyboard order. Do not include the optional corner close button or the bottom drag handle; SheetContent adds those automatically. Update the list when controls become disabled or are removed.

SheetContent handles Escape, backdrop presses and Tab/Shift+Tab containment. It initially focuses its panel without scrolling it; a bottom sheet initially focuses its resize handle. The parent remains responsible for choosing the trigger that receives focus on dismissal, especially when several controls open the same sheet. Do not make a logical ancestor of the sheet inert: its transported content retains that ancestry.

```contract
use Button from "@rightui/ui"
use SheetContent, SheetBody, SheetFooter from "@rightui/ui/sheet"

component Example
  state shown = false
  action reveal
    shown = true
  action dismiss
    shown = false
    focus("profile-open")
  view
    column
      Button(id="profile-open", label="Open", variant="outline", disabled=false, press=reveal)
      SheetContent(id="profile", open=shown, focusIds=["profile-done"], dismiss=dismiss, title="Edit profile", description="Make changes to your profile here.", side="right", reduced=false, showCloseButton=true)
        SheetBody()
          text "Your content"
        SheetFooter()
          Button(id="profile-done", label="Close", variant="outline", disabled=false, press=dismiss)
```

The root must provide `uiFont`, as with other rightui components. Use unique IDs for every mounted sheet. An iframe has its own window: a sheet inside it covers that frame, not the embedding application.

## Web setup

Copy `node_modules/@rightui/ui/assets/sheet.css` to `assets/sheet.css` in your app. Merge these entries into `app.json`, preserving existing entries:

```json
{
  "data": ["rightui-font", "rightui-sheet"],
  "host": {
    "web": {
      "head": [{ "link": { "rel": "stylesheet", "href": "/assets/sheet.css" } }]
    }
  }
}
```

The scoped stylesheet supplies web viewport and scrolling support. Load it before opening an overlay. Native hosts use the Contract layer and ignore this stylesheet.

## Compatibility and validation

The older controlled `Sheet(open=..., focusIds=..., dismiss=...)` remains available. `SheetContent` adds a separate body/footer composition and optional corner close control.

The new shared overlay composition is pending integration validation on web, iOS and macOS. Earlier native-dialog checks do not validate this presentation. The package fixture exercises a clipped, transformed parent, reopening with persistent field values, Escape, optional close control and the four orientations. Browser geometry, real-pointer animation and native interaction checks must be reported separately from compilation.
