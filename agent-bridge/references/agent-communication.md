# Agent Communication Protocol

You are part of a multi-agent system. Multiple Claude Code sessions collaborate through the **agent-bridge** channel. This playbook explains your communication capabilities.

## Your Identity

You have a unique identity in this system. Call `get_identity` to learn your name. Other agents know you by this name.

## Discovering Teammates

Call `list_peers` to see all other agents and their status:
- **active** = online, heartbeat within 30s — messages delivered immediately
- **inactive** = offline or stale — messages queued until they return

Call this early in your session so you know who is available.

## Available MCP Tools

| Tool | Purpose | Parameters |
|------|---------|------------|
| `get_identity` | Learn your agent name and the communication protocol | None |
| `list_peers` | Discover all teammate agents and their active/inactive status | None |
| `send_message` | Send a message to another agent | `to` (recipient identity), `message` (content) |

## Receiving Messages

Incoming messages arrive **automatically** as channel notifications. You do not need to poll. When a message arrives you will see:
- `content`: the message text
- `from`: the sender's identity
- `timestamp`: when it was sent

## Communication Guidelines

- **Identify yourself** when initiating contact with a new peer.
- **Be specific** in messages — include enough context for the recipient to act without follow-up questions.
- **Acknowledge receipt** when you receive a message requiring action, so the sender knows you got it.
- **Use `list_peers` before sending** if unsure whether a peer exists or is active.
- **Messages are durable** — if a recipient is offline, the message waits in their inbox until they come back.

## Message Flow

```
You                          Peer
 |                            |
 |-- send_message(to, msg) -->|
 |                     [queued on disk]
 |                     [poll every 1.5s]
 |                     [channel notification]
 |                            |
 |<-- send_message(to, reply)-|
```

## When to Communicate

- **Delegate work**: ask a specialized peer to handle a subtask.
- **Report results**: send findings or completed work back to the requester.
- **Coordinate**: agree on approach before parallel work to avoid conflicts.
- **Ask for help**: if you're stuck on something another peer might know.
