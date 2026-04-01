import { randomUUID } from "node:crypto";
import {
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const HEARTBEAT_INTERVAL_MS = 10_000;
const HEARTBEAT_STALE_MS = 30_000;
const POLL_INTERVAL_MS = 1_500;
const IDENTITY_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/;
const IDENTITY_DESCRIPTION = "alphanumeric, underscore or hyphen, max 64 chars";

interface BridgeMessage {
  content: string;
  from: string;
  timestamp: number;
  to: string;
}

interface SendMessageArguments {
  message: string;
  to: string;
}

function requireIdentity(): string {
  const value = process.env["AGENT_BRIDGE_IDENTITY"];
  if (!value) {
    process.stderr.write(
      "AGENT_BRIDGE_IDENTITY env var is required. Set it before launching Claude Code:\n" +
        "  AGENT_BRIDGE_IDENTITY=alice claude --dangerously-load-development-channels plugin:agent-bridge@local\n",
    );
    process.exit(1);
  }

  if (!isValidIdentity(value)) {
    process.stderr.write(
      `AGENT_BRIDGE_IDENTITY must be ${IDENTITY_DESCRIPTION}.\n`,
    );
    process.exit(1);
  }

  return value;
}

function isValidIdentity(value: string): boolean {
  return IDENTITY_PATTERN.test(value);
}

function getMailboxRoot(): string {
  const pluginDataDir = process.env["CLAUDE_PLUGIN_DATA"];
  if (pluginDataDir) {
    return join(pluginDataDir, "mailbox");
  }

  return join(process.env["HOME"] ?? ".", ".claude", "agent-bridge", "mailbox");
}

function buildInboxDir(mailboxRoot: string, currentIdentity: string): string {
  return join(mailboxRoot, currentIdentity);
}

function writeHeartbeatFile(heartbeatFile: string): void {
  writeFileSync(heartbeatFile, String(Date.now()));
}

function removeFileIfPresent(filePath: string): void {
  try {
    unlinkSync(filePath);
  } catch {
    // The file may already be gone during shutdown.
  }
}

function isPeerActive(mailboxRoot: string, peerIdentity: string): boolean {
  const heartbeatPath = join(mailboxRoot, peerIdentity, ".heartbeat");

  try {
    const timestamp = Number(readFileSync(heartbeatPath, "utf-8").trim());
    return Number.isFinite(timestamp) && Date.now() - timestamp < HEARTBEAT_STALE_MS;
  } catch {
    return false;
  }
}

function createMessageFile(
  mailboxRoot: string,
  fromIdentity: string,
  args: SendMessageArguments,
): { from: string; queued: true; to: string } {
  const recipientDir = join(mailboxRoot, args.to);
  mkdirSync(recipientDir, { recursive: true });

  const timestamp = Date.now();
  const filename = `${timestamp}-${fromIdentity}-${randomUUID()}.json`;
  const tempPath = join(recipientDir, `.${filename}.tmp`);
  const finalPath = join(recipientDir, filename);
  const message: BridgeMessage = {
    content: args.message,
    from: fromIdentity,
    timestamp,
    to: args.to,
  };

  writeFileSync(tempPath, JSON.stringify(message));
  renameSync(tempPath, finalPath);

  return { from: fromIdentity, queued: true, to: args.to };
}

function listPeerStatuses(
  mailboxRoot: string,
  currentIdentity: string,
): Array<{ active: boolean; name: string }> {
  try {
    return readdirSync(mailboxRoot, { withFileTypes: true })
      .filter(entry => entry.isDirectory() && entry.name !== currentIdentity)
      .map(entry => ({
        active: isPeerActive(mailboxRoot, entry.name),
        name: entry.name,
      }));
  } catch {
    return [];
  }
}

function listPendingMessageFiles(inboxDir: string): string[] {
  try {
    return readdirSync(inboxDir)
      .filter(fileName => fileName.endsWith(".json") && !fileName.startsWith("."))
      .sort()
      .map(fileName => join(inboxDir, fileName));
  } catch {
    return [];
  }
}

function parseMessageFile(filePath: string): BridgeMessage | null {
  try {
    const parsed = JSON.parse(readFileSync(filePath, "utf-8")) as Partial<BridgeMessage>;

    if (
      typeof parsed.content !== "string" ||
      typeof parsed.from !== "string" ||
      typeof parsed.to !== "string" ||
      typeof parsed.timestamp !== "number"
    ) {
      return null;
    }

    return {
      content: parsed.content,
      from: parsed.from,
      timestamp: parsed.timestamp,
      to: parsed.to,
    };
  } catch {
    return null;
  }
}

function readSendMessageArguments(value: unknown): SendMessageArguments | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  if (typeof candidate["to"] !== "string" || typeof candidate["message"] !== "string") {
    return null;
  }

  return {
    message: candidate["message"],
    to: candidate["to"],
  };
}

