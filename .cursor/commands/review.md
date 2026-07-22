# /review — 審查結果

審查目前的實施結果：

$ARGUMENTS

## 流程

### Step 1: 讀取 scratchpad.md
使用 smart_read 讀取 `.cursor/scratchpad.md`，了解目前進度。

### Step 2: 檢查完成項目
確認所有子任務都標記為 completed。

### Step 3: 驗證完整性
使用 smart_think 進行驗證：

```
smart_think({
  thought: "檢查所有完成的任務...",
  nextThoughtNeeded: false,
  mode: "cit"
})
```

### Step 4: 輸出審查報告
```markdown
## 審查報告

### 完成項目
1. [項目1] — ✅ 已完成
2. [項目2] — ✅ 已完成

### 遺漏項目
- [如有遺漏]

### 問題記錄
- [如有問題]

### 建議
- [改進建議]
```

### Step 5: 更新 scratchpad.md
- 如果通過：寫入 `ALL_DONE`
- 如果有問題：寫入 `NEED_REVISION` + 原因
