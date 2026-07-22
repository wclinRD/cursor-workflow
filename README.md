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

Cursor Settings → MCP → Add new MCP server：

- **Name**: `smart`（或 `user-smart`，依環境而定）
- **Type**: command
- **Command**: 依你的 Smart MCP 安裝方式設定

測試：請用 `smart_think` 分析 "Hello World"

### 6. 開始使用

```
/plan 實作使用者登入功能
```

或直接描述任務；Agent 會依複雜度自動路由。

---

## 設計原則

| 項目 | 做法 |
|------|------|
| 日常讀寫搜尋 | Cursor built-ins（Read、Grep、StrReplace、Shell） |
| 深度分析 / 架構 | Smart MCP（smart_think、smart_deep_think、smart_run） |
| 任務追蹤 | **TodoWrite**（原生） |
| Stop Hook 信號 | `workflow-status.md`（僅 ALL_DONE 等狀態，非任務清單） |
| 複雜度 | 🟢 直接做 / 🟡 標準流程 / 🔴 完整迴圈 |

---

## 目錄結構

```
.cursor/
├── rules/
│   ├── smart-mcp.mdc           # Smart MCP 使用邊界
│   ├── 00-complexity.mdc       # 🟢🟡🔴 路由
│   ├── 01-workflow-hybrid.mdc  # 標準 / 完整流程
│   └── 02-quality.mdc          # 交付檢查
├── commands/
│   ├── think.md                # /think
│   ├── plan.md                 # /plan
│   └── review.md               # /review
├── hooks/
│   ├── hooks.json
│   └── check-progress.ts       # Stop Hook（🔴 迭代，最多 3 輪）
├── workflow-status.md          # Stop Hook 信號檔
└── plans/                      # Plan Mode 計畫
```

---

## 工作流程

```
收到任務 → 複雜度評分
    ↓
🟢 簡單 → 直接執行
🟡 中等 → 分析 → TodoWrite → 實作 → 驗證 → REVIEW
🔴 複雜 → THINK → TodoWrite → [TDD] → 實作 → 驗證 → REVIEW
                                              ↓
                              workflow-status: ALL_DONE / NEED_REVISION
                              Stop Hook 自動迭代（最多 3 輪）
```

### 複雜度評分

```
分數 = 步驟×2 + 工具×2 + 檔案×1 + 風險×3
≤3 🟢 | 4-8 🟡 | >8 🔴
```

---

## workflow-status.md

僅供 Stop Hook 讀取，**不是**任務清單。任務進度以 **TodoWrite** 為準。

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
| `/think` | 強制結構化分析 |
| `/plan` | TodoWrite 建立計畫 |
| `/review` | 審查並更新 workflow-status |

---

## 自訂設定

### 修改迭代上限

編輯 `.cursor/hooks/check-progress.ts`：

```typescript
const MAX_ITERATIONS = 3;
```

### 新增自訂指令

在 `.cursor/commands/` 新增 `.md` 檔案即可。

---

## 常見問題

**Q: Stop Hook 沒有觸發？**  
A: 確認已安裝 Bun，且 `hooks.json` 在專案或全域 `.cursor/hooks/` 下。

**Q: Smart MCP 工具找不到？**  
A: 確認 Cursor Settings → MCP 已加入 Smart server。

**Q: 迴圈停不下來？**  
A: 🔴 任務完成後將 `workflow-status.md` 設為 `ALL_DONE`。

**Q: 與舊版 scratchpad 版有何不同？**  
A: 任務追蹤改為 Cursor 原生 TodoWrite；Stop Hook 改讀 `workflow-status.md`。

---

## 與 OpenCode 對比

| 能力 | OpenCode | Cursor + 本工作流 |
|------|----------|-------------------|
| 結構化思考 | smart_think（內建） | smart_think（MCP） |
| 任務追蹤 | todowrite（內建） | TodoWrite（原生） |
| 迭代迴圈 | Agent 內建 | Stop Hook + workflow-status |
| 複雜度路由 | 🟢🟡🔴 自動 | Rules 定義 |
| 日常工具 | 混合 | Cursor built-ins 優先 |

---

## License

MIT（或依專案需要自行添加）
