import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import { api } from "../_generated/api";
import schema from "../schema";
import type { Id } from "../_generated/dataModel";
import { isLegacyProductPrice } from "./pedidos";

const modules = {
  "./_generated/api.js": () => import("../_generated/api.js"),
  "./_generated/server.js": () => import("../_generated/server.js"),
  "./venda/pedidos.ts": () => import("./pedidos"),
};

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

type CatalogSeed = {
  operadorId: Id<"operators">;
  burgerId: Id<"products">;
  otherProductId: Id<"products">;
  optionId: Id<"productOptions">;
  otherOptionId: Id<"productOptions">;
  inactiveOptionId: Id<"productOptions">;
  groupId: Id<"complementGroups">;
  baconId: Id<"complementItems">;
  pendingComplementId: Id<"complementItems">;
  upgradePendingId: Id<"commercialUpgrades">;
  pizzaCalabresaId: Id<"products">;
  pizzaFrangoId: Id<"products">;
};

async function seedCatalogPedido(
  t: ReturnType<typeof convexTest>,
): Promise<CatalogSeed> {
  return await t.run(async (ctx) => {
    const now = "2026-07-21T00:00:00.000Z";
    const operadorId = await ctx.db.insert("operators", {
      operatorId: "op-m3",
      name: "Operador M3",
      role: "gerente",
      pinHash: "hash",
      units: ["matriz"],
      active: true,
    });
    const categoryId = await ctx.db.insert("categories", {
      name: "Lanches",
      slug: "lanches",
      icon: "burger",
      order: 1,
      active: true,
      documentKey: "CAT-LANCHES",
    });
    const pizzaCategoryId = await ctx.db.insert("categories", {
      name: "Pizzas Salgadas",
      slug: "pizzas-salgadas",
      icon: "pizza",
      order: 2,
      active: true,
      documentKey: "CAT-PIZZAS",
    });
    const burgerId = await ctx.db.insert("products", {
      categoryId,
      name: "X-Burguer",
      description: "Hamburguer artesanal.",
      active: true,
      featured: false,
      documentKey: "LAN-X-BURGUER",
      origin: "produzido",
      documentVersion: "CATALOG-INSTANCE-ALVORADA-001",
    });
    const otherProductId = await ctx.db.insert("products", {
      categoryId,
      name: "X-Outro",
      active: true,
      featured: false,
      documentKey: "LAN-OUTRO",
      origin: "produzido",
    });
    const optionId = await ctx.db.insert("productOptions", {
      documentKey: "LAN-X-BURGUER-PADRAO",
      productId: burgerId,
      code: "PADRAO",
      label: "Padrao",
      optionType: "padrao",
      price: 22,
      priceStatus: "confirmado",
      active: true,
      sellable: true,
      required: true,
      displayOrder: 1,
      createdAt: now,
      updatedAt: now,
      version: "1",
    });
    const inactiveOptionId = await ctx.db.insert("productOptions", {
      documentKey: "LAN-X-BURGUER-INATIVA",
      productId: burgerId,
      code: "INATIVA",
      label: "Inativa",
      optionType: "padrao",
      price: 18,
      priceStatus: "confirmado",
      active: false,
      sellable: false,
      required: false,
      displayOrder: 2,
      createdAt: now,
      updatedAt: now,
      version: "1",
    });
    const otherOptionId = await ctx.db.insert("productOptions", {
      documentKey: "LAN-OUTRO-PADRAO",
      productId: otherProductId,
      code: "PADRAO",
      label: "Padrao outro",
      optionType: "padrao",
      price: 30,
      priceStatus: "confirmado",
      active: true,
      sellable: true,
      required: true,
      displayOrder: 1,
      createdAt: now,
      updatedAt: now,
      version: "1",
    });
    const groupId = await ctx.db.insert("complementGroups", {
      documentKey: "GRP-ADD",
      name: "Adicionais",
      minSelections: 1,
      maxSelections: 1,
      required: true,
      active: true,
      displayOrder: 1,
      createdAt: now,
      updatedAt: now,
      version: "1",
    });
    const baconId = await ctx.db.insert("complementItems", {
      documentKey: "ADD-BACON",
      groupId,
      name: "Bacon",
      price: 6,
      priceStatus: "confirmado",
      active: true,
      sellable: true,
      displayOrder: 1,
      createdAt: now,
      updatedAt: now,
      version: "1",
    });
    const pendingComplementId = await ctx.db.insert("complementItems", {
      documentKey: "ADD-PENDENTE",
      groupId,
      name: "Pendente",
      priceStatus: "pendente",
      active: true,
      sellable: false,
      displayOrder: 2,
      createdAt: now,
      updatedAt: now,
      version: "1",
    });
    await ctx.db.insert("productComplementGroups", {
      productId: burgerId,
      groupId,
      active: true,
      displayOrder: 1,
      createdAt: now,
      updatedAt: now,
      version: "1",
    });
    const upgradePendingId = await ctx.db.insert("commercialUpgrades", {
      documentKey: "UP-BATATA-100G",
      name: "+100 g de batata",
      price: 5,
      priceStatus: "confirmado",
      operationalStatus: "pendente_modelagem",
      active: false,
      displayOrder: 1,
      createdAt: now,
      updatedAt: now,
      version: "1",
    });
    await ctx.db.insert("productUpgrades", {
      productId: burgerId,
      upgradeId: upgradePendingId,
      active: true,
      displayOrder: 1,
      createdAt: now,
      updatedAt: now,
      version: "1",
    });

    const pizzaCalabresaId = await ctx.db.insert("products", {
      categoryId: pizzaCategoryId,
      name: "Pizza Calabresa",
      active: true,
      featured: false,
      documentKey: "PIZS-CALABRESA",
      origin: "produzido",
    });
    const pizzaFrangoId = await ctx.db.insert("products", {
      categoryId: pizzaCategoryId,
      name: "Pizza Frango",
      active: true,
      featured: false,
      documentKey: "PIZS-FRANGO",
      origin: "produzido",
    });
    for (const productId of [pizzaCalabresaId, pizzaFrangoId]) {
      for (const [size, price] of [
        ["P", 32],
        ["M", 45],
        ["G", 60],
      ] as const) {
        await ctx.db.insert("productOptions", {
          documentKey: `${productId}-${size}`,
          productId,
          code: size,
          label: size,
          optionType: "pizza_tamanho",
          price,
          priceStatus: "confirmado",
          active: true,
          sellable: true,
          required: true,
          displayOrder: size === "P" ? 1 : size === "M" ? 2 : 3,
          metadata: { size },
          createdAt: now,
          updatedAt: now,
          version: "1",
        });
      }
      await ctx.db.insert("pizzaConfigurations", {
        productId,
        pizzaKind: "salgada",
        allowedSizes: ["P", "M", "G"],
        maxFlavorsBySize: { P: 1, M: 2, G: 2 },
        secondFlavorAllowed: true,
        pricingPolicy: "media_arredondada_050",
        active: true,
        createdAt: now,
        updatedAt: now,
        version: "1",
      });
    }

    return {
      operadorId,
      burgerId,
      otherProductId,
      optionId,
      otherOptionId,
      inactiveOptionId,
      groupId,
      baconId,
      pendingComplementId,
      upgradePendingId,
      pizzaCalabresaId,
      pizzaFrangoId,
    };
  });
}

