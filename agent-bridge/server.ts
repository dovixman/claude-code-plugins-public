import { randomUUID } from "node:crypto";
import {
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
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
const MAX_MESSAGE_SIZE = 256 * 1024;

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

  const home = process.env["HOME"];
  if (!home) {
    process.stderr.write("HOME env var is required when CLAUDE_PLUGIN_DATA is not set.\n");
    process.exit(1);
  }

  return join(home, ".claude", "agent-bridge", "mailbox");
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
      process.stderr.write(`[agent-bridge] Malformed message file, skipping: ${filePath}\n`);
      return null;
    }

    return {
      content: parsed.content,
      from: parsed.from,
      timestamp: parsed.timestamp,
      to: parsed.to,
    };
  } catch (error) {
    process.stderr.write(`[agent-bridge] Failed to parse message file: ${filePath}: ${String(error)}\n`);
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
      description:
        "Send a message to another agent in your team. You are part of a multi-agent system where multiple Claude Code sessions collaborate via the agent-bridge channel. Use list_peers to discover available teammates before sending. Messages are queued and delivered even if the recipient is temporarily offline.",
      inputSchema: {
        type: "object" as const,
        properties: {
          to: {
            type: "string",
            description:
              "Recipient agent identity (use list_peers to discover available agents).",
          },
          message: {
            type: "string",
            description:
              "Message content. Be specific — include enough context for the recipient to act without follow-up questions.",
            maxLength: MAX_MESSAGE_SIZE,
          },
        },
        required: ["to", "message"],
      },
    },
    {
      name: "list_peers",
      description:
        "Discover your teammate agents. Returns all other agents in the system and whether they are currently active (heartbeat within 30s). Call this early in your session to understand who you can collaborate with. You can send messages to any listed peer using send_message.",
      inputSchema: {
        type: "object" as const,
        properties: {},
      },
    },
    {
      name: "get_identity",
      description:
        "Get your agent identity and a summary of the communication protocol. Call this to learn your name and how to collaborate with other agents in the system.",
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

    if (Buffer.byteLength(args.message, "utf-8") > MAX_MESSAGE_SIZE) {
      return {
        content: [
          {
            type: "text",
            text: `Message exceeds maximum size of ${MAX_MESSAGE_SIZE / 1024}KB.`,
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
    const peers = listPeerStatuses(mailboxRoot, identity);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            identity,
            peers,
            hint:
              peers.length > 0
                ? `You have ${peers.length} teammate(s). Use send_message(to, message) to contact any of them. Active peers are online and will receive messages immediately. Inactive peers will receive messages when they come back online.`
                : "No peers found yet. Other agents will appear here once they start their sessions.",
          }),
        },
      ],
    };
  }

  if (name === "get_identity") {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            identity,
            protocol: {
              discover_peers: "Call list_peers to see all available teammate agents and their active status.",
              send: "Call send_message(to, message) to send a message to a peer agent.",
              receive: "Incoming messages arrive automatically as channel notifications with a 'from' field indicating the sender.",
              tips: [
                "Identify yourself when initiating contact with a new peer.",
                "Be specific in messages — include enough context for the recipient to act.",
                "Acknowledge receipt when you receive a message that requires action.",
              ],
            },
          }),
        },
      ],
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

  try {
    rmSync(inboxDir, { recursive: true, force: true });
  } catch {
    // best-effort cleanup
  }
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
