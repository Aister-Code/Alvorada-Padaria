import { collectFiles, fail, normalizePath, parseDecisions, parseTaskContract, pass, readText } from "./lib.mjs";
import { fileURLToPath } from "node:url";

export function isRuntimeCopyFile(file) {
  const normalized = normalizePath(file);

  if (!normalized.startsWith("src/")) return false;
  if (/(^|\/)(docs|scripts|screenshots|fixtures|__fixtures__|__snapshots__)\//.test(normalized)) return false;
  if (/\.(test|spec)\.[cm]?[jt]sx?$/.test(normalized)) return false;
  if (/\.(snap|png|jpe?g|webp|gif|svg|md|ya?ml|json)$/.test(normalized)) return false;

  return /\.[cm]?[jt]sx?$/.test(normalized);
}

export function buildForbiddenCopySet(decisions, decisionIds) {
  const activeIds = new Set(decisionIds || []);
  const activeDecisions = decisions.filter((decision) => activeIds.has(decision.id));
  const forbidden = new Set(["Continuar para o tamanho"]);

  for (const decision of activeDecisions) {
    for (const phrase of decision.forbidden_copy || []) forbidden.add(phrase);
  }

  return forbidden;
}

export function findForbiddenCopyHits(files, forbidden, read = readText) {
  const hits = [];

  for (const file of files.filter(isRuntimeCopyFile)) {
    const text = read(file);
    for (const phrase of forbidden) {
      if (phrase && text.includes(phrase)) hits.push(`${file}: ${phrase}`);
    }
  }

  return hits;
}

export function runForbiddenCopyGuard() {
  const contract = parseTaskContract();
  const decisions = parseDecisions();
  const forbidden = buildForbiddenCopySet(decisions, contract.decision_ids || []);
  const scanPaths = contract.scan_paths?.length ? contract.scan_paths : ["src"];
  const files = collectFiles(scanPaths);
  const hits = findForbiddenCopyHits(files, forbidden);

  if (hits.length) fail("forbidden copy found", hits);
  pass("forbidden copy is absent from runtime UI files");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  runForbiddenCopyGuard();
}
