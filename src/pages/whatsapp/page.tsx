import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode, type WheelEvent } from "react";
import { useMutation, useQuery } from "convex/react";
import { useTheme } from "next-themes";
import {
  ArrowLeft,
  Banknote,
  BarChart3,
  Bike,
  BookOpen,
  CalendarDays,
  ChefHat,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CircleHelp,
  Clock,
  Camera,
  FileText,
  Globe2,
  History,
  Heart,
  Hourglass,
  Inbox,
  MessageCircle,
  Moon,
  Package,
  Phone,
  ReceiptText,
  Send,
  Settings,
  ShoppingCart,
  Shuffle,
  Sparkles,
  Sun,
  Tag,
  UserCheck,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api.js";
import type { Id } from "@/convex/_generated/dataModel.d.ts";
import type { OperatorSession } from "@/App.tsx";
import { cn } from "@/lib/utils.ts";
import DashboardHelpPanel from "../dashboard/_components/DashboardHelpPanel.tsx";
import DashboardMenu from "../dashboard/_components/DashboardMenu.tsx";
import type { InterfaceScale } from "../dashboard/_components/InterfaceScalePopover.tsx";
import {
  buildOperationalHealthInventory,
  getVisibleHealthItems,
} from "../dashboard/_lib/operationalHealth.ts";
import type { WhatsAppConversation, WhatsAppMessage } from "./_components/types.ts";

type Props = {
  operator: OperatorSession;
  onBack: () => void;
  onLogout: () => void;
  onStartOrder: () => void;
};

type FilterId = "ia" | "humano" | "carrinhos" | "transferencias" | "todas";
type JourneyKind = "conversation" | "transfer";
type AtendimentoTab = "conversas" | "pedidos" | "clientes" | "agenda";
type SignalTone = "neutral" | "green" | "amber" | "red" | "blue";

type TransferenciaTrabalho = {
  _id: Id<"transferenciasTrabalho">;
  unit: string;
  origemTipo: string;
  origemId: string;
  dePerfil: string;
  deOperadorId?: Id<"operators">;
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
  conversaWhatsAppId?: Id<"conversasWhatsApp">;
  pedidoId?: Id<"pedidos">;
  itensSnapshot?: string;
  quantidadeItens?: number;
  valorEstimado?: number;
  responsavelAtualNomeSnapshot?: string;
  ajudaSolicitada: boolean;
  atualizadaEm: string;
  ultimaInteracaoEm?: string;
};

type PedidoDetalheResumo = {
  pedido: {
    numero?: string;
    status?: string;
    totalLiquido?: number;
    totalBruto?: number;
    dataAbertura?: string;
    canalOrigem?: string;
  };
  itens: Array<{
    nomeSnapshot?: string;
    quantidade?: number;
    subtotal?: number;
  }>;
  eventos: Array<{
    tipo?: string;
    timestamp?: string;
    operadorNomeSnapshot?: string;
  }>;
} | null;

type CustomerMemorySummary = {
  recurrence: string;
  lastPurchase: string;
  preference: string;
  account: "OK" | "Pendente";
};

type CartPanelState = {
  customerName: string;
  session: SessaoCatalogoResumo;
} | null;

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
  ia: "IA",
  humano: "Humano",
  todas: "Todas",
  carrinhos: "Carrinhos",
  transferencias: "Repasses",
};

const filterIcons: Record<FilterId, LucideIcon> = {
  ia: Sparkles,
  humano: UserCheck,
  todas: Inbox,
  carrinhos: ShoppingCart,
  transferencias: Shuffle,
};

const conversationFilterOrder: FilterId[] = ["ia", "humano", "transferencias", "carrinhos", "todas"];

const signalToneTextClasses: Record<SignalTone, string> = {
  neutral: "text-current/58",
  green: "text-emerald-600 dark:text-emerald-300",
  amber: "text-amber-600 dark:text-amber-300",
  red: "text-red-700 dark:text-red-300",
  blue: "text-sky-700 dark:text-sky-300",
};

const contextualMenu: Record<AtendimentoTab, string[]> = {
  conversas: ["RelatÃ³rios", "Filtros", "Mensagens rÃ¡pidas", "ConfiguraÃ§Ãµes da conversa", "Ajuda"],
  pedidos: ["Em aberto", "Em produÃ§Ã£o", "Prontos", "Encerrados", "Ajuda", "ConfiguraÃ§Ãµes de pedidos"],
  clientes: ["Todos", "Recorrentes", "Com pedido", "Ajuda", "ConfiguraÃ§Ãµes de clientes"],
  agenda: ["Hoje", "AmanhÃ£", "PendÃªncias", "Configurar agenda"],
};

const filterLabelsByTab: Record<AtendimentoTab, string> = {
  conversas: "Conversas",
  pedidos: "Pedidos",
  clientes: "Clientes",
  agenda: "Agenda",
};

const priorityClasses = {
  info: "bg-emerald-500",
  attention: "bg-amber-400",
  important: "bg-amber-500",
  critical: "bg-red-700",
};

const priorityBorderClasses = {
  info: "border-emerald-600/70 dark:border-emerald-300/75",
  attention: "border-amber-600/75 dark:border-amber-300/85",
  important: "border-amber-700/80 dark:border-amber-200/90",
  critical: "border-red-700/85 dark:border-red-300/90",
};

const channelVisuals: Record<string, { icon: LucideIcon; className: string; label: string }> = {
  whatsapp: {
    icon: MessageCircle,
    className: "text-emerald-600 dark:text-emerald-300",
    label: "WhatsApp",
  },
  instagram: {
    icon: Camera,
    className: "text-pink-600 dark:text-pink-300",
    label: "Instagram",
  },
  telefone: {
    icon: Phone,
    className: "text-sky-700 dark:text-sky-300",
    label: "Telefone",
  },
  site: {
    icon: Globe2,
    className: "text-blue-700 dark:text-blue-300",
    label: "Site",
  },
  catalogo: {
    icon: BookOpen,
    className: "text-amber-700 dark:text-amber-300",
    label: "Catalogo Digital",
  },
};

const priorityText = {
  info: "InformaÃ§Ã£o",
  attention: "AtenÃ§Ã£o",
  important: "Importante",
  critical: "CrÃ­tica",
};

const statusLabels = {
  nova: "Novo contato",
  em_atendimento: "Em atendimento",
  aguardando_cliente: "Aguardando cliente",
  convertida_pedido: "Pedido iniciado",
  encerrada: "Encerrada",
};

const DEMO_CONVERSA_ID = "demo_conversa_whatsapp" as Id<"conversasWhatsApp">;
const DEMO_CONVERSA_2_ID = "demo_conversa_whatsapp_2" as Id<"conversasWhatsApp">;
const DEMO_CONVERSA_3_ID = "demo_conversa_whatsapp_3" as Id<"conversasWhatsApp">;
const DEMO_SESSAO_ID = "demo_sessao_catalogo" as Id<"sessoesCatalogo">;

const demoConversation: WhatsAppConversation = {
  _id: DEMO_CONVERSA_ID,
  unit: "alvorada-01",
  clienteId: "demo_cliente" as Id<"clientes">,
  clienteNomeSnapshot: "Marina Souza",
  clienteTelefoneSnapshot: "(69) 99911-2040",
  telefoneNormalizado: "69999112040",
  status: "nova",
  prioridade: "attention",
  operadorResponsavelId: "demo_operator" as Id<"operators">,
  operadorResponsavelNomeSnapshot: "Atendimento",
  ultimoTextoSnapshot: "Cliente pediu ajuda para confirmar o carrinho do cardÃ¡pio antes de finalizar o pedido.",
  ultimaMensagemEm: new Date(Date.now() - 4 * 60000).toISOString(),
  naoLidas: 0,
  dataCriacao: new Date(Date.now() - 22 * 60000).toISOString(),
  dataAtualizacao: new Date(Date.now() - 4 * 60000).toISOString(),
};

const demoConversationWait: WhatsAppConversation = {
  _id: DEMO_CONVERSA_2_ID,
  unit: "alvorada-01",
  clienteId: "demo_cliente_2" as Id<"clientes">,
  clienteNomeSnapshot: "JoÃ£o Pereira",
  clienteTelefoneSnapshot: "(69) 99204-1188",
  telefoneNormalizado: "69992041188",
  status: "aguardando_cliente",
  prioridade: "info",
  operadorResponsavelId: "demo_operator" as Id<"operators">,
  operadorResponsavelNomeSnapshot: "Atendimento",
  ultimoTextoSnapshot: "Aguardando confirmaÃ§Ã£o do endereÃ§o para seguir com o pedido.",
  ultimaMensagemEm: new Date(Date.now() - 8 * 60000).toISOString(),
  naoLidas: 0,
  dataCriacao: new Date(Date.now() - 34 * 60000).toISOString(),
  dataAtualizacao: new Date(Date.now() - 8 * 60000).toISOString(),
};

const demoConversationNew: WhatsAppConversation = {
  _id: DEMO_CONVERSA_3_ID,
  unit: "alvorada-01",
  clienteNomeSnapshot: "Cliente novo",
  clienteTelefoneSnapshot: "(69) 99331-7740",
  telefoneNormalizado: "69993317740",
  status: "nova",
  prioridade: "important",
  ultimoTextoSnapshot: "Bom dia, vocÃªs entregam pÃ£o de queijo para escritÃ³rio?",
  ultimaMensagemEm: new Date(Date.now() - 2 * 60000).toISOString(),
  naoLidas: 1,
  dataCriacao: new Date(Date.now() - 2 * 60000).toISOString(),
  dataAtualizacao: new Date(Date.now() - 2 * 60000).toISOString(),
};

const demoMessages: WhatsAppMessage[] = [
  {
    _id: "demo_msg_1" as Id<"mensagensWhatsApp">,
    conversaId: DEMO_CONVERSA_ID,
    direcao: "entrada",
    tipo: "texto",
    texto: "Boa tarde! Quero repetir o pedido de ontem e adicionar uma bebida.",
    status: "recebida",
    timestamp: new Date(Date.now() - 18 * 60000).toISOString(),
  },
  {
    _id: "demo_msg_2" as Id<"mensagensWhatsApp">,
    conversaId: DEMO_CONVERSA_ID,
    direcao: "saida",
    tipo: "texto",
    texto: "Claro, Marina. Separei seu carrinho e vou confirmar os itens com vocÃª.",
    status: "enviada",
    operadorNomeSnapshot: "Atendimento",
    timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
  },
  {
    _id: "demo_msg_3" as Id<"mensagensWhatsApp">,
    conversaId: DEMO_CONVERSA_ID,
    direcao: "entrada",
    tipo: "texto",
    texto: "Pode confirmar. O endereÃ§o Ã© o mesmo.",
    status: "recebida",
    timestamp: new Date(Date.now() - 4 * 60000).toISOString(),
  },
];

const demoCatalogSession: SessaoCatalogoResumo = {
  _id: DEMO_SESSAO_ID,
  status: "carrinho",
  canalOrigem: "WhatsApp",
  itensSnapshot: JSON.stringify({
    itens: [
      { nome: "Pizza mÃ©dia calabresa", quantidade: 1, precoUnitario: 48 },
      { nome: "Coca-Cola 2L", quantidade: 1, precoUnitario: 12 },
    ],
  }),
  quantidadeItens: 2,
  valorEstimado: 60,
  responsavelAtualNomeSnapshot: "Atendimento",
  ajudaSolicitada: true,
  atualizadaEm: new Date(Date.now() - 4 * 60000).toISOString(),
  ultimaInteracaoEm: new Date(Date.now() - 4 * 60000).toISOString(),
};

const demoTransferReceived: TransferenciaTrabalho = {
  _id: "demo_transfer_received" as Id<"transferenciasTrabalho">,
  unit: "alvorada-01",
  origemTipo: "conversa",
  origemId: DEMO_CONVERSA_ID,
  dePerfil: "Delivery",
  deOperadorId: "demo_delivery" as Id<"operators">,
  paraPerfil: "Atendimento",
  motivo: "Cliente pediu ajuste no endereÃ§o.",
  acaoEsperada: "Confirmar endereÃ§o com o cliente.",
  contexto: "Pedido ainda nÃ£o foi despachado.",
  prioridade: "attention",
  status: "pendente",
  criadaEm: new Date(Date.now() - 7 * 60000).toISOString(),
};

