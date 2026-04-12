# Search

```bash
obsidian search query=<text> [path=<folder>] [limit=<n>] [format=text|json] [total] [case]
obsidian search:context query=<text> [path=<folder>] [limit=<n>] [format=text|json] [case]
obsidian search:open [query=<text>]
```

- `search` returns matching file paths.
- `search:context` returns grep-style `path:line: text` output.
- `search:open` opens the search view in Obsidian UI.
- `total` returns match count only.
- `case` enables case-sensitive search.
