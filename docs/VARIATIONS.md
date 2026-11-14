# Component variations

The 66 component families have live demos. This inventory compares their actual Contract APIs and examples with the pinned shadcn sources. It is not a certification that every shadcn option or behavior is implemented.

`metadata/variations.json` links each demo to upstream source files, lists named variations, records the exact demo hash, and separates remaining APIs from React-specific integrations.

## Resizable

The page demonstrates horizontal, vertical, with-handle, RTL, nested and disabled layouts. Each standalone example has independent state. Toggle `withHandle` or RTL live. The splitter remains accessible when its grip is hidden. Dragging and arrow keys reverse correctly in RTL; the one-pixel separator retains a wider invisible hit target.

The public axis prop is `orientation`. Pass `dir="ltr"` or `dir="rtl"` to both group and handle, and explicitly pass `withHandle` on the handle. Exact props have no defaults.

## Shared composition

Calendar navigation, sidebar triggers, trace disclosures, Input Group actions, data-table pagination, questionnaire actions and message-scroller actions use shared button primitives. Specialized grid cells, menu items, checkboxes and radio controls retain their own semantics. Raw inputs are retained where the labeled Input wrapper would change form composition.

## Coverage and remaining APIs

Demos include Button sizes/icons/loading, Calendar range/multiple/disabled, states for inputs and choices, Drawer responsive composition, Sheet sides, Slider orientations, and additional content compositions. Some variants need richer public APIs before a faithful demo can be exposed; those gaps are listed below.

