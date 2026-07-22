# Cursor Smart Hybrid Agent — 工作流配置

> 將 OpenCode Smart Hybrid Agent 的 think → plan → execute → review 迴圈
> 移植到 Cursor + Smart MCP 環境

---

## 📋 安裝步驟

### Step 1: 複製 Rules 到你的專案

```bash
# 從 cursor/ 目錄複製到專案根目錄
cp -r cursor/.cursor/rules/  YOUR_PROJECT/.cursor/rules/
cp -r cursor/.cursor/hooks/   YOUR_PROJECT/.cursor/hooks/
cp -r cursor/.cursor/commands/ YOUR_PROJECT/.cursor/commands/
```

### Step 2: 安裝 Smart MCP

在 Cursor Settings → MCP 中加入 Smart MCP server，確保以下工具可用：
- `smart_think` — 結構化思考
- `smart_deep_think` — 深度分析
- `smart_read` — 智慧讀取
- `smart_grep` — 智慧搜尋
- `smart_fast_apply` — 智慧編輯
- `smart_exa_search` — 網路搜尋
- `smart_context` — Context 管理
- `smart_compact` — Context 壓縮

### Step 3: 安裝 Bun（Stop Hook 需要）

```bash
brew install bun
```

### Step 4: 啟用 Skills（Nightly Channel）

Cursor Settings → Beta → Update Channel → Nightly

---

## 🔄 核心工作流：Smart Hybrid 迴圈

```
┌─────────────────────────────────────────────────────┐
│                   收到任務                           │
└──────────────────────┬──────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────┐
│  Phase 1: THINK — 用 smart_think 拆解問題            │
│  • 判斷複雜度（🟢/🟡/🔴）                           │
│  • 拆解子任務                                        │
│  • 輸出到 .cursor/scratchpad.md                     │
└──────────────────────┬──────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────┐
│  Phase 2: PLAN — 用 todowrite 記錄任務              │
│  • 每個子任務標記 pending/in_progress/completed     │
│  • 同時只有一個 in_progress                         │
│  • 完成後才標記 completed                           │
└──────────────────────┬──────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────┐
│  Phase 3: EXECUTE — 逐項處理                        │
│  • 用 smart_* 工具執行                              │
│  • 每完成一項，更新 scratchpad.md                   │
│  • 更新 todowrite 狀態                              │
└──────────────────────┬──────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────┐
│  Phase 4: REVIEW — 用 smart_think 總結驗證          │
│  • 檢查所有步驟是否完成                              │
│  • 驗證結果是否完善                                  │
│  • 不完善 → 回到 Phase 1（最多 3 輪）              │
│  • 完善 → 在 scratchpad.md 寫入 ALL_DONE           │
└─────────────────────────────────────────────────────┘
```

---

## 📁 檔案結構

```
.cursor/
├── rules/
│   ├── 00-workflow.md          # 主工作流規則（強制）
│   ├── 01-smart-tools.md       # Smart MCP 工具規則
│   ├── 02-complexity.md        # 複雜度路由規則
│   └── 03-quality.md           # 品質檢查規則
├── hooks/
│   ├── hooks.json              # Stop hook 配置
│   └── check-progress.ts       # 迭代檢查腳本
├── commands/
│   ├── think.md                # /think 指令
│   ├── plan.md                 # /plan 指令
│   └── review.md               # /review 指令
├── plans/                      # 儲存的計畫
├── scratchpad.md               # 任務追蹤面板
└── todo.md                     # 任務清單
```

---

## 🧠 Phase 1: THINK — 結構化拆解

### 觸發時機
- 收到新任務時
- 任務卡住時
- 需要重新評估時

### 使用工具
```
smart_think({
  thought: "分析任務...",
  nextThoughtNeeded: true,
  mode: "structured",
  goal: "任務目標",
  state: "已知資訊",
  algo: "推理路徑",
  edge: "限制條件",
  verify: "驗證邏輯"
})
```

### 複雜度判斷

| 維度 | 🟢 簡單 | 🟡 中等 | 🔴 複雜 |
|------|---------|---------|----------|
| 步驟數 | ≤ 2 | 3-4 | > 4 |
| 工具數 | ≤ 1 | 2-3 | > 3 |
| 檔案數 | ≤ 1 | 2-3 | > 3 |
| 風險 | 低 | 中 | 高 |

### 輸出格式

```markdown
## 任務分析
- **目標**：[一句話描述]
- **複雜度**：🟢/🟡/🔴
- **步驟**：
  1. [步驟1] — 工具：smart_xxx
  2. [步驟2] — 工具：smart_xxx
  ...
- **風險**：[低/中/高]
- **預估**：[時間/次數]
```

---

## 📝 Phase 2: PLAN — 任務追蹤

### scratchpad.md 格式

```markdown
# 任務追蹤面板

## 📋 任務清單

| # | 任務 | 狀態 | 工具 | 備註 |
|---|------|------|------|------|
| 1 | [任務描述] | ⬜ pending | smart_xxx | |
| 2 | [任務描述] | 🔄 in_progress | smart_xxx | |
| 3 | [任務描述] | ✅ completed | smart_xxx | |
| 4 | [任務描述] | ❌ blocked | smart_xxx | 原因... |

## 📊 進度
- 總計：4 項
- 完成：1 項（25%）
- 進行中：1 項
- 待處理：2 項

## 🔄 迭代記錄
- 第 1 輪：[描述]
- 第 2 輪：[描述]

## ✅ 最終狀態
- ALL_DONE / NEED_REVISION
```

### 狀態定義

