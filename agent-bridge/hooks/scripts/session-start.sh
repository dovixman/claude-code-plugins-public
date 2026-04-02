#!/usr/bin/env bash
set -euo pipefail

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-.}"
IDENTITY="${AGENT_BRIDGE_IDENTITY:-}"

cat "$PLUGIN_ROOT/references/agent-communication.md"

if [ -n "${CLAUDE_PLUGIN_DATA:-}" ]; then
  MAILBOX_ROOT="$CLAUDE_PLUGIN_DATA/mailbox"
else
  MAILBOX_ROOT="$HOME/.claude/agent-bridge/mailbox"
fi

STALE_THRESHOLD=30

echo ""
echo "## Current Session"
echo ""
echo "- **Your identity**: \`${IDENTITY:-not set}\`"
echo ""

if [ ! -d "$MAILBOX_ROOT" ]; then
  echo "## Available Peers"
  echo ""
  echo "No peers discovered yet. The mailbox directory does not exist."
  exit 0
fi

echo "## Available Peers"
echo ""

FOUND_PEERS=0

for peer_dir in "$MAILBOX_ROOT"/*/; do
  [ -d "$peer_dir" ] || continue

  peer_name="$(basename "$peer_dir")"

  if [ "$peer_name" = "$IDENTITY" ]; then
    continue
  fi

  heartbeat_file="$peer_dir/.heartbeat"
  status="inactive"

  if [ -f "$heartbeat_file" ]; then
    heartbeat_ts="$(cat "$heartbeat_file" 2>/dev/null || echo "0")"
    now_ms="$(($(date +%s) * 1000))"
    diff_s=$(( (now_ms - heartbeat_ts) / 1000 ))
    if [ "$diff_s" -lt "$STALE_THRESHOLD" ]; then
      status="active"
    fi
  fi

  role_file="$peer_dir/.role"
  role=""
  if [ -f "$role_file" ]; then
    role="$(cat "$role_file" 2>/dev/null || echo "")"
    role="$(printf '%s' "$role" | tr -d '\001-\037\177' | tr -d '`' | cut -c1-128)"
  fi

  if [ -n "$role" ]; then
    echo "- \`$peer_name\` — **$status** — $role"
  else
    echo "- \`$peer_name\` — **$status**"
  fi

  FOUND_PEERS=$((FOUND_PEERS + 1))
done

if [ "$FOUND_PEERS" -eq 0 ]; then
  echo "No peers discovered yet. Other agents will appear once they start their sessions."
fi

echo ""
echo "Use \`send_message(to, message)\` to contact any peer. Use \`list_peers\` to refresh this list at any time."