| Component | Demonstrated variations | Remaining API variants |
| --- | --- | --- |
| accordion | Single expansion | Disabled items; custom card shell |
| alert | Destructive | Action slot; custom colors |
| alert-dialog | Existing examples retained | Small size; media; destructive confirmation styling |
| aspect-ratio | Square, Portrait | No additional gap identified in this scoped review |
| attachment | Uploading, Error | Image media; sizes; group/trigger primitives |
| avatar | Size sm, Size lg, Group with fallback and count | Dropdown trigger composition |
| badge | Default, Secondary, Destructive, Outline, Ghost, Link | Icon/spinner slots; link href; custom colors |
| breadcrumb | Existing examples retained | Custom separator; collapsed ellipsis; dropdown; href links |
| bubble | Existing examples retained | Reactions; grouped bubbles; interactive content |
| button | Small, default and large, Icon only, Icon with text, Loading | Rounded/custom shape options |
| button-group | Separated nested groups | Vertical orientation |
| calendar | Multiple selection, Single with constraints, Range, Disabled | Multi-month view; Week numbers; Custom day rendering and size; Time selection |
| card | Image content | Small size and configurable spacing |
| carousel | Vertical without looping, Custom slide content | No additional gap identified in this scoped review |
| chart | Explicit maximum without legend | No additional gap identified in this scoped review |
| checkbox | Controlled and disabled | Invalid state |
| code-block | Tokenized source; light/dark syntax colors; line numbers and start line; highlighted and diff lines; wrap; max-height; copy; optional file export | ANSI parsing; Markdown rendering; file tabs; collapse; arbitrary action slots |
| collapsible | Settings and nested files | No additional gap identified in this scoped review |
| combobox | Disabled | Multiple selection; groups; clear button; custom items; invalid; auto highlight |
| command | Keyboard shortcuts | Groups |
| context-menu | Destructive action | Icons |
| data-table | Existing examples retained | No additional gap identified in this scoped review |
| date-picker | Single date | Time picker; natural-language parsing; date-of-birth selectors |
| dialog | Scrollable content | Hide close; custom close; sticky footer |
| direction | Nested direction | No additional gap identified in this scoped review |
| drawer | Scrollable content, Responsive dialog | Side selection |
| dropdown-menu | Existing examples retained | Entry icons; avatar/custom trigger |
| empty | Search empty items | Custom media; background/border variants |
| field | Responsive checkbox, Responsive switch, Responsive radio, Responsive slider | No additional gap identified in this scoped review |
| hover-card | Existing examples retained | Side positioning; open/close delays |
| input | Grouped inline fields and action, Invalid, Disabled | File type; required; badge slot |
| input-group | Prefix only, Suffix only, Disabled | Icon/kbd/spinner/dropdown slots; block alignment; textarea/custom input |
| input-otp | Four digits and disabled | Alphanumeric/custom pattern; separator; invalid |
| item | Icon media, Image media, Grouped items with header, Link action, Dropdown action | variant/size props; media/header/footer/action subparts and link root |
| kbd | Shortcut group, Button shortcut | KbdGroup dedicated API; arbitrary tooltip/button child slots |
| label | Label inside a field | htmlFor association prop |
| marker | Border, Plain | status/progress semantics, shimmer, icon/content slots, link/button root |
| menubar | Additional person radio menu | entry icon and explicit RTL direction |
| message | Outgoing grouped messages and action | image avatar src and optional header/footer subparts |
| message-scroller | Existing examples retained | turn anchors, streaming live edge, saved-thread initial position, scroll-state callbacks, virtualization, arbitrary jump targets |
| native-select | Disabled | option groups, invalid state, per-option disabled |
| navigation-menu | Existing examples retained | nested trigger/content menus and viewport, active state, RTL prop |
| pagination | Last page boundary | simple/icons-only layout, ellipsis and link href customization |
| popover | Basic content | alignment/side controls |
| progress | Controlled progress | RTL direction prop |
| questionnaire | Card questionnaire, Dialog questionnaire | controlled answers/current item, resume, conditional questions, validation callback, shortcuts, custom progress/rendering |
| radio-group | Disabled, Description | per-option description/card slots, invalid state, per-item disabled |
| resizable | Horizontal, Vertical, With handle toggle, RTL toggle, Nested panels, Disabled | No additional gap identified in this scoped review |
| scroll-area | Horizontal scrolling | explicit RTL direction |
| select | Disabled, Scrollable options | groups, per-item disabled, invalid, item alignment, searchable aria select |
| separator | Vertical separator, Menu separators, List separators | No additional gap identified in this scoped review |
| sheet | Left sheet, Top sheet, Bottom sheet | hide close button prop |
| sidebar | Existing examples retained | header/footer/groups/submenus/actions/badges/skeleton slots, mobile offcanvas/variant/side configuration |
| skeleton | Existing examples retained | shape/width/height props for avatar/card/text/form/table |
| slider | Single thumb, Vertical range, Disabled range | arbitrary 3+ thumbs, explicit RTL |
| spinner | Loading empty state | size/custom icon props, childless icon-only rendering |
| switch | Disabled, Description | size, invalid state and choice-card root |
| table | Existing examples retained | caption/footer, rich cell/action slots, sorting/filtering/selection/pagination data-table API |
| tabs | Existing examples retained | icon slot per tab |
| textarea | Field description and submit action, Invalid, Disabled | explicit RTL prop |
| toast | Destructive notification | upstream deprecated; stacking/provider/duration/swipe API absent |
| toggle | Disabled | outline,size,icon slot |
| toggle-group | Disabled | single selection mode, outline,size,spacing,vertical,custom item slots |
| tooltip | Existing examples retained | side/placement, custom keyboard content, disabled external trigger slot |
| trace | Compact composable rows; running/pending/error icons; controlled disclosure; rich content; sources; scripted replay; reduced motion | Dedicated dialog/sheet trigger wrappers |
| typography | h2, h3, h4, p, blockquote, code, lead, large, small, muted | semantic list/table structure (content is string only) |

## AI Elements

AI Elements are separate copyable compositions in `patterns/ai-elements/`, indexed by `metadata/ai-elements.json`. They reuse the UI library and demonstrate local state. They do not include a model provider, tool execution service or streaming transport.
