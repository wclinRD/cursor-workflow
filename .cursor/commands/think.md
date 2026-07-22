# /think — 結構化思考

使用 smart_think 對以下任務進行結構化分析：

$ARGUMENTS

## 流程

### Step 1: 判斷複雜度
使用評分公式：
```
分數 = 步驟×2 + 工具×2 + 檔案×1 + 風險×3

≤ 3  → 🟢 簡單
4-8  → 🟡 中等
> 8  → 🔴 複雜
```

### Step 2: 結構化分析
使用 smart_think structured 模式：

```
smart_think({
  thought: "分析任務...",
  nextThoughtNeeded: true,
  mode: "structured",
  goal: "任務目標",
  state: "已知資訊",
  algo: "推理路徑",
  edge: "限制條件",
  verify: "驗證邏輯"
})
```

### Step 3: 輸出格式
```markdown
## 任務分析
- **目標**：[一句話描述]
- **複雜度**：🟢/🟡/🔴
- **步驟**：
  1. [步驟1] — 工具：smart_xxx
  2. [步驟2] — 工具：smart_xxx
- **風險**：[低/中/高]
- **預估**：[時間/次數]
```

### Step 4: 寫入 scratchpad.md
將分析結果寫入 `.cursor/scratchpad.md`，等待確認後開始執行。
