import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel.d.ts";
import {
  buildCatalogCartItemSnapshot,
  calculatePizzaPrice,
  hasConfirmedPrice,
  isComplementItemSellable,
  isUpgradeSellable,
  validateComplementSelections,
  type PizzaSize,
} from "../catalog/helpers";

export function isLegacyProductPrice(
  price: number | undefined,
): price is number {
  return typeof price === "number" && Number.isFinite(price);
}

const pizzaSizeValidator = v.union(
  v.literal("P"),
  v.literal("M"),
  v.literal("G"),
);

const catalogSelectionValidator = v.object({
  selectedOptionId: v.optional(v.id("productOptions")),
  complementSelections: v.optional(
    v.array(
      v.object({
        groupId: v.id("complementGroups"),
        itemId: v.id("complementItems"),
        quantity: v.number(),
        clientUnitPrice: v.optional(v.number()),
      }),
    ),
  ),
  upgradeId: v.optional(v.id("commercialUpgrades")),
  pizza: v.optional(
    v.object({
      size: pizzaSizeValidator,
      flavorProductIds: v.array(v.id("products")),
    }),
  ),
  clientUnitPrice: v.optional(v.number()),
  clientItemTotal: v.optional(v.number()),
});

function assertSameNumber(
  expected: number,
  received: number | undefined,
  code: string,
) {
  if (received !== undefined && Math.abs(expected - received) > 0.001) {
    throw new ConvexError({
      message: "Preco enviado pelo cliente diverge do valor autoritativo",
      code,
    });
  }
}

async function gerarNumeroPedido(
  ctx: QueryCtx | MutationCtx,
  unit: string,
): Promise<string> {
  const ultimo = await ctx.db
    .query("pedidos")
    .withIndex("by_unit_numero", (q) => q.eq("unit", unit))
    .order("desc")
    .first();
  const proximo = ultimo ? parseInt(ultimo.numero, 10) + 1 : 1;
  return String(proximo).padStart(6, "0");
}

async function resolverOperadorNome(
  ctx: QueryCtx | MutationCtx,
  operadorId: Id<"operators">,
): Promise<string> {
  const op = await ctx.db.get(operadorId);
  if (!op)
    throw new ConvexError({
      message: "Operador não encontrado",
      code: "NOT_FOUND",
    });
  if (!op.active)
    throw new ConvexError({ message: "Operador inativo", code: "FORBIDDEN" });
  return op.name;
}

async function registrarEvento(
  ctx: MutationCtx,
  args: {
    pedidoId: Id<"pedidos">;
    unit: string;
    tipo: string;
    categoria: "operacional" | "financeiro";
    operadorId: Id<"operators">;
    operadorNomeSnapshot: string;
    payload?: Record<string, unknown>;
  },
): Promise<void> {
  await ctx.db.insert("eventosPedido", {
    pedidoId: args.pedidoId,
    unit: args.unit,
    tipo: args.tipo,
    categoria: args.categoria,
    operadorId: args.operadorId,
    operadorNomeSnapshot: args.operadorNomeSnapshot,
    payload: args.payload ? JSON.stringify(args.payload) : undefined,
    timestamp: new Date().toISOString(),
  });
}

async function recalcularTotais(
  ctx: MutationCtx,
  pedidoId: Id<"pedidos">,
): Promise<void> {
  const pedido = await ctx.db.get(pedidoId);
  if (!pedido) return;
  const itens = await ctx.db
    .query("itensPedido")
    .withIndex("by_pedido", (q) => q.eq("pedidoId", pedidoId))
    .collect();
  const totalBruto = itens
    .filter((i) => i.statusEntidade === "ativo")
    .reduce((acc, i) => acc + i.subtotal, 0);
  const desconto = pedido.desconto ?? 0;
  const totalLiquido = Math.max(0, totalBruto - desconto);
  await ctx.db.patch(pedidoId, { totalBruto, totalLiquido });
}

type CatalogSelections = {
  selectedOptionId?: Id<"productOptions">;
  complementSelections?: Array<{
    groupId: Id<"complementGroups">;
    itemId: Id<"complementItems">;
    quantity: number;
    clientUnitPrice?: number;
  }>;
  upgradeId?: Id<"commercialUpgrades">;
  pizza?: {
    size: PizzaSize;
    flavorProductIds: Id<"products">[];
  };
  clientUnitPrice?: number;
  clientItemTotal?: number;
};

async function listarOpcoesAtivasDoProduto(
  ctx: QueryCtx | MutationCtx,
  productId: Id<"products">,
) {
  return (
    await ctx.db
      .query("productOptions")
      .withIndex("by_product_active_order", (q) =>
        q.eq("productId", productId).eq("active", true),
      )
      .collect()
  ).sort((a, b) => a.displayOrder - b.displayOrder);
}

