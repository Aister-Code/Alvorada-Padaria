import { fail, pass, readText } from "./lib.mjs";

const file = "src/pages/catalog/_components/PizzaBuilder.tsx";
const source = readText(file);
const errors = [];

if (!source.includes("function SelectionSquare")) {
  errors.push("SelectionSquare component not found.");
}

const usageCount = [...source.matchAll(/<SelectionSquare active=\{active\} \/>/g)].length;
if (usageCount < 5) {
  errors.push(`Expected at least 5 canonical SelectionSquare usages; found ${usageCount}.`);
}

const forbiddenPatterns = [
  "label={kind",
  "label={size",
  "compact",
  'kind === "savory" ? "S" : "D"',
  'size === "M" ? "M" : "G"',
  'type="radio"',
  "Continuar para o tamanho",
  "goToSizeStep",
];

for (const pattern of forbiddenPatterns) {
  if (source.includes(pattern)) errors.push(`Forbidden UI primitive/copy found: ${pattern}`);
}

if (!source.includes("rounded-[5px]")) errors.push("SelectionSquare radius rounded-[5px] not found.");
if (!source.includes("h-[18px] w-[18px]")) errors.push("SelectionSquare size h-[18px] w-[18px] not found.");
if (!source.includes("<CheckIcon className=\"h-3 w-3\" />")) {
  errors.push("SelectionSquare centered check icon not found.");
}

if (errors.length) fail("ui primitive validation failed", errors);
pass("PizzaBuilder uses the canonical SelectionSquare primitive");
