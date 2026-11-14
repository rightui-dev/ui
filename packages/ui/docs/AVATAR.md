# Avatar

Profile images, initials, status badges and overlapping groups share the same
RightUI theme. `AvatarMenu` adds an account menu with keyboard navigation.
Existing `Avatar`, `AvatarFrame`, `AvatarBadge` and group imports remain available;
no migration is required.

## Image and fallback

Use `Avatar` for a default-size image, or `AvatarFrame` when you need a different
size or a badge. Both accept `id`, `name`, `src` and `fallback`; `AvatarFrame` also
requires `size="sm"`, `"default"` or `"lg"` and accepts children.

```contract
use AvatarFrame, AvatarStatus from "@rightui/ui"

component Profile
  view
    AvatarFrame(id="profile", name="Charlie Cheever", src="assets/profile.jpg", fallback="CC", size="default")
      AvatarStatus(id="profile-status", label="Available", size="default", tone="success")
```

Supply your own image at `assets/profile.jpg`. Empty or failed image sources show
the supplied initials. Keep `name` meaningful: it provides the accessible name
for the whole avatar, while the image and initials do not repeat that name.
Changing `src` lets the same instance display another image.

As with other RightUI text, configure the root `uiFont` provider and bundled fonts
from Installation. An avatar's dimensions remain reserved while its image loads.

## Badges

`AvatarBadge(id, label, size)` keeps the primary badge style and accepts an icon.
`AvatarStatus(id, label, size, tone)` adds `"success"`, `"destructive"` and
`"default"` tones. Set the badge's `size` to the surrounding avatar's size.
Small badges hide their icon to remain legible at their smallest size.

Badges are status displays. For an action, place the avatar inside an accessible
button or use `AvatarMenu`; a decorative plus icon alone is not a button.

## Groups

Wrap each profile in `AvatarGroupItem(id, first)` inside
`AvatarGroup(id, label)`. Set `first=true` only for the first member. Append
`AvatarGroupCount(id, label, count, size, first)` to show additional members, or
`AvatarGroupOverflow(id, label, size, first)` for a custom icon or localized count.
The count clamps negative and fractional values to a non-negative integer.

```contract
use AvatarFrame, AvatarGroup, AvatarGroupItem, AvatarGroupCount from "@rightui/ui"

component Team
  view
    AvatarGroup(id="team", label="Project team")
      AvatarGroupItem(id="team-first", first=true)
        AvatarFrame(id="team-charlie", name="Charlie Cheever", src="", fallback="CC", size="default")
      AvatarGroupItem(id="team-second", first=false)
        AvatarFrame(id="team-max", name="Max Leiter", src="", fallback="ML", size="default")
      AvatarGroupCount(id="team-more", label="3 more members", count=3, size="default", first=false)
```

For right-to-left layouts, wrap the group in `Direction(direction="rtl")` and use
`AvatarGroupItemDirected(id, first, direction="rtl")` and
`AvatarGroupOverflowDirected(id, label, size, first, direction="rtl")`. These
versions put the overlap on the correct side without changing the existing
left-to-right APIs. Supply localized count text in the overflow slot when needed.

## Account menu

`AvatarMenu(id, name, src, fallback, entries, reduced, choose)` uses the same avatar
and menu components as the rest of the library. Each `MenuEntry` provides `id`,
`label`, `shortcut`, `disabled` and `destructive`. The first destructive item is
separated from the preceding actions. `choose` receives the selected entry ID;
the application decides what that action does.

- Enter, Space or ArrowDown opens the menu at its first enabled item.
- ArrowUp opens it at the last enabled item.
- Arrow keys, Home, End and typing move focus; disabled entries are skipped.
- Enter or Space selects an enabled item and returns focus to the avatar.
- Escape closes the menu and returns focus. Clicking outside dismisses it.
- Pass the app's reduced-motion preference as `reduced`.

For another custom trigger, compose `ActionMenuTrigger` directly. It accepts the
existing `ActionMenu` props plus `circular` and `separateDestructive`, and renders
its children inside the trigger. The existing `DropdownMenu` and `ContextMenu`
continue to use the same menu behavior and keep their current public props.

## Theme

The defaults are 24, 32 and 40 pixels for small, default and large avatars.
Override `ui.avatar-sm`, `ui.avatar-size` and `ui.avatar-lg` to change them together
with the rest of your app. Other recipe tokens control the avatar radius,
border width and color, fallback background and foreground, badge dimensions,
group overlap, surrounding ring and account-menu width.

These tokens alias the shared spacing, border and color roles. Status tones use
`ui.success`, `ui.danger` and `ui.primary`. The image's own colors remain part of
the supplied media.

## Validation

Web behavior and native behavior are tracked separately in Compatibility.
Native compositions have partial checks; a web example or compilation does not
establish device interaction coverage.
