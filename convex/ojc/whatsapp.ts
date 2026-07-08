import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel.d.ts";

type ConversaStatus =
  | "nova"
  | "em_atendimento"
  | "aguardando_cliente"
  | "convertida_pedido"
  | "encerrada";

type MensagemTipo = "texto" | "imagem" | "audio" | "documento" | "sistema";

function normalizarTelefone(telefone: string): string {
  return telefone.replace(/\D/g, "");
}

async function resolverOperadorNome(ctx: QueryCtx | MutationCtx, operadorId: Id<"operators">): Promise<string> {
  const operador = await ctx.db.get(operadorId);
  if (!operador) throw new ConvexError({ message: "Operador não encontrado", code: "NOT_FOUND" });
  if (!operador.active) throw new ConvexError({ message: "Operador inativo", code: "FORBIDDEN" });
  return operador.name;
}

async function buscarClientePorTelefone(ctx: QueryCtx | MutationCtx, unit: string, telefone: string) {
  const telefoneNormalizado = normalizarTelefone(telefone);
  const clienteNormalizado = await ctx.db
    .query("clientes")
    .withIndex("by_unit_telefone_normalizado", (q) =>
      q.eq("unit", unit).eq("telefoneNormalizado", telefoneNormalizado),
    )
    .first();

  if (clienteNormalizado) return clienteNormalizado;

  return await ctx.db
    .query("clientes")
    .withIndex("by_unit_telefone", (q) => q.eq("unit", unit).eq("telefone", telefone))
    .first();
}

async function getConversaAtivaPorChat(ctx: QueryCtx | MutationCtx, whatsappChatId: string) {
  return await ctx.db
    .query("conversasWhatsApp")
    .withIndex("by_chat", (q) => q.eq("whatsappChatId", whatsappChatId))
    .filter((q) => q.neq(q.field("status"), "encerrada"))
    .first();
}

export const receberMensagemWhatsApp = mutation({
  args: {
    unit: v.string(),
    whatsappChatId: v.string(),
    clienteTelefoneSnapshot: v.string(),
    clienteNomeSnapshot: v.optional(v.string()),
    whatsappMessageId: v.optional(v.string()),
    tipo: v.optional(v.union(v.literal("texto"), v.literal("imagem"), v.literal("audio"), v.literal("documento"))),
    texto: v.optional(v.string()),
    mediaUrl: v.optional(v.string()),
    payload: v.optional(v.string()),
    timestamp: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ conversaId: Id<"conversasWhatsApp">; mensagemId: Id<"mensagensWhatsApp"> }> => {
    if (args.whatsappMessageId) {
      const existente = await ctx.db
        .query("mensagensWhatsApp")
        .withIndex("by_whatsapp_message", (q) => q.eq("whatsappMessageId", args.whatsappMessageId))
        .first();
      if (existente) return { conversaId: existente.conversaId, mensagemId: existente._id };
    }

    const agora = args.timestamp ?? new Date().toISOString();
    const telefoneNormalizado = normalizarTelefone(args.clienteTelefoneSnapshot);
    const cliente = await buscarClientePorTelefone(ctx, args.unit, args.clienteTelefoneSnapshot);
    const conversaExistente = await getConversaAtivaPorChat(ctx, args.whatsappChatId);

    let conversaId: Id<"conversasWhatsApp">;
    if (conversaExistente) {
      conversaId = conversaExistente._id;
      await ctx.db.patch(conversaId, {
        clienteId: conversaExistente.clienteId ?? cliente?._id,
        clienteNomeSnapshot: conversaExistente.clienteNomeSnapshot ?? args.clienteNomeSnapshot ?? cliente?.nome,
        clienteTelefoneSnapshot: args.clienteTelefoneSnapshot,
        telefoneNormalizado,
        status: conversaExistente.status === "encerrada" ? "nova" : conversaExistente.status,
        ultimoTextoSnapshot: args.texto,
        ultimaMensagemEm: agora,
        naoLidas: conversaExistente.naoLidas + 1,
        dataAtualizacao: agora,
      });
    } else {
      conversaId = await ctx.db.insert("conversasWhatsApp", {
        unit: args.unit,
        clienteId: cliente?._id,
        clienteNomeSnapshot: args.clienteNomeSnapshot ?? cliente?.nome,
        clienteTelefoneSnapshot: args.clienteTelefoneSnapshot,
        telefoneNormalizado,
        whatsappChatId: args.whatsappChatId,
        canalOrigem: "whatsapp",
        status: "nova",
        prioridade: "info",
        ultimoTextoSnapshot: args.texto,
        ultimaMensagemEm: agora,
        naoLidas: 1,
        dataCriacao: agora,
        dataAtualizacao: agora,
      });
    }

    const mensagemId = await ctx.db.insert("mensagensWhatsApp", {
      conversaId,
      unit: args.unit,
      whatsappMessageId: args.whatsappMessageId,
      direcao: "entrada",
      tipo: args.tipo ?? "texto",
      texto: args.texto,
      mediaUrl: args.mediaUrl,
      payload: args.payload,
      status: "recebida",
      timestamp: agora,
    });

    return { conversaId, mensagemId };
  },
});

