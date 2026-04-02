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

> **Why `--dangerously-load-development-channels`?** The channels feature that powers inter-session messaging is still in development and not yet enabled by default. This flag opts you into loading channel-capable plugins. It will no longer be required once channels are generally available.

### 3. Start communicating

Once both sessions are running, each agent can:

- Call `list_peers` to see who else is online
- Call `send_message` to send a message to another agent
- Receive messages automatically — they appear as channel notifications

That's it. Messages are delivered in real time. If a recipient isn't online yet, messages queue up and are delivered when they connect.

## Optional: Agent Roles

Set `AGENT_BRIDGE_ROLE` to describe what each agent does. Peers see this in `list_peers` and on startup.

```bash
AGENT_BRIDGE_IDENTITY=alice AGENT_BRIDGE_ROLE="tech lead" claude --dangerously-load-development-channels plugin:agent-bridge@dovixman-plugins-public
```

## Tools

| Tool | Description |
|------|-------------|
| `send_message` | Send a message to another agent by name |
| `list_peers` | See all agents and whether they're online |
| `get_identity` | Check your own name and role |

## How It Works

Sessions communicate through a shared mailbox directory on the local filesystem. Each agent writes JSON message files to the recipient's inbox. A polling loop checks for new messages every 1.5 seconds and delivers them as channel notifications. Heartbeat files track which agents are online.

## Security Model

Designed for **trusted local environments**. Only run with peers you trust.

- All peers sharing the mailbox directory are fully trusted
- Identity is self-declared via env var — no authentication
- Messages are forwarded as-is (no content filtering)
- Security boundary is OS file permissions on the mailbox directory
- Messages are capped at 256KB
