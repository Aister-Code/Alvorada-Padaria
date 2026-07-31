import { ConvexError, v } from "convex/values";
import { internalMutation, query } from "../_generated/server";
import type { DatabaseReader } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import {
  pizzaKindValidator,
  pizzaPricingPolicyValidator,
  priceStatusValidator,
  upgradeOperationalStatusValidator,
} from "./contracts";
import {
  assertProductExists,
  assertUniqueDocumentKey,
  findByDocumentKey,
} from "./dbHelpers";
import {
  assertComplementGroupInvariants,
  assertComplementItemPriceInvariants,
  assertDocumentKeyUpdateIsImmutable,
  assertPizzaConfigurationInvariants,
  assertUpgradeInvariants,
  calculatePizzaPrice,
  compareCatalogOrder,
  getNextVersion,
  hasConfirmedPrice,
  isComplementItemSellable,
  isUpgradeSellable,
  type PizzaSize,
} from "./helpers";

const pizzaSizeValidator = v.union(
  v.literal("P"),
  v.literal("M"),
  v.literal("G"),
);
const rulesValidator = v.optional(v.record(v.string(), v.string()));

async function assertGroupExists(
  ctx: { db: DatabaseReader },
  groupId: Id<"complementGroups">,
) {
  const group = await ctx.db.get(groupId);
  if (!group) throw new ConvexError("grupo_complemento_nao_encontrado");
  return group;
}

async function assertComplementItemExists(
  ctx: { db: DatabaseReader },
  itemId: Id<"complementItems">,
) {
  const item = await ctx.db.get(itemId);
  if (!item) throw new ConvexError("complemento_nao_encontrado");
  return item;
}

async function assertUpgradeExists(
  ctx: { db: DatabaseReader },
  upgradeId: Id<"commercialUpgrades">,
) {
  const upgrade = await ctx.db.get(upgradeId);
  if (!upgrade) throw new ConvexError("upgrade_nao_encontrado");
  return upgrade;
}

async function assertProductGroupLinkAvailable(
  ctx: { db: DatabaseReader },
  productId: Id<"products">,
  groupId: Id<"complementGroups">,
  currentId?: string,
) {
  const links = await ctx.db
    .query("productComplementGroups")
    .withIndex("by_product", (q) => q.eq("productId", productId))
    .collect();
  const existing = links.find((link) => link.groupId === groupId);
  if (existing && existing._id !== currentId)
    throw new ConvexError("grupo_ja_vinculado_ao_produto");
}

async function assertProductUpgradeLinkAvailable(
  ctx: { db: DatabaseReader },
  productId: Id<"products">,
  upgradeId: Id<"commercialUpgrades">,
  currentId?: string,
) {
  const links = await ctx.db
    .query("productUpgrades")
    .withIndex("by_product", (q) => q.eq("productId", productId))
    .collect();
  const existing = links.find((link) => link.upgradeId === upgradeId);
  if (existing && existing._id !== currentId)
    throw new ConvexError("upgrade_ja_vinculado_ao_produto");
}

async function listComplementGroupsForProduct(
  ctx: { db: DatabaseReader },
  productId: Id<"products">,
) {
  const links = (
    await ctx.db
      .query("productComplementGroups")
      .withIndex("by_product_active_order", (q) =>
        q.eq("productId", productId).eq("active", true),
      )
      .collect()
  ).sort(compareCatalogOrder);

  const groups = await Promise.all(
    links.map(async (link) => {
      const group = await ctx.db.get(link.groupId);
      if (!group || !group.active) return null;
      const items = (
        await ctx.db
          .query("complementItems")
          .withIndex("by_group_active_order", (q) =>
            q.eq("groupId", group._id).eq("active", true),
          )
          .collect()
      )
        .sort(compareCatalogOrder)
        .map((item) => ({
          ...item,
          sellable: isComplementItemSellable(item),
        }));

      return {
        ...group,
        displayOrder: link.displayOrder,
        rules: link.rules,
        items,
      };
    }),
  );

  return groups.filter((group) => group !== null);
}

