import { readFileSync } from "node:fs";
import { baselinePath, evaluateBaseline, loadBaseline } from "./baseline-lib.mjs";
import { currentBranch, currentHead, fail, parseTaskContract, pass, taskContractPath, worktreeEntries } from "./lib.mjs";

const baseline = loadBaseline(baselinePath);
const contractPath = taskContractPath();
const contract = parseTaskContract();
const contractText = readFileSync(contractPath, "utf8");
const errors = evaluateBaseline({
  baseline,
  contract,
  contractText,
  currentEntries: worktreeEntries(),
  branch: currentBranch(),
  head: currentHead(),
}).filter((error) => error.startsWith("protected file"));

if (errors.length) {
  fail("protected files changed after baseline", errors);
}

pass("protected files match the captured baseline and are not staged");
