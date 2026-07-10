import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel.d.ts";

const prioridadeValidator = v.union(
  v.literal("info"),
  v.literal("attention"),
  v.literal("important"),
  v.literal("critical"),
);

const statusValidator = v.union(
  v.literal("pendente"),
  v.literal("em_andamento"),
  v.literal("concluida"),
  v.literal("cancelada"),
  v.literal("atrasada"),
);

async function getOperadorPorCodigo(ctx: QueryCtx | MutationCtx, operatorId: string) {
  const operador = await ctx.db
    .query("operators")
    .withIndex("by_operatorId", (q) => q.eq("operatorId", operatorId))
    .unique();

  if (!operador) throw new ConvexError({ message: "Operador não encontrado", code: "NOT_FOUND" });
  if (!operador.active) throw new ConvexError({ message: "Operador inativo", code: "FORBIDDEN" });
  return operador;
}

function assertUnidadePermitida(operador: Doc<"operators">, unit: string) {
  if (operador.units.includes("*") || operador.units.includes(unit)) return;
  throw new ConvexError({ message: "Operador sem acesso à unidade", code: "FORBIDDEN" });
}

function podeCriarParaOutro(operador: Doc<"operators">) {
  return ["gerente", "admin", "superadmin"].includes(operador.role);
}

function normalizarDataReferencia(dataReferencia?: string) {
  return dataReferencia || new Date().toISOString().slice(0, 10);
}

function montarDataHora(dataReferencia: string, horario?: string) {
  if (!horario) return undefined;
  return `${dataReferencia}T${horario}:00`;
}

export const criarTarefaAgenda = mutation({
  args: {
    unit: v.string(),
    titulo: v.string(),
    descricao: v.optional(v.string()),
    dataReferencia: v.optional(v.string()),
    horario: v.optional(v.string()),
    modoOperacional: v.string(),
    criadoPorOperatorId: v.string(),
    responsavelOperatorId: v.optional(v.string()),
    prioridade: v.optional(prioridadeValidator),
    alertaAtivo: v.optional(v.boolean()),
    alertaQuando: v.optional(v.string()),
    despertadorAtivo: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<Id<"tarefasAgenda">> => {
    const titulo = args.titulo.trim();
    if (!titulo) {
      throw new ConvexError({ message: "Informe o compromisso", code: "BAD_REQUEST" });
    }

    const criador = await getOperadorPorCodigo(ctx, args.criadoPorOperatorId);
    assertUnidadePermitida(criador, args.unit);

    const responsavelCodigo = args.responsavelOperatorId ?? args.criadoPorOperatorId;
    const responsavel = await getOperadorPorCodigo(ctx, responsavelCodigo);
    assertUnidadePermitida(responsavel, args.unit);

    if (responsavel.operatorId !== criador.operatorId && !podeCriarParaOutro(criador)) {
      throw new ConvexError({
        message: "Criar agenda para outro colaborador exige autorização",
        code: "FORBIDDEN",
      });
    }

    const agora = new Date().toISOString();
    const dataReferencia = normalizarDataReferencia(args.dataReferencia);

    return await ctx.db.insert("tarefasAgenda", {
      unit: args.unit,
      titulo,
      descricao: args.descricao,
      dataReferencia,
      horario: args.horario,
      dataHoraInicio: montarDataHora(dataReferencia, args.horario),
      modoOperacional: args.modoOperacional,
      operadorResponsavelId: responsavel._id,
      operadorResponsavelCodigo: responsavel.operatorId,
      operadorResponsavelNomeSnapshot: responsavel.name,
      criadoPorOperadorId: criador._id,
      criadoPorOperadorCodigo: criador.operatorId,
      criadoPorOperadorNomeSnapshot: criador.name,
      origemTipo: "manual",
      prioridade: args.prioridade ?? "info",
      status: "pendente",
      alertaAtivo: args.alertaAtivo ?? false,
      alertaQuando: args.alertaQuando,
      despertadorAtivo: args.despertadorAtivo ?? false,
      criadaEm: agora,
      atualizadaEm: agora,
    });
  },
});

export const listarTarefasAgenda = query({
  args: {
    unit: v.string(),
    dataInicio: v.optional(v.string()),
    dataFim: v.optional(v.string()),
    operadorId: v.optional(v.string()),
    modoOperacional: v.optional(v.string()),
    incluirConcluidas: v.optional(v.boolean()),
    limite: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const dataInicio = args.dataInicio ?? new Date().toISOString().slice(0, 10);
    const dataFim = args.dataFim ?? dataInicio;
    const limite = args.limite ?? 20;

    const tarefas = await ctx.db
      .query("tarefasAgenda")
      .withIndex("by_unit_data", (q) =>
        q.eq("unit", args.unit).gte("dataReferencia", dataInicio).lte("dataReferencia", dataFim),
      )
      .collect();

    return tarefas
      .filter((tarefa) => {
        if (!args.incluirConcluidas && (tarefa.status === "concluida" || tarefa.status === "cancelada")) {
          return false;
        }
        if (args.operadorId && tarefa.operadorResponsavelCodigo !== args.operadorId) return false;
        if (args.modoOperacional && tarefa.modoOperacional !== args.modoOperacional) return false;
        return true;
      })
      .sort((a, b) => {
        const horaA = a.horario ?? "99:99";
        const horaB = b.horario ?? "99:99";
        return horaA.localeCompare(horaB) || b.criadaEm.localeCompare(a.criadaEm);
      })
      .slice(0, limite);
  },
});

export const getTarefaAgenda = query({
  args: { tarefaId: v.id("tarefasAgenda") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.tarefaId);
  },
});

export const atualizarStatusTarefaAgenda = mutation({
  args: {
    tarefaId: v.id("tarefasAgenda"),
    operadorId: v.string(),
    status: statusValidator,
  },
  handler: async (ctx, args): Promise<void> => {
    const tarefa = await ctx.db.get(args.tarefaId);
    if (!tarefa) throw new ConvexError({ message: "Compromisso não encontrado", code: "NOT_FOUND" });

    const operador = await getOperadorPorCodigo(ctx, args.operadorId);
    assertUnidadePermitida(operador, tarefa.unit);

    const podeAlterar =
      tarefa.operadorResponsavelCodigo === operador.operatorId ||
      tarefa.criadoPorOperadorCodigo === operador.operatorId ||
      podeCriarParaOutro(operador);

    if (!podeAlterar) {
      throw new ConvexError({ message: "Operador sem permissão para alterar compromisso", code: "FORBIDDEN" });
    }

    const agora = new Date().toISOString();
    await ctx.db.patch(args.tarefaId, {
      status: args.status,
      atualizadaEm: agora,
      concluidaEm: args.status === "concluida" ? agora : tarefa.concluidaEm,
      canceladaEm: args.status === "cancelada" ? agora : tarefa.canceladaEm,
    });
  },
});
