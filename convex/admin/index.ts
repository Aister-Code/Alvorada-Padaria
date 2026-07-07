
import { mutation, query } from "../_generated/server";
import { v, ConvexError } from "convex/values";
import type { MutationCtx, QueryCtx } from "../_generated/server";

async function requireSuperAdmin(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new ConvexError({ code: "UNAUTHENTICATED", message: "Não autenticado" });
  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
    .unique();
  if (!user || user.role !== "superadmin") {
    throw new ConvexError({ code: "FORBIDDEN", message: "Acesso restrito ao superadmin" });
  }
  return user;
}

export const bootstrapSuperAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError({ code: "UNAUTHENTICATED", message: "Não autenticado" });
    const existing = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "superadmin"))
      .first();
    if (existing) throw new ConvexError({ code: "CONFLICT", message: "Superadmin já existe" });
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) throw new ConvexError({ code: "NOT_FOUND", message: "Usuário não encontrado" });
    await ctx.db.patch(user._id, { role: "superadmin" });
    return { success: true };
  },
});

export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
  },
});

export const listOperators = query({
  args: {},
  handler: async (ctx) => {
    await requireSuperAdmin(ctx);
    return await ctx.db.query("operators").collect();
  },
});

export const createOperator = mutation({
  args: {
    operatorId: v.string(),
    name: v.string(),
    role: v.string(),
    pin: v.string(),
    units: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx);
    const existing = await ctx.db
      .query("operators")
      .withIndex("by_operatorId", (q) => q.eq("operatorId", args.operatorId))
      .unique();
    if (existing) throw new ConvexError({ code: "CONFLICT", message: "ID já em uso" });
    await ctx.db.insert("operators", {
      operatorId: args.operatorId,
      name: args.name,
      role: args.role,
      pinHash: `pin_${args.pin}`,
      units: args.units,
      active: true,
    });
    return { success: true };
  },
});

export const toggleOperator = mutation({
  args: { operatorId: v.string() },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx);
    const op = await ctx.db
      .query("operators")
      .withIndex("by_operatorId", (q) => q.eq("operatorId", args.operatorId))
      .unique();
    if (!op) throw new ConvexError({ code: "NOT_FOUND", message: "Operador não encontrado" });
    await ctx.db.patch(op._id, { active: !op.active });
    return { success: true };
  },
});

export const resetOperatorPin = mutation({
  args: { operatorId: v.string(), newPin: v.string() },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx);
    const op = await ctx.db
      .query("operators")
      .withIndex("by_operatorId", (q) => q.eq("operatorId", args.operatorId))
      .unique();
    if (!op) throw new ConvexError({ code: "NOT_FOUND", message: "Operador não encontrado" });
    await ctx.db.patch(op._id, { pinHash: `pin_${args.newPin}` });
    return { success: true };
  },
});

export const listAllPinResets = query({
  args: {},
  handler: async (ctx) => {
    await requireSuperAdmin(ctx);
    return await ctx.db.query("pinResets").collect();
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    await requireSuperAdmin(ctx);
    const operators = await ctx.db.query("operators").collect();
    const pinResets = await ctx.db
      .query("pinResets")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
    const categories = await ctx.db.query("categories").collect();
    const products = await ctx.db.query("products").collect();
    return {
      totalOperators: operators.length,
      activeOperators: operators.filter((o) => o.active).length,
      pendingPinResets: pinResets.length,
      totalCategories: categories.length,
      totalProducts: products.length,
    };
  },
});
