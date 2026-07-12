import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { motion } from "motion/react";
import {
  AlertCircle,
  ArrowLeft,
  Banknote,
  BarChart3,
  Bike,
  ChefHat,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  MessageCircle,
  Package,
  ReceiptText,
  Settings,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import DashboardHeader, { type AttentionPriority } from "./_components/DashboardHeader.tsx";
import SummaryCard from "./_components/SummaryCard.tsx";
import ModuleCard from "./_components/ModuleCard.tsx";
import TodayAgendaCard, { type TodayAgendaItem } from "./_components/TodayAgendaCard.tsx";
import WidgetConfigPanel from "./_components/WidgetConfigPanel.tsx";
import type { InterfaceScale } from "./_components/InterfaceScalePopover.tsx";
import { getModulesForRole } from "./_lib/modules.ts";
import { buildOperationalHealthInventory, getVisibleHealthItems } from "./_lib/operationalHealth.ts";
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
  onNavigate: (page: "dashboard" | "usuarios" | "venda" | "acompanhamento" | "caixa" | "delivery" | "whatsapp") => void;
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
  active?: boolean;
};

type DockVariant = "home" | "compact";

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
  large: "[--rvl-card-scale:1] [--rvl-font-scale:1.08] [--rvl-space-scale:0.9]",
};

