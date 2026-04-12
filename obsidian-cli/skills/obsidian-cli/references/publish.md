# Publish

```bash
obsidian publish:site
obsidian publish:list [total]
obsidian publish:status [total] [new] [changed] [deleted]
obsidian publish:add [file=<name>] [path=<path>] [changed]
obsidian publish:remove [file=<name>] [path=<path>]
obsidian publish:open [file=<name>] [path=<path>]
```

- `publish:status` filters by change type: `new`, `changed`, `deleted`.
- `publish:add changed` publishes all changed files.
- Defaults to active file when no `file`/`path` provided.
