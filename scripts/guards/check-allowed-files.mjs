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
}).filter((error) =>
  error.startsWith("file outside scope") ||
  error.includes("became staged during task") ||
  error.includes("contract changed"),
);

if (errors.length) {
  fail("allowed_files validation failed", errors);
}

pass("files outside allowed_files match the captured baseline");
