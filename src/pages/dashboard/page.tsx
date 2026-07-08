import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { motion } from "motion/react";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Banknote,
  BarChart3,
  Bike,
  ChefHat,
  CheckCircle2,
  Database,
  MessageCircle,
  Package,
  Printer,
  ReceiptText,
  RefreshCw,
  Settings,
  ShoppingBag,
  Truck,
  TriangleAlert,
  Users,
  Wifi,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import DashboardHeader, { type AttentionPriority } from "./_components/DashboardHeader.tsx";
import SummaryCard from "./_components/SummaryCard.tsx";
import ModuleCard from "./_components/ModuleCard.tsx";
import OperationMetricCard from "./_components/OperationMetricCard.tsx";
import TodayAgendaCard, { type TodayAgendaItem } from "./_components/TodayAgendaCard.tsx";
import WidgetConfigButton from "./_components/WidgetConfigButton.tsx";
import WidgetConfigPanel from "./_components/WidgetConfigPanel.tsx";
import type { InterfaceScale } from "./_components/InterfaceScalePopover.tsx";
import { getModulesForRole } from "./_lib/modules.ts";
import {
  getVisibleHealthItems,
  type HealthItem,
} from "./_lib/operationalHealth.ts";
import { cn } from "@/lib/utils.ts";

type OperatorSession = {
  operatorId: string;
  name: string;
  role: string;
  units?: string[];
};

type Props = {
  operator: OperatorSession;
  onLogout: () => void;
  onNavigate: (page: "dashboard" | "usuarios" | "venda" | "acompanhamento" | "caixa" | "delivery") => void;
};

type ManagerActionBadge = {
  count: number;
  priority: AttentionPriority;
};

type ManagerAction = {
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
  badge?: ManagerActionBadge;
};

type OperatorPreferences = {
  theme?: string;
  interfaceScale: InterfaceScale;
  favoriteModules: string[];
  widgetConfig: Record<string, unknown>;
};

const defaultPreferences: OperatorPreferences = {
  interfaceScale: "normal",
  favoriteModules: [],
  widgetConfig: {},
};

const interfaceScaleClasses: Record<InterfaceScale, string> = {
  small: "[--rvl-card-scale:0.92] [--rvl-font-scale:0.94] [--rvl-space-scale:0.92]",
  normal: "[--rvl-card-scale:1] [--rvl-font-scale:1] [--rvl-space-scale:1]",
  large: "[--rvl-card-scale:1.1] [--rvl-font-scale:1.08] [--rvl-space-scale:1.08]",
};

const badgeClasses: Record<AttentionPriority, string> = {
  info: "bg-emerald-500 text-white",
  attention: "bg-amber-400 text-[#5d5822]",
  important: "bg-[#f04a2a] text-white",
  critical: "bg-red-700 text-white",
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

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function todayLabel(): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "short",
  }).format(new Date());
}

function getDeliveryPriority(deliveryReady: number): AttentionPriority | undefined {
  if (deliveryReady <= 0) return undefined;
  if (deliveryReady === 1) return "info";
  if (deliveryReady === 2) return "attention";
  return "critical";
}

function ManagerActionButton({ label, icon: Icon, onClick, badge }: ManagerAction) {
  return (
    <button
      onClick={onClick ?? (() => toast.info(`${label} - em breve`))}
      className="relative flex h-full min-h-[calc(3.85rem*var(--rvl-card-scale,1))] min-w-0 cursor-pointer flex-col items-center justify-center gap-[calc(0.26rem*var(--rvl-space-scale,1))] rounded-2xl bg-[#e8e6dc] px-1.5 py-2 text-[#5d5822] transition-all active:scale-[0.98] dark:bg-[#696328] dark:text-[#f8c6aa] min-[380px]:min-h-[calc(4.1rem*var(--rvl-card-scale,1))] sm:min-h-[calc(4.55rem*var(--rvl-card-scale,1))]"
    >
      {badge && badge.count > 0 && (
        <span
          className={cn(
            "absolute right-2 top-2 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-semibold leading-none",
            badgeClasses[badge.priority]
          )}
        >
          {badge.count > 9 ? "9+" : badge.count}
        </span>
      )}
      <Icon className="h-[calc(1.42rem*var(--rvl-font-scale,1))] w-[calc(1.42rem*var(--rvl-font-scale,1))] stroke-[1.8] min-[380px]:h-[calc(1.62rem*var(--rvl-font-scale,1))] min-[380px]:w-[calc(1.62rem*var(--rvl-font-scale,1))] sm:h-[calc(1.82rem*var(--rvl-font-scale,1))] sm:w-[calc(1.82rem*var(--rvl-font-scale,1))]" />
      <span className="text-[calc(9.8px*var(--rvl-font-scale,1))] font-medium leading-none tracking-[0.005em] sm:text-[calc(10.8px*var(--rvl-font-scale,1))]">
        {label}
      </span>
    </button>
  );
}

