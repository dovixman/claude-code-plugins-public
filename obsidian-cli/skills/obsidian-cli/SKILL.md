---
name: obsidian-cli
description: This skill should be used when the user asks to "obsidian", "obsidian cli", "vault search", "search vault", "search notes", "create note", "new note", "open note", "daily note", "append to note", "prepend to note", "read note", "list tasks", "manage tasks", "obsidian tasks", "check tasks", "obsidian tags", "obsidian bookmarks", "obsidian sync", "obsidian properties", "set property", "obsidian plugins", "obsidian templates", "insert template", "obsidian workspace", "obsidian search", "obsidian eval", "obsidian screenshot", "obsidian devtools", or any task involving the Obsidian CLI.
allowed-tools: "Bash(obsidian help:*), Bash(obsidian version:*), Bash(obsidian reload:*), Bash(obsidian restart:*), Bash(obsidian file:*), Bash(obsidian files:*), Bash(obsidian folder:*), Bash(obsidian folders:*), Bash(obsidian read:*), Bash(obsidian open:*), Bash(obsidian create:*), Bash(obsidian append:*), Bash(obsidian prepend:*), Bash(obsidian move:*), Bash(obsidian rename:*), Bash(obsidian daily:*), Bash(obsidian daily\\:append:*), Bash(obsidian daily\\:prepend:*), Bash(obsidian daily\\:read:*), Bash(obsidian daily\\:path:*), Bash(obsidian search:*), Bash(obsidian search\\:context:*), Bash(obsidian search\\:open:*), Bash(obsidian tasks:*), Bash(obsidian task:*), Bash(obsidian tags:*), Bash(obsidian tag:*), Bash(obsidian properties:*), Bash(obsidian property\\:set:*), Bash(obsidian property\\:read:*), Bash(obsidian aliases:*), Bash(obsidian backlinks:*), Bash(obsidian links:*), Bash(obsidian unresolved:*), Bash(obsidian orphans:*), Bash(obsidian deadends:*), Bash(obsidian bookmarks:*), Bash(obsidian bookmark:*), Bash(obsidian outline:*), Bash(obsidian diff:*), Bash(obsidian history:*), Bash(obsidian history\\:list:*), Bash(obsidian history\\:open:*), Bash(obsidian history\\:read:*), Bash(obsidian sync:*), Bash(obsidian sync\\:status:*), Bash(obsidian sync\\:history:*), Bash(obsidian sync\\:read:*), Bash(obsidian sync\\:open:*), Bash(obsidian sync\\:deleted:*), Bash(obsidian plugins:*), Bash(obsidian plugins\\:enabled:*), Bash(obsidian plugin :*), Bash(obsidian plugin\\:enable:*), Bash(obsidian plugin\\:disable:*), Bash(obsidian plugin\\:install:*), Bash(obsidian plugin\\:reload:*), Bash(obsidian themes:*), Bash(obsidian theme:*), Bash(obsidian theme\\:set:*), Bash(obsidian theme\\:install:*), Bash(obsidian snippets:*), Bash(obsidian snippets\\:enabled:*), Bash(obsidian snippet\\:enable:*), Bash(obsidian snippet\\:disable:*), Bash(obsidian vault:*), Bash(obsidian vaults:*), Bash(obsidian workspace:*), Bash(obsidian workspaces:*), Bash(obsidian workspace\\:save:*), Bash(obsidian workspace\\:load:*), Bash(obsidian tabs:*), Bash(obsidian tab\\:open:*), Bash(obsidian recents:*), Bash(obsidian wordcount:*), Bash(obsidian web:*), Bash(obsidian random:*), Bash(obsidian random\\:read:*), Bash(obsidian templates:*), Bash(obsidian template\\:read:*), Bash(obsidian template\\:insert:*), Bash(obsidian templater\\:create-from-template:*), Bash(obsidian bases:*), Bash(obsidian base\\:views:*), Bash(obsidian base\\:create:*), Bash(obsidian base\\:query:*), Bash(obsidian devtools:*), Bash(obsidian dev\\:debug:*), Bash(obsidian dev\\:errors:*), Bash(obsidian dev\\:console:*), Bash(obsidian dev\\:screenshot:*), Bash(obsidian dev\\:mobile:*), Bash(obsidian dev\\:css:*), Bash(obsidian dev\\:dom:*), Bash(obsidian dev\\:cdp:*), Bash(obsidian eval:*), Bash(obsidian commands:*), Bash(obsidian command:*), Bash(obsidian hotkeys:*), Bash(obsidian hotkey:*), Bash(which:*), Bash(ls:*), Read, Glob"
effort: low
---

# Obsidian CLI

## Step 1: Prerequisites

Run before any command:

```bash
which obsidian && obsidian version
```

If missing, stop and provide platform-specific fix:

| Platform | Fix |
|---|---|
| macOS | `sudo ln -sf /Applications/Obsidian.app/Contents/MacOS/obsidian-cli /usr/local/bin/obsidian` |
| Linux | Copy binary to `~/.local/bin/obsidian`, ensure `~/.local/bin` is in PATH |
| Windows | Restart terminal after CLI registration |

Requirements: Obsidian 1.12.7+ installer, CLI enabled in Settings → General, Obsidian app running.

## Step 2: Route Intent

Read the matching reference file before executing:

| Intent | Reference |
|---|---|
| Files: read, create, open, move, rename, delete | `references/files_and_folders.md` |
| Daily notes | `references/daily_notes.md` |
| Search | `references/search.md` |
| Tasks | `references/tasks.md` |
| Tags, properties, aliases | `references/metadata.md` |
| Bookmarks, backlinks, links, orphans | `references/links_bookmarks.md` |
| Sync, file history, diff | `references/sync_history.md` |
| Plugins, themes, snippets | `references/plugins_themes.md` |
| Workspaces, tabs, vault info | `references/workspace.md` |
| Templates | `references/templates.md` |
| Dev tools, eval, screenshots, CSS/DOM | `references/developer.md` |
| Bases | `references/bases.md` |
| help, version, reload, restart | Execute directly, no reference needed |

## Step 3: Execute

### Syntax

```
obsidian [vault=<name>] <command> [parameter=value ...] [flags]
```

- **Parameters**: `key=value`. Quote values with spaces: `content="Hello world"`
- **Flags**: boolean, no value: `open`, `overwrite`, `total`
- **Multiline**: `\n` for newline, `\t` for tab
- **Vault targeting**: `vault=<name>` as first arg when cwd is not inside the target vault
- **File targeting**: `file=<name>` (wikilink resolution) or `path=<path>` (exact vault-relative path)
- **Output formats**: `format=json|tsv|csv|md` on list commands
- **Clipboard**: `--copy` copies output to clipboard

### Execution Rules

1. Prefer `format=json` when parsing output programmatically.
2. On failure, run `obsidian help <command>` before retrying.
3. Prefer `file=<name>` over `path=<path>` unless user provides an exact path.
