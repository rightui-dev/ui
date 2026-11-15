# Drawer

Drawer presents an authored RightUI surface over the whole application window, including when its trigger lives inside a clipped or transformed preview. Its background, corners and content move together. It does not request an operating-system sheet card.

Use `Drawer` for the standard 30% and 90% stops, `DrawerAdvanced` for custom stops, and `DrawerContent` for controlled height, floating edges and custom content composition.

## Standard drawer

`Drawer` accepts `id`, `open`, `title`, `description`, `reduced`, `focusIds` and `dismiss`, plus its content slot. Each opening starts at 30%. Drag the handle to resize, release to settle at a stop, or pull down to dismiss. The release position and velocity select the destination.

```contract
use Button, Drawer from "@rightui/ui"

component Example
  state shown = false
  action reveal
    shown = true
  action dismiss
    shown = false
    focus("drawer-open")
  provide
    uiFont = "sans"
  view
    column
      Button(id="drawer-open", label="Open drawer", variant="outline", disabled=false, press=reveal)
      Drawer(id="settings-drawer", open=shown, title="Settings", description="Drag the handle to expand.", reduced=false, focusIds=["drawer-done"], dismiss=dismiss)
        text "Your content"
        Button(id="drawer-done", label="Done", variant="primary", disabled=false, press=dismiss)
```

The handle uses Exact's native `heightDragFor` interaction. Its visible bar sits inside a touch target at least 44 points high, extended by a 12-point vertical and 16-point horizontal hit slop. The panel clips hit slop outside its bounds; the close control keeps its own target.

The settling spring allows a small rebound within the available height. The highest stop does not itself clip that rebound; the window boundary does. `reduced=true` disables the settling animation. Requesting a high display refresh rate does not guarantee a sustained frame rate on every device.

## Custom stops

`DrawerAdvanced` accepts the standard props plus `snapPoints: number[]` and `initialSnap: number`.

```contract
DrawerAdvanced(id="settings-drawer", open=shown, title="Settings", description="Choose a comfortable height.", reduced=false, focusIds=["drawer-done"], dismiss=dismiss, snapPoints=[0.3, 0.6, 0.9], initialSnap=0.6)
  Button(id="drawer-done", label="Done", variant="primary", disabled=false, press=dismiss)
```

Stops are fractions of the available panel height. They are sorted, duplicates are removed and values outside `(0, 1]` are discarded. If none remain, `[0.3, 0.9]` is used. Zero is reserved for dismissal. Opening resolves `initialSnap` to the closest allowed stop and does not retain the previous drag height.

## Controlled appearance and height

`DrawerContent` accepts the standard props, `snapPoints`, a controlled `snapPoint`, `changeSnap: action(number)` and `options: DrawerOptions`. The parent stores the selected stop and updates it in `changeSnap`. Set that state when opening if each visit should start at the same height. It is also the way to expand or collapse the drawer from a content control.

All fields of `DrawerOptions` are required by Exact:

| Field | Behavior |
| --- | --- |
| `detached: bool` | Separates the panel from the sides and bottom, with rounded corners on every edge. |
| `showHandle: bool` | Shows or removes the resize handle and its keyboard target. |
| `showCloseButton: bool` | Shows the corner close control. Keep a reachable dismissal control when hiding it. |
| `backdropOpacity: number` | The backdrop opacity at the largest stop, clamped to `0…1`. It follows the displayed panel height during drag and settling. |
| `dismissOnBackdrop: bool` | Allows a backdrop press to dismiss. Disabling it still blocks the page behind the drawer. |
| `bounce: bool` | Selects the settling spring with or without the small rebound. Reduced motion takes precedence. |
| `scrollable: bool` | Wraps the content in a scrollable body. Set false to compose fixed and scrollable regions yourself. |
| `expandOnScroll: bool` | For the automatic scrollable body, an upward content scroll beyond 8 points expands the drawer to full height. This enables the `1` stop. |

Options are reactive. For example, changing the parent value used by `backdropOpacity` updates an already open drawer. `showHandle=false` does not remove the close control or keyboard dismissal.

```contract
derive options = DrawerOptions(detached=true, showHandle=true, showCloseButton=true, backdropOpacity=0.35, dismissOnBackdrop=true, bounce=true, scrollable=true, expandOnScroll=false)
```

The detached variation uses a compact 12-point themed gap and respects safe areas. A detached stop of `1` fills the available space inside these gaps; an attached stop of `1` reaches the window edges. Content controls remain clear of the status bar and home indicator.

## Fixed and scrollable regions

Set `options.scrollable=false` to use the content slot as a bounded flex column. The drawer heading remains fixed above that slot. Compose the children in their desired order:

| Component | Purpose |
| --- | --- |
| `DrawerInset` | Content padding and vertical spacing. Pass `compact=false` for the normal inset or `compact=true` for a floating drawer. It does not create a scroller. |
| `DrawerBody` | A bounded, flexible native scroll region with content padding already applied. Pass `compact`, `id`, `expanded`, `expandOnScroll` and `expand`. |
| `DrawerFooter` | A fixed footer. Pass `compact` to choose its inset; it does not shrink or scroll with the body. |

Plain fixed views can sit before or after `DrawerBody`. Only the body scrolls. Do not add an outer scroller around this composition: it would make the fixed sections scroll too. The automatic body and `DrawerBody` already contain a `DrawerInset`. Use `DrawerInset` for separate fixed content regions; do not nest another one inside a body.