export default function DashboardPage({ operator, onLogout, onNavigate }: Props) {
  const [configPanel, setConfigPanel] = useState<"journey" | "operation" | null>(null);
  const [activeWidgetView, setActiveWidgetView] = useState<"journey" | null>(null);
  const [preferences, setPreferences] = useState<OperatorPreferences>(() =>
    loadOperatorPreferences(operator.operatorId)
  );

  const updatePreferences = (patch: Partial<OperatorPreferences>) => {
    const next = { ...preferences, ...patch };
    setPreferences(next);
    saveOperatorPreferences(operator.operatorId, next);
  };

  const pendingResets = useQuery(api.auth.pinReset.listPending, {});
  const pendingCount = pendingResets?.length ?? 0;

  const unit = operator.units?.[0] ?? "alvorada-01";
  const resumo = useQuery(api.venda.delivery.resumoDashboard, { unit });

  const modules = getModulesForRole(operator.role);

  const isTablet = window.innerWidth >= 768;
  const isManager = operator.role === "gerente";
  const prontoDelivery = resumo?.prontoDelivery ?? 0;
  const attentionCount = pendingCount + prontoDelivery;
  const showHeaderUnit = (operator.units?.length ?? 0) > 1;

  const todayItems: TodayAgendaItem[] = [
    { time: "09:00", label: "Fornecedor", icon: Package },
    { time: "10:30", label: "Conferir pedidos", icon: ReceiptText },
    { time: "14:00", label: "Revisar estoque", icon: BarChart3 },
    { time: "15:30", label: "Organizar produção", icon: ChefHat },
    { time: "17:00", label: "Checar entregas", icon: Bike },
    { time: "18:30", label: "Fechamento parcial", icon: Banknote },
  ];

  const healthItems: HealthItem[] = [
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
      visibleFor: ["gerente", "superadmin", "caixa", "estoque"],
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
  // TEF: item futuro para o perfil caixa, quando houver origem real de status.

  const visibleHealthItems = getVisibleHealthItems(healthItems, operator.role);

  const managerActions: ManagerAction[] = [
    { label: "Venda", icon: ShoppingBag, onClick: () => onNavigate("venda") },
    {
      label: "Delivery",
      icon: Bike,
      onClick: () => onNavigate("delivery"),
      badge: prontoDelivery > 0 ? { count: prontoDelivery, priority: getDeliveryPriority(prontoDelivery) ?? "info" } : undefined,
    },
    { label: "Produção", icon: ChefHat, onClick: () => onNavigate("acompanhamento") },
    { label: "Caixa", icon: Banknote, onClick: () => onNavigate("caixa") },
    {
      label: "Usuários",
      icon: Users,
      onClick: () => onNavigate("usuarios"),
      badge: pendingCount > 0 ? { count: pendingCount, priority: "attention" } : undefined,
    },
    { label: "Estoque", icon: Package },
    { label: "Gestão", icon: BarChart3 },
  ];

  if (isManager) {
    if (activeWidgetView === "journey") {
      return (
        <div
          className={cn(
            "flex h-svh flex-col overflow-hidden bg-[#d5d4c8] text-[#5d5822] dark:bg-[#5d5822] dark:text-[#f8c6aa]",
            interfaceScaleClasses[preferences.interfaceScale]
          )}
        >
          <header className="flex shrink-0 items-center gap-3 px-4 py-3 md:px-6">
            <button
              type="button"
              onClick={() => setActiveWidgetView(null)}
              className="cursor-pointer rounded-full p-2 text-current/70 transition-colors hover:text-current focus:outline-none"
              aria-label="Voltar ao Centro de Operações"
            >
              <ArrowLeft className="h-5 w-5 stroke-[1.8]" />
            </button>
            <div>
              <h1 className="text-sm font-medium uppercase tracking-[0.12em]">
                Jornada Hoje
              </h1>
              <p className="text-[11px] font-light text-current/64">
                Centro de Operações
              </p>
            </div>
          </header>

          <main className="min-h-0 flex-1 px-4 pb-4 md:px-6">
            <section className="flex h-full flex-col rounded-2xl bg-[#e8e6dc] p-4 dark:bg-[#696328]">
              <div className="grid flex-1 content-center gap-2">
                {todayItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={`${item.time}-${item.label}`}
                      className="grid grid-cols-[1.25rem_1fr_3.25rem] items-center gap-2 rounded-xl bg-[#5d5822]/6 px-3 py-2.5 dark:bg-[#f8c6aa]/8"
                    >
                      <Icon className="h-4 w-4 text-current/78" />
                      <span className="text-sm font-light text-current/92">
                        {item.label}
                      </span>
                      <span className="text-right text-xs tabular-nums text-current/58">
                        {item.time}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          </main>
        </div>
      );
    }

    return (
      <div
        className={cn(
          "flex h-svh flex-col overflow-hidden bg-[#d5d4c8] text-[#5d5822] dark:bg-[#5d5822] dark:text-[#f8c6aa]",
          interfaceScaleClasses[preferences.interfaceScale]
        )}
      >
        <DashboardHeader
          operatorName={operator.name}
          role={operator.role}
          unit={unit}
          showUnit={showHeaderUnit}
          healthItems={visibleHealthItems}
          interfaceScale={preferences.interfaceScale}
          onInterfaceScaleChange={(interfaceScale) => updatePreferences({ interfaceScale })}
          onLogout={onLogout}
        />

        <main className="flex min-h-0 flex-1 overflow-hidden">
          <div className="mx-auto flex h-full w-full max-w-5xl flex-col gap-[calc(0.55rem*var(--rvl-space-scale,1))] px-4 pb-3 pt-2 md:px-6 md:py-4">
            <div className="flex min-h-0 flex-1 flex-col gap-[calc(0.55rem*var(--rvl-space-scale,1))]">
              <section
                role="button"
                tabIndex={0}
                onClick={() => onNavigate("acompanhamento")}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onNavigate("acompanhamento");
                  }
                }}
                className="relative flex min-h-0 flex-1 cursor-pointer flex-col rounded-2xl bg-[#e8e6dc] px-2.5 pb-2 pt-2.5 transition-transform active:scale-[0.995] dark:bg-[#696328]"
              >
                <div className="mb-2.5 flex items-center pr-9 text-[#5d5822] dark:text-[#f8c6aa]">
                  <h2 className="text-[11px] font-medium uppercase tracking-[0.12em]">
                    Operação Agora
                  </h2>
                </div>
                <div
                  className="absolute right-2.5 top-2.5 flex items-center gap-0.5 text-[#5d5822]/58 dark:text-[#f8c6aa]/58"
                  onClick={(event) => event.stopPropagation()}
                >
                  <WidgetConfigButton
                    label="Configurar Operação Agora"
                    onClick={() => setConfigPanel("operation")}
                  />
                </div>

                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" as const }}
                  className="grid min-h-0 flex-1 grid-cols-2 content-center gap-2 md:gap-3"
                >
                  <OperationMetricCard
                    label="Pedidos"
                    value={resumo === undefined ? "-" : String(resumo.emAndamento)}
                    icon={ReceiptText}
                  />
                  <OperationMetricCard
                    label="Atenção"
                    value={String(attentionCount)}
                    icon={TriangleAlert}
                    tone={attentionCount > 0 ? "warning" : "default"}
                  />
                </motion.section>
              </section>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.04, ease: "easeOut" as const }}
                role="button"
                tabIndex={0}
                onClick={() => setActiveWidgetView("journey")}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setActiveWidgetView("journey");
                  }
                }}
                className="min-h-0 flex-1 cursor-pointer transition-transform active:scale-[0.995]"
              >
                <TodayAgendaCard
                  items={todayItems}
                  onConfigure={() => setConfigPanel("journey")}
                />
              </motion.div>
            </div>

            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.08, ease: "easeOut" as const }}
              className="grid h-[calc(8.9rem*var(--rvl-card-scale,1))] shrink-0 grid-cols-4 grid-rows-2 gap-2 rounded-2xl bg-[#e8e6dc] p-1.5 dark:bg-[#696328] min-[420px]:h-[calc(9.5rem*var(--rvl-card-scale,1))] md:h-[calc(10.25rem*var(--rvl-card-scale,1))] md:gap-3"
            >
              {managerActions.map((action) => (
                <ManagerActionButton key={action.label} {...action} />
              ))}
            </motion.section>
          </div>
        </main>

        <WidgetConfigPanel
          open={configPanel === "journey"}
          title="Configurar Jornada Hoje"
          fields={[
            { label: "Período", description: "Janela operacional exibida no widget.", control: "single", options: ["Hoje", "Turno", "Semana", "Próximas 24h", "Personalizado"] },
            { label: "Colaborador", description: "Filtro futuro por pessoa ou função.", control: "multi", options: ["Todos", "Equipe", "Individual", "Gerente", "Caixa", "Atendimento", "Produção"] },
            { label: "Tarefa", description: "Tipo de compromisso ou lembrete.", control: "multi", options: ["Operação", "Estoque", "Fornecedor", "Limpeza", "Manutenção", "Treinamento", "Financeiro"] },
            { label: "Origem", description: "Fonte do compromisso operacional.", control: "single", options: ["Sistema", "Manual", "Integração", "Recorrente", "Importado"] },
            { label: "Prioridade", description: "Classificação contextual da jornada.", control: "multi", options: ["Info", "Atenção", "Importante", "Crítica"] },
            { label: "Unidade", description: "Unidade operacional relacionada.", control: "single", options: ["Atual", "Todas", "Matriz", "Filial", "Delivery"] },
          ]}
          onClose={() => setConfigPanel(null)}
        />

        <WidgetConfigPanel
          open={configPanel === "operation"}
          title="Configurar Operação Agora"
          fields={[
            { label: "Período", description: "Intervalo usado nos indicadores superiores.", control: "single", options: ["Agora", "Turno", "Hoje", "Última hora", "Personalizado"] },
            { label: "Unidade", description: "Filtro futuro por unidade operacional.", control: "single", options: ["Atual", "Todas", "Matriz", "Filial", "Delivery"] },
            { label: "Equipe", description: "Recorte futuro por equipe ou turno.", control: "multi", options: ["Todos", "Caixa", "Produção", "Atendimento", "Delivery", "Estoque", "Gerência"] },
            { label: "Status", description: "Estados operacionais considerados nos indicadores.", control: "multi", options: ["Ativos", "Pendentes", "Atenção", "Importantes", "Críticos", "Concluídos"] },
          ]}
          onClose={() => setConfigPanel(null)}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex min-h-screen flex-col bg-background",
        interfaceScaleClasses[preferences.interfaceScale]
      )}
    >
      <DashboardHeader
        operatorName={operator.name}
        role={operator.role}
        unit={unit}
        showUnit={showHeaderUnit}
        healthItems={visibleHealthItems}
        interfaceScale={preferences.interfaceScale}
        onInterfaceScaleChange={(interfaceScale) => updatePreferences({ interfaceScale })}
        onLogout={onLogout}
      />

      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-5xl space-y-8 px-4 py-6 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" as const }}
          >
            <p className="font-serif text-2xl font-semibold text-foreground">
              {greeting()}, {operator.name.split(" ")[0]}.
            </p>
            <p className="mt-0.5 text-sm capitalize text-muted-foreground">{todayLabel()}</p>
          </motion.div>

          {operator.role === "gerente" && (
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05, ease: "easeOut" as const }}
            >
              <h2 className="mb-3 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                Resumo do dia
              </h2>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                <SummaryCard
                  label="Em andamento"
                  value={resumo === undefined ? "-" : String(resumo.emAndamento)}
                  sub="pedidos ativos agora"
                  icon={ShoppingBag}
                  color="bg-orange-500"
                />
                <SummaryCard
                  label="Entregues hoje"
                  value={resumo === undefined ? "-" : String(resumo.entreguesHoje)}
                  sub="concluídos hoje"
                  icon={CheckCircle2}
                  color="bg-emerald-700"
                />
                <SummaryCard
                  label="Em rota"
                  value={resumo === undefined ? "-" : String(resumo.saiuParaEntrega)}
                  sub="motoboys em campo"
                  icon={Truck}
                  color="bg-sky-600"
                />
                {(resumo?.prontoDelivery ?? 0) > 0 && (
                  <SummaryCard
                    label="Aguard. motoboy"
                    value={String(resumo!.prontoDelivery)}
                    sub="delivery pronto p/ sair"
                    icon={Bike}
                    color="bg-amber-500"
                    alert
                  />
                )}
                {pendingCount > 0 && (
                  <SummaryCard
                    label="Pendências"
                    value={String(pendingCount)}
                    sub={pendingCount === 1 ? "aprovação necessária" : "aprovações necessárias"}
                    icon={AlertCircle}
                    color="bg-destructive"
                    alert
                  />
                )}
              </div>
            </motion.section>
          )}

          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" as const }}
          >
            <h2 className="mb-3 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              Módulos
            </h2>
            {modules.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                  <AlertCircle className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="mb-1 text-sm font-medium text-foreground">Nenhum módulo disponível</p>
                <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
                  Seu perfil ainda não possui módulos liberados. Fale com o gerente da unidade.
                </p>
              </div>
            ) : (
              <div
                className={cn(
                  "grid gap-3",
                  "grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5"
                )}
              >
                {modules.map((mod, i) => (
                  <motion.div
                    key={mod.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: 0.1 + i * 0.03, ease: "easeOut" as const }}
                  >
                    <ModuleCard
                      module={mod}
                      large={isTablet}
                      onNavigate={
                        mod.id === "usuarios"
                          ? () => onNavigate("usuarios")
                          : mod.id === "pdv"
                            ? () => onNavigate("venda")
                            : mod.id === "acompanhamento"
                              ? () => onNavigate("acompanhamento")
                              : mod.id === "caixa"
                                ? () => onNavigate("caixa")
                                : mod.id === "delivery"
                                  ? () => onNavigate("delivery")
                                  : undefined
                      }
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.section>
        </div>
      </main>
    </div>
  );
}
