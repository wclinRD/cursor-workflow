# /plan — 建立實施計畫

為以下任務建立可執行計畫：

$ARGUMENTS

## 流程

### 1. 評分 + smart_think
- 先評分（🟢/🟡/🔴）
- **🔴**：必須 `smart_think` 或 `smart_deep_think`
- **🟡**：若符合觸發條件（需求模糊、跨 3+ 檔、根因不明等）→ 必須 `smart_think`；否則 inline 分析
- **🟢**：inline 分析即可

### 2. TodoWrite 規劃
用 **TodoWrite** 建立子任務；確認後第一項設 `in_progress`。

- 🔴：`.cursor/workflow-status.md` → `IN_PROGRESS`

### 3. 確認
向使用者展示計畫摘要，確認後開始執行。

### 4. 工具
- 思考：smart_think / smart_deep_think
- 讀 code：Read、Grep、Glob
- 編輯：StrReplace、Write
- 測試：Shell
- 架構：smart_run → arch_overview / code_impact
