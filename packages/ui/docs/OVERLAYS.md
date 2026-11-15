# Window overlays

Dialog, AlertDialog, Drawer, Sheet and Toast use the same painted RightUI top layer. Their content is moved above the app window, outside clipping and transforms, while retaining its state. The overlay surface remains RightUI on web, iOS and macOS; it does not invoke the operating system's sheet presentation.

Keep the existing controlled `open` and `dismiss` props. Mount Toast while its notification is visible. Dismiss callbacks must restore focus to their trigger. Modal `focusIds` lists must contain every interactive child in the intended keyboard order, including footer actions. Toast is non-modal and does not move focus.

Load `assets/sheet.css` from the package in the web head. This historical asset path now supplies viewport positioning and scroll locking for all RightUI modal layers. Native hosts use Contract bounds and ignore this stylesheet. A layer covers its own window: content embedded in an iframe cannot cover another window without parent coordination.

The internal `OverlayLayer` opens after its first layout through Exact's documented resize event. Mount it only while visible, so each opening receives fresh lifecycle state. The content is never drawn inline before presentation. Do not set an ancestor of the overlay inert: Exact retains logical ancestry after lifting it.

SheetContent now uses `open`, `focusIds` and `dismiss` instead of `showModal` and `close`; see [Sheet](SHEET.md) for migration. Native assistive-technology isolation needs separate platform checks; visual coverage and keyboard tests alone do not prove VoiceOver coverage.
