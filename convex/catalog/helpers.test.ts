import { describe, expect, it } from "vitest";
import {
  assertComplementGroupInvariants,
  assertComplementItemPriceInvariants,
  assertDocumentKeyUpdateIsImmutable,
  assertOptionPriceInvariants,
  assertUpgradeInvariants,
  buildCatalogCartItemSnapshot,
  calculatePizzaPrice,
  compareCatalogOrder,
  determineProductSellability,
  getDocumentKeyConflict,
  hasConfirmedPrice,
  isComplementItemSellable,
  isUpgradeSellable,
  validateComplementSelections,
  validatePizzaFlavorSelection,
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
      product: {
        active: false,
        name: "Produto",
        basePrice: 10,
        priceStatus: "confirmado",
      },
      category: { active: true },
      options: [],
    });
    expect(result).toMatchObject({
      sellable: false,
      reason: "inactive_product",
    });
    expect(result.priceFrom).toBeUndefined();
  });

  it("produto em categoria inativa nao e vendavel", () => {
    const result = determineProductSellability({
      product: {
        active: true,
        name: "Produto",
        basePrice: 10,
        priceStatus: "confirmado",
      },
      category: { active: false },
      options: [],
    });
    expect(result).toMatchObject({
      sellable: false,
      reason: "inactive_category",
    });
    expect(result.priceFrom).toBeUndefined();
  });

  it("produto estruturado com basePrice confirmado e vendavel", () => {
    expect(
      determineProductSellability({
        product: {
          active: true,
          name: "Produto",
          basePrice: 15,
          priceStatus: "confirmado",
        },
        category: { active: true },
        options: [],
      }),
    ).toMatchObject({
      sellable: true,
      reason: "sellable_base_price",
      priceFrom: 15,
    });
  });

  it("produto legado com products.price e vendavel", () => {
    expect(
      determineProductSellability({
        product: { active: true, name: "Produto legado", price: 9 },
        category: { active: true },
        options: [],
      }),
    ).toMatchObject({
      sellable: true,
      reason: "sellable_base_price",
      priceFrom: 9,
    });
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
    ).toMatchObject({
      sellable: true,
      reason: "sellable_option",
      priceFrom: 12,
    });
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
    ).toMatchObject({
      sellable: true,
      reason: "sellable_option",
      priceFrom: 52,
    });
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
    expect(() => assertDocumentKeyUpdateIsImmutable("P-001", "P-002")).toThrow(
      "documentKey_imutavel",
    );
    expect(() =>
      assertDocumentKeyUpdateIsImmutable("P-001", "P-001"),
    ).not.toThrow();
  });

  it("ordena por displayOrder com desempate estavel", () => {
    const ordered = [
      { label: "B", displayOrder: 2 },
      { label: "A", displayOrder: 2 },
      { label: "C", displayOrder: 1 },
    ].sort(compareCatalogOrder);

    expect(ordered.map((item) => item.label)).toEqual(["C", "A", "B"]);
  });

  it("rejeita grupo obrigatorio sem selecao", () => {
    expect(() =>
      validateComplementSelections({
        groups: [
          {
            documentKey: "GRP-OBR",
            name: "Escolha obrigatoria",
            active: true,
            required: true,
            minSelections: 1,
            maxSelections: 1,
            items: [],
          },
        ],
        selections: [],
      }),
    ).toThrow("grupo_obrigatorio_sem_selecao");
  });

  it("rejeita selecao abaixo do minimo", () => {
    expect(() =>
      validateComplementSelections({
        groups: [
          {
            documentKey: "GRP-MIN",
            name: "Escolha dois",
            active: true,
            required: false,
            minSelections: 2,
            maxSelections: 3,
            items: [
              {
                documentKey: "ITEM-1",
                name: "Item 1",
                active: true,
                sellable: true,
                price: 3,
                priceStatus: "confirmado",
              },
            ],
          },
        ],
        selections: [
          {
            groupDocumentKey: "GRP-MIN",
            itemDocumentKey: "ITEM-1",
            quantity: 1,
          },
        ],
      }),
    ).toThrow("selecao_abaixo_do_minimo");
  });

  it("rejeita selecao acima do maximo", () => {
    expect(() =>
      validateComplementSelections({
        groups: [
          {
            documentKey: "GRP-MAX",
            name: "Escolha ate um",
            active: true,
            required: false,
            minSelections: 0,
            maxSelections: 1,
            items: [
              {
                documentKey: "ITEM-1",
                name: "Item 1",
                active: true,
                sellable: true,
                price: 3,
                priceStatus: "confirmado",
              },
            ],
          },
        ],
        selections: [
          {
            groupDocumentKey: "GRP-MAX",
            itemDocumentKey: "ITEM-1",
            quantity: 2,
          },
        ],
      }),
    ).toThrow("selecao_acima_do_maximo");
  });

  it("rejeita complemento inativo ou pendente como vendavel", () => {
    expect(() =>
      assertComplementItemPriceInvariants({
        active: false,
        sellable: true,
        price: 3,
        priceStatus: "confirmado",
      }),
    ).toThrow("complemento_inativo_nao_vendavel");

    expect(
      isComplementItemSellable({
        documentKey: "ITEM-PENDENTE",
        name: "Pendente",
        active: true,
        sellable: false,
        priceStatus: "pendente",
      }),
    ).toBe(false);
  });

  it("aceita adicional com impacto de preco confirmado", () => {
    const group = {
      documentKey: "GRP-ADD",
      name: "Adicionais",
      active: true,
      required: false,
      minSelections: 0,
      maxSelections: 2,
      items: [
        {
          documentKey: "ADD-BACON",
          name: "Bacon",
          active: true,
          sellable: true,
          price: 6,
          priceStatus: "confirmado" as const,
        },
      ],
    };

    expect(() =>
      validateComplementSelections({
        groups: [group],
        selections: [
          {
            groupDocumentKey: "GRP-ADD",
            itemDocumentKey: "ADD-BACON",
            quantity: 1,
          },
        ],
      }),
    ).not.toThrow();
  });

  it("bloqueia upgrade pendente de modelagem como vendavel", () => {
    expect(() =>
      assertUpgradeInvariants({
        active: true,
        price: 5,
        priceStatus: "confirmado",
        operationalStatus: "pendente_modelagem",
      }),
    ).toThrow("upgrade_ativo_exige_modelagem_ativa");

    expect(
      isUpgradeSellable({
        documentKey: "UP-BATATA",
        name: "+100 g de batata",
        active: false,
        price: 5,
        priceStatus: "confirmado",
        operationalStatus: "pendente_modelagem",
      }),
    ).toBe(false);
  });

  it("valida invariantes de grupo de complementos", () => {
    expect(() =>
      assertComplementGroupInvariants({
        minSelections: 1,
        maxSelections: 0,
        required: true,
      }),
    ).toThrow("maximo_complementos_invalido");
    expect(() =>
      assertComplementGroupInvariants({ minSelections: 0, required: true }),
    ).toThrow("grupo_obrigatorio_exige_minimo");
  });

  const pizzaConfig = {
    active: true,
    allowedSizes: ["P", "M", "G"] as const,
    maxFlavorsBySize: { P: 1, M: 2, G: 2 },
    secondFlavorAllowed: true,
    pricingPolicy: "media_arredondada_050" as const,
  };

  it("calcula pizza de um sabor com preco confirmado", () => {
    expect(
      calculatePizzaPrice({
        config: pizzaConfig,
        size: "G",
        flavors: [
          {
            documentKey: "PIZ-1",
            name: "Calabresa",
            price: 60,
            priceStatus: "confirmado",
          },
        ],
      }),
    ).toEqual({ sellable: true, priceStatus: "confirmado", price: 60 });
  });

  it("calcula pizza de dois sabores por media arredondada para R$ 0,50", () => {
    expect(() =>
      validatePizzaFlavorSelection({
        config: pizzaConfig,
        size: "G",
        flavorDocumentKeys: ["PIZ-1", "PIZ-2"],
      }),
    ).not.toThrow();

    expect(
      calculatePizzaPrice({
        config: pizzaConfig,
        size: "G",
        flavors: [
          {
            documentKey: "PIZ-1",
            name: "Calabresa",
            price: 60,
            priceStatus: "confirmado",
          },
          {
            documentKey: "PIZ-2",
            name: "Frango",
            price: 62,
            priceStatus: "confirmado",
          },
        ],
      }),
    ).toEqual({ sellable: true, priceStatus: "confirmado", price: 61 });
  });

  it("bloqueia dois sabores quando a politica financeira segue pendente", () => {
    expect(
      calculatePizzaPrice({
        config: { ...pizzaConfig, pricingPolicy: "pendente_validacao" },
        size: "G",
        flavors: [
          {
            documentKey: "PIZ-1",
            name: "Calabresa",
            price: 60,
            priceStatus: "confirmado",
          },
          {
            documentKey: "PIZ-2",
            name: "Frango",
            price: 62,
            priceStatus: "confirmado",
          },
        ],
      }),
    ).toEqual({ sellable: false, priceStatus: "pendente", price: undefined });
  });

  it("rejeita quantidade de sabores incompativel com tamanho P", () => {
    expect(() =>
      validatePizzaFlavorSelection({
        config: pizzaConfig,
        size: "P",
        flavorDocumentKeys: ["PIZ-1", "PIZ-2"],
      }),
    ).toThrow("quantidade_sabores_incompativel");
  });

  it("rejeita payload adulterado com sabor duplicado", () => {
    expect(() =>
      validatePizzaFlavorSelection({
        config: pizzaConfig,
        size: "M",
        flavorDocumentKeys: ["PIZ-1", "PIZ-1"],
      }),
    ).toThrow("sabor_duplicado_na_pizza");
  });

  it("mantem compatibilidade com produto sem opcoes", () => {
    expect(
      determineProductSellability({
        product: {
          active: true,
          name: "Cafe",
          basePrice: 4,
          priceStatus: "confirmado",
        },
        category: { active: true },
        options: [],
      }),
    ).toMatchObject({
      sellable: true,
      reason: "sellable_base_price",
      priceFrom: 4,
    });
  });

  it("preserva snapshots de opcao, complemento, upgrade e pizza", () => {
    const snapshot = buildCatalogCartItemSnapshot({
      cartItemId: "cart-1",
      productDocumentKey: "PIZ-1",
      productNameSnapshot: "Pizza Calabresa",
      productOriginSnapshot: "produzido",
      quantity: 1,
      selectedOption: {
        optionDocumentKey: "PIZ-1-G",
        label: "G",
        optionType: "pizza_tamanho",
        price: 60,
        priceStatus: "confirmado",
      },
      pizzaConfiguration: {
        size: "G",
        firstFlavorDocumentKey: "PIZ-1",
        firstFlavorNameSnapshot: "Pizza Calabresa",
        secondFlavorDocumentKey: "PIZ-2",
        secondFlavorNameSnapshot: "Pizza Frango",
        maxFlavorsForSize: 2,
        pricingPolicy: "pendente_validacao",
        priceStatus: "pendente",
      },
      complements: [
        {
          groupDocumentKey: "GRP-ADD",
          groupNameSnapshot: "Adicionais",
          itemDocumentKey: "ADD-BACON",
          itemNameSnapshot: "Bacon",
          quantity: 2,
          unitPrice: 6,
          priceStatus: "confirmado",
        },
      ],
      upgrade: {
        upgradeDocumentKey: "UP-BATATA",
        nameSnapshot: "+100 g de batata",
        price: 5,
        priceStatus: "confirmado",
        operationalStatus: "pendente_modelagem",
      },
      unitPrice: 77,
      itemTotal: 77,
      createdAt: "2026-07-21T00:00:00.000Z",
      updatedAt: "2026-07-21T00:00:00.000Z",
    });

    expect(snapshot).toMatchObject({
      contractVersion: "catalog-cart-v1",
      productDocumentKey: "PIZ-1",
      selectedOption: { optionDocumentKey: "PIZ-1-G", price: 60 },
      pizzaConfiguration: {
        secondFlavorDocumentKey: "PIZ-2",
        priceStatus: "pendente",
      },
      complements: [{ itemDocumentKey: "ADD-BACON", total: 12 }],
      upgrade: {
        upgradeDocumentKey: "UP-BATATA",
        operationalStatus: "pendente_modelagem",
      },
    });
  });
});
