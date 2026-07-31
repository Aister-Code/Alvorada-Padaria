import { fail, parseDecisions, parseTaskContract, pass } from "./lib.mjs";

const contract = parseTaskContract();
const decisions = parseDecisions();
const decisionMap = new Map(decisions.map((decision) => [decision.id, decision]));
const errors = [];

for (const id of contract.decision_ids || []) {
  const decision = decisionMap.get(id);
  if (!decision) {
    errors.push(`Decision ${id} is not registered.`);
    continue;
  }
  if (decision.status === "pending") errors.push(`Decision ${id} is pending and cannot authorize code.`);
  if (decision.status === "superseded") errors.push(`Decision ${id} is superseded and cannot be used.`);
  if (!Array.isArray(decision.sources) || decision.sources.length === 0) {
    errors.push(`Decision ${id} has no source references.`);
  }
}

if (errors.length) fail("decision id validation failed", errors);
pass("all task decision ids are registered, sourced and active");
