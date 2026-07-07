
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

export const loginOperator = mutation({
  args: { operatorId: v.string(), pinHash: v.string() },
  handler: async (ctx, args) => {
    const operator = await ctx.db
      .query("operators")
      .withIndex("by_operatorId", (q) => q.eq("operatorId", args.operatorId))
      .unique();
    if (!operator || !operator.active) {
      return { success: false, reason: "not_found" as const };
    }
    if (operator.pinHash !== args.pinHash) {
      return { success: false, reason: "wrong_pin" as const };
    }
    return {
      success: true,
      operator: {
        id: operator._id,
        operatorId: operator.operatorId,
        name: operator.name,
        role: operator.role,
        units: operator.units,
      },
    };
  },
});

export const seedOperators = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("operators").collect();
    if (existing.length > 0) return null;
    const ops = [
      { operatorId: "001", name: "Gerente", role: "gerente", pinHash: hashPin("1234"), units: ["matriz", "filial-1"], active: true },
      { operatorId: "002", name: "Caixa", role: "caixa", pinHash: hashPin("5678"), units: ["matriz"], active: true },
      { operatorId: "003", name: "Atendente", role: "atendente", pinHash: hashPin("0000"), units: ["matriz"], active: true },
    ];
    for (const op of ops) {
      await ctx.db.insert("operators", op);
    }
    return true;
  },
});

export const ensureSystemOperators = mutation({
  args: {},
  handler: async (ctx) => {
    const systemOps = [
      { operatorId: "700", name: "RondônIA Dev", role: "superadmin", pinHash: hashPin("1234"), units: ["*"], active: true },
    ];
    for (const op of systemOps) {
      const existing = await ctx.db
        .query("operators")
        .withIndex("by_operatorId", (q) => q.eq("operatorId", op.operatorId))
        .unique();
      if (!existing) {
        await ctx.db.insert("operators", op);
      }
    }
    return true;
  },
});

function hashPin(pin: string): string {
  return `pin_${pin}`;
}
