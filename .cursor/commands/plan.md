# /plan — 規劃任務

為以下任務建立實施計畫：

$ARGUMENTS

## 流程

### Step 1: 分析任務
使用 smart_think 進行結構化分析：

```
smart_think({
  thought: "分析任務需求...",
  nextThoughtNeeded: true,
  mode: "structured",
  goal: "任務目標",
  state: "已知資訊",
  algo: "推理路徑",
  edge: "限制條件",
  verify: "驗證邏輯"
})
```

### Step 2: 拆解子任務
將任務拆解為可執行的子任務，每個子任務包含：
- 任務描述
- 預計使用的工具
- 預估時間
- 依賴關係

### Step 3: 寫入 scratchpad.md
將計畫寫入 `.cursor/scratchpad.md`：

```markdown
# 任務追蹤面板

## 📋 任務清單

| # | 任務 | 狀態 | 工具 | 備註 |
|---|------|------|------|------|
| 1 | [子任務1] | ⬜ pending | smart_xxx | |
| 2 | [子任務2] | ⬜ pending | smart_xxx | |
...

## 📊 進度
- 總計：N 項
- 完成：0 項（0%）
- 進行中：0 項
- 待處理：N 項
```

### Step 4: 確認計畫
展示計畫給使用者確認，確認後開始執行。
