# Code blocks

`CodeBlock` and `CodeBlockAdvanced` render source with the shared code-block
surface, header and body. Copy feedback uses the root clipboard controller below.
`CodeBlockAI` and `CodeBlockFrame` use the same controller.

## Clipboard controller

Exact timers belong to the application root. Add this state, provider, actions and
task to the first component in your app's root Contract file, merging the provider
with your existing `provide` block:

```contract
component App
  state copiedId = ""
  state copiedText = ""
  state copyVersion = 0
  provide
    uiFont = "theme"
    uiCopiedId = copiedId
    uiCopiedText = copiedText
    uiCopyCode = copyCode
  action copyCode(id: string, text: string)
    copyText(text)
    copiedId = id
    copiedText = text
    copyVersion = copyVersion + 1
  action clearCopyFeedback
    copiedId = ""
    copiedText = ""
  task copiedFeedback when copiedId != "" key=copyVersion
    after(3000, clearCopyFeedback)
  view
    CodeBlock(id="example", title="hello.ts", language="ts", code="console.log('Hello')", numbers=false, diff=false)
```

Import `CodeBlock` from `@rightui/ui` above the component and declare the fonts
used by your theme as described in the installation guide.

The injected contract is `uiCopiedId: string`, `uiCopiedText: string` and
`uiCopyCode: action`. The action takes the block's unique, nonempty `id` followed
by its current source text. Copy text directly; do not reconstruct it from
highlighted tokens or visible DOM nodes.

Only the most recently copied block shows the check and its polite status message.
The root schedules their reset after **3,000 milliseconds**. Every copy increments
`copyVersion`, so copying the same text again restarts the full delay. Copying
another block immediately clears the previous block's feedback and starts a new
delay. Matching both the ID and text prevents confirmation from appearing on a
different source after switching tabs. No repeating timer runs while idle.

`copyText` is Exact's platform clipboard command. The pinned SDK does not return
a success or failure result to Contract; the feedback confirms that this command
was dispatched, not a verified read-back of the operating system clipboard.
Web clipboard availability depends on the browser context and permissions.

## Custom headers

`CodeBlockSurface`, `CodeBlockHeader` and `CodeBlockBody` do not require the clipboard
provider. Use them when the application supplies tabs or other header actions.
Such a header can reuse `uiCopyCode(id, source)` and compare `uiCopiedId` and
`uiCopiedText` for the same feedback behaviour. See
[composable components](./COMPONENT-COMPOSITION.md#code-blocks) for their props.
