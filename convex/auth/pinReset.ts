
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

export const requestReset = mutation({
  args: { operatorId: v.string(), newPinHash: v.string() },
  handler: async (ctx, args) => {
    const operator = await ctx.db
      .query("operators")
      .withIndex("by_operatorId", (q) => q.eq("operatorId", args.operatorId))
      .unique();
    if (!operator || !operator.active) {
      return { success: false, reason: "not_found" as const };
    }
    const existing = await ctx.db
      .query("pinResets")
      .withIndex("by_operatorId", (q) => q.eq("operatorId", args.operatorId))
      .collect();
    for (const r of existing) {
      if (r.status === "pending") await ctx.db.delete(r._id);
    }
    await ctx.db.insert("pinResets", {
      operatorId: args.operatorId,
      newPinHash: args.newPinHash,
      status: "pending",
    });
    return { success: true };
  },
});

export const listPending = query({
  args: {},
  handler: async (ctx) => {
    const resets = await ctx.db
      .query("pinResets")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
    return await Promise.all(
      resets.map(async (r) => {
        const op = await ctx.db
          .query("operators")
          .withIndex("by_operatorId", (q) => q.eq("operatorId", r.operatorId))
          .unique();
        return { ...r, operatorName: op?.name ?? r.operatorId };
      })
    );
  },
});

export const approveReset = mutation({
  args: { resetId: v.id("pinResets") },
  handler: async (ctx, args) => {
    const reset = await ctx.db.get(args.resetId);
    if (!reset || reset.status !== "pending") return { success: false };
    const operator = await ctx.db
      .query("operators")
      .withIndex("by_operatorId", (q) => q.eq("operatorId", reset.operatorId))
      .unique();
    if (!operator) return { success: false };
    await ctx.db.patch(operator._id, { pinHash: reset.newPinHash });
    await ctx.db.patch(args.resetId, { status: "approved" });
    return { success: true };
  },
});

export const rejectReset = mutation({
  args: { resetId: v.id("pinResets") },
  handler: async (ctx, args) => {
    const reset = await ctx.db.get(args.resetId);
    if (!reset) return { success: false };
    await ctx.db.patch(args.resetId, { status: "rejected" });
    return { success: true };
  },
});
