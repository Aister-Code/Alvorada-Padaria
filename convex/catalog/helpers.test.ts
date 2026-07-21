import { describe, expect, it } from "vitest";
import {
  assertDocumentKeyUpdateIsImmutable,
  assertOptionPriceInvariants,
  compareCatalogOrder,
  determineProductSellability,
  getDocumentKeyConflict,
  hasConfirmedPrice,
} from "./helpers";

describe("catalog helpers", () => {
  it("detecta documentKey duplicado fora do registro atual", () => {
    expect(getDocumentKeyConflict("existing_id", "current_id")).toBe(true);
    expect(getDocumentKeyConflict("same_id", "same_id")).toBe(false);
  });

  it("nao trata preco ausente como zero", () => {
    expect(hasConfirmedPrice("confirmado", undefined)).toBe(false);
    expect(hasConfirmedPrice("confirmado", 0)).toBe(true);
  });

  it("rejeita preco confirmado sem valor numerico", () => {
    expect(() =>
      assertOptionPriceInvariants({
        active: true,
        sellable: true,
        required: false,
        priceStatus: "confirmado",
      }),
    ).toThrow("preco_confirmado_exige_valor");
  });

  it("rejeita preco pendente como vendavel", () => {
    expect(() =>
      assertOptionPriceInvariants({
        active: true,
        sellable: true,
        required: false,
        priceStatus: "pendente",
      }),
    ).toThrow("preco_pendente_nao_vendavel");
  });

  it("rejeita preco aguardando confirmacao como vendavel", () => {
    expect(() =>
      assertOptionPriceInvariants({
        active: true,
        sellable: true,
        required: false,
        priceStatus: "aguardando_confirmacao",
      }),
    ).toThrow("preco_pendente_nao_vendavel");
  });

  it("rejeita opcao inativa como vendavel", () => {
    expect(() =>
      assertOptionPriceInvariants({
        active: false,
        sellable: true,
        required: false,
        price: 10,
        priceStatus: "confirmado",
      }),
    ).toThrow("opcao_inativa_nao_vendavel");
  });

  it("produto sem preco e sem opcoes nao e vendavel", () => {
    expect(
      determineProductSellability({
        product: { active: true, name: "Produto" },
        category: { active: true },
        options: [],
      }),
    ).toMatchObject({ sellable: false, reason: "missing_confirmed_price" });
  });

  it("produto inativo nao e vendavel", () => {
    const result = determineProductSellability({
      product: { active: false, name: "Produto", basePrice: 10, priceStatus: "confirmado" },
      category: { active: true },
      options: [],
    });
    expect(result).toMatchObject({ sellable: false, reason: "inactive_product" });
    expect(result.priceFrom).toBeUndefined();
  });

  it("produto em categoria inativa nao e vendavel", () => {
    const result = determineProductSellability({
      product: { active: true, name: "Produto", basePrice: 10, priceStatus: "confirmado" },
      category: { active: false },
      options: [],
    });
    expect(result).toMatchObject({ sellable: false, reason: "inactive_category" });
    expect(result.priceFrom).toBeUndefined();
  });

  it("produto estruturado com basePrice confirmado e vendavel", () => {
    expect(
      determineProductSellability({
        product: { active: true, name: "Produto", basePrice: 15, priceStatus: "confirmado" },
        category: { active: true },
        options: [],
      }),
    ).toMatchObject({ sellable: true, reason: "sellable_base_price", priceFrom: 15 });
  });

  it("produto legado com products.price e vendavel", () => {
    expect(
      determineProductSellability({
        product: { active: true, name: "Produto legado", price: 9 },
        category: { active: true },
        options: [],
      }),
    ).toMatchObject({ sellable: true, reason: "sellable_base_price", priceFrom: 9 });
  });

  it("produto com opcao confirmada e vendavel", () => {
    expect(
      determineProductSellability({
        product: { active: true, name: "Produto" },
        category: { active: true },
        options: [
          {
            active: true,
            sellable: true,
            required: true,
            label: "M",
            displayOrder: 1,
            price: 12,
            priceStatus: "confirmado",
          },
        ],
      }),
    ).toMatchObject({ sellable: true, reason: "sellable_option", priceFrom: 12 });
  });

  it("produto estruturado com opcao valida e sem basePrice e vendavel", () => {
    expect(
      determineProductSellability({
        product: { active: true, name: "Pizza" },
        category: { active: true },
        options: [
          {
            active: true,
            sellable: true,
            label: "G",
            displayOrder: 1,
            price: 52,
            priceStatus: "confirmado",
          },
        ],
      }),
    ).toMatchObject({ sellable: true, reason: "sellable_option", priceFrom: 52 });
  });

  it("preco ausente permanece indefinido e nunca vira zero", () => {
    expect(
      determineProductSellability({
        product: { active: true, name: "Produto" },
        category: { active: true },
        options: [],
      }).priceFrom,
    ).toBeUndefined();
  });

  it("rejeita tentativa de trocar documentKey", () => {
    expect(() => assertDocumentKeyUpdateIsImmutable("P-001", "P-002")).toThrow("documentKey_imutavel");
    expect(() => assertDocumentKeyUpdateIsImmutable("P-001", "P-001")).not.toThrow();
  });

  it("ordena por displayOrder com desempate estavel", () => {
    const ordered = [
      { label: "B", displayOrder: 2 },
      { label: "A", displayOrder: 2 },
      { label: "C", displayOrder: 1 },
    ].sort(compareCatalogOrder);

    expect(ordered.map((item) => item.label)).toEqual(["C", "A", "B"]);
  });
});
