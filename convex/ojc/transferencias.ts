import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel.d.ts";

async function getOperadorAtivo(ctx: MutationCtx, operadorId: Id<"operators">) {
  const operador = await ctx.db.get(operadorId);
  if (!operador) throw new ConvexError({ message: "Operador não encontrado", code: "NOT_FOUND" });
  if (!operador.active) throw new ConvexError({ message: "Operador inativo", code: "FORBIDDEN" });
  return operador;
}

export const criarTransferencia = mutation({
  args: {
    unit: v.string(),
    origemTipo: v.string(),
    origemId: v.string(),
    deOperadorId: v.id("operators"),
    paraPerfil: v.string(),
    paraOperadorId: v.optional(v.id("operators")),
    motivo: v.string(),
    acaoEsperada: v.string(),
    contexto: v.string(),
    prioridade: v.union(
      v.literal("info"),
      v.literal("attention"),
      v.literal("important"),
      v.literal("critical"),
    ),
  },
  handler: async (ctx, args): Promise<Id<"transferenciasTrabalho">> => {
    const operadorOrigem = await getOperadorAtivo(ctx, args.deOperadorId);

    if (args.paraOperadorId) {
      const operadorDestino = await getOperadorAtivo(ctx, args.paraOperadorId);
      if (operadorDestino.role !== args.paraPerfil) {
        throw new ConvexError({
          message: "Operador destino não pertence ao perfil informado",
          code: "BAD_REQUEST",
        });
      }
    }

    return await ctx.db.insert("transferenciasTrabalho", {
      unit: args.unit,
      origemTipo: args.origemTipo,
      origemId: args.origemId,
      dePerfil: operadorOrigem.role,
      deOperadorId: args.deOperadorId,
      paraPerfil: args.paraPerfil,
      paraOperadorId: args.paraOperadorId,
      motivo: args.motivo,
      acaoEsperada: args.acaoEsperada,
      contexto: args.contexto,
      prioridade: args.prioridade,
      status: "pendente",
      criadaEm: new Date().toISOString(),
    });
  },
});

export const aceitarTransferencia = mutation({
  args: {
    transferenciaId: v.id("transferenciasTrabalho"),
    operadorId: v.id("operators"),
  },
  handler: async (ctx, args): Promise<void> => {
    const transferencia = await ctx.db.get(args.transferenciaId);
    if (!transferencia) throw new ConvexError({ message: "Transferência não encontrada", code: "NOT_FOUND" });
    if (transferencia.status !== "pendente") {
      throw new ConvexError({ message: "Transferência não está pendente", code: "BAD_REQUEST" });
    }

    const operador = await getOperadorAtivo(ctx, args.operadorId);
    if (transferencia.paraOperadorId && transferencia.paraOperadorId !== args.operadorId) {
      throw new ConvexError({ message: "Transferência direcionada a outro operador", code: "FORBIDDEN" });
    }
    if (operador.role !== transferencia.paraPerfil) {
      throw new ConvexError({ message: "Operador não pertence ao perfil destino", code: "FORBIDDEN" });
    }

    await ctx.db.patch(args.transferenciaId, {
      paraOperadorId: args.operadorId,
      status: "aceita",
      aceitaEm: new Date().toISOString(),
    });
  },
});

export const concluirTransferencia = mutation({
  args: {
    transferenciaId: v.id("transferenciasTrabalho"),
    operadorId: v.id("operators"),
  },
  handler: async (ctx, args): Promise<void> => {
    const transferencia = await ctx.db.get(args.transferenciaId);
    if (!transferencia) throw new ConvexError({ message: "Transferência não encontrada", code: "NOT_FOUND" });
    if (transferencia.status !== "aceita") {
      throw new ConvexError({ message: "Transferência precisa estar aceita", code: "BAD_REQUEST" });
    }
    if (transferencia.paraOperadorId !== args.operadorId) {
      throw new ConvexError({ message: "Apenas o responsável destino pode concluir", code: "FORBIDDEN" });
    }

    await getOperadorAtivo(ctx, args.operadorId);
    await ctx.db.patch(args.transferenciaId, {
      status: "concluida",
      concluidaEm: new Date().toISOString(),
    });
  },
});

export const cancelarTransferencia = mutation({
  args: {
    transferenciaId: v.id("transferenciasTrabalho"),
    operadorId: v.id("operators"),
  },
  handler: async (ctx, args): Promise<void> => {
    const transferencia = await ctx.db.get(args.transferenciaId);
    if (!transferencia) throw new ConvexError({ message: "Transferência não encontrada", code: "NOT_FOUND" });
    if (transferencia.status === "concluida" || transferencia.status === "cancelada") {
      throw new ConvexError({ message: "Transferência já finalizada", code: "BAD_REQUEST" });
    }

    const operador = await getOperadorAtivo(ctx, args.operadorId);
    const podeCancelar =
      transferencia.deOperadorId === args.operadorId ||
      transferencia.paraOperadorId === args.operadorId ||
      operador.role === "gerente" ||
      operador.role === "superadmin";

    if (!podeCancelar) {
      throw new ConvexError({ message: "Operador sem permissão para cancelar", code: "FORBIDDEN" });
    }

    await ctx.db.patch(args.transferenciaId, {
      status: "cancelada",
      concluidaEm: new Date().toISOString(),
    });
  },
});

export const listarPendentesPorPerfil = query({
  args: { unit: v.string(), perfil: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("transferenciasTrabalho")
      .withIndex("by_destino_perfil_status", (q) =>
        q.eq("unit", args.unit).eq("paraPerfil", args.perfil).eq("status", "pendente"),
      )
      .order("desc")
      .collect();
  },
});

export const listarMinhasTransferencias = query({
  args: { operadorId: v.id("operators") },
  handler: async (ctx, args) => {
    const recebidas = await ctx.db
      .query("transferenciasTrabalho")
      .withIndex("by_destino_operador_status", (q) => q.eq("paraOperadorId", args.operadorId).eq("status", "aceita"))
      .collect();
    const enviadas = await ctx.db
      .query("transferenciasTrabalho")
      .withIndex("by_de_operador", (q) => q.eq("deOperadorId", args.operadorId))
      .take(100);

    return [...recebidas, ...enviadas].sort((a, b) => b.criadaEm.localeCompare(a.criadaEm));
  },
});

export const listarPorOrigem = query({
  args: { origemTipo: v.string(), origemId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("transferenciasTrabalho")
      .withIndex("by_origem", (q) => q.eq("origemTipo", args.origemTipo).eq("origemId", args.origemId))
      .order("desc")
      .collect();
  },
});
