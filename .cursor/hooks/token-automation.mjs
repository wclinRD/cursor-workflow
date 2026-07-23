import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

export const DEFAULT_COMPRESS = "caveman";
export const DEFAULT_COMPRESS_LEVEL = "semantic";
export const COMPACT_TOOL_INTERVAL = 15;

/**
 * @param {unknown} input
 * @returns {Record<string, unknown>}
 */
export function getToolInput(input) {
  const record = /** @type {Record<string, unknown>} */ (input ?? {});
  const raw =
    record.tool_input ??
    record.toolInput ??
    record.arguments ??
    record.input ??
    {};
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return typeof raw === "object" && raw !== null
    ? /** @type {Record<string, unknown>} */ (raw)
    : {};
}

/**
 * @param {unknown} input
 * @returns {string}
 */
export function getToolName(input) {
  const record = /** @type {Record<string, unknown>} */ (input ?? {});
  return String(record.tool_name ?? record.toolName ?? "");
}

/**
 * @param {unknown} input
 * @returns {boolean}
 */
export function isExaSearchOrCrawl(input) {
  return /smart_exa_(search|crawl)/i.test(getToolName(input));
}

/**
 * @param {unknown} input
 * @returns {{ permission: string; updated_input?: Record<string, unknown> }}
 */
export function injectExaCompress(input) {
  if (!isExaSearchOrCrawl(input)) {
    return { permission: "allow" };
  }

  const toolInput = getToolInput(input);
  if (toolInput.compress === "none") {
    return { permission: "allow" };
  }

  return {
    permission: "allow",
    updated_input: {
      ...toolInput,
      compress: toolInput.compress ?? DEFAULT_COMPRESS,
      compressLevel: toolInput.compressLevel ?? DEFAULT_COMPRESS_LEVEL,
    },
  };
}

/**
 * @param {string} sessionPath
 * @returns {{ tool_count: number; last_compact_at: number }}
 */
export function readHookSession(sessionPath) {
  if (!existsSync(sessionPath)) {
    return { tool_count: 0, last_compact_at: 0 };
  }
  try {
    const parsed = JSON.parse(readFileSync(sessionPath, "utf-8"));
    return {
      tool_count: Number(parsed.tool_count) || 0,
      last_compact_at: Number(parsed.last_compact_at) || 0,
    };
  } catch {
    return { tool_count: 0, last_compact_at: 0 };
  }
}

/**
 * @param {string} sessionPath
 * @param {{ tool_count: number; last_compact_at: number }} session
 */
export function writeHookSession(sessionPath, session) {
  mkdirSync(dirname(sessionPath), { recursive: true });
  writeFileSync(
    sessionPath,
    `${JSON.stringify({ version: 1, ...session }, null, 2)}\n`,
    "utf-8"
  );
}

/**
 * @param {unknown} input
 * @param {string} sessionPath
 * @param {number} [interval]
 * @returns {{ additional_context?: string }}
 */
export function trackPostToolUse(input, sessionPath, interval = COMPACT_TOOL_INTERVAL) {
  const session = readHookSession(sessionPath);
  session.tool_count += 1;

  const toolName = getToolName(input);
  if (/smart_compact/i.test(toolName)) {
    session.last_compact_at = session.tool_count;
    writeHookSession(sessionPath, session);
    return {};
  }

  const sinceCompact = session.tool_count - session.last_compact_at;
  writeHookSession(sessionPath, session);

  if (sinceCompact >= interval) {
    return {
      additional_context: `[token-auto] 已累積 ${sinceCompact} 次 tool 呼叫（自動閾值 ${interval}）。請在本回合立即呼叫 smart_compact({ auto: true, currentGoal: "<當前任務>", currentTodos: [/* workflow-state.json */] })，無需等待使用者下指令；完成後繼續任務。`,
    };
  }

  return {};
}

/**
 * @param {string} sessionPath
 */
export function resetHookSession(sessionPath) {
  writeHookSession(sessionPath, { tool_count: 0, last_compact_at: 0 });
}

/**
 * @param {string} [hookDir]
 */
export function resolveHookSessionPath(hookDir = import.meta.dirname) {
  return join(hookDir, "..", "hook-session.json");
}

async function readStdinJson() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf-8").trim();
  if (!raw) return {};
  return JSON.parse(raw);
}

async function main(mode) {
  const input = await readStdinJson();
  const sessionPath = resolveHookSessionPath();

  if (mode === "pre-exa-compress") {
    console.log(JSON.stringify(injectExaCompress(input)));
    return;
  }

  if (mode === "post-compact-track") {
    console.log(JSON.stringify(trackPostToolUse(input, sessionPath)));
    return;
  }

  if (mode === "session-reset") {
    resetHookSession(sessionPath);
    console.log(JSON.stringify({ ok: true }));
    return;
  }

  throw new Error(`Unknown token automation mode: ${mode}`);
}

const mode = process.argv[2];
const isMainModule =
  typeof import.meta.main === "boolean"
    ? import.meta.main
    : process.argv[1] === fileURLToPath(import.meta.url);

if (isMainModule) {
  main(mode).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
