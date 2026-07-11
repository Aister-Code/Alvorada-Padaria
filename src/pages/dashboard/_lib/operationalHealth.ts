import { Activity, CalendarDays, Database, MessageCircle, Printer, ReceiptText, RefreshCw, ShoppingCart, Wifi, type LucideIcon } from "lucide-react";

export type HealthStatus = "online" | "warning" | "offline" | "pending";
export type HealthSourceKind = "channel" | "hardware" | "api" | "module" | "queue";

export type HealthItem = {
  id: string;
  label: string;
  kind: HealthSourceKind;
  status: HealthStatus;
  weight: number;
  visibleFor: string[];
  icon: LucideIcon;
  connected: boolean;
  impact: string;
};

export type HealthLevel = "green" | "yellow" | "orange" | "red";

const statusScore: Record<HealthStatus, number> = {
  online: 100,
  pending: 95,
  warning: 70,
  offline: 35,
};

export type OperationalHealthInventoryInput = {
  role: string;
  connectedChannels?: string[];
  connectedHardware?: string[];
  connectedApis?: string[];
  enabledModules?: string[];
  activeQueues?: string[];
};

export function buildOperationalHealthInventory({
  connectedChannels = ["whatsapp", "catalogo"],
  connectedHardware = ["printer", "localHardware"],
  connectedApis = ["database", "sync"],
  enabledModules = ["atendimento", "caixa", "producao", "delivery", "agenda", "estoque"],
  activeQueues = ["conversas", "pedidos", "carrinhos", "agenda"],
}: OperationalHealthInventoryInput): HealthItem[] {
  const isConnected = (source: string, list: string[]) => list.includes(source);

  const items: HealthItem[] = [
    {
      id: "internet",
      label: "Internet",
      kind: "api",
      icon: Wifi,
      status: typeof navigator !== "undefined" && navigator.onLine ? "online" : "offline",
      weight: 4,
      visibleFor: ["*"],
      connected: true,
      impact: "Afeta todos os canais, sincronização e atendimento.",
    },
    {
      id: "database",
      label: "Banco",
      kind: "api",
      icon: Database,
      status: "online",
      weight: 4,
      visibleFor: ["gerente", "superadmin", "caixa", "estoque", "atendente"],
      connected: isConnected("database", connectedApis),
      impact: "Afeta leitura e registro da operação.",
    },
    {
      id: "sync",
      label: "Sync",
      kind: "api",
      icon: RefreshCw,
      status: "online",
      weight: 3,
      visibleFor: ["gerente", "superadmin", "producao", "atendente", "delivery", "estoque"],
      connected: isConnected("sync", connectedApis),
      impact: "Afeta atualização entre módulos e dispositivos.",
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      kind: "channel",
      icon: MessageCircle,
      status: "pending",
      weight: 2,
      visibleFor: ["gerente", "superadmin", "atendente", "delivery"],
      connected: isConnected("whatsapp", connectedChannels),
      impact: "Afeta entrada e resposta de clientes pelo atendimento.",
    },
    {
      id: "catalogo",
      label: "Catálogo",
      kind: "channel",
      icon: ShoppingCart,
      status: "pending",
      weight: 2,
      visibleFor: ["gerente", "superadmin", "atendente"],
      connected: isConnected("catalogo", connectedChannels),
      impact: "Afeta carrinhos, ajuda no cardápio e pedidos assistidos.",
    },
    {
      id: "printer",
      label: "Impressão",
      kind: "hardware",
      icon: Printer,
      status: "pending",
      weight: 2,
      visibleFor: ["gerente", "superadmin", "caixa", "producao"],
      connected: isConnected("printer", connectedHardware),
      impact: "Afeta produção, caixa e comprovantes.",
    },
    {
      id: "localHardware",
      label: "Hardware",
      kind: "hardware",
      icon: Activity,
      status: "pending",
      weight: 1,
      visibleFor: ["gerente", "superadmin"],
      connected: isConnected("localHardware", connectedHardware),
      impact: "Afeta periféricos e estação de trabalho.",
    },
    {
      id: "agendaQueue",
      label: "Agenda",
      kind: "queue",
      icon: CalendarDays,
      status: "online",
      weight: 1,
      visibleFor: ["gerente", "superadmin", "atendente", "delivery", "estoque"],
      connected: isConnected("agenda", activeQueues),
      impact: "Afeta compromissos, retornos e pendências do período.",
    },
    {
      id: "pedidosQueue",
      label: "Pedidos",
      kind: "queue",
      icon: ReceiptText,
      status: "online",
      weight: 2,
      visibleFor: ["gerente", "superadmin", "caixa", "producao", "delivery", "atendente"],
      connected: isConnected("pedidos", activeQueues),
      impact: "Afeta acompanhamento entre atendimento, produção, caixa e entrega.",
    },
  ];

  return items.filter((item) => {
    if (!item.connected) return false;
    if (item.kind === "module") return enabledModules.includes(item.id);
    return true;
  });
}

export function getVisibleHealthItems(items: HealthItem[], role: string) {
  return items.filter((item) => item.visibleFor.includes(role) || item.visibleFor.includes("*"));
}

export function calculateOperationalHealthScore(items: HealthItem[]) {
  const totalWeight = items.reduce((acc, item) => acc + item.weight, 0);
  if (totalWeight === 0) return 100;

  // Future evolution: replace instant statuses with a rolling 5-minute average per item.
  const weightedScore = items.reduce((acc, item) => {
    return acc + statusScore[item.status] * item.weight;
  }, 0);

  return Math.round(weightedScore / totalWeight);
}

export function getOperationalHealthLevel(score: number): HealthLevel {
  if (score >= 95) return "green";
  if (score >= 80) return "yellow";
  if (score >= 60) return "orange";
  return "red";
}
