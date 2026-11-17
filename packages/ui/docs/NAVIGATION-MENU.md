# Navigation menu

`NavigationMenuSections` groups website links under shared, accessible triggers. Use an empty `entries` array for a direct link. Every destination is a real `href`; provide stable, unique IDs within the menu.

```exact
use NavigationMenuEntry, NavigationMenuSection, NavigationMenuSections from "@rightui/ui"

NavigationMenuSections(id="main-nav", label="Main navigation", reduced=false, sections=[
  NavigationMenuSection(id="learn", label="Learn", href="", layout="list", entries=[
    NavigationMenuEntry(id="intro", title="Introduction", description="Start here.", href="/docs"),
    NavigationMenuEntry(id="setup", title="Setup", description="Install the package.", href="/docs/setup")
  ]),
  NavigationMenuSection(id="blog", label="Blog", href="/blog", layout="list", entries=[])
])
```

`NavigationMenuEntry` and the original `NavigationMenu(id, label, entries, reduced)` remain available. The latter retains its single trigger layout.

The grouped variant opens on pointer hover, click, Enter, Space, or Arrow Down. Arrow Left and Right move between triggers; Arrow Up and Down move between links. Escape closes and returns focus to the active trigger. The auto popover provides outside dismissal. The same panel remains open when moving between sections; it slides to the active trigger while its content and size change. Its left edge aligns with the trigger, switching to right-edge alignment when there is insufficient room on the right. On narrow viewports, the panel also narrows to the available space. Wrapped trigger rows stay above the panel. Reduced motion disables the transitions. Keep link text and descriptions concise for narrow viewports. Pass `reduced=true` when the user prefers reduced motion.

`layout="grid"` uses responsive columns; `layout="list"` uses one column. Validate web, iOS, and macOS behavior before claiming platform compatibility.
