# /status — 更新 workflow-state.json

更新 `.cursor/workflow-state.json` 的任務狀態（與 todos 若需一併調整）：

$ARGUMENTS

## 有效 status 值

| 值 | 用途 |
|----|------|
| `IDLE` | 無進行中任務（純問答後重置） |
| `IN_PROGRESS` | 開始實作前 |
| `ALL_DONE` | 所有 todos 完成且驗證通過 |
| `NEED_REVISION` | 審查發現需修正（原因寫入 `revision` 欄位） |

## 流程

1. 讀取現有 `.cursor/workflow-state.json`（不存在則從 `workflow-state.template.json` 複製）
2. 解析使用者指定的 status（若未指定，詢問）
3. 更新 JSON 的 `status`（與 `revision` 若為 NEED_REVISION）
4. **保留** 既有 `todos`，除非使用者一併要求更新
5. 寫回檔案並確認

## JSON 範例

```json
{
  "version": 1,
  "status": "IN_PROGRESS",
  "todos": [
    { "id": "1", "content": "實作 Hook", "status": "in_progress" },
    { "id": "2", "content": "更新 README", "status": "pending" }
  ]
}
```

## 注意

- 🟡🔴 有實作：開始前 `IN_PROGRESS`，完成後 `ALL_DONE` 且 todos 全 completed
- 🟢 單步豁免：可不建立此檔
- Stop Hook 讀取此檔；`IN_PROGRESS` / 未完成 todos / `NEED_REVISION` 時最多自動迭代 3 輪
- 此檔已在 `.gitignore`，不會進版控
- 舊版 `workflow-status.md` 仍可被 Hook 讀取，但請 migrate 至 JSON