async function listUpgradesForProduct(
  ctx: { db: DatabaseReader },
  productId: Id<"products">,
) {
  const links = (
    await ctx.db
      .query("productUpgrades")
      .withIndex("by_product_active_order", (q) =>
        q.eq("productId", productId).eq("active", true),
      )
      .collect()
  ).sort(compareCatalogOrder);

  const upgrades = await Promise.all(
    links.map(async (link) => {
      const upgrade = await ctx.db.get(link.upgradeId);
      if (!upgrade || !upgrade.active) return null;
      return {
        ...upgrade,
        displayOrder: link.displayOrder,
        rules: link.rules,
        sellable: isUpgradeSellable(upgrade),
      };
    }),
  );

  return upgrades.filter((upgrade) => upgrade !== null);
}

async function listPizzaFlavors(
  ctx: { db: DatabaseReader },
  config: Doc<"pizzaConfigurations"> | null,
) {
  if (!config?.active) return [];
  const configs = await ctx.db
    .query("pizzaConfigurations")
    .withIndex("by_kind_active", (q) =>
      q.eq("pizzaKind", config.pizzaKind).eq("active", true),
    )
    .collect();
  const flavors = await Promise.all(
    configs.map(async (candidateConfig) => {
      const product = await ctx.db.get(candidateConfig.productId);
      if (!product || !product.active) return null;
      const options = (
        await ctx.db
          .query("productOptions")
          .withIndex("by_product_active_order", (q) =>
            q.eq("productId", product._id).eq("active", true),
          )
          .collect()
      ).sort(compareCatalogOrder);
      return {
        _id: product._id,
        documentKey: product.documentKey,
        name: product.name,
        options: options.filter(
          (option) => option.optionType === "pizza_tamanho",
        ),
      };
    }),
  );
  return flavors.filter((flavor) => flavor !== null).sort(compareCatalogOrder);
}

async function getActivePizzaConfiguration(
  ctx: { db: DatabaseReader },
  productId: Id<"products">,
) {
  const config = await ctx.db
    .query("pizzaConfigurations")
    .withIndex("by_product", (q) => q.eq("productId", productId))
    .first();
  return config?.active ? config : null;
}

export const getProductConfiguration = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product || !product.active) return null;
    const pizzaConfiguration = await getActivePizzaConfiguration(
      ctx,
      args.productId,
    );

    return {
      complementGroups: await listComplementGroupsForProduct(
        ctx,
        args.productId,
      ),
      upgrades: await listUpgradesForProduct(ctx, args.productId),
      pizzaConfiguration,
      pizzaFlavors: await listPizzaFlavors(ctx, pizzaConfiguration),
    };
  },
});

export const createComplementGroupMaster = internalMutation({
  args: {
    documentKey: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    minSelections: v.number(),
    maxSelections: v.optional(v.number()),
    required: v.boolean(),
    active: v.optional(v.boolean()),
    displayOrder: v.number(),
    createdBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await assertUniqueDocumentKey(ctx, "complementGroups", args.documentKey);
    assertComplementGroupInvariants(args);
    const now = new Date().toISOString();
    return await ctx.db.insert("complementGroups", {
      documentKey: args.documentKey,
      name: args.name,
      description: args.description,
      minSelections: args.minSelections,
      maxSelections: args.maxSelections,
      required: args.required,
      active: args.active ?? false,
      displayOrder: args.displayOrder,
      createdAt: now,
      updatedAt: now,
      createdBy: args.createdBy,
      updatedBy: args.createdBy,
      version: "1",
    });
  },
});

