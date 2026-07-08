import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useTheme } from "next-themes";
import {
  ArrowLeft,
  Activity,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock,
  Database,
  History,
  MessageCircle,
  Moon,
  PackagePlus,
  Printer,
  RefreshCw,
  Send,
  Shuffle,
  Sparkles,
  Sun,
  UserCheck,
  Users,
  Wifi,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api.js";
import type { Id } from "@/convex/_generated/dataModel.d.ts";
import type { OperatorSession } from "@/App.tsx";
import { cn } from "@/lib/utils.ts";
import DashboardHelpPanel from "../dashboard/_components/DashboardHelpPanel.tsx";
import DashboardMenu from "../dashboard/_components/DashboardMenu.tsx";
import InterfaceScalePopover, { type InterfaceScale } from "../dashboard/_components/InterfaceScalePopover.tsx";
import OperationalHealthPopover from "../dashboard/_components/OperationalHealthPopover.tsx";
import type { HealthItem } from "../dashboard/_lib/operationalHealth.ts";
import type { WhatsAppConversation, WhatsAppMessage } from "./_components/types.ts";

type Props = {
  operator: OperatorSession;
  onBack: () => void;
  onLogout: () => void;
  onStartOrder: () => void;
};

type FilterId = "novas" | "aguardando" | "ajuda" | "transferencias";
type JourneyKind = "conversation" | "transfer";

type TransferenciaTrabalho = {
  _id: Id<"transferenciasTrabalho">;
  unit: string;
  origemTipo: string;
  origemId: string;
  dePerfil: string;
  paraPerfil: string;
  paraOperadorId?: Id<"operators">;
  motivo: string;
  acaoEsperada: string;
  contexto: string;
  prioridade: "info" | "attention" | "important" | "critical";
  status: string;
  criadaEm: string;
};

type SessaoCatalogoResumo = {
  _id: Id<"sessoesCatalogo">;
  status: string;
  canalOrigem: string;
  quantidadeItens?: number;
  valorEstimado?: number;
  ajudaSolicitada: boolean;
};

type JourneyItem =
  | {
      kind: "conversation";
      id: Id<"conversasWhatsApp">;
      conversation: WhatsAppConversation;
    }
  | {
      kind: "transfer";
      id: Id<"transferenciasTrabalho">;
      transfer: TransferenciaTrabalho;
    };

const filterLabels: Record<FilterId, string> = {
  novas: "Novas",
  aguardando: "Espera",
  ajuda: "Ajuda",
  transferencias: "Transf.",
};

const filterIcons: Record<FilterId, LucideIcon> = {
  novas: MessageCircle,
  aguardando: Clock,
  ajuda: CircleHelp,
  transferencias: Shuffle,
};

const priorityClasses = {
  info: "bg-emerald-500",
  attention: "bg-amber-400",
  important: "bg-[#f04a2a]",
  critical: "bg-red-700",
};

const priorityText = {
  info: "Informação",
  attention: "Atenção",
  important: "Importante",
  critical: "Crítica",
};

const statusLabels = {
  nova: "Novo contato",
  em_atendimento: "Em atendimento",
  aguardando_cliente: "Aguardando cliente",
  convertida_pedido: "Pedido iniciado",
  encerrada: "Encerrada",
};

type OperatorPreferences = {
  interfaceScale: InterfaceScale;
};

const defaultPreferences: OperatorPreferences = {
  interfaceScale: "normal",
};

function preferencesKey(operatorId: string): string {
  return `alvorada_operator_preferences_${operatorId}`;
}

function loadOperatorPreferences(operatorId: string): OperatorPreferences {
  try {
    const raw = localStorage.getItem(preferencesKey(operatorId));
    if (!raw) return defaultPreferences;
    return { ...defaultPreferences, ...JSON.parse(raw) };
  } catch {
    return defaultPreferences;
  }
}

function saveOperatorPreferences(operatorId: string, preferences: OperatorPreferences) {
  localStorage.setItem(preferencesKey(operatorId), JSON.stringify(preferences));
}

const interfaceScaleClasses: Record<InterfaceScale, string> = {
  small: "[--rvl-card-scale:0.92] [--rvl-font-scale:0.94] [--rvl-space-scale:0.92]",
  normal: "[--rvl-card-scale:1] [--rvl-font-scale:1] [--rvl-space-scale:1]",
  large: "[--rvl-card-scale:1.1] [--rvl-font-scale:1.08] [--rvl-space-scale:1.08]",
};

function formatTime(value?: string) {
  if (!value) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatElapsed(value?: string) {
  if (!value) return "agora";
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(0, Math.floor(diff / 60000));
  if (minutes < 1) return "agora";
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function customerLabel(conversation: WhatsAppConversation) {
  return conversation.clienteNomeSnapshot?.trim() || conversation.clienteTelefoneSnapshot;
}

function channelLabel(conversation: WhatsAppConversation) {
  return conversation.telefoneNormalizado ? "WhatsApp" : "Canal digital";
}

function displayUnit(unit: string) {
  return unit
    .split(/([\s-])/)
    .map((part) => {
      if (part === " " || part === "-") return part;
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join("");
}

function getAuthorizedOperationalModes(role: string) {
  if (role === "gerente" || role === "superadmin") {
    return ["Atendimento", "Venda Balcão", "Caixa", "Delivery", "Produção", "Gerência"];
  }
  if (role === "caixa") return ["Caixa", "Venda Balcão"];
  if (role === "atendente") return ["Atendimento", "Venda Balcão"];
  if (role === "producao") return ["Produção"];
  if (role === "delivery") return ["Delivery"];
  if (role === "estoque") return ["Estoque"];
  if (role === "financeiro") return ["Financeiro"];
  return ["Atendimento"];
}

function getInitialOperationalMode(role: string) {
  const modes = getAuthorizedOperationalModes(role);
  return modes.includes("Atendimento") ? "Atendimento" : modes[0];
}

function getConversationNextAction(conversation: WhatsAppConversation) {
  if (!conversation.operadorResponsavelId) {
    return {
      icon: UserCheck,
      title: "Assumir conversa",
      description: "Defina um responsável para conduzir esta jornada.",
      kind: "assume" as const,
    };
  }

  if (conversation.naoLidas > 0) {
    return {
      icon: MessageCircle,
      title: "Responder cliente",
      description: "Há mensagem nova aguardando retorno do atendimento.",
      kind: "reply" as const,
    };
  }

  if (conversation.pedidoId) {
    return {
      icon: CheckCircle2,
      title: "Acompanhar pedido",
      description: "A conversa já virou pedido. O próximo passo é acompanhar o fluxo operacional.",
      kind: "track" as const,
    };
  }

  return {
    icon: BookOpen,
    title: "Enviar catálogo",
    description: "A jornada está pronta para receber intenção de compra.",
    kind: "catalog" as const,
  };
}

function getJourneySortDate(journey: JourneyItem) {
  if (journey.kind === "transfer") return journey.transfer.criadaEm;
  return journey.conversation.ultimaMensagemEm ?? journey.conversation.dataAtualizacao;
}

function buildJourneyItems(
  conversations: WhatsAppConversation[] | undefined,
  transfers: TransferenciaTrabalho[] | undefined,
  filter: FilterId,
): JourneyItem[] {
  const conversationItems =
    conversations
      ?.filter((conversation) => {
        if (filter === "novas") return conversation.status === "nova";
        if (filter === "aguardando") return conversation.naoLidas > 0;
        if (filter === "ajuda") {
          return conversation.prioridade === "important" || conversation.prioridade === "critical";
        }
        return false;
      })
      .map((conversation) => ({
        kind: "conversation" as const,
        id: conversation._id,
        conversation,
      })) ?? [];

  const transferItems =
    filter === "transferencias"
      ? transfers?.map((transfer) => ({
          kind: "transfer" as const,
          id: transfer._id,
          transfer,
        })) ?? []
      : [];

  return [...conversationItems, ...transferItems].sort((a, b) =>
    getJourneySortDate(b).localeCompare(getJourneySortDate(a)),
  );
}

function CommunicationSummaryPanel({
  counts,
  activeFilter,
  onFilterChange,
}: {
  counts: Record<FilterId, number>;
  activeFilter: FilterId;
  onFilterChange: (filter: FilterId) => void;
}) {
  return (
    <section className="shrink-0 rounded-2xl bg-[#e8e6dc] p-1.5 text-[#5d5822] dark:bg-[#696328] dark:text-[#f8c6aa] sm:p-2">
      <div className="grid grid-cols-4 gap-1">
        {(Object.keys(filterLabels) as FilterId[]).map((item) => {
          const active = activeFilter === item;
          const Icon = filterIcons[item];
          return (
            <button
              key={item}
              type="button"
              onClick={() => onFilterChange(item)}
              className={cn(
                "min-w-0 cursor-pointer rounded-xl px-1.5 py-1.5 text-center transition-colors sm:px-2 sm:py-2",
                active
                  ? "bg-[#5d5822] text-[#fff4e8] dark:bg-[#f8c6aa] dark:text-[#5d5822]"
                  : "text-current hover:bg-[#5d5822]/6 dark:hover:bg-[#f8c6aa]/8",
              )}
            >
              <div className="flex items-center justify-center gap-1.5">
                <Icon className="h-3.5 w-3.5 shrink-0 stroke-[1.8] text-current/68 sm:h-4 sm:w-4" />
                <p className="text-[calc(1.24rem*var(--rvl-font-scale,1))] font-semibold leading-none tabular-nums sm:text-[calc(1.38rem*var(--rvl-font-scale,1))]">
                  {counts[item]}
                </p>
              </div>
              <p className="mt-1 whitespace-nowrap text-[9px] font-medium uppercase tracking-[0.04em] text-current/62 sm:text-[9.8px] sm:tracking-[0.08em]">
                {filterLabels[item]}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function JourneyQueue({
  journeys,
  selected,
  onSelect,
}: {
  journeys: JourneyItem[];
  selected: { kind: JourneyKind; id: string } | null;
  onSelect: (journey: JourneyItem) => void;
}) {
  if (journeys.length === 0) {
    return (
      <div className="px-2 py-2 text-center text-[#5d5822] dark:text-[#f8c6aa] sm:py-4">
        <p className="text-sm font-medium text-current/72">Fila sem jornadas agora.</p>
        <p className="mt-1 text-xs text-current/48">Use Comunicação Agora para alternar os filtros.</p>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
      {journeys.map((journey) => {
        const isSelected = selected?.kind === journey.kind && selected.id === journey.id;
        const isTransfer = journey.kind === "transfer";
        const title = isTransfer ? "Transferência recebida" : customerLabel(journey.conversation);
        const channel = isTransfer ? journey.transfer.dePerfil : channelLabel(journey.conversation);
        const state = isTransfer ? "Trabalho transferido" : statusLabels[journey.conversation.status];
        const priority = isTransfer ? journey.transfer.prioridade : journey.conversation.prioridade;
        const responsible = isTransfer
          ? `Para ${journey.transfer.paraPerfil}`
          : journey.conversation.operadorResponsavelNomeSnapshot ?? "Sem responsável";
        const time = isTransfer
          ? journey.transfer.criadaEm
          : journey.conversation.ultimaMensagemEm ?? journey.conversation.dataAtualizacao;

        return (
          <button
            key={`${journey.kind}-${journey.id}`}
            type="button"
            onClick={() => onSelect(journey)}
            className={cn(
              "w-full cursor-pointer rounded-2xl px-3 py-2.5 text-left transition-colors",
              isSelected
                ? "bg-[#5d5822] text-[#fff4e8] dark:bg-[#f8c6aa] dark:text-[#5d5822]"
                : "bg-[#e8e6dc] text-[#5d5822] hover:bg-[#e8e6dc]/80 dark:bg-[#696328] dark:text-[#f8c6aa] dark:hover:bg-[#696328]/82",
            )}
          >
            <div className="flex items-start gap-2.5">
              <span className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", priorityClasses[priority])} />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold leading-tight">{title}</p>
                    <p className="mt-0.5 truncate text-[10.5px] text-current/60">
                      {channel} · {state}
                    </p>
                  </div>
                  <span className="shrink-0 text-[10px] tabular-nums text-current/56">
                    {formatElapsed(time)}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="truncate text-[10px] text-current/58">{responsible}</span>
                  <span className="text-[10px] text-current/54">{priorityText[priority]}</span>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function CustomerMemoryPreview({ conversation }: { conversation: WhatsAppConversation }) {
  return (
    <div className="rounded-2xl bg-[#5d5822]/7 px-3 py-2.5 dark:bg-[#f8c6aa]/8">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-current/70">
          Memória do Cliente
        </p>
        <button
          type="button"
          onClick={() => toast.info("Customer Memory será detalhada em etapa futura")}
          className="cursor-pointer text-[11px] font-medium text-current/74 underline-offset-4 hover:underline"
        >
          Ver memória
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 text-[11px] leading-snug text-current/68">
        <p>
          <span className="block text-current/46">Cliente</span>
          {conversation.clienteId ? "Conhecido" : "Memória parcial"}
        </p>
        <p>
          <span className="block text-current/46">Recorrência</span>
          Em preparação
        </p>
        <p>
          <span className="block text-current/46">Última compra</span>
          Indisponível
        </p>
        <p>
          <span className="block text-current/46">Preferência</span>
          A confirmar
        </p>
      </div>
    </div>
  );
}

function CatalogSessionSummary({ sessions }: { sessions: SessaoCatalogoResumo[] | undefined }) {
  const session = sessions?.[0];

  return (
    <div className="rounded-2xl bg-[#5d5822]/7 px-3 py-2.5 dark:bg-[#f8c6aa]/8">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-current/70">
        Sessão de Catálogo
      </p>
      {sessions === undefined ? (
        <div className="h-8 animate-pulse rounded-xl bg-current/8" />
      ) : session ? (
        <div className="grid grid-cols-3 gap-2 text-[11px] leading-snug text-current/68">
          <p>
            <span className="block text-current/46">Status</span>
            {session.status}
          </p>
          <p>
            <span className="block text-current/46">Itens</span>
            {session.quantidadeItens ?? 0}
          </p>
          <p>
            <span className="block text-current/46">Origem</span>
            {session.canalOrigem}
          </p>
        </div>
      ) : (
        <p className="text-xs text-current/62">Nenhuma sessão ativa vinculada.</p>
      )}
    </div>
  );
}

function FocusedJourney({
  journey,
  sessions,
}: {
  journey: JourneyItem | null;
  sessions: SessaoCatalogoResumo[] | undefined;
}) {
  if (!journey) {
    return (
      <section className="flex min-h-0 flex-1 flex-col items-center justify-center rounded-2xl bg-[#e8e6dc] px-6 py-4 text-center text-[#5d5822] dark:bg-[#696328] dark:text-[#f8c6aa]">
        <MessageCircle className="mb-2 h-8 w-8 stroke-[1.6] opacity-55 sm:mb-3 sm:h-9 sm:w-9" />
        <p className="text-sm font-semibold">Nenhuma jornada em atendimento.</p>
        <p className="mt-1 max-w-xs text-xs leading-snug text-current/58">
          Assim que uma nova jornada chegar ou você assumir uma existente, ela aparecerá aqui.
        </p>
      </section>
    );
  }

  if (journey.kind === "transfer") {
    return (
      <section className="min-h-0 flex-1 rounded-2xl bg-[#e8e6dc] p-3 text-[#5d5822] dark:bg-[#696328] dark:text-[#f8c6aa]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-current/58">
              Jornada em Foco
            </p>
            <h2 className="mt-1 truncate text-xl font-semibold">Transferência recebida</h2>
            <p className="mt-1 text-xs text-current/62">
              {journey.transfer.dePerfil} → {journey.transfer.paraPerfil}
            </p>
          </div>
          <span className={cn("mt-1 h-2.5 w-2.5 shrink-0 rounded-full", priorityClasses[journey.transfer.prioridade])} />
        </div>

        <div className="mt-4 grid gap-2">
          <div className="rounded-2xl bg-[#5d5822]/7 px-3 py-2.5 dark:bg-[#f8c6aa]/8">
            <p className="text-[11px] text-current/48">Motivo</p>
            <p className="mt-0.5 text-sm font-medium">{journey.transfer.motivo}</p>
          </div>
          <div className="rounded-2xl bg-[#5d5822]/7 px-3 py-2.5 dark:bg-[#f8c6aa]/8">
            <p className="text-[11px] text-current/48">Contexto</p>
            <p className="mt-0.5 line-clamp-3 text-xs leading-relaxed text-current/70">
              {journey.transfer.contexto}
            </p>
          </div>
        </div>
      </section>
    );
  }

  const conversation = journey.conversation;

  return (
    <section className="min-h-0 flex-1 rounded-2xl bg-[#e8e6dc] p-3 text-[#5d5822] dark:bg-[#696328] dark:text-[#f8c6aa]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-current/58">
            Jornada em Foco
          </p>
          <h2 className="mt-1 truncate text-xl font-semibold">{customerLabel(conversation)}</h2>
          <p className="mt-1 truncate text-xs text-current/62">
            {channelLabel(conversation)} · {statusLabels[conversation.status]} ·{" "}
            {conversation.operadorResponsavelNomeSnapshot ?? "Sem responsável"}
          </p>
        </div>
        <span className={cn("mt-1 h-2.5 w-2.5 shrink-0 rounded-full", priorityClasses[conversation.prioridade])} />
      </div>

      <div className="mt-3 rounded-2xl bg-[#5d5822]/7 px-3 py-2.5 dark:bg-[#f8c6aa]/8">
        <p className="text-[11px] text-current/48">Contexto atual</p>
        <p className="mt-0.5 line-clamp-2 text-sm leading-snug text-current/82">
          {conversation.ultimoTextoSnapshot ?? "Conversa aberta sem mensagem textual."}
        </p>
      </div>

      <div className="mt-2 grid gap-2 md:grid-cols-2">
        <CustomerMemoryPreview conversation={conversation} />
        <CatalogSessionSummary sessions={sessions} />
      </div>
    </section>
  );
}

function PrimaryNextAction({
  journey,
  messages,
  sending,
  onAssume,
  onMarkRead,
  onSend,
  onStartOrder,
}: {
  journey: JourneyItem | null;
  messages: WhatsAppMessage[] | undefined;
  sending: boolean;
  onAssume: () => void;
  onMarkRead: () => void;
  onSend: (text: string) => void;
  onStartOrder: () => void;
}) {
  const [text, setText] = useState("");

  if (!journey) {
    return (
      <section className="rounded-2xl bg-[#e8e6dc] p-3 text-[#5d5822] dark:bg-[#696328] dark:text-[#f8c6aa]">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-current/58">
          Próxima Ação
        </p>
        <p className="mt-2 text-sm text-current/68">Aguardando seleção de jornada.</p>
      </section>
    );
  }

  if (journey.kind === "transfer") {
    return (
      <section className="rounded-2xl bg-[#e8e6dc] p-3 text-[#5d5822] dark:bg-[#696328] dark:text-[#f8c6aa]">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-current/58">
          Próxima Ação
        </p>
        <button
          type="button"
          onClick={() => toast.info("Aceite de transferência será ativado na próxima etapa")}
          className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#f04a2a] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#df3e21]"
        >
          <Shuffle className="h-4 w-4" />
          Revisar transferência
        </button>
        <p className="mt-2 text-xs text-current/62">{journey.transfer.acaoEsperada}</p>
      </section>
    );
  }

  const conversation = journey.conversation;
  const action = getConversationNextAction(conversation);
  const ActionIcon = action.icon;

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  };

  const runPrimaryAction = () => {
    if (action.kind === "assume") onAssume();
    if (action.kind === "track") toast.info("Acompanhamento do pedido será aberto pela jornada");
    if (action.kind === "catalog") toast.info("Envio de catálogo será conectado na próxima etapa");
  };

  return (
    <section className="rounded-2xl bg-[#e8e6dc] p-3 text-[#5d5822] dark:bg-[#696328] dark:text-[#f8c6aa]">
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-current/58">
        Próxima Ação
      </p>

      {action.kind === "reply" ? (
        <div className="mt-2">
          <div className="mb-2 flex items-start gap-2 rounded-2xl bg-[#5d5822]/7 px-3 py-2 dark:bg-[#f8c6aa]/8">
            <ActionIcon className="mt-0.5 h-4 w-4 shrink-0 stroke-[1.8]" />
            <div>
              <p className="text-sm font-semibold">{action.title}</p>
              <p className="text-xs text-current/62">{action.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-[#5d5822]/8 px-2 py-2 dark:bg-[#f8c6aa]/8">
            <input
              value={text}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") submit();
              }}
              placeholder="Resposta rápida..."
              className="min-w-0 flex-1 bg-transparent px-1 text-sm text-current placeholder:text-current/44 focus:outline-none"
              disabled={sending}
            />
            <button
              type="button"
              onClick={submit}
              disabled={sending || !text.trim()}
              className="cursor-pointer rounded-full bg-[#f04a2a] p-2 text-white disabled:cursor-default disabled:opacity-45"
              aria-label="Enviar resposta simulada"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={runPrimaryAction}
          className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#f04a2a] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#df3e21]"
        >
          <ActionIcon className="h-4 w-4" />
          {action.title}
        </button>
      )}

      <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
        <button
          type="button"
          onClick={onMarkRead}
          className="cursor-pointer rounded-full bg-[#5d5822]/8 px-3 py-1.5 font-medium text-current/72 dark:bg-[#f8c6aa]/8"
        >
          Marcar lida
        </button>
        <button
          type="button"
          onClick={onStartOrder}
          disabled={Boolean(conversation.pedidoId)}
          className="cursor-pointer rounded-full bg-[#5d5822]/8 px-3 py-1.5 font-medium text-current/72 disabled:cursor-default disabled:opacity-45 dark:bg-[#f8c6aa]/8"
        >
          Criar pedido
        </button>
        <button
          type="button"
          onClick={() => toast.info("Transferência contextual será concluída na próxima etapa")}
          className="cursor-pointer rounded-full bg-[#5d5822]/8 px-3 py-1.5 font-medium text-current/72 dark:bg-[#f8c6aa]/8"
        >
          Transferir
        </button>
      </div>

      {messages && messages.length > 0 && (
        <p className="mt-2 line-clamp-1 text-[11px] text-current/52">
          Última mensagem às {formatTime(messages[messages.length - 1]?.timestamp)}
        </p>
      )}
    </section>
  );
}

function buildHealthItems(role: string): HealthItem[] {
  const items: HealthItem[] = [
    {
      id: "internet",
      label: "Internet",
      icon: Wifi,
      status: typeof navigator !== "undefined" && navigator.onLine ? "online" : "offline",
      weight: 3,
      visibleFor: ["gerente", "superadmin", "caixa", "producao", "atendente", "delivery", "estoque"],
    },
    {
      id: "database",
      label: "Banco",
      icon: Database,
      status: "online",
      weight: 3,
      visibleFor: ["gerente", "superadmin", "caixa", "estoque", "atendente"],
    },
    {
      id: "sync",
      label: "Sync",
      icon: RefreshCw,
      status: "online",
      weight: 2,
      visibleFor: ["gerente", "superadmin", "producao", "atendente", "delivery", "estoque"],
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      icon: MessageCircle,
      status: "pending",
      weight: 1,
      visibleFor: ["gerente", "superadmin", "atendente", "delivery"],
    },
    {
      id: "printer",
      label: "Impressão",
      icon: Printer,
      status: "pending",
      weight: 1,
      visibleFor: ["gerente", "superadmin", "caixa", "producao"],
    },
    {
      id: "hardware",
      label: "Hardware",
      icon: Activity,
      status: "pending",
      weight: 1,
      visibleFor: ["gerente", "superadmin"],
    },
  ];
  return items.filter((item) => item.visibleFor.includes(role) || item.visibleFor.includes("*"));
}

export default function WhatsAppReceptionPage({ operator, onBack, onLogout, onStartOrder }: Props) {
  const unit = operator.units?.[0] ?? "alvorada-01";
  const unitLabel = displayUnit(unit);
  const availableOperationalModes = useMemo(
    () => getAuthorizedOperationalModes(operator.role),
    [operator.role],
  );
  const [operationalMode, setOperationalMode] = useState(() =>
    getInitialOperationalMode(operator.role),
  );
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [showHelp, setShowHelp] = useState(false);
  const [preferences, setPreferences] = useState<OperatorPreferences>(() =>
    loadOperatorPreferences(operator.operatorId),
  );
  const conversations = useQuery(api.ojc.whatsapp.listarConversasAbertas, { unit }) as
    | WhatsAppConversation[]
    | undefined;
  const transferencias = useQuery(api.ojc.transferencias.listarPendentesPorPerfil, {
    unit,
    perfil: operator.role,
  }) as TransferenciaTrabalho[] | undefined;
  const operadorConvex = useQuery(api.venda.operadores.resolveOperatorConvexId, {
    operatorId: operator.operatorId,
  });

  const [filter, setFilter] = useState<FilterId>("novas");
  const [selected, setSelected] = useState<{ kind: JourneyKind; id: string } | null>(null);
  const [sending, setSending] = useState(false);
  const healthItems = useMemo(() => buildHealthItems(operator.role), [operator.role]);

  const updatePreferences = (patch: Partial<OperatorPreferences>) => {
    const next = { ...preferences, ...patch };
    setPreferences(next);
    saveOperatorPreferences(operator.operatorId, next);
  };

  const communicationCounts = useMemo(() => {
    const lista = conversations ?? [];
    return {
      novas: lista.filter((conversation) => conversation.status === "nova").length,
      aguardando: lista.filter((conversation) => conversation.naoLidas > 0).length,
      ajuda: lista.filter(
        (conversation) => conversation.prioridade === "important" || conversation.prioridade === "critical",
      ).length,
      transferencias: transferencias?.length ?? 0,
    };
  }, [conversations, transferencias]);

  const journeys = useMemo(
    () => buildJourneyItems(conversations, transferencias, filter),
    [conversations, transferencias, filter],
  );

  useEffect(() => {
    if (journeys.length === 0) {
      setSelected(null);
      return;
    }
    const stillExists = journeys.some((journey) => selected?.kind === journey.kind && selected.id === journey.id);
    if (!stillExists) {
      setSelected({ kind: journeys[0].kind, id: journeys[0].id });
    }
  }, [journeys, selected]);

  const selectedJourney = useMemo(() => {
    if (!selected) return null;
    return journeys.find((journey) => journey.kind === selected.kind && journey.id === selected.id) ?? null;
  }, [journeys, selected]);

  const selectedConversation =
    selectedJourney?.kind === "conversation" ? selectedJourney.conversation : null;

  const messages = useQuery(
    api.ojc.whatsapp.listarMensagens,
    selectedConversation ? { conversaId: selectedConversation._id } : "skip",
  ) as WhatsAppMessage[] | undefined;

  const catalogSessions = useQuery(
    api.ojc.catalogo.listarPorConversa,
    selectedConversation ? { conversaWhatsAppId: selectedConversation._id } : "skip",
  ) as SessaoCatalogoResumo[] | undefined;

  const assumirConversa = useMutation(api.ojc.whatsapp.assumirConversa);
  const marcarConversaLida = useMutation(api.ojc.whatsapp.marcarConversaLida);
  const enviarMensagem = useMutation(api.ojc.whatsapp.enviarMensagemWhatsApp);

  const handleAssume = async () => {
    if (!selectedConversation || !operadorConvex) return;
    try {
      await assumirConversa({ conversaId: selectedConversation._id, operadorId: operadorConvex._id });
      toast.success("Jornada assumida");
    } catch {
      toast.error("Erro ao assumir jornada");
    }
  };

  const handleMarkRead = async () => {
    if (!selectedConversation) return;
    try {
      await marcarConversaLida({ conversaId: selectedConversation._id });
      toast.success("Jornada marcada como lida");
    } catch {
      toast.error("Erro ao marcar como lida");
    }
  };

  const handleSend = async (text: string) => {
    if (!selectedConversation || !operadorConvex) return;
    setSending(true);
    try {
      await enviarMensagem({
        conversaId: selectedConversation._id,
        operadorId: operadorConvex._id,
        tipo: "texto",
        texto: text,
      });
      toast.success("Resposta simulada registrada");
    } catch {
      toast.error("Erro ao registrar resposta");
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className={cn(
        "flex h-svh flex-col overflow-hidden bg-[#d5d4c8] text-[#5d5822] dark:bg-[#5d5822] dark:text-[#f8c6aa]",
        interfaceScaleClasses[preferences.interfaceScale],
      )}
    >
      <header className="grid shrink-0 grid-cols-[1.85rem_minmax(0,1fr)_9rem] items-center gap-1.5 px-3 py-2.5 md:grid-cols-[2.25rem_minmax(0,1fr)_10.5rem] md:gap-3 md:px-6 md:py-3">
        <button
          type="button"
          onClick={onBack}
          className="cursor-pointer rounded-full p-1.5 text-current/70 transition-colors hover:text-current focus:outline-none sm:p-2"
          aria-label="Voltar"
        >
          <ArrowLeft className="h-5 w-5 stroke-[1.8]" />
        </button>
        <div className="min-w-0">
          <h1 className="max-w-full whitespace-nowrap text-[9.4px] font-semibold uppercase leading-[1.05] tracking-[0.025em] min-[380px]:text-[10.8px] sm:text-sm sm:tracking-[0.12em]">
            Central de Atendimento
          </h1>
          <p className="whitespace-nowrap text-[10.5px] font-light text-current/64 sm:text-[11px]">
            {operationalMode} • {unitLabel}
          </p>
        </div>
        <div className="flex w-full items-center justify-end gap-0.5 sm:gap-1">
          {healthItems.length > 0 && <OperationalHealthPopover items={healthItems} />}
          <InterfaceScalePopover
            value={preferences.interfaceScale}
            onChange={(interfaceScale) => updatePreferences({ interfaceScale })}
          />
          <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="cursor-pointer rounded-full p-1.5 text-[#5d5822]/62 transition-colors hover:text-[#5d5822] focus:outline-none dark:text-[#f8c6aa]/62 dark:hover:text-[#f8c6aa] sm:p-2"
            aria-label="Alternar tema"
          >
            {isDark ? <Sun className="h-[1.15rem] w-[1.15rem] stroke-[1.8]" /> : <Moon className="h-[1.15rem] w-[1.15rem] stroke-[1.8]" />}
          </button>
          <DashboardMenu
            availableOperationalModes={availableOperationalModes}
            currentOperationalMode={operationalMode}
            onOperationalModeChange={setOperationalMode}
            onHelp={() => setShowHelp(true)}
            onLogout={onLogout}
            onFutureAction={(label) => toast.info(`${label} - em breve`)}
          />
        </div>
      </header>

      <main className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-2 px-3 pb-3 md:gap-3 md:px-6 md:pb-4">
        <CommunicationSummaryPanel
          counts={communicationCounts}
          activeFilter={filter}
          onFilterChange={setFilter}
        />

        <section className="grid min-h-0 flex-1 grid-cols-1 gap-3 md:grid-cols-[1fr_21rem]">
          <div className="flex min-h-0 flex-col gap-3">
            <FocusedJourney journey={selectedJourney} sessions={catalogSessions} />
            <PrimaryNextAction
              journey={selectedJourney}
              messages={messages}
              sending={sending}
              onAssume={handleAssume}
              onMarkRead={handleMarkRead}
              onSend={handleSend}
              onStartOrder={() => {
                toast.info("Pedido deve nascer por confirmação explícita do atendente");
                onStartOrder();
              }}
            />
          </div>

          <section className="flex min-h-0 flex-col">
            <div className="mb-2 flex items-center justify-between gap-2 px-1">
              <div>
                <h2 className="text-[11px] font-medium uppercase tracking-[0.1em] text-current/64">
                  Fila de Jornadas
                </h2>
                <p className="text-[10.5px] text-current/48">{filterLabels[filter]}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-current/42" />
            </div>
            <JourneyQueue
              journeys={journeys}
              selected={selected}
              onSelect={(journey) => setSelected({ kind: journey.kind, id: journey.id })}
            />
          </section>
        </section>

        <footer className="hidden shrink-0 items-center gap-2 text-[10.5px] text-current/42 md:flex">
          <Clock className="h-3.5 w-3.5" />
          <span>OJC Sprint 1 · núcleo operacional sem API real, IA ou Customer Memory completa.</span>
          <History className="ml-auto h-3.5 w-3.5" />
        </footer>
      </main>

      <DashboardHelpPanel
        open={showHelp}
        role={operator.role}
        onClose={() => setShowHelp(false)}
      />
    </div>
  );
}
