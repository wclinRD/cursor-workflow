# /review — 審查實施結果

審查目前進度與交付品質：

$ARGUMENTS

## 流程

### 1. 檢查 TodoWrite
- 所有子任務是否 `completed`？
- 是否有遺留 `pending` / `in_progress`？
- 必要時 Read git diff 核對改動

### 2. 驗證
- Shell 執行相關測試
- 🔴 任務：用 `smart_think` 或 `smart_deep_think` 做完整性檢查

### 3. 輸出報告
```markdown
## 審查報告
### 完成項目
### 遺漏 / 問題
### 建議
```

### 4. 更新 workflow-status（🔴 任務）
寫入 `.cursor/workflow-status.md`：
- 通過：`ALL_DONE`
- 需修正：`NEED_REVISION: [原因]`

Stop Hook 會讀取此檔決定是否自動進入下一輪迭代。
