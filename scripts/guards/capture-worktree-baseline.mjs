import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createBaseline, baselinePath } from "./baseline-lib.mjs";
import { pass } from "./lib.mjs";

const baseline = createBaseline();
mkdirSync(path.dirname(baselinePath), { recursive: true });
writeFileSync(baselinePath, `${JSON.stringify(baseline, null, 2)}\n`);

pass(`worktree baseline captured at ${baselinePath}`);
console.log(`branch: ${baseline.branch}`);
console.log(`head: ${baseline.head}`);
console.log(`entries: ${baseline.entries.length}`);
console.log(`contract: ${baseline.contract.path}`);
