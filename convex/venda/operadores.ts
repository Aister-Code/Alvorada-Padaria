
import { query } from "../_generated/server";
import { v } from "convex/values";

export const resolveOperatorConvexId = query({
  args: { operatorId: v.string() },
  handler: async (ctx, args) => {
    const op = await ctx.db
      .query("operators")
      .withIndex("by_operatorId", (q) => q.eq("operatorId", args.operatorId))
      .unique();
    if (!op) return null;
    return { _id: op._id, name: op.name, role: op.role, units: op.units };
  },
});
