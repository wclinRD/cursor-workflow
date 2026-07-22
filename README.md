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
```

### 3. 安裝（全域）

```bash
git clone https://github.com/wclinRD/cursor-workflow.git /tmp/cursor-workflow
cp -r /tmp/cursor-workflow/.cursor/rules/ ~/.cursor/rules/
cp -r /tmp/cursor-workflow/.cursor/hooks/ ~/.cursor/hooks/
cp -r /tmp/cursor-workflow/.cursor/commands/ ~/.cursor/commands/
```

### 4. 依賴

```bash
brew install bun   # Stop Hook 需要
brew install node  # Smart MCP 需要（如尚未安裝）
```

### 5. 設定 Smart MCP

Cursor Settings → MCP → Add new MCP server（依你的 Smart MCP 安裝方式設定）。

測試：請用 `smart_think` 分析 "Hello World"

### 6. 開始使用

```
/plan 實作使用者登入功能
```

---

## 設計原則

| 項目 | 做法 |
|------|------|
| 日常讀寫搜尋 | Cursor built-ins（Read、Grep、StrReplace、Shell） |
| 深度分析 / 架構 | Smart MCP（smart_think、smart_deep_think、smart_run） |
| 任務追蹤 | **TodoWrite**（原生） |
| Stop Hook 信號 | `workflow-status.md`（僅 🔴 任務） |
| 複雜度 | 🟢 直接做 / 🟡 標準流程 / 🔴 完整迴圈 |

---

## smart_think 規則

| 複雜度 | 規則 |
|--------|------|
| 🟢 | **不用** |
| 🟡 | 符合觸發條件時 **必須**（見下） |
| 🔴 | THINK 與 REVIEW 階段 **必須** |
| `/think` | **強制** |

### 🟡 觸發條件（任一命中即必須 smart_think）

1. 需求模糊、有多種做法或 trade-off
2. 跨 3+ 檔案或模組邊界
3. Bug 根因不明
4. 架構 / API 設計取捨
5. 使用者要求分析
6. 第一次嘗試失敗、需重新拆解

**未命中** → inline 簡短分析即可（例：步驟明確的 CRUD、單檔加函式）。

---

## 複雜度評分

```
分數 = 步驟×2 + 工具×2 + 檔案×1 + 風險×3
≤3 🟢 | 4-8 🟡 | >8 🔴
```

---

## 目錄結構

```
.cursor/
├── rules/
│   ├── smart-mcp.mdc
│   ├── 00-complexity.mdc
│   ├── 01-workflow-hybrid.mdc
│   └── 02-quality.mdc
├── commands/          → /think、/plan、/review
├── hooks/             → Stop Hook（🔴 迭代，最多 3 輪）
├── workflow-status.md
└── plans/
```

---

## workflow-status.md

僅供 Stop Hook 讀取（**不是**任務清單）。任務進度以 **TodoWrite** 為準。

| 值 | 意義 |
|----|------|
| `IDLE` | 無進行中 🔴 任務 |
| `IN_PROGRESS` | 🔴 任務進行中 |
| `ALL_DONE` | 完成，Hook 停止 |
| `NEED_REVISION: …` | 需修正，Hook 觸發下一輪 |

---

## 自訂指令

| 指令 | 用途 |
|------|------|
| `/think` | 強制 smart_think |
| `/plan` | 分析 + TodoWrite 計畫 |
| `/review` | smart_think 審查 + 更新 workflow-status |

---

## 常見問題

**Q: 🟡 什麼時候要 smart_think？**  
A: 見上方觸發條件；步驟明確的任務不必。

**Q: Stop Hook 沒觸發？**  
A: 確認已安裝 Bun；🔴 任務需設 `workflow-status` 為 `IN_PROGRESS`。

**Q: 迴圈停不下來？**  
A: 🔴 完成後設 `ALL_DONE`。

---

## 與 OpenCode 對比

| 能力 | OpenCode | 本工作流 |
|------|----------|----------|
| 結構化思考 | smart_think（內建） | 🟢 不用 / 🟡 條件 / 🔴 必須 |
| 任務追蹤 | todowrite | TodoWrite（原生） |
| 日常工具 | 混合 | Cursor built-ins 優先 |