export const updateComplementGroupMaster = internalMutation({
  args: {
    groupId: v.id("complementGroups"),
    documentKey: v.optional(v.string()),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    minSelections: v.optional(v.number()),
    maxSelections: v.optional(v.number()),
    required: v.optional(v.boolean()),
    active: v.optional(v.boolean()),
    displayOrder: v.optional(v.number()),
    updatedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const group = await assertGroupExists(ctx, args.groupId);
    assertDocumentKeyUpdateIsImmutable(group.documentKey, args.documentKey);
    const next = {
      minSelections: args.minSelections ?? group.minSelections,
      maxSelections: args.maxSelections ?? group.maxSelections,
      required: args.required ?? group.required,
    };
    assertComplementGroupInvariants(next);
    await ctx.db.patch(args.groupId, {
      ...(args.name !== undefined ? { name: args.name } : {}),
      ...(args.description !== undefined
        ? { description: args.description }
        : {}),
      ...(args.minSelections !== undefined
        ? { minSelections: args.minSelections }
        : {}),
      ...(args.maxSelections !== undefined
        ? { maxSelections: args.maxSelections }
        : {}),
      ...(args.required !== undefined ? { required: args.required } : {}),
      ...(args.active !== undefined ? { active: args.active } : {}),
      ...(args.displayOrder !== undefined
        ? { displayOrder: args.displayOrder }
        : {}),
      updatedAt: new Date().toISOString(),
      updatedBy: args.updatedBy,
      version: getNextVersion(group.version),
    });
    return args.groupId;
  },
});

export const createComplementItemMaster = internalMutation({
  args: {
    documentKey: v.string(),
    groupId: v.id("complementGroups"),
    name: v.string(),
    price: v.optional(v.number()),
    priceStatus: priceStatusValidator,
    maxQuantity: v.optional(v.number()),
    active: v.optional(v.boolean()),
    sellable: v.optional(v.boolean()),
    displayOrder: v.number(),
    metadata: v.optional(v.record(v.string(), v.string())),
    createdBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await assertUniqueDocumentKey(ctx, "complementItems", args.documentKey);
    await assertGroupExists(ctx, args.groupId);
    const active = args.active ?? false;
    const sellable = args.sellable ?? false;
    assertComplementItemPriceInvariants({
      active,
      sellable,
      price: args.price,
      priceStatus: args.priceStatus,
    });
    const now = new Date().toISOString();
    return await ctx.db.insert("complementItems", {
      documentKey: args.documentKey,
      groupId: args.groupId,
      name: args.name,
      price: args.price,
      priceStatus: args.priceStatus,
      maxQuantity: args.maxQuantity,
      active,
      sellable,
      displayOrder: args.displayOrder,
      metadata: args.metadata,
      createdAt: now,
      updatedAt: now,
      createdBy: args.createdBy,
      updatedBy: args.createdBy,
      version: "1",
    });
  },
});

export const updateComplementItemMaster = internalMutation({
  args: {
    itemId: v.id("complementItems"),
    documentKey: v.optional(v.string()),
    name: v.optional(v.string()),
    price: v.optional(v.number()),
    priceStatus: v.optional(priceStatusValidator),
    maxQuantity: v.optional(v.number()),
    active: v.optional(v.boolean()),
    sellable: v.optional(v.boolean()),
    displayOrder: v.optional(v.number()),
    metadata: v.optional(v.record(v.string(), v.string())),
    updatedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const item = await assertComplementItemExists(ctx, args.itemId);
    assertDocumentKeyUpdateIsImmutable(item.documentKey, args.documentKey);
    const next = {
      active: args.active ?? item.active,
      sellable: args.sellable ?? item.sellable,
      price: args.price ?? item.price,
      priceStatus: args.priceStatus ?? item.priceStatus,
    };
    assertComplementItemPriceInvariants(next);
    await ctx.db.patch(args.itemId, {
      ...(args.name !== undefined ? { name: args.name } : {}),
      ...(args.price !== undefined ? { price: args.price } : {}),
      ...(args.priceStatus !== undefined
        ? { priceStatus: args.priceStatus }
        : {}),
      ...(args.maxQuantity !== undefined
        ? { maxQuantity: args.maxQuantity }
        : {}),
      ...(args.active !== undefined ? { active: args.active } : {}),
      ...(args.sellable !== undefined ? { sellable: args.sellable } : {}),
      ...(args.displayOrder !== undefined
        ? { displayOrder: args.displayOrder }
        : {}),
      ...(args.metadata !== undefined ? { metadata: args.metadata } : {}),
      updatedAt: new Date().toISOString(),
      updatedBy: args.updatedBy,
      version: getNextVersion(item.version),
    });
    return args.itemId;
  },
});

