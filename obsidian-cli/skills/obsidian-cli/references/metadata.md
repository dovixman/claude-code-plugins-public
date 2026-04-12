# Tags, Properties, Aliases

## Tags

```bash
obsidian tags [file=<name>] [path=<path>] [sort=count] [total] [counts] [format=json|tsv|csv] [active]
obsidian tag name=<tag> [total] [verbose]
```

- `counts` includes occurrence counts. `sort=count` sorts by frequency.
- `verbose` on `tag` includes file list.

## Properties

```bash
obsidian properties [file=<name>] [path=<path>] [name=<name>] [sort=count] [format=yaml|json|tsv] [total] [counts] [active]
obsidian property:set name=<name> value=<value> [type=text|list|number|checkbox|date|datetime] [file=<name>] [path=<path>]
obsidian property:read name=<name> [file=<name>] [path=<path>]
obsidian property:remove name=<name> [file=<name>] [path=<path>]
```

## Aliases

```bash
obsidian aliases [file=<name>] [path=<path>] [total] [verbose] [active]
```
