# Sheet

`SheetContent` is a native Exact modal dialog. It opens above the page, including when its trigger is inside a clipped or transformed demo. Its header stays above the scrollable `SheetBody`; `SheetFooter` keeps actions below it. Left/right panels use 75% of the window, capped at 24rem. Top/bottom panels use the full width, capped at half the window height.

Open with `showModal(id)` and close with `close(id)`. Keep field state in the parent. The host traps focus, makes the background inert, handles Escape and returns focus to the opening control. `showCloseButton=false` hides the corner control; keep a visible footer close action. `reduced=true` disables the entrance animation.

Import these components from `@rightui/ui/sheet`. This optional entry keeps the extra Sheet data declaration out of applications using only the existing `@rightui/ui` entry.

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

The small stylesheet supplies viewport positioning and document scroll locking, which the pinned Contract compiler cannot express. It is scoped to SheetContent dialogs; it contains no JavaScript. Native hosts ignore this web stylesheet. Keep it loaded before opening a sheet.

```contract
use Button from "@rightui/ui"
use SheetContent, SheetBody, SheetFooter from "@rightui/ui/sheet"

component Example
  action open
    showModal("profile")
  action dismiss
    close("profile")
  view
    column
      Button(id="profile-open", label="Open", variant="outline", disabled=false, press=open)
      SheetContent(id="profile", title="Edit profile", description="Make changes to your profile here.", side="right", reduced=false, showCloseButton=true)
        SheetBody()
          text "Your content"
        SheetFooter()
          Button(id="profile-done", label="Close", variant="outline", disabled=false, press=dismiss)
```

The root must provide `uiFont`, as with other rightui components.

## Compatibility

The earlier controlled `Sheet(open=..., focusIds=..., dismiss=...)` remains available for compatibility. Use `SheetContent` for modal window-wide presentation; its visibility belongs to Exact's dialog lifecycle, not an `open` prop. iOS and macOS use their host dialog presentation; this change has been checked on web only. On browsers supporting discrete display and overlay transitions, closing fades and slides the panel out. Older browsers close immediately. Both the reduced prop and the system reduced-motion preference disable these transitions.
