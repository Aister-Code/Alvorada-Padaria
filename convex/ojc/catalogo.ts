import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel.d.ts";
import {
  catalogCartContractValidator,
  CATALOG_CART_CONTRACT_VERSION,
} from "../catalog/contracts";

type SessaoStatus =
  | "navegando"
  | "carrinho"
  | "aguardando"
  | "abandonada"
  | "assumida"
  | "convertida"
  | "encerrada";

const statusSessaoValidator = v.union(
  v.literal("navegando"),
  v.literal("carrinho"),
  v.literal("aguardando"),
  v.literal("abandonada"),
  v.literal("assumida"),
  v.literal("convertida"),
  v.literal("encerrada"),
);

const prioridadeValidator = v.union(
  v.literal("info"),
  v.literal("attention"),
  v.literal("important"),
  v.literal("critical"),
);

// Contrato legado para itensSnapshot:
// JSON.stringify({
//   itens: [{
//     produtoId?: string,
//     nome: string,
//     quantidade: number,
//     precoUnitario?: number,
//     subtotal?: number,
//     observacao?: string
//   }]
// })
// M-003.M1 introduz cartSnapshot tipado e preserva itensSnapshot para leitura
// de registros antigos durante a transicao.
function validarJsonString(valor: string | undefined, campo: string) {
  if (!valor) return;
  try {
    JSON.parse(valor);
  } catch {
    throw new ConvexError({ message: `${campo} deve ser uma string JSON válida`, code: "BAD_REQUEST" });
  }
}

function normalizarTelefone(telefone: string | undefined): string | undefined {
  if (!telefone) return undefined;
  const normalizado = telefone.replace(/\D/g, "");
  return normalizado || undefined;
}

async function getOperadorAtivo(ctx: QueryCtx | MutationCtx, operadorId: Id<"operators">) {
  const operador = await ctx.db.get(operadorId);
  if (!operador) throw new ConvexError({ message: "Operador não encontrado", code: "NOT_FOUND" });
  if (!operador.active) throw new ConvexError({ message: "Operador inativo", code: "FORBIDDEN" });
  return operador;
}

async function assertSessaoAberta(ctx: MutationCtx, sessaoId: Id<"sessoesCatalogo">) {
  const sessao = await ctx.db.get(sessaoId);
  if (!sessao) throw new ConvexError({ message: "Sessão de catálogo não encontrada", code: "NOT_FOUND" });
  if (sessao.status === "convertida" || sessao.status === "encerrada") {
    throw new ConvexError({ message: "Sessão de catálogo já finalizada", code: "BAD_REQUEST" });
  }
  return sessao;
}

