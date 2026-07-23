#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ERRORS=0

check() {
  local desc="$1"
  local cmd="$2"
  if eval "$cmd" >/dev/null 2>&1; then
    echo "✓ $desc"
  else
    echo "✗ $desc"
    ERRORS=$((ERRORS + 1))
  fi
}

echo "=== cursor-workflow — 安裝驗證 ==="
echo ""

check "bun 或 node 至少其一已安裝" "command -v bun || command -v node"
if command -v bun >/dev/null 2>&1; then
  check "bun 版本可用" "bun --version"
fi
if command -v node >/dev/null 2>&1; then
  check "node 版本可用" "node --version"
fi

for f in \
  ".cursor/rules/00-complexity.mdc" \
  ".cursor/rules/01-workflow-hybrid.mdc" \
  ".cursor/rules/02-quality.mdc" \
  ".cursor/rules/smart-mcp.mdc" \
  ".cursor/hooks/hooks.json" \
  ".cursor/hooks/workflow-state.mjs" \
  ".cursor/hooks/run-stop-hook.sh" \
  ".cursor/hooks/check-progress.test.ts" \
  ".cursor/commands/plan.md" \
  ".cursor/commands/think.md" \
  ".cursor/commands/review.md" \
  ".cursor/commands/status.md" \
  ".cursor/workflow-state.template.json" \
  ".cursor/workflow-status.template.md" \
  ".cursor/plans/.gitkeep"
do
  check "存在 $f" "test -f '$ROOT/$f'"
done

echo ""
echo "=== Hook 單元測試 ==="
cd "$ROOT"
if bun test ./.cursor/hooks/check-progress.test.ts; then
  echo "✓ Hook 測試通過"
else
  echo "✗ Hook 測試失敗"
  ERRORS=$((ERRORS + 1))
fi

echo ""
echo "=== Stop Hook runtime（bun / node）==="
HOOK_INPUT='{"conversation_id":"verify","status":"completed","loop_count":0}'
run_hook_smoke() {
  local runner="$1"
  local output
  output=$(printf '%s' "$HOOK_INPUT" | $runner 2>/dev/null) || return 1
  printf '%s' "$output" | python3 -c 'import json,sys; json.load(sys.stdin)' >/dev/null 2>&1
}

if command -v bun >/dev/null 2>&1; then
  if run_hook_smoke "bun run $ROOT/.cursor/hooks/workflow-state.mjs"; then
    echo "✓ bun Stop Hook 可執行"
  else
    echo "✗ bun Stop Hook 輸出異常"
    ERRORS=$((ERRORS + 1))
  fi
fi
if command -v node >/dev/null 2>&1; then
  if run_hook_smoke "node $ROOT/.cursor/hooks/workflow-state.mjs"; then
    echo "✓ node Stop Hook 可執行"
  else
    echo "✗ node Stop Hook 輸出異常"
    ERRORS=$((ERRORS + 1))
  fi
fi

echo ""
if [ "$ERRORS" -eq 0 ]; then
  echo "全部驗證通過。"
  exit 0
else
  echo "發現 $ERRORS 項問題，請修正後重試。"
  exit 1
fi
