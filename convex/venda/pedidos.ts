
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel.d.ts";

export function isLegacyProductPrice(price: number | undefined): price is number {
  return typeof price === "number" && Number.isFinite(price);
}

async function gerarNumeroPedido(ctx: QueryCtx | MutationCtx, unit: string): Promise<string> {
  const ultimo = await ctx.db.query("pedidos").withIndex("by_unit_numero", (q) => q.eq("unit", unit)).order("desc").first();
  const proximo = ultimo ? parseInt(ultimo.numero, 10) + 1 : 1;
  return String(proximo).padStart(6, "0");
}

async function resolverOperadorNome(ctx: QueryCtx | MutationCtx, operadorId: Id<"operators">): Promise<string> {
  const op = await ctx.db.get(operadorId);
  if (!op) throw new ConvexError({ message: "Operador não encontrado", code: "NOT_FOUND" });
  if (!op.active) throw new ConvexError({ message: "Operador inativo", code: "FORBIDDEN" });
  return op.name;
}

async function registrarEvento(ctx: MutationCtx, args: { pedidoId: Id<"pedidos">; unit: string; tipo: string; categoria: "operacional" | "financeiro"; operadorId: Id<"operators">; operadorNomeSnapshot: string; payload?: Record<string, unknown>; }): Promise<void> {
  await ctx.db.insert("eventosPedido", {
    pedidoId: args.pedidoId, unit: args.unit, tipo: args.tipo, categoria: args.categoria,
    operadorId: args.operadorId, operadorNomeSnapshot: args.operadorNomeSnapshot,
    payload: args.payload ? JSON.stringify(args.payload) : undefined,
    timestamp: new Date().toISOString(),
  });
}

async function recalcularTotais(ctx: MutationCtx, pedidoId: Id<"pedidos">): Promise<void> {
  const pedido = await ctx.db.get(pedidoId);
  if (!pedido) return;
  const itens = await ctx.db.query("itensPedido").withIndex("by_pedido", (q) => q.eq("pedidoId", pedidoId)).collect();
  const totalBruto = itens.filter((i) => i.statusEntidade === "ativo").reduce((acc, i) => acc + i.subtotal, 0);
  const desconto = pedido.desconto ?? 0;
  const totalLiquido = Math.max(0, totalBruto - desconto);
  await ctx.db.patch(pedidoId, { totalBruto, totalLiquido });
}

export const criarPedido = mutation({
  args: {
    unit: v.string(), canalOrigem: v.string(), modalidadeAtendimento: v.string(),
    operadorAberturaId: v.id("operators"), clienteId: v.optional(v.id("clientes")),
    clienteNomeSnapshot: v.optional(v.string()), clienteNomeImpressaoSnapshot: v.optional(v.string()),
    clienteNomeEntregaSnapshot: v.optional(v.string()), clienteTelefoneSnapshot: v.optional(v.string()),
    clienteCpfSnapshot: v.optional(v.string()), mesaId: v.optional(v.string()),
    mesaNumeroSnapshot: v.optional(v.number()), observacoes: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ pedidoId: Id<"pedidos">; numero: string }> => {
    const operadorNome = await resolverOperadorNome(ctx, args.operadorAberturaId);
    const numero = await gerarNumeroPedido(ctx, args.unit);
    const pedidoId = await ctx.db.insert("pedidos", {
      numero, unit: args.unit, canalOrigem: args.canalOrigem, modalidadeAtendimento: args.modalidadeAtendimento,
      status: "aberto", statusEntidade: "ativo", operadorAberturaId: args.operadorAberturaId,
      operadorAberturaNomeSnapshot: operadorNome, clienteId: args.clienteId,
      clienteNomeSnapshot: args.clienteNomeSnapshot, clienteNomeImpressaoSnapshot: args.clienteNomeImpressaoSnapshot,
      clienteNomeEntregaSnapshot: args.clienteNomeEntregaSnapshot, clienteTelefoneSnapshot: args.clienteTelefoneSnapshot,
      clienteCpfSnapshot: args.clienteCpfSnapshot, mesaId: args.mesaId, mesaNumeroSnapshot: args.mesaNumeroSnapshot,
      totalBruto: 0, totalLiquido: 0, observacoes: args.observacoes, dataAbertura: new Date().toISOString(),
    });
    await registrarEvento(ctx, { pedidoId, unit: args.unit, tipo: "pedido_criado", categoria: "operacional", operadorId: args.operadorAberturaId, operadorNomeSnapshot: operadorNome });
    return { pedidoId, numero };
  },
});