const demoTransferSent: TransferenciaTrabalho = {
  _id: "demo_transfer_sent" as Id<"transferenciasTrabalho">,
  unit: "alvorada-01",
  origemTipo: "conversa",
  origemId: DEMO_CONVERSA_ID,
  dePerfil: "Atendimento",
  deOperadorId: "demo_operator" as Id<"operators">,
  paraPerfil: "Caixa",
  motivo: "Cliente perguntou sobre pagamento.",
  acaoEsperada: "Caixa deve orientar forma de pagamento.",
  contexto: "Carrinho pronto aguardando confirmaÃ§Ã£o.",
  prioridade: "attention",
  status: "aguardando_aceite",
  criadaEm: new Date(Date.now() - 11 * 60000).toISOString(),
};

const demoPedidoDetalhe: PedidoDetalheResumo = {
  pedido: {
    numero: "1284",
    status: "rascunho",
    totalLiquido: 60,
    dataAbertura: new Date(Date.now() - 24 * 60 * 60000).toISOString(),
    canalOrigem: "WhatsApp",
  },
  itens: [
    { nomeSnapshot: "Pizza mÃ©dia calabresa", quantidade: 1, subtotal: 48 },
    { nomeSnapshot: "Coca-Cola 2L", quantidade: 1, subtotal: 12 },
  ],
  eventos: [],
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
  large: "[--rvl-card-scale:1] [--rvl-font-scale:1.08] [--rvl-space-scale:0.9]",
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

function formatDate(value?: string) {
  if (!value) return "Sem registro";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(new Date(value));
}

function formatBRL(value?: number) {
  if (value === undefined) return "R$ 0,00";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function safeJsonItems(snapshot?: string): Array<{ nome?: string; quantidade?: number }> {
  if (!snapshot) return [];
  try {
    const parsed = JSON.parse(snapshot) as { itens?: Array<{ nome?: string; quantidade?: number }> };
    return Array.isArray(parsed.itens) ? parsed.itens : [];
  } catch {
    return [];
  }
}

function buildCustomerMemorySummary({
  conversation,
  customerConversations,
  customerSessions,
  pedidoDetalhe,
}: {
  conversation: WhatsAppConversation;
  customerConversations: WhatsAppConversation[] | undefined;
  customerSessions: SessaoCatalogoResumo[] | undefined;
  pedidoDetalhe: PedidoDetalheResumo | undefined;
}): CustomerMemorySummary {
  const conversationCount = customerConversations?.length ?? 0;
  const sessionCount = customerSessions?.length ?? 0;
  const recurrence =
    conversationCount > 1 || sessionCount > 1
      ? `${Math.max(conversationCount, sessionCount)} contatos`
      : conversation.clienteId
        ? "Cliente conhecido"
        : "Primeiro contato";
  const lastPurchase = pedidoDetalhe?.pedido?.dataAbertura
    ? formatDate(pedidoDetalhe.pedido.dataAbertura)
    : conversation.pedidoId
      ? "Pedido vinculado"
      : "Sem compra vinculada";
  const preference = pedidoDetalhe?.itens?.[0]?.nomeSnapshot
    ? pedidoDetalhe.itens[0].nomeSnapshot
    : sessionCount > 0
      ? "CardÃ¡pio digital"
      : "A confirmar";
  const account = conversation.pedidoId && pedidoDetalhe?.pedido?.status !== "entregue" ? "Pendente" : "OK";

  return {
    recurrence,
    lastPurchase,
    preference,
    account,
  };
}

function customerLabel(conversation: WhatsAppConversation) {
  return conversation.clienteNomeSnapshot?.trim() || conversation.clienteTelefoneSnapshot;
}

function channelLabel(conversation: WhatsAppConversation) {
  return conversation.telefoneNormalizado ? "WhatsApp" : "Canal digital";
}

function channelVisual(conversation: WhatsAppConversation) {
  const label = channelLabel(conversation).toLowerCase();
  if (label.includes("instagram")) return channelVisuals.instagram;
  if (label.includes("telefone")) return channelVisuals.telefone;
  if (label.includes("site")) return channelVisuals.site;
  if (label.includes("catalog")) return channelVisuals.catalogo;
  return channelVisuals.whatsapp;
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
    return ["Atendimento", "Venda BalcÃ£o", "Caixa", "Delivery", "ProduÃ§Ã£o", "GerÃªncia"];
  }
  if (role === "caixa") return ["Caixa", "Venda BalcÃ£o"];
  if (role === "atendente") return ["Atendimento", "Venda BalcÃ£o"];
  if (role === "producao") return ["ProduÃ§Ã£o"];
  if (role === "delivery") return ["Delivery"];
  if (role === "estoque") return ["Estoque"];
  if (role === "financeiro") return ["Financeiro"];
  return ["Atendimento"];
}

function getInitialOperationalMode(role: string) {
  const modes = getAuthorizedOperationalModes(role);
  return modes.includes("Atendimento") ? "Atendimento" : modes[0];
}

function getConversationNextAction(conversation: WhatsAppConversation, hasCatalogCart = false) {
  if (!conversation.operadorResponsavelId) {
    return {
      icon: UserCheck,
      title: "Assumir conversa",
      description: "Defina um responsÃ¡vel para conduzir esta jornada.",
      kind: "assume" as const,
    };
  }

  if (hasCatalogCart && !conversation.pedidoId) {
    return {
      icon: CheckCircle2,
      title: "Confirmar pedido",
      description: "Revise o carrinho assistido e confirme a criaÃ§Ã£o do pedido.",
      kind: "confirm_order" as const,
    };
  }

  if (conversation.naoLidas > 0) {
    return {
      icon: MessageCircle,
      title: "Responder cliente",
      description: "HÃ¡ mensagem nova aguardando retorno do atendimento.",
      kind: "reply" as const,
    };
  }

  if (conversation.pedidoId) {
    return {
      icon: CheckCircle2,
      title: "Acompanhar pedido",
      description: "A conversa jÃ¡ virou pedido. O prÃ³ximo passo Ã© acompanhar o fluxo operacional.",
      kind: "track" as const,
    };
  }

  return {
    icon: BookOpen,
    title: "Enviar cardÃ¡pio",
    description: "A jornada estÃ¡ pronta para receber intenÃ§Ã£o de compra.",
    kind: "catalog" as const,
  };
}

function getJourneySortDate(journey: JourneyItem) {
  if (journey.kind === "transfer") return journey.transfer.criadaEm;
  return journey.conversation.ultimaMensagemEm ?? journey.conversation.dataAtualizacao;
}

function isHumanConversation(conversation: WhatsAppConversation) {
  return (
    conversation.status === "em_atendimento" ||
    conversation.status === "aguardando_cliente" ||
    conversation.status === "convertida_pedido" ||
    Boolean(conversation.operadorResponsavelId) ||
    Boolean(conversation.pedidoId)
  );
}

function buildJourneyItems(
  conversations: WhatsAppConversation[] | undefined,
  transfers: TransferenciaTrabalho[] | undefined,
  sessions: SessaoCatalogoResumo[] | undefined,
  filter: FilterId,
): JourneyItem[] {
  const conversationsWithCart = new Set(
    sessions
      ?.filter((session) => session.ajudaSolicitada || (session.quantidadeItens ?? 0) > 0)
      .map((session) => session.conversaWhatsAppId)
      .filter(Boolean),
  );

  const conversationItems =
    conversations
      ?.filter((conversation) => {
        if (filter === "todas") return true;
        if (filter === "ia") return conversation.status === "nova";
        if (filter === "humano") return isHumanConversation(conversation);
        if (filter === "carrinhos") {
          return conversationsWithCart.has(conversation._id);
        }
        return false;
      })
      .map((conversation) => ({
        kind: "conversation" as const,
        id: conversation._id,
        conversation,
      })) ?? [];

  const transferItems =
    filter === "transferencias" || filter === "todas"
      ? transfers
        ?.filter((transfer) => ["pendente", "aguardando_aceite"].includes(transfer.status))
        .map((transfer) => ({
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
    <section className="shrink-0 rounded-2xl bg-white p-1.5 text-[#685c20] dark:bg-[#151513] dark:text-[#f3c4a2] sm:p-2">
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
                  ? "bg-[#685c20] text-[#fff4e8] dark:bg-[#f3c4a2] dark:text-[#685c20]"
                  : "text-current hover:bg-[#1f1f1a]/6 dark:hover:bg-[#f7f2ec]/8",
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

function ContextualMenuPopover({
  activeTab,
  onAction,
  onClose,
}: {
  activeTab: AtendimentoTab;
  onAction: (label: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed right-3 top-14 z-40 w-64 rounded-2xl bg-[#685c20] p-2 text-[#fff4e8] dark:bg-[#f3c4a2] dark:text-[#685c20]">
      <div className="mb-1 flex items-center justify-between px-2 py-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-current/62">
          {activeTab === "conversas" ? "Conversas" : activeTab === "pedidos" ? "Pedidos" : activeTab === "clientes" ? "Clientes" : "Agenda"}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer rounded-full p-1 text-current/70 hover:text-current"
          aria-label="Fechar menu contextual"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-1">
        {contextualMenu[activeTab].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              onAction(item);
              onClose();
            }}
            className="flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium text-current/84 hover:bg-white/8 dark:hover:bg-[#685c20]/8"
          >
            {item}
            <ChevronRight className="h-3.5 w-3.5 text-current/42" />
          </button>
        ))}
      </div>
    </div>
  );
}

function ReportsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  const filters = ["PerÃ­odo", "Atividade", "Atendente", "Canal", "Status", "Repasses"];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/16 px-3 py-3 sm:items-center">
      <section className="w-full max-w-sm rounded-3xl bg-[#685c20] p-4 text-[#fff4e8] dark:bg-[#f3c4a2] dark:text-[#685c20]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-current/58">
              Conversas
            </p>
            <h2 className="text-base font-semibold">RelatÃ³rios</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full p-1.5 text-current/70 hover:text-current"
            aria-label="Fechar relatÃ³rios"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-1">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => toast.info(`${filter} serÃ¡ configurado na prÃ³xima etapa`)}
              className="flex w-full cursor-pointer items-center justify-between rounded-2xl px-3 py-2 text-left text-xs font-medium text-current/82 hover:bg-white/8 dark:hover:bg-[#685c20]/8"
            >
              <span className="inline-flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-current/58" />
                {filter}
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-current/42" />
            </button>
          ))}
        </div>

        <p className="mt-3 text-[11px] leading-relaxed text-current/58">
          Estrutura visual preparada. RelatÃ³rios avanÃ§ados entram quando houver backend dedicado.
        </p>
      </section>
    </div>
  );
}

function CatalogConfirmPanel({
  customerName,
  onCancel,
  onConfirm,
}: {
  customerName: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!customerName) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/16 px-3 py-3 sm:items-center">
      <section className="w-full max-w-xs rounded-3xl bg-[#685c20] p-4 text-[#fff4e8] dark:bg-[#f3c4a2] dark:text-[#685c20]">
        <p className="text-sm font-semibold">Enviar cardÃ¡pio para {customerName}?</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer rounded-2xl bg-white/8 px-3 py-2 text-xs font-medium dark:bg-[#685c20]/8"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="cursor-pointer rounded-2xl bg-[#f04a2a] px-3 py-2 text-xs font-semibold text-white"
          >
            Enviar
          </button>
        </div>
      </section>
    </div>
  );
}

function TransferPanel({
  customerName,
  onClose,
}: {
  customerName: string | null;
  onClose: () => void;
}) {
  if (!customerName) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/16 px-3 py-3 sm:items-center">
      <section className="w-full max-w-sm rounded-3xl bg-[#685c20] p-4 text-[#fff4e8] dark:bg-[#f3c4a2] dark:text-[#685c20]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-current/58">Encaminhar</p>
            <h2 className="text-base font-semibold">{customerName}</h2>
          </div>
          <button type="button" onClick={onClose} className="cursor-pointer rounded-full p-1.5 text-current/70 hover:text-current" aria-label="Fechar repasse">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4 space-y-1">
          {[
            ["Destino", "Caixa"],
            ["Motivo", "Pagamento do pedido"],
            ["AÃ§Ã£o esperada", "Confirmar recebimento"],
          ].map(([label, value]) => (
            <button
              key={label}
              type="button"
              className="flex w-full cursor-pointer items-center justify-between rounded-2xl px-3 py-2 text-left text-xs font-medium hover:bg-white/8 dark:hover:bg-[#685c20]/8"
            >
              <span className="text-current/62">{label}</span>
              <span>{value}</span>
            </button>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button type="button" onClick={onClose} className="cursor-pointer rounded-2xl bg-white/8 px-3 py-2 text-xs font-medium dark:bg-[#685c20]/8">
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              toast.success("Encaminhamento preparado");
              onClose();
            }}
            className="cursor-pointer rounded-2xl bg-[#f04a2a] px-3 py-2 text-xs font-semibold text-white"
          >
            Confirmar
          </button>
        </div>
      </section>
    </div>
  );
}

