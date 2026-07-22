# /plan — 建立實施計畫

為以下任務建立可執行計畫：

$ARGUMENTS

## 流程

### 1. 分析
用 `smart_think` 或 `smart_deep_think`（🔴 任務）拆解需求。

### 2. TodoWrite 規劃
用 **TodoWrite** 建立子任務，例如：

```
[
  { "id": "1", "content": "分析現有架構", "status": "pending" },
  { "id": "2", "content": "實作核心邏輯", "status": "pending" },
  { "id": "3", "content": "撰寫並執行測試", "status": "pending" },
  { "id": "4", "content": "REVIEW 與收尾", "status": "pending" }
]
```

- 確認計畫後，將第一項設為 `in_progress`
- 🔴 任務：寫入 `.cursor/workflow-status.md` → `IN_PROGRESS`

### 3. 確認
向使用者展示計畫摘要，確認後開始執行。

### 4. 工具
- 讀 code：Read、Grep、Glob
- 編輯：StrReplace、Write
- 測試：Shell
- 架構：smart_run → arch_overview / code_impact
