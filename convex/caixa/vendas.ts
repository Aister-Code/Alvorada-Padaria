
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel.d.ts";

async function gerarNumeroVenda(ctx: QueryCtx | MutationCtx, unit: string): Promise<string> {
  const ultima = await ctx.db
    .query("vendas")
    .withIndex("by_unit_data", (q) => q.eq("unit", unit))
    .order("desc")
    .first();
  const proximo = ultima ? parseInt(ultima.numero, 10) + 1 : 1;
  return String(proximo).padStart(6, "0");
}

async function resolverOperador(ctx: QueryCtx | MutationCtx, operadorId: Id<"operators">): Promise<string> {
  const op = await ctx.db.get(operadorId);
  if (!op) throw new ConvexError({ message: "Operador não encontrado", code: "NOT_FOUND" });
  if (!op.active) throw new ConvexError({ message: "Operador inativo", code: "FORBIDDEN" });
  return op.name;
}

export const fecharVenda = mutation({
  args: {
    pedidoId: v.id("pedidos"),
    operadorId: v.id("operators"),
    formaPagamento: v.string(),
    desconto: v.optional(v.number()),
    troco: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<{ vendaId: Id<"vendas">; numero: string }> => {
    const pedido = await ctx.db.get(args.pedidoId);
    if (!pedido) throw new ConvexError({ message: "Pedido não encontrado", code: "NOT_FOUND" });
    if (pedido.status !== "entregue") {
      throw new ConvexError({
        message: `Pedido no status "${pedido.status}" não pode ser fechado pelo Caixa. Esperado: "entregue".`,
        code: "BAD_REQUEST",
      });
    }
    const vendaExistente = await ctx.db
      .query("vendas")
      .withIndex("by_pedido", (q) => q.eq("pedidoId", args.pedidoId))
      .first();
    if (vendaExistente) {
      throw new ConvexError({ message: "Este pedido já possui uma venda registrada", code: "CONFLICT" });
    }
    const operadorNome = await resolverOperador(ctx, args.operadorId);
    const agora = new Date().toISOString();
    const numero = await gerarNumeroVenda(ctx, pedido.unit);
    const desconto = args.desconto ?? 0;
    const totalLiquido = Math.max(0, pedido.totalBruto - desconto);
    const vendaId = await ctx.db.insert("vendas", {
      pedidoId: args.pedidoId,
      unit: pedido.unit,
      numero,
      status: "paga",
      statusEntidade: "ativo",
      totalBruto: pedido.totalBruto,
      desconto,
      totalLiquido,
      formaPagamento: args.formaPagamento,
      troco: args.troco,
      operadorCaixaId: args.operadorId,
      operadorCaixaNomeSnapshot: operadorNome,
      dataVenda: agora,
    });
    await ctx.db.patch(args.pedidoId, {
      status: "pago",
      formaPagamento: args.formaPagamento,
      troco: args.troco,
      desconto,
      totalLiquido,
      operadorFechamentoId: args.operadorId,
      operadorFechamentoNomeSnapshot: operadorNome,
      dataFechamento: agora,
    });
    await ctx.db.insert("eventosPedido", {
      pedidoId: args.pedidoId,
      unit: pedido.unit,
      tipo: "venda_fechada",
      categoria: "financeiro",
      operadorId: args.operadorId,
      operadorNomeSnapshot: operadorNome,
      payload: JSON.stringify({ vendaId, vendaNumero: numero, formaPagamento: args.formaPagamento, totalBruto: pedido.totalBruto, desconto, totalLiquido, troco: args.troco }),
      timestamp: agora,
    });
    return { vendaId, numero };
  },
});

export const listarPedidosParaPagamento = query({
  args: { unit: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("pedidos")
      .withIndex("by_unit_status", (q) => q.eq("unit", args.unit).eq("status", "entregue"))
      .order("asc")
      .take(100);
  },
});

export const listarVendasDoDia = query({
  args: { unit: v.string() },
  handler: async (ctx, args) => {
    const inicioDia = new Date();
    inicioDia.setUTCHours(0, 0, 0, 0);
    const fimDia = new Date();
    fimDia.setUTCHours(23, 59, 59, 999);
    return await ctx.db
      .query("vendas")
      .withIndex("by_unit_data", (q) =>
        q.eq("unit", args.unit).gte("dataVenda", inicioDia.toISOString()).lte("dataVenda", fimDia.toISOString()),
      )
      .order("desc")
      .take(200);
  },
});
