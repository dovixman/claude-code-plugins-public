# agent-bridge

Bidirectional messaging between Claude Code sessions using channel notifications.

## How it works

Each Claude Code session runs its own MCP server over stdio and declares the `claude/channel` capability. The two server processes communicate through a shared mailbox directory on the filesystem. Messages are written as JSON files, polled every 1.5 seconds, and forwarded into Claude Code as `notifications/claude/channel` events.

## Prerequisites

- Claude Code with OAuth login (`/login`)
- Launch with `--dangerously-load-development-channels`

## Install

```bash
claude plugin install agent-bridge@dovixman-plugins-public
```

## Launch

```bash
# Terminal 1
AGENT_BRIDGE_IDENTITY=alice claude --dangerously-load-development-channels plugin:agent-bridge@dovixman-plugins-public

# Terminal 2
AGENT_BRIDGE_IDENTITY=bob claude --dangerously-load-development-channels plugin:agent-bridge@dovixman-plugins-public
```

Optionally set `AGENT_BRIDGE_ROLE` to describe the agent's specialization (e.g., `"code reviewer"`, `"frontend developer"`). Peers will see this role in `list_peers` and on session startup.

```bash
AGENT_BRIDGE_IDENTITY=alice AGENT_BRIDGE_ROLE="tech lead" claude --dangerously-load-development-channels plugin:agent-bridge@dovixman-plugins-public
```

## Tools

| Tool | Description |
|------|-------------|
| `send_message` | Queue a message for another identity |
| `list_peers` | Show other inboxes and whether their heartbeat is fresh |
| `get_identity` | Return the current session identity |

## Security Model

Designed for **trusted local environments**. Only run with peers you trust.

- All peers sharing the mailbox directory are fully trusted
- Identity is self-declared via env var — no authentication
- Messages are forwarded as-is (no content filtering)
- Security boundary is OS file permissions on the mailbox directory
- Messages are capped at 256KB

## Notes

- Messages sent before the recipient starts remain queued in that identity's inbox.
- The plugin manifest lives at `.claude-plugin/plugin.json`, which is the canonical Claude Code location.
- Message files are only deleted after a channel notification succeeds, so transient delivery failures do not immediately drop queued messages.
