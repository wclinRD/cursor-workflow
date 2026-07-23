#!/usr/bin/env bash
set -euo pipefail

HOOK_DIR="$(cd "$(dirname "$0")" && pwd)"
HOOK_ENTRY="$HOOK_DIR/workflow-state.mjs"

if command -v bun >/dev/null 2>&1; then
  exec bun run "$HOOK_ENTRY"
fi

if command -v node >/dev/null 2>&1; then
  exec node "$HOOK_ENTRY"
fi

echo '{"followup_message":"Stop Hook 無法執行：請安裝 bun 或 node。"}' >&2
exit 1