async function resolverOpcaoProduto(
  ctx: QueryCtx | MutationCtx,
  args: {
    productId: Id<"products">;
    selectedOptionId?: Id<"productOptions">;
    pizzaSize?: PizzaSize;
  },
) {
  const options = await listarOpcoesAtivasDoProduto(ctx, args.productId);
  if (args.selectedOptionId) {
    const selected = await ctx.db.get(args.selectedOptionId);
    if (!selected)
      throw new ConvexError({
        message: "Opcao nao encontrada",
        code: "NOT_FOUND",
      });
    if (selected.productId !== args.productId) {
      throw new ConvexError({
        message: "Opcao nao pertence ao produto",
        code: "BAD_REQUEST",
      });
    }
    if (
      !selected.active ||
      !selected.sellable ||
      !hasConfirmedPrice(selected.priceStatus, selected.price)
    ) {
      throw new ConvexError({
        message: "Opcao indisponivel para venda",
        code: "BAD_REQUEST",
      });
    }
    if (args.pizzaSize && selected.metadata?.size !== args.pizzaSize) {
      throw new ConvexError({
        message: "Opcao de pizza nao corresponde ao tamanho escolhido",
        code: "BAD_REQUEST",
      });
    }
    return selected;
  }

  if (args.pizzaSize) {
    const selected = options.find(
      (option) =>
        option.optionType === "pizza_tamanho" &&
        option.metadata?.size === args.pizzaSize &&
        option.sellable &&
        hasConfirmedPrice(option.priceStatus, option.price),
    );
    if (!selected)
      throw new ConvexError({
        message: "Tamanho de pizza indisponivel",
        code: "BAD_REQUEST",
      });
    return selected;
  }

  if (options.length === 0) return null;
  const sellableOptions = options.filter(
    (option) =>
      option.sellable && hasConfirmedPrice(option.priceStatus, option.price),
  );
  if (sellableOptions.length === 1) return sellableOptions[0];
  throw new ConvexError({
    message: "Opcao do produto deve ser informada",
    code: "BAD_REQUEST",
  });
}

async function resolverConfiguracaoPizza(
  ctx: QueryCtx | MutationCtx,
  productId: Id<"products">,
) {
  const config = await ctx.db
    .query("pizzaConfigurations")
    .withIndex("by_product", (q) => q.eq("productId", productId))
    .first();
  return config?.active ? config : null;
}

