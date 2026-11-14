# Markdown renderers

RightUI provides two rendering paths with different compatibility guarantees.

## Existing Markdown component

`Markdown(id, content)` keeps the existing Exact Markdown renderer for formatted
text, and uses RightUI's public `CodeBlockAI` for fenced code. Existing syntax is
preserved. Fenced code keeps its indentation; only the newline immediately before
a closing fence is removed.

Exact owns the inline Markdown layout and formatting. RightUI controls the outer
font, text size, foreground, line height and spacing, but some inline font choices,
list markers and quotation styling come from the host. This component is not a
fully theme-controlled Markdown renderer.

## Theme-controlled document

`MarkdownDocument(id, blocks)` renders an explicit document using RightUI tokens
and public code blocks. It does not use Exact's `markup="markdown"` renderer.

`parseMarkdown(content)` returns `MarkdownBlock[]` for a deliberately small syntax:

- ATX headings (`#` through `######`), paragraphs and simple block quotations.
- Flat bullet and numbered lists, and horizontal rules.
- Triple-backtick fenced code, preserving indentation and blank lines.
- Inline backtick code, `**bold**`, `*italic*` and `[label](destination)` links.

It is not a CommonMark parser. Nested lists, tables, images, task lists, reference
links, escaped delimiters, underscore emphasis, strikethrough, nested inline
formatting and balanced parentheses in link destinations are not supported.
Unsupported source can remain literal or receive partial formatting. Keep using
`Markdown` when the full existing Exact syntax is required; do not silently replace
it with the small parser for arbitrary user-authored Markdown.

The default Geist theme requires the real regular and italic faces. Copy both
`Geist.ttf` and `Geist-Italic.ttf` from `@rightui/ui/assets/fonts` into the app's
font assets, and declare them before using the theme-controlled renderer:

```contract
font "Geist"
  100 900 = "assets/fonts/Geist.ttf"
  100 900 italic = "assets/fonts/Geist-Italic.ttf"
```

If you override the body family, provide the styles that your content uses. Exact
does not synthesize an italic face for a custom font.

The document renderer accepts a prebuilt AST, so applications can use a parser
appropriate to their content instead. Supported block kinds are `paragraph`,
`heading`, `quote`, `list`, `rule` and `code`.

```contract
use MarkdownDocument, parseMarkdown from "@rightui/ui"

component Introduction
  view
    MarkdownDocument(id="intro", blocks=parseMarkdown("# Welcome\n\nUse **RightUI**."))
```

`MarkdownInline` contains `text`, `href`, `bold`, `italic` and `code`.
`MarkdownBlock` contains `kind`, `text`, `level`, `language`, `items` and `inlines`.
For paragraphs, quotations and headings, provide the inline runs; for code, provide
`text` and `language`; for lists, provide the item strings and use `level=1` for
numbered markers or `level=0` for bullets. `parseMarkdownInline(text)` produces the
same inline shape as the small parser.

Links use a restricted set of destinations: HTTP(S), `mailto:`, fragments and
root-relative paths. Other destinations render as plain text. HTML is never
inserted into the document. This restriction also applies to externally supplied
inline runs.
