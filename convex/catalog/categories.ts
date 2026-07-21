
import { ConvexError, v } from "convex/values";
import { internalMutation, mutation, query } from "../_generated/server";
import type { DatabaseReader } from "../_generated/server";
import { assertUniqueDocumentKey, findByDocumentKey } from "./dbHelpers";
import { compareCatalogOrder, getNextVersion } from "./helpers";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("categories")
      .withIndex("by_order")
      .filter((q) => q.eq(q.field("active"), true))
      .collect();
  },
});

export const listActiveMaster = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_active_order", (q) => q.eq("active", true))
      .collect();
    return categories.sort(compareCatalogOrder);
  },
});

export const getByDocumentKey = query({
  args: { documentKey: v.string() },
  handler: async (ctx, args) => {
    return await findByDocumentKey(ctx, "categories", args.documentKey);
  },
});

export const getById = query({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.categoryId);
  },
});

export const listInternal = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db.query("categories").collect();
    return categories.sort(compareCatalogOrder);
  },
});

export const existsByDocumentKey = query({
  args: { documentKey: v.string() },
  handler: async (ctx, args) => {
    return Boolean(await findByDocumentKey(ctx, "categories", args.documentKey));
  },
});

async function assertSlugAvailable(ctx: { db: DatabaseReader }, slug: string, currentId?: string) {
  const existing = await ctx.db
    .query("categories")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .first();
  if (existing && existing._id !== currentId) {
    throw new ConvexError("slug_duplicado");
  }
}

export const createMaster = internalMutation({
  args: {
    documentKey: v.string(),
    code: v.string(),
    name: v.string(),
    slug: v.string(),
    icon: v.string(),
    description: v.optional(v.string()),
    displayOrder: v.number(),
    active: v.optional(v.boolean()),
    createdBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await assertUniqueDocumentKey(ctx, "categories", args.documentKey);
    await assertSlugAvailable(ctx, args.slug);

    const now = new Date().toISOString();
    return await ctx.db.insert("categories", {
      name: args.name,
      slug: args.slug,
      icon: args.icon,
      order: args.displayOrder,
      active: args.active ?? false,
      documentKey: args.documentKey,
      code: args.code,
      description: args.description,
      displayOrder: args.displayOrder,
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
    categoryId: v.id("categories"),
    code: v.optional(v.string()),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    icon: v.optional(v.string()),
    description: v.optional(v.string()),
    displayOrder: v.optional(v.number()),
    updatedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.categoryId);
    if (!category) throw new ConvexError("categoria_nao_encontrada");
    if (args.slug !== undefined && args.slug !== category.slug) {
      await assertSlugAvailable(ctx, args.slug, args.categoryId);
    }

    const patch = {
      ...(args.code !== undefined ? { code: args.code } : {}),
      ...(args.name !== undefined ? { name: args.name } : {}),
      ...(args.slug !== undefined ? { slug: args.slug } : {}),
      ...(args.icon !== undefined ? { icon: args.icon } : {}),
      ...(args.description !== undefined ? { description: args.description } : {}),
      ...(args.displayOrder !== undefined ? { displayOrder: args.displayOrder, order: args.displayOrder } : {}),
      updatedAt: new Date().toISOString(),
      updatedBy: args.updatedBy,
      version: getNextVersion(category.version),
    };
    await ctx.db.patch(args.categoryId, patch);
    return args.categoryId;
  },
});

export const setActiveMaster = internalMutation({
  args: {
    categoryId: v.id("categories"),
    active: v.boolean(),
    updatedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.categoryId);
    if (!category) throw new ConvexError("categoria_nao_encontrada");
    if (args.active && (!category.documentKey || !category.code || !category.slug)) {
      throw new ConvexError("categoria_estruturalmente_invalida");
    }
    await ctx.db.patch(args.categoryId, {
      active: args.active,
      updatedAt: new Date().toISOString(),
      updatedBy: args.updatedBy,
      version: getNextVersion(category.version),
    });
    return args.categoryId;
  },
});

export const updateDisplayOrderMaster = internalMutation({
  args: {
    categoryId: v.id("categories"),
    displayOrder: v.number(),
    updatedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.categoryId);
    if (!category) throw new ConvexError("categoria_nao_encontrada");
    await ctx.db.patch(args.categoryId, {
      displayOrder: args.displayOrder,
      order: args.displayOrder,
      updatedAt: new Date().toISOString(),
      updatedBy: args.updatedBy,
      version: getNextVersion(category.version),
    });
    return args.categoryId;
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("categories").collect();
    if (existing.length > 0) return null;
    const cats = [
      { name: "Padaria", slug: "padaria", icon: "🍞", order: 1, active: true },
      { name: "Lanchonete", slug: "lanchonete", icon: "🍔", order: 2, active: true },
      { name: "Pizzaria", slug: "pizzaria", icon: "🍕", order: 3, active: true },
      { name: "Conveniência", slug: "conveniencia", icon: "🛒", order: 4, active: true },
      { name: "Bebidas", slug: "bebidas", icon: "🥤", order: 5, active: true },
    ];
    const ids: Record<string, string> = {};
    for (const cat of cats) {
      const id = await ctx.db.insert("categories", cat);
      ids[cat.slug] = id;
    }
    return ids;
  },
});
