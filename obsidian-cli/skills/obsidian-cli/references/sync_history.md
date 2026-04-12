# Sync and File History

## Diff

```bash
obsidian diff [file=<name>] [path=<path>] [from=<n>] [to=<n>] [filter=local|sync]
```

- No `from`/`to`: lists all versions (numbered newest → oldest).
- `from` only: compares version to current file.
- `from` + `to`: compares two versions.

## Local File Recovery

```bash
obsidian history [file=<name>] [path=<path>]
obsidian history:list
obsidian history:read [file=<name>] [path=<path>] [version=<n>]
obsidian history:restore version=<n> [file=<name>] [path=<path>]
obsidian history:open [file=<name>] [path=<path>]
```

Default `version`: 1 (most recent).

## Sync

```bash
obsidian sync on|off
obsidian sync:status
obsidian sync:history [file=<name>] [path=<path>] [total]
obsidian sync:read version=<n> [file=<name>] [path=<path>]
obsidian sync:restore version=<n> [file=<name>] [path=<path>]
obsidian sync:open [file=<name>] [path=<path>]
obsidian sync:deleted [total]
```
