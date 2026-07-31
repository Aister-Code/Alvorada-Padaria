import { readFileSync } from "node:fs";
import { baselinePath, evaluateBaseline, loadBaseline } from "./baseline-lib.mjs";
import { currentBranch, currentHead, fail, parseTaskContract, pass, taskContractPath, worktreeEntries } from "./lib.mjs";

const baseline = loadBaseline(baselinePath);
const contractPath = taskContractPath();
const contract = parseTaskContract(contractPath);
const contractText = readFileSync(contractPath, "utf8");
const errors = evaluateBaseline({
  baseline,
  contract,
  contractText,
  currentEntries: worktreeEntries(),
  branch: currentBranch(),
  head: currentHead(),
});

if (errors.length) fail("worktree baseline validation failed", errors);
pass("worktree changes match the captured baseline and task scope");
