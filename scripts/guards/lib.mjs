import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

export const repoRoot = process.cwd();

export function fail(message, details = []) {
  console.error(`GUARD FAIL: ${message}`);
  for (const detail of details) console.error(`- ${detail}`);
  process.exit(1);
}

export function pass(message) {
  console.log(`GUARD OK: ${message}`);
}

export function git(args) {
  return execFileSync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

export function normalizePath(filePath) {
  return filePath.replace(/\\/g, "/").replace(/^\.\//, "");
}

export function taskContractPath() {
  return normalizePath(process.env.TASK_CONTRACT || ".codex/current-task.yaml");
}

export function parseTaskContract(filePath = taskContractPath()) {
  if (!existsSync(filePath)) {
    fail("current task contract not found", [
      `Expected ${filePath}`,
      "Create .codex/current-task.yaml from .codex/current-task.example.yaml.",
    ]);
  }

  const text = readFileSync(filePath, "utf8");
  const contract = {};
  let currentArray = null;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/\s+#.*$/, "");
    if (!line.trim()) continue;

    const keyMatch = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (keyMatch) {
      currentArray = null;
      const [, key, value] = keyMatch;
      if (value === "") {
        contract[key] = [];
        currentArray = key;
      } else {
        contract[key] = stripQuotes(value);
      }
      continue;
    }

    const itemMatch = line.match(/^\s*-\s*(.*)$/);
    if (itemMatch && currentArray) {
      contract[currentArray].push(stripQuotes(itemMatch[1]));
    }
  }

  return contract;
}

export function parseDecisions(filePath = "docs/arquitetura/decisoes/pizza.yaml") {
  if (!existsSync(filePath)) fail("decision registry not found", [filePath]);
  const text = readFileSync(filePath, "utf8");
  const decisions = [];
  let current = null;
  let currentArray = null;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/\s+#.*$/, "");
    if (!line.trim()) continue;

    const start = line.match(/^  - id:\s*(.*)$/);
    if (start) {
      current = { id: stripQuotes(start[1]) };
      decisions.push(current);
      currentArray = null;
      continue;
    }

    if (!current) continue;

    const key = line.match(/^    ([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (key) {
      const [, name, value] = key;
      currentArray = null;
      if (value === "[]") {
        current[name] = [];
      } else if (value === "") {
        current[name] = [];
        currentArray = name;
      } else {
        current[name] = stripQuotes(value);
      }
      continue;
    }

    const item = line.match(/^      -\s*(.*)$/);
    if (item && currentArray) {
      current[currentArray].push(stripQuotes(item[1]));
    }
  }

  return decisions;
}

export function changedFiles() {
  const files = new Set();
  addLines(files, git(["diff", "--name-only"]));
  addLines(files, git(["diff", "--cached", "--name-only"]));
  addLines(files, git(["ls-files", "--others", "--exclude-standard"]));
  return [...files].map(normalizePath).filter(Boolean).sort();
}

export function currentBranch() {
  return git(["branch", "--show-current"]);
}

export function currentHead() {
  return git(["rev-parse", "HEAD"]);
}

export function fileSha256(filePath) {
  if (!existsSync(filePath)) return null;
  return createHash("sha256").update(readFileSync(filePath)).digest("hex");
}

export function textSha256(text) {
  return createHash("sha256").update(text).digest("hex");
}

export function worktreeEntries() {
  const files = new Set(changedFiles());
  const staged = new Set(lines(git(["diff", "--cached", "--name-only"])));
  const unstaged = new Set(lines(git(["diff", "--name-only"])));
  const untracked = new Set(lines(git(["ls-files", "--others", "--exclude-standard"])));

  return [...files].sort().map((file) => ({
    path: file,
    hash: fileSha256(file),
    exists: existsSync(file),
    staged: staged.has(file),
    unstaged: unstaged.has(file),
    untracked: untracked.has(file),
    status: statusFor(file, { staged, unstaged, untracked }),
  }));
}

export function stagedFiles() {
  return lines(git(["diff", "--cached", "--name-only"]));
}

export function globToRegex(pattern) {
  const normalized = normalizePath(pattern);
  const escaped = normalized.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  const regex = escaped.replace(/\*\*/g, ".*").replace(/\*/g, "[^/]*");
  return new RegExp(`^${regex}$`);
}

export function matchesAny(filePath, patterns = []) {
  return patterns.some((pattern) => globToRegex(pattern).test(normalizePath(filePath)));
}

export function collectFiles(paths) {
  const result = [];
  for (const item of paths) {
    if (!existsSync(item)) continue;
    const stats = statSync(item);
    if (stats.isDirectory()) {
      for (const child of readdirSync(item)) {
        result.push(...collectFiles([path.join(item, child)]));
      }
    } else {
      result.push(normalizePath(item));
    }
  }
  return result;
}

export function readText(filePath) {
  return readFileSync(filePath, "utf8");
}

export function baselinePayloadHash(payload) {
  return textSha256(stableStringify(payload));
}

function addLines(set, text) {
  for (const line of lines(text)) set.add(line);
}

function lines(text) {
  return text
    .split(/\r?\n/)
    .map((line) => normalizePath(line.trim()))
    .filter(Boolean);
}

function stripQuotes(value) {
  return value.replace(/^["']|["']$/g, "");
}

function statusFor(file, { staged, unstaged, untracked }) {
  const parts = [];
  if (staged.has(file)) parts.push("staged");
  if (unstaged.has(file)) parts.push("unstaged");
  if (untracked.has(file)) parts.push("untracked");
  return parts.join("+") || "clean";
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}