const badgeClasses: Record<AttentionPriority, string> = {
  info: "bg-emerald-500 text-white",
  attention: "bg-amber-400 text-[#685c20]",
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

function DockActionButton({
  label,
  icon: Icon,
  onClick,
  badge,
  active,
  variant = "compact",
  slot,
}: ManagerAction & { variant?: DockVariant; slot?: number }) {
  return (
    <button
      onClick={onClick ?? (() => toast.info(`${label} - em breve`))}
      className={cn(
        "relative flex min-w-0 cursor-pointer flex-col items-center justify-center gap-1 text-[#1f1f1a] transition-colors active:scale-[0.98] dark:text-[#f7f2ec]",
        variant === "home"
          ? "h-full w-full px-0 py-0.5"
          : "items-center rounded-xl px-2 py-1",
        variant !== "home" &&
          (active
            ? "bg-[#685c20]/10 dark:bg-[#24241f]"
            : "bg-transparent hover:bg-[#1f1f1a]/7 dark:hover:bg-[#f7f2ec]/8")
      )}
    >
      <span
        className={cn(
          "flex min-w-0 flex-col items-center gap-1",
          variant === "home" &&
            cn(
              "w-full rounded-2xl px-0 py-1 text-center transition-colors",
              active
                ? "bg-[#685c20]/10 dark:bg-[#24241f]"
                : "hover:bg-[#1f1f1a]/7 dark:hover:bg-[#f7f2ec]/8"
            )
        )}
      >
        <span
          className={cn(
            "relative",
            variant === "home" && slot === 1 && "translate-x-[-14.8px]",
            variant === "home" && slot === 2 && (label === "Atendimento" ? "translate-x-[-4.5px]" : "translate-x-[-6.5px]"),
            variant === "home" && slot === 3 && "translate-x-[8px]",
            variant === "home" && slot === 4 && "translate-x-[11px]",
            variant === "home" && slot === 5 && "translate-x-[11px]",
          )}
        >
          <Icon
            className={cn(
              "stroke-[1.45]",
              "h-[calc(1.15rem*var(--rvl-font-scale,1))] w-[calc(1.15rem*var(--rvl-font-scale,1))]",
            )}
          />
          {badge && badge.count > 0 && (
            <span
              className={cn(
                "absolute -right-1 top-2 flex h-3 min-w-3 items-center justify-center rounded-full px-0.5 text-[7px] font-bold leading-none",
                badgeClasses[badge.priority]
              )}
            >
              {badge.count > 9 ? "9+" : badge.count}
            </span>
          )}
        </span>
        <span
          className={cn(
            "block w-full max-w-full truncate text-[calc(9.5px*var(--rvl-font-scale,1))] font-light leading-none tracking-[0.005em]",
            "text-center",
            variant === "home" && slot === 1 && "translate-x-[-14.8px]",
            variant === "home" && slot === 2 && "translate-x-[-6.5px]",
            variant === "home" && slot === 3 && "translate-x-[8px]",
            variant === "home" && slot === 4 && "translate-x-[11px]",
            variant === "home" && slot === 5 && "translate-x-[11px]",
          )}
        >
          {label}
        </span>
      </span>
    </button>
  );
}

function OperationalDock({
  primaryActions,
  secondaryActions,
  open,
  onOpenChange,
  hiddenSignalCount,
  hiddenSignalTone,
  variant = "compact",
}: {
  primaryActions: ManagerAction[];
  secondaryActions: ManagerAction[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hiddenSignalCount: number;
  hiddenSignalTone: AttentionPriority;
  variant?: DockVariant;
}) {
  const hasHiddenSignal = hiddenSignalCount > 0;
  const visibleActions =
    variant === "home" ? [] : primaryActions;
  const homePrimaryActions =
    variant === "home" ? [...primaryActions, secondaryActions[0]].filter(Boolean) : [];
  const homeSecondaryActions = variant === "home" ? secondaryActions.slice(1, 5) : [];

  return (
    <section className="relative shrink-0">
      {variant !== "home" && open && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.15, ease: "easeOut" as const }}
          className={cn(
            "absolute inset-x-0 z-20 rounded-t-3xl bg-[#f1f0ea]/96 p-1.5 text-[#1f1f1a] backdrop-blur-sm dark:bg-[#181816] dark:text-[#f7f2ec]",
            "bottom-[calc(3.42rem*var(--rvl-card-scale,1))]"
          )}
        >
          <div className="grid grid-cols-5 gap-1.5">
            {secondaryActions.map((action) => (
              <DockActionButton key={action.label} {...action} variant="compact" />
            ))}
          </div>
        </motion.div>
      )}

      <div
        className={cn(
          "relative border-t border-[#1f1f1a]/8 bg-[#f1f0ea]/96 text-[#1f1f1a] backdrop-blur-sm dark:border-[#f7f2ec]/10 dark:bg-[#181816] dark:text-[#f7f2ec]",
          variant === "home"
            ? "px-1 pb-[calc(0.45rem+env(safe-area-inset-bottom))] pt-1"
            : "px-2 pb-[calc(0.45rem+env(safe-area-inset-bottom))] pt-0.5",
        )}
      >
        {variant !== "home" && (
          <button
            type="button"
            onClick={() => onOpenChange(!open)}
            className={cn(
              "absolute left-1/2 top-1 z-10 flex h-5 w-12 -translate-x-1/2 cursor-pointer items-center justify-center bg-transparent text-[#685c20]/82 transition-colors hover:text-[#685c20] dark:text-[#f7f2ec]/88 dark:hover:text-white",
              hasHiddenSignal &&
                !open &&
                (hiddenSignalTone === "critical"
                  ? "text-red-700 dark:text-red-200"
                  : hiddenSignalTone === "important"
                    ? "text-amber-800 dark:text-amber-200"
                    : "text-emerald-800 dark:text-emerald-200")
            )}
            aria-label={open ? "Recolher atalhos" : "Mostrar atalhos"}
          >
            {open ? <ChevronDown className="h-4 w-4 stroke-[1.6]" /> : <ChevronUp className="h-4 w-4 stroke-[1.6]" />}
          </button>
        )}
        {variant === "home" ? (
          <div className="grid w-full gap-y-1.5">
            <div className="grid w-full grid-cols-5 gap-x-0">
              {homePrimaryActions.map((action, index) => (
                <DockActionButton key={action.label} {...action} variant="home" slot={index + 1} />
              ))}
            </div>
            <div className="grid w-full grid-cols-5 gap-x-0">
              {homeSecondaryActions.map((action, index) => (
                <DockActionButton key={action.label} {...action} variant="home" slot={index + 1} />
              ))}
              <span className="min-w-0 flex-1" aria-hidden="true" />
            </div>
          </div>
        ) : (
          <div className="grid h-[calc(2.85rem*var(--rvl-card-scale,1))] gap-1.5 sm:h-[calc(3.05rem*var(--rvl-card-scale,1))]">
            {visibleActions.map((action) => (
              <DockActionButton key={action.label} {...action} variant={variant} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default function DashboardPage({ operator, onLogout, onNavigate }: Props) {
  const [configPanel, setConfigPanel] = useState<"journey" | null>(null);
  const [activeWidgetView, setActiveWidgetView] = useState<"journey" | null>(null);
  const [dockOpen, setDockOpen] = useState(false);
  const [dockTouched, setDockTouched] = useState(false);
  const [dockSuggestionShown, setDockSuggestionShown] = useState(false);
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
  const conversasWhatsApp = useQuery(api.ojc.whatsapp.listarConversasAbertas, { unit });
  const agendaTasks = useQuery(api.agenda.tarefas.listarTarefasAgenda, {
    unit,
    operadorId: operator.operatorId,
    modoOperacional: operator.role,
    limite: 20,
  });
  const criarTarefaAgenda = useMutation(api.agenda.tarefas.criarTarefaAgenda);

  const modules = getModulesForRole(operator.role);

  const isTablet = window.innerWidth >= 768;
  const isManager = operator.role === "gerente";
  const prontoDelivery = resumo?.prontoDelivery ?? 0;
  const whatsappUnread = conversasWhatsApp?.reduce((sum, conversa) => sum + conversa.naoLidas, 0) ?? 0;
  const showHeaderUnit = (operator.units?.length ?? 0) > 1;

  const fallbackTodayItems: TodayAgendaItem[] = [
    { time: "09:00", label: "Fornecedor", icon: Package, priority: "info", completed: true },
    { time: "10:30", label: "Conferir pedidos", icon: ReceiptText, priority: "attention", alertEnabled: true },
    { time: "14:00", label: "Revisar estoque", icon: BarChart3, priority: "info" },
    { time: "15:30", label: "Organizar produção", icon: ChefHat, priority: "attention" },
    { time: "17:00", label: "Checar entregas", icon: Bike, priority: "exception" },
    { time: "18:30", label: "Fechamento parcial", icon: Banknote, priority: "critical", alertEnabled: true },
  ];

  const todayItems: TodayAgendaItem[] =
    agendaTasks && agendaTasks.length > 0
      ? agendaTasks.map((task) => ({
          time: task.horario ?? "--:--",
          label: task.titulo,
          icon: ReceiptText,
          priority:
            task.prioridade === "critical"
              ? "critical"
              : task.prioridade === "attention" || task.prioridade === "important"
                ? "attention"
                : "info",
          alertEnabled: task.alertaAtivo,
          completed: task.status === "concluida",
          overdue: task.status === "atrasada",
        }))
      : fallbackTodayItems;

  const healthItems = buildOperationalHealthInventory({ role: operator.role });
  const visibleHealthItems = getVisibleHealthItems(healthItems, operator.role);

  const primaryDockActions: ManagerAction[] = [
    { label: "Venda", icon: ReceiptText, onClick: () => onNavigate("venda") },
    {
      label: "Atendimento",
      icon: MessageCircle,
      onClick: () => onNavigate("whatsapp"),
      badge: whatsappUnread > 0 ? { count: whatsappUnread, priority: whatsappUnread > 4 ? "important" : "attention" } : undefined,
    },
    { label: "Produção", icon: ChefHat, onClick: () => onNavigate("acompanhamento") },
    { label: "Gestão", icon: BarChart3 },
  ];

  const secondaryDockActions: ManagerAction[] = [
    {
      label: "Delivery",
      icon: Bike,
      onClick: () => onNavigate("delivery"),
      badge: prontoDelivery > 0 ? { count: prontoDelivery, priority: getDeliveryPriority(prontoDelivery) ?? "info" } : undefined,
    },
    { label: "Caixa", icon: Banknote, onClick: () => onNavigate("caixa") },
    { label: "Estoque", icon: Package },
    {
      label: "Usuários",
      icon: Users,
      onClick: () => onNavigate("usuarios"),
      badge: pendingCount > 0 ? { count: pendingCount, priority: "attention" } : undefined,
    },
    { label: "Ajustes", icon: Settings },
  ];

  const primaryAlertCount = primaryDockActions.reduce((sum, action) => sum + (action.badge?.count ?? 0), 0);
  const hiddenAlertCount = secondaryDockActions.reduce((sum, action) => sum + (action.badge?.count ?? 0), 0);
  const canCreateAgendaForOthers = ["gerente", "admin", "superadmin"].includes(operator.role);
  const hiddenSignalTone = secondaryDockActions.some((action) => action.badge?.priority === "critical")
    ? "critical"
    : secondaryDockActions.some((action) => action.badge?.priority === "important" || action.badge?.priority === "attention")
      ? "attention"
      : "info";

  useEffect(() => {
    if (!isManager || dockTouched || hiddenAlertCount <= 0) return;
    setDockOpen(true);
  }, [dockTouched, hiddenAlertCount, isManager]);

  useEffect(() => {
    if (!isManager || dockSuggestionShown || hiddenAlertCount <= primaryAlertCount || hiddenAlertCount <= 0) return;
    toast.info("Há mais pendências nos atalhos recolhidos. Você pode fixar esses módulos futuramente.");
    setDockSuggestionShown(true);
  }, [dockSuggestionShown, hiddenAlertCount, isManager, primaryAlertCount]);

  const handleDockOpenChange = (open: boolean) => {
    setDockTouched(true);
    setDockOpen(open);
  };

  if (isManager) {
    if (activeWidgetView === "journey") {
      return (
        <div
          className={cn(
            "flex h-svh flex-col overflow-hidden bg-[#f7f7f4] text-[#1f1f1a] dark:bg-[#0b0b0a] dark:text-[#f7f2ec]",
            interfaceScaleClasses[preferences.interfaceScale]
          )}
        >
          <header className="flex shrink-0 items-center gap-3 bg-[#ffffff]/88 px-3 py-[calc(0.75rem*var(--rvl-space-scale,1))] dark:bg-[#181816] md:px-3">
            <button
              type="button"
              onClick={() => setActiveWidgetView(null)}
              className="cursor-pointer rounded-full p-2 text-current/70 transition-colors hover:text-current focus:outline-none"
              aria-label="Voltar ao Centro de Operações"
            >
              <ArrowLeft className="h-[calc(1.25rem*var(--rvl-font-scale,1))] w-[calc(1.25rem*var(--rvl-font-scale,1))] stroke-[1.8]" />
            </button>
            <div>
              <h1 className="text-[calc(0.875rem*var(--rvl-font-scale,1))] font-medium uppercase tracking-[0.12em]">
                Agenda
              </h1>
              <p className="text-[calc(11px*var(--rvl-font-scale,1))] font-light text-current/64">
                Centro de Operações
              </p>
            </div>
          </header>

          <main className="min-h-0 flex-1 px-3 pb-[calc(1rem*var(--rvl-space-scale,1))] pt-1 md:px-3">
            <section className="flex h-full flex-col rounded-2xl bg-[#ffffff]/92 p-[calc(1rem*var(--rvl-space-scale,1))] dark:bg-[#181816]">
              <div className="grid flex-1 content-center gap-[calc(0.5rem*var(--rvl-space-scale,1))]">
                {todayItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={`${item.time}-${item.label}`}
                      className="grid grid-cols-[calc(1.25rem*var(--rvl-font-scale,1))_1fr_calc(3.25rem*var(--rvl-font-scale,1))] items-center gap-2 rounded-xl bg-[#1f1f1a]/5 px-3 py-[calc(0.625rem*var(--rvl-space-scale,1))] dark:bg-[#24241f]"
                    >
                      <Icon className="h-[calc(1rem*var(--rvl-font-scale,1))] w-[calc(1rem*var(--rvl-font-scale,1))] text-current/78" />
                      <span className="text-[calc(0.875rem*var(--rvl-font-scale,1))] font-light text-current/92">
                        {item.label}
                      </span>
                      <span className="text-right text-[calc(0.75rem*var(--rvl-font-scale,1))] tabular-nums text-current/58">
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
          "flex h-svh flex-col overflow-hidden bg-[#f7f7f4] text-[#1f1f1a] dark:bg-[#0b0b0a] dark:text-[#f7f2ec]",
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
          compactMargins={isManager}
        />

        <main className="relative flex min-h-0 flex-1 overflow-hidden">
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
          <div className="mx-auto flex h-full w-full max-w-none flex-col gap-[calc(0.55rem*var(--rvl-space-scale,1))] px-0 pb-0 pt-2 md:pb-0 md:pt-4">
            <div className="flex min-h-0 flex-1 flex-col gap-[calc(0.55rem*var(--rvl-space-scale,1))]">
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
                className="shrink-0 cursor-pointer transition-transform active:scale-[0.995]"
              >
                <TodayAgendaCard
                  items={todayItems}
                  onConfigure={() => setConfigPanel("journey")}
                  onViewFullAgenda={() => setActiveWidgetView("journey")}
                  className="h-auto min-h-0"
                  config={{
                    mode: "system",
                    summary: "Padrão do sistema",
                    period: "Hoje",
                    scope: "Gerente · Matriz",
                    alerts: "Opcionais",
                    alarm: "Desligado",
                  }}
                  canCreateForOthers={canCreateAgendaForOthers}
                  currentOperatorName={operator.name}
                  onCreateAgenda={async (payload) => {
                    await criarTarefaAgenda({
                      unit,
                      titulo: payload.titulo,
                      dataReferencia: payload.dataReferencia,
                      horario: payload.horario,
                      modoOperacional: operator.role,
                      criadoPorOperatorId: operator.operatorId,
                      prioridade: payload.prioridade,
                      alertaAtivo: payload.alertaAtivo,
                      alertaQuando: payload.alertaQuando,
                      despertadorAtivo: payload.despertadorAtivo,
                    });
                  }}
                />
              </motion.div>
              <div className="min-h-0 flex-1" aria-hidden="true" />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.08, ease: "easeOut" as const }}
            >
              <OperationalDock
                primaryActions={primaryDockActions}
                secondaryActions={secondaryDockActions}
                open={dockOpen}
                onOpenChange={handleDockOpenChange}
                hiddenSignalCount={hiddenAlertCount}
                hiddenSignalTone={hiddenSignalTone}
                variant="home"
              />
            </motion.div>
          </div>
        </main>

        <WidgetConfigPanel
          open={configPanel === "journey"}
          title="Configurar Agenda"
          fields={[
            { label: "Período", description: "Janela operacional exibida no widget.", control: "single", options: ["Hoje", "Turno", "Semana", "Próximas 24h", "Personalizado"] },
            { label: "Colaborador", description: "Filtro futuro por pessoa ou função.", control: "single", options: ["Sem filtro", "Todos", "Equipe", "Individual", "Gerente", "Caixa", "Atendimento", "Produção"] },
            { label: "Tarefa", description: "Tipo de compromisso ou lembrete.", control: "single", options: ["Sem filtro", "Operação", "Estoque", "Fornecedor", "Limpeza", "Manutenção", "Treinamento", "Financeiro"] },
            { label: "Buscar em", description: "Conteúdos pesquisáveis no histórico da agenda.", control: "single", options: ["Sem filtro", "Todos", "Texto", "Áudio", "Imagem", "Vídeo", "Responsável"] },
            { label: "Origem", description: "Fonte do compromisso operacional.", control: "single", options: ["Sem filtro", "Sistema", "Manual", "Integração", "Recorrente", "Importado"] },
            { label: "Prioridade", description: "Classificação contextual da jornada.", control: "single", options: ["Sem filtro", "Info", "Atenção", "Importante", "Crítica"] },
            { label: "Unidade", description: "Unidade operacional relacionada.", control: "single", options: ["Sem filtro", "Atual", "Todas", "Matriz", "Filial", "Delivery"] },
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
                  icon={ReceiptText}
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
