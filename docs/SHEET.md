# Sheet

`SheetContent` renders an authored RightUI surface above the whole application window. Its content is transported out of the surrounding layout, including clipped or transformed demo containers. It does not request an iOS system sheet or a macOS sheet. Left/right panels use 75% of the window, capped at 24rem. Top/bottom panels use the full width and are capped at half the window height. The backdrop covers the window in every orientation.

The parent controls visibility with `open` and `dismiss`. Keep form state in that parent so values survive closing and reopening. `SheetBody` scrolls between the header and `SheetFooter`; the controls account for safe-area insets. `showCloseButton=false` hides the corner control, so keep a visible footer close action. `reduced=true` disables entrance and exit motion.

Import these components from `@rightui/ui/sheet`.

## Motion and Drawer

Set `side` to `"top"`, `"right"`, `"bottom"` or `"left"`. Each panel slides from its edge on opening and returns to that edge on closing. The backdrop fades at the same time. Both directions use `ui.duration-slow` and `ui.easing`; changing those theme tokens changes all four orientations together. The layer remains present until the exit finishes, including when a parent sets `open=false` directly. Reopening during that exit reverses the motion from its current position.

Sheet is a fixed panel: it has no resize handle, drag gesture, snap points or spring bounce. Escape, the backdrop and a visible close action dismiss it. Keep `SheetContent` mounted while changing `open` so its exit can finish; removing its parent immediately also removes its surface.

Use [Drawer](DRAWER.md) for a draggable bottom surface, snap points, a handle, floating edges or scroll-to-full-screen behavior. The bottom orientation of `SheetContent` now follows the same simple behavior as its other orientations; its existing props remain unchanged.

## Migration from the dialog lifecycle

This is a breaking change to `SheetContent`. Replace `showModal(id)` and `close(id)` with a boolean state and a dismissal action. Add these required props:

- `open`: whether this sheet is visible.
- `dismiss`: closes the state and restores focus to the trigger.
- `focusIds`: the enabled, focusable content controls in their intended keyboard order. Do not include the optional corner close button; SheetContent adds it automatically. Update the list when controls become disabled or are removed.

SheetContent handles Escape, backdrop presses and Tab/Shift+Tab containment. It initially focuses its panel without scrolling it. The parent remains responsible for choosing the trigger that receives focus on dismissal, especially when several controls open the same sheet. Do not make a logical ancestor of the sheet inert: its transported content retains that ancestry.

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

Eight isolated package browser tests passed for persistent fields, Escape, optional close controls, four orientations, initially open content and reopening during an interrupted exit. Real pointer checks measured opening and closing translation plus backdrop opacity on all four sides; mobile reduced-motion checks observed no intermediate motion. The layer stayed within the window without focus-induced internal scrolling.

iOS simulator interaction and recording checks covered all four edges, full-window presentation, absent handles, close controls and animated entry/exit. Native accessibility, physical-device frame rate and exhaustive platform coverage remain incomplete. These checks do not certify every native interaction; compilation and delivery are recorded separately in the website validation report.
