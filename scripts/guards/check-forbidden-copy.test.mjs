import { describe, expect, it } from "vitest";
import { findForbiddenCopyHits, isRuntimeCopyFile } from "./check-forbidden-copy.mjs";

const forbidden = new Set(["Continuar para o tamanho"]);

function find(filesWithText) {
  const files = Object.keys(filesWithText);
  return findForbiddenCopyHits(files, forbidden, (file) => filesWithText[file]);
}

describe("check-forbidden-copy", () => {
  it("fails when forbidden copy appears in a production component", () => {
    expect(
      find({
        "src/pages/catalog/_components/PizzaBuilder.tsx": "<button>Continuar para o tamanho</button>",
      }),
    ).toEqual(["src/pages/catalog/_components/PizzaBuilder.tsx: Continuar para o tamanho"]);
  });

  it("ignores forbidden copy cited by a negative test", () => {
    expect(
      find({
        "src/pages/catalog/_components/PizzaBuilder.contract.test.ts": "expect(source).not.toContain('Continuar para o tamanho')",
      }),
    ).toEqual([]);
  });

  it("ignores forbidden copy in documentation and decision files", () => {
    expect(
      find({
        "docs/arquitetura/decisoes/pizza.yaml": "forbidden_copy: Continuar para o tamanho",
        "docs/arquitetura/UX/nota.md": "Nao usar Continuar para o tamanho",
      }),
    ).toEqual([]);
  });

  it("fails when forbidden copy appears in a runtime helper under src", () => {
    expect(
      find({
        "src/pages/catalog/_components/pizzaCopy.ts": "export const label = 'Continuar para o tamanho';",
      }),
    ).toEqual(["src/pages/catalog/_components/pizzaCopy.ts: Continuar para o tamanho"]);
  });

  it("classifies only runtime UI paths as copy sources", () => {
    expect(isRuntimeCopyFile("src/pages/catalog/page.tsx")).toBe(true);
    expect(isRuntimeCopyFile("src/pages/catalog/copy.ts")).toBe(true);
    expect(isRuntimeCopyFile("src/pages/catalog/copy.test.ts")).toBe(false);
    expect(isRuntimeCopyFile("scripts/guards/check-forbidden-copy.mjs")).toBe(false);
    expect(isRuntimeCopyFile("docs/arquitetura/decisoes/pizza.yaml")).toBe(false);
  });
});
