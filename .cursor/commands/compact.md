# /compact — 手動加速 compact（可選）

> **預設已自動化**：`postToolUse` Hook 會在 tool 累積達 15 次時注入 compact 指示，Agent 應自動執行 `smart_compact`。此指令僅在 **想提前 compact** 時使用。

手動觸發 context 釋放：

$ARGUMENTS

## 何時使用

- context 已明顯不足，但尚未達 Hook 自動閾值
- 使用者想主動清掉舊 tool 輸出
- **不要** 在 🟢 短任務一開始就用

## 流程

### 1. 讀取現況
- 讀 `.cursor/workflow-state.json`（若存在）取得 goal、todos
- 確認任務尚未 `ALL_DONE`

### 2. smart_compact（必須，Smart MCP 可用時）
```
smart_compact({
  auto: true,
  currentGoal: "從 workflow-state 或對話摘要",
  currentTodos: [/* workflow-state.json todos */]
})
```

**MCP 不可用時**：inline 列出可遺忘的舊 tool 輸出，建議開新對話。

### 3. 輸出報告 + 繼續任務
- 維持 workflow-state.json
- 後續 exa 呼叫已由 Hook 自動 caveman

## 相關

- 自動化詳見 `smart-mcp.mdc`、`hooks/token-automation.mjs`
