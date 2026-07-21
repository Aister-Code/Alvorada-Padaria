import { ConvexError, v } from "convex/values";
import { internalMutation, query } from "../_generated/server";
import type { DatabaseReader } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import {
  optionMetadataValidator,
  optionTypeValidator,
  priceStatusValidator,
} from "./contracts";
import { assertProductExists, assertUniqueDocumentKey, findByDocumentKey } from "./dbHelpers";
import {
  assertDocumentKeyUpdateIsImmutable,
  assertOptionPriceInvariants,
  compareCatalogOrder,
  getNextVersion,
  isOptionCommerciallySellable,
} from "./helpers";

async function assertCodeAvailableForProduct(
  ctx: { db: DatabaseReader },
  productId: Id<"products">,
  code: string,
  currentId?: string,
) {
  const options = await ctx.db
    .query("productOptions")
    .withIndex("by_product_active_order", (q) => q.eq("productId", productId))
    .collect();
  const existing = options.find((option) => option.code === code);
  if (existing && existing._id !== currentId) throw new ConvexError("code_duplicado_no_produto");
}

export const listActiveByProduct = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const options = await ctx.db
      .query("productOptions")
      .withIndex("by_product_active_order", (q) => q.eq("productId", args.productId).eq("active", true))
      .collect();
    return options.sort(compareCatalogOrder);
  },
});

export const listSellableByProduct = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const options = await ctx.db
      .query("productOptions")
      .withIndex("by_product_sellable", (q) => q.eq("productId", args.productId).eq("sellable", true))
      .collect();
    return options.filter(isOptionCommerciallySellable).sort(compareCatalogOrder);
  },
});

export const getByDocumentKey = query({
  args: { documentKey: v.string() },
  handler: async (ctx, args) => {
    return await findByDocumentKey(ctx, "productOptions", args.documentKey);
  },
});

export const listInternal = query({
  args: { productId: v.optional(v.id("products")) },
  handler: async (ctx, args) => {
    if (args.productId) {
      const productId = args.productId;
      const options = await ctx.db
        .query("productOptions")
        .withIndex("by_product_active_order", (q) => q.eq("productId", productId))
        .collect();
      return options.sort(compareCatalogOrder);
    }
    const options = await ctx.db.query("productOptions").collect();
    return options.sort(compareCatalogOrder);
  },
});

export const listWithPendingPrice = query({
  args: {},
  handler: async (ctx) => {
    const options = await ctx.db.query("productOptions").collect();
    return options
      .filter((option) => option.priceStatus === "pendente" || option.priceStatus === "aguardando_confirmacao")
      .sort(compareCatalogOrder);
  },
});

export const existsByDocumentKey = query({
  args: { documentKey: v.string() },
  handler: async (ctx, args) => {
    return Boolean(await findByDocumentKey(ctx, "productOptions", args.documentKey));
  },
});

