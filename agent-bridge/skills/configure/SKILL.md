---
name: configure
description: Configure the agent-bridge plugin identity and show launch instructions for bidirectional messaging between Claude Code sessions
---

Check the current agent-bridge configuration and help the user set up their identity.

## When called without arguments or with "status"

1. Read the current `AGENT_BRIDGE_IDENTITY` environment variable
2. Check if `${CLAUDE_PLUGIN_DATA}/mailbox/` exists and list any peer directories
3. Report:
   - Current identity (or "not set" if env var is missing)
   - Active peers (check `.heartbeat` files — active if timestamp < 30s ago)
   - Mailbox location

## When called with "set <name>"

1. Explain that the identity is set via environment variable at launch time, not persisted
2. Show the user the exact launch commands:

```bash
# Terminal 1
AGENT_BRIDGE_IDENTITY=<name> claude --dangerously-load-development-channels plugin:agent-bridge@local

# Terminal 2
AGENT_BRIDGE_IDENTITY=<other-name> claude --dangerously-load-development-channels plugin:agent-bridge@local
```

## Prerequisites

Remind the user of required gates:
- Must be logged in via `/login` (OAuth required)
- The `tengu_harbor` feature flag must be enabled for their account
- The `KAIROS` or `KAIROS_CHANNELS` build-time feature must be compiled in

## Tips

- Each terminal needs a unique identity name (e.g., "alice" and "bob", or "frontend" and "backend")
- Messages sent before the recipient starts are queued and delivered when they come online
- Use `list_peers` tool to see who else is connected
- Use `send_message` tool to send messages to other sessions