export const adicionarItem = mutation({
  args: {
    pedidoId: v.id("pedidos"), operadorId: v.id("operators"), produtoId: v.id("products"),
    quantidade: v.number(), observacaoItem: v.optional(v.string()),
    adicionais: v.optional(v.array(v.object({ adicionalId: v.string(), nomeSnapshot: v.string(), precoSnapshot: v.number(), quantidade: v.number() }))),
  },
  handler: async (ctx, args): Promise<Id<"itensPedido">> => {
    const pedido = await ctx.db.get(args.pedidoId);
    if (!pedido) throw new ConvexError({ message: "Pedido não encontrado", code: "NOT_FOUND" });
    if (pedido.status !== "aberto" && pedido.status !== "reaberto") throw new ConvexError({ message: "Pedido não está aberto para edição", code: "BAD_REQUEST" });
    const produto = await ctx.db.get(args.produtoId);
    if (!produto) throw new ConvexError({ message: "Produto não encontrado", code: "NOT_FOUND" });
    if (!produto.active) throw new ConvexError({ message: "Produto inativo", code: "BAD_REQUEST" });
    if (!isLegacyProductPrice(produto.price)) throw new ConvexError({ message: "Produto sem preço legado para venda operacional", code: "BAD_REQUEST" });
    const categoria = await ctx.db.get(produto.categoryId);
    const operadorNome = await resolverOperadorNome(ctx, args.operadorId);
    const totalAdicionais = (args.adicionais ?? []).reduce((acc, a) => acc + a.precoSnapshot * a.quantidade, 0);
    const subtotal = produto.price * args.quantidade + totalAdicionais;
    const itemId = await ctx.db.insert("itensPedido", {
      pedidoId: args.pedidoId, unit: pedido.unit, produtoId: args.produtoId,
      nomeProdutoSnapshot: produto.name, precoProdutoSnapshot: produto.price,
      categoriaProdutoSnapshot: categoria?.name ?? "", quantidade: args.quantidade, subtotal,
      adicionais: args.adicionais, observacaoItem: args.observacaoItem,
      statusProducao: "aguardando", statusEntidade: "ativo", dataAdicionado: new Date().toISOString(),
    });
    await recalcularTotais(ctx, args.pedidoId);
    await registrarEvento(ctx, { pedidoId: args.pedidoId, unit: pedido.unit, tipo: "item_adicionado", categoria: "operacional", operadorId: args.operadorId, operadorNomeSnapshot: operadorNome, payload: { itemId, produto: produto.name, quantidade: args.quantidade } });
    return itemId;
  },
});

export const removerItem = mutation({
  args: { itemId: v.id("itensPedido"), operadorId: v.id("operators") },
  handler: async (ctx, args): Promise<void> => {
    const item = await ctx.db.get(args.itemId);
    if (!item) throw new ConvexError({ message: "Item não encontrado", code: "NOT_FOUND" });
    const pedido = await ctx.db.get(item.pedidoId);
    if (!pedido) throw new ConvexError({ message: "Pedido não encontrado", code: "NOT_FOUND" });
    if (pedido.status !== "aberto" && pedido.status !== "reaberto") throw new ConvexError({ message: "Pedido não está aberto para edição", code: "BAD_REQUEST" });
    const operadorNome = await resolverOperadorNome(ctx, args.operadorId);
    await ctx.db.patch(args.itemId, { statusEntidade: "cancelado" });
    await recalcularTotais(ctx, item.pedidoId);
    await registrarEvento(ctx, { pedidoId: item.pedidoId, unit: pedido.unit, tipo: "item_removido", categoria: "operacional", operadorId: args.operadorId, operadorNomeSnapshot: operadorNome, payload: { itemId: args.itemId, produto: item.nomeProdutoSnapshot } });
  },
});

