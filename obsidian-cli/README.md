# obsidian-cli

Claude Code plugin for the [Obsidian CLI](https://obsidian.md/help/cli). Control Obsidian from the terminal for note management, search, task tracking, sync, publish, and developer workflows.

## Prerequisites

- [Obsidian](https://obsidian.md) 1.12.7+ installer
- CLI enabled in **Settings → General → Command line interface**
- Obsidian app must be running

## Install

```bash
claude plugins:install obsidian-cli
```

## What it does

Provides a single skill that routes to the appropriate Obsidian CLI commands based on your intent:

- **Files**: create, read, open, move, rename, delete notes
- **Daily notes**: open, read, append, prepend
- **Search**: full-text vault search with context
- **Tasks**: list, filter, toggle, update tasks
- **Metadata**: tags, properties, aliases
- **Links**: backlinks, outgoing links, orphans, bookmarks
- **Sync & history**: sync control, file versions, diff, restore
- **Publish**: site status, publish/unpublish files
- **Plugins & themes**: install, enable, disable, reload
- **Workspaces**: save, load, manage layouts
- **Templates**: list, read, insert
- **Developer**: devtools, eval, screenshots, CSS/DOM inspection
- **Bases**: query, create items in Obsidian Bases

## Examples

```
> search my vault for meeting notes
> add a task to my daily note: buy groceries
> list all incomplete tasks
> create a note called "Sprint Review" from the Meeting template
> show tags sorted by count
> take a screenshot of obsidian
```
