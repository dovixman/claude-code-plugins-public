# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Plugin Overview

The `obsidian-cli` plugin wraps the Obsidian command-line interface, enabling Claude Code to control Obsidian from the terminal for note management, search, task tracking, sync, publish, and developer workflows.

## Architecture

```
obsidian-cli/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   └── obsidian-cli/
│       ├── SKILL.md              # Main skill with prerequisites and routing
│       └── references/
│           ├── files_and_folders.md
│           ├── daily_notes.md
│           ├── search.md
│           ├── tasks.md
│           ├── metadata.md
│           ├── links_bookmarks.md
│           ├── sync_history.md
│           ├── publish.md
│           ├── plugins_themes.md
│           ├── workspace.md
│           ├── templates.md
│           ├── developer.md
│           └── bases.md
├── CLAUDE.md
└── README.md
```

The skill uses reference-based routing: SKILL.md identifies user intent and loads the relevant reference file before executing commands.

## Skill Inventory

| Skill | Trigger | Description |
|---|---|---|
| `obsidian-cli` | "obsidian", "vault search", "create note", "daily note", "obsidian tasks" | Routes to appropriate Obsidian CLI commands based on user intent |

## Design Patterns

- **Reference-based routing**: SKILL.md identifies user intent and loads the matching reference file.
- **Prerequisite gate**: Always checks for `obsidian` binary before any operation.
- **Permission-based safety**: Destructive commands (`delete`, `property:remove`, `publish:remove`, `workspace:delete`, etc.) are excluded from `allowed-tools` — the runtime prompts the user for permission.

## Development

### Testing locally
```bash
claude plugins:install ./obsidian-cli
```

### Version management
Update version in `.claude-plugin/plugin.json` when making changes.

## Adding New Command Categories

1. Create a reference file in `skills/obsidian-cli/references/<category>.md`
2. Add a routing entry in SKILL.md Step 2 intent table
3. Reference files document command syntax, parameters, flags, and examples
4. Keep SKILL.md focused on routing logic — command details belong in reference files

Parent repository conventions apply — see `../CLAUDE.md` for plugin structure details and git conventions.
