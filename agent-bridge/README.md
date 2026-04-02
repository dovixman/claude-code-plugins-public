# agent-bridge

Let multiple Claude Code sessions talk to each other. Open two (or more) terminals, give each one a name, and they can send messages back and forth in real time.

## Quick Start

### 1. Install the plugin

```bash
claude plugin install agent-bridge@dovixman-plugins-public
```

### 2. Open two terminals and launch Claude Code in each

Terminal 1:

```bash
AGENT_BRIDGE_IDENTITY=alice claude --dangerously-load-development-channels plugin:agent-bridge@dovixman-plugins-public
```

Terminal 2:

```bash
AGENT_BRIDGE_IDENTITY=bob claude --dangerously-load-development-channels plugin:agent-bridge@dovixman-plugins-public
```

Each session gets a unique name via `AGENT_BRIDGE_IDENTITY`. This is how agents find and message each other.

> **Why `--dangerously-load-development-channels`?** The [channels feature](https://code.claude.com/docs/en/channels) that powers inter-session messaging is still in [research preview](https://code.claude.com/docs/en/channels#research-preview) and not yet enabled by default. This flag [bypasses the approved allowlist](https://code.claude.com/docs/en/channels-reference#test-during-the-research-preview) for local testing. It will no longer be required once channels are generally available. On Team and Enterprise plans, an admin must [explicitly enable channels](https://code.claude.com/docs/en/channels#enterprise-controls) first.

### 3. Start communicating

Once both sessions are running, each agent can:

- Call `list_peers` to see who else is online
- Call `send_message` to send a message to another agent
- Receive messages automatically — they appear as [channel notifications](https://code.claude.com/docs/en/channels-reference#notification-format)

That's it. Messages are delivered in real time. If a recipient isn't online yet, messages queue up and are delivered when they connect.

## Tools

| Tool | Description |
|------|-------------|
| `send_message` | Send a message to another agent by name |
| `list_peers` | See all agents and whether they're online |
| `get_identity` | Check your own name |

## How It Works

Sessions communicate through a shared mailbox directory on the local filesystem. Each agent writes JSON message files to the recipient's inbox. A polling loop checks for new messages every 1.5 seconds and delivers them as [channel notifications](https://code.claude.com/docs/en/channels-reference#notification-format). Heartbeat files track which agents are online.

Under the hood, agent-bridge is an MCP server that declares the [`claude/channel` capability](https://code.claude.com/docs/en/channels-reference#server-options) and exposes MCP tools for sending messages. For more on how channels work, see the [Channels Reference](https://code.claude.com/docs/en/channels-reference).

## Security Model

Designed for **trusted local environments**. Only run with peers you trust.

- All peers sharing the mailbox directory are fully trusted
- Identity is self-declared via env var — no authentication
- Messages are forwarded as-is — no [sender gating](https://code.claude.com/docs/en/channels-reference#gate-inbound-messages) or content filtering
- Security boundary is OS file permissions on the mailbox directory
- Messages are capped at 256KB

For production or multi-user deployments, the official docs recommend implementing [sender allowlists](https://code.claude.com/docs/en/channels-reference#gate-inbound-messages) to prevent prompt injection. This plugin intentionally skips that since all peers are local and trusted.

## See Also

- [Channels](https://code.claude.com/docs/en/channels) — overview, supported channels, and enterprise controls
- [Channels Reference](https://code.claude.com/docs/en/channels-reference) — full API: server options, notification format, reply tools, sender gating, and permission relay
- [Plugins](https://code.claude.com/docs/en/plugins) — how Claude Code plugins work and how to package a channel as a plugin
