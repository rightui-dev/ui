# Block scroll integration

`DashboardBlock` and `SidebarBlock` keep their existing props and behavior.
Applications that coordinate their own chrome with content scrolling can use the
additional `DashboardBlockWithScroll` and `SidebarBlockWithScroll` compositions
from the same registry source files.

Both accept a `scrolled: action` callback with `(x: number, y: number)` offsets.
The callback reports the dashboard table or sidebar body scroll, not the sidebar
menu, settings dialog or horizontal tab strip. Subscribe to the application page
scroller separately when the block also overflows its enclosing page.

Keep an overlay bar out of layout when hiding it. Clip its animated translation,
respect reduced motion, and reset its visibility when entering another preview.
The RightUI website uses this integration for its iOS preview Back bar.

These additions are local and unreleased. Targeted iOS simulator scroll checks
and the website browser regression suite passed; full native interaction and
accessibility coverage has not been established.