async function resolverSnapshotCatalogo(
  ctx: MutationCtx,
  args: {
    pedidoId: Id<"pedidos">;
    produtoId: Id<"products">;
    quantidade: number;
    observacaoItem?: string;
    selections: CatalogSelections;
  },
) {
  if (!Number.isInteger(args.quantidade) || args.quantidade < 1) {
    throw new ConvexError({
      message: "Quantidade deve ser maior que zero",
      code: "BAD_REQUEST",
    });
  }

  const produto = await ctx.db.get(args.produtoId);
  if (!produto)
    throw new ConvexError({
      message: "Produto nao encontrado",
      code: "NOT_FOUND",
    });
  if (!produto.active)
    throw new ConvexError({ message: "Produto inativo", code: "BAD_REQUEST" });
  if (!produto.documentKey) {
    throw new ConvexError({
      message: "Produto sem documentKey para catalogo estruturado",
      code: "BAD_REQUEST",
    });
  }

  const categoria = await ctx.db.get(produto.categoryId);
  if (categoria && !categoria.active) {
    throw new ConvexError({
      message: "Categoria inativa",
      code: "BAD_REQUEST",
    });
  }

  let selectedOption = await resolverOpcaoProduto(ctx, {
    productId: args.produtoId,
    selectedOptionId: args.selections.selectedOptionId,
    pizzaSize: args.selections.pizza?.size,
  });
  let unitPrice = selectedOption?.price;
  let pizzaSnapshot:
    | {
        size: PizzaSize;
        firstFlavorProductId?: Id<"products">;
        firstFlavorDocumentKey: string;
        firstFlavorNameSnapshot: string;
        secondFlavorProductId?: Id<"products">;
        secondFlavorDocumentKey?: string;
        secondFlavorNameSnapshot?: string;
        maxFlavorsForSize: number;
        pricingPolicy: "pendente_validacao" | "media_arredondada_050";
        priceStatus: "confirmado" | "pendente" | "aguardando_confirmacao";
      }
    | undefined;

  if (args.selections.pizza) {
    const config = await resolverConfiguracaoPizza(ctx, args.produtoId);
    if (!config)
      throw new ConvexError({
        message: "Configuracao de pizza nao encontrada",
        code: "BAD_REQUEST",
      });
    if (args.selections.pizza.flavorProductIds.length < 1) {
      throw new ConvexError({
        message: "Pizza exige ao menos um sabor",
        code: "BAD_REQUEST",
      });
    }
    if (args.selections.pizza.flavorProductIds[0] !== args.produtoId) {
      throw new ConvexError({
        message: "Primeiro sabor deve ser o produto escolhido",
        code: "BAD_REQUEST",
      });
    }

    const flavors = await Promise.all(
      args.selections.pizza.flavorProductIds.map(async (flavorProductId) => {
        const flavor = await ctx.db.get(flavorProductId);
        if (!flavor || !flavor.active || !flavor.documentKey) {
          throw new ConvexError({
            message: "Sabor de pizza indisponivel",
            code: "BAD_REQUEST",
          });
        }
        const option = await resolverOpcaoProduto(ctx, {
          productId: flavorProductId,
          pizzaSize: args.selections.pizza!.size,
        });
        if (!option || option.optionType !== "pizza_tamanho") {
          throw new ConvexError({
            message: "Sabor sem tamanho de pizza vendavel",
            code: "BAD_REQUEST",
          });
        }
        return {
          product: flavor,
          option,
          documentKey: flavor.documentKey,
          name: flavor.name,
          price: option.price,
          priceStatus: option.priceStatus,
        };
      }),
    );

    const price = calculatePizzaPrice({
      config: {
        active: config.active,
        allowedSizes: config.allowedSizes as PizzaSize[],
        maxFlavorsBySize: config.maxFlavorsBySize,
        secondFlavorAllowed: config.secondFlavorAllowed,
        pricingPolicy: config.pricingPolicy,
      },
      size: args.selections.pizza.size,
      flavors,
    });
    if (!price.sellable || !hasConfirmedPrice(price.priceStatus, price.price)) {
      throw new ConvexError({
        message: "Pizza indisponivel pela politica de preco atual",
        code: "BAD_REQUEST",
      });
    }

    selectedOption = flavors[0].option;
    unitPrice = price.price;
    const [firstFlavor, secondFlavor] = flavors;
    pizzaSnapshot = {
      size: args.selections.pizza.size,
      firstFlavorProductId: firstFlavor.product._id,
      firstFlavorDocumentKey: firstFlavor.product.documentKey!,
      firstFlavorNameSnapshot: firstFlavor.product.name,
      secondFlavorProductId: secondFlavor?.product._id,
      secondFlavorDocumentKey: secondFlavor?.product.documentKey,
      secondFlavorNameSnapshot: secondFlavor?.product.name,
      maxFlavorsForSize: config.maxFlavorsBySize[args.selections.pizza.size],
      pricingPolicy: config.pricingPolicy,
      priceStatus: price.priceStatus,
    };
  }

  if (!hasConfirmedPrice(selectedOption?.priceStatus, unitPrice)) {
    if (hasConfirmedPrice(produto.priceStatus, produto.basePrice)) {
      unitPrice = produto.basePrice;
    } else if (
      produto.priceStatus === undefined &&
      isLegacyProductPrice(produto.price)
    ) {
      unitPrice = produto.price;
    } else {
      throw new ConvexError({
        message: "Produto sem preco confirmado",
        code: "BAD_REQUEST",
      });
    }
  }
  if (unitPrice === undefined) {
    throw new ConvexError({
      message: "Produto sem preco confirmado",
      code: "BAD_REQUEST",
    });
  }
  const resolvedUnitPrice = unitPrice;
  assertSameNumber(
    resolvedUnitPrice,
    args.selections.clientUnitPrice,
    "BAD_REQUEST",
  );

  const productGroupLinks = (
    await ctx.db
      .query("productComplementGroups")
      .withIndex("by_product_active_order", (q) =>
        q.eq("productId", args.produtoId).eq("active", true),
      )
      .collect()
  ).sort((a, b) => a.displayOrder - b.displayOrder);
  const groups = (
    await Promise.all(
      productGroupLinks.map(async (link) => {
        const group = await ctx.db.get(link.groupId);
        if (!group || !group.active) return null;
        const items = (
          await ctx.db
            .query("complementItems")
            .withIndex("by_group_active_order", (q) =>
              q.eq("groupId", group._id).eq("active", true),
            )
            .collect()
        ).sort((a, b) => a.displayOrder - b.displayOrder);
        return { ...group, items };
      }),
    )
  ).filter((group) => group !== null);

  const complementSelections = args.selections.complementSelections ?? [];
  validateComplementSelections({
    groups,
    selections: complementSelections.map((selection) => ({
      groupDocumentKey:
        groups.find((group) => group._id === selection.groupId)?.documentKey ??
        "",
      itemDocumentKey:
        groups
          .flatMap((group) => group.items)
          .find((item) => item._id === selection.itemId)?.documentKey ?? "",
      quantity: selection.quantity,
    })),
  });

  const complements = complementSelections.map((selection) => {
    const group = groups.find(
      (candidate) => candidate._id === selection.groupId,
    );
    if (!group)
      throw new ConvexError({
        message: "Grupo de complemento invalido",
        code: "BAD_REQUEST",
      });
    const item = group.items.find(
      (candidate) => candidate._id === selection.itemId,
    );
    if (!item)
      throw new ConvexError({
        message: "Complemento nao pertence ao grupo",
        code: "BAD_REQUEST",
      });
    if (!isComplementItemSellable(item)) {
      throw new ConvexError({
        message: "Complemento indisponivel",
        code: "BAD_REQUEST",
      });
    }
    assertSameNumber(item.price!, selection.clientUnitPrice, "BAD_REQUEST");
    return {
      groupId: group._id,
      groupDocumentKey: group.documentKey,
      groupNameSnapshot: group.name,
      itemId: item._id,
      itemDocumentKey: item.documentKey,
      itemNameSnapshot: item.name,
      quantity: selection.quantity,
      unitPrice: item.price,
      priceStatus: item.priceStatus,
    };
  });

  let upgrade:
    | {
        upgradeId: Id<"commercialUpgrades">;
        upgradeDocumentKey: string;
        nameSnapshot: string;
        price?: number;
        priceStatus: "confirmado" | "pendente" | "aguardando_confirmacao";
        operationalStatus: "pendente_modelagem" | "inativo" | "ativo";
      }
    | undefined;
  if (args.selections.upgradeId) {
    const link = (
      await ctx.db
        .query("productUpgrades")
        .withIndex("by_product_active_order", (q) =>
          q.eq("productId", args.produtoId).eq("active", true),
        )
        .collect()
    ).find((candidate) => candidate.upgradeId === args.selections.upgradeId);
    const upgradeDoc = await ctx.db.get(args.selections.upgradeId);
    if (!link || !upgradeDoc || !isUpgradeSellable(upgradeDoc)) {
      throw new ConvexError({
        message: "Upgrade indisponivel",
        code: "BAD_REQUEST",
      });
    }
    upgrade = {
      upgradeId: upgradeDoc._id,
      upgradeDocumentKey: upgradeDoc.documentKey,
      nameSnapshot: upgradeDoc.name,
      price: upgradeDoc.price,
      priceStatus: upgradeDoc.priceStatus,
      operationalStatus: upgradeDoc.operationalStatus,
    };
  }

  const complementsTotal = complements.reduce(
    (total, complement) =>
      total + (complement.unitPrice ?? 0) * complement.quantity,
    0,
  );
  const upgradeTotal = upgrade?.price ?? 0;
  const itemTotal =
    (resolvedUnitPrice + complementsTotal + upgradeTotal) * args.quantidade;
  assertSameNumber(itemTotal, args.selections.clientItemTotal, "BAD_REQUEST");

  const now = new Date().toISOString();
  const catalogSnapshot = buildCatalogCartItemSnapshot({
    cartItemId: `${args.pedidoId}:${args.produtoId}:${now}`,
    productId: produto._id,
    productDocumentKey: produto.documentKey,
    productNameSnapshot: produto.name,
    productDescriptionSnapshot: produto.description,
    categoryId: produto.categoryId,
    categoryDocumentKey: categoria?.documentKey,
    categoryNameSnapshot: categoria?.name,
    subcategorySnapshot: produto.subcategory,
    familySnapshot: produto.family,
    productOriginSnapshot: produto.origin ?? "produzido",
    productionSectorSnapshot: produto.productionSector,
    documentVersion: produto.documentVersion,
    quantity: args.quantidade,
    selectedOption: selectedOption
      ? {
          optionId: selectedOption._id,
          optionDocumentKey: selectedOption.documentKey,
          code: selectedOption.code,
          label: selectedOption.label,
          optionType: selectedOption.optionType,
          price: selectedOption.price,
          priceStatus: selectedOption.priceStatus,
          metadata: selectedOption.metadata,
        }
      : undefined,
    pizzaConfiguration: pizzaSnapshot,
    complements,
    upgrade,
    customerNote: args.observacaoItem,
    unitPrice: resolvedUnitPrice,
    priceComponents: [
      {
        kind: selectedOption ? "opcao" : "produto",
        label: selectedOption?.label ?? produto.name,
        amount: resolvedUnitPrice,
        priceStatus: "confirmado",
        documentKey: selectedOption?.documentKey ?? produto.documentKey,
      },
      ...complements.map((complement) => ({
        kind: "complemento" as const,
        label: complement.itemNameSnapshot,
        amount: (complement.unitPrice ?? 0) * complement.quantity,
        priceStatus: complement.priceStatus,
        documentKey: complement.itemDocumentKey,
      })),
      ...(upgrade
        ? [
            {
              kind: "upgrade" as const,
              label: upgrade.nameSnapshot,
              amount: upgrade.price,
              priceStatus: upgrade.priceStatus,
              documentKey: upgrade.upgradeDocumentKey,
            },
          ]
        : []),
    ],
    itemTotal,
    createdAt: now,
    updatedAt: now,
  });

  return {
    produto,
    categoria,
    unitPrice: resolvedUnitPrice,
    itemTotal,
    catalogSnapshot,
    dataAdicionado: now,
  };
}

