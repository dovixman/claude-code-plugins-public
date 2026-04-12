# Links and Bookmarks

## Links

```bash
obsidian backlinks [file=<name>] [path=<path>] [counts] [total] [format=json|tsv|csv]
obsidian links [file=<name>] [path=<path>] [total]
obsidian unresolved [total] [counts] [verbose] [format=json|tsv|csv]
obsidian orphans [total]
obsidian deadends [total]
```

- `unresolved verbose` includes source files.
- `orphans` — files with no incoming links.
- `deadends` — files with no outgoing links.

## Bookmarks

```bash
obsidian bookmarks [total] [verbose] [format=json|tsv|csv]
obsidian bookmark [file=<path>] [subpath=<subpath>] [folder=<path>] [search=<query>] [url=<url>] [title=<title>]
```

Can bookmark files, folders, search queries, or URLs. `subpath` targets a heading or block.

## Outline

```bash
obsidian outline [file=<name>] [path=<path>] [format=tree|md|json] [total]
```
