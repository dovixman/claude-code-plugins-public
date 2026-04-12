# Architecture

## Messaging System
- Filesystem-based message queue with polling delivery. — Why: Claude Code channels are the delivery mechanism (server pushes notifications to session), but each plugin runs as an independent MCP server instance with no shared memory. The filesystem is the only coordination layer between separate MCP processes.
- Messages written as JSON files to recipient's inbox directory (`mailbox/{identity}/`).
- Atomic write pattern: write to `.tmp` file, then `renameSync` to final path. — Why: prevents readers from seeing partially-written JSON during polling.
- Message filename format: `{timestamp}-{fromIdentity}-{uuid}.json` — alphabetical sort ensures FIFO delivery order per sender.
- Malformed message files are logged to stderr, deleted, and skipped. Failed notification sends stop forwarding — message stays queued for retry on next poll cycle.

## Timing Constants
- Heartbeat write interval: 10s (`HEARTBEAT_INTERVAL_MS`). — Why: frequent enough to detect stale peers quickly, infrequent enough to minimize disk writes.
- Stale peer threshold: 30s (`HEARTBEAT_STALE_MS`). — Why: ~3 missed heartbeats before declaring a peer inactive.
- Poll interval: 1.5s (`POLL_INTERVAL_MS`). — Why: balance between message delivery latency and CPU/disk usage for a development tool.
- These constants are tuned for local development use, not production workloads.

## Security Model
- Designed exclusively for trusted local environments. No authentication, encryption, or sender verification.
- Security boundary is OS-level file permissions on the mailbox directory.
- Identity is self-declared via `AGENT_BRIDGE_IDENTITY` env var — no cryptographic signing.
- Any process with filesystem access to the mailbox can inject messages. This is by design for local multi-agent workflows.

## Data Flow Invariants
- Each agent owns one inbox directory; reads only from its own inbox, writes to any peer's inbox.
- Messages are point-to-point (one sender, one recipient). No broadcast or multicast.
- Messages survive recipient being offline — queued on disk until delivered.
- Messages deleted from disk only after successful channel notification delivery.
- Agent cleans up only its own inbox on shutdown (`rmSync`). Orphaned inboxes from crashed agents are not auto-cleaned.

## Concurrency
- `isForwardingMessages` re-entrancy guard prevents overlapping poll cycles. — Why: `server.notification()` is async; without the guard, slow delivery causes duplicate polling.
- Heartbeat writes are fire-and-forget (`writeFileSync` — synchronous, no atomicity needed for a single timestamp).

## Development Conventions
- Runtime: Bun (not Node.js). All scripts use `bun run`.
- TypeScript with ultra-strict config: `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`.
- Dependencies pinned to exact versions in `bun.lock`. — Why: supply chain safety.
- No automated test suite. Validation is manual integration testing via terminal.
- Single-file architecture (`server.ts`). Functions are the unit of organization, not files/modules.
- Node built-in imports use `node:` prefix (`node:crypto`, `node:fs`, `node:path`).
- Commit format: `type(scope): message` — types: `feat`, `fix`, `chore`, `docs`, `refactor`. Scope is typically the plugin name.
