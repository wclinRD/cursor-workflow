# /think — 結構化分析

對以下任務做結構化分析（不論複雜度，強制走 THINK 階段）：

$ARGUMENTS

## 流程

### 1. 評分
```
分數 = 步驟×2 + 工具×2 + 檔案×1 + 風險×3
≤3 🟢 | 4-8 🟡 | >8 🔴
```

### 2. 分析工具
- 🟢🟡：可 inline 分析，或 `smart_think`
- 🔴：用 `smart_think`（structured）或 `smart_deep_think`

### 3. 輸出
```markdown
## 任務分析
- **目標**：
- **複雜度**：🟢/🟡/🔴
- **步驟**：
  1. … — 工具：Read/Grep/Shell/smart_*
- **風險**：
```

### 4. 後續
- 🟢：直接執行
- 🟡🔴：**TodoWrite** 建立子任務後開始
- 🔴：另將 `.cursor/workflow-status.md` 設為 `IN_PROGRESS`

遵循 `smart-mcp.mdc`：日常讀寫用 Cursor built-ins。
