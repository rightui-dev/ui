# AI Elements

The 21 patterns compose shared rightui controls in Exact Contract. Their local
transcripts reproduce the official shadcn examples. They do not connect an AI
provider, upload files or execute the commands displayed in a transcript.

Copy the pattern and its supporting files from the documentation source viewer
into the same relative layout. Install `@rightui/ui` for its shared controls.
Every documentation page links to the files used by its demo. Source contributors
can also use `@rightui/registry/patterns/ai-elements/<name>` inside the prepared
repository; this development registry is not an npm consumer package.

## Demo clock

Timed sample patterns inject `rightuiDemoTime` and `rightuiRunDemo`. Add these
members to the **root** component, where Exact permits tasks. The clock runs only
while a sample is active; it is not an always-running animation loop.

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

For a live product, replace the transcript state and demo clock with events from
your TypeScript or Rust data source. Keep the shared view composition and pass
the platform reduced-motion preference to each `Demo`.

## Shared parts

- `conversation-parts.contract`: message frame, content, footer, bubble and actions.
- `trace-parts.contract`: trace rows, controlled or internal disclosure, icons,
  source links and command output.
- `markdown.contract` and `code-block.contract`: inline Markdown and fenced code.
- `ai-controls.contract`: composer, attachments, approval item and compact menus.
- `button.contract`: common button sizing, centering, hover and focus behavior.

AI demonstrations use the Rhea radii that their upstream pages explicitly select.
The main component catalog uses Nova. See `RADII.md` for the source mapping.

## Current boundaries

These are local interaction examples, not AI SDK or React API compatibility.
The lightweight Markdown renderer supports inline formatting and fenced code;
it does not replace Streamdown's complete Markdown ecosystem or its syntax
highlighting. Chat follows the latest content and allows returning to it, but
saved-transcript anchors and loading history are not implemented in this pattern.
