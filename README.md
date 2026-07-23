# cursor-workflow

> 將 OpenCode Smart Hybrid Agent 工作流移植到 Cursor，**貼近 Cursor 原生工具**（Read、Grep、StrReplace），Smart MCP 用於深度分析；任務追蹤以 **`workflow-state.json`** 為唯一真相來源。

**品牌名稱**：`cursor-workflow`（本 repo）  
**試用沙盒**：可將 repo clone 到任意目錄試用；[opencursor](https://github.com/wclinRD/opencursor) 為官方試用範例專案名稱。

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
cp .cursor/workflow-state.template.json .cursor/workflow-state.json
# Stop Hook：bun（推薦）或 node 擇一即可
brew install bun   # 可選；無 bun 時用 node
./scripts/verify-install.sh
```

安裝後重載 Cursor 視窗，讓 `.cursor/rules` 生效。

### 3. 安裝（全域）

```bash
git clone https://github.com/wclinRD/cursor-workflow.git /tmp/cursor-workflow
cp -r /tmp/cursor-workflow/.cursor/rules/ ~/.cursor/rules/
cp -r /tmp/cursor-workflow/.cursor/hooks/ ~/.cursor/hooks/
cp -r /tmp/cursor-workflow/.cursor/commands/ ~/.cursor/commands/
```

> 全域安裝不含 runtime 狀態檔。在專案中執行：
> `cp .cursor/workflow-state.template.json .cursor/workflow-state.json`

### 4. 更新既有專案

```bash
git clone https://github.com/wclinRD/cursor-workflow.git /tmp/cursor-workflow
cd YOUR_PROJECT
cp -r /tmp/cursor-workflow/.cursor/rules/ .cursor/rules/
cp -r /tmp/cursor-workflow/.cursor/commands/ .cursor/commands/
cp -r /tmp/cursor-workflow/.cursor/hooks/ .cursor/hooks/
test -f .cursor/workflow-state.json || cp /tmp/cursor-workflow/.cursor/workflow-state.template.json .cursor/workflow-state.json
./scripts/verify-install.sh
```

### 5. 驗證與測試

```bash
./scripts/verify-install.sh
bun test ./.cursor/hooks/check-progress.test.ts
```

### 6. 試用沙盒

```bash
git clone https://github.com/wclinRD/cursor-workflow.git
cd cursor-workflow
cp .cursor/workflow-state.template.json .cursor/workflow-state.json
./scripts/verify-install.sh
```

或使用 [opencursor](https://github.com/wclinRD/opencursor) 試用專案。

---

## 與舊版差異

| 項目 | 舊版 | 本版（Hybrid v2） |
|------|------|-------------------|
| 工具 | 強制 Smart MCP | Cursor built-ins + Smart 選用 |
| 工作流 | 所有任務 6 階段 | 🟢 直接做 / 🟡 標準 / 🔴 完整迴圈 |
| 任務追蹤 | scratchpad.md | **workflow-state.json**（status + todos） |
| TodoWrite | 強制 | 可選（建議與 JSON 同步） |
| 🟢 單步 | 仍要 status | **可豁免** workflow-state |
| Stop Hook | bun only | **bun 或 node**（`run-stop-hook.sh`） |
| smart_think | 失敗即卡住 | **inline 降級** |
| 品質規則 | alwaysApply | **按需載入**（02-quality） |

---

## 目錄結構

```
.cursor/
├── rules/                         smart-mcp, 00-complexity, 01-workflow-hybrid, 02-quality
├── commands/                      think, plan, review, status
├── hooks/
│   ├── workflow-state.mjs         Stop Hook 核心（bun / node）
│   ├── run-stop-hook.sh           bun → node fallback
│   └── check-progress.test.ts
├── workflow-state.template.json   版控範本
├── workflow-state.json            runtime（.gitignore）
├── workflow-status.template.md    舊版相容（已棄用）
└── plans/                         /plan 產出
scripts/
└── verify-install.sh
```

---

## workflow-state.json

```json
{
  "version": 1,
  "status": "IN_PROGRESS",
  "revision": "NEED_REVISION 時填寫",
  "todos": [
    { "id": "1", "content": "子任務", "status": "in_progress" }
  ]
}
```

| status | 意義 |
|--------|------|
| `IDLE` | 無進行中任務 |
| `IN_PROGRESS` | 實作中 |
| `ALL_DONE` | 完成（todos 須全 completed） |
| `NEED_REVISION` | 需修正 |

Stop Hook 同時驗證 **status + todos**（最多 3 輪自動迭代）。

### 🟢 單步豁免

同時符合：**1 步、1 檔、低風險、🟢** → 可不寫 workflow-state.json。

---

## smart_think 降級

MCP 不可用時，改 **inline 結構化分析**（目標、複雜度、步驟、風險），並註明降級。🟡🔴 仍須完成同等深度 THINK / REVIEW。

---

## 自訂指令

| 指令 | workflow-state | smart_think |
|------|----------------|-------------|
| `/plan` | 有實作則必須 | 🔴 必須（可降級） |
| `/think` | 有實作則必須 | 強制（可降級） |
| `/review` | 必須更新 | 🔴 必須（可降級） |
| `/status` | **寫入 JSON** | — |

---

## 快速試用範例

```
# 純問答 — 維持 IDLE
解釋 rules 結構

# 🟢 單步豁免 — 可不寫 workflow-state
修正 README  typo

# 🟡 — workflow-state.json + 條件式 smart_think
/plan 新增模組與測試

# 手動更新
/status IN_PROGRESS
/status ALL_DONE
```
