import { readFileSync, existsSync } from "fs";

interface StopHookInput {
  conversation_id: string;
  status: "completed" | "aborted" | "error";
  loop_count: number;
}

const MAX_ITERATIONS = 3;
const SCRATCHPAD_PATH = ".cursor/scratchpad.md";

async function main() {
  // 讀取 stdin 輸入
  const input: StopHookInput = await Bun.stdin.json();

  // 如果對話異常或超過迭代上限，停止
  if (input.status !== "completed" || input.loop_count >= MAX_ITERATIONS) {
    console.log(JSON.stringify({}));
    process.exit(0);
  }

  // 讀取 scratchpad.md
  const scratchpad = existsSync(SCRATCHPAD_PATH)
    ? readFileSync(SCRATCHPAD_PATH, "utf-8")
    : "";

  // 檢查是否已完成
  if (scratchpad.includes("ALL_DONE")) {
    console.log(JSON.stringify({}));
    process.exit(0);
  }

  // 檢查是否需要修正
  if (scratchpad.includes("NEED_REVISION")) {
    const reason = scratchpad.split("NEED_REVISION")[1]?.trim() || "未指定原因";
    console.log(
      JSON.stringify({
        followup_message: `[迭代 ${input.loop_count + 1}/${MAX_ITERATIONS}] 發現問題需要修正：${reason}\n\n請重新執行 Phase 1: THINK，分析問題並修正。`,
      })
    );
    process.exit(0);
  }

  // 檢查是否還有未完成的任務
  if (
    scratchpad.includes("pending") ||
    scratchpad.includes("in_progress")
  ) {
    console.log(
      JSON.stringify({
        followup_message: `[迭代 ${input.loop_count + 1}/${MAX_ITERATIONS}] 任務尚未完成，請繼續執行下一個子任務。`,
      })
    );
    process.exit(0);
  }

  // 如果 scratchpad 為空或格式不對，可能是首次執行
  if (!scratchpad.includes("|")) {
    console.log(
      JSON.stringify({
        followup_message: `[迭代 ${input.loop_count + 1}/${MAX_ITERATIONS}] 請先執行 Phase 1: THINK，分析任務並寫入 .cursor/scratchpad.md。`,
      })
    );
    process.exit(0);
  }

  // 預設：停止
  console.log(JSON.stringify({}));
}

main();
