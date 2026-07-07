
import { query } from "../_generated/server";

export const listCategories = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("categories")
      .withIndex("by_order")
      .filter((q) => q.eq(q.field("active"), true))
      .collect();
  },
});

export const listProducts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("products")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();
  },
});