export const createMaster = internalMutation({
  args: {
    documentKey: v.string(),
    productId: v.id("products"),
    code: v.string(),
    label: v.string(),
    optionType: optionTypeValidator,
    price: v.optional(v.number()),
    priceStatus: priceStatusValidator,
    active: v.optional(v.boolean()),
    sellable: v.optional(v.boolean()),
    required: v.optional(v.boolean()),
    displayOrder: v.number(),
    metadata: v.optional(optionMetadataValidator),
    createdBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await assertUniqueDocumentKey(ctx, "productOptions", args.documentKey);
    await assertProductExists(ctx, args.productId);
    await assertCodeAvailableForProduct(ctx, args.productId, args.code);
    const active = args.active ?? false;
    const sellable = args.sellable ?? false;
    const required = args.required ?? false;
    assertOptionPriceInvariants({
      active,
      sellable,
      required,
      price: args.price,
      priceStatus: args.priceStatus,
    });

    const now = new Date().toISOString();
    return await ctx.db.insert("productOptions", {
      documentKey: args.documentKey,
      productId: args.productId,
      code: args.code,
      label: args.label,
      optionType: args.optionType,
      price: args.price,
      priceStatus: args.priceStatus,
      active,
      sellable,
      required,
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

export const updateMaster = internalMutation({
  args: {
    optionId: v.id("productOptions"),
    documentKey: v.optional(v.string()),
    code: v.optional(v.string()),
    label: v.optional(v.string()),
    optionType: v.optional(optionTypeValidator),
    price: v.optional(v.number()),
    priceStatus: v.optional(priceStatusValidator),
    active: v.optional(v.boolean()),
    sellable: v.optional(v.boolean()),
    required: v.optional(v.boolean()),
    displayOrder: v.optional(v.number()),
    metadata: v.optional(optionMetadataValidator),
    updatedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const option = await ctx.db.get(args.optionId);
    if (!option) throw new ConvexError("opcao_nao_encontrada");
    assertDocumentKeyUpdateIsImmutable(option.documentKey, args.documentKey);
    if (args.code !== undefined && args.code !== option.code) {
      await assertCodeAvailableForProduct(ctx, option.productId, args.code, args.optionId);
    }

    const active = args.active ?? option.active;
    const sellable = args.sellable ?? option.sellable;
    const required = args.required ?? option.required;
    const price = args.price ?? option.price;
    const priceStatus = args.priceStatus ?? option.priceStatus;
    assertOptionPriceInvariants({ active, sellable, required, price, priceStatus });

    await ctx.db.patch(args.optionId, {
      ...(args.code !== undefined ? { code: args.code } : {}),
      ...(args.label !== undefined ? { label: args.label } : {}),
      ...(args.optionType !== undefined ? { optionType: args.optionType } : {}),
      ...(args.price !== undefined ? { price: args.price } : {}),
      ...(args.priceStatus !== undefined ? { priceStatus: args.priceStatus } : {}),
      ...(args.active !== undefined ? { active: args.active } : {}),
      ...(args.sellable !== undefined ? { sellable: args.sellable } : {}),
      ...(args.required !== undefined ? { required: args.required } : {}),
      ...(args.displayOrder !== undefined ? { displayOrder: args.displayOrder } : {}),
      ...(args.metadata !== undefined ? { metadata: args.metadata } : {}),
      updatedAt: new Date().toISOString(),
      updatedBy: args.updatedBy,
      version: getNextVersion(option.version),
    });
    return args.optionId;
  },
});

export const setActiveMaster = internalMutation({
  args: {
    optionId: v.id("productOptions"),
    active: v.boolean(),
    updatedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const option = await ctx.db.get(args.optionId);
    if (!option) throw new ConvexError("opcao_nao_encontrada");
    assertOptionPriceInvariants({
      active: args.active,
      sellable: args.active ? option.sellable : false,
      required: option.required,
      price: option.price,
      priceStatus: option.priceStatus,
    });
    await ctx.db.patch(args.optionId, {
      active: args.active,
      sellable: args.active ? option.sellable : false,
      updatedAt: new Date().toISOString(),
      updatedBy: args.updatedBy,
      version: getNextVersion(option.version),
    });
    return args.optionId;
  },
});

export const updateDisplayOrderMaster = internalMutation({
  args: {
    optionId: v.id("productOptions"),
    displayOrder: v.number(),
    updatedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const option = await ctx.db.get(args.optionId);
    if (!option) throw new ConvexError("opcao_nao_encontrada");
    await ctx.db.patch(args.optionId, {
      displayOrder: args.displayOrder,
      updatedAt: new Date().toISOString(),
      updatedBy: args.updatedBy,
      version: getNextVersion(option.version),
    });
    return args.optionId;
  },
});

export const updatePriceMaster = internalMutation({
  args: {
    optionId: v.id("productOptions"),
    price: v.optional(v.number()),
    priceStatus: priceStatusValidator,
    sellable: v.boolean(),
    updatedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const option = await ctx.db.get(args.optionId);
    if (!option) throw new ConvexError("opcao_nao_encontrada");
    assertOptionPriceInvariants({
      active: option.active,
      sellable: args.sellable,
      required: option.required,
      price: args.price,
      priceStatus: args.priceStatus,
    });
    await ctx.db.patch(args.optionId, {
      price: args.price,
      priceStatus: args.priceStatus,
      sellable: args.sellable,
      updatedAt: new Date().toISOString(),
      updatedBy: args.updatedBy,
      version: getNextVersion(option.version),
    });
    return args.optionId;
  },
});

export const setSellableMaster = internalMutation({
  args: {
    optionId: v.id("productOptions"),
    sellable: v.boolean(),
    updatedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const option = await ctx.db.get(args.optionId);
    if (!option) throw new ConvexError("opcao_nao_encontrada");
    assertOptionPriceInvariants({
      active: option.active,
      sellable: args.sellable,
      required: option.required,
      price: option.price,
      priceStatus: option.priceStatus,
    });
    await ctx.db.patch(args.optionId, {
      sellable: args.sellable,
      updatedAt: new Date().toISOString(),
      updatedBy: args.updatedBy,
      version: getNextVersion(option.version),
    });
    return args.optionId;
  },
});
