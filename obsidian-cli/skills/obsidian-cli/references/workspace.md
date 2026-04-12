# Workspace and Vault

## Vault

```bash
obsidian vault [info=name|path|files|folders|size]
obsidian vaults [total] [verbose]
obsidian vault:open name=<name>
```

`vault:open` is TUI only. `verbose` includes vault paths.

## Workspaces

```bash
obsidian workspace [ids]
obsidian workspaces [total]
obsidian workspace:save [name=<name>]
obsidian workspace:load name=<name>
obsidian workspace:delete name=<name>
```

## Tabs

```bash
obsidian tabs [ids]
obsidian tab:open [group=<id>] [file=<path>] [view=<type>]
obsidian recents [total]
```

## Word Count

```bash
obsidian wordcount [file=<name>] [path=<path>] [words] [characters]
```

## Web Viewer

```bash
obsidian web url=<url> [newtab]
```

## Random Note

```bash
obsidian random [folder=<path>] [newtab]
obsidian random:read [folder=<path>]
```

## Unique Note

```bash
obsidian unique [name=<text>] [content=<text>] [paneType=tab|split|window] [open]
```
