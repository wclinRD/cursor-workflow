import { describe, expect, test } from "bun:test";
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import {
  evaluateStopHook,
  getOpenTodos,
  loadWorkflowState,
  readLegacyStatusFromPath,
  readStateJsonFromPath,
  resolveStateJsonPath,
  resolveStatusPath,
  summarizeOpenTodos,
  MAX_ITERATIONS,
} from "./workflow-state.mjs";

const completed = {
  conversation_id: "test",
  status: "completed",
  loop_count: 0,
};

describe("evaluateStopHook", () => {
  test("IDLE with no todos → no followup", () => {
    expect(evaluateStopHook(completed, { status: "IDLE", todos: [] })).toEqual(
      {}
    );
  });

  test("ALL_DONE with no todos → no followup", () => {
    expect(
      evaluateStopHook(completed, { status: "ALL_DONE", todos: [] })
    ).toEqual({});
  });

  test("ALL_DONE with open todos → followup", () => {
    const result = evaluateStopHook(completed, {
      status: "ALL_DONE",
      todos: [{ id: "1", content: "Fix tests", status: "pending" }],
    });
    expect(result.followup_message).toContain("仍有未完成 todos");
    expect(result.followup_message).toContain("Fix tests");
  });

  test("IN_PROGRESS → followup", () => {
    const result = evaluateStopHook(completed, {
      status: "IN_PROGRESS",
      todos: [],
    });
    expect(result.followup_message).toContain("任務進行中");
    expect(result.followup_message).toContain("[迭代 1/3]");
  });

  test("IN_PROGRESS lists open todos", () => {
    const result = evaluateStopHook(completed, {
      status: "IN_PROGRESS",
      todos: [
        { id: "1", content: "Implement hook", status: "in_progress" },
        { id: "2", content: "Update docs", status: "pending" },
      ],
    });
    expect(result.followup_message).toContain("Implement hook");
    expect(result.followup_message).toContain("Update docs");
  });

  test("NEED_REVISION with reason → followup with reason", () => {
    const result = evaluateStopHook(completed, {
      status: "NEED_REVISION",
      revision: "測試未通過",
      todos: [],
    });
    expect(result.followup_message).toContain("需修正：測試未通過");
  });

  test("NEED_REVISION legacy string → followup", () => {
    const result = evaluateStopHook(completed, {
      status: "NEED_REVISION: legacy reason",
      todos: [],
    });
    expect(result.followup_message).toContain("需修正：legacy reason");
  });

  test("unknown status → warning followup", () => {
    const result = evaluateStopHook(completed, {
      status: "CUSTOM_STATUS",
      todos: [],
    });
    expect(result.followup_message).toContain("workflow-state 無效");
    expect(result.followup_message).toContain("CUSTOM_STATUS");
  });

  test("aborted → no followup regardless of status", () => {
    expect(
      evaluateStopHook(
        { ...completed, status: "aborted" },
        { status: "IN_PROGRESS", todos: [] }
      )
    ).toEqual({});
  });

  test("loop_count at max → no followup", () => {
    expect(
      evaluateStopHook(
        { ...completed, loop_count: MAX_ITERATIONS },
        { status: "IN_PROGRESS", todos: [] }
      )
    ).toEqual({});
  });
});

describe("todo helpers", () => {
  test("getOpenTodos splits pending and in_progress", () => {
    const todos = [
      { id: "1", content: "a", status: "completed" },
      { id: "2", content: "b", status: "pending" },
      { id: "3", content: "c", status: "in_progress" },
    ];
    const { pending, inProgress } = getOpenTodos(todos);
    expect(pending).toHaveLength(1);
    expect(inProgress).toHaveLength(1);
  });

  test("summarizeOpenTodos prioritizes in_progress", () => {
    const lines = summarizeOpenTodos([
      { id: "1", content: "pending task", status: "pending" },
      { id: "2", content: "active task", status: "in_progress" },
    ]);
    expect(lines[0]).toContain("active task");
  });
});

describe("legacy workflow-status.md", () => {
  test("missing file → IDLE", () => {
    expect(readLegacyStatusFromPath("/nonexistent/workflow-status.md")).toBe(
      "IDLE"
    );
  });

  test("reads and trims file content", () => {
    const dir = mkdtempSync(join(tmpdir(), "hook-test-"));
    const path = join(dir, "workflow-status.md");
    writeFileSync(path, "  IN_PROGRESS  \n");
    expect(readLegacyStatusFromPath(path)).toBe("IN_PROGRESS");
    rmSync(dir, { recursive: true });
  });
});

describe("workflow-state.json", () => {
  test("reads JSON state", () => {
    const dir = mkdtempSync(join(tmpdir(), "hook-json-"));
    const path = join(dir, "workflow-state.json");
    writeFileSync(
      path,
      JSON.stringify({
        version: 1,
        status: "IN_PROGRESS",
        todos: [{ id: "1", content: "task", status: "pending" }],
      })
    );
    const state = readStateJsonFromPath(path);
    expect(state?.status).toBe("IN_PROGRESS");
    expect(state?.todos).toHaveLength(1);
    rmSync(dir, { recursive: true });
  });

  test("loadWorkflowState prefers JSON over legacy md", () => {
    const base = mkdtempSync(join(tmpdir(), "hook-load-"));
    const hooksDir = join(base, "hooks");
    mkdirSync(hooksDir, { recursive: true });
    writeFileSync(
      join(base, "workflow-state.json"),
      JSON.stringify({ status: "ALL_DONE", todos: [] })
    );
    writeFileSync(join(base, "workflow-status.md"), "IN_PROGRESS");
    const state = loadWorkflowState(hooksDir);
    expect(state.status).toBe("ALL_DONE");
    rmSync(base, { recursive: true });
  });
});

describe("resolveStateJsonPath", () => {
  test("resolves relative to hook directory", () => {
    const path = resolveStateJsonPath("/project/.cursor/hooks");
    expect(path).toBe("/project/.cursor/workflow-state.json");
  });

  test("resolveStatusPath keeps legacy location", () => {
    const path = resolveStatusPath("/project/.cursor/hooks");
    expect(path).toBe("/project/.cursor/workflow-status.md");
  });
});