export const confirmarPedido = mutation({
  args: { pedidoId: v.id("pedidos"), operadorId: v.id("operators") },
  handler: async (ctx, args): Promise<void> => {
    const pedido = await ctx.db.get(args.pedidoId);
    if (!pedido) throw new ConvexError({ message: "Pedido não encontrado", code: "NOT_FOUND" });
    if (pedido.status !== "aberto") throw new ConvexError({ message: "Apenas pedidos abertos podem ser confirmados", code: "BAD_REQUEST" });
    const itens = await ctx.db.query("itensPedido").withIndex("by_pedido", (q) => q.eq("pedidoId", args.pedidoId)).collect();
    if (itens.filter((i) => i.statusEntidade === "ativo").length === 0) throw new ConvexError({ message: "Pedido sem itens ativos", code: "BAD_REQUEST" });
    const operadorNome = await resolverOperadorNome(ctx, args.operadorId);
    await ctx.db.patch(args.pedidoId, { status: "enviado_producao" });
    await registrarEvento(ctx, { pedidoId: args.pedidoId, unit: pedido.unit, tipo: "pedido_enviado_producao", categoria: "operacional", operadorId: args.operadorId, operadorNomeSnapshot: operadorNome });
  },
});

export const cancelarPedido = mutation({
  args: { pedidoId: v.id("pedidos"), operadorId: v.id("operators"), motivoCancelamento: v.string() },
  handler: async (ctx, args): Promise<void> => {
    const pedido = await ctx.db.get(args.pedidoId);
    if (!pedido) throw new ConvexError({ message: "Pedido não encontrado", code: "NOT_FOUND" });
    if (pedido.status === "pago" || pedido.status === "cancelado") throw new ConvexError({ message: "Pedido não pode ser cancelado neste estado", code: "BAD_REQUEST" });
    const operadorNome = await resolverOperadorNome(ctx, args.operadorId);
    const agora = new Date().toISOString();
    await ctx.db.patch(args.pedidoId, { status: "cancelado", statusEntidade: "cancelado", operadorCancelamentoId: args.operadorId, operadorCancelamentoNomeSnapshot: operadorNome, motivoCancelamento: args.motivoCancelamento, dataCancelamento: agora });
    await registrarEvento(ctx, { pedidoId: args.pedidoId, unit: pedido.unit, tipo: "pedido_cancelado", categoria: "financeiro", operadorId: args.operadorId, operadorNomeSnapshot: operadorNome, payload: { motivo: args.motivoCancelamento } });
  },
});

