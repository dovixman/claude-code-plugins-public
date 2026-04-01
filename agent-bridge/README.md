# agent-bridge

Bidirectional messaging between Claude Code sessions using channel notifications.

## How it works

Each Claude Code session runs its own MCP server over stdio and declares the `claude/channel` capability. The two server processes communicate through a shared mailbox directory on the filesystem. Messages are written as JSON files, polled every 1.5 seconds, and forwarded into Claude Code as `notifications/claude/channel` events.

## Prerequisites

- Claude Code with OAuth login (`/login`)
- The `tengu_harbor` feature flag enabled for your account
- `KAIROS` or `KAIROS_CHANNELS` compiled into your Claude Code build
- Launch with `--dangerously-load-development-channels`

## Install

```bash
claude plugin add /Users/dovixman/Downloads/agent-to-agent-mcp
```

## Launch

```bash
# Terminal 1
AGENT_BRIDGE_IDENTITY=alice claude --dangerously-load-development-channels plugin:agent-bridge@local

# Terminal 2
AGENT_BRIDGE_IDENTITY=bob claude --dangerously-load-development-channels plugin:agent-bridge@local
```

## Tools

| Tool | Description |
|------|-------------|
| `send_message` | Queue a message for another identity |
| `list_peers` | Show other inboxes and whether their heartbeat is fresh |
| `get_identity` | Return the current session identity |

## Notes

- Messages sent before the recipient starts remain queued in that identity's inbox.
- The plugin manifest lives at `.claude-plugin/plugin.json`, which is the canonical Claude Code location.
- Message files are only deleted after a channel notification succeeds, so transient delivery failures do not immediately drop queued messages.