const identity = requireIdentity();
const mailboxRoot = getMailboxRoot();
const inboxDir = buildInboxDir(mailboxRoot, identity);
const heartbeatFile = join(inboxDir, ".heartbeat");

mkdirSync(mailboxRoot, { recursive: true });
mkdirSync(inboxDir, { recursive: true });
writeHeartbeatFile(heartbeatFile);

const server = new Server(
  { name: "agent-bridge", version: "0.1.0" },
  {
    capabilities: {
      tools: {},
      experimental: {
        "claude/channel": {},
      },
    },
  },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "send_message",
      description: "Send a message to another Claude Code session.",
      inputSchema: {
        type: "object" as const,
        properties: {
          to: {
            type: "string",
            description: "Recipient identity.",
          },
          message: {
            type: "string",
            description: "Message content to send.",
          },
        },
        required: ["to", "message"],
      },
    },
    {
      name: "list_peers",
      description: "List other identities and whether their heartbeat is fresh.",
      inputSchema: {
        type: "object" as const,
        properties: {},
      },
    },
    {
      name: "get_identity",
      description: "Return this session's configured identity.",
      inputSchema: {
        type: "object" as const,
        properties: {},
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async request => {
  const { name } = request.params;

  if (name === "send_message") {
    const args = readSendMessageArguments(request.params.arguments);
    if (!args) {
      return {
        content: [{ type: "text", text: "Both 'to' and 'message' are required." }],
        isError: true,
      };
    }

    if (args.to === identity) {
      return {
        content: [{ type: "text", text: "Cannot send a message to yourself." }],
        isError: true,
      };
    }

    if (!isValidIdentity(args.to)) {
      return {
        content: [
          {
            type: "text",
            text: `Recipient identity must be ${IDENTITY_DESCRIPTION}.`,
          },
        ],
        isError: true,
      };
    }

    const queued = createMessageFile(mailboxRoot, identity, args);
    return {
      content: [{ type: "text", text: JSON.stringify(queued) }],
    };
  }

  if (name === "list_peers") {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ identity, peers: listPeerStatuses(mailboxRoot, identity) }),
        },
      ],
    };
  }

  if (name === "get_identity") {
    return {
      content: [{ type: "text", text: JSON.stringify({ identity }) }],
    };
  }

  return {
    content: [{ type: "text", text: `Unknown tool: ${name}` }],
    isError: true,
  };
});

let heartbeatTimer: ReturnType<typeof setInterval> | undefined;
let pollTimer: ReturnType<typeof setInterval> | undefined;
let isShuttingDown = false;

let isForwardingMessages = false;

async function forwardPendingMessages(): Promise<void> {
  if (isForwardingMessages) {
    return;
  }

  isForwardingMessages = true;
  try {
    for (const filePath of listPendingMessageFiles(inboxDir)) {
      const message = parseMessageFile(filePath);
      if (!message) {
        removeFileIfPresent(filePath);
        continue;
      }

      try {
        await server.notification({
          method: "notifications/claude/channel",
          params: {
            content: message.content,
            meta: {
              from: message.from,
              timestamp: String(message.timestamp),
            },
          },
        });
        removeFileIfPresent(filePath);
      } catch (error) {
        process.stderr.write(`[agent-bridge] Failed to forward message: ${String(error)}\n`);
        return;
      }
    }
  } finally {
    isForwardingMessages = false;
  }
}

function startHeartbeat(): void {
  heartbeatTimer = setInterval(() => {
    writeHeartbeatFile(heartbeatFile);
  }, HEARTBEAT_INTERVAL_MS);
}

function startPolling(): void {
  pollTimer = setInterval(() => {
    void forwardPendingMessages();
  }, POLL_INTERVAL_MS);
}

function shutdown(): void {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
  }
  if (pollTimer) {
    clearInterval(pollTimer);
  }

  removeFileIfPresent(heartbeatFile);
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
process.stdin.on("end", shutdown);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  startHeartbeat();
  startPolling();
  process.stderr.write(`[agent-bridge] Started as "${identity}" using mailbox ${mailboxRoot}\n`);
}

main().catch(error => {
  process.stderr.write(`[agent-bridge] Fatal: ${String(error)}\n`);
  shutdown();
});