export const linkComplementGroupToProductMaster = internalMutation({
  args: {
    productId: v.id("products"),
    groupId: v.id("complementGroups"),
    active: v.optional(v.boolean()),
    displayOrder: v.number(),
    rules: rulesValidator,
    createdBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await assertProductExists(ctx, args.productId);
    await assertGroupExists(ctx, args.groupId);
    await assertProductGroupLinkAvailable(ctx, args.productId, args.groupId);
    const now = new Date().toISOString();
    return await ctx.db.insert("productComplementGroups", {
      productId: args.productId,
      groupId: args.groupId,
      active: args.active ?? false,
      displayOrder: args.displayOrder,
      rules: args.rules,
      createdAt: now,
      updatedAt: now,
      createdBy: args.createdBy,
      updatedBy: args.createdBy,
      version: "1",
    });
  },
});

export const createUpgradeMaster = internalMutation({
  args: {
    documentKey: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    priceStatus: priceStatusValidator,
    operationalStatus: upgradeOperationalStatusValidator,
    active: v.optional(v.boolean()),
    displayOrder: v.number(),
    createdBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await assertUniqueDocumentKey(ctx, "commercialUpgrades", args.documentKey);
    const active = args.active ?? false;
    assertUpgradeInvariants({
      active,
      price: args.price,
      priceStatus: args.priceStatus,
      operationalStatus: args.operationalStatus,
    });
    const now = new Date().toISOString();
    return await ctx.db.insert("commercialUpgrades", {
      documentKey: args.documentKey,
      name: args.name,
      description: args.description,
      price: args.price,
      priceStatus: args.priceStatus,
      operationalStatus: args.operationalStatus,
      active,
      displayOrder: args.displayOrder,
      createdAt: now,
      updatedAt: now,
      createdBy: args.createdBy,
      updatedBy: args.createdBy,
      version: "1",
    });
  },
});

export const linkUpgradeToProductMaster = internalMutation({
  args: {
    productId: v.id("products"),
    upgradeId: v.id("commercialUpgrades"),
    active: v.optional(v.boolean()),
    displayOrder: v.number(),
    rules: rulesValidator,
    createdBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await assertProductExists(ctx, args.productId);
    await assertUpgradeExists(ctx, args.upgradeId);
    await assertProductUpgradeLinkAvailable(
      ctx,
      args.productId,
      args.upgradeId,
    );
    const now = new Date().toISOString();
    return await ctx.db.insert("productUpgrades", {
      productId: args.productId,
      upgradeId: args.upgradeId,
      active: args.active ?? false,
      displayOrder: args.displayOrder,
      rules: args.rules,
      createdAt: now,
      updatedAt: now,
      createdBy: args.createdBy,
      updatedBy: args.createdBy,
      version: "1",
    });
  },
});

