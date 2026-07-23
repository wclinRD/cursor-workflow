# 已棄用：請改用 workflow-state.template.json

此檔為舊版單行 status 格式。Stop Hook 仍會讀取，但**不支援 todos 驗證**。

## 遷移

```bash
cp .cursor/workflow-state.template.json .cursor/workflow-state.json
```

## 舊格式（僅 status）

```
IDLE
```

有效值：`IDLE` | `IN_PROGRESS` | `ALL_DONE` | `NEED_REVISION: [原因]`
