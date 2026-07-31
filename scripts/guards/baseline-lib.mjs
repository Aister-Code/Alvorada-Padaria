import { existsSync, readFileSync } from "node:fs";
import { baselinePayloadHash, currentBranch, currentHead, fail, fileSha256, matchesAny, normalizePath, parseTaskContract, textSha256, worktreeEntries } from "./lib.mjs";

export const baselinePath = ".codex/worktree-baseline.json";

export function createBaseline(contractPath = ".codex/current-task.yaml") {
  const contract = parseTaskContract(contractPath);
  const contractText = readFileSync(contractPath, "utf8");
  const payload = {
    schema_version: 1,
    captured_at: new Date().toISOString(),
    head: currentHead(),
    branch: currentBranch(),
    contract: {
      path: normalizePath(contractPath),
      sha256: textSha256(contractText),
      task_id: contract.task_id || null,
      decision_ids: contract.decision_ids || [],
    },
    protected_files: contract.protected_files || [],
    entries: worktreeEntries(),
  };

  return {
    ...payload,
    integrity: {
      payload_sha256: baselinePayloadHash(payload),
    },
  };
}

export function loadBaseline(filePath = baselinePath) {
  if (!existsSync(filePath)) {
    fail("worktree baseline not found", [
      `Expected ${filePath}`,
      "Run npm.cmd run guard:baseline:capture before functional edits.",
    ]);
  }

  const baseline = JSON.parse(readFileSync(filePath, "utf8"));
  assertBaselineIntegrity(baseline);
  return baseline;
}

export function assertBaselineIntegrity(baseline) {
  const { integrity, ...payload } = baseline;
  if (!integrity?.payload_sha256) {
    fail("baseline integrity marker missing");
  }

  const currentHash = baselinePayloadHash(payload);
  if (currentHash !== integrity.payload_sha256) {
    fail("baseline integrity check failed", [
      "The baseline appears to have been edited after capture.",
    ]);
  }
}

export function evaluateBaseline({ baseline, contract, contractText, currentEntries, branch, head }) {
  const errors = [];

  if (baseline.branch !== branch) {
    errors.push(`branch changed: baseline=${baseline.branch} current=${branch}`);
  }

  if (baseline.head !== head) {
    errors.push(`HEAD changed: baseline=${baseline.head} current=${head}`);
  }

  const contractHash = textSha256(contractText);
  if (baseline.contract?.sha256 !== contractHash) {
    errors.push("current task contract changed after baseline capture");
  }

  const allowed = contract.allowed_files || [];
  const protectedFiles = contract.protected_files || [];
  const baselineMap = new Map((baseline.entries || []).map((entry) => [normalizePath(entry.path), entry]));
  const currentMap = new Map(currentEntries.map((entry) => [normalizePath(entry.path), entry]));
  const allPaths = new Set([...baselineMap.keys(), ...currentMap.keys()]);

  for (const file of [...allPaths].sort()) {
    const current = currentMap.get(file) || currentEntryFor(file);
    const previous = baselineMap.get(file);
    const isAllowed = matchesAny(file, allowed);
    const isProtected = matchesAny(file, protectedFiles);

    if (isProtected) {
      if (current.staged) {
        errors.push(`protected file entered staging: ${file}`);
      }
      if (!previous && current.exists) {
        errors.push(`protected file changed after baseline: ${file}`);
      } else if (previous && current.hash !== previous.hash) {
        errors.push(`protected file content changed after baseline: ${file}`);
      }
      continue;
    }

    if (isAllowed) continue;

    if (!previous) {
      errors.push(`file outside scope changed during task: ${file}`);
      continue;
    }

    if (current.hash !== previous.hash) {
      errors.push(`file outside scope changed during task: ${file}`);
    }

    if (current.staged && !previous.staged) {
      errors.push(`file outside scope became staged during task: ${file}`);
    }
  }

  return errors;
}

export function currentEntryFor(file) {
  return {
    path: normalizePath(file),
    hash: fileSha256(file),
    exists: existsSync(file),
    staged: false,
    unstaged: false,
    untracked: false,
    status: "clean-or-deleted",
  };
}
