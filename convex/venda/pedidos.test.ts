import { describe, expect, it } from "vitest";
import { isLegacyProductPrice } from "./pedidos";

describe("pedido legado - preco do produto", () => {
  it("permite produto legado com products.price numerico", () => {
    expect(isLegacyProductPrice(12)).toBe(true);
    expect(isLegacyProductPrice(0)).toBe(true);
  });

  it("rejeita produto sem products.price no fluxo legado", () => {
    expect(isLegacyProductPrice(undefined)).toBe(false);
  });

  it("nao converte preco ausente ou invalido em zero", () => {
    expect(isLegacyProductPrice(undefined)).toBe(false);
    expect(isLegacyProductPrice(Number.NaN)).toBe(false);
  });
});
