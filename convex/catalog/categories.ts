
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

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
