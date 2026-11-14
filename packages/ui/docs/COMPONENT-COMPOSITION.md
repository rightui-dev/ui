# Composing existing components

The public primitives below share their renderer and theme recipes with their
higher-level counterparts. They let an application supply its own labels, actions
or layout without copying component internals.

## Code blocks

`CodeBlockSurface(id, compact, variant, ai)` owns the shared container and accepts
children. `CodeBlockHeader(compact)` owns the header layout and accepts children.
`CodeBlockBody(id, heading, code, lines, numbers, diff, startLine, maxHeight,
compact, variant, wrapped)` owns scrolling, line rendering, syntax tones, numbering,
diff markers and wrapping. Set `lines=[]` to render the supplied plain source.

`CodeBlockAdvanced` composes these same primitives with its built-in copy,
download and wrap actions. Applications with package-manager tabs can compose
Surface, Header and Body while controlling their own selected command and copy
feedback. Keep `id` consistent between the surface, body and related action labels.

## Form controls without visible labels

`CheckboxControl(id, label, checked, disabled, change)` and
`SwitchControl(id, label, checked, disabled, reduced, change)` use the same control
as `Checkbox` and `Switch`. They omit only the visible label. The accessible `label`
is still required. Their action contract remains the same as the labelled control.

`RadioControl(id, label, checked, disabled, tabIndex, press, keys)` is an individual
radio button. The caller owns selection and roving focus for its radio group.
`RadioIndicator(checked)` is the shared visual marker used by both RadioControl
and RadioGroup; it is not an interactive control by itself.

`TextareaControl(id, label, value, placeholder, error, descriptionId, disabled, edit)`
is the field used by `Textarea`. Supply `descriptionId` only when an associated
message exists. The control's label remains accessible when the application draws
its own visible heading.

## Progress and dialogs

`ProgressTrack(id, label, value)` is the accessible progress track used by
`Progress`, without visible text. Values are clamped to 0–100.

`DialogFrame(id, open, reduced, title, description, focusIds, dismiss)` provides the
modal container, heading, description, close button, backdrop and focus trap. It
accepts child content and does not add a footer. The built-in `Dialog` composes this
frame with a scrollable body and its cancel/confirm actions. Include every child
control that should participate in Tab navigation in `focusIds`; the frame adds
its own close button. Custom content should provide its own bounded scroll region
when needed.

`ModalFrame` remains the common primitive for sheets and alert dialogs. Use
`DialogFrame` for a centered dialog without the built-in footer.

## Theme boundaries

Colours, typography, spacing, radii, strokes, shadows and motion reference shared
RightUI theme tokens. Semantic borders also control separators drawn as views.
Slider and range-slider pointer calculations measure the rendered rail; resizable
panels measure the rendered divider; custom scrollbars measure their rendered
tracks. Changing density or border width therefore does not leave those
calculations tied to old spacing constants.

SVG view-box coordinates, chart mathematics, percentage positioning, flat joins,
circular shapes, dashed recipes, animation mask coordinates and ergonomic minimum
sizes describe structure or behaviour. They are not interchangeable visual values.
Explicit chart-series colours remain caller-controlled, while the default palette
uses theme roles. Native select popups and other operating-system surfaces retain
platform styling. See [Markdown renderers](./MARKDOWN.md) for the separate legacy
Markdown boundary. These distinctions do not establish complete native visual or
interaction coverage; validation is reported separately.
