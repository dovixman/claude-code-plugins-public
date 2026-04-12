# Tasks

## List

```bash
obsidian tasks [file=<name>] [path=<path>] [status="<char>"] [total] [done] [todo] [verbose] [format=json|tsv|csv] [active] [daily]
```

| Flag | Effect |
|---|---|
| `done` | Completed tasks only |
| `todo` | Incomplete tasks only |
| `verbose` | Group by file with line numbers |
| `active` | Active file tasks only |
| `daily` | Daily note tasks only |
| `status="<char>"` | Filter by custom status (quote special chars: `'status=?'`) |

## Show / Update

```bash
obsidian task [ref=<path:line>] [file=<name>] [path=<path>] [line=<n>] [status="<char>"] [toggle] [daily] [done] [todo]
```

- `ref="Recipe.md:8"` is shorthand for file + line.
- `toggle` flips completion status.
- `done` → `[x]`, `todo` → `[ ]`, `status=-` → `[-]`.