function CartPanel({
  cart,
  onClose,
}: {
  cart: CartPanelState;
  onClose: () => void;
}) {
  if (!cart) return null;
  const items = safeJsonItems(cart.session.itensSnapshot);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/16 px-3 py-3 sm:items-center">
      <section className="w-full max-w-sm rounded-3xl bg-[#685c20] p-4 text-[#fff4e8] dark:bg-[#f3c4a2] dark:text-[#685c20]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-current/58">Carrinho</p>
            <h2 className="text-base font-semibold">{cart.customerName}</h2>
          </div>
          <button type="button" onClick={onClose} className="cursor-pointer rounded-full p-1.5 text-current/70 hover:text-current" aria-label="Fechar carrinho">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4 space-y-2">
          {(items.length > 0 ? items : [{ nome: "Itens do carrinho", quantidade: cart.session.quantidadeItens }]).map((item, index) => (
            <div key={`${item.nome}-${index}`} className="flex items-center justify-between rounded-2xl bg-white/7 px-3 py-2 text-xs dark:bg-[#1f1f1a]/7">
              <span>{item.nome ?? "Produto"}</span>
              <span className="font-semibold">{item.quantidade ?? 1}x</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between text-sm font-semibold">
          <span>Total estimado</span>
          <span>{formatBRL(cart.session.valorEstimado)}</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button type="button" onClick={() => toast.info("EdiÃ§Ã£o do carrinho serÃ¡ conectada na prÃ³xima etapa")} className="cursor-pointer rounded-2xl bg-white/8 px-3 py-2 text-xs font-medium dark:bg-[#685c20]/8">
            Editar
          </button>
          <button type="button" onClick={() => toast.info("Pedido deve ser confirmado explicitamente")} className="cursor-pointer rounded-2xl bg-[#f04a2a] px-3 py-2 text-xs font-semibold text-white">
            Confirmar pedido
          </button>
        </div>
      </section>
    </div>
  );
}

function ConversationFilters({
  counts,
  tones,
  activeFilter,
  onFilterChange,
}: {
  counts: Record<FilterId, number>;
  tones: Record<FilterId, SignalTone>;
  activeFilter: FilterId;
  onFilterChange: (filter: FilterId) => void;
}) {
  const [pulsing, setPulsing] = useState<Partial<Record<FilterId, boolean>>>({});
  const previousCountsRef = useRef(counts);

  useEffect(() => {
    const changed = conversationFilterOrder.filter((item) => item !== "ia" && counts[item] > (previousCountsRef.current[item] ?? 0));
    previousCountsRef.current = counts;
    if (changed.length === 0) return;
    setPulsing((current) => {
      const next = { ...current };
      changed.forEach((item) => {
        next[item] = true;
      });
      return next;
    });
    const id = window.setTimeout(() => {
      setPulsing((current) => {
        const next = { ...current };
        changed.forEach((item) => {
          delete next[item];
        });
        return next;
      });
    }, 850);
    return () => window.clearTimeout(id);
  }, [counts]);

  const renderFilterButton = (item: FilterId) => {
    const active = activeFilter === item;
    const count = counts[item];
    const Icon = filterIcons[item];
    const hasSignal = item !== "todas" && item !== "ia" && count > 0;
    const signalClass = item === "ia" ? "text-current/70" : hasSignal ? signalToneTextClasses[tones[item]] : signalToneTextClasses.neutral;
    const activeNeutral = active && item === "todas";

    return (
      <button
        key={item}
        type="button"
        onClick={() => onFilterChange(item)}
        className={cn(
          "relative flex min-w-fit cursor-pointer flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 py-1 text-center transition-colors",
          activeNeutral
            ? "bg-transparent text-current/62"
            : active
              ? "bg-[#1f1f1a]/7 text-current dark:bg-[#24241f]"
              : item === "ia"
                ? "text-current/70 hover:bg-[#1f1f1a]/5 hover:text-current/82 dark:hover:bg-[#24241f]"
                : "text-current/62 hover:bg-[#1f1f1a]/5 hover:text-current/82 dark:hover:bg-[#24241f]",
        )}
        title={filterLabels[item]}
      >
        <span className={cn("flex min-w-0 items-center justify-center gap-1", signalClass, pulsing[item] && "animate-pulse")}>
          <Icon className="h-[1.05rem] w-[1.05rem] shrink-0 stroke-[1.45]" />
          {count > 0 && (
            <span className="text-[10px] font-semibold leading-none tabular-nums text-current/90">
              {count > 99 ? "99+" : count}
            </span>
          )}
        </span>
        <span className="block whitespace-nowrap text-[9.5px] font-light leading-none tracking-[0.01em] text-current/72">
          {filterLabels[item]}
        </span>
      </button>
    );
  };

  return (
    <div className="relative shrink-0 px-0 py-1.5">
      <div className="relative flex items-center justify-between">
        {conversationFilterOrder.map((item) => renderFilterButton(item))}
      </div>
    </div>
  );
}

function conversationSubtitle(journey: JourneyItem) {
  if (journey.kind === "transfer") return "Repasse";
  const conversation = journey.conversation;
  if (conversation.prioridade === "critical") return `${channelLabel(conversation)} Â· Ajuda crÃ­tica`;
  if (conversation.prioridade === "important") return `${channelLabel(conversation)} Â· Ajuda`;
  if (conversation.status === "aguardando_cliente") return `${channelLabel(conversation)} Â· Espera`;
  if (conversation.status === "convertida_pedido") return `${channelLabel(conversation)} Â· Pedido`;
  return `${channelLabel(conversation)} Â· ${statusLabels[conversation.status]}`;
}

function conversationPreview(journey: JourneyItem) {
  if (journey.kind === "transfer") return journey.transfer.acaoEsperada || journey.transfer.motivo;
  return journey.conversation.ultimoTextoSnapshot ?? "Atendimento aberto.";
}

function ConversationListPanel({
  journeys,
  sessions,
  activeFilter,
  onOpen,
  onSendCatalog,
  onTransfer,
  onOpenCart,
}: {
  journeys: JourneyItem[];
  sessions: SessaoCatalogoResumo[] | undefined;
  activeFilter: FilterId;
  onOpen: (journey: JourneyItem) => void;
  onSendCatalog: (journey: JourneyItem) => void;
  onTransfer: (journey: JourneyItem) => void;
  onOpenCart: (journey: JourneyItem) => void;
}) {
  const [openChatId, setOpenChatId] = useState<string | null>(null);
  const [openAuxId, setOpenAuxId] = useState<string | null>(null);
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(null);

  if (journeys.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col justify-center px-3 text-center">
        <p className="text-sm font-semibold text-current/78">Nenhuma conversa agora.</p>
        <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-current/52">
          Quando um cliente chamar, a conversa aparecerÃ¡ aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-1 min-h-0 flex-1 overflow-y-auto px-1" data-rvl-scroll>
      {journeys.map((journey, index) => {
        const isTransfer = journey.kind === "transfer";
        const title = isTransfer ? "Repasse" : customerLabel(journey.conversation);
        const priority = isTransfer ? journey.transfer.prioridade : journey.conversation.prioridade;
        const time = getJourneySortDate(journey);
        const totalTime = isTransfer ? journey.transfer.criadaEm : journey.conversation.dataCriacao;
        const unreadCount = !isTransfer ? journey.conversation.naoLidas ?? 0 : 0;
        const origin = !isTransfer ? channelVisual(journey.conversation) : null;
        const OriginIcon = origin?.icon ?? Shuffle;
        const transferGroup =
          activeFilter === "transferencias" && isTransfer
            ? journey.transfer.dePerfil.toLowerCase() === "atendimento"
              ? "Enviadas"
              : "Recebidas"
            : null;
        const previousJourney = journeys[index - 1];
        const previousGroup =
          activeFilter === "transferencias" && previousJourney?.kind === "transfer"
            ? previousJourney.transfer.dePerfil.toLowerCase() === "atendimento"
              ? "Enviadas"
              : "Recebidas"
            : null;
        const showGroup = Boolean(transferGroup && transferGroup !== previousGroup);
        const session = !isTransfer ? sessions?.find((item) => item.conversaWhatsAppId === journey.conversation._id) : undefined;
        const fallbackSession = !isTransfer && journey.conversation._id === DEMO_CONVERSA_ID ? sessions?.[0] : undefined;
        const activeSession = session ?? fallbackSession;
        const hasCart = Boolean(activeSession && (activeSession.quantidadeItens ?? 0) > 0);
        const openChat = openChatId === String(journey.id);
        const preview = conversationPreview(journey);
        const canExpandPreview = preview.length > 64;
        const previewExpanded = expandedMessageId === String(journey.id);

        return (
          <Fragment key={`${journey.kind}-${journey.id}`}>
          {showGroup && (
            <p className={cn(
              "px-1 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.08em]",
              transferGroup === "Recebidas" ? "text-amber-700 dark:text-amber-300" : "text-amber-700 dark:text-amber-300",
            )}>
              {transferGroup}
            </p>
          )}
          <div
            className="grid grid-cols-[2.25rem_minmax(0,1fr)] items-start gap-2.5 border-b border-[#1f1f1a]/10 py-3 last:border-b-0 dark:border-[#f7f2ec]/10"
          >
            <span className={cn("relative mt-0.5 flex h-9 w-9 items-center justify-center rounded-full border bg-[#685c20]/8 text-current/72 dark:bg-[#24241f]", priorityBorderClasses[priority])}>
              <OriginIcon className={cn("h-[1.05rem] w-[1.05rem] stroke-[1.8]", isTransfer ? "text-current/68" : origin?.className)} />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[8px] font-bold leading-none text-white">
                  {unreadCount}
                </span>
              )}
            </span>
            <div className="relative min-w-0">
              <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpen(journey)}
                  className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left"
                >
                  <span className="truncate text-sm font-semibold leading-tight">{title}</span>
                </button>
                <span className="flex min-w-[6.8rem] shrink-0 items-center justify-end gap-1 text-[10px] tabular-nums text-current/58">
                  <Clock className="h-3 w-3" />
                  <span>{formatElapsed(time)}</span>
                  <span className="text-current/28">Â·</span>
                  <Hourglass className="h-3 w-3" />
                  <span>{formatElapsed(totalTime)}</span>
                  {!isTransfer && (
                    <button
                      type="button"
                      onClick={() => onTransfer(journey)}
                      className="cursor-pointer rounded-full p-1 text-current/62 hover:bg-[#1f1f1a]/7 hover:text-current dark:hover:bg-[#f3c4a2]/9"
                      aria-label="Encaminhar"
                    >
                      <Shuffle className="h-3.5 w-3.5" />
                    </button>
                  )}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (canExpandPreview) {
                    setExpandedMessageId((value) => (value === String(journey.id) ? null : String(journey.id)));
                    return;
                  }
                  onOpen(journey);
                }}
                className="mt-1 flex w-full cursor-pointer items-start gap-2 text-left text-xs leading-snug text-current/74"
              >
                <span className={cn("min-w-0 flex-1", !previewExpanded && "truncate")}>{preview}</span>
                {canExpandPreview && (
                  <span className="shrink-0 text-current/56">
                    {previewExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </span>
                )}
              </button>
              {!isTransfer && openChat && (
                <div className="mt-2 flex min-w-0 items-end gap-1.5 rounded-2xl bg-[#e8e7df] px-2 py-1 dark:bg-[#24241f] dark:ring-1 dark:ring-[#f7f2ec]/6">
                  <button
                    type="button"
                    onClick={() => setOpenAuxId((value) => (value === String(journey.id) ? null : String(journey.id)))}
                    className="mb-0.5 cursor-pointer rounded-full p-1 text-current/66 hover:text-current"
                    aria-label="Mais aÃ§Ãµes"
                  >
                    +
                  </button>
                  <textarea
                    aria-label="Responder cliente"
                    placeholder="Mensagem"
                    rows={1}
                    onInput={(event) => {
                      const field = event.currentTarget;
                      field.style.height = "auto";
                      field.style.height = `${Math.min(field.scrollHeight, 72)}px`;
                    }}
                    className="max-h-[4.5rem] min-h-[1.5rem] min-w-0 flex-1 resize-none bg-transparent py-1 text-xs leading-5 text-current placeholder:text-current/50 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => onSendCatalog(journey)}
                    className="mb-0.5 cursor-pointer rounded-full p-1 text-current/66 hover:text-current"
                    aria-label="Enviar cardÃ¡pio"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenChatId(null);
                      setOpenAuxId(null);
                    }}
                    className="mb-0.5 cursor-pointer rounded-full p-1 text-current/44 hover:text-current"
                    aria-label="Recolher chat"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              {!isTransfer && openChat && openAuxId === String(journey.id) && (
                <div className="absolute left-0 top-full z-20 mt-1 grid w-56 grid-cols-2 gap-1 rounded-2xl bg-[#685c20] p-2 text-[#fff4e8] dark:bg-[#f3c4a2] dark:text-[#685c20]">
                  {["Mensagens rÃ¡pidas", "MÃ­dia", "CÃ¢mera", "Documento", "Ãudio", "Contato", "Produtos"].map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => toast.info(`${label} - em breve`)}
                      className="cursor-pointer rounded-xl px-2 py-1.5 text-left text-[10px] font-medium hover:bg-white/10 dark:hover:bg-[#685c20]/8"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
              {!isTransfer && !openChat && (
                <div className="mt-2 flex min-w-0 items-center gap-1.5 rounded-full bg-[#e8e7df] px-2 py-1 dark:bg-[#24241f] dark:ring-1 dark:ring-[#f7f2ec]/6">
                  {hasCart && activeSession && (
                    <button
                      type="button"
                      onClick={() => onOpenCart(journey)}
                      className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full px-1.5 py-1 text-[10px] font-medium text-current/70 hover:text-current"
                      aria-label="Ver carrinho"
                    >
                      <Package className="h-3.5 w-3.5" />
                      <span>{activeSession.quantidadeItens ?? 0}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setOpenChatId(String(journey.id));
                      setOpenAuxId(String(journey.id));
                    }}
                    className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full px-1.5 py-1 text-sm font-medium leading-none text-current/66 hover:text-current"
                    aria-label="Mais aÃ§Ãµes"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpenChatId(String(journey.id))}
                    className="min-w-0 flex-1 cursor-text truncate text-left text-xs text-current/58"
                    aria-label="Abrir mensagem"
                  >
                    Mensagem...
                  </button>
                  <button
                    type="button"
                    onClick={() => onSendCatalog(journey)}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-full px-1.5 py-1 text-current/66 hover:text-current"
                    aria-label="Enviar cardÃ¡pio"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    <span className="hidden text-[10px] font-medium min-[380px]:inline">CardÃ¡pio</span>
                  </button>
                </div>
              )}
            </div>
          </div>
          </Fragment>
        );
      })}
    </div>
  );
}