export const createPizzaConfigurationMaster = internalMutation({
  args: {
    productId: v.id("products"),
    pizzaKind: pizzaKindValidator,
    allowedSizes: v.array(pizzaSizeValidator),
    maxFlavorsBySize: v.object({ P: v.number(), M: v.number(), G: v.number() }),
    secondFlavorAllowed: v.boolean(),
    pricingPolicy: pizzaPricingPolicyValidator,
    active: v.optional(v.boolean()),
    createdBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await assertProductExists(ctx, args.productId);
    const existing = await ctx.db
      .query("pizzaConfigurations")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .first();
    if (existing) throw new ConvexError("configuracao_pizza_ja_existe");
    assertPizzaConfigurationInvariants({
      active: args.active ?? false,
      allowedSizes: args.allowedSizes,
      maxFlavorsBySize: args.maxFlavorsBySize,
      secondFlavorAllowed: args.secondFlavorAllowed,
      pricingPolicy: args.pricingPolicy,
    });
    const now = new Date().toISOString();
    return await ctx.db.insert("pizzaConfigurations", {
      productId: args.productId,
      pizzaKind: args.pizzaKind,
      allowedSizes: args.allowedSizes,
      maxFlavorsBySize: args.maxFlavorsBySize,
      secondFlavorAllowed: args.secondFlavorAllowed,
      pricingPolicy: args.pricingPolicy,
      active: args.active ?? false,
      createdAt: now,
      updatedAt: now,
      createdBy: args.createdBy,
      updatedBy: args.createdBy,
      version: "1",
    });
  },
});

export const previewPizzaPrice = query({
  args: {
    productId: v.id("products"),
    size: pizzaSizeValidator,
    flavorProductIds: v.array(v.id("products")),
  },
  handler: async (ctx, args) => {
    const config = await getActivePizzaConfiguration(ctx, args.productId);
    if (!config) throw new ConvexError("configuracao_pizza_nao_encontrada");

    const flavors = await Promise.all(
      args.flavorProductIds.map(async (productId) => {
        const product = await ctx.db.get(productId);
        if (!product || !product.active || !product.documentKey)
          throw new ConvexError("sabor_pizza_indisponivel");
        const sizeOption = (
          await ctx.db
            .query("productOptions")
            .withIndex("by_product_active_order", (q) =>
              q.eq("productId", product._id).eq("active", true),
            )
            .collect()
        ).find(
          (option) =>
            option.optionType === "pizza_tamanho" &&
            option.metadata?.size === args.size,
        );
        return {
          documentKey: product.documentKey,
          name: product.name,
          price: sizeOption?.price ?? product.basePrice,
          priceStatus:
            sizeOption?.priceStatus ?? product.priceStatus ?? "pendente",
        };
      }),
    );

    return calculatePizzaPrice({
      config: {
        active: config.active,
        allowedSizes: config.allowedSizes as PizzaSize[],
        maxFlavorsBySize: config.maxFlavorsBySize,
        secondFlavorAllowed: config.secondFlavorAllowed,
        pricingPolicy: config.pricingPolicy,
      },
      size: args.size,
      flavors,
    });
  },
});

export const listPendingCommercialRules = query({
  args: {},
  handler: async (ctx) => {
    const pendingComplements = (
      await ctx.db.query("complementItems").collect()
    ).filter(
      (item) =>
        item.priceStatus !== "confirmado" ||
        !hasConfirmedPrice(item.priceStatus, item.price),
    );
    const pendingUpgrades = (
      await ctx.db.query("commercialUpgrades").collect()
    ).filter(
      (upgrade) =>
        upgrade.operationalStatus !== "ativo" ||
        upgrade.priceStatus !== "confirmado",
    );
    const pendingPizzas = (
      await ctx.db.query("pizzaConfigurations").collect()
    ).filter(
      (config) =>
        config.pricingPolicy === "pendente_validacao" &&
        config.secondFlavorAllowed,
    );
    const orphanGroups = await Promise.all(
      (await ctx.db.query("productComplementGroups").collect()).map(
        async (link) => ({
          link,
          product: await ctx.db.get(link.productId),
          group: await ctx.db.get(link.groupId),
        }),
      ),
    );

    return {
      pendingComplements: pendingComplements.sort(compareCatalogOrder),
      pendingUpgrades: pendingUpgrades.sort(compareCatalogOrder),
      pendingPizzas,
      inactiveOrInvalidLinks: orphanGroups.filter(
        ({ product, group }) =>
          !product || !group || !product.active || !group.active,
      ),
    };
  },
});
