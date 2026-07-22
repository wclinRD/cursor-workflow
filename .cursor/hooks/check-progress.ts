import { readFileSync, existsSync } from "fs";

interface StopHookInput {
  conversation_id: string;
  status: "completed" | "aborted" | "error";
  loop_count: number;
}

const MAX_ITERATIONS = 3;
const STATUS_PATH = ".cursor/workflow-status.md";

function readStatus(): string {
  if (!existsSync(STATUS_PATH)) return "IDLE";
  return readFileSync(STATUS_PATH, "utf-8").trim();
}

async function main() {
  const input: StopHookInput = await Bun.stdin.json();

  if (input.status !== "completed" || input.loop_count >= MAX_ITERATIONS) {
    console.log(JSON.stringify({}));
    process.exit(0);
  }

  const status = readStatus();

  if (status.startsWith("ALL_DONE") || status === "IDLE") {
    console.log(JSON.stringify({}));
    process.exit(0);
  }

  if (status.startsWith("NEED_REVISION")) {
    const reason =
      status.replace(/^NEED_REVISION:?\s*/i, "").slice(0, 200) ||
      "未指定原因";
    console.log(
      JSON.stringify({
        followup_message: `[迭代 ${input.loop_count + 1}/${MAX_ITERATIONS}] 需修正：${reason}\n\n請重新 THINK，用 TodoWrite 更新任務後繼續；修正完再更新 workflow-status。`,
      })
    );
    process.exit(0);
  }

  if (status.startsWith("IN_PROGRESS")) {
    console.log(
      JSON.stringify({
        followup_message: `[迭代 ${input.loop_count + 1}/${MAX_ITERATIONS}] 🔴 任務進行中：請檢查 TodoWrite 是否有未完成項，繼續下一子任務；全部完成後執行 /review 並將 workflow-status 設為 ALL_DONE。`,
      })
    );
    process.exit(0);
  }

  console.log(JSON.stringify({}));
}

main();