export const criarSessaoCatalogo = mutation({
  args: {
    unit: v.string(),
    clienteId: v.optional(v.id("clientes")),
    clienteNomeSnapshot: v.optional(v.string()),
    clienteTelefoneSnapshot: v.optional(v.string()),
    canalOrigem: v.string(),
    origemDetalhe: v.optional(v.string()),
    conversaWhatsAppId: v.optional(v.id("conversasWhatsApp")),
    itensSnapshot: v.optional(v.string()),
    cartSnapshot: v.optional(catalogCartContractValidator),
    quantidadeItens: v.optional(v.number()),
    valorEstimado: v.optional(v.number()),
    enderecoEntregaSnapshot: v.optional(v.string()),
    observacoes: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<Id<"sessoesCatalogo">> => {
    validarJsonString(args.itensSnapshot, "itensSnapshot");
    validarJsonString(args.enderecoEntregaSnapshot, "enderecoEntregaSnapshot");

    if (args.clienteId) {
      const cliente = await ctx.db.get(args.clienteId);
      if (!cliente) throw new ConvexError({ message: "Cliente não encontrado", code: "NOT_FOUND" });
      if (cliente.unit !== args.unit) {
        throw new ConvexError({ message: "Cliente pertence a outra unidade", code: "BAD_REQUEST" });
      }
    }

    if (args.conversaWhatsAppId) {
      const conversa = await ctx.db.get(args.conversaWhatsAppId);
      if (!conversa) throw new ConvexError({ message: "Conversa não encontrada", code: "NOT_FOUND" });
      if (conversa.unit !== args.unit) {
        throw new ConvexError({ message: "Conversa pertence a outra unidade", code: "BAD_REQUEST" });
      }
    }

    const agora = new Date().toISOString();
    const temCarrinho =
      (args.quantidadeItens ?? 0) > 0 ||
      Boolean(args.itensSnapshot) ||
      Boolean(args.cartSnapshot && args.cartSnapshot.items.length > 0);

    return await ctx.db.insert("sessoesCatalogo", {
      unit: args.unit,
      clienteId: args.clienteId,
      clienteNomeSnapshot: args.clienteNomeSnapshot,
      clienteTelefoneSnapshot: args.clienteTelefoneSnapshot,
      telefoneNormalizado: normalizarTelefone(args.clienteTelefoneSnapshot),
      canalOrigem: args.canalOrigem,
      origemDetalhe: args.origemDetalhe,
      conversaWhatsAppId: args.conversaWhatsAppId,
      status: temCarrinho ? "carrinho" : "navegando",
      prioridade: "info",
      itensSnapshot: args.itensSnapshot,
      cartContractVersion: args.cartSnapshot ? CATALOG_CART_CONTRACT_VERSION : undefined,
      cartSnapshot: args.cartSnapshot,
      quantidadeItens: args.quantidadeItens,
      valorEstimado: args.valorEstimado,
      enderecoEntregaSnapshot: args.enderecoEntregaSnapshot,
      observacoes: args.observacoes,
      ajudaSolicitada: false,
      criadaEm: agora,
      atualizadaEm: agora,
      ultimaInteracaoEm: agora,
    });
  },
});

export const registrarInteracaoCatalogo = mutation({
  args: {
    sessaoId: v.id("sessoesCatalogo"),
    status: v.optional(statusSessaoValidator),
    prioridade: v.optional(prioridadeValidator),
    observacoes: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<void> => {
    await assertSessaoAberta(ctx, args.sessaoId);
    const agora = new Date().toISOString();
    const patch: {
      status?: SessaoStatus;
      prioridade?: "info" | "attention" | "important" | "critical";
      observacoes?: string;
      atualizadaEm: string;
      ultimaInteracaoEm: string;
    } = {
      atualizadaEm: agora,
      ultimaInteracaoEm: agora,
    };
    if (args.status !== undefined) patch.status = args.status;
    if (args.prioridade !== undefined) patch.prioridade = args.prioridade;
    if (args.observacoes !== undefined) patch.observacoes = args.observacoes;
    await ctx.db.patch(args.sessaoId, patch);
  },
});

export const atualizarCarrinhoSessao = mutation({
  args: {
    sessaoId: v.id("sessoesCatalogo"),
    itensSnapshot: v.string(),
    cartSnapshot: v.optional(catalogCartContractValidator),
    quantidadeItens: v.number(),
    valorEstimado: v.number(),
  },
  handler: async (ctx, args): Promise<void> => {
    await assertSessaoAberta(ctx, args.sessaoId);
    validarJsonString(args.itensSnapshot, "itensSnapshot");
    const agora = new Date().toISOString();
    await ctx.db.patch(args.sessaoId, {
      status: args.quantidadeItens > 0 ? "carrinho" : "navegando",
      itensSnapshot: args.itensSnapshot,
      cartContractVersion: args.cartSnapshot ? CATALOG_CART_CONTRACT_VERSION : undefined,
      cartSnapshot: args.cartSnapshot,
      quantidadeItens: args.quantidadeItens,
      valorEstimado: args.valorEstimado,
      atualizadaEm: agora,
      ultimaInteracaoEm: agora,
    });
  },
});

export const solicitarAjuda = mutation({
  args: { sessaoId: v.id("sessoesCatalogo"), prioridade: v.optional(prioridadeValidator) },
  handler: async (ctx, args): Promise<void> => {
    await assertSessaoAberta(ctx, args.sessaoId);
    const agora = new Date().toISOString();
    await ctx.db.patch(args.sessaoId, {
      status: "aguardando",
      prioridade: args.prioridade ?? "attention",
      ajudaSolicitada: true,
      ajudaSolicitadaEm: agora,
      atualizadaEm: agora,
      ultimaInteracaoEm: agora,
    });
  },
});

export const assumirSessao = mutation({
  args: { sessaoId: v.id("sessoesCatalogo"), operadorId: v.id("operators") },
  handler: async (ctx, args): Promise<void> => {
    await assertSessaoAberta(ctx, args.sessaoId);
    const operador = await getOperadorAtivo(ctx, args.operadorId);
    const agora = new Date().toISOString();
    await ctx.db.patch(args.sessaoId, {
      status: "assumida",
      responsavelAtualId: args.operadorId,
      responsavelAtualNomeSnapshot: operador.name,
      assumidaEm: agora,
      atualizadaEm: agora,
    });
  },
});

export const vincularConversa = mutation({
  args: { sessaoId: v.id("sessoesCatalogo"), conversaWhatsAppId: v.id("conversasWhatsApp") },
  handler: async (ctx, args): Promise<void> => {
    const sessao = await assertSessaoAberta(ctx, args.sessaoId);
    const conversa = await ctx.db.get(args.conversaWhatsAppId);
    if (!conversa) throw new ConvexError({ message: "Conversa não encontrada", code: "NOT_FOUND" });
    if (conversa.unit !== sessao.unit) {
      throw new ConvexError({ message: "Conversa pertence a outra unidade", code: "BAD_REQUEST" });
    }

    await ctx.db.patch(args.sessaoId, {
      conversaWhatsAppId: args.conversaWhatsAppId,
      atualizadaEm: new Date().toISOString(),
    });
  },
});

export const converterSessaoEmPedido = mutation({
  args: { sessaoId: v.id("sessoesCatalogo"), pedidoId: v.id("pedidos") },
  handler: async (ctx, args): Promise<void> => {
    const sessao = await assertSessaoAberta(ctx, args.sessaoId);
    const pedido = await ctx.db.get(args.pedidoId);
    if (!pedido) throw new ConvexError({ message: "Pedido não encontrado", code: "NOT_FOUND" });
    if (pedido.unit !== sessao.unit) {
      throw new ConvexError({ message: "Pedido pertence a outra unidade", code: "BAD_REQUEST" });
    }

    const agora = new Date().toISOString();
    await ctx.db.patch(args.sessaoId, {
      pedidoId: args.pedidoId,
      status: "convertida",
      convertidaEm: agora,
      atualizadaEm: agora,
    });
  },
});

export const encerrarSessao = mutation({
  args: { sessaoId: v.id("sessoesCatalogo") },
  handler: async (ctx, args): Promise<void> => {
    const sessao = await ctx.db.get(args.sessaoId);
    if (!sessao) throw new ConvexError({ message: "Sessão de catálogo não encontrada", code: "NOT_FOUND" });
    const agora = new Date().toISOString();
    await ctx.db.patch(args.sessaoId, {
      status: "encerrada",
      encerradaEm: agora,
      atualizadaEm: agora,
    });
  },
});

export const marcarAbandonada = mutation({
  args: { sessaoId: v.id("sessoesCatalogo") },
  handler: async (ctx, args): Promise<void> => {
    await assertSessaoAberta(ctx, args.sessaoId);
    const agora = new Date().toISOString();
    await ctx.db.patch(args.sessaoId, {
      status: "abandonada",
      prioridade: "attention",
      abandonadaEm: agora,
      atualizadaEm: agora,
    });
  },
});

export const listarSessoesAbertas = query({
  args: { unit: v.string() },
  handler: async (ctx, args) => {
    const statusAbertos: SessaoStatus[] = ["navegando", "carrinho", "aguardando", "abandonada", "assumida"];
    const resultados = await Promise.all(
      statusAbertos.map((status) =>
        ctx.db
          .query("sessoesCatalogo")
          .withIndex("by_unit_status", (q) => q.eq("unit", args.unit).eq("status", status))
          .take(100),
      ),
    );
    return resultados.flat().sort((a, b) => b.atualizadaEm.localeCompare(a.atualizadaEm));
  },
});

export const listarSessoesComAjuda = query({
  args: { unit: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sessoesCatalogo")
      .withIndex("by_ajuda", (q) => q.eq("unit", args.unit).eq("ajudaSolicitada", true))
      .filter((q) => q.neq(q.field("status"), "encerrada"))
      .filter((q) => q.neq(q.field("status"), "convertida"))
      .collect();
  },
});

export const getSessaoCatalogo = query({
  args: { sessaoId: v.id("sessoesCatalogo") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.sessaoId);
  },
});

export const listarPorConversa = query({
  args: { conversaWhatsAppId: v.id("conversasWhatsApp") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sessoesCatalogo")
      .withIndex("by_conversa_whatsapp", (q) => q.eq("conversaWhatsAppId", args.conversaWhatsAppId))
      .order("desc")
      .collect();
  },
});

export const getSessaoPorPedido = query({
  args: { pedidoId: v.id("pedidos") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sessoesCatalogo")
      .withIndex("by_pedido", (q) => q.eq("pedidoId", args.pedidoId))
      .first();
  },
});

export const buscarSessoesPorTelefone = query({
  args: { unit: v.string(), telefone: v.string() },
  handler: async (ctx, args) => {
    const telefoneNormalizado = normalizarTelefone(args.telefone);
    if (!telefoneNormalizado) return [];
    return await ctx.db
      .query("sessoesCatalogo")
      .withIndex("by_telefone", (q) => q.eq("unit", args.unit).eq("telefoneNormalizado", telefoneNormalizado))
      .order("desc")
      .take(50);
  },
});

export const listarMinhasSessoes = query({
  args: { operadorId: v.id("operators") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sessoesCatalogo")
      .withIndex("by_responsavel", (q) => q.eq("responsavelAtualId", args.operadorId))
      .order("desc")
      .take(100);
  },
});
