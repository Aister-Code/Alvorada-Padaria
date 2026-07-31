import { parseDecisions, parseTaskContract, pass, fail } from "./lib.mjs";

const contract = parseTaskContract();
const decisions = parseDecisions();
const decisionMap = new Map(decisions.map((decision) => [decision.id, decision]));

const errors = [];

if (!Array.isArray(contract.decision_ids) || contract.decision_ids.length === 0) {
  errors.push("decision_ids must contain at least one DEC-* id.");
}

for (const id of contract.decision_ids || []) {
  if (!/^DEC-[A-Z0-9-]+$/.test(id)) errors.push(`Invalid decision id: ${id}`);
  const decision = decisionMap.get(id);
  if (!decision) errors.push(`Decision not found: ${id}`);
  if (decision?.status === "superseded") errors.push(`Decision is superseded: ${id}`);
}

if (!Array.isArray(contract.allowed_files) || contract.allowed_files.length === 0) {
  errors.push("allowed_files must not be empty.");
}

if (!Array.isArray(contract.protected_files)) {
  errors.push("protected_files must be declared, even if empty.");
}

if (!Array.isArray(contract.references) || contract.references.length === 0) {
  errors.push("references must point to documents, lines or screenshots.");
}

if (errors.length) fail("invalid task contract", errors);
pass("task contract is present and references active decisions");