```contract
use Button, DrawerContent, DrawerOptions, DrawerBody, DrawerInset, DrawerFooter from "@rightui/ui"

component Example
  state shown = false
  state stop = 0.45
  derive options = DrawerOptions(detached=false, showHandle=true, showCloseButton=true, backdropOpacity=0.5, dismissOnBackdrop=true, bounce=true, scrollable=false, expandOnScroll=false)
  action reveal
    stop = 0.45
    shown = true
  action changeStop(value: number)
    stop = value
  action expand
    stop = 1
  action dismiss
    shown = false
    focus("details-open")
  provide
    uiFont = "sans"
  view
    column
      Button(id="details-open", label="Open details", variant="outline", disabled=false, press=reveal)
      DrawerContent(id="details", open=shown, title="Project details", description="Scroll the details to expand.", reduced=false, focusIds=["details-done"], dismiss=dismiss, snapPoints=[0.45, 0.9, 1], snapPoint=stop, changeSnap=changeStop, options=options)
        column flex-shrink=0
          DrawerInset(compact=false)
            text "This summary stays visible."
        DrawerBody(compact=false, id="details-body", expanded=(stop >= 1), expandOnScroll=true, expand=expand)
          for section in ["Overview", "Workspace", "Appearance", "Typography", "Components", "Interactions", "Accessibility", "Notifications", "Storage", "Privacy", "Export", "Review"] key=section
            column gap="ui.space-8" padding="ui.space-12 0px"
              text section font-weight="ui.weight-semibold"
              text "Review this part of the project without leaving the current page."
        DrawerFooter(compact=false)
          Button(id="details-done", label="Done", variant="primary", disabled=false, press=dismiss)
```

The state and callback are explicit because Exact slot content keeps its caller's providers. `DrawerBody` does not silently inject a surrounding drawer's actions. Set `expandOnScroll=false` and provide an unused action when the body should only scroll.

## Scroll to full screen

An upward content scroll expands the panel to its full-height stop with the same spring. The content then continues using its native scroller. At full height, the header retains the same handle and close control when enabled; it does not add a Back button. Drag the header or handle to return to a lower stop.

For the automatic body, use `options.scrollable=true` and `options.expandOnScroll=true`. For a custom fixed/body/footer composition, include `1` in `snapPoints` and wire `DrawerBody.expand` to set the controlled stop to `1`, as above.

This mode triggers an expansion; it does not continuously transfer the same gesture from content scrolling into handle resizing. The current Exact interaction model does not expose that cross-scroller handoff. Use the handle or draggable header to reduce the panel. A scroll inside an arbitrary nested scroller does not automatically expand its parent drawer; wire that region explicitly.

## Focus, keyboard and dismissal

`focusIds` lists enabled content controls in keyboard order. Drawer adds its own visible handle and close controls; do not duplicate them. Update the list when content controls become disabled or disappear. Initial focus goes to an available drawer control, with the panel as a fallback when no control is shown. The dismissal action must set `open=false` and restore focus to the intended trigger.

| Input | Result |
| --- | --- |
| ArrowUp / ArrowDown on the handle | Next higher / lower allowed stop. |
| Home / End on the handle | Smallest / largest stop. |
| Enter or Space on the handle | Next higher stop, cycling to the smallest after the largest. |
| Escape | Dismiss. |
| Tab / Shift+Tab | Move through the visible drawer controls and supplied `focusIds`. |
| Backdrop press | Dismiss when `dismissOnBackdrop=true`. |
| Close control or downward handle release toward zero | Settle to zero, then dismiss. |

A parent that immediately sets `open=false`, including a custom content button, removes the controlled drawer directly. The built-in close paths can finish their closing spring before invoking `dismiss`. Keep form state in the parent when it must survive closing and reopening.

## Safe areas and setup

Attached panels reach the bottom window edge. In the automatic scrolling mode, the bottom safe-area inset is inside the scrollable content, so the scroll viewport reaches the window edge without an opaque strip clipping it. Composed fixed footers keep their bottom safe-area space outside the body scroller. Detached panels keep their outside gap clear of the home indicator. Do not add the same bottom safe-area inset again in a footer. At full height, the header accounts for the top safe area.

`SheetContent` is a fixed panel with simple slide and backdrop-fade animations on every edge, including bottom. It has no handle, drag gesture or snap points. Use Drawer for interactive resizing, snap points, floating edges and spring motion.

Use unique IDs for mounted overlays. Do not make a logical ancestor inert: transported content keeps that ancestry. An iframe has its own window, so a drawer opened inside it covers that frame.

Load the package's `assets/sheet.css` using the [shared overlay setup](SHEET.md#web-setup). Native hosts use the Contract layer and ignore this stylesheet. The root must provide `uiFont`, as with other RightUI components.

The new floating, composition and scroll-to-full-height variations require targeted platform checks; existing overlay checks do not establish complete coverage of those variations. Refer to Compatibility for recorded validation. Windows and Android are outside the project scope. Physical frame-rate measurement and full VoiceOver modal isolation remain separate checks.

The header remains a drag surface when the visual handle is hidden. Close controls keep their own tap behavior. Scroll-to-expand responds to upward user input; programmatic scrolling and a downward content gesture do not expand it.

Attached and full-screen drawers use the normal 24px content inset (`ui.drawer-content-inset`, aliased to `ui.card-inset`). Detached drawers use 12px (`ui.drawer-floating-content-inset`). For manually composed regions, pass `compact=false` to DrawerBody, DrawerInset and DrawerFooter for the normal inset, or `compact=true` for a floating surface. A full-screen stop removes the surface corner radius; lower stops restore it.

During a drag away from full screen, the header top inset follows its actual overlap with the status-bar safe area. Corner radii recover progressively with the visible panel height; no extra Back control is inserted.
