import { describe, expect, it } from "vitest";
import { evaluateBaseline } from "./baseline-lib.mjs";
import { textSha256 } from "./lib.mjs";

const contractText = "task_id: x\nallowed_files:\n  - src/allowed.ts\nprotected_files:\n  - src/protected.ts\n";
const baseContract = {
  allowed_files: ["src/allowed.ts"],
  protected_files: ["src/protected.ts"],
};

function entry(path, hash, staged = false) {
  return { path, hash, exists: true, staged, unstaged: !staged, untracked: false, status: staged ? "staged" : "unstaged" };
}

function baseline(entries) {
  return {
    branch: "feature/m005-caixa",
    head: "abc123",
    contract: { sha256: textSha256(contractText) },
    entries,
  };
}

function run(entries, currentEntries, contract = baseContract) {
  return evaluateBaseline({
    baseline: baseline(entries),
    contract,
    contractText,
    currentEntries,
    branch: "feature/m005-caixa",
    head: "abc123",
  });
}

describe("worktree baseline scope guard", () => {
  it("allows a pre-existing dirty file outside allowlist when unchanged", () => {
    expect(run([entry("src/outside.ts", "a")], [entry("src/outside.ts", "a")])).toEqual([]);
  });

  it("fails when a pre-existing dirty file outside allowlist changes", () => {
    expect(run([entry("src/outside.ts", "a")], [entry("src/outside.ts", "b")])).toContain(
      "file outside scope changed during task: src/outside.ts",
    );
  });

  it("allows a pre-existing dirty protected file when unchanged and unstaged", () => {
    expect(run([entry("src/protected.ts", "a")], [entry("src/protected.ts", "a")])).toEqual([]);
  });

  it("fails when a protected file changes after baseline", () => {
    expect(run([entry("src/protected.ts", "a")], [entry("src/protected.ts", "b")])).toContain(
      "protected file content changed after baseline: src/protected.ts",
    );
  });

  it("fails when a protected file enters staging", () => {
    expect(run([entry("src/protected.ts", "a")], [entry("src/protected.ts", "a", true)])).toContain(
      "protected file entered staging: src/protected.ts",
    );
  });

  it("fails for a new file outside allowlist", () => {
    expect(run([], [entry("src/new-outside.ts", "a")])).toContain(
      "file outside scope changed during task: src/new-outside.ts",
    );
  });

  it("allows a new file inside allowlist", () => {
    expect(run([], [entry("src/allowed.ts", "a")])).toEqual([]);
  });

  it("fails when branch or HEAD differ", () => {
    const result = evaluateBaseline({
      baseline: baseline([]),
      contract: baseContract,
      contractText,
      currentEntries: [],
      branch: "other",
      head: "def456",
    });
    expect(result).toContain("branch changed: baseline=feature/m005-caixa current=other");
    expect(result).toContain("HEAD changed: baseline=abc123 current=def456");
  });

  it("fails when the task contract changes after baseline", () => {
    const result = evaluateBaseline({
      baseline: baseline([]),
      contract: baseContract,
      contractText: `${contractText}\nchanged: true\n`,
      currentEntries: [],
      branch: "feature/m005-caixa",
      head: "abc123",
    });
    expect(result).toContain("current task contract changed after baseline capture");
  });
});
