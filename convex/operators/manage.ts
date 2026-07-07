
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import type { MutationCtx } from "../_generated/server";

const VALID_ROLES = ["gerente", "caixa", "atendente", "producao", "estoque", "financeiro"] as const;
type OperationalRole = (typeof VALID_ROLES)[number];

function isValidRole(role: string): role is OperationalRole {
  return (VALID_ROLES as readonly string[]).includes(role);
}

const RESERVED_ID_THRESHOLD = 700;

function nowISO(): string {
  return new Date().toISOString();
}

async function assertManager(ctx: MutationCtx, sessionOperatorId: string, unit: string) {
  const manager = await ctx.db
    .query("operators")
    .withIndex("by_operatorId", (q) => q.eq("operatorId", sessionOperatorId))
    .unique();
  if (!manager || !manager.active || manager.role !== "gerente") {
    throw new ConvexError({ message: "Acesso negado. Apenas gerentes podem executar esta ação.", code: "FORBIDDEN" });
  }
  if (!manager.units.includes(unit) && !manager.units.includes("*")) {
    throw new ConvexError({ message: "Acesso negado. Você não pertence a esta unidade.", code: "FORBIDDEN" });
  }
  return manager;
}

async function assertTargetOperator(ctx: MutationCtx, operatorId: string, unit: string) {
  const op = await ctx.db
    .query("operators")
    .withIndex("by_operatorId", (q) => q.eq("operatorId", operatorId))
    .unique();
  if (!op) throw new ConvexError({ message: "Operador não encontrado.", code: "NOT_FOUND" });
  if (parseInt(op.operatorId, 10) >= RESERVED_ID_THRESHOLD) {
    throw new ConvexError({ message: "Este operador é reservado e não pode ser editado.", code: "FORBIDDEN" });
  }
  if (!op.units.includes(unit)) {
    throw new ConvexError({ message: "Operador pertence a outra unidade.", code: "FORBIDDEN" });
  }
  return op;
}

export const listOperatorsByUnit = query({
  args: { unit: v.string() },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("operators").collect();
    return all
      .filter((op) =>
        op.units.includes(args.unit) &&
        parseInt(op.operatorId, 10) < RESERVED_ID_THRESHOLD &&
        op.role !== "superadmin",
      )
      .sort((a, b) => a.operatorId.localeCompare(b.operatorId));
  },
});

export const getOperatorById = query({
  args: { operatorId: v.string() },
  handler: async (ctx, args) => {
    const op = await ctx.db
      .query("operators")
      .withIndex("by_operatorId", (q) => q.eq("operatorId", args.operatorId))
      .unique();
    if (!op || parseInt(op.operatorId, 10) >= RESERVED_ID_THRESHOLD) return null;
    return op;
  },
});

export const createOperator = mutation({
  args: {
    sessionOperatorId: v.string(),
    unit: v.string(),
    name: v.string(),
    role: v.string(),
    pinHash: v.string(),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ success: boolean; operatorId: string }> => {
    await assertManager(ctx, args.sessionOperatorId, args.unit);
    if (!isValidRole(args.role)) {
      throw new ConvexError({ message: `Perfil inválido: ${args.role}`, code: "BAD_REQUEST" });
    }
    const all = await ctx.db.query("operators").collect();
    const maxId = all
      .map((op) => parseInt(op.operatorId, 10))
      .filter((n) => n < RESERVED_ID_THRESHOLD)
      .reduce((max, n) => Math.max(max, n), 0);
    const nextId = String(maxId + 1).padStart(3, "0");
    await ctx.db.insert("operators", {
      operatorId: nextId,
      name: args.name.trim(),
      role: args.role,
      pinHash: args.pinHash,
      units: [args.unit],
      active: true,
      phone: args.phone,
      createdBy: args.sessionOperatorId,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    });
    return { success: true, operatorId: nextId };
  },
});

export const updateOperator = mutation({
  args: {
    sessionOperatorId: v.string(),
    unit: v.string(),
    operatorId: v.string(),
    name: v.string(),
    role: v.string(),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ success: boolean }> => {
    await assertManager(ctx, args.sessionOperatorId, args.unit);
    if (!isValidRole(args.role)) {
      throw new ConvexError({ message: `Perfil inválido: ${args.role}`, code: "BAD_REQUEST" });
    }
    const op = await assertTargetOperator(ctx, args.operatorId, args.unit);
    await ctx.db.patch(op._id, { name: args.name.trim(), role: args.role, phone: args.phone, updatedAt: nowISO() });
    return { success: true };
  },
});

export const setOperatorActive = mutation({
  args: {
    sessionOperatorId: v.string(),
    unit: v.string(),
    operatorId: v.string(),
    active: v.boolean(),
  },
  handler: async (ctx, args): Promise<{ success: boolean }> => {
    await assertManager(ctx, args.sessionOperatorId, args.unit);
    if (args.operatorId === args.sessionOperatorId) {
      throw new ConvexError({ message: "Você não pode desativar sua própria conta.", code: "FORBIDDEN" });
    }
    const op = await assertTargetOperator(ctx, args.operatorId, args.unit);
    await ctx.db.patch(op._id, { active: args.active, updatedAt: nowISO() });
    return { success: true };
  },
});

export const resetOperatorPin = mutation({
  args: {
    sessionOperatorId: v.string(),
    unit: v.string(),
    operatorId: v.string(),
    newPinHash: v.string(),
  },
  handler: async (ctx, args): Promise<{ success: boolean }> => {
    await assertManager(ctx, args.sessionOperatorId, args.unit);
    const op = await assertTargetOperator(ctx, args.operatorId, args.unit);
    await ctx.db.patch(op._id, { pinHash: args.newPinHash, updatedAt: nowISO() });
    return { success: true };
  },
});