export const criarPedido = mutation({
  args: {
    unit: v.string(),
    canalOrigem: v.string(),
    modalidadeAtendimento: v.string(),
    operadorAberturaId: v.id("operators"),
    clienteId: v.optional(v.id("clientes")),
    clienteNomeSnapshot: v.optional(v.string()),
    clienteNomeImpressaoSnapshot: v.optional(v.string()),
    clienteNomeEntregaSnapshot: v.optional(v.string()),
    clienteTelefoneSnapshot: v.optional(v.string()),
    clienteCpfSnapshot: v.optional(v.string()),
    mesaId: v.optional(v.string()),
    mesaNumeroSnapshot: v.optional(v.number()),
    observacoes: v.optional(v.string()),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{ pedidoId: Id<"pedidos">; numero: string }> => {
    const operadorNome = await resolverOperadorNome(
      ctx,
      args.operadorAberturaId,
    );
    const numero = await gerarNumeroPedido(ctx, args.unit);
    const pedidoId = await ctx.db.insert("pedidos", {
      numero,
      unit: args.unit,
      canalOrigem: args.canalOrigem,
      modalidadeAtendimento: args.modalidadeAtendimento,
      status: "aberto",
      statusEntidade: "ativo",
      operadorAberturaId: args.operadorAberturaId,
      operadorAberturaNomeSnapshot: operadorNome,
      clienteId: args.clienteId,
      clienteNomeSnapshot: args.clienteNomeSnapshot,
      clienteNomeImpressaoSnapshot: args.clienteNomeImpressaoSnapshot,
      clienteNomeEntregaSnapshot: args.clienteNomeEntregaSnapshot,
      clienteTelefoneSnapshot: args.clienteTelefoneSnapshot,
      clienteCpfSnapshot: args.clienteCpfSnapshot,
      mesaId: args.mesaId,
      mesaNumeroSnapshot: args.mesaNumeroSnapshot,
      totalBruto: 0,
      totalLiquido: 0,
      observacoes: args.observacoes,
      dataAbertura: new Date().toISOString(),
    });
    await registrarEvento(ctx, {
      pedidoId,
      unit: args.unit,
      tipo: "pedido_criado",
      categoria: "operacional",
      operadorId: args.operadorAberturaId,
      operadorNomeSnapshot: operadorNome,
    });
    return { pedidoId, numero };
  },
});

export const adicionarItem = mutation({
  args: {
    pedidoId: v.id("pedidos"),
    operadorId: v.id("operators"),
    produtoId: v.id("products"),
    quantidade: v.number(),
    observacaoItem: v.optional(v.string()),
    adicionais: v.optional(
      v.array(
        v.object({
          adicionalId: v.string(),
          nomeSnapshot: v.string(),
          precoSnapshot: v.number(),
          quantidade: v.number(),
        }),
      ),
    ),
    catalogSelections: v.optional(catalogSelectionValidator),
  },
  handler: async (ctx, args): Promise<Id<"itensPedido">> => {
    const pedido = await ctx.db.get(args.pedidoId);
    if (!pedido)
      throw new ConvexError({
        message: "Pedido não encontrado",
        code: "NOT_FOUND",
      });
    if (pedido.status !== "aberto" && pedido.status !== "reaberto")
      throw new ConvexError({
        message: "Pedido não está aberto para edição",
        code: "BAD_REQUEST",
      });
    const produto = await ctx.db.get(args.produtoId);
    if (!produto)
      throw new ConvexError({
        message: "Produto não encontrado",
        code: "NOT_FOUND",
      });
    if (!produto.active)
      throw new ConvexError({
        message: "Produto inativo",
        code: "BAD_REQUEST",
      });
    const categoria = await ctx.db.get(produto.categoryId);
    const operadorNome = await resolverOperadorNome(ctx, args.operadorId);
    let precoProdutoSnapshot: number;
    let subtotal: number;
    let catalogSnapshot: Doc<"itensPedido">["catalogSnapshot"] | undefined;
    let dataAdicionado = new Date().toISOString();

    if (args.catalogSelections) {
      const resolved = await resolverSnapshotCatalogo(ctx, {
        pedidoId: args.pedidoId,
        produtoId: args.produtoId,
        quantidade: args.quantidade,
        observacaoItem: args.observacaoItem,
        selections: args.catalogSelections,
      });
      precoProdutoSnapshot = resolved.unitPrice;
      subtotal = resolved.itemTotal;
      catalogSnapshot = resolved.catalogSnapshot;
      dataAdicionado = resolved.dataAdicionado;
    } else {
      if (!isLegacyProductPrice(produto.price))
        throw new ConvexError({
          message: "Produto sem preço legado para venda operacional",
          code: "BAD_REQUEST",
        });
      const totalAdicionais = (args.adicionais ?? []).reduce(
        (acc, a) => acc + a.precoSnapshot * a.quantidade,
        0,
      );
      precoProdutoSnapshot = produto.price;
      subtotal = produto.price * args.quantidade + totalAdicionais;
    }
    const itemId = await ctx.db.insert("itensPedido", {
      pedidoId: args.pedidoId,
      unit: pedido.unit,
      produtoId: args.produtoId,
      nomeProdutoSnapshot: produto.name,
      precoProdutoSnapshot,
      categoriaProdutoSnapshot: categoria?.name ?? "",
      quantidade: args.quantidade,
      subtotal,
      adicionais: args.adicionais,
      catalogSnapshot,
      observacaoItem: args.observacaoItem,
      statusProducao: "aguardando",
      statusEntidade: "ativo",
      dataAdicionado,
    });
    await recalcularTotais(ctx, args.pedidoId);
    await registrarEvento(ctx, {
      pedidoId: args.pedidoId,
      unit: pedido.unit,
      tipo: "item_adicionado",
      categoria: "operacional",
      operadorId: args.operadorId,
      operadorNomeSnapshot: operadorNome,
      payload: { itemId, produto: produto.name, quantidade: args.quantidade },
    });
    return itemId;
  },
});

export const removerItem = mutation({
  args: { itemId: v.id("itensPedido"), operadorId: v.id("operators") },
  handler: async (ctx, args): Promise<void> => {
    const item = await ctx.db.get(args.itemId);
    if (!item)
      throw new ConvexError({
        message: "Item não encontrado",
        code: "NOT_FOUND",
      });
    const pedido = await ctx.db.get(item.pedidoId);
    if (!pedido)
      throw new ConvexError({
        message: "Pedido não encontrado",
        code: "NOT_FOUND",
      });
    if (pedido.status !== "aberto" && pedido.status !== "reaberto")
      throw new ConvexError({
        message: "Pedido não está aberto para edição",
        code: "BAD_REQUEST",
      });
    const operadorNome = await resolverOperadorNome(ctx, args.operadorId);
    await ctx.db.patch(args.itemId, { statusEntidade: "cancelado" });
    await recalcularTotais(ctx, item.pedidoId);
    await registrarEvento(ctx, {
      pedidoId: item.pedidoId,
      unit: pedido.unit,
      tipo: "item_removido",
      categoria: "operacional",
      operadorId: args.operadorId,
      operadorNomeSnapshot: operadorNome,
      payload: { itemId: args.itemId, produto: item.nomeProdutoSnapshot },
    });
  },
});

export const confirmarPedido = mutation({
  args: { pedidoId: v.id("pedidos"), operadorId: v.id("operators") },
  handler: async (ctx, args): Promise<void> => {
    const pedido = await ctx.db.get(args.pedidoId);
    if (!pedido)
      throw new ConvexError({
        message: "Pedido não encontrado",
        code: "NOT_FOUND",
      });
    if (pedido.status !== "aberto")
      throw new ConvexError({
        message: "Apenas pedidos abertos podem ser confirmados",
        code: "BAD_REQUEST",
      });
    const itens = await ctx.db
      .query("itensPedido")
      .withIndex("by_pedido", (q) => q.eq("pedidoId", args.pedidoId))
      .collect();
    if (itens.filter((i) => i.statusEntidade === "ativo").length === 0)
      throw new ConvexError({
        message: "Pedido sem itens ativos",
        code: "BAD_REQUEST",
      });
    const operadorNome = await resolverOperadorNome(ctx, args.operadorId);
    await ctx.db.patch(args.pedidoId, { status: "enviado_producao" });
    await registrarEvento(ctx, {
      pedidoId: args.pedidoId,
      unit: pedido.unit,
      tipo: "pedido_enviado_producao",
      categoria: "operacional",
      operadorId: args.operadorId,
      operadorNomeSnapshot: operadorNome,
    });
  },
});

export const cancelarPedido = mutation({
  args: {
    pedidoId: v.id("pedidos"),
    operadorId: v.id("operators"),
    motivoCancelamento: v.string(),
  },
  handler: async (ctx, args): Promise<void> => {
    const pedido = await ctx.db.get(args.pedidoId);
    if (!pedido)
      throw new ConvexError({
        message: "Pedido não encontrado",
        code: "NOT_FOUND",
      });
    if (pedido.status === "pago" || pedido.status === "cancelado")
      throw new ConvexError({
        message: "Pedido não pode ser cancelado neste estado",
        code: "BAD_REQUEST",
      });
    const operadorNome = await resolverOperadorNome(ctx, args.operadorId);
    const agora = new Date().toISOString();
    await ctx.db.patch(args.pedidoId, {
      status: "cancelado",
      statusEntidade: "cancelado",
      operadorCancelamentoId: args.operadorId,
      operadorCancelamentoNomeSnapshot: operadorNome,
      motivoCancelamento: args.motivoCancelamento,
      dataCancelamento: agora,
    });
    await registrarEvento(ctx, {
      pedidoId: args.pedidoId,
      unit: pedido.unit,
      tipo: "pedido_cancelado",
      categoria: "financeiro",
      operadorId: args.operadorId,
      operadorNomeSnapshot: operadorNome,
      payload: { motivo: args.motivoCancelamento },
    });
  },
});

export const atualizarQuantidadeItem = mutation({
  args: {
    itemId: v.id("itensPedido"),
    operadorId: v.id("operators"),
    novaQuantidade: v.number(),
  },
  handler: async (ctx, args): Promise<void> => {
    if (args.novaQuantidade < 1)
      throw new ConvexError({
        message: "Quantidade deve ser maior que zero",
        code: "BAD_REQUEST",
      });
    const item = await ctx.db.get(args.itemId);
    if (!item)
      throw new ConvexError({
        message: "Item não encontrado",
        code: "NOT_FOUND",
      });
    if (item.statusEntidade !== "ativo")
      throw new ConvexError({
        message: "Item não está ativo",
        code: "BAD_REQUEST",
      });
    const pedido = await ctx.db.get(item.pedidoId);
    if (!pedido)
      throw new ConvexError({
        message: "Pedido não encontrado",
        code: "NOT_FOUND",
      });
    if (pedido.status !== "aberto" && pedido.status !== "reaberto")
      throw new ConvexError({
        message: "Pedido não está aberto para edição",
        code: "BAD_REQUEST",
      });
    const operadorNome = await resolverOperadorNome(ctx, args.operadorId);
    let novoSubtotal: number;
    let catalogSnapshot = item.catalogSnapshot;
    if (
      catalogSnapshot?.itemTotal !== undefined &&
      catalogSnapshot.quantity > 0
    ) {
      const totalUnitarioSnapshot =
        catalogSnapshot.itemTotal / catalogSnapshot.quantity;
      novoSubtotal = totalUnitarioSnapshot * args.novaQuantidade;
      catalogSnapshot = {
        ...catalogSnapshot,
        quantity: args.novaQuantidade,
        itemTotal: novoSubtotal,
        updatedAt: new Date().toISOString(),
      };
    } else {
      const totalAdicionais = (item.adicionais ?? []).reduce(
        (acc, a) => acc + a.precoSnapshot * a.quantidade,
        0,
      );
      novoSubtotal =
        item.precoProdutoSnapshot * args.novaQuantidade + totalAdicionais;
    }
    await ctx.db.patch(args.itemId, {
      quantidade: args.novaQuantidade,
      subtotal: novoSubtotal,
      catalogSnapshot,
    });
    await recalcularTotais(ctx, item.pedidoId);
    await registrarEvento(ctx, {
      pedidoId: item.pedidoId,
      unit: pedido.unit,
      tipo: "item_alterado",
      categoria: "operacional",
      operadorId: args.operadorId,
      operadorNomeSnapshot: operadorNome,
      payload: {
        itemId: args.itemId,
        produto: item.nomeProdutoSnapshot,
        quantidadeAnterior: item.quantidade,
        novaQuantidade: args.novaQuantidade,
      },
    });
  },
});

export const reabrirPedido = mutation({
  args: {
    pedidoId: v.id("pedidos"),
    operadorId: v.id("operators"),
    motivoReabertura: v.string(),
  },
  handler: async (ctx, args): Promise<void> => {
    const pedido = await ctx.db.get(args.pedidoId);
    if (!pedido)
      throw new ConvexError({
        message: "Pedido não encontrado",
        code: "NOT_FOUND",
      });
    if (pedido.status !== "cancelado")
      throw new ConvexError({
        message: "Apenas pedidos cancelados podem ser reabertos",
        code: "BAD_REQUEST",
      });
    const operador = await ctx.db.get(args.operadorId);
    if (!operador)
      throw new ConvexError({
        message: "Operador não encontrado",
        code: "NOT_FOUND",
      });
    if (operador.role !== "gerente" && operador.role !== "superadmin")
      throw new ConvexError({
        message: "Apenas gerentes podem reabrir pedidos",
        code: "FORBIDDEN",
      });
    const operadorNome = await resolverOperadorNome(ctx, args.operadorId);
    await ctx.db.patch(args.pedidoId, {
      status: "aberto",
      statusEntidade: "ativo",
      motivoCancelamento: undefined,
      dataCancelamento: undefined,
      operadorCancelamentoId: undefined,
      operadorCancelamentoNomeSnapshot: undefined,
    });
    await registrarEvento(ctx, {
      pedidoId: args.pedidoId,
      unit: pedido.unit,
      tipo: "pedido_reaberto",
      categoria: "operacional",
      operadorId: args.operadorId,
      operadorNomeSnapshot: operadorNome,
      payload: {
        motivoReabertura: args.motivoReabertura,
        statusAnterior: "cancelado",
      },
    });
  },
});

export const marcarEntregue = mutation({
  args: {
    pedidoId: v.id("pedidos"),
    operadorId: v.id("operators"),
    forcar: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<void> => {
    const pedido = await ctx.db.get(args.pedidoId);
    if (!pedido)
      throw new ConvexError({
        message: "Pedido não encontrado",
        code: "NOT_FOUND",
      });
    const statusPermitidos = ["pronto"];
    if (args.forcar) {
      const operador = await ctx.db.get(args.operadorId);
      if (
        !operador ||
        (operador.role !== "gerente" && operador.role !== "superadmin")
      )
        throw new ConvexError({
          message: "Apenas gerentes podem forçar entrega",
          code: "FORBIDDEN",
        });
      statusPermitidos.push("em_producao", "enviado_producao");
    }
    if (!statusPermitidos.includes(pedido.status))
      throw new ConvexError({
        message: `Pedido no status "${pedido.status}" não pode ser marcado como entregue`,
        code: "BAD_REQUEST",
      });
    const operadorNome = await resolverOperadorNome(ctx, args.operadorId);
    const itensAtivos = await ctx.db
      .query("itensPedido")
      .withIndex("by_pedido", (q) => q.eq("pedidoId", args.pedidoId))
      .collect();
    const quantidadeItens = itensAtivos.filter(
      (i) => i.statusEntidade === "ativo",
    ).length;
    await ctx.db.patch(args.pedidoId, {
      status: "entregue",
      operadorEntregaId: args.operadorId,
      operadorEntregaNomeSnapshot: operadorNome,
      dataFechamento: new Date().toISOString(),
    });
    await registrarEvento(ctx, {
      pedidoId: args.pedidoId,
      unit: pedido.unit,
      tipo: "pedido_entregue",
      categoria: "operacional",
      operadorId: args.operadorId,
      operadorNomeSnapshot: operadorNome,
      payload: { totalLiquido: pedido.totalLiquido, quantidadeItens },
    });
  },
});

export const avancarStatus = mutation({
  args: { pedidoId: v.id("pedidos"), operadorId: v.id("operators") },
  handler: async (ctx, args): Promise<{ novoStatus: string }> => {
    const pedido = await ctx.db.get(args.pedidoId);
    if (!pedido)
      throw new ConvexError({
        message: "Pedido não encontrado",
        code: "NOT_FOUND",
      });
    const maquinaEstados: Record<string, string> = {
      enviado_producao: "em_producao",
      em_producao: "pronto",
      pronto: "entregue",
    };
    const novoStatus = maquinaEstados[pedido.status];
    if (!novoStatus)
      throw new ConvexError({
        message: `Pedido no status "${pedido.status}" não pode avançar`,
        code: "BAD_REQUEST",
      });
    const operadorNome = await resolverOperadorNome(ctx, args.operadorId);
    if (novoStatus === "entregue") {
      await ctx.db.patch(args.pedidoId, {
        status: novoStatus,
        operadorEntregaId: args.operadorId,
        operadorEntregaNomeSnapshot: operadorNome,
        dataFechamento: new Date().toISOString(),
      });
    } else {
      await ctx.db.patch(args.pedidoId, { status: novoStatus });
    }
    await registrarEvento(ctx, {
      pedidoId: args.pedidoId,
      unit: pedido.unit,
      tipo: `pedido_${novoStatus}`,
      categoria: "operacional",
      operadorId: args.operadorId,
      operadorNomeSnapshot: operadorNome,
      payload: { statusAnterior: pedido.status, novoStatus },
    });
    return { novoStatus };
  },
});

export const listarPedidosEmAndamento = query({
  args: { unit: v.string() },
  handler: async (ctx, args) => {
    const statusFila = [
      "enviado_producao",
      "em_producao",
      "pronto",
      "entregue",
    ] as const;
    const resultados = await Promise.all(
      statusFila.map((status) =>
        ctx.db
          .query("pedidos")
          .withIndex("by_unit_status", (q) =>
            q.eq("unit", args.unit).eq("status", status),
          )
          .order("asc")
          .take(100),
      ),
    );
    return resultados
      .flat()
      .sort((a, b) => a.dataAbertura.localeCompare(b.dataAbertura));
  },
});

export const listarPedidosAbertos = query({
  args: { unit: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("pedidos")
      .withIndex("by_unit_status", (q) =>
        q.eq("unit", args.unit).eq("status", "aberto"),
      )
      .order("desc")
      .take(50);
  },
});

export const getPedidoDetalhe = query({
  args: { pedidoId: v.id("pedidos") },
  handler: async (ctx, args) => {
    const pedido = await ctx.db.get(args.pedidoId);
    if (!pedido) return null;
    const itens = await ctx.db
      .query("itensPedido")
      .withIndex("by_pedido", (q) => q.eq("pedidoId", args.pedidoId))
      .collect();
    const eventos = await ctx.db
      .query("eventosPedido")
      .withIndex("by_pedido", (q) => q.eq("pedidoId", args.pedidoId))
      .order("asc")
      .collect();
    return {
      pedido,
      itens: itens.filter((i) => i.statusEntidade === "ativo"),
      eventos,
    };
  },
});

export const listarPedidosDoDia = query({
  args: { unit: v.string() },
  handler: async (ctx, args) => {
    const inicioDia = new Date();
    inicioDia.setUTCHours(0, 0, 0, 0);
    const fimDia = new Date();
    fimDia.setUTCHours(23, 59, 59, 999);
    return await ctx.db
      .query("pedidos")
      .withIndex("by_unit_data", (q) =>
        q
          .eq("unit", args.unit)
          .gte("dataAbertura", inicioDia.toISOString())
          .lte("dataAbertura", fimDia.toISOString()),
      )
      .order("desc")
      .take(200);
  },
});
