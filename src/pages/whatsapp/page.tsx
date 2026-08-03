import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode, type WheelEvent } from "react";
import { useMutation, useQuery } from "convex/react";
import { useTheme } from "next-themes";
import {
  ArrowLeft,
  Banknote,
  Ban,
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
  ContactRound,
  FileText,
  Globe2,
  History,
  Heart,
  Hourglass,
  Image as ImageIcon,
  Images,
  Inbox,
  MessageCircle,
  MoreVertical,
  Mic,
  Moon,
  Package,
  Phone,
  ReceiptText,
  Reply,
  Send,
  Settings,
  ShoppingCart,
  Shuffle,
  Sparkles,
  Sun,
  Tag,
  AlarmClock,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  Video,
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

type SaveCustomerPanelState = {
  conversation: WhatsAppConversation;
  anchorRect: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };
} | null;

type ContactOptionsPanelState = {
  conversation: WhatsAppConversation;
  contextSignals: CustomerContextSignal[];
  anchorRect: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };
} | null;

type CustomerContextSignal = {
  id: string;
  label: string;
  tone: Exclude<SignalTone, "neutral">;
};

type TransferPanelState = {
  customerName: string;
  anchorRect: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };
} | null;

type BlockedContact = {
  id: string;
  name: string;
  phone: string;
  blockedAt: string;
};

type CatalogConfirmState = {
  customerName: string;
  anchorRect: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };
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

const customerContextBadgeClasses: Record<CustomerContextSignal["tone"], string> = {
  green: "bg-emerald-500 text-white",
  amber: "bg-amber-400 text-[#1f1f1a]",
  red: "bg-red-600 text-white",
  blue: "bg-sky-500 text-white",
};

const contextualMenu: Record<AtendimentoTab, string[]> = {
  conversas: ["Agenda", "Relatórios", "Contatos bloqueados", "Filtros", "Mensagens rápidas", "Configurações da conversa", "Ajuda"],
  pedidos: ["Agenda", "Em aberto", "Em produção", "Prontos", "Encerrados", "Ajuda", "Configurações de pedidos"],
  clientes: ["Agenda", "Todos", "Recorrentes", "Com pedido", "Bloqueados", "Relatórios", "Ajuda", "Configurações de clientes"],
  agenda: ["Hoje", "Amanhã", "Pendências", "Configurar agenda"],
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
  important: "bg-red-500",
  critical: "bg-red-700",
};

const priorityBorderClasses = {
  info: "border-emerald-600/70 dark:border-emerald-300/75",
  attention: "border-amber-600/75 dark:border-amber-300/85",
  important: "border-red-600/80 dark:border-red-200/90",
  critical: "border-red-700/85 dark:border-red-300/90",
};

const priorityTimerColors = {
  info: "#10b981",
  attention: "#f59e0b",
  important: "#ef4444",
  critical: "#b91c1c",
};

type PriorityTimerLevel = keyof typeof priorityTimerColors;

const priorityTimerLevels = ["info", "attention", "important", "critical"] as const;

type WaitSlaProfileId = "default" | "newCustomer" | "cart" | "transfer";

type WaitSlaThresholds = Record<PriorityTimerLevel, number>;

type ConversationWaitSlaSettings = Record<WaitSlaProfileId, WaitSlaThresholds>;

const defaultWaitSlaSettings: ConversationWaitSlaSettings = {
  default: {
    info: 3,
    attention: 7,
    important: 12,
    critical: 12,
  },
  newCustomer: {
    info: 2,
    attention: 5,
    important: 9,
    critical: 9,
  },
  cart: {
    info: 2,
    attention: 4,
    important: 8,
    critical: 8,
  },
  transfer: {
    info: 5,
    attention: 10,
    important: 20,
    critical: 20,
  },
};

const waitSlaProfileLabels: Record<WaitSlaProfileId, string> = {
  default: "Geral",
  newCustomer: "Cliente novo",
  cart: "Carrinho",
  transfer: "Repasse",
};

const waitSlaLevelLabels: Record<PriorityTimerLevel, string> = {
  info: "Verde ate",
  attention: "Amarelo ate",
  important: "Vermelho ate",
  critical: "Critico apos",
};

function normalizeWaitSlaThresholds(thresholds?: Partial<WaitSlaThresholds>, fallback = defaultWaitSlaSettings.default): WaitSlaThresholds {
  const info = Math.max(1, Number(thresholds?.info ?? fallback.info));
  const attention = Math.max(info + 1, Number(thresholds?.attention ?? fallback.attention));
  const important = Math.max(attention + 1, Number(thresholds?.important ?? fallback.important));
  const critical = Math.max(important, Number(thresholds?.critical ?? fallback.critical));

  return { info, attention, important, critical };
}

function normalizeWaitSlaSettings(settings?: Partial<ConversationWaitSlaSettings>): ConversationWaitSlaSettings {
  return {
    default: normalizeWaitSlaThresholds(settings?.default, defaultWaitSlaSettings.default),
    newCustomer: normalizeWaitSlaThresholds(settings?.newCustomer, defaultWaitSlaSettings.newCustomer),
    cart: normalizeWaitSlaThresholds(settings?.cart, defaultWaitSlaSettings.cart),
    transfer: normalizeWaitSlaThresholds(settings?.transfer, defaultWaitSlaSettings.transfer),
  };
}

function rgbaFromHex(hex: string, opacity: number) {
  const normalized = hex.replace("#", "");
  const red = parseInt(normalized.slice(0, 2), 16);
  const green = parseInt(normalized.slice(2, 4), 16);
  const blue = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
}

function getWaitTimerLevel(elapsedMinutes: number, thresholds: WaitSlaThresholds): PriorityTimerLevel {
  if (elapsedMinutes < thresholds.info) return "info";
  if (elapsedMinutes < thresholds.attention) return "attention";
  if (elapsedMinutes < thresholds.important) return "important";
  return "critical";
}

function getStatusTimerVisual(startedAt: string | undefined, thresholds: WaitSlaThresholds) {
  const started = startedAt ? new Date(startedAt).getTime() : Date.now();
  const elapsedMinutes = Number.isFinite(started) ? Math.max(0, (Date.now() - started) / 60000) : 0;
  const level = getWaitTimerLevel(elapsedMinutes, thresholds);
  const previousLimit =
    level === "info" ? 0 : level === "attention" ? thresholds.info : level === "important" ? thresholds.attention : thresholds.important;
  const limit = level === "critical" ? Math.max(1, thresholds.critical - thresholds.important || 1) : thresholds[level] - previousLimit;
  const stageElapsedMinutes = level === "critical" ? elapsedMinutes - thresholds.important : elapsedMinutes - previousLimit;
  const progress = Math.min(1, stageElapsedMinutes / limit);
  const filledDegrees = Math.round(progress * 360);
  const currentColor = priorityTimerColors[level];
  const expired = level === "critical" && elapsedMinutes >= thresholds.critical;
  const timerBase = rgbaFromHex(currentColor, 0.16);

  return {
    level,
    expired,
    background: expired
      ? currentColor
      : `conic-gradient(${currentColor} 0deg ${filledDegrees}deg, ${timerBase} ${filledDegrees}deg 360deg)`,
  };
}

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

const DEMO_CONVERSA_ID = "demo_conversa_whatsapp" as Id<"conversasWhatsApp">;
const DEMO_CONVERSA_2_ID = "demo_conversa_whatsapp_2" as Id<"conversasWhatsApp">;
const DEMO_CONVERSA_3_ID = "demo_conversa_whatsapp_3" as Id<"conversasWhatsApp">;
const DEMO_SESSAO_ID = "demo_sessao_catalogo" as Id<"sessoesCatalogo">;
const WHATSAPP_DELETE_WINDOW_MS = 15 * 60 * 1000;

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
  ultimoTextoSnapshot: "Cliente pediu ajuda para confirmar o carrinho do cardápio antes de finalizar o pedido.",
  ultimaMensagemEm: new Date(Date.now() - 4 * 60000).toISOString(),
  naoLidas: 0,
  dataCriacao: new Date(Date.now() - 22 * 60000).toISOString(),
  dataAtualizacao: new Date(Date.now() - 4 * 60000).toISOString(),
};

const demoConversationWait: WhatsAppConversation = {
  _id: DEMO_CONVERSA_2_ID,
  unit: "alvorada-01",
  clienteId: "demo_cliente_2" as Id<"clientes">,
  clienteNomeSnapshot: "João Pereira",
  clienteTelefoneSnapshot: "(69) 99204-1188",
  telefoneNormalizado: "69992041188",
  status: "aguardando_cliente",
  prioridade: "info",
  operadorResponsavelId: "demo_operator" as Id<"operators">,
  operadorResponsavelNomeSnapshot: "Atendimento",
  ultimoTextoSnapshot: "Aguardando confirmação do endereço para seguir com o pedido.",
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
  ultimoTextoSnapshot: "Bom dia, vocês entregam pão de queijo para escritório?",
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
    texto: "Claro, Marina. Separei seu carrinho e vou confirmar os itens com você.",
    status: "enviada",
    operadorNomeSnapshot: "Atendimento",
    timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
  },
  {
    _id: "demo_msg_3" as Id<"mensagensWhatsApp">,
    conversaId: DEMO_CONVERSA_ID,
    direcao: "entrada",
    tipo: "texto",
    texto: "Pode confirmar. O endereço é o mesmo.",
    status: "recebida",
    timestamp: new Date(Date.now() - 4 * 60000).toISOString(),
  },
];

const demoListMessagesByConversation: Record<string, WhatsAppMessage[]> = {
  [String(DEMO_CONVERSA_ID)]: [
    ...demoMessages,
    {
      _id: "demo_msg_list_attendant" as Id<"mensagensWhatsApp">,
      conversaId: DEMO_CONVERSA_ID,
      direcao: "saida",
      tipo: "texto",
      texto: "Claro, Marina. Vou conferir seu carrinho antes de finalizar.",
      status: "lida",
      operadorNomeSnapshot: "Atendimento",
      timestamp: new Date(Date.now() - 6 * 60000).toISOString(),
    },
    {
      _id: "demo_msg_4" as Id<"mensagensWhatsApp">,
      conversaId: DEMO_CONVERSA_ID,
      direcao: "entrada",
      tipo: "texto",
      texto: demoConversation.ultimoTextoSnapshot ?? "Atendimento aberto.",
      status: "recebida",
      timestamp: demoConversation.ultimaMensagemEm ?? demoConversation.dataAtualizacao,
    },
  ],
  [String(DEMO_CONVERSA_2_ID)]: [
    {
      _id: "demo_msg_5" as Id<"mensagensWhatsApp">,
      conversaId: DEMO_CONVERSA_2_ID,
      direcao: "entrada",
      tipo: "texto",
      texto: demoConversationWait.ultimoTextoSnapshot ?? "Atendimento aberto.",
      status: "recebida",
      timestamp: demoConversationWait.ultimaMensagemEm ?? demoConversationWait.dataAtualizacao,
    },
  ],
  [String(DEMO_CONVERSA_3_ID)]: [
    {
      _id: "demo_msg_6" as Id<"mensagensWhatsApp">,
      conversaId: DEMO_CONVERSA_3_ID,
      direcao: "entrada",
      tipo: "texto",
      texto: demoConversationNew.ultimoTextoSnapshot ?? "Atendimento aberto.",
      status: "recebida",
      timestamp: demoConversationNew.ultimaMensagemEm ?? demoConversationNew.dataAtualizacao,
    },
  ],
};