| 狀態 | 圖示 | 意義 |
|------|------|------|
| pending | ⬜ | 尚未開始 |
| in_progress | 🔄 | 進行中（同時只有一個） |
| completed | ✅ | 已完成且驗證 |
| blocked | ❌ | 被阻塞，需處理 |

---

## ⚡ Phase 3: EXECUTE — 逐項處理

### 執行規則

1. **一次一項**：同時只有一個 in_progress
2. **先讀後改**：用 smart_read 了解現狀，再用 smart_fast_apply 修改
3. **即時更新**：每完成一項就更新 scratchpad.md
4. **遇到問題**：標記 blocked，記錄原因，繼續下一項

### 工具選擇

```
讀取類 → smart_read（auto/outline/signature/symbol/explain/range/full）
搜尋類 → smart_grep（regex + scope + budget）
編輯類 → smart_fast_apply（search-replace/unified-diff/hashline）
思考類 → smart_think（cit/beam/forest/structured）
網路類 → smart_exa_search（compress + semantic）
```

---

## 🔍 Phase 4: REVIEW — 總結驗證

### 檢查清單

```markdown
## Review 清單

- [ ] 所有子任務都標記 completed？
- [ ] 沒有 blocked 項目？
- [ ] 測試通過？（如有）
- [ ] 沒有遺漏的邊界情況？
- [ ] 程式碼風格符合專案規範？
- [ ] 有沒有引入新的 bug？
```

### 使用工具

```
# 快速驗證
smart_think({
  thought: "檢查所有完成的任務...",
  nextThoughtNeeded: false,
  mode: "cit"
})

# 深度分析（複雜任務）
smart_deep_think({
  topic: "驗證實施結果",
  template: "peer_review",
  steps: 3
})
```

### 迭代邏輯

```
如果 review 發現問題：
  1. 在 scratchpad.md 寫入 NEED_REVISION + 原因
  2. Stop hook 會自動觸發下一輪
  3. 回到 Phase 1 重新分析
  4. 最多 3 輪，超過則停止並報告

如果 review 通過：
  1. 在 scratchpad.md 寫入 ALL_DONE
  2. Stop hook 不觸發
  3. 任務完成
```

---

## 🔧 Stop Hook 配置

### hooks.json

```json
{
  "version": 1,
  "hooks": {
    "stop": [{
      "command": "bun run .cursor/hooks/check-progress.ts"
    }]
  }
}
```

### check-progress.ts 邏輯

```
1. 讀取 .cursor/scratchpad.md
2. 檢查是否包含 ALL_DONE → 停止
3. 檢查是否包含 NEED_REVISION → 傳送修正指令
4. 檢查是否還有 pending/in_progress → 傳送繼續指令
5. 檢查迭代次數 → 超過 3 次則停止
```

---

## 📝 自訂指令

### /think — 觸發結構化思考

```markdown
# 檔案：.cursor/commands/think.md

使用 smart_think 對以下任務進行結構化分析：

$ARGUMENTS

## 流程
1. 判斷複雜度（🟢/🟡/🔴）
2. 拆解子任務
3. 輸出到 .cursor/scratchpad.md
4. 等待確認後開始執行
```

### /plan — 觸發規劃模式

```markdown
# 檔案：.cursor/commands/plan.md

為以下任務建立實施計畫：

$ARGUMENTS

## 流程
1. 用 smart_think 分析任務
2. 拆解為可執行的子任務
3. 寫入 .cursor/scratchpad.md
4. 用 todowrite 追蹤進度
```

### /review — 觸發審查

```markdown
# 檔案：.cursor/commands/review.md

審查目前的實施結果：

$ARGUMENTS

## 流程
1. 讀取 .cursor/scratchpad.md
2. 檢查所有 completed 項目
3. 用 smart_think 驗證完整性
4. 輸出審查報告
5. 如有问题，標記 NEED_REVISION
```

---

## 🚀 快速開始

### 1. 複製檔案

```bash
cp -r cursor/.cursor/ YOUR_PROJECT/.cursor/
```

### 2. 確認 Smart MCP 已安裝

在 Cursor 中測試：
```
請用 smart_think 分析 "Hello World" 這個任務
```

### 3. 開始使用

```
/think 實作使用者登入功能
```

或直接輸入任務，Agent 會自動執行 think → plan → execute → review 迴圈。

---

## ⚠️ 注意事項

1. **Stop Hook 需要 Bun**：`brew install bun`
2. **Skills 需要 Nightly Channel**：Settings → Beta → Nightly
3. **Context 管理**：長對話後用 `smart_compact` 壓縮
4. **迭代上限**：最多 3 輪，避免無限迴圈
5. **檔案衝突**：多個 Cursor 視窗共用 scratchpad.md 可能衝突

---

## 📊 與 OpenCode Smart Hybrid 對比

| 能力 | OpenCode | Cursor + Smart MCP |
|------|----------|--------------------|
| 結構化思考 | smart_think（內建） | smart_think（MCP） |
| 任務追蹤 | todowrite（內建） | scratchpad.md（檔案） |
| 規劃模式 | smart_think structured | Plan Mode + Rules |
| 迭代迴圈 | Agent 內建 | stop hook + scratchpad |
| 複雜度路由 | 🟢🟡🔴 自動 | Rules 定義 |
| Subagent | 有 | 無（但有 Background Agents） |
| Context 管理 | smart_context | smart_context（MCP） |

**結論**：安裝 Smart MCP 後，Cursor 可以達到 OpenCode 85-90% 的效果。核心差異在於 subagent 委派和原生 todowrite。
