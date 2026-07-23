# /review — 審查實施結果

審查目前進度與交付品質：

$ARGUMENTS

## 流程

### 1. 檢查 workflow-state.json（必須，🟢 單步豁免除外）
- 讀取 `.cursor/workflow-state.json`
- 所有 todos 是否 `completed` 或合理 `cancelled`？
- 是否有遺留 `pending` / `in_progress`？
- 若使用 TodoWrite，是否與 JSON 一致？
- 必要時 Read git diff 核對改動

### 2. smart_think 驗證
- **🔴**：**必須** `smart_think` / `smart_deep_think` 或 inline 降級
- **🟡**：若曾用 smart_think 規劃，或改動涉及 3+ 檔 → 必須
- **🟢**：inline 檢查即可

Shell 執行相關測試。

### 3. 輸出報告
```markdown
## 審查報告
- **分析方式**：smart_think 已執行 / inline 降級 / 未需要
### 完成項目
### 遺漏 / 問題
### 建議
```

### 4. 更新 workflow-state.json（有實作步驟時必須）
- 通過：`status: ALL_DONE`，確認 todos 全 completed
- 需修正：`status: NEED_REVISION`，`revision: 原因`

Stop Hook 會讀取此檔決定是否自動進入下一輪迭代。