export const enviarMensagemWhatsApp = mutation({
  args: {
    conversaId: v.id("conversasWhatsApp"),
    operadorId: v.id("operators"),
    whatsappMessageId: v.optional(v.string()),
    tipo: v.optional(v.union(v.literal("texto"), v.literal("imagem"), v.literal("audio"), v.literal("documento"))),
    texto: v.optional(v.string()),
    mediaUrl: v.optional(v.string()),
    payload: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<Id<"mensagensWhatsApp">> => {
    const conversa = await ctx.db.get(args.conversaId);
    if (!conversa) throw new ConvexError({ message: "Conversa não encontrada", code: "NOT_FOUND" });
    if (conversa.status === "encerrada") {
      throw new ConvexError({ message: "Conversa encerrada", code: "BAD_REQUEST" });
    }

    const operadorNome = await resolverOperadorNome(ctx, args.operadorId);
    const agora = new Date().toISOString();
    const mensagemId = await ctx.db.insert("mensagensWhatsApp", {
      conversaId: args.conversaId,
      unit: conversa.unit,
      whatsappMessageId: args.whatsappMessageId,
      direcao: "saida",
      tipo: args.tipo ?? "texto",
      texto: args.texto,
      mediaUrl: args.mediaUrl,
      payload: args.payload,
      status: "enviada",
      operadorId: args.operadorId,
      operadorNomeSnapshot: operadorNome,
      timestamp: agora,
    });

    await ctx.db.patch(args.conversaId, {
      operadorResponsavelId: conversa.operadorResponsavelId ?? args.operadorId,
      operadorResponsavelNomeSnapshot: conversa.operadorResponsavelNomeSnapshot ?? operadorNome,
      status: conversa.status === "nova" ? "em_atendimento" : conversa.status,
      ultimoTextoSnapshot: args.texto,
      ultimaMensagemEm: agora,
      dataAtualizacao: agora,
    });

    return mensagemId;
  },
});

export const assumirConversa = mutation({
  args: { conversaId: v.id("conversasWhatsApp"), operadorId: v.id("operators") },
  handler: async (ctx, args): Promise<void> => {
    const conversa = await ctx.db.get(args.conversaId);
    if (!conversa) throw new ConvexError({ message: "Conversa não encontrada", code: "NOT_FOUND" });
    if (conversa.status === "encerrada") {
      throw new ConvexError({ message: "Conversa encerrada", code: "BAD_REQUEST" });
    }

    const operadorNome = await resolverOperadorNome(ctx, args.operadorId);
    await ctx.db.patch(args.conversaId, {
      operadorResponsavelId: args.operadorId,
      operadorResponsavelNomeSnapshot: operadorNome,
      status: "em_atendimento",
      dataAtualizacao: new Date().toISOString(),
    });
  },
});

export const marcarConversaLida = mutation({
  args: { conversaId: v.id("conversasWhatsApp") },
  handler: async (ctx, args): Promise<void> => {
    const conversa = await ctx.db.get(args.conversaId);
    if (!conversa) throw new ConvexError({ message: "Conversa não encontrada", code: "NOT_FOUND" });
    await ctx.db.patch(args.conversaId, {
      naoLidas: 0,
      dataAtualizacao: new Date().toISOString(),
    });
  },
});

export const vincularPedido = mutation({
  args: { conversaId: v.id("conversasWhatsApp"), pedidoId: v.id("pedidos") },
  handler: async (ctx, args): Promise<void> => {
    const conversa = await ctx.db.get(args.conversaId);
    if (!conversa) throw new ConvexError({ message: "Conversa não encontrada", code: "NOT_FOUND" });
    const pedido = await ctx.db.get(args.pedidoId);
    if (!pedido) throw new ConvexError({ message: "Pedido não encontrado", code: "NOT_FOUND" });
    if (conversa.unit !== pedido.unit) {
      throw new ConvexError({ message: "Conversa e pedido pertencem a unidades diferentes", code: "BAD_REQUEST" });
    }

    const agora = new Date().toISOString();
    await ctx.db.patch(args.conversaId, {
      pedidoId: args.pedidoId,
      status: "convertida_pedido",
      dataAtualizacao: agora,
    });
    await ctx.db.patch(args.pedidoId, { conversaWhatsAppId: args.conversaId });
  },
});

export const encerrarConversa = mutation({
  args: { conversaId: v.id("conversasWhatsApp") },
  handler: async (ctx, args): Promise<void> => {
    const conversa = await ctx.db.get(args.conversaId);
    if (!conversa) throw new ConvexError({ message: "Conversa não encontrada", code: "NOT_FOUND" });
    const agora = new Date().toISOString();
    await ctx.db.patch(args.conversaId, {
      status: "encerrada",
      dataAtualizacao: agora,
      dataEncerramento: agora,
    });
  },
});

export const listarConversasAbertas = query({
  args: { unit: v.string() },
  handler: async (ctx, args) => {
    const statusAbertos: ConversaStatus[] = ["nova", "em_atendimento", "aguardando_cliente", "convertida_pedido"];
    const resultados = await Promise.all(
      statusAbertos.map((status) =>
        ctx.db
          .query("conversasWhatsApp")
          .withIndex("by_unit_status", (q) => q.eq("unit", args.unit).eq("status", status))
          .take(100),
      ),
    );
    return resultados
      .flat()
      .sort((a, b) => (b.ultimaMensagemEm ?? b.dataAtualizacao).localeCompare(a.ultimaMensagemEm ?? a.dataAtualizacao));
  },
});

export const getConversa = query({
  args: { conversaId: v.id("conversasWhatsApp") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.conversaId);
  },
});

export const listarMensagens = query({
  args: { conversaId: v.id("conversasWhatsApp") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("mensagensWhatsApp")
      .withIndex("by_conversa", (q) => q.eq("conversaId", args.conversaId))
      .order("asc")
      .collect();
  },
});

export const buscarConversaPorTelefone = query({
  args: { unit: v.string(), telefone: v.string() },
  handler: async (ctx, args) => {
    const telefoneNormalizado = normalizarTelefone(args.telefone);
    return await ctx.db
      .query("conversasWhatsApp")
      .withIndex("by_unit_telefone", (q) => q.eq("unit", args.unit).eq("telefoneNormalizado", telefoneNormalizado))
      .order("desc")
      .take(20);
  },
});

export const getConversaPorPedido = query({
  args: { pedidoId: v.id("pedidos") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("conversasWhatsApp")
      .withIndex("by_pedido", (q) => q.eq("pedidoId", args.pedidoId))
      .first();
  },
});
