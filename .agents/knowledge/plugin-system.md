# Plugin System

## Repository Scope
- Multi-plugin repository. Agent-bridge is the first plugin; more will be added.
- Marketplace manifest at `.claude-plugin/marketplace.json` lists all plugins with `source` paths.
- Each plugin lives in its own top-level directory (e.g., `agent-bridge/`).
- All plugins share the same stack conventions: Bun runtime, strict TypeScript, exact dependency pinning.

## Plugin Structure
- Each plugin has its own `.claude-plugin/plugin.json` declaring name, version, description, and capabilities.
- Each plugin has its own `.mcp.json` declaring MCP server launch configuration.
- `${CLAUDE_PLUGIN_ROOT}` env var resolves to the plugin's directory at runtime — use it in `.mcp.json` commands and hook scripts.
- `${CLAUDE_PLUGIN_DATA}` env var points to plugin-specific persistent storage directory (provided by Claude Code).

## Channel Declarations
- Channels are declared in `plugin.json` under the `channels` array, referencing MCP server names from `.mcp.json`.
- The MCP server must declare `experimental: { "claude/channel": {} }` in its capabilities to enable channel notifications.
- Channel notifications are pushed via `server.notification({ method: "notifications/claude/channel", params: { content, meta } })`.
- Channels are the delivery mechanism: the MCP server pushes notifications into the Claude Code session. The filesystem coordinates between independent MCP server instances.
- Channels feature is in research preview — requires `--dangerously-load-development-channels` flag and feature gates (`tengu_harbor`, `KAIROS`/`KAIROS_CHANNELS`).

## Hooks
- Hook definitions live in `hooks/hooks.json` within each plugin directory.
- `SessionStart` hook fires when a Claude Code session begins with the plugin loaded.
- Hook scripts in `hooks/scripts/` receive plugin context via env vars (`CLAUDE_PLUGIN_ROOT`, `CLAUDE_PLUGIN_DATA`).
- Agent-bridge uses SessionStart to inject the communication protocol playbook and peer list into every session.

## Skills
- Skills are markdown-only prompt templates, not executable code.
- Directory structure: `skills/{skill-name}/SKILL.md` — the directory name is the skill's invocation name.
- `SKILL.md` uses YAML frontmatter with `name` and `description` fields.
- The description field determines when Claude Code suggests the skill — write it for discoverability.
- Skill body contains instructions that Claude follows when the skill is invoked.
- Agents commonly get the directory structure wrong — each skill MUST be in its own subdirectory under `skills/`.

## Versioning
- Plugin version must be kept in sync across two files: `package.json` and `.claude-plugin/plugin.json`. — Why: Claude Code reads `plugin.json` for the plugin version; `package.json` is the canonical source for the Bun ecosystem. Mismatch causes confusion.
- Marketplace version (`.claude-plugin/marketplace.json`) is separate from individual plugin versions.
- When bumping a plugin version, always update both files in the same commit.

## References
- Reference files in `references/` are injected into agent context by hooks or skills.
- `agent-communication.md` is the communication protocol playbook — describes tools, message flow, and guidelines for multi-agent collaboration.
- Reference files are agent-facing documentation, not user-facing. Write them as instructions Claude will follow.
