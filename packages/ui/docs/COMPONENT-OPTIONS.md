# Component options

The 0.3.0-beta.5 candidate adds composition APIs without changing existing component signatures. Every prop in Exact must be supplied; props have no default initializer.

- AccordionOptions and AccordionMultipleOptions accept disabledItems and collapsible. Arrow keys, Home and End move between enabled triggers. Headings, content and chevrons share horizontal insets; hover underlines the heading without adding a background fill. Observed content heights animate both opening and closing, including in browsers without intrinsic-size interpolation; reduced motion disables the transitions.
- CheckboxMixed accepts checked="mixed", "true" or "false" and calls change with a boolean. The pinned SDK exposes checked as a boolean; mixed uses a toggle button with aria-pressed="mixed" and a partial-selection description. Checkbox retains its boolean API.
- CardFrameOptions adds size, spacing, imageTop and direction. Use cardSpacing(size, spacing) and pass that resolved spacing to CardHeaderOptions, CardContentOptions and CardFooterOptions. Caller-owned slots keep their caller's providers. AspectRatioFrame adds an explicit radius; AspectRatio retains ratio and its slot.
- AttachmentOptions adds size, orientation, imageSource, cardWidth, previewHref, reduced, copyable and copyValue. AttachmentPreview uses the public modal layer. Compose retries with AttachmentAction and caller-owned status/content.
- BubbleOptions adds reactions, reduced, initialCollapsed and previewLength. BubbleContent, BubbleButton, BubbleLink, BubbleReactions, BubbleAction and BubblePopoverAction compose content and actions.
- BadgeWithOptions takes BadgeOptions(icon, trailingIcon, href, fill, ink, direction, invalid). BadgeContent accepts caller-owned icons and spinners. Use direction="inherit" to keep the parent's direction.
- BreadcrumbOptions adds hrefs, separator, label and direction. BreadcrumbRoot/List/Item/Link/Page/Separator/Ellipsis expose composition. DropdownMenuLinks uses real hrefs; route navigation owns teardown. BreadcrumbResponsive uses a menu at desktop widths and a Drawer below 768, remounting its local state across that breakpoint.
- ChartOptions, AreaChartOptions and LineChartOptions add tooltip/legend visibility, formatting and series configuration. SeriesValuesTooltipOptions accepts custom formattedValues. Totals include only visible series; geometry stacking does not change tooltip values.

## Floating panels

DropdownMenu, DropdownMenuAdvanced, DropdownMenuLinks, NavigationMenu and Popover align their left edge with the trigger and flip to right-edge alignment when needed. DropdownMenuLinks mirrors the initial alignment for RTL. NavigationMenuSections keeps one shared panel and slides it between triggers, narrowing it when neither side can fit the full panel. Reduced motion disables the slide.

Popover closes immediately on trigger toggle, Escape or outside dismissal, without a detached exit animation. Its opening animation remains enabled unless reduced motion is requested. PopoverFrame also supports explicit `align="center"` and `align="end"`.

## Documentation cover

Card and AspectRatio examples use the bundled `assets/card/cover.jpg`. Copy `node_modules/@rightui/ui/assets/card/` to your app's `assets/card/` when using those examples, and retain provenance.json. The components themselves do not require a cover image. The image author, source, license and checksum are recorded beside the image.

## Validation scope

Web checks are recorded in the compatibility matrix. These additions have no release-specific iOS or macOS validation yet.