export const atualizarQuantidadeItem = mutation({
  args: { itemId: v.id("itensPedido"), operadorId: v.id("operators"), novaQuantidade: v.number() },
  handler: async (ctx, args): Promise<void> => {
    if (args.novaQuantidade < 1) throw new ConvexError({ message: "Quantidade deve ser maior que zero", code: "BAD_REQUEST" });
    const item = await ctx.db.get(args.itemId);
    if (!item) throw new ConvexError({ message: "Item não encontrado", code: "NOT_FOUND" });
    if (item.statusEntidade !== "ativo") throw new ConvexError({ message: "Item não está ativo", code: "BAD_REQUEST" });
    const pedido = await ctx.db.get(item.pedidoId);
    if (!pedido) throw new ConvexError({ message: "Pedido não encontrado", code: "NOT_FOUND" });
    if (pedido.status !== "aberto" && pedido.status !== "reaberto") throw new ConvexError({ message: "Pedido não está aberto para edição", code: "BAD_REQUEST" });
    const operadorNome = await resolverOperadorNome(ctx, args.operadorId);
    const totalAdicionais = (item.adicionais ?? []).reduce((acc, a) => acc + a.precoSnapshot * a.quantidade, 0);
    const novoSubtotal = item.precoProdutoSnapshot * args.novaQuantidade + totalAdicionais;
    await ctx.db.patch(args.itemId, { quantidade: args.novaQuantidade, subtotal: novoSubtotal });
    await recalcularTotais(ctx, item.pedidoId);
    await registrarEvento(ctx, { pedidoId: item.pedidoId, unit: pedido.unit, tipo: "item_alterado", categoria: "operacional", operadorId: args.operadorId, operadorNomeSnapshot: operadorNome, payload: { itemId: args.itemId, produto: item.nomeProdutoSnapshot, quantidadeAnterior: item.quantidade, novaQuantidade: args.novaQuantidade } });
  },
});

export const reabrirPedido = mutation({
  args: { pedidoId: v.id("pedidos"), operadorId: v.id("operators"), motivoReabertura: v.string() },
  handler: async (ctx, args): Promise<void> => {
    const pedido = await ctx.db.get(args.pedidoId);
    if (!pedido) throw new ConvexError({ message: "Pedido não encontrado", code: "NOT_FOUND" });
    if (pedido.status !== "cancelado") throw new ConvexError({ message: "Apenas pedidos cancelados podem ser reabertos", code: "BAD_REQUEST" });
    const operador = await ctx.db.get(args.operadorId);
    if (!operador) throw new ConvexError({ message: "Operador não encontrado", code: "NOT_FOUND" });
    if (operador.role !== "gerente" && operador.role !== "superadmin") throw new ConvexError({ message: "Apenas gerentes podem reabrir pedidos", code: "FORBIDDEN" });
    const operadorNome = await resolverOperadorNome(ctx, args.operadorId);
    await ctx.db.patch(args.pedidoId, { status: "aberto", statusEntidade: "ativo", motivoCancelamento: undefined, dataCancelamento: undefined, operadorCancelamentoId: undefined, operadorCancelamentoNomeSnapshot: undefined });
    await registrarEvento(ctx, { pedidoId: args.pedidoId, unit: pedido.unit, tipo: "pedido_reaberto", categoria: "operacional", operadorId: args.operadorId, operadorNomeSnapshot: operadorNome, payload: { motivoReabertura: args.motivoReabertura, statusAnterior: "cancelado" } });
  },
});

export const marcarEntregue = mutation({
  args: { pedidoId: v.id("pedidos"), operadorId: v.id("operators"), forcar: v.optional(v.boolean()) },
  handler: async (ctx, args): Promise<void> => {
    const pedido = await ctx.db.get(args.pedidoId);
    if (!pedido) throw new ConvexError({ message: "Pedido não encontrado", code: "NOT_FOUND" });
    const statusPermitidos = ["pronto"];
    if (args.forcar) {
      const operador = await ctx.db.get(args.operadorId);
      if (!operador || (operador.role !== "gerente" && operador.role !== "superadmin")) throw new ConvexError({ message: "Apenas gerentes podem forçar entrega", code: "FORBIDDEN" });
      statusPermitidos.push("em_producao", "enviado_producao");
    }
    if (!statusPermitidos.includes(pedido.status)) throw new ConvexError({ message: `Pedido no status "${pedido.status}" não pode ser marcado como entregue`, code: "BAD_REQUEST" });
    const operadorNome = await resolverOperadorNome(ctx, args.operadorId);
    const itensAtivos = await ctx.db.query("itensPedido").withIndex("by_pedido", (q) => q.eq("pedidoId", args.pedidoId)).collect();
    const quantidadeItens = itensAtivos.filter((i) => i.statusEntidade === "ativo").length;
    await ctx.db.patch(args.pedidoId, { status: "entregue", operadorEntregaId: args.operadorId, operadorEntregaNomeSnapshot: operadorNome, dataFechamento: new Date().toISOString() });
    await registrarEvento(ctx, { pedidoId: args.pedidoId, unit: pedido.unit, tipo: "pedido_entregue", categoria: "operacional", operadorId: args.operadorId, operadorNomeSnapshot: operadorNome, payload: { totalLiquido: pedido.totalLiquido, quantidadeItens } });
  },
});