async function criarPedidoTeste(
  t: ReturnType<typeof convexTest>,
  operadorId: Id<"operators">,
) {
  return await t.mutation(api.venda.pedidos.criarPedido, {
    unit: "matriz",
    canalOrigem: "catalogo",
    modalidadeAtendimento: "balcao",
    operadorAberturaId: operadorId,
  });
}

describe("pedido com catalogo estruturado", () => {
  it("persiste e le posteriormente escolhas estruturadas com snapshot historico", async () => {
    const t = convexTest({ schema, modules });
    const seed = await seedCatalogPedido(t);
    const pedido = await criarPedidoTeste(t, seed.operadorId);

    const itemId = await t.mutation(api.venda.pedidos.adicionarItem, {
      pedidoId: pedido.pedidoId,
      operadorId: seed.operadorId,
      produtoId: seed.burgerId,
      quantidade: 1,
      catalogSelections: {
        selectedOptionId: seed.optionId,
        complementSelections: [
          {
            groupId: seed.groupId,
            itemId: seed.baconId,
            quantity: 1,
            clientUnitPrice: 6,
          },
        ],
        clientUnitPrice: 22,
        clientItemTotal: 28,
      },
    });

    await t.run(async (ctx) => {
      await ctx.db.patch(seed.optionId, {
        label: "Padrao alterado",
        price: 99,
      });
      await ctx.db.patch(seed.baconId, { name: "Bacon alterado", price: 12 });
    });

    const detalhe = await t.query(api.venda.pedidos.getPedidoDetalhe, {
      pedidoId: pedido.pedidoId,
    });
    const item = detalhe?.itens.find((candidate) => candidate._id === itemId);
    expect(item?.subtotal).toBe(28);
    expect(item?.catalogSnapshot?.selectedOption?.label).toBe("Padrao");
    expect(item?.catalogSnapshot?.selectedOption?.price).toBe(22);
    expect(item?.catalogSnapshot?.complements?.[0]).toMatchObject({
      groupDocumentKey: "GRP-ADD",
      groupNameSnapshot: "Adicionais",
      itemDocumentKey: "ADD-BACON",
      itemNameSnapshot: "Bacon",
      unitPrice: 6,
      total: 6,
    });
  });

  it("rejeita grupo obrigatorio sem selecao na mutation", async () => {
    const t = convexTest({ schema, modules });
    const seed = await seedCatalogPedido(t);
    const pedido = await criarPedidoTeste(t, seed.operadorId);

    await expect(
      t.mutation(api.venda.pedidos.adicionarItem, {
        pedidoId: pedido.pedidoId,
        operadorId: seed.operadorId,
        produtoId: seed.burgerId,
        quantidade: 1,
        catalogSelections: { selectedOptionId: seed.optionId },
      }),
    ).rejects.toThrow("grupo_obrigatorio_sem_selecao");
  });

  it("rejeita payload com preco inferior ao valor autoritativo", async () => {
    const t = convexTest({ schema, modules });
    const seed = await seedCatalogPedido(t);
    const pedido = await criarPedidoTeste(t, seed.operadorId);

    await expect(
      t.mutation(api.venda.pedidos.adicionarItem, {
        pedidoId: pedido.pedidoId,
        operadorId: seed.operadorId,
        produtoId: seed.burgerId,
        quantidade: 1,
        catalogSelections: {
          selectedOptionId: seed.optionId,
          complementSelections: [
            { groupId: seed.groupId, itemId: seed.baconId, quantity: 1 },
          ],
          clientUnitPrice: 1,
        },
      }),
    ).rejects.toThrow("Preco enviado pelo cliente diverge");
  });

  it("rejeita opcao pertencente a outro produto", async () => {
    const t = convexTest({ schema, modules });
    const seed = await seedCatalogPedido(t);
    const pedido = await criarPedidoTeste(t, seed.operadorId);

    await expect(
      t.mutation(api.venda.pedidos.adicionarItem, {
        pedidoId: pedido.pedidoId,
        operadorId: seed.operadorId,
        produtoId: seed.burgerId,
        quantidade: 1,
        catalogSelections: {
          selectedOptionId: seed.otherOptionId,
          complementSelections: [
            { groupId: seed.groupId, itemId: seed.baconId, quantity: 1 },
          ],
        },
      }),
    ).rejects.toThrow("Opcao nao pertence ao produto");
  });

  it("rejeita opcao inativa enviada manualmente", async () => {
    const t = convexTest({ schema, modules });
    const seed = await seedCatalogPedido(t);
    const pedido = await criarPedidoTeste(t, seed.operadorId);

    await expect(
      t.mutation(api.venda.pedidos.adicionarItem, {
        pedidoId: pedido.pedidoId,
        operadorId: seed.operadorId,
        produtoId: seed.burgerId,
        quantidade: 1,
        catalogSelections: {
          selectedOptionId: seed.inactiveOptionId,
          complementSelections: [
            { groupId: seed.groupId, itemId: seed.baconId, quantity: 1 },
          ],
        },
      }),
    ).rejects.toThrow("Opcao indisponivel");
  });

  it("rejeita complemento com preco pendente na mutation", async () => {
    const t = convexTest({ schema, modules });
    const seed = await seedCatalogPedido(t);
    const pedido = await criarPedidoTeste(t, seed.operadorId);

    await expect(
      t.mutation(api.venda.pedidos.adicionarItem, {
        pedidoId: pedido.pedidoId,
        operadorId: seed.operadorId,
        produtoId: seed.burgerId,
        quantidade: 1,
        catalogSelections: {
          selectedOptionId: seed.optionId,
          complementSelections: [
            {
              groupId: seed.groupId,
              itemId: seed.pendingComplementId,
              quantity: 1,
            },
          ],
        },
      }),
    ).rejects.toThrow("complemento_indisponivel");
  });

  it("rejeita upgrade pendente de modelagem na mutation", async () => {
    const t = convexTest({ schema, modules });
    const seed = await seedCatalogPedido(t);
    const pedido = await criarPedidoTeste(t, seed.operadorId);

    await expect(
      t.mutation(api.venda.pedidos.adicionarItem, {
        pedidoId: pedido.pedidoId,
        operadorId: seed.operadorId,
        produtoId: seed.burgerId,
        quantidade: 1,
        catalogSelections: {
          selectedOptionId: seed.optionId,
          complementSelections: [
            { groupId: seed.groupId, itemId: seed.baconId, quantity: 1 },
          ],
          upgradeId: seed.upgradePendingId,
        },
      }),
    ).rejects.toThrow("Upgrade indisponivel");
  });

  it("rejeita pizza P com mais de um sabor na mutation", async () => {
    const t = convexTest({ schema, modules });
    const seed = await seedCatalogPedido(t);
    const pedido = await criarPedidoTeste(t, seed.operadorId);

    await expect(
      t.mutation(api.venda.pedidos.adicionarItem, {
        pedidoId: pedido.pedidoId,
        operadorId: seed.operadorId,
        produtoId: seed.pizzaCalabresaId,
        quantidade: 1,
        catalogSelections: {
          pizza: {
            size: "P",
            flavorProductIds: [seed.pizzaCalabresaId, seed.pizzaFrangoId],
          },
        },
      }),
    ).rejects.toThrow("quantidade_sabores_incompativel");
  });

  it("persiste pizza M/G com dois sabores pela media arredondada para R$ 0,50", async () => {
    const t = convexTest({ schema, modules });
    const seed = await seedCatalogPedido(t);
    const pedido = await criarPedidoTeste(t, seed.operadorId);

    const itemId = await t.mutation(api.venda.pedidos.adicionarItem, {
      pedidoId: pedido.pedidoId,
      operadorId: seed.operadorId,
      produtoId: seed.pizzaCalabresaId,
      quantidade: 1,
      catalogSelections: {
        pizza: {
          size: "G",
          flavorProductIds: [seed.pizzaCalabresaId, seed.pizzaFrangoId],
        },
        clientUnitPrice: 60,
        clientItemTotal: 60,
      },
    });

    const detalhe = await t.query(api.venda.pedidos.getPedidoDetalhe, {
      pedidoId: pedido.pedidoId,
    });
    const item = detalhe?.itens.find((candidate) => candidate._id === itemId);
    expect(item?.subtotal).toBe(60);
    expect(item?.catalogSnapshot?.pizzaConfiguration).toMatchObject({
      size: "G",
      firstFlavorNameSnapshot: "Pizza Calabresa",
      secondFlavorNameSnapshot: "Pizza Frango",
      pricingPolicy: "media_arredondada_050",
    });
  });
});
