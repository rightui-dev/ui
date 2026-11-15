# Message

Compose a conversation with `MessageRow`, `MessageAvatar`, `MessageBody`, `MessageHeader` and `MessageMeta`. `MessageGroup` stacks consecutive rows. The existing `Message(id, author, initials, time, align)` wrapper remains available; an empty author or time omits that text.

`MessageBody` aligns its content to the message side, including optional headers and metadata. Use an empty `MessageAvatar` in earlier grouped rows to reserve the same avatar column. For a footer below an avatar-aligned bubble, render the metadata after the row with the same avatar inset.

Message owns the row layout; it does not add bubble reactions or collapse controls. Use `BubbleFrame` with `BubbleContent` for composition, or `BubbleOptions` with `reactions=false` and `collapsible=false` for ordinary text. Add `BubbleReactions` only where a reaction is intended and reserve room for its overlap. Legacy `Bubble` keeps its original defaults.

The main example is a compact conversation with incoming and outgoing bubbles, grouped replies, a delivery footer and one explicit reaction. More examples shows header/actions, grouped attachment messages, removal/restoration and a retry that changes Failed to send into Delivered. Actions use public icon buttons with accessible labels. Avatars use local initials; no external portraits are loaded.

`MessageTyping(id, label, reduced)` displays three dots in a staggered one-second wave. Set `reduced=true` to keep the dots still. The status has a readable label; decorative dots are hidden from assistive technology.
