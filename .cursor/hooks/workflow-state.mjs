import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";

export const MAX_ITERATIONS = 3;

/** @typedef {"pending" | "in_progress" | "completed" | "cancelled"} TodoStatus */
/** @typedef {"IDLE" | "IN_PROGRESS" | "ALL_DONE" | "NEED_REVISION"} WorkflowStatus */

/**
 * @typedef {Object} WorkflowTodo
 * @property {string} id
 * @property {string} content
 * @property {TodoStatus} status
 */

/**
 * @typedef {Object} WorkflowState
 * @property {number} [version]
 * @property {WorkflowStatus | string} status
 * @property {WorkflowTodo[]} [todos]
 * @property {string} [revision]
 */

/**
 * @typedef {Object} StopHookInput
 * @property {string} conversation_id
 * @property {"completed" | "aborted" | "error"} status
 * @property {number} loop_count
 */

/**
 * @param {string} [hookDir]
 * @returns {string}
 */
export function resolveStateJsonPath(hookDir = import.meta.dirname) {
  return join(hookDir, "..", "workflow-state.json");
}

/**
 * @param {string} [hookDir]
 * @returns {string}
 */
export function resolveStatusPath(hookDir = import.meta.dirname) {
  return join(hookDir, "..", "workflow-status.md");
}

/**
 * @param {string} raw
 * @returns {WorkflowStatus | string}
 */
export function parseLegacyStatusLine(raw) {
  return raw.trim();
}

/**
 * @param {unknown} value
 * @returns {value is WorkflowState}
 */
export function isWorkflowState(value) {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof /** @type {WorkflowState} */ (value).status === "string"
  );
}

/**
 * @param {string} jsonPath
 * @returns {WorkflowState | null}
 */
export function readStateJsonFromPath(jsonPath) {
  if (!existsSync(jsonPath)) return null;
  try {
    const parsed = JSON.parse(readFileSync(jsonPath, "utf-8"));
    if (!isWorkflowState(parsed)) return null;
    return {
      version: typeof parsed.version === "number" ? parsed.version : 1,
      status: String(parsed.status).trim(),
      todos: Array.isArray(parsed.todos) ? parsed.todos : [],
      revision:
        typeof parsed.revision === "string" ? parsed.revision : undefined,
    };
  } catch {
    return null;
  }
}

/**
 * @param {string} statusPath
 * @returns {string}
 */
export function readLegacyStatusFromPath(statusPath) {
  if (!existsSync(statusPath)) return "IDLE";
  return parseLegacyStatusLine(readFileSync(statusPath, "utf-8"));
}

/**
 * @param {string} hookDir
 * @returns {WorkflowState}
 */
export function loadWorkflowState(hookDir = import.meta.dirname) {
  const jsonState = readStateJsonFromPath(resolveStateJsonPath(hookDir));
  if (jsonState) return jsonState;

  const legacyStatus = readLegacyStatusFromPath(resolveStatusPath(hookDir));
  return {
    version: 1,
    status: legacyStatus,
    todos: [],
  };
}

/**
 * @param {WorkflowTodo[]} todos
 * @returns {{ pending: WorkflowTodo[]; inProgress: WorkflowTodo[] }}
 */
export function getOpenTodos(todos = []) {
  const pending = [];
  const inProgress = [];
  for (const todo of todos) {
    if (!todo || typeof todo.status !== "string") continue;
    if (todo.status === "pending") pending.push(todo);
    if (todo.status === "in_progress") inProgress.push(todo);
  }
  return { pending, inProgress };
}

/**
 * @param {WorkflowTodo[]} todos
 * @returns {string[]}
 */
export function summarizeOpenTodos(todos = []) {
  const { pending, inProgress } = getOpenTodos(todos);
  const open = [...inProgress, ...pending];
  return open.slice(0, 5).map((todo) => {
    const label = todo.content?.trim() || todo.id || "未命名任務";
    return `- [${todo.status}] ${label}`;
  });
}

/**
 * @param {StopHookInput} input
 * @param {WorkflowState} state
 * @returns {{ followup_message?: string }}
 */
export function evaluateStopHook(input, state) {
  if (input.status !== "completed" || input.loop_count >= MAX_ITERATIONS) {
    return {};
  }

  const normalized = String(state.status ?? "").trim();
  const upper = normalized.toUpperCase();
  const openSummary = summarizeOpenTodos(state.todos);
  const openSuffix =
    openSummary.length > 0
      ? `\n\n未完成子任務（workflow-state.json）：\n${openSummary.join("\n")}`
      : "";

  if (upper.startsWith("ALL_DONE") || normalized === "IDLE") {
    if (openSummary.length > 0) {
      return {
        followup_message: `[迭代 ${input.loop_count + 1}/${MAX_ITERATIONS}] workflow-state.json 狀態為 ${normalized}，但仍有未完成 todos。請更新 todos 或將 status 改回 IN_PROGRESS。${openSuffix}`,
      };
    }
    return {};
  }

  if (upper.startsWith("NEED_REVISION")) {
    const reason =
      state.revision?.trim() ||
      normalized.replace(/^NEED_REVISION:?\s*/i, "").slice(0, 200) ||
      "未指定原因";
    return {
      followup_message: `[迭代 ${input.loop_count + 1}/${MAX_ITERATIONS}] 需修正：${reason}\n\n請重新 THINK，更新 workflow-state.json 的 todos 後繼續；修正完再更新 status。${openSuffix}`,
    };
  }

  if (upper.startsWith("IN_PROGRESS")) {
    const todoHint =
      openSummary.length > 0
        ? `\n\n請先處理下列子任務：\n${openSummary.join("\n")}`
        : "\n\n請在 workflow-state.json 建立 todos，或執行 /review 後將 status 設為 ALL_DONE。";
    return {
      followup_message: `[迭代 ${input.loop_count + 1}/${MAX_ITERATIONS}] 任務進行中：請更新 workflow-state.json（status + todos），完成後執行 /review 並設為 ALL_DONE。${todoHint}`,
    };
  }

  return {
    followup_message: `[迭代 ${input.loop_count + 1}/${MAX_ITERATIONS}] workflow-state 無效：「${normalized.slice(0, 100)}」。有效 status：IDLE | IN_PROGRESS | ALL_DONE | NEED_REVISION${openSuffix}`,
  };
}

/**
 * @param {StopHookInput} input
 * @param {string} hookDir
 * @returns {{ followup_message?: string }}
 */
export function runStopHook(input, hookDir = import.meta.dirname) {
  const state = loadWorkflowState(hookDir);
  return evaluateStopHook(input, state);
}

async function readStdinJson() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf-8").trim();
  if (!raw) {
    throw new Error("Stop Hook stdin is empty");
  }
  return /** @type {StopHookInput} */ (JSON.parse(raw));
}

async function main() {
  const input = await readStdinJson();
  console.log(JSON.stringify(runStopHook(input)));
}

const isMainModule =
  typeof import.meta.main === "boolean"
    ? import.meta.main
    : process.argv[1] === fileURLToPath(import.meta.url);

if (isMainModule) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
