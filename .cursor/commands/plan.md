# /plan — 建立實施計畫

為以下任務建立可執行計畫：

$ARGUMENTS

## 流程

### 1. 評分 + smart_think
- 先評分（🟢/🟡/🔴）
- **🔴**：必須 `smart_think` 或 `smart_deep_think`（不可用時 inline 降級，見 `smart-mcp.mdc`）
- **🟡**：若符合觸發條件 → 必須 `smart_think` 或 inline 降級；否則 inline 分析
- **🟢**：inline 分析即可

### 2. workflow-state.json 規劃（必須，🟢 單步豁免除外）
- **必須** 在 `.cursor/workflow-state.json` 建立 todos
- 第一項 todo 設 `in_progress`
- status 設 `IN_PROGRESS`
- 可選：同步 TodoWrite 方便對話追蹤

### 3. 確認
向使用者展示計畫摘要，確認後開始執行。

### 4. 工具
- 追蹤：workflow-state.json（強制）；TodoWrite（可選同步）
- 思考：smart_think / inline 降級
- 讀 code：Read、Grep、Glob
- 編輯：StrReplace、Write
- 測試：Shell
