# /review — 審查實施結果

審查目前進度與交付品質：

$ARGUMENTS

## 流程

### 1. 檢查 TodoWrite（必須）
- 有實作步驟的任務是否已建立 TodoWrite？
- 所有子任務是否 `completed`？
- 是否有遺留 `pending` / `in_progress`？
- 必要時 Read git diff 核對改動

### 2. smart_think 驗證
- **🔴**：**必須** `smart_think` 或 `smart_deep_think`
- **🟡**：若任務曾用 smart_think 規劃，或改動涉及 3+ 檔 → 必須 `smart_think`
- **🟢**：inline 檢查即可

Shell 執行相關測試。

### 3. 輸出報告
```markdown
## 審查報告
- **smart_think**：已執行 / 未需要
### 完成項目
### 遺漏 / 問題
### 建議
```

### 4. 更新 workflow-status（有實作步驟時必須）
- 通過：`ALL_DONE`
- 需修正：`NEED_REVISION: [原因]`

Stop Hook 會讀取此檔決定是否自動進入下一輪迭代。
