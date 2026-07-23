import { describe, expect, test } from "bun:test";
import { mkdtempSync, writeFileSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import {
  evaluateStopHook,
  readStatusFromPath,
  resolveStatusPath,
  MAX_ITERATIONS,
  type StopHookInput,
} from "./check-progress";

const completed: StopHookInput = {
  conversation_id: "test",
  status: "completed",
  loop_count: 0,
};

describe("evaluateStopHook", () => {
  test("IDLE → no followup", () => {
    expect(evaluateStopHook(completed, "IDLE")).toEqual({});
  });

  test("ALL_DONE → no followup", () => {
    expect(evaluateStopHook(completed, "ALL_DONE")).toEqual({});
  });

  test("ALL_DONE with suffix → no followup", () => {
    expect(evaluateStopHook(completed, "ALL_DONE - finished")).toEqual({});
  });

  test("IN_PROGRESS → followup", () => {
    const result = evaluateStopHook(completed, "IN_PROGRESS");
    expect(result.followup_message).toContain("任務進行中");
    expect(result.followup_message).toContain("[迭代 1/3]");
  });

  test("IN_PROGRESS with whitespace → followup", () => {
    const result = evaluateStopHook(completed, "  IN_PROGRESS  ");
    expect(result.followup_message).toContain("任務進行中");
  });

  test("NEED_REVISION with reason → followup with reason", () => {
    const result = evaluateStopHook(completed, "NEED_REVISION: 測試未通過");
    expect(result.followup_message).toContain("需修正：測試未通過");
  });

  test("NEED_REVISION lowercase → followup", () => {
    const result = evaluateStopHook(completed, "need_revision: lowercase");
    expect(result.followup_message).toContain("需修正：lowercase");
  });

  test("NEED_REVISION empty reason → fallback", () => {
    const result = evaluateStopHook(completed, "NEED_REVISION:");
    expect(result.followup_message).toContain("未指定原因");
  });

  test("unknown status → warning followup", () => {
    const result = evaluateStopHook(completed, "CUSTOM_STATUS");
    expect(result.followup_message).toContain("workflow-status 無效");
    expect(result.followup_message).toContain("CUSTOM_STATUS");
  });

  test("aborted → no followup regardless of status", () => {
    expect(
      evaluateStopHook({ ...completed, status: "aborted" }, "IN_PROGRESS")
    ).toEqual({});
  });

  test("error → no followup regardless of status", () => {
    expect(
      evaluateStopHook({ ...completed, status: "error" }, "IN_PROGRESS")
    ).toEqual({});
  });

  test("loop_count at max → no followup", () => {
    expect(
      evaluateStopHook(
        { ...completed, loop_count: MAX_ITERATIONS },
        "IN_PROGRESS"
      )
    ).toEqual({});
  });

  test("loop_count 2 → shows iteration 3/3", () => {
    const result = evaluateStopHook(
      { ...completed, loop_count: 2 },
      "IN_PROGRESS"
    );
    expect(result.followup_message).toContain("[迭代 3/3]");
  });
});

describe("readStatusFromPath", () => {
  test("missing file → IDLE", () => {
    expect(readStatusFromPath("/nonexistent/workflow-status.md")).toBe("IDLE");
  });

  test("reads and trims file content", () => {
    const dir = mkdtempSync(join(tmpdir(), "hook-test-"));
    const path = join(dir, "workflow-status.md");
    writeFileSync(path, "  IN_PROGRESS  \n");
    expect(readStatusFromPath(path)).toBe("IN_PROGRESS");
    rmSync(dir, { recursive: true });
  });
});

describe("resolveStatusPath", () => {
  test("resolves relative to hook directory", () => {
    const path = resolveStatusPath("/project/.cursor/hooks");
    expect(path).toBe("/project/.cursor/workflow-status.md");
  });
});
