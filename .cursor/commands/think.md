# /think — 結構化分析

對以下任務做結構化分析（**強制** 呼叫 `smart_think`，不可用時 **inline 降級**）：

$ARGUMENTS

## 流程

### 1. 評分
```
分數 = 步驟×2 + 工具×2 + 檔案×1 + 風險×3
≤3 🟢 | 4-8 🟡 | >8 🔴
```

### 2. smart_think（必須，可降級）
```
smart_think({
  mode: "structured",
  goal: "任務目標",
  state: "已知資訊",
  algo: "推理路徑",
  edge: "限制條件",
  verify: "驗證邏輯"
})
```
🔴 或高風險：改用 `smart_deep_think`。

**若 MCP 不可用**：改 inline 輸出相同結構，並註明降級。

### 3. 輸出
```markdown
## 任務分析
- **目標**：
- **複雜度**：🟢/🟡/🔴
- **分析方式**：smart_think ✓ / inline 降級
- **步驟**：
  1. … — 工具：Read/Grep/Shell/smart_*
- **風險**：
```

### 4. 後續
- 有實作（非 🟢 單步豁免）：寫入 `workflow-state.json`，status → `IN_PROGRESS`
- 可選：同步 TodoWrite

日常讀寫用 Cursor built-ins（`smart-mcp.mdc`）。
