# /status — 更新 workflow-status

更新 `.cursor/workflow-status.md` 任務狀態：

$ARGUMENTS

## 有效值

| 值 | 用途 |
|----|------|
| `IDLE` | 無進行中任務（純問答後重置） |
| `IN_PROGRESS` | 開始實作前 |
| `ALL_DONE` | 所有子任務完成且驗證通過 |
| `NEED_REVISION: [原因]` | 審查發現需修正 |

## 流程

1. 解析使用者指定的狀態（若未指定，詢問）
2. 寫入 `.cursor/workflow-status.md`（僅一行，不含多餘空白）
3. 確認寫入結果並回報

## 注意

- 有實作步驟的任務：開始前設 `IN_PROGRESS`，完成後設 `ALL_DONE`
- Stop Hook 會讀取此檔；`IN_PROGRESS` 或 `NEED_REVISION` 時最多自動迭代 3 輪
- 此檔已在 `.gitignore`，不會進版控
