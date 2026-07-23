#!/usr/bin/env bash
set -euo pipefail

HOOK_DIR="$(cd "$(dirname "$0")" && pwd)"
MODE="${1:?mode required}"
ENTRY="$HOOK_DIR/token-automation.mjs"

if command -v bun >/dev/null 2>&1; then
  exec bun run "$ENTRY" "$MODE"
fi

if command -v node >/dev/null 2>&1; then
  exec node "$ENTRY" "$MODE"
fi

echo '{"permission":"allow"}' >&2
exit 1