const demoCatalogSession: SessaoCatalogoResumo = {
  _id: DEMO_SESSAO_ID,
  status: "carrinho",
  canalOrigem: "WhatsApp",
  itensSnapshot: JSON.stringify({
    itens: [
      { nome: "Pizza média calabresa", quantidade: 1, precoUnitario: 48 },
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
  motivo: "Cliente pediu ajuste no endereço.",
  acaoEsperada: "Confirmar endereço com o cliente.",
  contexto: "Pedido ainda não foi despachado.",
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
  contexto: "Carrinho pronto aguardando confirmação.",
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
    { nomeSnapshot: "Pizza média calabresa", quantidade: 1, subtotal: 48 },
    { nomeSnapshot: "Coca-Cola 2L", quantidade: 1, subtotal: 12 },
  ],
  eventos: [],
};

type OperatorPreferences = {
  interfaceScale: InterfaceScale;
  waitSla: ConversationWaitSlaSettings;
};

const defaultPreferences: OperatorPreferences = {
  interfaceScale: "normal",
  waitSla: defaultWaitSlaSettings,
};

function preferencesKey(operatorId: string): string {
  return `alvorada_operator_preferences_${operatorId}`;
}

function blockedContactsKey(operatorId: string): string {
  return `alvorada_blocked_contacts_${operatorId}`;
}

function loadOperatorPreferences(operatorId: string): OperatorPreferences {
  try {
    const raw = localStorage.getItem(preferencesKey(operatorId));
    if (!raw) return defaultPreferences;
    const parsed = JSON.parse(raw) as Partial<OperatorPreferences>;
    return {
      ...defaultPreferences,
      ...parsed,
      waitSla: normalizeWaitSlaSettings(parsed.waitSla),
    };
  } catch {
    return defaultPreferences;
  }
}

function loadBlockedContacts(operatorId: string): BlockedContact[] {
  try {
    const raw = localStorage.getItem(blockedContactsKey(operatorId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as BlockedContact[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveBlockedContacts(operatorId: string, contacts: BlockedContact[]) {
  localStorage.setItem(blockedContactsKey(operatorId), JSON.stringify(contacts));
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

function formatAudioCountdown(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
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
      ? "Cardápio digital"
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

const mojibakeFixes: Array<[string, string]> = [
  ["\u00c3\u00a1", "á"],
  ["\u00c3\u00a0", "à"],
  ["\u00c3\u00a2", "â"],
  ["\u00c3\u00a3", "ã"],
  ["\u00c3\u00a9", "é"],
  ["\u00c3\u00aa", "ê"],
  ["\u00c3\u00ad", "í"],
  ["\u00c3\u00b3", "ó"],
  ["\u00c3\u00b4", "ô"],
  ["\u00c3\u00b5", "õ"],
  ["\u00c3\u00ba", "ú"],
  ["\u00c3\u00a7", "ç"],
  ["\u00c3\u0081", "Á"],
  ["\u00c3\u0089", "É"],
  ["\u00c3\u0093", "Ó"],
  ["\u00c3\u009a", "Ú"],
  ["\u00c2\u00b7", "·"],
];

function normalizeDisplayText(text: string) {
  return mojibakeFixes.reduce((normalized, [from, to]) => normalized.replaceAll(from, to), text);
}

type QuickMessage = {
  id: string;
  title: string;
  text: string;
  kind?: "text" | "pix";
  pixKey?: string;
  pixKeyType?: "phone" | "cpf_cnpj" | "email" | "random";
};

type QuickMessageDraft = {
  id: string | null;
  title: string;
  text: string;
  kind: "text" | "pix";
  pixKey: string;
  pixKeyType: "phone" | "cpf_cnpj" | "email" | "random";
};

const defaultQuickMessages: QuickMessage[] = [
  {
    id: "saudacao",
    title: "Saudação",
    text: "Olá, {cliente}! Como posso ajudar?",
  },
  {
    id: "pagamento",
    title: "Pagamento",
    text: "Pode nos enviar o comprovante por aqui, por favor?",
  },
  {
    id: "pix_padrao",
    title: "Pix padrão",
    text: "Segue nossa chave Pix para pagamento:",
    kind: "pix",
    pixKey: "11999999999",
    pixKeyType: "phone",
  },
  {
    id: "entrega",
    title: "Entrega",
    text: "Vou confirmar o endereço e o prazo de entrega para você.",
  },
  {
    id: "cardapio",
    title: "Cardápio",
    text: "Vou te enviar o cardápio para escolher com calma.",
  },
  {
    id: "agradecimento",
    title: "Agradecimento",
    text: "Obrigado, {cliente}! Ficamos à disposição.",
  },
];

const quickMessagesStorageKey = "alvorada_quick_messages_v1";

function loadQuickMessages() {
  try {
    const raw = localStorage.getItem(quickMessagesStorageKey);
    if (!raw) return defaultQuickMessages;
    const parsed = JSON.parse(raw) as QuickMessage[];
    if (!Array.isArray(parsed) || parsed.length === 0) return defaultQuickMessages;
    const validMessages = parsed
      .filter((message) => message.title?.trim() && message.text?.trim())
      .map((message) => ({
        ...message,
        title: normalizeDisplayText(message.title),
        text: normalizeDisplayText(message.text),
        pixKey: message.pixKey ? normalizeDisplayText(message.pixKey) : message.pixKey,
      }));
    const hasPixMessage = validMessages.some((message) => message.kind === "pix");
    const defaultPixMessage = defaultQuickMessages.find((message) => message.kind === "pix");
    return hasPixMessage || !defaultPixMessage ? validMessages : [...validMessages, defaultPixMessage];
  } catch {
    return defaultQuickMessages;
  }
}

function saveQuickMessages(messages: QuickMessage[]) {
  localStorage.setItem(quickMessagesStorageKey, JSON.stringify(messages));
}

function fillQuickMessageTemplate(text: string, customerName: string) {
  const safeName = customerName === "Cliente novo" ? "tudo bem" : customerName;
  return text.replaceAll("{cliente}", safeName);
}

function quickMessageToDraftText(message: QuickMessage, customerName: string) {
  const text = fillQuickMessageTemplate(message.text, customerName);
  if (message.kind !== "pix") return text;
  const pixKey = message.pixKey?.trim();
  return pixKey ? `${text}\n${pixKey}` : text;
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

function getConversationNextAction(conversation: WhatsAppConversation, hasCatalogCart = false) {
  if (!conversation.operadorResponsavelId) {
    return {
      icon: UserCheck,
      title: "Assumir conversa",
      description: "Defina um responsável para conduzir esta jornada.",
      kind: "assume" as const,
    };
  }

  if (hasCatalogCart && !conversation.pedidoId) {
    return {
      icon: CheckCircle2,
      title: "Confirmar pedido",
      description: "Revise o carrinho assistido e confirme a criação do pedido.",
      kind: "confirm_order" as const,
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
    title: "Enviar cardápio",
    description: "A jornada está pronta para receber intenção de compra.",
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

  const filters = ["Período", "Atividade", "Atendente", "Canal", "Status", "Clientes novos", "Bloqueados", "Repasses"];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/16 px-3 py-3 sm:items-center">
      <section className="w-full max-w-sm rounded-3xl bg-[#685c20] p-4 text-[#fff4e8] dark:bg-[#f3c4a2] dark:text-[#685c20]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-current/58">
              Conversas
            </p>
            <h2 className="text-base font-semibold">Relatórios</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full p-1.5 text-current/70 hover:text-current"
            aria-label="Fechar relatórios"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-1">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() =>
                toast.info(
                  filter === "Clientes novos"
                    ? "Clientes novos por data e ticket - estrutura preparada"
                    : filter === "Bloqueados"
                      ? "Contatos bloqueados por período - estrutura preparada"
                    : `${filter} será configurado na próxima etapa`,
                )
              }
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
          Estrutura visual preparada. Clientes novos poderão ser comparados por período, ticket e base já cadastrada.
        </p>
      </section>
    </div>
  );
}

function ConversationSlaSettingsPanel({
  open,
  settings,
  onChange,
  onClose,
}: {
  open: boolean;
  settings: ConversationWaitSlaSettings;
  onChange: (settings: ConversationWaitSlaSettings) => void;
  onClose: () => void;
}) {
  if (!open) return null;

  const updateThreshold = (profile: WaitSlaProfileId, level: PriorityTimerLevel, value: string) => {
    const numeric = Number(value);
    const nextProfile = normalizeWaitSlaThresholds(
      {
        ...settings[profile],
        [level]: Number.isFinite(numeric) ? numeric : settings[profile][level],
      },
      defaultWaitSlaSettings[profile],
    );
    onChange({ ...settings, [profile]: nextProfile });
  };

  const resetDefaults = () => {
    onChange(defaultWaitSlaSettings);
    toast.success("SLA de espera restaurado");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/16 px-3 py-3 sm:items-center" role="dialog" aria-modal="true">
      <section className="w-full max-w-sm rounded-3xl bg-[#685c20] p-4 text-[#fff4e8] dark:bg-[#f3c4a2] dark:text-[#685c20]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-current/58">
              Conversas
            </p>
            <h2 className="text-base font-semibold">Tempo de espera</h2>
            <p className="mt-1 text-[11px] leading-relaxed text-current/62">
              Define quando o avatar muda de verde, amarelo e vermelho.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full p-1.5 text-current/70 hover:text-current"
            aria-label="Fechar configuracoes de espera"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {(Object.keys(waitSlaProfileLabels) as WaitSlaProfileId[]).map((profile) => (
            <div key={profile} className="rounded-2xl bg-white/8 p-2.5 dark:bg-[#685c20]/8">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold">{waitSlaProfileLabels[profile]}</p>
                <span className="text-[10px] font-medium text-current/52">minutos</span>
              </div>
              <div className="mt-2 grid grid-cols-4 gap-1.5">
                {priorityTimerLevels.map((level) => (
                  <label key={level} className="min-w-0">
                    <span className="block truncate text-[9px] font-medium text-current/52">
                      {waitSlaLevelLabels[level]}
                    </span>
                    <input
                      type="number"
                      min={1}
                      value={settings[profile][level]}
                      onChange={(event) => updateThreshold(profile, level, event.target.value)}
                      className="mt-1 h-8 w-full rounded-xl bg-white/12 px-2 text-center text-xs font-semibold text-current outline-none dark:bg-[#685c20]/10"
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={resetDefaults}
            className="min-h-9 flex-1 cursor-pointer rounded-2xl bg-white/10 px-3 text-xs font-semibold text-current/78 dark:bg-[#685c20]/10"
          >
            Restaurar
          </button>
          <button
            type="button"
            onClick={onClose}
            className="min-h-9 flex-1 cursor-pointer rounded-2xl bg-[#f04a2a] px-3 text-xs font-semibold text-white"
          >
            Concluir
          </button>
        </div>
      </section>
    </div>
  );
}

function CatalogConfirmPanel({
  confirm,
  onCancel,
  onConfirm,
}: {
  confirm: CatalogConfirmState;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!confirm) return null;

  const panelWidth = 136;
  const panelHeight = 86;
  const viewportWidth = typeof window === "undefined" ? panelWidth : window.innerWidth;
  const viewportHeight = typeof window === "undefined" ? 720 : window.innerHeight;
  const left = Math.min(viewportWidth - 12 - panelWidth, Math.max(12, confirm.anchorRect.right - panelWidth));
  const top = Math.min(viewportHeight - panelHeight - 12, confirm.anchorRect.bottom + 8);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/8"
      onClick={onCancel}
    >
      <section
        className="fixed max-w-[calc(100vw-1.5rem)] rounded-2xl bg-[#685c20] p-3 text-[#fff4e8] shadow-sm dark:bg-[#f3c4a2] dark:text-[#685c20]"
        style={{ left, top, width: panelWidth }}
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-center text-xs font-semibold leading-snug">Enviar cardápio para {confirm.customerName}?</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer rounded-xl bg-white/8 px-3 py-1.5 text-[11px] font-medium dark:bg-[#685c20]/8"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="cursor-pointer rounded-xl bg-[#f04a2a] px-3 py-1.5 text-[11px] font-semibold text-white"
          >
            Enviar
          </button>
        </div>
      </section>
    </div>
  );
}

function TransferPanel({
  transfer,
  onClose,
}: {
  transfer: TransferPanelState;
  onClose: () => void;
}) {
  const [destination, setDestination] = useState("Caixa");
  const [reason, setReason] = useState("Pagamento");
  const [note, setNote] = useState("");
  const [attachmentsOpen, setAttachmentsOpen] = useState(false);
  const [recordingAudio, setRecordingAudio] = useState(false);
  const [recordingAudioMode, setRecordingAudioMode] = useState<"locked" | "hold" | null>(null);
  const [audioSecondsLeft, setAudioSecondsLeft] = useState(120);
  const attachmentRootRef = useRef<HTMLDivElement | null>(null);
  const audioHoldTimeoutRef = useRef<number | null>(null);
  const audioHoldActiveRef = useRef(false);
  const audioPointerStartYRef = useRef(0);
  const audioMobilePointerRef = useRef(false);

  const clearAudioHoldTimer = () => {
    if (audioHoldTimeoutRef.current === null) return;
    window.clearTimeout(audioHoldTimeoutRef.current);
    audioHoldTimeoutRef.current = null;
  };

  const startLockedAudioRecording = () => {
    setAttachmentsOpen(false);
    setAudioSecondsLeft(120);
    setRecordingAudioMode("locked");
    setRecordingAudio(true);
  };

  const finishAudioRecording = () => {
    toast.success("Áudio anexado ao encaminhamento");
    setRecordingAudio(false);
    setRecordingAudioMode(null);
    setAudioSecondsLeft(120);
    audioHoldActiveRef.current = false;
  };

  const isTouchAudioPointer = (event: { pointerType: string }) =>
    event.pointerType === "touch" || event.pointerType === "pen";

  useEffect(() => {
    if (!attachmentsOpen) return;
    const closeAttachments = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (target && attachmentRootRef.current?.contains(target)) return;
      setAttachmentsOpen(false);
    };

    document.addEventListener("pointerdown", closeAttachments);
    return () => document.removeEventListener("pointerdown", closeAttachments);
  }, [attachmentsOpen]);

  useEffect(() => {
    return () => clearAudioHoldTimer();
  }, []);

  useEffect(() => {
    if (!recordingAudio) return;
    if (audioSecondsLeft <= 0) return;

    const timer = window.setInterval(() => {
      setAudioSecondsLeft((value) => Math.max(0, value - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [audioSecondsLeft, recordingAudio]);

  if (!transfer) return null;

  const panelWidth = 236;
  const panelHeight = recordingAudio ? 318 : 306;
  const viewportWidth = typeof window === "undefined" ? panelWidth : window.innerWidth;
  const viewportHeight = typeof window === "undefined" ? 720 : window.innerHeight;
  const left = Math.min(viewportWidth - 8 - panelWidth, Math.max(8, transfer.anchorRect.right - panelWidth));
  const top = Math.min(viewportHeight - panelHeight - 8, transfer.anchorRect.bottom + 6);
  const reasons = ["Pagamento", "Endereço", "Confirmação", "Outro"];
  const requiresNote = reason === "Outro";
  const attachmentActions = [
    { label: "Documento", icon: FileText },
    { label: "Câmera", icon: Camera },
    { label: "Galeria", icon: Images },
    { label: "Áudio", icon: Mic },
    { label: "Vídeo", icon: Video },
    { label: "Contato", icon: ContactRound },
  ];
  const audioTime = formatAudioCountdown(audioSecondsLeft);

  return (
    <div className="fixed inset-0 z-50 bg-black/8" onClick={onClose}>
      <section
        className="fixed max-w-[calc(100vw-1rem)] rounded-2xl bg-[#685c20] p-3 text-[#fff4e8] shadow-sm dark:bg-[#f3c4a2] dark:text-[#685c20]"
        style={{ left, top, width: panelWidth }}
        onClick={(event) => event.stopPropagation()}
      >
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-current/58">Encaminhar</p>
          <h2 className="truncate text-sm font-semibold">{transfer.customerName}</h2>
        </div>

        <label className="mt-3 block text-[10px] font-medium text-current/62">
          Destino
          <span className="relative mt-1 flex items-center rounded-xl bg-white/7 px-2 py-1.5 dark:bg-[#685c20]/8">
            <select
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
              className="w-full cursor-pointer appearance-none bg-transparent pr-5 text-xs font-semibold outline-none"
            >
              {["Caixa", "Produção", "Delivery", "Gerência", "Estoque"].map((item) => (
                <option key={item} value={item} className="text-[#1f1f1a]">
                  {item}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 h-3.5 w-3.5 text-current/48" />
          </span>
        </label>

        <label className="mt-3 block text-[10px] font-medium text-current/62">
          Motivo
          <span className="relative mt-1 flex items-center rounded-xl bg-white/7 px-2 py-1.5 dark:bg-[#685c20]/8">
            <select
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="w-full cursor-pointer appearance-none bg-transparent pr-5 text-xs font-semibold outline-none"
            >
              {reasons.map((item) => (
                <option key={item} value={item} className="text-[#1f1f1a]">
                  {item}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 h-3.5 w-3.5 text-current/48" />
          </span>
        </label>

        <div className="mt-3 text-[10px] font-medium text-current/62">
          <span className="flex items-center justify-between">
            <span>Observação</span>
            {requiresNote && <span className="text-[9px] font-semibold text-current/78">Obrigatória</span>}
          </span>
          <div
            ref={attachmentRootRef}
            className={cn(
              "relative mt-1 flex min-h-9 items-center gap-1 rounded-xl bg-white/7 px-1 py-1 dark:bg-[#685c20]/8",
              requiresNote && !note.trim() && "ring-1 ring-current/24",
            )}
          >
            <button
              type="button"
              onClick={() => setAttachmentsOpen((value) => !value)}
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-base font-medium leading-none text-current/72 hover:bg-white/7 hover:text-current dark:hover:bg-[#685c20]/10"
              aria-label="Anexar mídia"
              aria-expanded={attachmentsOpen}
            >
              +
            </button>
            {attachmentsOpen && (
              <div className="absolute bottom-full left-0 z-10 mb-0.5 flex w-36 flex-col gap-0.5 rounded-xl bg-[#fff4e8] p-1.5 text-[#685c20] shadow-sm dark:bg-[#685c20] dark:text-[#fff4e8]">
                {attachmentActions.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        toast.info(`${item.label} será anexado na próxima etapa`);
                        setAttachmentsOpen(false);
                      }}
                      className="flex min-h-8 cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-left text-[10px] font-medium hover:bg-[#685c20]/8 dark:hover:bg-white/8"
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
            {recordingAudio ? (
              <div className="min-w-0 flex-1 px-1 py-0.5">
                <div className="flex items-center justify-between gap-2 text-[10px] font-semibold text-current">
                  <span className="inline-flex min-w-0 items-center gap-1">
                    <Mic className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{recordingAudioMode === "hold" ? "Solte para enviar" : "Gravando áudio"}</span>
                  </span>
                  <span className="shrink-0 tabular-nums">{audioTime}</span>
                </div>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-current/14">
                  <div
                    className="h-full rounded-full bg-current/62 transition-[width] duration-300"
                    style={{ width: `${Math.max(0, (audioSecondsLeft / 120) * 100)}%` }}
                  />
                </div>
                {recordingAudioMode === "locked" && (
                  <div className="mt-1 flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setRecordingAudio(false);
                        setRecordingAudioMode(null);
                        setAudioSecondsLeft(120);
                      }}
                      className="cursor-pointer rounded-full px-2 py-0.5 text-[9px] font-medium text-current/68 hover:bg-white/7 hover:text-current dark:hover:bg-[#685c20]/10"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={finishAudioRecording}
                      className="cursor-pointer rounded-full bg-current px-2 py-0.5 text-[9px] font-semibold text-[#685c20] dark:text-[#f3c4a2]"
                    >
                      Enviar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={1}
                  required={requiresNote}
                  placeholder={requiresNote ? "Descreva o motivo" : "Opcional"}
                  onInput={(event) => {
                    const field = event.currentTarget;
                    field.style.height = "auto";
                    field.style.height = `${Math.min(field.scrollHeight, 64)}px`;
                  }}
                  className="max-h-16 min-h-7 w-full flex-1 resize-none bg-transparent px-1.5 py-1 text-xs leading-5 text-current placeholder:text-current/42 outline-none"
                />
                <button
                  type="button"
                  onPointerDown={(event) => {
                    event.currentTarget.setPointerCapture(event.pointerId);
                    setAttachmentsOpen(false);
                    audioHoldActiveRef.current = false;
                    audioPointerStartYRef.current = event.clientY;
                    audioMobilePointerRef.current = isTouchAudioPointer(event);
                    clearAudioHoldTimer();
                    if (audioMobilePointerRef.current) {
                      audioHoldActiveRef.current = true;
                      setAudioSecondsLeft(120);
                      setRecordingAudioMode("hold");
                      setRecordingAudio(true);
                      return;
                    }
                    audioHoldTimeoutRef.current = window.setTimeout(() => {
                      audioHoldActiveRef.current = true;
                      setAudioSecondsLeft(120);
                      setRecordingAudioMode("hold");
                      setRecordingAudio(true);
                    }, 350);
                  }}
                  onPointerMove={(event) => {
                    if (!audioMobilePointerRef.current || !audioHoldActiveRef.current) return;
                    if (audioPointerStartYRef.current - event.clientY < 44) return;
                    audioHoldActiveRef.current = false;
                    setRecordingAudioMode("locked");
                  }}
                  onPointerUp={(event) => {
                    event.currentTarget.releasePointerCapture(event.pointerId);
                    clearAudioHoldTimer();
                    if (audioHoldActiveRef.current) {
                      finishAudioRecording();
                      return;
                    }
                    if (audioMobilePointerRef.current) return;
                    startLockedAudioRecording();
                  }}
                  onPointerCancel={() => {
                    clearAudioHoldTimer();
                    audioHoldActiveRef.current = false;
                    setRecordingAudio(false);
                    setRecordingAudioMode(null);
                    setAudioSecondsLeft(120);
                  }}
                  className="flex h-8 w-8 shrink-0 touch-none select-none items-center justify-center rounded-full text-current/62 transition-colors hover:bg-white/7 hover:text-current active:bg-current/14 active:text-current dark:hover:bg-[#685c20]/10 dark:active:bg-current/16"
                  aria-label="Gravar áudio"
                  onContextMenu={(event) => event.preventDefault()}
                >
                  <Mic className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button type="button" onClick={onClose} className="cursor-pointer rounded-xl bg-white/8 px-3 py-1.5 text-[11px] font-medium dark:bg-[#685c20]/8">
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              if (requiresNote && !note.trim()) {
                toast.info("Descreva o motivo para encaminhar como Outro");
                return;
              }
              toast.success(`Encaminhamento para ${destination} preparado`);
              onClose();
            }}
            className="cursor-pointer rounded-xl bg-[#f04a2a] px-3 py-1.5 text-[11px] font-semibold text-white"
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
          <button type="button" onClick={() => toast.info("Edição do carrinho será conectada na próxima etapa")} className="cursor-pointer rounded-2xl bg-white/8 px-3 py-2 text-xs font-medium dark:bg-[#685c20]/8">
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

function SaveCustomerPanel({
  state,
  onClose,
}: {
  state: SaveCustomerPanelState;
  onClose: () => void;
}) {
  const [activeSection, setActiveSection] = useState<"cliente" | "catalogo" | "venda">("cliente");
  const [customerMode, setCustomerMode] = useState<"express" | "complete">("express");

  useEffect(() => {
    if (!state) return;
    setActiveSection("cliente");
    setCustomerMode("express");
  }, [state]);

  if (!state) return null;
  const { conversation, anchorRect } = state;
  const isComplete = customerMode === "complete";
  const panelWidth = 304;
  const panelHeight = isComplete || activeSection !== "cliente" ? 452 : 332;
  const viewportWidth = typeof window === "undefined" ? panelWidth : window.innerWidth;
  const viewportHeight = typeof window === "undefined" ? 720 : window.innerHeight;
  const dockReserve = 84;
  const maxTop = viewportHeight - dockReserve - panelHeight;
  const spaceBelow = viewportHeight - dockReserve - anchorRect.bottom;
  const opensBelow = spaceBelow >= panelHeight + 8;
  const left = Math.min(viewportWidth - 8 - panelWidth, Math.max(8, anchorRect.left));
  const top = opensBelow ? Math.max(8, anchorRect.bottom + 6) : Math.max(8, Math.min(maxTop, anchorRect.top - 6));
  const previewText = conversation.ultimoTextoSnapshot ?? "Mensagem do cliente ainda sem texto.";

  return (
    <div className="fixed inset-0 z-50 bg-black/12" onClick={onClose}>
      <section
        className="fixed max-h-[calc(100vh-6rem)] max-w-[calc(100vw-1rem)] overflow-y-auto rounded-3xl bg-[#685c20] p-3.5 text-[#fff4e8] shadow-sm [scrollbar-width:thin] dark:bg-[#f3c4a2] dark:text-[#685c20]"
        style={{ left, top, width: panelWidth }}
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-current/58">Atendimento</p>
        <div className="mt-1 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold">Cliente novo</h2>
            <p className="truncate text-xs text-current/62">
              {customerLabel(conversation)} · {conversation.clienteTelefoneSnapshot}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full p-1 text-current/62 hover:bg-white/8 hover:text-current dark:hover:bg-[#685c20]/8"
            aria-label="Fechar cadastro contextual"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-1 rounded-2xl bg-white/7 p-1 text-[10px] font-semibold dark:bg-[#685c20]/8">
          {([
            ["cliente", "Cliente"],
            ["catalogo", "Catálogo"],
            ["venda", "Venda"],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveSection(key)}
              className={cn(
                "cursor-pointer rounded-xl px-2 py-1.5 transition-colors",
                activeSection === key ? "bg-white/16 text-current dark:bg-[#685c20]/14" : "text-current/58 hover:text-current",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-3 rounded-2xl bg-white/7 px-3 py-2 text-xs leading-snug dark:bg-[#685c20]/8">
          <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-current/50">Mensagem visível</p>
          <p className="mt-1 line-clamp-2 text-current/76">{previewText}</p>
        </div>

        {activeSection === "cliente" && (
          <div className="mt-3 space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-1 rounded-2xl bg-white/7 p-1 text-[10px] font-semibold dark:bg-[#685c20]/8">
              {([
                ["express", "Express"],
                ["complete", "Completo"],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCustomerMode(key)}
                  className={cn(
                    "cursor-pointer rounded-xl px-2 py-1.5 transition-colors",
                    customerMode === key ? "bg-white/16 text-current dark:bg-[#685c20]/14" : "text-current/58 hover:text-current",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between rounded-2xl bg-white/7 px-3 py-2 dark:bg-[#1f1f1a]/7">
                <span className="text-current/62">Nome</span>
                <span className="font-medium">{customerLabel(conversation)}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white/7 px-3 py-2 dark:bg-[#1f1f1a]/7">
                <span className="text-current/62">Telefone</span>
                <span className="font-medium">{conversation.clienteTelefoneSnapshot}</span>
              </div>
              {isComplete && (
                <>
                  <input
                    className="h-8 w-full rounded-2xl bg-white/7 px-3 text-xs outline-none placeholder:text-current/42 dark:bg-[#1f1f1a]/7"
                    placeholder="Endereço"
                  />
                  <input
                    className="h-8 w-full rounded-2xl bg-white/7 px-3 text-xs outline-none placeholder:text-current/42 dark:bg-[#1f1f1a]/7"
                    placeholder="Referência"
                  />
                  <textarea
                    className="min-h-14 w-full resize-none rounded-2xl bg-white/7 px-3 py-2 text-xs outline-none placeholder:text-current/42 dark:bg-[#1f1f1a]/7"
                    placeholder="Observações, preferências ou restrições"
                  />
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                toast.success(isComplete ? "Cadastro completo preparado na conversa" : "Cliente salvo no modo express");
                if (!isComplete) onClose();
              }}
              className="w-full cursor-pointer rounded-2xl bg-[#f04a2a] px-3 py-2 text-xs font-semibold text-white"
            >
              {isComplete ? "Salvar cadastro completo" : "Salvar express"}
            </button>
          </div>
        )}

        {activeSection === "catalogo" && (
          <div className="mt-3 space-y-2 text-xs">
            {["Mais pedidos", "Promoções aplicáveis", "Últimos comprados", "Itens relacionados"].map((item) => (
              <button
                key={item}
                type="button"
                className="flex w-full cursor-pointer items-center justify-between rounded-2xl bg-white/7 px-3 py-2 text-left font-medium dark:bg-[#1f1f1a]/7"
              >
                <span>{item}</span>
                <ChevronRight className="h-3.5 w-3.5 text-current/50" />
              </button>
            ))}
            <p className="rounded-2xl bg-white/7 px-3 py-2 text-current/68 dark:bg-[#1f1f1a]/7">
              Catálogo contextual preparado para consultar itens sem sair da conversa.
            </p>
          </div>
        )}

        {activeSection === "venda" && (
          <div className="mt-3 space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-1.5">
              <button type="button" className="cursor-pointer rounded-2xl bg-white/7 px-3 py-2 font-medium dark:bg-[#1f1f1a]/7">
                Carrinho
              </button>
              <button type="button" className="cursor-pointer rounded-2xl bg-white/7 px-3 py-2 font-medium dark:bg-[#1f1f1a]/7">
                Pagamento
              </button>
            </div>
            <div className="rounded-2xl bg-white/7 px-3 py-2 dark:bg-[#1f1f1a]/7">
              <p className="font-semibold">Finalização dentro da conversa</p>
              <p className="mt-1 text-current/66">
                Use os dados escritos pelo cliente para confirmar endereço, itens e pagamento sem abrir outra tela.
              </p>
            </div>
            <button
              type="button"
              onClick={() => toast.info("Finalização de venda será conectada ao pedido")}
              className="w-full cursor-pointer rounded-2xl bg-[#f04a2a] px-3 py-2 text-xs font-semibold text-white"
            >
              Preparar finalização
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

function ContactOptionsPanel({
  state,
  isBlocked,
  onClose,
  onSave,
  onBlock,
  onShowBlocked,
}: {
  state: ContactOptionsPanelState;
  isBlocked: boolean;
  onClose: () => void;
  onSave: (conversation: WhatsAppConversation, trigger: HTMLElement) => void;
  onBlock: (conversation: WhatsAppConversation) => void;
  onShowBlocked: () => void;
}) {
  if (!state) return null;
  const { conversation, anchorRect, contextSignals } = state;
  const panelWidth = 296;
  const panelHeight = contextSignals.length > 0 ? 336 : 286;
  const viewportWidth = typeof window === "undefined" ? panelWidth : window.innerWidth;
  const viewportHeight = typeof window === "undefined" ? 720 : window.innerHeight;
  const spaceBelow = viewportHeight - anchorRect.bottom;
  const opensBelow = spaceBelow >= panelHeight + 10;
  const left = Math.min(viewportWidth - 8 - panelWidth, Math.max(8, anchorRect.left));
  const top = opensBelow
    ? Math.min(viewportHeight - panelHeight - 8, anchorRect.bottom + 6)
    : Math.max(8, anchorRect.top - panelHeight - 6);

  return (
    <div className="fixed inset-0 z-50 bg-black/12" onClick={onClose}>
      <section
        className="fixed max-w-[calc(100vw-1rem)] rounded-3xl bg-[#685c20] p-3.5 text-[#fff4e8] shadow-sm dark:bg-[#f3c4a2] dark:text-[#685c20]"
        style={{ left, top, width: panelWidth }}
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-current/58">Contato</p>
        <h2 className="mt-1 truncate text-base font-semibold">{customerLabel(conversation)}</h2>
        <p className="text-xs text-current/62">{conversation.clienteTelefoneSnapshot}</p>
        {contextSignals.length > 0 && (
          <div className="mt-2 rounded-2xl bg-white/7 px-3 py-2 text-[10px] leading-snug dark:bg-[#685c20]/8">
            <p className="mb-1 font-semibold uppercase tracking-[0.08em] text-current/52">Sinais do cliente</p>
            <div className="space-y-1">
              {contextSignals.slice(0, 3).map((signal) => (
                <div key={signal.id} className="flex items-center gap-2">
                  <span
                    className={cn(
                      "h-2 w-2 shrink-0 rounded-full",
                      signal.tone === "red" && "bg-red-600",
                      signal.tone === "amber" && "bg-amber-400",
                      signal.tone === "green" && "bg-emerald-500",
                      signal.tone === "blue" && "bg-sky-500",
                    )}
                  />
                  <span className="truncate text-current/76">{signal.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="mt-3 space-y-0.5">
          <button
            type="button"
            onClick={() => toast.info("Conta a receber preparada para consulta contextual")}
            className="flex w-full cursor-pointer items-center gap-2 rounded-2xl px-3 py-2 text-left text-xs font-medium hover:bg-white/8 dark:hover:bg-[#685c20]/8"
          >
            <Banknote className="h-3.5 w-3.5" />
            Verificar conta a receber
          </button>
          <button
            type="button"
            onClick={() => toast.info("Promoções aplicáveis serão listadas no próprio contato")}
            className="flex w-full cursor-pointer items-center gap-2 rounded-2xl px-3 py-2 text-left text-xs font-medium hover:bg-white/8 dark:hover:bg-[#685c20]/8"
          >
            <Tag className="h-3.5 w-3.5" />
            Promoções
          </button>
          <button
            type="button"
            onClick={() => toast.info("Edição rápida do contato será aberta aqui")}
            className="flex w-full cursor-pointer items-center gap-2 rounded-2xl px-3 py-2 text-left text-xs font-medium hover:bg-white/8 dark:hover:bg-[#685c20]/8"
          >
            <UserCheck className="h-3.5 w-3.5" />
            Editar contato
          </button>
          <button
            type="button"
            onClick={() => toast.info("Itens relacionados serão exibidos no contexto do atendimento")}
            className="flex w-full cursor-pointer items-center gap-2 rounded-2xl px-3 py-2 text-left text-xs font-medium hover:bg-white/8 dark:hover:bg-[#685c20]/8"
          >
            <Package className="h-3.5 w-3.5" />
            Itens relacionados
          </button>
          {isNewCustomer(conversation) && (
            <button
              type="button"
              onClick={(event) => {
                onSave(conversation, event.currentTarget);
                onClose();
              }}
              className="flex w-full cursor-pointer items-center gap-2 rounded-2xl px-3 py-2 text-left text-xs font-medium hover:bg-white/8 dark:hover:bg-[#685c20]/8"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Salvar cliente
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              onBlock(conversation);
              onClose();
            }}
            className="flex w-full cursor-pointer items-center gap-2 rounded-2xl px-3 py-2 text-left text-xs font-medium hover:bg-white/8 dark:hover:bg-[#685c20]/8"
          >
            <Ban className="h-3.5 w-3.5" />
            {isBlocked ? "Contato já bloqueado" : "Bloquear contato"}
          </button>
          <button
            type="button"
            onClick={() => {
              onShowBlocked();
              onClose();
            }}
            className="flex w-full cursor-pointer items-center gap-2 rounded-2xl px-3 py-2 text-left text-xs font-medium hover:bg-white/8 dark:hover:bg-[#685c20]/8"
          >
            <Inbox className="h-3.5 w-3.5" />
            Contatos bloqueados
          </button>
        </div>
      </section>
    </div>
  );
}

function BlockedContactsPanel({
  contacts,
  onClose,
}: {
  contacts: BlockedContact[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/16 px-3 py-3 sm:items-center" onClick={onClose}>
      <section
        className="w-full max-w-sm rounded-3xl bg-[#685c20] p-4 text-[#fff4e8] dark:bg-[#f3c4a2] dark:text-[#685c20]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-current/58">Clientes</p>
            <h2 className="text-base font-semibold">Contatos bloqueados</h2>
          </div>
          <button type="button" onClick={onClose} className="cursor-pointer rounded-full p-1.5 text-current/70 hover:text-current" aria-label="Fechar bloqueados">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4 space-y-2">
          {contacts.length > 0 ? (
            contacts.map((contact) => (
              <div key={contact.id} className="rounded-2xl bg-white/7 px-3 py-2 text-xs dark:bg-[#1f1f1a]/7">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{contact.name}</span>
                  <span className="text-[10px] text-current/52">{formatTime(contact.blockedAt)}</span>
                </div>
                <p className="mt-0.5 text-current/62">{contact.phone}</p>
              </div>
            ))
          ) : (
            <p className="rounded-2xl bg-white/7 px-3 py-3 text-xs text-current/62 dark:bg-[#1f1f1a]/7">
              Nenhum contato bloqueado.
            </p>
          )}
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
            <span className="text-[11px] font-semibold leading-none tabular-nums text-current/92">
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
  if (conversation.prioridade === "critical") return `${channelLabel(conversation)} · Ajuda crítica`;
  if (conversation.prioridade === "important") return `${channelLabel(conversation)} · Ajuda`;
  if (conversation.status === "aguardando_cliente") return `${channelLabel(conversation)} · Espera`;
  if (conversation.status === "convertida_pedido") return `${channelLabel(conversation)} · Pedido`;
  return `${channelLabel(conversation)} · ${statusLabels[conversation.status]}`;
}

function conversationPreview(journey: JourneyItem) {
  if (journey.kind === "transfer") return journey.transfer.acaoEsperada || journey.transfer.motivo;
  return journey.conversation.ultimoTextoSnapshot ?? "Atendimento aberto.";
}

function isNewCustomer(conversation: WhatsAppConversation) {
  return !conversation.clienteId || customerLabel(conversation).toLowerCase() === "cliente novo";
}

function getCustomerContextSignals({
  conversation,
  session,
  isBlocked,
}: {
  conversation: WhatsAppConversation;
  session?: SessaoCatalogoResumo;
  isBlocked: boolean;
}): CustomerContextSignal[] {
  const signals: CustomerContextSignal[] = [];

  if (isBlocked) {
    signals.push({ id: "blocked", label: "Contato bloqueado anteriormente", tone: "red" });
  }
  if (conversation.prioridade === "critical") {
    signals.push({ id: "critical", label: "Atendimento em prioridade crítica", tone: "red" });
  }
  if (conversation.pedidoId) {
    signals.push({ id: "receivable", label: "Verificar conta a receber vinculada", tone: "amber" });
  }
  if (session?.ajudaSolicitada) {
    signals.push({ id: "catalog_help", label: "Ajuda solicitada no cardápio", tone: "amber" });
  }
  if ((session?.quantidadeItens ?? 0) > 0) {
    signals.push({ id: "cart", label: "Carrinho iniciado pelo cliente", tone: "blue" });
  }
  if ((conversation.naoLidas ?? 0) > 0) {
    signals.push({ id: "unread", label: "Comunicação ainda não vista", tone: "blue" });
  }
  if (isNewCustomer(conversation)) {
    signals.push({ id: "new_customer", label: "Cliente novo sem cadastro completo", tone: "blue" });
  }

  return signals;
}

function conversationThreadMessages(conversation: WhatsAppConversation, messages: WhatsAppMessage[] | undefined) {
  const textualMessages = (messages ?? []).filter((message) => Boolean(message.texto?.trim()));
  if (textualMessages.length > 0) return textualMessages;

  return [
    {
      _id: `${conversation._id}-last` as Id<"mensagensWhatsApp">,
      conversaId: conversation._id,
      direcao: "entrada",
      tipo: "texto",
      texto: conversation.ultimoTextoSnapshot ?? "Atendimento aberto.",
      status: "recebida",
      timestamp: conversation.ultimaMensagemEm ?? conversation.dataAtualizacao,
    } satisfies WhatsAppMessage,
  ];
}

function canDeleteForEveryone(message: WhatsAppMessage) {
  const timestamp = new Date(message.timestamp).getTime();
  if (!Number.isFinite(timestamp)) return false;
  return message.direcao === "saida" && Date.now() - timestamp <= WHATSAPP_DELETE_WINDOW_MS;
}

function MessageStatusChecks({ status }: { status: WhatsAppMessage["status"] }) {
  if (status === "erro" || status === "recebida") return null;

  const double = status === "entregue" || status === "lida";
  const read = status === "lida";

  return (
    <span className={cn("relative inline-flex h-3.5 w-4 items-center", read ? "text-sky-500" : "text-current/45")}>
      <svg viewBox="0 0 18 14" aria-hidden="true" className="h-3.5 w-4 fill-none stroke-current stroke-[1.8]">
        <path d="M2 7.2 5.5 10.8 12.5 3" strokeLinecap="round" strokeLinejoin="round" />
        {double && <path d="M7 7.2 10.2 10.8 17 3" strokeLinecap="round" strokeLinejoin="round" />}
      </svg>
    </span>
  );
}

function CatalogSendIcon({ className }: { className?: string }) {
  return (
    <span className={cn("relative inline-flex h-4 w-4 items-center justify-center", className)}>
      <svg viewBox="0 0 18 18" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-[1.55]">
        <path d="M4.2 2.8h7.2l2.4 2.4v9.4a1.4 1.4 0 0 1-1.4 1.4H4.2a1.4 1.4 0 0 1-1.4-1.4V4.2a1.4 1.4 0 0 1 1.4-1.4Z" strokeLinejoin="round" />
        <path d="M11.4 2.9v2.4h2.4" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="4.9" y="6.3" width="2.2" height="2.2" rx="0.45" className="fill-current stroke-none" />
        <path d="M8.4 6.9h3.3" strokeLinecap="round" />
        <path d="M4.9 11h6.8" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function CatalogHelpIcon({ className }: { className?: string }) {
  return (
    <span className={cn("relative inline-flex h-4 w-4 items-center justify-center", className)}>
      <CatalogSendIcon className="h-4 w-4" />
      <CircleHelp className="absolute -right-1 -top-1 h-2.5 w-2.5 stroke-[2]" />
    </span>
  );
}

function ConversationListPanel({
  journeys,
  sessions,
  messagesByConversation,
  blockedContacts,
  waitSla,
  activeFilter,
  onOpen,
  onSendCatalog,
  onTransfer,
  onOpenCart,
  onSaveNewCustomer,
  onOpenContactOptions,
}: {
  journeys: JourneyItem[];
  sessions: SessaoCatalogoResumo[] | undefined;
  messagesByConversation: Record<string, WhatsAppMessage[]>;
  blockedContacts: BlockedContact[];
  waitSla: ConversationWaitSlaSettings;
  activeFilter: FilterId;
  onOpen: (journey: JourneyItem) => void;
  onSendCatalog: (journey: JourneyItem, trigger: HTMLElement) => void;
  onTransfer: (journey: JourneyItem, trigger: HTMLElement) => void;
  onOpenCart: (journey: JourneyItem) => void;
  onSaveNewCustomer: (conversation: WhatsAppConversation, trigger: HTMLElement) => void;
  onOpenContactOptions: (
    conversation: WhatsAppConversation,
    trigger: HTMLElement,
    contextSignals: CustomerContextSignal[],
  ) => void;
}) {
  const [openChatId, setOpenChatId] = useState<string | null>(null);
  const [openAuxId, setOpenAuxId] = useState<string | null>(null);
  const [openChatActionOptionsId, setOpenChatActionOptionsId] = useState<string | null>(null);
  const [openQuickMessagesId, setOpenQuickMessagesId] = useState<string | null>(null);
  const [quickManagerId, setQuickManagerId] = useState<string | null>(null);
  const [quickMessageItems, setQuickMessageItems] = useState<QuickMessage[]>(() => loadQuickMessages());
  const [quickMessageDraft, setQuickMessageDraft] = useState<QuickMessageDraft | null>(null);
  const [expandedActionRailId, setExpandedActionRailId] = useState<string | null>(null);
  const [timerDetailId, setTimerDetailId] = useState<string | null>(null);
  const [chatAuxPlacement, setChatAuxPlacement] = useState<"top" | "bottom">("top");
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<{ chatId: string; text: string } | null>(null);
  const [chatDrafts, setChatDrafts] = useState<Record<string, string>>({});
  const [recordingChatId, setRecordingChatId] = useState<string | null>(null);
  const [recordingChatMode, setRecordingChatMode] = useState<"locked" | "hold" | null>(null);
  const [chatAudioSecondsLeft, setChatAudioSecondsLeft] = useState(120);
  const chatHoldTimeoutRef = useRef<number | null>(null);
  const chatHoldActiveRef = useRef(false);
  const chatPointerStartYRef = useRef(0);
  const chatMobilePointerRef = useRef(false);
  const actionRailIntroShownRef = useRef(false);
  const listScrollRef = useRef<HTMLDivElement | null>(null);

  const clearChatHoldTimer = () => {
    if (chatHoldTimeoutRef.current === null) return;
    window.clearTimeout(chatHoldTimeoutRef.current);
    chatHoldTimeoutRef.current = null;
  };

  const startLockedChatRecording = (journeyId: string) => {
    setOpenAuxId(null);
    setChatAudioSecondsLeft(120);
    setRecordingChatMode("locked");
    setRecordingChatId(journeyId);
  };

  const finishChatRecording = () => {
    toast.success("Áudio pronto para envio");
    setRecordingChatId(null);
    setRecordingChatMode(null);
    setChatAudioSecondsLeft(120);
    chatHoldActiveRef.current = false;
  };

  const isTouchChatPointer = (event: { pointerType: string }) =>
    event.pointerType === "touch" || event.pointerType === "pen";

  const persistQuickMessages = (nextMessages: QuickMessage[]) => {
    setQuickMessageItems(nextMessages);
    saveQuickMessages(nextMessages);
  };

  const saveQuickMessageDraft = () => {
    if (!quickMessageDraft?.title.trim() || !quickMessageDraft.text.trim()) {
      toast.info("Informe título e mensagem");
      return;
    }
    if (quickMessageDraft.kind === "pix" && !quickMessageDraft.pixKey.trim()) {
      toast.info("Informe a chave Pix");
      return;
    }

    const nextMessage: QuickMessage = {
      id: quickMessageDraft.id ?? `rapida_${Date.now()}`,
      title: quickMessageDraft.title.trim(),
      text: quickMessageDraft.text.trim(),
      kind: quickMessageDraft.kind,
      pixKey: quickMessageDraft.kind === "pix" ? quickMessageDraft.pixKey.trim() : undefined,
      pixKeyType: quickMessageDraft.kind === "pix" ? quickMessageDraft.pixKeyType : undefined,
    };
    const nextMessages = quickMessageDraft.id
      ? quickMessageItems.map((message) => (message.id === quickMessageDraft.id ? nextMessage : message))
      : [nextMessage, ...quickMessageItems];

    persistQuickMessages(nextMessages);
    setQuickMessageDraft(null);
    toast.success(quickMessageDraft.id ? "Mensagem rápida atualizada" : "Mensagem rápida criada");
  };

  useEffect(() => {
    if (!recordingChatId) return;
    if (chatAudioSecondsLeft <= 0) return;

    const timer = window.setInterval(() => {
      setChatAudioSecondsLeft((value) => Math.max(0, value - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [chatAudioSecondsLeft, recordingChatId]);

  useEffect(() => {
    return () => clearChatHoldTimer();
  }, []);

  useEffect(() => {
    if (actionRailIntroShownRef.current || journeys.length === 0 || expandedActionRailId) return;
    const firstConversation = journeys.find((journey) => journey.kind === "conversation");
    if (!firstConversation) return;

    const firstId = String(firstConversation.id);
    actionRailIntroShownRef.current = true;
    setExpandedActionRailId(firstId);
  }, [expandedActionRailId, journeys]);

  useEffect(() => {
    if (!expandedActionRailId) return;

    const timeout = window.setTimeout(() => {
      setExpandedActionRailId((value) => (value === expandedActionRailId ? null : value));
      setTimerDetailId((value) => (value === expandedActionRailId ? null : value));
    }, 7000);

    return () => window.clearTimeout(timeout);
  }, [expandedActionRailId]);

  useEffect(() => {
    if (!openAuxId && !openChatActionOptionsId && !openQuickMessagesId && !quickManagerId) return;
    const closeAuxMenu = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("[data-chat-floating-panel], [data-chat-floating-trigger]")) return;
      setOpenAuxId(null);
      setOpenChatActionOptionsId(null);
      setOpenQuickMessagesId(null);
      setQuickManagerId(null);
      setQuickMessageDraft(null);
    };
    document.addEventListener("pointerdown", closeAuxMenu);
    return () => document.removeEventListener("pointerdown", closeAuxMenu);
  }, [openAuxId, openChatActionOptionsId, openQuickMessagesId, quickManagerId]);

  useEffect(() => {
    if (!openChatId) return;

    const closeExpandedChat = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (target.closest("[data-chat-floating-panel], [data-chat-floating-trigger], [role='dialog']")) return;

      const expandedRow = document.querySelector<HTMLElement>(`[data-conversation-row-id="${CSS.escape(openChatId)}"]`);
      if (expandedRow?.contains(target)) {
        const isInteractiveArea = target.closest("[data-chat-scroll-id], [data-chat-footer-id], [data-chat-aux-root]");
        if (isInteractiveArea) return;
      }

      setOpenChatId(null);
      setSelectedMessageId(null);
      setReplyingTo(null);
      setOpenAuxId(null);
      setOpenChatActionOptionsId(null);
      setOpenQuickMessagesId(null);
      setQuickManagerId(null);
      setQuickMessageDraft(null);
    };

    document.addEventListener("pointerdown", closeExpandedChat);
    return () => document.removeEventListener("pointerdown", closeExpandedChat);
  }, [openChatId]);

  useLayoutEffect(() => {
    if (!openChatId) return;

    let firstFrame = 0;
    let secondFrame = 0;
    let settleTimer = 0;
    const alignExpandedChat = () => {
      const escapedId = CSS.escape(openChatId);
      const chatScroll = document.querySelector<HTMLElement>(`[data-chat-scroll-id="${escapedId}"]`);
      if (chatScroll) {
        const selectedActions = selectedMessageId
          ? chatScroll.querySelector<HTMLElement>(`[data-message-actions-id="${CSS.escape(selectedMessageId)}"]`)
          : null;
        if (selectedActions) {
          const actionsBottom = selectedActions.offsetTop + selectedActions.offsetHeight + 8;
          const visibleBottom = chatScroll.scrollTop + chatScroll.clientHeight;
          if (actionsBottom > visibleBottom) {
            chatScroll.scrollTop += actionsBottom - visibleBottom;
          }
        } else {
          chatScroll.scrollTop = Math.max(0, chatScroll.scrollHeight - chatScroll.clientHeight);
        }
      }

      const chatFooter = document.querySelector<HTMLElement>(`[data-chat-footer-id="${escapedId}"]`);
      const listScroll = listScrollRef.current;
      if (!chatFooter || !listScroll) return;

      const footerRect = chatFooter.getBoundingClientRect();
      const listRect = listScroll.getBoundingClientRect();
      const bottomGap = 10;
      const overflowBottom = footerRect.bottom - (listRect.bottom - bottomGap);
      if (overflowBottom > 0) {
        listScroll.scrollTop += overflowBottom;
      }
    };

    firstFrame = window.requestAnimationFrame(() => {
      alignExpandedChat();
      secondFrame = window.requestAnimationFrame(alignExpandedChat);
    });
    settleTimer = window.setTimeout(alignExpandedChat, 120);

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      window.clearTimeout(settleTimer);
    };
  }, [messagesByConversation, openChatId, selectedMessageId]);

  if (journeys.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col justify-center px-3 text-center">
        <p className="text-sm font-semibold text-current/78">Nenhuma conversa agora.</p>
        <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-current/52">
          Quando um cliente chamar, a conversa aparecerá aqui.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={listScrollRef}
      className={cn(
        "-mx-4 mt-1 min-h-0 flex-1 overflow-y-auto px-[7.8px] md:-mx-6",
        openChatId ? "pb-24" : "pb-0",
      )}
      data-rvl-scroll
    >
      {journeys.map((journey, index) => {
        const isTransfer = journey.kind === "transfer";
        const title = isTransfer ? "Repasse" : customerLabel(journey.conversation);
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
        const hasCatalogHelp = Boolean(activeSession?.ajudaSolicitada && !hasCart);
        const openChat = openChatId === String(journey.id);
        const journeyId = String(journey.id);
        const preview = conversationPreview(journey);
        const isNew = !isTransfer && isNewCustomer(journey.conversation);
        const isBlocked = !isTransfer && blockedContacts.some((contact) => contact.id === String(journey.conversation.clienteId ?? journey.conversation.telefoneNormalizado));
        const contextSignals = !isTransfer
          ? getCustomerContextSignals({ conversation: journey.conversation, session: activeSession, isBlocked })
          : [];
        const primaryContextSignal = contextSignals[0];
        const chatMessages = !isTransfer
          ? conversationThreadMessages(journey.conversation, messagesByConversation[String(journey.conversation._id)])
          : [];
        const waitProfile: WaitSlaProfileId = isTransfer ? "transfer" : hasCart ? "cart" : isNew ? "newCustomer" : "default";
        const statusTimer = getStatusTimerVisual(time, waitSla[waitProfile]);
        const chatDraft = chatDrafts[journeyId] ?? "";
        const hasChatDraft = chatDraft.trim().length > 0;
        const showInlineChatActions = !hasChatDraft || openChatActionOptionsId === journeyId;
        const actionRailExpanded = expandedActionRailId === journeyId;
        const timerDetailOpen = timerDetailId === journeyId;

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
            data-conversation-row-id={journeyId}
            className="grid grid-cols-[2.25rem_minmax(0,1fr)] items-start gap-1.5 border-b border-[#1f1f1a]/10 py-3 last:border-b-0 dark:border-[#f7f2ec]/10"
          >
            <button
              type="button"
              onClick={(event) => {
                if (!isTransfer && isNew) onSaveNewCustomer(journey.conversation, event.currentTarget);
              }}
              disabled={!isNew}
              className={cn(
                "relative mt-0.5 flex h-9 w-9 items-center justify-center rounded-full p-[2px] text-current/72",
                isNew ? "cursor-pointer" : "cursor-default",
              )}
              style={{ background: statusTimer.background }}
              aria-label={isNew ? "Salvar cliente novo" : "Origem do contato"}
            >
              <span className="flex h-full w-full items-center justify-center rounded-full bg-[#f7f7f4] dark:bg-[#151513]">
                <OriginIcon className={cn("h-[1.05rem] w-[1.05rem] stroke-[1.8]", isTransfer ? "text-current/68" : origin?.className)} />
              </span>
              {isNew && (
                <span className="absolute -left-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-sky-500 text-white ring-1 ring-[#f5f3ee] dark:ring-[#10100e]">
                  <UserPlus className="h-2.5 w-2.5 stroke-[2]" />
                </span>
              )}
              {primaryContextSignal && (
                <span
                  className={cn(
                    "absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] font-bold leading-none ring-1 ring-[#f5f3ee] dark:ring-[#10100e]",
                    customerContextBadgeClasses[primaryContextSignal.tone],
                  )}
                  title={primaryContextSignal.label}
                >
                  {primaryContextSignal.tone === "blue" ? "i" : "!"}
                </span>
              )}
            </button>
            <div className="relative min-w-0">
              <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                <button
                  type="button"
                  onClick={(event) => {
                    if (!isTransfer) {
                      onOpenContactOptions(journey.conversation, event.currentTarget, contextSignals);
                    } else {
                      onOpen(journey);
                    }
                  }}
                  className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left"
                >
                  <span className="truncate text-sm font-semibold leading-tight">{title}</span>
                  {isBlocked && <Ban className="h-3.5 w-3.5 shrink-0 text-red-600 dark:text-red-300" />}
                </button>
                <span className="relative flex min-w-[4.65rem] shrink-0 justify-end text-[10px] tabular-nums text-current/58">
                  <span
                    className={cn(
                      "flex h-6 w-fit items-center justify-end overflow-hidden rounded-full bg-[#1f1f1a]/4 px-0.5 transition-[background-color] duration-200 ease-out dark:bg-[#f7f2ec]/6",
                      actionRailExpanded && "bg-[#1f1f1a]/5 dark:bg-[#f7f2ec]/7",
                    )}
                  >
                    {hasCart && activeSession && (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onOpenCart(journey);
                        }}
                        className="inline-flex h-6 shrink-0 cursor-pointer items-center justify-center gap-0.5 rounded-full px-1 text-current/70 hover:bg-[#1f1f1a]/7 hover:text-current dark:hover:bg-[#f3c4a2]/9"
                        aria-label="Ver carrinho"
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        <span className="text-[9px] font-semibold">{activeSession.quantidadeItens ?? 0}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setExpandedActionRailId(journeyId);
                        setTimerDetailId((value) => (value === journeyId ? null : journeyId));
                      }}
                      className="inline-flex h-6 shrink-0 cursor-pointer items-center justify-center gap-0.5 rounded-full px-1 text-current/70 hover:bg-[#1f1f1a]/7 hover:text-current dark:hover:bg-[#f3c4a2]/9"
                      aria-label="Tempo total e última interação"
                    >
                      <AlarmClock className="h-3 w-3" />
                      <span>{formatElapsed(totalTime)}</span>
                      <ChevronDown className={cn("h-2.5 w-2.5 transition-transform", timerDetailOpen && "rotate-180")} />
                    </button>
                    {!isTransfer && (
                      <button
                        type="button"
                        onClick={(event) => onTransfer(journey, event.currentTarget)}
                        className="inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-current/62 hover:bg-[#1f1f1a]/7 hover:text-current dark:hover:bg-[#f3c4a2]/9"
                        aria-label="Encaminhar"
                      >
                        <Shuffle className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </span>
                  {timerDetailOpen && (
                    <span className="absolute right-0 top-7 z-10 flex items-center gap-1 rounded-xl bg-[#685c20] px-2 py-1 text-[9px] font-medium text-[#fff4e8] shadow-sm dark:bg-[#f3c4a2] dark:text-[#685c20]">
                      <Hourglass className={cn("h-3 w-3", statusTimer.expired && "animate-pulse text-red-300 dark:text-red-700")} />
                      <span>{formatElapsed(time)}</span>
                    </span>
                  )}
                </span>
              </div>
              {!openChat && (
                <div className="mt-1.5 flex w-full items-start gap-1.5 text-xs leading-snug text-current/74">
                <button
                  type="button"
                  onClick={() => {
                    if (!isTransfer) {
                      setOpenChatId((value) => (value === journeyId ? null : journeyId));
                      setOpenAuxId(null);
                      setSelectedMessageId(null);
                      setReplyingTo(null);
                    } else {
                      onOpen(journey);
                    }
                  }}
                  className="min-w-0 flex-1 cursor-pointer truncate text-left"
                  aria-label="Abrir conversa"
                >
                  {preview}
                </button>
                {!openChat && unreadCount > 0 && (
                  <span className="inline-flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 px-1 text-[8px] font-bold leading-none text-white">
                    {unreadCount}
                  </span>
                )}
                {!openChat && hasCatalogHelp && (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onSendCatalog(journey, event.currentTarget);
                    }}
                    className="inline-flex min-h-6 shrink-0 cursor-pointer items-center justify-center rounded-full px-1 text-current/70 hover:text-current"
                    aria-label="Ajuda no cardápio"
                  >
                    <CatalogHelpIcon className="h-3.5 w-3.5" />
                  </button>
                )}
                </div>
              )}
              {!isTransfer && openChat && chatMessages.length > 0 && (
                <div className="-ml-[2.625rem] mr-0 mt-3 max-h-[42svh] space-y-1 overflow-y-auto overscroll-contain px-0 py-1 text-xs leading-snug text-current/76" data-chat-scroll-id={journeyId} data-rvl-scroll>
                  {chatMessages.map((message) => {
                    const selectedMessage = selectedMessageId === String(message._id);
                    const fromAgent = message.direcao === "saida";

                    return (
                      <div key={message._id} className={cn("flex", fromAgent ? "justify-end" : "justify-start")}>
                        <div
                          className={cn(
                            "w-fit max-w-[82%] rounded-2xl px-2.5 py-1.5",
                            fromAgent ? "bg-[#685c20]/10 text-current/82 dark:bg-[#f3c4a2]/10" : "bg-white/45 text-current/82 dark:bg-[#1f1f1a]/70",
                            selectedMessage && "ring-1 ring-sky-500/35",
                          )}
                        >
                        <button
                          type="button"
                          onClick={() => setSelectedMessageId((value) => (value === String(message._id) ? null : String(message._id)))}
                          className={cn(
                            "cursor-pointer text-left",
                            "text-current/84",
                          )}
                          aria-label="Selecionar mensagem"
                        >
                          {message.texto}
                        </button>
                        <span className="mt-0.5 flex items-center justify-end gap-1 text-[9px] tabular-nums text-current/45">
                            <span>{formatTime(message.timestamp)}</span>
                          {fromAgent && <MessageStatusChecks status={message.status} />}
                        </span>
                        {selectedMessage && (
                          <div data-message-actions-id={String(message._id)} className="mt-1 flex items-center justify-end gap-1 text-[10px] text-current/72">
                            <button
                              type="button"
                              onClick={() => toast.success("Mensagem marcada")}
                              className="inline-flex cursor-pointer items-center gap-1 rounded-full px-1.5 py-1 hover:bg-[#1f1f1a]/7 dark:hover:bg-[#f7f2ec]/8"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              Marcar
                            </button>
                            <button
                              type="button"
                              onClick={() => setReplyingTo({ chatId: journeyId, text: message.texto ?? "Mensagem" })}
                              className="inline-flex cursor-pointer items-center gap-1 rounded-full px-1.5 py-1 hover:bg-[#1f1f1a]/7 dark:hover:bg-[#f7f2ec]/8"
                            >
                              <Reply className="h-3 w-3" />
                              Responder
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (canDeleteForEveryone(message)) {
                                  toast.success("Exclusão para todos preparada");
                                  return;
                                }
                                toast.info("Excluir para todos depende do prazo configurado do WhatsApp");
                              }}
                              className="inline-flex cursor-pointer items-center gap-1 rounded-full px-1.5 py-1 hover:bg-[#1f1f1a]/7 dark:hover:bg-[#f7f2ec]/8"
                            >
                              <Trash2 className="h-3 w-3" />
                              Excluir
                            </button>
                          </div>
                        )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {!isTransfer && openChat && replyingTo?.chatId === journeyId && (
                <div data-chat-aux-root className="-ml-[2.625rem] mr-0 mt-2 flex items-center gap-2 rounded-2xl bg-sky-500/10 px-2 py-1.5 text-xs text-current/72">
                  <Reply className="h-3.5 w-3.5 shrink-0 text-sky-600" />
                  <span className="min-w-0 flex-1 truncate">{replyingTo.text}</span>
                  <button
                    type="button"
                    onClick={() => setReplyingTo(null)}
                    className="cursor-pointer rounded-full p-1 text-current/52 hover:text-current"
                    aria-label="Cancelar resposta"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {!isTransfer && openChat && (
                <div data-chat-aux-root data-chat-footer-id={journeyId} className="-ml-[2.625rem] mr-0 mt-2 flex min-w-0 items-center gap-px">
                  <div className="flex min-h-9 min-w-0 flex-1 items-center gap-0.5 rounded-2xl bg-[#e8e7df] px-1.5 py-1 dark:bg-[#24241f] dark:ring-1 dark:ring-[#f7f2ec]/6">
                    <span data-chat-floating-trigger className="relative flex h-7 w-7 shrink-0 items-center justify-center">
                      <button
                        type="button"
                        onClick={(event) => {
                          const rect = event.currentTarget.getBoundingClientRect();
                          const availableAbove = rect.top;
                          const availableBelow = window.innerHeight - rect.bottom;
                          setOpenChatActionOptionsId(null);
                          setOpenQuickMessagesId(null);
                          setChatAuxPlacement(availableAbove >= 150 || availableAbove > availableBelow ? "top" : "bottom");
                          setOpenAuxId((value) => (value === String(journey.id) ? null : String(journey.id)));
                        }}
                        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full p-0 text-sm leading-none text-current/66 hover:text-current"
                        aria-label="Mais ações"
                      >
                        +
                      </button>
                      {openAuxId === String(journey.id) && (
                        <div
                          data-chat-aux-root
                          data-chat-floating-panel
                          className={cn(
                            "absolute left-0 z-20 grid w-36 grid-cols-2 gap-0.5 rounded-2xl bg-[#685c20] p-1.5 text-[#fff4e8] dark:bg-[#f3c4a2] dark:text-[#685c20]",
                            chatAuxPlacement === "top" ? "bottom-full mb-0.5" : "top-full mt-0.5",
                          )}
                        >
                          {["Documento", "Câmera", "Mídia", "Áudio", "Contato", "Mensagens rápidas"].map((label) => (
                            <button
                              key={label}
                              type="button"
                              onClick={() => {
                                if (label === "Mensagens rápidas") {
                                  setOpenAuxId(null);
                                  setOpenQuickMessagesId(journeyId);
                                  return;
                                }
                                toast.info(`${label} - em breve`);
                              }}
                              className="cursor-pointer rounded-xl px-1.5 py-1 text-left text-[9.5px] font-medium leading-tight hover:bg-white/10 dark:hover:bg-[#685c20]/8"
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      )}
                      {openQuickMessagesId === journeyId && (
                        <div
                          data-chat-aux-root
                          data-chat-floating-panel
                          className={cn(
                            "absolute left-0 z-20 max-h-52 w-56 overflow-y-auto overscroll-contain rounded-2xl bg-[#685c20] p-2 text-[#fff4e8] [scrollbar-width:thin] dark:bg-[#f3c4a2] dark:text-[#685c20]",
                            chatAuxPlacement === "top" ? "bottom-full mb-0.5" : "top-full mt-0.5",
                          )}
                        >
                          <div className="mb-1.5 flex items-center justify-between px-2 py-0.5">
                            <span className="text-[9px] font-semibold uppercase tracking-[0.08em] text-current/58">
                              {quickManagerId === journeyId ? "Gerenciar" : "Rápidas"}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setQuickManagerId((value) => (value === journeyId ? null : journeyId));
                                setQuickMessageDraft(null);
                              }}
                              className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full text-current/62 hover:bg-white/10 hover:text-current dark:hover:bg-[#685c20]/8"
                              aria-label="Configurar mensagens rápidas"
                            >
                              <MoreVertical className="h-3.5 w-3.5 stroke-[1.8]" />
                            </button>
                          </div>
                          {quickManagerId === journeyId ? (
                            quickMessageDraft ? (
                              <div className="space-y-1">
                                <div className="grid grid-cols-2 gap-1 rounded-xl bg-white/8 p-0.5 text-[9.5px] font-semibold dark:bg-[#685c20]/8">
                                  {(["text", "pix"] as const).map((kind) => (
                                    <button
                                      key={kind}
                                      type="button"
                                      onClick={() =>
                                        setQuickMessageDraft((draft) => (draft ? { ...draft, kind } : draft))
                                      }
                                      className={cn(
                                        "cursor-pointer rounded-lg px-2 py-1 transition-colors",
                                        quickMessageDraft.kind === kind
                                          ? "bg-white/18 text-current dark:bg-[#685c20]/14"
                                          : "text-current/58 hover:text-current",
                                      )}
                                    >
                                      {kind === "pix" ? "Pix" : "Texto"}
                                    </button>
                                  ))}
                                </div>
                                <input
                                  value={quickMessageDraft.title}
                                  onChange={(event) =>
                                    setQuickMessageDraft((draft) => (draft ? { ...draft, title: event.target.value } : draft))
                                  }
                                  placeholder="Título"
                                  className="h-7 w-full rounded-xl bg-white/10 px-2 text-[10px] font-semibold text-current placeholder:text-current/42 outline-none dark:bg-[#685c20]/8"
                                />
                                <textarea
                                  value={quickMessageDraft.text}
                                  onChange={(event) =>
                                    setQuickMessageDraft((draft) => (draft ? { ...draft, text: event.target.value } : draft))
                                  }
                                  placeholder={
                                    quickMessageDraft.kind === "pix"
                                      ? "Texto antes da chave Pix."
                                      : "Mensagem. Use {cliente} se quiser."
                                  }
                                  rows={3}
                                  className="max-h-20 min-h-14 w-full resize-none overflow-hidden rounded-xl bg-white/10 px-2 py-1.5 text-[10px] leading-snug text-current placeholder:text-current/42 outline-none dark:bg-[#685c20]/8"
                                />
                                {quickMessageDraft.kind === "pix" && (
                                  <div className="grid grid-cols-[minmax(0,1fr)_4.7rem] gap-1">
                                    <input
                                      value={quickMessageDraft.pixKey}
                                      onChange={(event) =>
                                        setQuickMessageDraft((draft) =>
                                          draft ? { ...draft, pixKey: event.target.value } : draft,
                                        )
                                      }
                                      placeholder="Chave Pix"
                                      className="h-7 min-w-0 rounded-xl bg-white/10 px-2 text-[10px] font-semibold text-current placeholder:text-current/42 outline-none dark:bg-[#685c20]/8"
                                    />
                                    <select
                                      value={quickMessageDraft.pixKeyType}
                                      onChange={(event) =>
                                        setQuickMessageDraft((draft) =>
                                          draft
                                            ? {
                                                ...draft,
                                                pixKeyType: event.target.value as QuickMessageDraft["pixKeyType"],
                                              }
                                            : draft,
                                        )
                                      }
                                      className="h-7 cursor-pointer rounded-xl bg-white/10 px-1.5 text-[9.5px] font-semibold text-current outline-none dark:bg-[#685c20]/8"
                                    >
                                      <option value="phone">Telefone</option>
                                      <option value="cpf_cnpj">CPF/CNPJ</option>
                                      <option value="email">E-mail</option>
                                      <option value="random">Aleatória</option>
                                    </select>
                                  </div>
                                )}
                                <div className="grid grid-cols-2 gap-1">
                                  <button
                                    type="button"
                                    onClick={() => setQuickMessageDraft(null)}
                                    className="cursor-pointer rounded-xl bg-white/8 px-2 py-1 text-[10px] font-medium dark:bg-[#685c20]/8"
                                  >
                                    Cancelar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={saveQuickMessageDraft}
                                    className="cursor-pointer rounded-xl bg-white/18 px-2 py-1 text-[10px] font-semibold dark:bg-[#685c20]/14"
                                  >
                                    Salvar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-0.5">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setQuickMessageDraft({
                                      id: null,
                                      title: "",
                                      text: "",
                                      kind: "text",
                                      pixKey: "",
                                      pixKeyType: "phone",
                                    })
                                  }
                                  className="mb-1 flex w-full cursor-pointer items-center justify-between rounded-xl bg-white/10 px-1.5 py-1.5 text-left text-[10px] font-semibold dark:bg-[#685c20]/8"
                                >
                                  <span>Nova mensagem</span>
                                  <span className="text-sm leading-none">+</span>
                                </button>
                                {quickMessageItems.map((message) => (
                                  <div
                                    key={message.id}
                                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-1 rounded-xl px-1.5 py-1 hover:bg-white/10 dark:hover:bg-[#685c20]/8"
                                  >
                                    <div className="min-w-0">
                                      <span className="flex min-w-0 items-center gap-1 text-[10px] font-semibold leading-tight">
                                        <span className="truncate">{message.title}</span>
                                        {message.kind === "pix" && (
                                          <span className="shrink-0 rounded-full bg-white/12 px-1 text-[7.5px] uppercase tracking-[0.08em] text-current/62 dark:bg-[#685c20]/10">
                                            Pix
                                          </span>
                                        )}
                                      </span>
                                      <span className="mt-0.5 block truncate text-[8.5px] leading-tight text-current/62">
                                        {message.kind === "pix" ? message.pixKey : message.text}
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setQuickMessageDraft({
                                          id: message.id,
                                          title: message.title,
                                          text: message.text,
                                          kind: message.kind ?? "text",
                                          pixKey: message.pixKey ?? "",
                                          pixKeyType: message.pixKeyType ?? "phone",
                                        })
                                      }
                                      className="cursor-pointer rounded-full px-1.5 py-1 text-[9px] font-semibold text-current/68 hover:bg-white/10 hover:text-current dark:hover:bg-[#685c20]/8"
                                    >
                                      Editar
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )
                          ) : (
                            <div className="space-y-0.5">
                              {quickMessageItems.map((message) => (
                                <button
                                  key={message.id}
                                  type="button"
                                  onClick={() => {
                                    setChatDrafts((drafts) => ({
                                      ...drafts,
                                      [journeyId]: quickMessageToDraftText(message, title),
                                    }));
                                    setOpenQuickMessagesId(null);
                                    setOpenAuxId(null);
                                    setOpenChatActionOptionsId(null);
                                    toast.success("Mensagem rápida inserida");
                                  }}
                                  className="block min-h-10 w-full cursor-pointer rounded-xl px-2.5 py-1.5 text-left hover:bg-white/10 dark:hover:bg-[#685c20]/8"
                                >
                                  <span className="block text-[10px] font-semibold leading-snug">{message.title}</span>
                                  <span className="mt-0.5 block overflow-hidden text-[8.5px] leading-snug text-current/68 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                                    {quickMessageToDraftText(message, title)}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </span>
                    <textarea
                      aria-label="Responder cliente"
                      placeholder="Mensagem"
                      rows={1}
                      value={chatDraft}
                      onChange={(event) => {
                        const nextValue = event.target.value;
                        setChatDrafts((drafts) => ({ ...drafts, [journeyId]: nextValue }));
                        if (nextValue.trim().length === 0) setOpenChatActionOptionsId(null);
                        setOpenQuickMessagesId(null);
                      }}
                      onInput={(event) => {
                        const field = event.currentTarget;
                        const nextValue = field.value;
                        setChatDrafts((drafts) => ({ ...drafts, [journeyId]: nextValue }));
                        if (nextValue.trim().length === 0) setOpenChatActionOptionsId(null);
                        setOpenQuickMessagesId(null);
                        field.style.height = "auto";
                        field.style.height = `${Math.min(field.scrollHeight, 72)}px`;
                      }}
                      className="max-h-[4.5rem] min-h-[1.5rem] min-w-0 flex-1 resize-none overflow-hidden bg-transparent py-1 text-xs leading-5 text-current placeholder:text-current/50 focus:outline-none"
                    />
                    {!showInlineChatActions ? (
                      <span data-chat-floating-trigger className="relative flex h-7 w-4 shrink-0 items-center justify-center">
                        <button
                          type="button"
                          onClick={() => {
                            setOpenAuxId(null);
                            setOpenChatActionOptionsId(journeyId);
                          }}
                          className="flex h-7 w-4 cursor-pointer items-center justify-center rounded-full p-0 text-current/58 hover:text-current"
                          aria-label="Abrir opções do chat"
                        >
                          <span className="flex h-4 w-2 items-center justify-center gap-px">
                            <span className="block h-3 w-px rounded-full bg-current/75" />
                            <span className="block h-3 w-px rounded-full bg-current/55" />
                          </span>
                        </button>
                      </span>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={(event) => onSendCatalog(journey, event.currentTarget)}
                          className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full p-0 text-current/66 hover:text-current"
                          aria-label={hasCatalogHelp ? "Ajuda no cardápio" : "Enviar cardápio"}
                        >
                          {hasCatalogHelp ? <CatalogHelpIcon className="h-3.5 w-3.5" /> : <CatalogSendIcon className="h-3.5 w-3.5" />}
                        </button>
                      </>
                    )}
                  </div>
                  {hasChatDraft ? (
                    <button
                      type="button"
                      onClick={() => {
                        toast.success("Mensagem pronta para envio");
                        setChatDrafts((drafts) => ({ ...drafts, [journeyId]: "" }));
                        setOpenChatActionOptionsId(null);
                      }}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#685c20] p-0 text-[#fff4e8] transition-colors hover:bg-[#685c20]/90 dark:bg-[#f3c4a2] dark:text-[#1f1f1a]"
                      aria-label="Enviar mensagem"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onPointerDown={(event) => {
                        event.currentTarget.setPointerCapture(event.pointerId);
                        setOpenAuxId(null);
                        chatHoldActiveRef.current = false;
                        chatPointerStartYRef.current = event.clientY;
                        chatMobilePointerRef.current = isTouchChatPointer(event);
                        clearChatHoldTimer();
                        if (chatMobilePointerRef.current) {
                          chatHoldActiveRef.current = true;
                          setChatAudioSecondsLeft(120);
                          setRecordingChatMode("hold");
                          setRecordingChatId(journeyId);
                          return;
                        }
                        chatHoldTimeoutRef.current = window.setTimeout(() => {
                          chatHoldActiveRef.current = true;
                          setChatAudioSecondsLeft(120);
                          setRecordingChatMode("hold");
                          setRecordingChatId(journeyId);
                        }, 350);
                      }}
                      onPointerMove={(event) => {
                        if (!chatMobilePointerRef.current || !chatHoldActiveRef.current) return;
                        if (chatPointerStartYRef.current - event.clientY < 44) return;
                        chatHoldActiveRef.current = false;
                        setRecordingChatMode("locked");
                      }}
                      onPointerUp={(event) => {
                        event.currentTarget.releasePointerCapture(event.pointerId);
                        clearChatHoldTimer();
                        if (chatHoldActiveRef.current) {
                          finishChatRecording();
                          return;
                        }
                        if (chatMobilePointerRef.current) return;
                        startLockedChatRecording(journeyId);
                      }}
                      onPointerCancel={() => {
                        clearChatHoldTimer();
                        chatHoldActiveRef.current = false;
                        setRecordingChatId(null);
                        setRecordingChatMode(null);
                        setChatAudioSecondsLeft(120);
                      }}
                      className={cn(
                        "flex h-7 w-7 shrink-0 touch-none select-none items-center justify-center rounded-full bg-[#e8e7df] p-0 text-current/66 transition-colors hover:text-current active:bg-current/14 active:text-current dark:bg-[#24241f] dark:ring-1 dark:ring-[#f7f2ec]/6",
                        recordingChatId === journeyId && "bg-current/12 text-current ring-1 ring-current/12",
                      )}
                      aria-label="Gravar áudio"
                      onContextMenu={(event) => event.preventDefault()}
                    >
                      <Mic className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              )}
              {!isTransfer && openChat && recordingChatId === journeyId && (
                <div data-chat-aux-root className="-ml-[2.625rem] mt-2 rounded-2xl bg-[#e8e7df] px-2 py-1.5 text-current ring-1 ring-current/10 dark:bg-[#24241f] dark:ring-[#f7f2ec]/8">
                  <div className="flex items-center justify-between gap-2 text-[10px] font-semibold">
                    <span className="inline-flex items-center gap-1">
                      <Mic className="h-3.5 w-3.5" />
                      {recordingChatMode === "hold" ? "Solte para enviar" : "Gravando áudio"}
                    </span>
                    <span>{formatAudioCountdown(chatAudioSecondsLeft)}</span>
                  </div>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-current/12">
                    <div
                      className="h-full rounded-full bg-current/55 transition-[width] duration-300"
                      style={{ width: `${Math.max(0, (chatAudioSecondsLeft / 120) * 100)}%` }}
                    />
                  </div>
                  {recordingChatMode === "locked" && (
                    <div className="mt-2 grid grid-cols-2 gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setRecordingChatId(null);
                          setRecordingChatMode(null);
                          setChatAudioSecondsLeft(120);
                        }}
                        className="cursor-pointer rounded-xl bg-current/7 px-2 py-1 text-[10px] font-medium"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={finishChatRecording}
                        className="cursor-pointer rounded-xl bg-current px-2 py-1 text-[10px] font-semibold text-[#f7f2ec] dark:text-[#1f1f1a]"
                      >
                        Enviar áudio
                      </button>
                    </div>
                  )}
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
                <p className="text-sm">{session.quantidadeItens ?? 0} itens · {formatBRL(session.valorEstimado)}</p>
              </div>
            )}
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-current/44">Histórico</p>
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
    { id: "clientes", label: "Clientes", icon: ContactRound },
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
        <p className="mt-1 text-xs text-current/48">Use Comunicação Agora para alternar os filtros.</p>
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
          Memória do Cliente
        </p>
        <button
          type="button"
          onClick={onOpen}
          className="shrink-0 cursor-pointer text-[9.5px] font-medium text-current/74 underline-offset-4 hover:underline"
        >
          Ver Memória
        </button>
      </div>
      <div className="grid grid-cols-2 gap-1.5 text-[9.5px] leading-tight text-current/68">
        <p>
          <span className="block text-current/46">Cliente recorrente</span>
          {summary.recurrence}
        </p>
        <p>
          <span className="block text-current/46">última compra</span>
          {summary.lastPurchase}
        </p>
        <p>
          <span className="block text-current/46">Preferência</span>
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
          Carrinho do Cardápio
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
              <span className="block text-current/46">última interação</span>
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
        <p className="text-xs text-current/62">Nenhuma sessão ativa vinculada.</p>
      )}
    </div>
  );
}

type FocusIndicatorId = "promocoes" | "restricoes" | "conta" | "memoria" | "catalogo";

const focusIndicatorLabels: Record<FocusIndicatorId, string> = {
  promocoes: "Promoção",
  restricoes: "Restrição",
  conta: "Conta",
  memoria: "Memória",
  catalogo: "Cardápio",
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
              Memória do Cliente
            </p>
            <h2 className="truncate text-base font-semibold">{customerLabel(conversation)}</h2>
            <p className="text-xs text-current/62">{channelLabel(conversation)} ? contexto permanente</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full p-1.5 text-current/70 transition-colors hover:text-current"
            aria-label="Fechar memória do cliente"
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
                      {formatTime(message.timestamp)} · {message.direcao === "entrada" ? "Cliente" : "Atendimento"}
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
                Pedido {linkedOrder.numero ? `#${linkedOrder.numero}` : "vinculado"} · {linkedOrder.status ?? "status aberto"} ·{" "}
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
                    {item.quantidade ?? 1}x {item.nomeSnapshot ?? "Item"} · {formatBRL(item.subtotal)}
                  </p>
                ))}
              </div>
            ) : (
              <p>Histórico consolidado de produtos preparado para etapa futura.</p>
            )}
          </MemorySection>

          <MemorySection icon={Tag} title="Promoções">
            <p>Consulta preparada para campanhas e ofertas aplicáveis ao cliente.</p>
          </MemorySection>

          <MemorySection icon={Banknote} title="Contas">
            <p>{linkedOrder && linkedOrder.status !== "entregue" ? "Conta pendente nesta jornada." : "Sem pendência financeira visível nesta jornada."}</p>
          </MemorySection>

          <MemorySection icon={Heart} title="Preferências">
            <p>
              {firstItems[0]?.nomeSnapshot
                ? `Último item em destaque: ${firstItems[0].nomeSnapshot}.`
                : "Preferências serão projetadas a partir de compras e sessões recorrentes."}
            </p>
          </MemorySection>

          <MemorySection icon={CircleHelp} title="Ocorrências">
            {occurrences.length > 0 ? (
              <p>{occurrences.length} atendimento(s) com prioridade importante/crítica.</p>
            ) : (
              <p>Nenhuma ocorrência crítica registrada para este telefone.</p>
            )}
          </MemorySection>

          <MemorySection icon={CalendarDays} title="Encomendas">
            <p>Espaço preparado para encomendas futuras vinculadas ao cliente.</p>
          </MemorySection>

          <MemorySection icon={BookOpen} title="Cardápio">
            {recentSessions.length > 0 ? (
              <div className="space-y-1">
                {recentSessions.map((session) => (
                  <p key={session._id}>
                    {session.status} · {session.quantidadeItens ?? 0} itens · {formatBRL(session.valorEstimado)}
                  </p>
                ))}
              </div>
            ) : (
              <p>Nenhuma sessão de cardápio encontrada para este telefone.</p>
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
          Assim que uma nova jornada chegar ou você assumir uma existente, ela aparecerá aqui.
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
              {journey.transfer.dePerfil} · {journey.transfer.paraPerfil}
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
                <p className="font-medium text-current/86">Promoção</p>
                <p className="mt-0.5 text-current/62">Há uma oferta aplicável para esta jornada.</p>
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
                <p className="font-medium text-current/86">Restrição</p>
                <p className="mt-0.5 text-current/62">
                  {conversation.prioridade === "critical"
                    ? "Atendimento crítico. Acione o gerente se precisar de apoio."
                    : "Atenção nesta jornada antes de confirmar o pedido."}
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
                    ? "Existe pendência. Pagamento pertence ao Caixa."
                    : "Conta consultável, sem pendência visível."}
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
                  <p className="font-medium text-current/86">Memória</p>
                  <p className="mt-0.5 text-current/62">
                    {fallbackMemory.recurrence} · última compra: {fallbackMemory.lastPurchase}
                  </p>
                  <p className="mt-0.5 text-current/62">Preferência: {fallbackMemory.preference}</p>
                </div>
                <button
                  type="button"
                  onClick={onOpenMemory}
                  className="shrink-0 cursor-pointer rounded-full bg-[#685c20]/10 px-2.5 py-1 text-[10px] font-medium text-current/78 dark:bg-[#f3c4a2]/10"
                >
                  Ver memória
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
                    <p className="font-medium text-current/86">Cardápio</p>
                    <p className="mt-0.5 text-current/62">
                      {session.status} · {formatBRL(session.valorEstimado)}
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
            {channelLabel(conversation)} · {statusLabels[conversation.status]}
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
          Próxima Ação
        </p>
        <p className="mt-2 text-sm text-current/68">Aguardando seleção de jornada.</p>
      </section>
    );
  }

  if (journey.kind === "transfer") {
    return (
      <section className="rounded-2xl bg-white p-3 text-[#685c20] dark:bg-[#151513] dark:text-[#f3c4a2]">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-current/58">
          Próxima Ação
        </p>
        <button
          type="button"
          onClick={() => toast.info("Aceite de repasse será ativado na próxima etapa")}
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
    if (action.kind === "track") toast.info("Acompanhamento do pedido será aberto pela jornada");
    if (action.kind === "catalog") toast.info("Envio de cardápio será conectado na próxima etapa");
  };

  return (
    <section className="rounded-2xl bg-white p-2.5 text-[#685c20] dark:bg-[#151513] dark:text-[#f3c4a2]">
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-current/58">
        Próxima Ação
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
          onClick={() => toast.info("Repasse contextual será concluída na próxima etapa")}
          className="cursor-pointer rounded-full bg-[#685c20]/8 px-2.5 py-1 font-medium text-current/72 dark:bg-[#f7f2ec]/8"
        >
          Encaminhar
        </button>
      </div>

      {messages && messages.length > 0 && (
        <p className="mt-1 line-clamp-1 text-[10px] text-current/52">
          última mensagem às {formatTime(messages[messages.length - 1]?.timestamp)}
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

  const hasRealConversations = (conversations?.length ?? 0) > 0;
  const hasRealTransfers = (transferencias?.length ?? 0) > 0;
  const demoMode = !hasRealConversations;
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
  const effectiveTransfers = demoMode && !hasRealTransfers ? [demoTransferReceived, demoTransferSent] : transferencias;

  const [activeTab, setActiveTab] = useState<AtendimentoTab>("conversas");
  const [filter, setFilter] = useState<FilterId>("humano");
  const [selected, setSelected] = useState<{ kind: JourneyKind; id: string } | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [reportPanelOpen, setReportPanelOpen] = useState(false);
  const [slaSettingsPanelOpen, setSlaSettingsPanelOpen] = useState(false);
  const [catalogConfirm, setCatalogConfirm] = useState<CatalogConfirmState>(null);
  const [transferPanel, setTransferPanel] = useState<TransferPanelState>(null);
  const [cartPanel, setCartPanel] = useState<CartPanelState>(null);
  const [saveCustomerPanel, setSaveCustomerPanel] = useState<SaveCustomerPanelState>(null);
  const [contactOptionsPanel, setContactOptionsPanel] = useState<ContactOptionsPanelState>(null);
  const [blockedContactsPanelOpen, setBlockedContactsPanelOpen] = useState(false);
  const [blockedContacts, setBlockedContacts] = useState<BlockedContact[]>(() => loadBlockedContacts(operator.operatorId));
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

  const blockContact = (conversation: WhatsAppConversation) => {
    const id = String(conversation.clienteId ?? conversation.telefoneNormalizado);
    const nextContact: BlockedContact = {
      id,
      name: customerLabel(conversation),
      phone: conversation.clienteTelefoneSnapshot,
      blockedAt: new Date().toISOString(),
    };
    const next = [nextContact, ...blockedContacts.filter((contact) => contact.id !== id)];
    setBlockedContacts(next);
    saveBlockedContacts(operator.operatorId, next);
    toast.success("Contato bloqueado");
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
  const listMessagesByConversation = useMemo<Record<string, WhatsAppMessage[]>>(() => {
    if (demoMode) return demoListMessagesByConversation;
    if (!selectedConversation || !effectiveMessages) return {};
    return { [String(selectedConversation._id)]: effectiveMessages };
  }, [demoMode, selectedConversation, effectiveMessages]);

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
      toast.info("Cenário demonstrativo: conversa já está sob atendimento");
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
      toast.success("Cenário demonstrativo marcado como lido");
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
    toast.info("Cardápio preparado para abrir em etapa futura");
  };

  const handleSendCatalog = () => {
    toast.info("Envio manual do cardápio preparado para conexão com canal real");
  };

  const handleClaimCatalog = async (session: SessaoCatalogoResumo) => {
    if (!operadorConvex) return;
    if (selectedIsDemo) {
      toast.success("Carrinho demonstrativo assumido");
      return;
    }
    try {
      await assumirSessaoCatalogo({ sessaoId: session._id, operadorId: operadorConvex._id });
      toast.success("Carrinho do cardápio assumido");
    } catch {
      toast.error("Erro ao avocar sessão");
    }
  };

  const handleConvertCatalog = (session: SessaoCatalogoResumo) => {
    if (session.pedidoId) {
      toast.info("Carrinho já possui pedido vinculado");
      return;
    }
    toast.info("Pedido deve nascer por confirmação explícita do atendente");
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
            <ContactRound className="h-[1.1rem] w-[1.1rem] stroke-[1.7]" />
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
              if (label === "Agenda") setActiveTab("agenda");
              else if (label === "Relatórios") setReportPanelOpen(true);
              else if (label === "Contatos bloqueados" || label === "Bloqueados") setBlockedContactsPanelOpen(true);
              else if (label.toLowerCase().includes("conversa")) setSlaSettingsPanelOpen(true);
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
                messagesByConversation={listMessagesByConversation}
                blockedContacts={blockedContacts}
                waitSla={preferences.waitSla}
                activeFilter={filter}
                onOpen={(journey) => {
                  setSelected({ kind: journey.kind, id: journey.id });
                  setDetailOpen(true);
                }}
                onSendCatalog={(journey, trigger) => {
                  if (journey.kind !== "conversation") return;
                  const rect = trigger.getBoundingClientRect();
                  setCatalogConfirm({
                    customerName: customerLabel(journey.conversation),
                    anchorRect: {
                      left: rect.left,
                      right: rect.right,
                      top: rect.top,
                      bottom: rect.bottom,
                    },
                  });
                }}
                onTransfer={(journey, trigger) => {
                  const rect = trigger.getBoundingClientRect();
                  setTransferPanel({
                    customerName: journey.kind === "conversation" ? customerLabel(journey.conversation) : "Repasse",
                    anchorRect: {
                      left: rect.left,
                      right: rect.right,
                      top: rect.top,
                      bottom: rect.bottom,
                    },
                  });
                }}
                onOpenCart={(journey) => {
                  if (journey.kind !== "conversation") return;
                  const session =
                    effectiveCatalogSessions?.find((item) => item.conversaWhatsAppId === journey.conversation._id) ??
                    effectiveCatalogSessions?.[0];
                  if (session) setCartPanel({ customerName: customerLabel(journey.conversation), session });
                }}
                onSaveNewCustomer={(conversation, trigger) => {
                  const rect = trigger.getBoundingClientRect();
                  setSaveCustomerPanel({
                    conversation,
                    anchorRect: {
                      left: rect.left,
                      right: rect.right,
                      top: rect.top,
                      bottom: rect.bottom,
                    },
                  });
                }}
                onOpenContactOptions={(conversation, trigger, contextSignals) => {
                  const rect = trigger.getBoundingClientRect();
                  setContactOptionsPanel({
                    conversation,
                    contextSignals,
                    anchorRect: {
                      left: rect.left,
                      right: rect.right,
                      top: rect.top,
                      bottom: rect.bottom,
                    },
                  });
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
                toast.info("Pedido deve nascer por confirmação explícita do atendente");
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
                description="Pedidos do atendimento aparecerão aqui quando estiverem vinculados."
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
                description="Clientes do atendimento aparecerão aqui conforme as conversas forem identificadas."
              />
              <section className="mx-1 mt-2 rounded-2xl bg-[#1f1f1a]/5 px-3 py-2 text-xs text-current/74 dark:bg-[#f7f2ec]/7">
                <button
                  type="button"
                  onClick={() => setBlockedContactsPanelOpen(true)}
                  className="flex w-full cursor-pointer items-center justify-between text-left"
                >
                  <span className="inline-flex items-center gap-2">
                    <Ban className="h-3.5 w-3.5 text-red-600 dark:text-red-300" />
                    Bloqueados
                  </span>
                  <span className="font-semibold">{blockedContacts.length}</span>
                </button>
              </section>
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
                description="Compromissos do atendimento aparecerão aqui."
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
                toast.info("Pedido deve nascer por confirmação explícita do atendente");
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
          <span>Central em homologação · atendimento sem integração real de canais.</span>
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
      <ConversationSlaSettingsPanel
        open={slaSettingsPanelOpen}
        settings={preferences.waitSla}
        onChange={(waitSla) => updatePreferences({ waitSla: normalizeWaitSlaSettings(waitSla) })}
        onClose={() => setSlaSettingsPanelOpen(false)}
      />
      <CatalogConfirmPanel
        confirm={catalogConfirm}
        onCancel={() => setCatalogConfirm(null)}
        onConfirm={() => {
          handleSendCatalog();
          setCatalogConfirm(null);
        }}
      />
      <TransferPanel transfer={transferPanel} onClose={() => setTransferPanel(null)} />
      <CartPanel cart={cartPanel} onClose={() => setCartPanel(null)} />
      <SaveCustomerPanel state={saveCustomerPanel} onClose={() => setSaveCustomerPanel(null)} />
      <ContactOptionsPanel
        state={contactOptionsPanel}
        isBlocked={Boolean(
          contactOptionsPanel &&
            blockedContacts.some(
              (contact) =>
                contact.id === String(contactOptionsPanel.conversation.clienteId ?? contactOptionsPanel.conversation.telefoneNormalizado),
            ),
        )}
        onClose={() => setContactOptionsPanel(null)}
        onSave={(conversation, trigger) => {
          const rect = trigger.getBoundingClientRect();
          setSaveCustomerPanel({
            conversation,
            anchorRect: {
              left: rect.left,
              right: rect.right,
              top: rect.top,
              bottom: rect.bottom,
            },
          });
        }}
        onBlock={blockContact}
        onShowBlocked={() => setBlockedContactsPanelOpen(true)}
      />
      {blockedContactsPanelOpen && (
        <BlockedContactsPanel
          contacts={blockedContacts}
          onClose={() => setBlockedContactsPanelOpen(false)}
        />
      )}
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
