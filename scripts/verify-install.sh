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

echo "=== Cursor Smart Hybrid Workflow — 安裝驗證 ==="
echo ""

check "bun 已安裝" "command -v bun"
check "bun 版本可用" "bun --version"

for f in \
  ".cursor/rules/00-complexity.mdc" \
  ".cursor/rules/01-workflow-hybrid.mdc" \
  ".cursor/rules/02-quality.mdc" \
  ".cursor/rules/smart-mcp.mdc" \
  ".cursor/hooks/hooks.json" \
  ".cursor/hooks/check-progress.ts" \
  ".cursor/commands/plan.md" \
  ".cursor/commands/think.md" \
  ".cursor/commands/review.md" \
  ".cursor/commands/status.md" \
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
if [ "$ERRORS" -eq 0 ]; then
  echo "全部驗證通過。"
  exit 0
else
  echo "發現 $ERRORS 項問題，請修正後重試。"
  exit 1
fi
