import { describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import {
  injectExaCompress,
  trackPostToolUse,
  readHookSession,
  resetHookSession,
  COMPACT_TOOL_INTERVAL,
} from "./token-automation.mjs";

describe("injectExaCompress", () => {
  test("non-exa tool → allow without updated_input", () => {
    expect(
      injectExaCompress({ tool_name: "Read", tool_input: { path: "a.ts" } })
    ).toEqual({ permission: "allow" });
  });

  test("smart_exa_search → inject caveman defaults", () => {
    const result = injectExaCompress({
      tool_name: "MCP: user-smart-smart_exa_search",
      tool_input: { command: "search", query: "hooks" },
    });
    expect(result.permission).toBe("allow");
    expect(result.updated_input).toEqual({
      command: "search",
      query: "hooks",
      compress: "caveman",
      compressLevel: "semantic",
    });
  });

  test("respect explicit compress none", () => {
    const result = injectExaCompress({
      tool_name: "MCP: user-smart-smart_exa_crawl",
      tool_input: { url: "https://example.com", compress: "none" },
    });
    expect(result.updated_input).toBeUndefined();
  });

  test("preserve custom compressLevel", () => {
    const result = injectExaCompress({
      tool_name: "MCP: user-smart-smart_exa_search",
      tool_input: {
        command: "search",
        query: "x",
        compress: "caveman",
        compressLevel: "aggressive",
      },
    });
    expect(result.updated_input?.compressLevel).toBe("aggressive");
  });
});

describe("trackPostToolUse", () => {
  test("injects additional_context at interval", () => {
    const dir = mkdtempSync(join(tmpdir(), "token-hook-"));
    const sessionPath = join(dir, "hook-session.json");
    resetHookSession(sessionPath);

    let last = {};
    for (let i = 0; i < COMPACT_TOOL_INTERVAL; i += 1) {
      last = trackPostToolUse({ tool_name: "Read" }, sessionPath, 5);
    }
    expect(last.additional_context).toContain("[token-auto]");
    expect(last.additional_context).toContain("smart_compact");

    rmSync(dir, { recursive: true });
  });

  test("smart_compact resets counter window", () => {
    const dir = mkdtempSync(join(tmpdir(), "token-hook-"));
    const sessionPath = join(dir, "hook-session.json");
    resetHookSession(sessionPath);

    for (let i = 0; i < 4; i += 1) {
      trackPostToolUse({ tool_name: "Shell" }, sessionPath, 5);
    }
    trackPostToolUse(
      { tool_name: "MCP: user-smart-smart_compact" },
      sessionPath,
      5
    );
    const session = readHookSession(sessionPath);
    expect(session.tool_count).toBe(5);
    expect(session.last_compact_at).toBe(5);

    const next = trackPostToolUse({ tool_name: "Read" }, sessionPath, 5);
    expect(next.additional_context).toBeUndefined();

    rmSync(dir, { recursive: true });
  });
});
