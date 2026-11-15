# Message Scroller

`MessageScrollerViewport(id, messages, height, busy, reduced, latest)` is a bounded conversation viewport. It renders public Message and Bubble surfaces, follows content growth only at the live edge, and shows an accessible `MessageScrollerButton` when the reader scrolls away. The composer, network transport and message data belong to the application.

`ContentMessage` remains `{ id: number, body: string, mine: bool }`. Keep IDs stable when a reply grows or older messages are prepended. `busy` marks the transcript busy for assistive technology; individual characters are not status announcements.

```contract
use ContentMessage, MessageScrollerViewport from "@rightui/ui"

component Conversation
  props
    messages: ContentMessage[]
    busy: bool
    reduced: bool
  action latest
    match messages.at(-1)
      case some(message)
        if reduced
          scrollIntoView("thread", message.id, block="end", behavior="instant")
        else
          scrollIntoView("thread", message.id, block="end", behavior="smooth")
      case none
        preventDefault()
  view
    MessageScrollerViewport(id="thread", messages=messages, height="24rem", busy=busy, reduced=reduced, latest=latest)
```

## Timed demo

The example uses the same gated root clock as the other interactive demos. Its local reply grows automatically; Stop freezes the partial response and Resume continues it. Reset deliberately starts a new conversation. No server or AI service is called.

```contract
  state demoTime = 0
  state demoUntil = 0
  provide
    rightuiDemoTime = demoTime
    rightuiRunDemo = runDemo
  action runDemo(duration: number)
    demoUntil = max(demoUntil, demoTime + duration)
  action tickDemo
    demoTime = min(demoUntil, demoTime + 32)
  task demoClock when demoTime < demoUntil
    every(32, tickDemo)
```

Put this controller in the application root when copying the demo. The public viewport itself does not require a clock or these providers. In a real app, your transport supplies the changing message text.

## Existing APIs

`MessageScroller(id, messages, historyLoaded, loadHistory, send, latest)` still combines history, a transcript and a composer. `send` receives trimmed text and clears the draft.

`MessageScrollerTranscript(id, messages, height, latest)` opens at the end. `MessageScrollerTranscriptStart` opens at the start. Both use a virtualized keyed list and retain their existing follow-state label. `MessageScrollerRichViewport(id, height)` accepts caller-owned rich content; it is an ordinary bounded list, not a virtualized one.

The History example demonstrates opening at the start, prepending rows and navigating to stable message IDs. Exact supplies follow-at-end and keyed prepend correction. Saved scroll restoration, arbitrary rich virtualized rows and automatic new-turn anchoring with previous-turn peek are not exposed by this API.
