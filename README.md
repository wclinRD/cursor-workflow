# Cursor Smart Hybrid Agent Setup

> 將 OpenCode Smart Hybrid Agent 的工作流移植到 Cursor + Smart MCP

---

## 🚀 快速開始

### 1. 選擇安裝類型

| 類型 | 影響範圍 | 路徑 |
|------|---------|------|
| **Cursor by Jobs** | 僅該專案 | `YOUR_PROJECT/.cursor/` |
| **Cursor Global** | 所有專案 | `~/.cursor/` |

---

### 2. 複製設定檔案

#### 選項 A：Cursor by Jobs（僅該專案）

```bash
# 進入你的專案目錄
cd YOUR_PROJECT

# 複製 .cursor 目錄到專案
cp -r /Users/wclin/opencode/day/cursor/.cursor/ .cursor/

# 複製說明文件（選擇性）
cp /Users/wclin/opencode/day/cursor/cursor_plan.md .
cp /Users/wclin/opencode/day/cursor/cursor_todo.md .
```

#### 選項 B：Cursor Global（所有專案）

```bash
# 複製 rules 到 global 設定
cp -r /Users/wclin/opencode/day/cursor/.cursor/rules/ ~/.cursor/rules/

# 複製 hooks 到 global 設定
cp -r /Users/wclin/opencode/day/cursor/.cursor/hooks/ ~/.cursor/hooks/

# 複製 commands 到 global 設定
cp -r /Users/wclin/opencode/day/cursor/.cursor/commands/ ~/.cursor/commands/
```

### 3. 安裝依賴

```bash
# 安裝 Bun（Stop Hook 需要）
brew install bun

# 安裝 Node.js（如尚未安裝）
brew install node
```

### 4. 設定 Smart MCP

1. 開啟 Cursor Settings（`Cmd + ,`）
2. 左側選單找到 **MCP**
3. 點擊 **Add new MCP server**
4. 填入：
   - **Name**: `smart-mcp`
   - **Type**: `command`
   - **Command**: `npx -y @anthropic-ai/mcp-server-smart`
5. 點擊 **Save**
6. 重啟 Cursor

測試 Smart MCP 是否安裝成功：
```
請用 smart_think 分析 "Hello World"
```

### 5. 啟用 Skills（選擇性）

Cursor Settings → Beta → Update Channel → Nightly

### 6. 開始使用

```
/think 實作使用者登入功能
```

或直接輸入任務，Agent 會自動執行 think → plan → execute → review 迴圈。

---

## 📁 檔案說明

| 檔案 | 用途 |
|------|------|
| `.cursor/rules/00-workflow.mdc` | 主工作流規則（強制，alwaysApply） |
| `.cursor/rules/01-smart-tools.mdc` | Smart MCP 工具規則（自動觸發） |
| `.cursor/rules/02-complexity.mdc` | 複雜度路由規則（alwaysApply） |
| `.cursor/rules/03-quality.mdc` | 品質檢查規則（alwaysApply） |
| `.cursor/hooks/hooks.json` | Stop hook 配置 |
| `.cursor/hooks/check-progress.ts` | 迭代檢查腳本 |
| `.cursor/commands/think.md` | /think 指令 |
| `.cursor/commands/plan.md` | /plan 指令 |
| `.cursor/commands/review.md` | /review 指令 |
| `.cursor/scratchpad.md` | 任務追蹤面板 |
| `.cursor/todo.md` | 歷史任務記錄 |
| `cursor_plan.md` | 完整工作流說明 |
| `cursor_todo.md` | 任務追蹤模板 |

---

## 🔄 工作流程

```
收到任務
    ↓
Phase 1: THINK（smart_think 拆解問題）
    ↓
Phase 2: PLAN（寫入 scratchpad.md）
    ↓
Phase 3: WRITE TESTS（先寫測試，TDD）
    ↓
Phase 4: IMPLEMENT（逐項處理）
    ↓
Phase 5: VERIFY（執行測試）
    ↓
Phase 6: REVIEW（smart_think 驗證）
    ↓
  ┌─ 通過 → ALL_DONE → 結束
  └─ 不通過 → NEED_REVISION → 回到 Phase 1（最多 3 輪）
```

---

## ⚠️ 注意事項

1. **Stop Hook 需要 Bun**：`brew install bun`
2. **Skills 需要 Nightly Channel**：Settings → Beta → Nightly
3. **Context 管理**：長對話後用 `smart_compact` 壓縮
4. **迭代上限**：最多 3 輪，避免無限迴圈
5. **檔案衝突**：多個 Cursor 視窗共用 scratchpad.md 可能衝突
6. **TDD 原則**：先寫測試再寫程式碼（RED → GREEN → REFACTOR）
7. **.mdc 格式**：Rules 使用 `.mdc` 格式，支援自動觸發

---

## 📊 與 OpenCode 對比

| 能力 | OpenCode | Cursor + Smart MCP |
|------|----------|--------------------|
| 結構化思考 | smart_think（內建） | smart_think（MCP） |
| 任務追蹤 | todowrite（內建） | scratchpad.md（檔案） |
| 規劃模式 | smart_think structured | Plan Mode + Rules |
| 迭代迴圈 | Agent 內建 | stop hook + scratchpad |
| 複雜度路由 | 🟢🟡🔴 自動 | Rules 定義 |
| Subagent | 有 | 無（但有 Background Agents） |
| Context 管理 | smart_context | smart_context（MCP） |

**結論**：安裝 Smart MCP 後，Cursor 可以達到 OpenCode 85-90% 的效果。

---

## 🔧 自訂設定

### 修改迭代上限

編輯 `.cursor/hooks/check-progress.ts`：

```typescript
const MAX_ITERATIONS = 3; // 修改這個數字
```

### 新增自訂指令

在 `.cursor/commands/` 新增 `.md` 檔案即可。

### 調整複雜度判斷

編輯 `.cursor/rules/02-complexity.mdc` 中的評分公式。

### 使用 Plan Mode

按 `Shift+Tab` 切換 Plan Mode，Agent 會先研究 codebase、問問題、建立計畫。

### 使用 @Branch

使用 `@Branch` 提供 branch context，例如：
- 「Review the changes on this branch」
- 「What am I working on?」

---

## 🐛 常見問題

### Q: Stop Hook 沒有觸發？
A: 確認已安裝 Bun，且 hooks.json 格式正確。

### Q: Smart MCP 工具找不到？
A: 確認在 Cursor Settings → MCP 中已加入 Smart MCP server。

### Q: scratchpad.md 沒有更新？
A: 確認 Agent 有遵循 Rules 中的工作流規則。

### Q: 迴圈停不下來？
A: 檢查 scratchpad.md 是否正確寫入 ALL_DONE 或 NEED_REVISION。