function ConversationDetailScreen({
  journey,
  sessions,
  messages,
  onBack,
  onStartOrder,
}: {
  journey: JourneyItem;
  sessions: SessaoCatalogoResumo[] | undefined;
  messages: WhatsAppMessage[] | undefined;
  onBack: () => void;
  onStartOrder: () => void;
}) {
  const isTransfer = journey.kind === "transfer";
  const conversation = journey.kind === "conversation" ? journey.conversation : null;
  const session = sessions?.[0];
  const hasCart = Boolean(session && (session.quantidadeItens ?? 0) > 0);
  const action = conversation ? getConversationNextAction(conversation, hasCart) : null;

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center gap-2 border-b border-[#1f1f1a]/10 px-1 py-2 dark:border-[#f7f2ec]/10">
        <button
          type="button"
          onClick={onBack}
          className="cursor-pointer rounded-full p-2 text-current/68 hover:bg-[#1f1f1a]/7 dark:hover:bg-[#f3c4a2]/9"
          aria-label="Voltar para conversas"
        >
          <ArrowLeft className="h-5 w-5 stroke-[1.8]" />
        </button>
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold">{isTransfer ? "Repasse" : customerLabel(conversation!)}</h2>
          <p className="truncate text-xs text-current/56">{isTransfer ? journey.transfer.paraPerfil : conversationSubtitle(journey)}</p>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-1 py-3">
        {isTransfer ? (
          <div className="space-y-2 text-sm">
            <p className="font-medium">{journey.transfer.motivo}</p>
            <p className="text-current/64">{journey.transfer.contexto}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-current/44">Cliente</p>
              <p className="text-sm font-semibold">{customerLabel(conversation!)}</p>
            </div>
            {session && (
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-current/44">Carrinho</p>
                <p className="text-sm">{session.quantidadeItens ?? 0} itens Â· {formatBRL(session.valorEstimado)}</p>
              </div>
            )}
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-current/44">HistÃ³rico</p>
              <div className="mt-1 space-y-2">
                {(messages ?? []).slice(-4).map((message) => (
                  <p key={message._id} className="rounded-2xl bg-[#1f1f1a]/7 px-3 py-2 text-xs dark:bg-[#f7f2ec]/9">
                    {message.texto ?? "Mensagem sem texto"}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {action && (
        <div className="shrink-0 px-1 pb-2">
          <button
            type="button"
            onClick={onStartOrder}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#f04a2a] px-4 py-3 text-sm font-semibold text-white"
          >
            <action.icon className="h-4 w-4" />
            {action.title}
          </button>
        </div>
      )}
    </section>
  );
}

function PlaceholderTab({ title, description }: { title: string; description: string }) {
  return (
    <section className="flex min-h-0 flex-1 flex-col justify-center px-4 text-center">
      <p className="text-sm font-semibold text-current/78">{title}</p>
      <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-current/52">{description}</p>
    </section>
  );
}

function AtendimentoContextShortcuts({
  activeTab,
  activeFilter,
  allCount,
  onChange,
  onFilterChange,
}: {
  activeTab: AtendimentoTab;
  activeFilter: FilterId;
  allCount: number;
  onChange: (tab: AtendimentoTab) => void;
  onFilterChange: (filter: FilterId) => void;
}) {
  const items: Array<{ id?: AtendimentoTab; filter?: FilterId; label: string; icon: LucideIcon; count?: number }> = [
    { id: "pedidos", label: "Pedidos", icon: ReceiptText },
    { id: "clientes", label: "Clientes", icon: Users },
    { filter: "todas", label: "Todas", icon: Inbox, count: allCount },
  ];

  return (
    <nav className="flex w-full shrink-0 items-center justify-center gap-2 px-1 pb-1.5 pt-0.5 text-[10.5px] text-current/64">
      {items.map((item) => {
        const active = Boolean(item.id && activeTab === item.id);
        const filterActive = Boolean(item.filter && activeFilter === item.filter);
        const Icon = item.icon;
        return (
          <button
            key={item.id ?? item.label}
            type="button"
            onClick={() => item.id ? onChange(item.id) : item.filter ? onFilterChange(item.filter) : undefined}
            className={cn(
              "inline-flex min-w-0 cursor-pointer items-center justify-center gap-1 rounded-full px-0.5 py-0.5 text-[10.5px] font-light tracking-[0.015em] transition-colors",
              active || filterActive
                ? "text-current"
                : "text-current/70 hover:text-current",
            )}
          >
            <span className={cn("relative inline-flex h-4 w-4 shrink-0 items-center justify-center", item.count && "mr-1.5")}>
              <Icon className="h-[0.9rem] w-[0.9rem] shrink-0 stroke-[1.45]" />
              {item.count ? (
                <span className="absolute -right-1.5 -top-1.5 flex h-3 min-w-3 items-center justify-center rounded-full bg-current/10 px-0.5 text-[7px] font-bold leading-none tabular-nums text-current/72">
                  {item.count > 9 ? "9+" : item.count}
                </span>
              ) : null}
            </span>
            <span className="truncate">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function AtendimentoDock({
  pendingCount,
  hiddenSignalCount,
  hiddenSignalTone,
  onAction,
}: {
  pendingCount: number;
  hiddenSignalCount: number;
  hiddenSignalTone: SignalTone;
  onAction: (label: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const fixedItems: Array<{ label: string; icon: LucideIcon; active?: boolean; badge?: number }> = [
    { label: "Venda", icon: ReceiptText },
    { label: "Atendimento", icon: MessageCircle, active: true, badge: pendingCount },
    { label: "Produção", icon: ChefHat },
    { label: "Gestão", icon: BarChart3 },
    { label: "Delivery", icon: Bike },
  ];
  const extraItems: Array<{ label: string; icon: LucideIcon }> = [
    { label: "Caixa", icon: Banknote },
    { label: "Estoque", icon: Package },
    { label: "Usuários", icon: Users },
    { label: "Ajustes", icon: Settings },
  ];

  return (
    <footer className="shrink-0 border-t border-[#1f1f1a]/8 bg-[#f1f0ea]/96 px-1 pb-[calc(0.45rem+env(safe-area-inset-bottom))] pt-0.5 text-[#1f1f1a] dark:border-[#f7f2ec]/10 dark:bg-[#181816] dark:text-[#f7f2ec]">
      {expanded && (
        <div className="py-1">
          <div className="grid w-full grid-cols-5 gap-x-0">
            {extraItems.map((item, index) => (
              <DockButton key={item.label} item={item} slot={index + 1} onClick={() => onAction(item.label)} />
            ))}
            <div className="flex min-w-0 items-center justify-center">
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="flex h-7 w-7 cursor-pointer items-center justify-center bg-transparent text-[#685c20]/82 transition-colors hover:text-[#685c20] dark:text-[#f7f2ec]/88 dark:hover:text-white"
                aria-label="Recolher módulos"
              >
                <ChevronDown className="h-3.5 w-3.5 stroke-[1.6]" />
              </button>
            </div>
          </div>
        </div>
      )}
      {!expanded && (
        <div className="grid h-3 grid-cols-5 gap-x-0">
          <span className="col-span-4" aria-hidden="true" />
          <div className="flex min-w-0 items-center justify-center">
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className={cn(
                "flex h-3 w-7 cursor-pointer items-center justify-center bg-transparent text-[#685c20]/82 transition-colors hover:text-[#685c20] dark:text-[#f7f2ec]/88 dark:hover:text-white",
                !expanded && hiddenSignalCount > 0 && signalToneTextClasses[hiddenSignalTone],
              )}
              aria-label="Mostrar módulos"
            >
              <ChevronUp className="h-3.5 w-3.5 stroke-[1.6]" />
            </button>
          </div>
        </div>
      )}
      <nav className="relative py-1">
        <div className="grid grid-cols-5 gap-x-0">
          {fixedItems.map((item, index) => (
            <DockButton key={item.label} item={item} slot={index + 1} onClick={() => onAction(item.label)} />
          ))}
        </div>
      </nav>
    </footer>
  );
}

function DockButton({
  item,
  onClick,
  slot,
}: {
  item: { label: string; icon: LucideIcon; active?: boolean; badge?: number };
  onClick: () => void;
  slot?: number;
}) {
  const Icon = item.icon;
  const opticalShift =
    slot === 1
      ? "translate-x-[-14.8px]"
      : slot === 2
        ? "translate-x-[-6.5px]"
        : slot === 3
          ? "translate-x-[8px]"
          : slot === 4 || slot === 5
            ? "translate-x-[11px]"
            : "";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex min-w-0 cursor-pointer flex-col items-center justify-center px-0 py-0.5 transition-colors active:scale-[0.98]",
        item.active ? "text-current" : "text-current/62 hover:text-current",
      )}
    >
      <span
        className={cn(
          "flex min-w-[2.8rem] flex-col items-center gap-1 rounded-2xl px-2 py-1.5 text-center transition-colors",
          opticalShift,
          item.active
            ? "bg-[#685c20]/10 shadow-none dark:bg-[#24241f]"
            : "hover:bg-[#1f1f1a]/4 dark:hover:bg-[#f7f2ec]/5",
        )}
      >
        <span className="relative">
          <Icon className="h-[calc(1.15rem*var(--rvl-font-scale,1))] w-[calc(1.15rem*var(--rvl-font-scale,1))] stroke-[1.45]" />
          {item.badge ? (
            <span className="absolute -right-1 -top-1 flex h-3 min-w-3 items-center justify-center rounded-full bg-emerald-500/90 px-0.5 text-[7px] font-bold leading-none text-white">
              {item.badge}
            </span>
          ) : null}
        </span>
        <span className="block w-full max-w-full truncate text-center text-[calc(9.5px*var(--rvl-font-scale,1))] font-light leading-none tracking-[0.005em]">
          {item.label}
        </span>
      </span>
    </button>
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
      <div className="px-2 py-2 text-center text-[#1f1f1a] dark:text-[#f7f2ec] sm:py-4">
        <p className="text-sm font-medium text-current/72">Fila sem jornadas agora.</p>
        <p className="mt-1 text-xs text-current/48">Use ComunicaÃ§Ã£o Agora para alternar os filtros.</p>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
      {journeys.map((journey) => {
        const isSelected = selected?.kind === journey.kind && selected.id === journey.id;
        const isTransfer = journey.kind === "transfer";
        const title = isTransfer ? "Repasse recebido" : customerLabel(journey.conversation);
        const channel = isTransfer ? journey.transfer.dePerfil : channelLabel(journey.conversation);
        const state = isTransfer ? "Trabalho transferido" : statusLabels[journey.conversation.status];
        const priority = isTransfer ? journey.transfer.prioridade : journey.conversation.prioridade;
        const responsible = isTransfer
          ? `Para ${journey.transfer.paraPerfil}`
          : journey.conversation.operadorResponsavelNomeSnapshot ?? "Sem responsÃ¡vel";
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
                ? "bg-[#685c20] text-[#fff4e8] dark:bg-[#f3c4a2] dark:text-[#685c20]"
                : "bg-white text-[#685c20] hover:bg-white/80 dark:bg-[#151513] dark:text-[#f3c4a2] dark:hover:bg-[#756c2c]/82",
            )}
          >
            <div className="flex items-start gap-2.5">
              <span className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", priorityClasses[priority])} />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold leading-tight">{title}</p>
                    <p className="mt-0.5 truncate text-[10.5px] text-current/60">
                      {channel} Â· {state}
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

function CustomerMemoryPreview({
  summary,
  onOpen,
}: {
  summary: CustomerMemorySummary;
  onOpen: () => void;
}) {
  return (
    <div className="rounded-2xl bg-[#1f1f1a]/7 px-2 py-2 dark:bg-[#f7f2ec]/8">
      <div className="mb-1.5 flex items-center justify-between gap-1">
        <p className="truncate text-[9px] font-semibold uppercase tracking-[0.05em] text-current/70">
          MemÃ³ria do Cliente
        </p>
        <button
          type="button"
          onClick={onOpen}
          className="shrink-0 cursor-pointer text-[9.5px] font-medium text-current/74 underline-offset-4 hover:underline"
        >
          Ver MemÃ³ria
        </button>
      </div>
      <div className="grid grid-cols-2 gap-1.5 text-[9.5px] leading-tight text-current/68">
        <p>
          <span className="block text-current/46">Cliente recorrente</span>
          {summary.recurrence}
        </p>
        <p>
          <span className="block text-current/46">Ãºltima compra</span>
          {summary.lastPurchase}
        </p>
        <p>
          <span className="block text-current/46">PreferÃªncia</span>
          {summary.preference}
        </p>
        <p>
          <span className="block text-current/46">Conta</span>
          {summary.account}
        </p>
      </div>
    </div>
  );
}

function CatalogSessionSummary({
  sessions,
  onContinue,
  onSendCatalog,
  onClaim,
  onConvert,
}: {
  sessions: SessaoCatalogoResumo[] | undefined;
  onContinue: () => void;
  onSendCatalog: () => void;
  onClaim: (session: SessaoCatalogoResumo) => void;
  onConvert: (session: SessaoCatalogoResumo) => void;
}) {
  const session = sessions?.[0];
  const parsedItems = safeJsonItems(session?.itensSnapshot);
  const itemPreview =
    parsedItems.length > 0
      ? parsedItems
          .slice(0, 2)
          .map((item) => `${item.quantidade ?? 1}x ${item.nome ?? "Item"}`)
          .join(", ")
      : `${session?.quantidadeItens ?? 0} itens`;

  return (
    <div className="rounded-2xl bg-[#1f1f1a]/7 px-2 py-2 dark:bg-[#f7f2ec]/8">
      <div className="mb-1.5 flex items-center justify-between gap-1">
        <p className="truncate text-[9px] font-semibold uppercase tracking-[0.05em] text-current/70">
          Carrinho do CardÃ¡pio
        </p>
        {session && (
          <span className="rounded-full bg-[#685c20]/10 px-1.5 py-0.5 text-[8.5px] font-medium text-current/64 dark:bg-[#f3c4a2]/10">
            {session.status}
          </span>
        )}
      </div>
      {sessions === undefined ? (
        <div className="h-8 animate-pulse rounded-xl bg-current/8" />
      ) : session ? (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-1 text-[8.5px] leading-tight text-current/68">
            <p>
              <span className="block text-current/46">Carrinho ativo</span>
              {session.canalOrigem}
            </p>
            <p>
              <span className="block text-current/46">Valor estimado</span>
              {formatBRL(session.valorEstimado)}
            </p>
            <p className="col-span-2">
              <span className="block text-current/46">Carrinho</span>
              <span className="line-clamp-1">{itemPreview}</span>
            </p>
            <p className="col-span-2">
              <span className="block text-current/46">Ãºltima interaÃ§Ã£o</span>
              {formatElapsed(session.ultimaInteracaoEm ?? session.atualizadaEm)}
            </p>
          </div>
          <div className="grid grid-cols-4 gap-0.5 text-[7px] leading-none">
            <button
              type="button"
              onClick={onContinue}
              className="cursor-pointer rounded-full bg-[#685c20]/10 px-1 py-1 font-medium text-current/72 dark:bg-[#f3c4a2]/10"
            >
              Continuar
            </button>
            <button
              type="button"
              onClick={onSendCatalog}
              className="cursor-pointer rounded-full bg-[#685c20]/10 px-1 py-1 font-medium text-current/72 dark:bg-[#f3c4a2]/10"
            >
              Enviar
            </button>
            <button
              type="button"
              onClick={() => onClaim(session)}
              className="cursor-pointer rounded-full bg-[#685c20]/10 px-1 py-1 font-medium text-current/72 dark:bg-[#f3c4a2]/10"
            >
              Avocar
            </button>
            <button
              type="button"
              onClick={() => onConvert(session)}
              className="cursor-pointer rounded-full bg-[#f04a2a] px-1 py-1 font-semibold text-white"
            >
              Converter
            </button>
          </div>
        </div>
      ) : (
        <p className="text-xs text-current/62">Nenhuma sessÃ£o ativa vinculada.</p>
      )}
    </div>
  );
}

type FocusIndicatorId = "promocoes" | "restricoes" | "conta" | "memoria" | "catalogo";

const focusIndicatorLabels: Record<FocusIndicatorId, string> = {
  promocoes: "PromoÃ§Ã£o",
  restricoes: "RestriÃ§Ã£o",
  conta: "Conta",
  memoria: "MemÃ³ria",
  catalogo: "CardÃ¡pio",
};

type FocusIndicatorTone = "info" | "active" | "attention" | "critical";

type FocusIndicator = {
  id: FocusIndicatorId;
  label: string;
  tone: FocusIndicatorTone;
  content: ReactNode;
};

const focusIndicatorToneClasses: Record<FocusIndicatorTone, { dot: string; active: string; idle: string }> = {
  info: {
    dot: "bg-sky-500",
    active: "bg-sky-600 text-white dark:bg-sky-200 dark:text-[#685c20]",
    idle: "bg-sky-500/12 text-sky-900 hover:bg-sky-500/18 dark:bg-sky-200/12 dark:text-[#f3c4a2]",
  },
  active: {
    dot: "bg-emerald-500",
    active: "bg-emerald-700 text-white dark:bg-emerald-200 dark:text-[#685c20]",
    idle: "bg-emerald-500/12 text-emerald-950 hover:bg-emerald-500/18 dark:bg-emerald-200/12 dark:text-[#f3c4a2]",
  },
  attention: {
    dot: "bg-amber-400",
    active: "bg-amber-500 text-[#3d3511] dark:bg-amber-200 dark:text-[#685c20]",
    idle: "bg-amber-400/16 text-amber-950 hover:bg-amber-400/22 dark:bg-amber-200/14 dark:text-[#f3c4a2]",
  },
  critical: {
    dot: "bg-red-600",
    active: "bg-red-700 text-white dark:bg-red-200 dark:text-[#685c20]",
    idle: "bg-red-500/12 text-red-950 hover:bg-red-500/18 dark:bg-red-200/12 dark:text-[#f3c4a2]",
  },
};

function FocusIndicatorButton({
  id,
  label,
  tone,
  active,
  onClick,
}: {
  id: FocusIndicatorId;
  label: string;
  tone: FocusIndicatorTone;
  active: boolean;
  onClick: (id: FocusIndicatorId) => void;
}) {
  const toneClasses = focusIndicatorToneClasses[tone];

  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      className={cn(
        "min-w-0 cursor-pointer rounded-full px-2.5 py-1.5 text-[10px] font-medium transition-colors",
        active ? toneClasses.active : toneClasses.idle,
      )}
    >
      <span className="inline-flex items-center gap-1.5">
        <span className={cn("h-1.5 w-1.5 rounded-full", active ? "bg-current/70" : toneClasses.dot)} />
        {label}
      </span>
    </button>
  );
}

function MemorySection({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-[#f3c4a2]/10 px-3 py-2.5 dark:bg-[#685c20]/8">
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-4 w-4 shrink-0 stroke-[1.8] text-current/82" />
        <h3 className="text-xs font-semibold text-current">{title}</h3>
      </div>
      <div className="text-xs leading-relaxed text-current/70">{children}</div>
    </section>
  );
}

function CustomerMemoryPanel({
  open,
  conversation,
  messages,
  customerConversations,
  customerSessions,
  pedidoDetalhe,
  onClose,
}: {
  open: boolean;
  conversation: WhatsAppConversation | null;
  messages: WhatsAppMessage[] | undefined;
  customerConversations: WhatsAppConversation[] | undefined;
  customerSessions: SessaoCatalogoResumo[] | undefined;
  pedidoDetalhe: PedidoDetalheResumo | undefined;
  onClose: () => void;
}) {
  if (!open || !conversation) return null;

  const recentMessages = messages?.slice(-4).reverse() ?? [];
  const recentSessions = customerSessions?.slice(0, 4) ?? [];
  const linkedOrder = pedidoDetalhe?.pedido;
  const firstItems = pedidoDetalhe?.itens?.slice(0, 3) ?? [];
  const occurrences =
    customerConversations?.filter(
      (item) => item.prioridade === "important" || item.prioridade === "critical",
    ) ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/18 px-3 py-3 sm:items-center">
      <aside className="max-h-[88svh] w-full max-w-xl overflow-hidden rounded-[1.35rem] bg-[#685c20] text-[#fff4e8] shadow-none dark:bg-[#f3c4a2] dark:text-[#685c20]">
        <div className="flex items-start justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-current/58">
              MemÃ³ria do Cliente
            </p>
            <h2 className="truncate text-base font-semibold">{customerLabel(conversation)}</h2>
            <p className="text-xs text-current/62">{channelLabel(conversation)} ? contexto permanente</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full p-1.5 text-current/70 transition-colors hover:text-current"
            aria-label="Fechar memÃ³ria do cliente"
          >
            <X className="h-5 w-5 stroke-[1.8]" />
          </button>
        </div>

        <div className="grid max-h-[calc(88svh-4.5rem)] gap-2 overflow-y-auto px-3 pb-3 sm:grid-cols-2">
          <MemorySection icon={History} title="Timeline">
            {recentMessages.length > 0 ? (
              <div className="space-y-1.5">
                {recentMessages.map((message) => (
                  <p key={message._id} className="line-clamp-2">
                    <span className="font-semibold">
                      {formatTime(message.timestamp)} Â· {message.direcao === "entrada" ? "Cliente" : "Atendimento"}
                    </span>
                    {message.texto ? ` ? ${message.texto}` : " ? Mensagem sem texto"}
                  </p>
                ))}
              </div>
            ) : (
              <p>Sem mensagens carregadas nesta jornada.</p>
            )}
          </MemorySection>

          <MemorySection icon={ReceiptText} title="Pedidos">
            {linkedOrder ? (
              <p>
                Pedido {linkedOrder.numero ? `#${linkedOrder.numero}` : "vinculado"} Â· {linkedOrder.status ?? "status aberto"} Â·{" "}
                {formatBRL(linkedOrder.totalLiquido ?? linkedOrder.totalBruto)}
              </p>
            ) : (
              <p>Sem pedido vinculado nesta jornada.</p>
            )}
          </MemorySection>

          <MemorySection icon={Package} title="Produtos">
            {firstItems.length > 0 ? (
              <div className="space-y-1">
                {firstItems.map((item, index) => (
                  <p key={`${item.nomeSnapshot}-${index}`}>
                    {item.quantidade ?? 1}x {item.nomeSnapshot ?? "Item"} Â· {formatBRL(item.subtotal)}
                  </p>
                ))}
              </div>
            ) : (
              <p>HistÃ³rico consolidado de produtos preparado para etapa futura.</p>
            )}
          </MemorySection>

          <MemorySection icon={Tag} title="PromoÃ§Ãµes">
            <p>Consulta preparada para campanhas e ofertas aplicÃ¡veis ao cliente.</p>
          </MemorySection>

          <MemorySection icon={Banknote} title="Contas">
            <p>{linkedOrder && linkedOrder.status !== "entregue" ? "Conta pendente nesta jornada." : "Sem pendÃªncia financeira visÃ­vel nesta jornada."}</p>
          </MemorySection>

          <MemorySection icon={Heart} title="PreferÃªncias">
            <p>
              {firstItems[0]?.nomeSnapshot
                ? `Ãšltimo item em destaque: ${firstItems[0].nomeSnapshot}.`
                : "PreferÃªncias serÃ£o projetadas a partir de compras e sessÃµes recorrentes."}
            </p>
          </MemorySection>

          <MemorySection icon={CircleHelp} title="OcorrÃªncias">
            {occurrences.length > 0 ? (
              <p>{occurrences.length} atendimento(s) com prioridade importante/crÃ­tica.</p>
            ) : (
              <p>Nenhuma ocorrÃªncia crÃ­tica registrada para este telefone.</p>
            )}
          </MemorySection>

          <MemorySection icon={CalendarDays} title="Encomendas">
            <p>EspaÃ§o preparado para encomendas futuras vinculadas ao cliente.</p>
          </MemorySection>

          <MemorySection icon={BookOpen} title="CardÃ¡pio">
            {recentSessions.length > 0 ? (
              <div className="space-y-1">
                {recentSessions.map((session) => (
                  <p key={session._id}>
                    {session.status} Â· {session.quantidadeItens ?? 0} itens Â· {formatBRL(session.valorEstimado)}
                  </p>
                ))}
              </div>
            ) : (
              <p>Nenhuma sessÃ£o de cardÃ¡pio encontrada para este telefone.</p>
            )}
          </MemorySection>
        </div>
      </aside>
    </div>
  );
}

function FocusedJourney({
  journey,
  sessions,
  customerMemory,
  onOpenMemory,
  onContinueCatalog,
  onSendCatalog,
  onClaimCatalog,
  onConvertCatalog,
}: {
  journey: JourneyItem | null;
  sessions: SessaoCatalogoResumo[] | undefined;
  customerMemory: CustomerMemorySummary | null;
  onOpenMemory: () => void;
  onContinueCatalog: () => void;
  onSendCatalog: () => void;
  onClaimCatalog: (session: SessaoCatalogoResumo) => void;
  onConvertCatalog: (session: SessaoCatalogoResumo) => void;
}) {
  const [openIndicator, setOpenIndicator] = useState<FocusIndicatorId | null>(null);

  if (!journey) {
    return (
      <section className="flex min-h-0 flex-1 flex-col items-center justify-center rounded-2xl bg-white px-6 py-4 text-center text-[#685c20] dark:bg-[#151513] dark:text-[#f3c4a2]">
        <MessageCircle className="mb-2 h-8 w-8 stroke-[1.6] opacity-55 sm:mb-3 sm:h-9 sm:w-9" />
        <p className="text-sm font-semibold">Nenhuma jornada em atendimento.</p>
        <p className="mt-1 max-w-xs text-xs leading-snug text-current/58">
          Assim que uma nova jornada chegar ou vocÃª assumir uma existente, ela aparecerÃ¡ aqui.
        </p>
      </section>
    );
  }

  if (journey.kind === "transfer") {
    return (
      <section className="min-h-0 flex-1 rounded-2xl bg-white p-3 text-[#685c20] dark:bg-[#151513] dark:text-[#f3c4a2]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-current/58">
              Atendimento em foco
            </p>
            <h2 className="mt-1 truncate text-xl font-semibold">Repasse recebido</h2>
            <p className="mt-1 text-xs text-current/62">
              {journey.transfer.dePerfil} Â· {journey.transfer.paraPerfil}
            </p>
          </div>
          <span className={cn("mt-1 h-2.5 w-2.5 shrink-0 rounded-full", priorityClasses[journey.transfer.prioridade])} />
        </div>

        <div className="mt-4 grid gap-2">
          <div className="rounded-2xl bg-[#1f1f1a]/7 px-3 py-2.5 dark:bg-[#f7f2ec]/8">
            <p className="text-[11px] text-current/48">Motivo</p>
            <p className="mt-0.5 text-sm font-medium">{journey.transfer.motivo}</p>
          </div>
          <div className="rounded-2xl bg-[#1f1f1a]/7 px-3 py-2.5 dark:bg-[#f7f2ec]/8">
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
  const session = sessions?.[0];
  const parsedItems = safeJsonItems(session?.itensSnapshot);
  const fallbackMemory: CustomerMemorySummary = customerMemory ?? {
    recurrence: conversation.clienteId ? "Cliente conhecido" : "Primeiro contato",
    lastPurchase: conversation.pedidoId ? "Pedido vinculado" : "Sem compra vinculada",
    preference: "A confirmar",
    account: "OK",
  };
  const catalogSummary =
    parsedItems.length > 0
      ? parsedItems
          .slice(0, 2)
          .map((item) => `${item.quantidade ?? 1}x ${item.nome ?? "Item"}`)
          .join(", ")
      : session
        ? `${session.quantidadeItens ?? 0} itens`
        : "Sem carrinho ativo";
  const hasUsefulMemory =
    fallbackMemory.recurrence !== "Primeiro contato" ||
    fallbackMemory.lastPurchase !== "Sem compra vinculada" ||
    fallbackMemory.preference !== "A confirmar";
  const hasAccountInfo = fallbackMemory.account === "Pendente" || Boolean(conversation.pedidoId);
  const hasRestriction = conversation.prioridade === "important" || conversation.prioridade === "critical";
  const hasPromotion = false;
  const indicators: FocusIndicator[] = [
    ...(hasPromotion
      ? [
          {
            id: "promocoes" as const,
            label: focusIndicatorLabels.promocoes,
            tone: "active" as const,
            content: (
              <div>
                <p className="font-medium text-current/86">PromoÃ§Ã£o</p>
                <p className="mt-0.5 text-current/62">HÃ¡ uma oferta aplicÃ¡vel para esta jornada.</p>
              </div>
            ),
          },
        ]
      : []),
    ...(hasRestriction
      ? [
          {
            id: "restricoes" as const,
            label: focusIndicatorLabels.restricoes,
            tone: conversation.prioridade === "critical" ? ("critical" as const) : ("attention" as const),
            content: (
              <div>
                <p className="font-medium text-current/86">RestriÃ§Ã£o</p>
                <p className="mt-0.5 text-current/62">
                  {conversation.prioridade === "critical"
                    ? "Atendimento crÃ­tico. Acione o gerente se precisar de apoio."
                    : "AtenÃ§Ã£o nesta jornada antes de confirmar o pedido."}
                </p>
              </div>
            ),
          },
        ]
      : []),
    ...(hasAccountInfo
      ? [
          {
            id: "conta" as const,
            label: focusIndicatorLabels.conta,
            tone: fallbackMemory.account === "Pendente" ? ("attention" as const) : ("info" as const),
            content: (
              <div>
                <p className="font-medium text-current/86">Conta</p>
                <p className="mt-0.5 text-current/62">
                  {fallbackMemory.account === "Pendente"
                    ? "Existe pendÃªncia. Pagamento pertence ao Caixa."
                    : "Conta consultÃ¡vel, sem pendÃªncia visÃ­vel."}
                </p>
              </div>
            ),
          },
        ]
      : []),
    ...(hasUsefulMemory
      ? [
          {
            id: "memoria" as const,
            label: focusIndicatorLabels.memoria,
            tone: "info" as const,
            content: (
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-current/86">MemÃ³ria</p>
                  <p className="mt-0.5 text-current/62">
                    {fallbackMemory.recurrence} Â· Ãºltima compra: {fallbackMemory.lastPurchase}
                  </p>
                  <p className="mt-0.5 text-current/62">PreferÃªncia: {fallbackMemory.preference}</p>
                </div>
                <button
                  type="button"
                  onClick={onOpenMemory}
                  className="shrink-0 cursor-pointer rounded-full bg-[#685c20]/10 px-2.5 py-1 text-[10px] font-medium text-current/78 dark:bg-[#f3c4a2]/10"
                >
                  Ver memÃ³ria
                </button>
              </div>
            ),
          },
        ]
      : []),
    ...(session && ((session.quantidadeItens ?? 0) > 0 || session.ajudaSolicitada)
      ? [
          {
            id: "catalogo" as const,
            label: focusIndicatorLabels.catalogo,
            tone: session.ajudaSolicitada ? ("attention" as const) : ("active" as const),
            content: (
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-current/86">CardÃ¡pio</p>
                    <p className="mt-0.5 text-current/62">
                      {session.status} Â· {formatBRL(session.valorEstimado)}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-current/62">{catalogSummary}</p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1">
                    <button
                      type="button"
                      onClick={onContinueCatalog}
                      className="cursor-pointer rounded-full bg-[#685c20]/10 px-2.5 py-1 text-[10px] font-medium text-current/78 dark:bg-[#f3c4a2]/10"
                    >
                      Continuar
                    </button>
                    <button
                      type="button"
                      onClick={() => onClaimCatalog(session)}
                      className="cursor-pointer rounded-full bg-[#685c20]/10 px-2.5 py-1 text-[10px] font-medium text-current/78 dark:bg-[#f3c4a2]/10"
                    >
                      Avocar
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onConvertCatalog(session)}
                  className="mt-2 cursor-pointer rounded-full bg-[#f04a2a] px-3 py-1.5 text-[10px] font-semibold text-white"
                >
                  Converter em pedido
                </button>
              </div>
            ),
          },
        ]
      : []),
  ];
  const visibleIndicators = indicators.slice(0, 3);
  const hiddenIndicatorCount = Math.max(0, indicators.length - visibleIndicators.length);
  const selectedIndicator = indicators.find((indicator) => indicator.id === openIndicator);

  return (
    <section className="min-h-0 flex-1 rounded-2xl bg-white p-3 text-[#685c20] dark:bg-[#151513] dark:text-[#f3c4a2]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-current/58">
            Atendimento em foco
          </p>
          <h2 className="mt-0.5 truncate text-lg font-semibold">{customerLabel(conversation)}</h2>
          <p className="mt-0.5 truncate text-[11px] text-current/62">
            {channelLabel(conversation)} Â· {statusLabels[conversation.status]}
          </p>
        </div>
        <span className={cn("mt-1 h-2.5 w-2.5 shrink-0 rounded-full", priorityClasses[conversation.prioridade])} />
      </div>

      <div className="mt-3 rounded-2xl bg-[#1f1f1a]/7 px-3 py-2.5 dark:bg-[#f7f2ec]/8">
        <p className="text-[10.5px] text-current/48">Contexto</p>
        <p className="mt-0.5 line-clamp-2 text-sm leading-snug text-current/84">
          {conversation.ultimoTextoSnapshot ?? "Conversa aberta sem mensagem textual."}
        </p>
      </div>

      {visibleIndicators.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {visibleIndicators.map((indicator) => (
            <FocusIndicatorButton
              key={indicator.id}
              id={indicator.id}
              label={indicator.label}
              tone={indicator.tone}
              active={openIndicator === indicator.id}
              onClick={(next) => setOpenIndicator((current) => (current === next ? null : next))}
            />
          ))}
          {hiddenIndicatorCount > 0 && (
            <span className="inline-flex items-center rounded-full bg-[#1f1f1a]/7 px-2.5 py-1.5 text-[10px] font-medium text-current/62 dark:bg-[#f7f2ec]/8">
              +{hiddenIndicatorCount}
            </span>
          )}
        </div>
      )}

      {selectedIndicator && (
        <div className="mt-2 rounded-2xl bg-[#1f1f1a]/7 px-3 py-2 text-xs leading-relaxed dark:bg-[#f7f2ec]/8">
          {selectedIndicator.content}
        </div>
      )}
    </section>
  );
}

function PrimaryNextAction({
  journey,
  messages,
  sessions,
  sending,
  onAssume,
  onMarkRead,
  onSend,
  onStartOrder,
}: {
  journey: JourneyItem | null;
  messages: WhatsAppMessage[] | undefined;
  sessions: SessaoCatalogoResumo[] | undefined;
  sending: boolean;
  onAssume: () => void;
  onMarkRead: () => void;
  onSend: (text: string) => void;
  onStartOrder: () => void;
}) {
  const [text, setText] = useState("");

  if (!journey) {
    return (
      <section className="rounded-2xl bg-white p-3 text-[#685c20] dark:bg-[#151513] dark:text-[#f3c4a2]">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-current/58">
          PrÃ³xima AÃ§Ã£o
        </p>
        <p className="mt-2 text-sm text-current/68">Aguardando seleÃ§Ã£o de jornada.</p>
      </section>
    );
  }

  if (journey.kind === "transfer") {
    return (
      <section className="rounded-2xl bg-white p-3 text-[#685c20] dark:bg-[#151513] dark:text-[#f3c4a2]">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-current/58">
          PrÃ³xima AÃ§Ã£o
        </p>
        <button
          type="button"
          onClick={() => toast.info("Aceite de repasse serÃ¡ ativado na prÃ³xima etapa")}
          className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#f04a2a] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#df3e21]"
        >
          <Shuffle className="h-4 w-4" />
          Revisar repasse
        </button>
        <p className="mt-2 text-xs text-current/62">{journey.transfer.acaoEsperada}</p>
      </section>
    );
  }

  const conversation = journey.conversation;
  const hasCatalogCart = Boolean(sessions?.some((session) => (session.quantidadeItens ?? 0) > 0));
  const action = getConversationNextAction(conversation, hasCatalogCart);
  const ActionIcon = action.icon;
  const canCreateOrder = !hasCatalogCart && !conversation.pedidoId;

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  };

  const runPrimaryAction = () => {
    if (action.kind === "assume") onAssume();
    if (action.kind === "confirm_order") onStartOrder();
    if (action.kind === "track") toast.info("Acompanhamento do pedido serÃ¡ aberto pela jornada");
    if (action.kind === "catalog") toast.info("Envio de cardÃ¡pio serÃ¡ conectado na prÃ³xima etapa");
  };

  return (
    <section className="rounded-2xl bg-white p-2.5 text-[#685c20] dark:bg-[#151513] dark:text-[#f3c4a2]">
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-current/58">
        PrÃ³xima AÃ§Ã£o
      </p>

      {action.kind === "reply" ? (
        <div className="mt-2">
          <div className="mb-2 flex items-start gap-2 rounded-2xl bg-[#1f1f1a]/7 px-3 py-2 dark:bg-[#f7f2ec]/8">
            <ActionIcon className="mt-0.5 h-4 w-4 shrink-0 stroke-[1.8]" />
            <div>
              <p className="text-sm font-semibold">{action.title}</p>
              <p className="text-xs text-current/62">{action.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-[#685c20]/8 px-2 py-2 dark:bg-[#f7f2ec]/8">
            <input
              value={text}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") submit();
              }}
              placeholder="Resposta rÃ¡pida..."
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
          className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#f04a2a] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#df3e21]"
        >
          <ActionIcon className="h-4 w-4" />
          {action.title}
        </button>
      )}

      <div className="mt-1.5 flex flex-wrap gap-1.5 text-[10.5px]">
        <button
          type="button"
          onClick={onMarkRead}
          className="cursor-pointer rounded-full bg-[#685c20]/8 px-2.5 py-1 font-medium text-current/72 dark:bg-[#f7f2ec]/8"
        >
          Marcar lida
        </button>
        {canCreateOrder && (
          <button
            type="button"
            onClick={onStartOrder}
            className="cursor-pointer rounded-full bg-[#685c20]/8 px-2.5 py-1 font-medium text-current/72 dark:bg-[#f7f2ec]/8"
          >
            Criar pedido
          </button>
        )}
        <button
          type="button"
          onClick={() => toast.info("Repasse contextual serÃ¡ concluÃ­da na prÃ³xima etapa")}
          className="cursor-pointer rounded-full bg-[#685c20]/8 px-2.5 py-1 font-medium text-current/72 dark:bg-[#f7f2ec]/8"
        >
          Encaminhar
        </button>
      </div>

      {messages && messages.length > 0 && (
        <p className="mt-1 line-clamp-1 text-[10px] text-current/52">
          Ãºltima mensagem Ã s {formatTime(messages[messages.length - 1]?.timestamp)}
        </p>
      )}
    </section>
  );
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

  const demoMode =
    conversations !== undefined &&
    transferencias !== undefined &&
    conversations.length === 0 &&
    transferencias.length === 0;
  const effectiveConversations = useMemo(
    () =>
      demoMode
        ? [
            { ...demoConversation, unit },
            { ...demoConversationWait, unit },
            { ...demoConversationNew, unit },
          ]
        : conversations,
    [conversations, demoMode, unit],
  );
  const effectiveTransfers = demoMode ? [demoTransferReceived, demoTransferSent] : transferencias;

  const [activeTab, setActiveTab] = useState<AtendimentoTab>("conversas");
  const [filter, setFilter] = useState<FilterId>("todas");
  const [selected, setSelected] = useState<{ kind: JourneyKind; id: string } | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [reportPanelOpen, setReportPanelOpen] = useState(false);
  const [catalogConfirmName, setCatalogConfirmName] = useState<string | null>(null);
  const [transferPanelName, setTransferPanelName] = useState<string | null>(null);
  const [cartPanel, setCartPanel] = useState<CartPanelState>(null);
  const [elasticOffset, setElasticOffset] = useState(0);
  const elasticTimeoutRef = useRef<number | null>(null);
  const [sending, setSending] = useState(false);
  const [memoryOpen, setMemoryOpen] = useState(false);
  const healthItems = useMemo(() => getVisibleHealthItems(buildOperationalHealthInventory({ role: operator.role }), operator.role), [operator.role]);

  const triggerElastic = (direction: number) => {
    if (elasticTimeoutRef.current) window.clearTimeout(elasticTimeoutRef.current);
    setElasticOffset(direction > 0 ? -5 : 5);
    elasticTimeoutRef.current = window.setTimeout(() => setElasticOffset(0), 140);
  };

  const handleElasticWheel = (event: WheelEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest("input, textarea, [data-rvl-scroll], [role='dialog']")) return;
    if (Math.abs(event.deltaY) < 18) return;
    triggerElastic(event.deltaY);
  };

  const updatePreferences = (patch: Partial<OperatorPreferences>) => {
    const next = { ...preferences, ...patch };
    setPreferences(next);
    saveOperatorPreferences(operator.operatorId, next);
  };

  const communicationCounts = useMemo(() => {
    const lista = effectiveConversations ?? [];
    const carrinhos = demoMode ? 1 : 0;
    const ia = lista.filter((conversation) => conversation.status === "nova").length;
    const humano = lista.filter(isHumanConversation).length;
    const transferencias = effectiveTransfers?.filter((transfer) => ["pendente", "aguardando_aceite"].includes(transfer.status)).length ?? 0;
    return {
      ia,
      humano,
      todas: ia + humano + carrinhos + transferencias,
      carrinhos,
      transferencias,
    };
  }, [effectiveConversations, effectiveTransfers, demoMode]);

  const communicationTones = useMemo<Record<FilterId, SignalTone>>(() => {
    const transfers = effectiveTransfers?.filter((transfer) => ["pendente", "aguardando_aceite"].includes(transfer.status)) ?? [];
    const hasCriticalTransfer = transfers.some((transfer) => transfer.prioridade === "critical");

    return {
      ia: "neutral",
      humano: communicationCounts.humano > 0 ? "amber" : "neutral",
      carrinhos: communicationCounts.carrinhos > 0 ? "amber" : "neutral",
      transferencias: hasCriticalTransfer ? "red" : communicationCounts.transferencias > 0 ? "amber" : "neutral",
      todas: "neutral",
    };
  }, [effectiveTransfers, communicationCounts]);

  const journeys = useMemo(
    () => buildJourneyItems(effectiveConversations, effectiveTransfers, demoMode ? [demoCatalogSession] : undefined, filter),
    [effectiveConversations, effectiveTransfers, demoMode, filter],
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
  const selectedIsDemo = String(selectedConversation?._id ?? "").startsWith("demo_conversa_whatsapp");

  const messages = useQuery(
    api.ojc.whatsapp.listarMensagens,
    selectedConversation && !selectedIsDemo ? { conversaId: selectedConversation._id } : "skip",
  ) as WhatsAppMessage[] | undefined;

  const catalogSessions = useQuery(
    api.ojc.catalogo.listarPorConversa,
    selectedConversation && !selectedIsDemo ? { conversaWhatsAppId: selectedConversation._id } : "skip",
  ) as SessaoCatalogoResumo[] | undefined;

  const customerConversations = useQuery(
    api.ojc.whatsapp.buscarConversaPorTelefone,
    selectedConversation && !selectedIsDemo
      ? { unit, telefone: selectedConversation.clienteTelefoneSnapshot }
      : "skip",
  ) as WhatsAppConversation[] | undefined;

  const customerSessions = useQuery(
    api.ojc.catalogo.buscarSessoesPorTelefone,
    selectedConversation && !selectedIsDemo
      ? { unit, telefone: selectedConversation.clienteTelefoneSnapshot }
      : "skip",
  ) as SessaoCatalogoResumo[] | undefined;

  const pedidoDetalhe = useQuery(
    api.venda.pedidos.getPedidoDetalhe,
    selectedConversation?.pedidoId && !selectedIsDemo ? { pedidoId: selectedConversation.pedidoId } : "skip",
  ) as PedidoDetalheResumo | undefined;

  const effectiveMessages = selectedIsDemo ? demoMessages : messages;
  const effectiveCatalogSessions = selectedIsDemo ? [demoCatalogSession] : catalogSessions;
  const effectiveCustomerConversations = selectedIsDemo
    ? [demoConversation, { ...demoConversation, _id: "demo_conversa_whatsapp_anterior" as Id<"conversasWhatsApp">, ultimaMensagemEm: new Date(Date.now() - 24 * 60 * 60000).toISOString() }]
    : customerConversations;
  const effectiveCustomerSessions = selectedIsDemo ? [demoCatalogSession] : customerSessions;
  const effectivePedidoDetalhe = selectedIsDemo ? demoPedidoDetalhe : pedidoDetalhe;

  const customerMemorySummary = useMemo(() => {
    if (!selectedConversation) return null;
    return buildCustomerMemorySummary({
      conversation: selectedConversation,
      customerConversations: effectiveCustomerConversations,
      customerSessions: effectiveCustomerSessions,
      pedidoDetalhe: effectivePedidoDetalhe,
    });
  }, [selectedConversation, effectiveCustomerConversations, effectiveCustomerSessions, effectivePedidoDetalhe]);

  const assumirConversa = useMutation(api.ojc.whatsapp.assumirConversa);
  const marcarConversaLida = useMutation(api.ojc.whatsapp.marcarConversaLida);
  const enviarMensagem = useMutation(api.ojc.whatsapp.enviarMensagemWhatsApp);
  const assumirSessaoCatalogo = useMutation(api.ojc.catalogo.assumirSessao);

  const handleAssume = async () => {
    if (!selectedConversation || !operadorConvex) return;
    if (selectedIsDemo) {
      toast.info("CenÃ¡rio demonstrativo: conversa jÃ¡ estÃ¡ sob atendimento");
      return;
    }
    try {
      await assumirConversa({ conversaId: selectedConversation._id, operadorId: operadorConvex._id });
      toast.success("Conversa assumida");
    } catch {
      toast.error("Erro ao assumir conversa");
    }
  };

  const handleMarkRead = async () => {
    if (!selectedConversation) return;
    if (selectedIsDemo) {
      toast.success("CenÃ¡rio demonstrativo marcado como lido");
      return;
    }
    try {
      await marcarConversaLida({ conversaId: selectedConversation._id });
      toast.success("Conversa marcada como lida");
    } catch {
      toast.error("Erro ao marcar como lida");
    }
  };

  const handleSend = async (text: string) => {
    if (!selectedConversation || !operadorConvex) return;
    if (selectedIsDemo) {
      toast.success("Resposta demonstrativa registrada");
      return;
    }
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

  const handleContinueCatalog = () => {
    toast.info("CardÃ¡pio preparado para abrir em etapa futura");
  };

  const handleSendCatalog = () => {
    toast.info("Envio manual do cardÃ¡pio preparado para conexÃ£o com canal real");
  };

  const handleClaimCatalog = async (session: SessaoCatalogoResumo) => {
    if (!operadorConvex) return;
    if (selectedIsDemo) {
      toast.success("Carrinho demonstrativo assumido");
      return;
    }
    try {
      await assumirSessaoCatalogo({ sessaoId: session._id, operadorId: operadorConvex._id });
      toast.success("Carrinho do cardÃ¡pio assumido");
    } catch {
      toast.error("Erro ao avocar sessÃ£o");
    }
  };

  const handleConvertCatalog = (session: SessaoCatalogoResumo) => {
    if (session.pedidoId) {
      toast.info("Carrinho jÃ¡ possui pedido vinculado");
      return;
    }
    toast.info("Pedido deve nascer por confirmaÃ§Ã£o explÃ­cita do atendente");
    onStartOrder();
  };

  return (
    <div
      className={cn(
        "flex h-svh flex-col overflow-hidden bg-[#f7f7f4] text-[#1f1f1a] dark:bg-[#0b0b0a] dark:text-[#f7f2ec]",
        interfaceScaleClasses[preferences.interfaceScale],
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none fixed bottom-0 top-0 z-50 w-px scale-x-50 bg-sky-400/35 dark:bg-sky-300/45"
        style={{ left: "7.8px" }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none fixed bottom-0 top-0 z-50 w-px scale-x-50 bg-sky-400/35 dark:bg-sky-300/45"
        style={{ right: "7.8px" }}
      />
      <header className="grid shrink-0 grid-cols-[1.55rem_minmax(0,1fr)_10.75rem] items-center gap-1 border-b border-[#1f1f1a]/12 bg-[#f7f7f4]/96 px-[7.8px] py-2 text-[#1f1f1a] md:grid-cols-[1.7rem_minmax(0,1fr)_10.75rem] md:gap-2 md:px-[7.8px] md:py-3 dark:border-[#f7f2ec]/12 dark:bg-[#151513] dark:text-[#f7f2ec]">
        <button
          type="button"
          onClick={onBack}
          className="relative z-20 flex h-8 w-6 cursor-pointer items-center justify-start rounded-full text-current/72 transition-colors hover:text-current focus:outline-none"
          aria-label="Voltar"
        >
          <ArrowLeft className="h-4 w-4 -translate-x-[3px] stroke-[1.65]" />
        </button>
        <div className="min-w-0">
          <h1 className="max-w-full whitespace-nowrap text-[12px] font-semibold uppercase leading-[1.05] tracking-[0.08em] sm:text-sm sm:tracking-[0.12em]">
            {filterLabelsByTab[activeTab]}
          </h1>
        </div>
        <div className="flex w-full translate-x-[8.3px] items-center justify-end gap-[6px]">
          <button
            type="button"
            onClick={() => setActiveTab("clientes")}
            className="cursor-pointer rounded-full p-1.5 text-[#685c20]/62 transition-colors hover:text-[#685c20] focus:outline-none dark:text-[#f3c4a2]/62 dark:hover:text-[#f3c4a2]"
            aria-label="Clientes"
          >
            <Users className="h-[1.1rem] w-[1.1rem] stroke-[1.7]" />
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("agenda")}
            className="cursor-pointer rounded-full p-1.5 text-[#685c20]/62 transition-colors hover:text-[#685c20] focus:outline-none dark:text-[#f3c4a2]/62 dark:hover:text-[#f3c4a2]"
            aria-label="Agenda"
          >
            <CalendarDays className="h-[1.1rem] w-[1.1rem] stroke-[1.7]" />
          </button>
          <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="cursor-pointer rounded-full p-1.5 text-[#685c20]/62 transition-colors hover:text-[#685c20] focus:outline-none dark:text-[#f3c4a2]/62 dark:hover:text-[#f3c4a2]"
            aria-label="Alternar tema"
          >
            {isDark ? <Sun className="h-[1.1rem] w-[1.1rem] stroke-[1.7]" /> : <Moon className="h-[1.1rem] w-[1.1rem] stroke-[1.7]" />}
          </button>
          <DashboardMenu
            contextualItems={contextualMenu[activeTab]}
            healthItems={healthItems}
            availableOperationalModes={availableOperationalModes}
            currentOperationalMode={operationalMode}
            onOperationalModeChange={setOperationalMode}
            interfaceScale={preferences.interfaceScale}
            onInterfaceScaleChange={(interfaceScale) => updatePreferences({ interfaceScale })}
            onHelp={() => setShowHelp(true)}
            onLogout={onLogout}
            onFutureAction={(label) => {
              if (label === "RelatÃ³rios") setReportPanelOpen(true);
              else toast.info(`${label} - em breve`);
            }}
            compact
          />
        </div>
      </header>

      <main
        className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col gap-1 px-4 pb-0 transition-transform duration-150 ease-out md:px-6"
        style={{ transform: `translateY(${elasticOffset}px)` }}
        onWheel={handleElasticWheel}
      >
        <section className="flex min-h-0 flex-1 flex-col">
          {activeTab === "conversas" && !detailOpen && (
            <>
              <div className="-mx-4 mt-1 border-b border-[#1f1f1a]/10 bg-[#ffffff]/92 px-[7.8px] pb-1 pt-1 dark:border-[#f7f2ec]/12 dark:bg-[#1d1d1a] md:-mx-6 md:px-[7.8px]">
                <ConversationFilters
                  counts={communicationCounts}
                  tones={communicationTones}
                  activeFilter={filter}
                  onFilterChange={setFilter}
                />
              </div>
              <ConversationListPanel
                journeys={journeys}
                sessions={effectiveCatalogSessions}
                activeFilter={filter}
                onOpen={(journey) => {
                  setSelected({ kind: journey.kind, id: journey.id });
                  setDetailOpen(true);
                }}
                onSendCatalog={(journey) => {
                  if (journey.kind === "conversation") setCatalogConfirmName(customerLabel(journey.conversation));
                }}
                onTransfer={(journey) => {
                  setTransferPanelName(journey.kind === "conversation" ? customerLabel(journey.conversation) : "Repasse");
                }}
                onOpenCart={(journey) => {
                  if (journey.kind !== "conversation") return;
                  const session =
                    effectiveCatalogSessions?.find((item) => item.conversaWhatsAppId === journey.conversation._id) ??
                    effectiveCatalogSessions?.[0];
                  if (session) setCartPanel({ customerName: customerLabel(journey.conversation), session });
                }}
              />
            </>
          )}

          {activeTab === "conversas" && detailOpen && selectedJourney && (
            <ConversationDetailScreen
              journey={selectedJourney}
              sessions={effectiveCatalogSessions}
              messages={effectiveMessages}
              onBack={() => setDetailOpen(false)}
              onStartOrder={() => {
                toast.info("Pedido deve nascer por confirmaÃ§Ã£o explÃ­cita do atendente");
                onStartOrder();
              }}
            />
          )}

          {activeTab === "pedidos" && (
            <>
              <AtendimentoContextShortcuts
                activeTab={activeTab}
                activeFilter={filter}
                allCount={communicationCounts.todas}
                onChange={setActiveTab}
                onFilterChange={setFilter}
              />
              <PlaceholderTab
                title="Pedidos"
                description="Pedidos do atendimento aparecerÃ£o aqui quando estiverem vinculados."
              />
            </>
          )}

          {activeTab === "clientes" && (
            <>
              <AtendimentoContextShortcuts
                activeTab={activeTab}
                activeFilter={filter}
                allCount={communicationCounts.todas}
                onChange={setActiveTab}
                onFilterChange={setFilter}
              />
              <PlaceholderTab
                title="Clientes"
                description="Clientes do atendimento aparecerÃ£o aqui conforme as conversas forem identificadas."
              />
            </>
          )}

          {activeTab === "agenda" && (
            <>
              <AtendimentoContextShortcuts
                activeTab={activeTab}
                activeFilter={filter}
                allCount={communicationCounts.todas}
                onChange={setActiveTab}
                onFilterChange={setFilter}
              />
              <PlaceholderTab
                title="Agenda"
                description="Compromissos do atendimento aparecerÃ£o aqui."
              />
            </>
          )}
        </section>

        <div className="hidden">
        <CommunicationSummaryPanel
          counts={communicationCounts}
          activeFilter={filter}
          onFilterChange={setFilter}
        />

        <section className="grid min-h-0 flex-1 grid-cols-1 gap-3 md:grid-cols-[1fr_21rem]">
          <div className="flex min-h-0 flex-col gap-3">
	            <FocusedJourney
	              journey={selectedJourney}
	              sessions={effectiveCatalogSessions}
	              customerMemory={customerMemorySummary}
              onOpenMemory={() => setMemoryOpen(true)}
              onContinueCatalog={handleContinueCatalog}
              onSendCatalog={handleSendCatalog}
              onClaimCatalog={handleClaimCatalog}
              onConvertCatalog={handleConvertCatalog}
            />
	            <PrimaryNextAction
	              journey={selectedJourney}
	              messages={effectiveMessages}
	              sessions={effectiveCatalogSessions}
	              sending={sending}
              onAssume={handleAssume}
              onMarkRead={handleMarkRead}
              onSend={handleSend}
              onStartOrder={() => {
                toast.info("Pedido deve nascer por confirmaÃ§Ã£o explÃ­cita do atendente");
                onStartOrder();
              }}
            />
          </div>

          <section className="flex min-h-0 flex-col">
            <div className="mb-2 flex items-center justify-between gap-2 px-1">
              <div>
                <h2 className="text-[11px] font-medium uppercase tracking-[0.1em] text-current/64">
                  Conversas
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
          <span>Central em homologaÃ§Ã£o Â· atendimento sem integraÃ§Ã£o real de canais.</span>
          <History className="ml-auto h-3.5 w-3.5" />
        </footer>
        </div>
      </main>

      <AtendimentoDock
        pendingCount={communicationCounts.ia + communicationCounts.humano + communicationCounts.carrinhos + communicationCounts.transferencias}
        hiddenSignalCount={0}
        hiddenSignalTone="neutral"
        onAction={(label) => {
          if (label === "Venda") onStartOrder();
          else if (label === "Atendimento") {
            setActiveTab("conversas");
            setDetailOpen(false);
          } else {
            toast.info(`${label} - em breve`);
          }
        }}
      />

      <DashboardHelpPanel
        open={showHelp}
        role={operator.role}
        onClose={() => setShowHelp(false)}
      />
      <ReportsPanel open={reportPanelOpen} onClose={() => setReportPanelOpen(false)} />
      <CatalogConfirmPanel
        customerName={catalogConfirmName}
        onCancel={() => setCatalogConfirmName(null)}
        onConfirm={() => {
          handleSendCatalog();
          setCatalogConfirmName(null);
        }}
      />
      <TransferPanel customerName={transferPanelName} onClose={() => setTransferPanelName(null)} />
      <CartPanel cart={cartPanel} onClose={() => setCartPanel(null)} />
	      <CustomerMemoryPanel
	        open={memoryOpen}
	        conversation={selectedConversation}
	        messages={effectiveMessages}
	        customerConversations={effectiveCustomerConversations}
	        customerSessions={effectiveCustomerSessions}
	        pedidoDetalhe={effectivePedidoDetalhe}
	        onClose={() => setMemoryOpen(false)}
	      />
    </div>
  );
}
