
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel.d.ts";

async function registrarEventoDelivery(
  ctx: MutationCtx,
  args: {
    pedidoId: Id<"pedidos">;
    unit: string;
    tipo: string;
    categoria: "operacional" | "financeiro";
    operadorId: Id<"operators">;
    operadorNomeSnapshot: string;
    payload?: Record<string, unknown>;
  },
): Promise<void> {
  await ctx.db.insert("eventosPedido", {
    pedidoId: args.pedidoId,
    unit: args.unit,
    tipo: args.tipo,
    categoria: args.categoria,
    operadorId: args.operadorId,
    operadorNomeSnapshot: args.operadorNomeSnapshot,
    payload: args.payload ? JSON.stringify(args.payload) : undefined,
    timestamp: new Date().toISOString(),
  });
}

async function resolverOperadorNome(ctx: MutationCtx, operadorId: Id<"operators">): Promise<string> {
  const op = await ctx.db.get(operadorId);
  if (!op) throw new ConvexError({ message: "Operador não encontrado", code: "NOT_FOUND" });
  if (!op.active) throw new ConvexError({ message: "Operador inativo", code: "FORBIDDEN" });
  return op.name;
}

export const atualizarDadosDelivery = mutation({
  args: {
    pedidoId: v.id("pedidos"),
    operadorId: v.id("operators"),
    clienteNomeSnapshot: v.string(),
    clienteTelefoneSnapshot: v.string(),
    enderecoEntrega: v.object({
      cep: v.string(),
      logradouro: v.string(),
      numero: v.string(),
      complemento: v.optional(v.string()),
      bairro: v.string(),
      cidade: v.string(),
      uf: v.string(),
      referencia: v.optional(v.string()),
      latitude: v.optional(v.number()),
      longitude: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args): Promise<void> => {
    const pedido = await ctx.db.get(args.pedidoId);
    if (!pedido) throw new ConvexError({ message: "Pedido não encontrado", code: "NOT_FOUND" });
    if (pedido.status !== "aberto" && pedido.status !== "reaberto") {
      throw new ConvexError({ message: "Pedido não está aberto para edição", code: "BAD_REQUEST" });
    }
    if (pedido.modalidadeAtendimento !== "delivery") {
      throw new ConvexError({ message: "Pedido não é delivery", code: "BAD_REQUEST" });
    }
    const operadorNome = await resolverOperadorNome(ctx, args.operadorId);
    await ctx.db.patch(args.pedidoId, {
      clienteNomeSnapshot: args.clienteNomeSnapshot,
      clienteTelefoneSnapshot: args.clienteTelefoneSnapshot,
      enderecoEntrega: args.enderecoEntrega,
    });
    await registrarEventoDelivery(ctx, {
      pedidoId: args.pedidoId,
      unit: pedido.unit,
      tipo: "delivery_dados_atualizados",
      categoria: "operacional",
      operadorId: args.operadorId,
      operadorNomeSnapshot: operadorNome,
      payload: { cliente: args.clienteNomeSnapshot, telefone: args.clienteTelefoneSnapshot, bairro: args.enderecoEntrega.bairro },
    });
  },
});

export const registrarSaidaMotoboy = mutation({
  args: { pedidoId: v.id("pedidos"), operadorId: v.id("operators") },
  handler: async (ctx, args): Promise<void> => {
    const pedido = await ctx.db.get(args.pedidoId);
    if (!pedido) throw new ConvexError({ message: "Pedido não encontrado", code: "NOT_FOUND" });
    if (pedido.status !== "pronto") {
      throw new ConvexError({ message: `Pedido no status "${pedido.status}" não pode sair para entrega. Precisa estar "pronto".`, code: "BAD_REQUEST" });
    }
    if (pedido.modalidadeAtendimento !== "delivery") {
      throw new ConvexError({ message: "Apenas pedidos delivery podem sair para entrega", code: "BAD_REQUEST" });
    }
    const operadorNome = await resolverOperadorNome(ctx, args.operadorId);
    await ctx.db.patch(args.pedidoId, { status: "saiu_para_entrega" });
    await registrarEventoDelivery(ctx, {
      pedidoId: args.pedidoId,
      unit: pedido.unit,
      tipo: "pedido_saiu_para_entrega",
      categoria: "operacional",
      operadorId: args.operadorId,
      operadorNomeSnapshot: operadorNome,
      payload: { cliente: pedido.clienteNomeSnapshot, bairro: pedido.enderecoEntrega?.bairro },
    });
  },
});

export const confirmarEntregaDelivery = mutation({
  args: { pedidoId: v.id("pedidos"), operadorId: v.id("operators") },
  handler: async (ctx, args): Promise<void> => {
    const pedido = await ctx.db.get(args.pedidoId);
    if (!pedido) throw new ConvexError({ message: "Pedido não encontrado", code: "NOT_FOUND" });
    if (pedido.status !== "saiu_para_entrega") {
      throw new ConvexError({ message: `Pedido no status "${pedido.status}" não pode ser confirmado como entregue via delivery.`, code: "BAD_REQUEST" });
    }
    const operadorNome = await resolverOperadorNome(ctx, args.operadorId);
    await ctx.db.patch(args.pedidoId, {
      status: "entregue",
      operadorEntregaId: args.operadorId,
      operadorEntregaNomeSnapshot: operadorNome,
      dataFechamento: new Date().toISOString(),
    });
    await registrarEventoDelivery(ctx, {
      pedidoId: args.pedidoId,
      unit: pedido.unit,
      tipo: "pedido_entregue",
      categoria: "operacional",
      operadorId: args.operadorId,
      operadorNomeSnapshot: operadorNome,
      payload: { totalLiquido: pedido.totalLiquido, cliente: pedido.clienteNomeSnapshot, bairro: pedido.enderecoEntrega?.bairro },
    });
  },
});

export const listarFilaDelivery = query({
  args: { unit: v.string() },
  handler: async (ctx, args) => {
    const statusFila = ["pronto", "saiu_para_entrega"] as const;
    const resultados = await Promise.all(
      statusFila.map((status) =>
        ctx.db.query("pedidos").withIndex("by_unit_status", (q) => q.eq("unit", args.unit).eq("status", status)).order("asc").take(100),
      ),
    );
    return resultados.flat().filter((p) => p.modalidadeAtendimento === "delivery").sort((a, b) => a.dataAbertura.localeCompare(b.dataAbertura));
  },
});

export const resumoDashboard = query({
  args: { unit: v.string() },
  handler: async (ctx, args) => {
    const inicioDia = new Date();
    inicioDia.setUTCHours(0, 0, 0, 0);
    const statusAndamento = ["enviado_producao", "em_producao", "pronto", "saiu_para_entrega"] as const;
    const andamentoLists = await Promise.all(
      statusAndamento.map((s) =>
        ctx.db.query("pedidos").withIndex("by_unit_status", (q) => q.eq("unit", args.unit).eq("status", s)).take(200),
      ),
    );
    const emAndamento = andamentoLists.flat().length;
    const prontos = await ctx.db.query("pedidos").withIndex("by_unit_status", (q) => q.eq("unit", args.unit).eq("status", "pronto")).take(200);
    const prontoDelivery = prontos.filter((p) => p.modalidadeAtendimento === "delivery").length;
    const saiuList = await ctx.db.query("pedidos").withIndex("by_unit_status", (q) => q.eq("unit", args.unit).eq("status", "saiu_para_entrega")).take(200);
    const saiuParaEntrega = saiuList.length;
    const entreguesHoje = await ctx.db.query("pedidos").withIndex("by_unit_data", (q) => q.eq("unit", args.unit).gte("dataAbertura", inicioDia.toISOString())).filter((q) => q.eq(q.field("status"), "entregue")).take(200);
    return { emAndamento, prontoDelivery, saiuParaEntrega, entreguesHoje: entreguesHoje.length };
  },
});
