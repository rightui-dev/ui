# Border radius system

Core components follow the official documentation's **Base Nova** default.
AI Elements demonstrations explicitly select **Base Rhea**. They therefore have
separate `ui.ai-radius-*` tokens rather than changing every core control.

## Pinned sources

All paths below are relative to the [pinned upstream shadcn/ui tree](https://github.com/shadcn-ui/ui/tree/dd41d19e2f80ff6891951f7ced74c2c9a650b065):

- `apps/v4/components/component-preview.tsx`: default `styleName="base-nova"`.
- `apps/v4/app/layout.tsx`: imports the Base Nova toaster.
- `apps/v4/content/docs/ai-elements/base/message.mdx`: selects `base-rhea`.
- `apps/v4/app/globals.css:50-56,100`: `--radius: 0.625rem` and scale factors
  `0.6 / 0.8 / 1 / 1.4 / 1.8 / 2.2 / 2.6`.
- `apps/v4/registry/styles/style-nova.css`: exact core slot assignments.
- `apps/v4/registry/styles/style-rhea.css`: exact AI slot assignments.

At a 16px root, the official scale is:

| Token | Official utility | Value |
| --- | --- | --- |
| `ui.radius-sm` | `rounded-sm` | 6px |
| `ui.radius-md` | `rounded-md` | 8px |
| `ui.radius-lg` | `rounded-lg` | 10px |
| `ui.radius-xl` | `rounded-xl` | 14px |
| `ui.radius-2xl` | `rounded-2xl` | 18px |
| `ui.radius-3xl` | `rounded-3xl` | 22px |
| `ui.radius-4xl` | `rounded-4xl` | 26px |

## Core slot mapping

| Semantic token | Value | Slots |
| --- | --- | --- |
| `ui.radius-control` | 10px | Buttons, fields, toggle groups, tabs container |
| `ui.radius-menu` | 10px | Menu/select/combobox/navigation surfaces |
| `ui.radius-item` | 8px | Menu/select items, selected tabs, tooltips |
| `ui.radius-popover` | 10px | Popovers, hover cards, date picker surfaces |
| `ui.radius-panel` | 14px | Cards, dialogs, drawer exposed corners, command |
| `ui.radius-checkbox` | 4px | Checkbox and table selection indicators |
| `ui.radius-full` | 9999px | Circles, switches, slider tracks, scrollbar thumbs |
| `ui.radius-detail` | 2px | Tooltip arrows and small chart markers |
| `ui.radius-inline` | 4px | Inline code |

Menubar triggers and standalone command items use `radius-sm` (6px),
keyboard keys use `radius-sm`, skeletons use `radius-md`, badges use
`radius-4xl`, and toasts use `radius-2xl`, as assigned by Nova.
`ui.radius` remains a compatibility name for the 10px control radius;
`ui.panel-radius` remains a compatibility name for the 14px panel radius.

## AI slot mapping

| Semantic token | Value | Rhea source utility |
| --- | --- | --- |
| `ui.ai-radius-control` | 18px | `rounded-2xl` |
| `ui.ai-radius-item` | 14px | `rounded-xl` |
| `ui.ai-radius-menu` | 18px | `rounded-2xl` |
| `ui.ai-radius-popover` | 22px | `rounded-3xl` |
| `ui.ai-radius-panel` | 24px | `min(var(--radius-4xl),24px)` |
| `ui.ai-radius-bubble` | 22px | `rounded-3xl` |
| `ui.ai-radius-checkbox` | 5px | `rounded-[5px]` |

Use the slot's token rather than copying a nearby numeric radius. Nested menu
items use a smaller radius than their surface; a selected tab is smaller than
its track. Flat group joins deliberately retain zero corners. Explicit circular
geometry retains a full radius. This preserves the official hierarchy instead
of assigning one radius to all widgets.

Tamber stores resolved pixel lengths here. The scale is pinned to the official
0.625rem preset; changing these values is an explicit theme change. AI tokens are
explicit because a scoped theme override has not been established for this SDK.
