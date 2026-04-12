---
name: obsidian-cli
description: This skill should be used when the user asks to "obsidian", "obsidian cli", "vault search", "search vault", "search notes", "create note", "new note", "open note", "daily note", "append to note", "prepend to note", "read note", "list tasks", "manage tasks", "obsidian tasks", "check tasks", "obsidian tags", "obsidian bookmarks", "obsidian sync", "obsidian publish", "obsidian properties", "set property", "obsidian plugins", "obsidian templates", "insert template", "obsidian workspace", "obsidian search", "obsidian eval", "obsidian screenshot", "obsidian devtools", or any task involving the Obsidian CLI.
allowed-tools: "Bash(obsidian:*), Bash(which:*), Bash(ls:*), Read, Glob, AskUserQuestion"
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
| Sync, file history, diff, restore | `references/sync_history.md` |
| Publish | `references/publish.md` |
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

1. Confirm with user before `delete`, `move`, `rename`, `property:remove`.
2. Prefer `format=json` when parsing output programmatically.
3. On failure, run `obsidian help <command>` before retrying.
4. Prefer `file=<name>` over `path=<path>` unless user provides an exact path.
5. For batch operations, show the plan and confirm before executing.