export const avancarStatus = mutation({
  args: { pedidoId: v.id("pedidos"), operadorId: v.id("operators") },
  handler: async (ctx, args): Promise<{ novoStatus: string }> => {
    const pedido = await ctx.db.get(args.pedidoId);
    if (!pedido) throw new ConvexError({ message: "Pedido não encontrado", code: "NOT_FOUND" });
    const maquinaEstados: Record<string, string> = { enviado_producao: "em_producao", em_producao: "pronto", pronto: "entregue" };
    const novoStatus = maquinaEstados[pedido.status];
    if (!novoStatus) throw new ConvexError({ message: `Pedido no status "${pedido.status}" não pode avançar`, code: "BAD_REQUEST" });
    const operadorNome = await resolverOperadorNome(ctx, args.operadorId);
    if (novoStatus === "entregue") {
      await ctx.db.patch(args.pedidoId, { status: novoStatus, operadorEntregaId: args.operadorId, operadorEntregaNomeSnapshot: operadorNome, dataFechamento: new Date().toISOString() });
    } else {
      await ctx.db.patch(args.pedidoId, { status: novoStatus });
    }
    await registrarEvento(ctx, { pedidoId: args.pedidoId, unit: pedido.unit, tipo: `pedido_${novoStatus}`, categoria: "operacional", operadorId: args.operadorId, operadorNomeSnapshot: operadorNome, payload: { statusAnterior: pedido.status, novoStatus } });
    return { novoStatus };
  },
});

export const listarPedidosEmAndamento = query({
  args: { unit: v.string() },
  handler: async (ctx, args) => {
    const statusFila = ["enviado_producao", "em_producao", "pronto", "entregue"] as const;
    const resultados = await Promise.all(
      statusFila.map((status) => ctx.db.query("pedidos").withIndex("by_unit_status", (q) => q.eq("unit", args.unit).eq("status", status)).order("asc").take(100)),
    );
    return resultados.flat().sort((a, b) => a.dataAbertura.localeCompare(b.dataAbertura));
  },
});

export const listarPedidosAbertos = query({
  args: { unit: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("pedidos").withIndex("by_unit_status", (q) => q.eq("unit", args.unit).eq("status", "aberto")).order("desc").take(50);
  },
});

export const getPedidoDetalhe = query({
  args: { pedidoId: v.id("pedidos") },
  handler: async (ctx, args) => {
    const pedido = await ctx.db.get(args.pedidoId);
    if (!pedido) return null;
    const itens = await ctx.db.query("itensPedido").withIndex("by_pedido", (q) => q.eq("pedidoId", args.pedidoId)).collect();
    const eventos = await ctx.db.query("eventosPedido").withIndex("by_pedido", (q) => q.eq("pedidoId", args.pedidoId)).order("asc").collect();
    return { pedido, itens: itens.filter((i) => i.statusEntidade === "ativo"), eventos };
  },
});

export const listarPedidosDoDia = query({
  args: { unit: v.string() },
  handler: async (ctx, args) => {
    const inicioDia = new Date();
    inicioDia.setUTCHours(0, 0, 0, 0);
    const fimDia = new Date();
    fimDia.setUTCHours(23, 59, 59, 999);
    return await ctx.db.query("pedidos").withIndex("by_unit_data", (q) => q.eq("unit", args.unit).gte("dataAbertura", inicioDia.toISOString()).lte("dataAbertura", fimDia.toISOString())).order("desc").take(200);
  },
});
