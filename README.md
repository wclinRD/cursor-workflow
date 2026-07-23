# Cursor Smart Hybrid Workflow

> 將 OpenCode Smart Hybrid Agent 工作流移植到 Cursor，**貼近 Cursor 原生工具**（TodoWrite、Read、Grep、StrReplace），Smart MCP 用於深度分析。

---

## 快速開始

### 1. 選擇安裝範圍

| 類型 | 影響範圍 | 做法 |
|------|---------|------|
| **專案級** | 僅該專案 | 複製 `.cursor/` 到專案根目錄 |
| **全域** | 所有專案 | 複製 `rules/`、`hooks/`、`commands/` 到 `~/.cursor/` |

### 2. 安裝（專案級）

```bash
git clone https://github.com/wclinRD/cursor-workflow.git /tmp/cursor-workflow
cd YOUR_PROJECT
cp -r /tmp/cursor-workflow/.cursor .
brew install bun   # Stop Hook 需要
cp .cursor/workflow-status.template.md .cursor/workflow-status.md
./scripts/verify-install.sh   # 驗證安裝與 Hook 測試
```

安裝後重載 Cursor 視窗，讓 `.cursor/rules` 生效。

### 3. 安裝（全域）

```bash
git clone https://github.com/wclinRD/cursor-workflow.git /tmp/cursor-workflow
cp -r /tmp/cursor-workflow/.cursor/rules/ ~/.cursor/rules/
cp -r /tmp/cursor-workflow/.cursor/hooks/ ~/.cursor/hooks/
cp -r /tmp/cursor-workflow/.cursor/commands/ ~/.cursor/commands/
brew install bun   # Stop Hook 需要
```

> 全域安裝不含 `workflow-status.md`（各專案狀態獨立）。在專案中執行：
> `cp .cursor/workflow-status.template.md .cursor/workflow-status.md`

### 4. 更新既有專案

```bash
git clone https://github.com/wclinRD/cursor-workflow.git /tmp/cursor-workflow
cd YOUR_PROJECT
cp -r /tmp/cursor-workflow/.cursor/rules/ .cursor/rules/
cp -r /tmp/cursor-workflow/.cursor/commands/ .cursor/commands/
cp -r /tmp/cursor-workflow/.cursor/hooks/ .cursor/hooks/
# workflow-status.md 若不存在才從 template 建立，避免覆蓋進行中任務
test -f .cursor/workflow-status.md || cp /tmp/cursor-workflow/.cursor/workflow-status.template.md .cursor/workflow-status.md
./scripts/verify-install.sh
```

### 5. 驗證與測試

```bash
# 完整安裝驗證（bun、檔案、Hook 單元測試）
./scripts/verify-install.sh

# 僅跑 Hook 測試
bun test ./.cursor/hooks/check-progress.test.ts
```

### 6. 試用沙盒

可 clone 本 repo 直接試用，或參考 [opencursor](https://github.com/wclinRD/opencursor) 試用專案。

---

## 與舊版差異

| 項目 | 舊版 | 本版（Hybrid） |
|------|------|----------------|
| 工具 | 強制 Smart MCP | 日常 Cursor built-ins + Smart 選用 |
| 工作流 | 所有任務 6 階段 | 🟢 直接做 / 🟡 標準 / 🔴 完整迴圈 |
| 任務追蹤 | scratchpad.md | **TodoWrite** + **workflow-status** |
| TDD | 一律先寫測試 | 有測試框架且改行為時才要求 |
| Stop Hook | 讀 scratchpad | 讀 `workflow-status.md`（含單元測試） |

---

## 目錄結構

```
.cursor/
├── rules/                    smart-mcp, 00-complexity, 01-workflow-hybrid, 02-quality
├── commands/                 think, plan, review, status
├── hooks/                    Stop Hook + check-progress.test.ts
├── workflow-status.template.md   版控範本（複製為 workflow-status.md 使用）
├── workflow-status.md        runtime 狀態（.gitignore，不進版控）
└── plans/                    /plan 產出的計畫存放處
scripts/
└── verify-install.sh         安裝驗證 + Hook 測試
```

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

**不可**在有實作步驟的任務中跳過 workflow-status 更新。可用 `/status` 指令更新。

| 值 | 意義 |
|----|------|
| `IDLE` | 無進行中任務（預設） |
| `IN_PROGRESS` | 實作進行中 |
| `ALL_DONE` | 完成 |
| `NEED_REVISION: …` | 需修正（Stop Hook 自動迭代，最多 3 輪） |
| 無效值 | Stop Hook 會提示修正 |

### smart_think

| 複雜度 | 規則 |
|--------|------|
| 🟢 | 不用 |
| 🟡 | 觸發條件命中時必須 |
| 🔴 | THINK + REVIEW 必須 |
| `/think` | 強制 |

🟡 觸發條件：需求模糊、跨 3+ 檔、根因不明、架構取捨、使用者要求、卡關。

### 複雜度評分

```
分數 = 步驟×2 + 工具×2 + 檔案×1 + 風險×3
≤3 🟢 | 4-8 🟡 | >8 🔴
```

---

## 自訂指令

| 指令 | TodoWrite | workflow-status | smart_think |
|------|-----------|-----------------|-------------|
| `/plan` | 必須 | 有實作則必須 | 🔴 必須 |
| `/think` | 若後續實作則必須 | 有實作則必須 | 強制 |
| `/review` | 檢查 completed | 有實作則必須 | 🔴 必須 |
| `/status` | — | **寫入** | — |

---

## 快速試用範例

```bash
# 純問答 — 無 TodoWrite，維持 IDLE
解釋這個專案的 rules 結構

# 🟢 有實作 — TodoWrite + workflow-status 必須
把某個函式改成回傳大寫

# 🟡 — TodoWrite + workflow-status + 條件式 smart_think
/plan 新增模組與測試

# 🔴 — TodoWrite + workflow-status + smart_think
/plan 設計 plugin 載入器

# 手動更新狀態
/status IN_PROGRESS
/status ALL_DONE
```
