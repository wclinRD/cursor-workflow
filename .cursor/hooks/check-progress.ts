import { readFileSync, existsSync } from "fs";
import { join } from "path";

export const MAX_ITERATIONS = 3;

export interface StopHookInput {
  conversation_id: string;
  status: "completed" | "aborted" | "error";
  loop_count: number;
}

export function resolveStatusPath(hookDir = import.meta.dir): string {
  return join(hookDir, "..", "workflow-status.md");
}

export function readStatusFromPath(statusPath: string): string {
  if (!existsSync(statusPath)) return "IDLE";
  return readFileSync(statusPath, "utf-8").trim();
}

export function evaluateStopHook(
  input: StopHookInput,
  status: string
): { followup_message?: string } {
  if (input.status !== "completed" || input.loop_count >= MAX_ITERATIONS) {
    return {};
  }

  const normalized = status.trim();
  const upper = normalized.toUpperCase();

  if (upper.startsWith("ALL_DONE") || normalized === "IDLE") {
    return {};
  }

  if (upper.startsWith("NEED_REVISION")) {
    const reason =
      normalized.replace(/^NEED_REVISION:?\s*/i, "").slice(0, 200) ||
      "未指定原因";
    return {
      followup_message: `[迭代 ${input.loop_count + 1}/${MAX_ITERATIONS}] 需修正：${reason}\n\n請重新 THINK，用 TodoWrite 更新任務後繼續；修正完再更新 workflow-status。`,
    };
  }

  if (upper.startsWith("IN_PROGRESS")) {
    return {
      followup_message: `[迭代 ${input.loop_count + 1}/${MAX_ITERATIONS}] 任務進行中：請檢查 TodoWrite 是否有未完成項，繼續下一子任務；全部完成後執行 /review 並將 workflow-status 設為 ALL_DONE。`,
    };
  }

  return {
    followup_message: `[迭代 ${input.loop_count + 1}/${MAX_ITERATIONS}] workflow-status 無效：「${normalized.slice(0, 100)}」。有效值：IDLE | IN_PROGRESS | ALL_DONE | NEED_REVISION: [原因]`,
  };
}

async function main() {
  const input: StopHookInput = await Bun.stdin.json();
  const status = readStatusFromPath(resolveStatusPath());
  console.log(JSON.stringify(evaluateStopHook(input, status)));
}

if (import.meta.main) {
  main();
}
