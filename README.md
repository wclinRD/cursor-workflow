# Cursor Smart Hybrid Workflow

> Cursor 原生 **TodoWrite** 強制追蹤任務；Smart MCP 用於深度分析。

---

## 快速開始

```bash
git clone https://github.com/wclinRD/cursor-workflow.git /tmp/cursor-workflow
cd YOUR_PROJECT
cp -r /tmp/cursor-workflow/.cursor .
brew install bun   # Stop Hook
```

全域安裝：複製 `rules/`、`hooks/`、`commands/` 到 `~/.cursor/`。

---

## 核心規則

### TodoWrite（強制）

| 類型 | TodoWrite |
|------|-----------|
| 純問答（無實作） | 可跳過 |
| 🟢 有實作 | **必須**（至少 1 項） |
| 🟡 / 🔴 | **必須**（實作前建立） |
| `/plan` | **必須** |

**不可**在沒有 TodoWrite 的情況下開始多步驟實作或改 code。

### workflow-status（強制）

| 類型 | workflow-status |
|------|-----------------|
| 純問答（無實作） | 維持 `IDLE` |
| 🟢 / 🟡 / 🔴 有實作 | **必須**（開始 → `IN_PROGRESS`；完成 → `ALL_DONE`） |
| `/plan`、`/think`（若後續要實作） | **必須** |

**不可**在有實作步驟的任務中跳過 workflow-status 更新。

### smart_think

| 複雜度 | 規則 |
|--------|------|
| 🟢 | 不用 |
| 🟡 | 觸發條件命中時必須 |
| 🔴 | THINK + REVIEW 必須 |
| `/think` | 強制 |

🟡 觸發條件：需求模糊、跨 3+ 檔、根因不明、架構取捨、使用者要求、卡關。

### 複雜度

```
分數 = 步驟×2 + 工具×2 + 檔案×1 + 風險×3
≤3 🟢 | 4-8 🟡 | >8 🔴
```

---

## 目錄結構

```
.cursor/
├── rules/       smart-mcp, 00-complexity, 01-workflow-hybrid, 02-quality
├── commands/    think, plan, review
├── hooks/       Stop Hook（有實作步驟的任務）
├── workflow-status.md
└── plans/
```

## workflow-status.md

有實作步驟的任務 **必須** 更新（純問答維持 `IDLE`）。任務清單以 **TodoWrite** 為準。

| 值 | 意義 |
|----|------|
| `IDLE` | 無進行中任務（預設） |
| `IN_PROGRESS` | 實作進行中 |
| `ALL_DONE` | 完成 |
| `NEED_REVISION: …` | 需修正 |

---

## 自訂指令

| 指令 | TodoWrite | workflow-status | smart_think |
|------|-----------|-----------------|-------------|
| `/plan` | 必須 | 有實作則必須 | 🔴 必須 |
| `/think` | 若後續實作則必須 | 有實作則必須 | 強制 |
| `/review` | 檢查 completed | 有實作則必須 | 🔴 必須 |
