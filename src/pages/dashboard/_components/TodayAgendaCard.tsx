import {
  Bell,
  CalendarPlus,
  Check,
  ChevronDown,
  ChevronUp,
  Image,
  Mic,
  MoreVertical,
  Plus,
  Video,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils.ts";

export type TodayAgendaItem = {
  time: string;
  label: string;
  icon: LucideIcon;
  priority?: "info" | "attention" | "critical" | "exception";
  alertEnabled?: boolean;
  overdue?: boolean;
  completed?: boolean;
};

type AgendaConfig = {
  mode: "system" | "custom";
  summary: string;
  period: string;
  scope: string;
  alerts: string;
  alarm: string;
};

type AlertConfig = {
  enabled: boolean;
  when: string;
  status: "info" | "attention" | "critical" | "seen" | "cancelled";
};

type Props = {
  items: TodayAgendaItem[];
  className?: string;
  onConfigure?: () => void;
  config?: AgendaConfig;
  canCreateForOthers?: boolean;
  currentOperatorName?: string;
  onCreateAgenda?: (payload: {
    titulo: string;
    dataReferencia?: string;
    horario?: string;
    prioridade: "info" | "attention" | "critical";
    alertaAtivo: boolean;
    alertaQuando?: string;
    despertadorAtivo: boolean;
  }) => Promise<void> | void;
};

const defaultAgendaConfig: AgendaConfig = {
  mode: "system",
  summary: "Padrão do sistema",
  period: "Hoje",
  scope: "Gerente · Matriz",
  alerts: "Opcionais",
  alarm: "Desligado",
};

const defaultAlertConfig: AlertConfig = {
  enabled: true,
  when: "15 min antes",
  status: "attention",
};

const priorityClasses = {
  info: "bg-emerald-500",
  attention: "bg-amber-500",
  critical: "bg-red-600",
  exception: "bg-sky-500",
};

const priorityLabels = {
  info: "Informação ativa",
  attention: "Atenção",
  critical: "Crítico",
  exception: "Exceção informativa",
};

const alertStatusClasses = {
  info: "bg-emerald-500",
  attention: "bg-amber-500",
  critical: "bg-red-600",
  seen: "bg-sky-500",
  cancelled: "bg-[#f3c4a2]/36 dark:bg-[#685c20]/30",
};

const alertStatusLabels = {
  info: "Programado",
  attention: "Próximo do horário",
  critical: "Alertou e não foi visto",
  seen: "Visto",
  cancelled: "Cancelado",
};

function emptyAgendaMessage(count: number) {
  if (count === 0) return "Agenda livre neste período.";
  if (count < 3) return "Sem mais compromissos.";
  return null;
}

export default function TodayAgendaCard({
  items,
  className,
  onConfigure,
  config = defaultAgendaConfig,
  canCreateForOthers = false,
  currentOperatorName = "Operador",
  onCreateAgenda,
}: Props) {
  const settingsPanelRef = useRef<HTMLDivElement>(null);
  const createPanelRef = useRef<HTMLDivElement>(null);
  const actionClusterRef = useRef<HTMLDivElement>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [quickModeOpen, setQuickModeOpen] = useState(false);
  const [expandedSetting, setExpandedSetting] = useState<string | null>(null);
  const [expandedAlertSetting, setExpandedAlertSetting] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createAttachmentOpen, setCreateAttachmentOpen] = useState(false);
  const [createDateTimeOpen, setCreateDateTimeOpen] = useState(false);
  const [createOwnerOpen, setCreateOwnerOpen] = useState(false);
  const [showCreateLabel, setShowCreateLabel] = useState(true);
  const [quickConfig, setQuickConfig] = useState<AgendaConfig>(config);
  const [alertConfig, setAlertConfig] = useState<AlertConfig>(defaultAlertConfig);
  const [customDate, setCustomDate] = useState("");
  const [customMonth, setCustomMonth] = useState("");
  const [newAgendaOwner, setNewAgendaOwner] = useState("Para mim");
  const [newAgendaTitle, setNewAgendaTitle] = useState("");
  const [newAgendaDate, setNewAgendaDate] = useState(new Date().toISOString().slice(0, 10));
  const [newAgendaTime, setNewAgendaTime] = useState("");
  const [savingNewAgenda, setSavingNewAgenda] = useState(false);
  const visibleItems = items.slice(0, 3);
  const emptyMessage = emptyAgendaMessage(visibleItems.length);
  const hasQuickChanges =
    JSON.stringify(quickConfig) !== JSON.stringify(config) ||
    JSON.stringify(alertConfig) !== JSON.stringify(defaultAlertConfig) ||
    customDate !== "" ||
    customMonth !== "";

  useEffect(() => {
    const timeout = window.setTimeout(() => setShowCreateLabel(false), 3500);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!settingsOpen && !createOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (actionClusterRef.current?.contains(target)) return;
      if (settingsPanelRef.current?.contains(target)) return;
      if (createPanelRef.current?.contains(target)) return;

      if (createOpen) {
        setCreateOpen(false);
        setCreateAttachmentOpen(false);
        setCreateDateTimeOpen(false);
        setCreateOwnerOpen(false);
      }

      if (settingsOpen && !hasQuickChanges) {
        setSettingsOpen(false);
        setQuickModeOpen(false);
        setExpandedSetting(null);
        setExpandedAlertSetting(null);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [createOpen, hasQuickChanges, settingsOpen]);

  const quickSettings: Array<{
    key: keyof Pick<AgendaConfig, "period">;
    label: string;
    options: string[];
  }> = [
    { key: "period", label: "Período", options: ["Hoje", "Turno", "Semana", "Mensal", "Personalizado"] },
  ];

  const alertSettings = [
    {
      key: "when",
      label: "Quando alertar",
      value: alertConfig.when,
      options: ["No horário", "15 min antes", "30 min antes", "1h antes"],
    },
    {
      key: "status",
      label: "Status do alerta",
      value: alertStatusLabels[alertConfig.status],
      options: ["Programado", "Próximo do horário", "Alertou e não foi visto", "Visto"],
    },
  ];

  const updateQuickConfig = (
    key: keyof Pick<AgendaConfig, "period">,
    value: string,
  ) => {
    setQuickConfig((current) => ({
      ...current,
      mode: "custom",
      summary: current.summary === "Padrão do sistema" ? "Personalizado" : current.summary,
      [key]: value,
    }));
    toast.info("Agenda ajustada para esta visualização.");
  };

  const updateAlertConfig = (key: "when" | "status", value: string) => {
    setAlertConfig((current) => ({
      ...current,
      enabled: true,
      [key]:
        key === "status"
          ? ({
              Programado: "info",
              "Próximo do horário": "attention",
              "Alertou e não foi visto": "critical",
              Visto: "seen",
            }[value] ?? current.status)
          : value,
    }));
    toast.info("Alerta ajustado.");
  };

  const cancelQuickChanges = () => {
    setQuickConfig(config);
    setAlertConfig(defaultAlertConfig);
    setCustomDate("");
    setCustomMonth("");
    toast.info("Alterações da agenda canceladas.");
  };

  const saveQuickChanges = () => {
    setQuickConfig((current) => ({
      ...current,
      summary: current.mode === "system" ? "Padrão do sistema" : "Personalizado",
    }));
    toast.success("Agenda salva.");
  };

  const restoreSystemConfig = () => {
    setQuickConfig(config);
    setAlertConfig(defaultAlertConfig);
    setCustomDate("");
    setCustomMonth("");
    toast.info("Agenda voltou ao padrão do sistema.");
  };

  const cancelAlert = () => {
    setAlertConfig((current) => ({
      ...current,
      enabled: false,
      status: "cancelled",
    }));
    toast.info("Alerta cancelado.");
  };

  const resetNewAgendaForm = () => {
    setNewAgendaTitle("");
    setNewAgendaDate(new Date().toISOString().slice(0, 10));
    setNewAgendaTime("");
    setNewAgendaOwner("Para mim");
    setCreateAttachmentOpen(false);
    setCreateDateTimeOpen(false);
    setCreateOwnerOpen(false);
  };

  const saveNewAgenda = async () => {
    if (newAgendaOwner !== "Para mim" && !canCreateForOthers) {
      toast.info("Criar agenda para outro colaborador exige autorização.");
      return;
    }
    const titulo = newAgendaTitle.trim();
    if (!titulo) {
      toast.info("Informe o compromisso.");
      return;
    }

    try {
      setSavingNewAgenda(true);
      await onCreateAgenda?.({
        titulo,
        dataReferencia: newAgendaDate || undefined,
        horario: newAgendaTime || undefined,
        prioridade: alertConfig.status === "critical" ? "critical" : alertConfig.status === "attention" ? "attention" : "info",
        alertaAtivo: alertConfig.enabled,
        alertaQuando: alertConfig.enabled ? alertConfig.when : undefined,
        despertadorAtivo: quickConfig.alarm === "Ligado",
      });
      toast.success("Compromisso salvo.");
      resetNewAgendaForm();
      setCreateOpen(false);
    } catch {
      toast.error("Não foi possível salvar o compromisso.");
    } finally {
      setSavingNewAgenda(false);
    }
  };

  return (
    <section
      className={cn(
        "relative flex h-full min-h-0 flex-col rounded-none bg-[#f8dcc8] px-4 py-3 dark:bg-[#756c2c] md:rounded-2xl",
        className,
      )}
    >
      <div className="mb-2 flex items-start gap-2 pr-32 text-[#685c20] dark:text-[#f3c4a2]">
        <div className="min-w-0 text-left">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setSettingsOpen((value) => !value);
            }}
            className="flex min-w-0 cursor-pointer items-center gap-1.5 rounded-full pr-1 text-left transition-colors hover:text-[#685c20]/82 dark:hover:text-[#f3c4a2]/84"
            aria-label={settingsOpen ? "Recolher configuração da agenda" : "Mostrar configuração da agenda"}
            aria-expanded={settingsOpen}
          >
            <span className="text-[0.6875rem] font-medium uppercase tracking-[0.12em]">
              Agenda
            </span>
            <span className="truncate text-[0.65625rem] font-light normal-case tracking-normal text-[#685c20]/60 dark:text-[#f3c4a2]/62">
              {quickConfig.summary}
            </span>
            {settingsOpen ? (
              <ChevronUp className="h-3 w-3 shrink-0 text-[#685c20]/56 dark:text-[#f3c4a2]/60" />
            ) : (
              <ChevronDown className="h-3 w-3 shrink-0 text-[#685c20]/56 dark:text-[#f3c4a2]/60" />
            )}
          </button>
        </div>
        <div
          ref={actionClusterRef}
          className={cn(
            "absolute right-4 top-3 inline-flex h-6 items-center gap-0.5 overflow-hidden text-[#685c20]/74 transition-colors dark:text-[#f3c4a2]/80",
            (createOpen || showCreateLabel) && "text-[#685c20] dark:text-[#f3c4a2]"
          )}
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => {
              setCreateOpen((value) => !value);
              setCreateAttachmentOpen(false);
              setShowCreateLabel(false);
            }}
            onMouseEnter={() => setShowCreateLabel(true)}
            onFocus={() => setShowCreateLabel(true)}
            onMouseLeave={() => !createOpen && setShowCreateLabel(false)}
            className={cn(
              "inline-flex h-full cursor-pointer items-center justify-center gap-1 rounded-full px-1.5 transition-all hover:bg-[#685c20]/8 hover:text-[#685c20] focus:outline-none dark:hover:bg-[#f3c4a2]/10 dark:hover:text-[#f3c4a2]",
              showCreateLabel || createOpen ? "w-[5.9rem]" : "w-6",
            )}
            aria-label="Criar agenda"
            aria-expanded={createOpen}
          >
            <CalendarPlus className="h-3.5 w-3.5 shrink-0 stroke-[2.05]" />
            <span
              className={cn(
                "overflow-hidden whitespace-nowrap text-[0.625rem] font-medium transition-opacity",
                showCreateLabel || createOpen ? "opacity-100" : "w-0 opacity-0",
              )}
            >
              Criar agenda
            </span>
          </button>
          {onConfigure && (
            <>
              <button
                type="button"
                onClick={onConfigure}
                className="inline-flex h-full w-6 cursor-pointer items-center justify-center rounded-full text-[#685c20]/76 transition-colors hover:bg-[#685c20]/8 hover:text-[#685c20] focus:outline-none dark:text-[#f3c4a2]/82 dark:hover:bg-[#f3c4a2]/10 dark:hover:text-[#f3c4a2]"
                aria-label="Configurar Agenda"
              >
                <MoreVertical className="h-3.5 w-3.5 stroke-[2.15]" />
              </button>
            </>
          )}
        </div>
      </div>

      {settingsOpen && (
        <div
          ref={settingsPanelRef}
          className="mb-2 max-h-[min(24rem,calc(100svh-13.5rem))] overflow-y-auto rounded-2xl bg-[#685c20] px-3 py-2.5 text-[0.65625rem] text-[#f3c4a2] dark:bg-[#f3c4a2] dark:text-[#685c20]"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="mb-1.5">
            <button
              type="button"
              onClick={() => {
                setQuickModeOpen((value) => !value);
                setExpandedSetting(null);
                setExpandedAlertSetting(null);
              }}
              className="grid w-full cursor-pointer grid-cols-[1fr_auto_auto] items-center gap-2 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-[#f3c4a2]/8 dark:hover:bg-[#685c20]/8"
              aria-expanded={quickModeOpen}
            >
              <span className="text-[0.6875rem] font-semibold">Configuração</span>
              <span className="text-[0.625rem] font-medium text-[#f3c4a2]/64 dark:text-[#685c20]/64">
                Rápida
              </span>
              {quickModeOpen ? (
                <ChevronUp className="h-3 w-3 opacity-70" />
              ) : (
                <ChevronDown className="h-3 w-3 opacity-70" />
              )}
            </button>
            {quickModeOpen && onConfigure && (
              <div className="mx-1 mb-1">
                <button
                  type="button"
                  onClick={onConfigure}
                  className="grid w-full cursor-pointer grid-cols-[1fr_auto] items-center rounded-lg px-2 py-1.5 text-left text-[0.65625rem] font-medium text-[#f3c4a2]/68 transition-colors hover:bg-[#f3c4a2]/8 hover:text-[#f3c4a2] dark:text-[#685c20]/68 dark:hover:bg-[#685c20]/8 dark:hover:text-[#685c20]"
                >
                  <span>Completa</span>
                  <ChevronDown className="-rotate-90 h-3 w-3 opacity-70" />
                </button>
              </div>
            )}
          </div>

          {quickSettings.map((setting) => (
            <div key={setting.key}>
              <button
                type="button"
                onClick={() =>
                  setExpandedSetting((current) => {
                    setQuickModeOpen(false);
                    setExpandedAlertSetting(null);
                    return current === setting.key ? null : setting.key;
                  })
                }
                className="grid w-full cursor-pointer grid-cols-[1fr_auto_auto] items-center gap-2 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-[#f3c4a2]/8 dark:hover:bg-[#685c20]/8"
                aria-expanded={expandedSetting === setting.key}
              >
                <span className="min-w-0 truncate text-[0.65625rem] font-medium text-[#f3c4a2]/72 dark:text-[#685c20]/70">
                  {setting.label}
                </span>
                <span className="min-w-0 truncate text-right text-[0.6875rem] font-semibold text-[#f3c4a2] dark:text-[#685c20]">
                  {quickConfig[setting.key]}
                </span>
                {expandedSetting === setting.key ? (
                  <ChevronUp className="h-3 w-3 opacity-70" />
                ) : (
                  <ChevronDown className="h-3 w-3 opacity-70" />
                )}
              </button>
              {expandedSetting === setting.key && (
                <div className="mx-1 mb-1 rounded-xl bg-[#f3c4a2]/9 p-1 dark:bg-[#685c20]/8">
                  {setting.options.map((option) => {
                    const active = quickConfig[setting.key] === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          updateQuickConfig(setting.key, option);
                          if (setting.key !== "period" || (option !== "Personalizado" && option !== "Mensal")) {
                            setExpandedSetting(null);
                          }
                        }}
                        className={cn(
                          "grid w-full cursor-pointer grid-cols-[1fr_auto] items-center rounded-lg px-2 py-1.5 text-left text-[0.65625rem] transition-colors",
                          active
                            ? "font-semibold text-[#f3c4a2] dark:text-[#685c20]"
                            : "text-[#f3c4a2]/72 hover:bg-[#f3c4a2]/8 dark:text-[#685c20]/72 dark:hover:bg-[#685c20]/8",
                        )}
                      >
                        <span>{option}</span>
                        {active && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                      </button>
                    );
                  })}
                  {setting.key === "period" && quickConfig.period === "Personalizado" && (
                    <input
                      type="date"
                      value={customDate}
                      onChange={(event) => setCustomDate(event.target.value)}
                      className="mt-1 w-full rounded-lg bg-[#f3c4a2]/14 px-2 py-1.5 text-[0.65625rem] font-medium text-[#f3c4a2] outline-none dark:bg-[#685c20]/12 dark:text-[#685c20]"
                      aria-label="Data personalizada da agenda"
                    />
                  )}
                  {setting.key === "period" && quickConfig.period === "Mensal" && (
                    <input
                      type="month"
                      value={customMonth}
                      onChange={(event) => setCustomMonth(event.target.value)}
                      className="mt-1 w-full rounded-lg bg-[#f3c4a2]/14 px-2 py-1.5 text-[0.65625rem] font-medium text-[#f3c4a2] outline-none dark:bg-[#685c20]/12 dark:text-[#685c20]"
                      aria-label="Mês da agenda"
                    />
                  )}
                </div>
              )}
            </div>
          ))}

          <div className="mt-1">
            <button
              type="button"
              onClick={() =>
                setQuickConfig((current) => ({
                  ...current,
                  mode: "custom",
                  summary: current.summary === "Padrão do sistema" ? "Personalizado" : current.summary,
                  alarm: current.alarm === "Ligado" ? "Desligado" : "Ligado",
                }))
              }
              className="grid w-full cursor-pointer grid-cols-[1fr_auto_auto] items-center gap-2 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-[#f3c4a2]/8 dark:hover:bg-[#685c20]/8"
              aria-pressed={quickConfig.alarm === "Ligado"}
            >
              <span className="min-w-0 truncate text-[0.65625rem] font-medium text-[#f3c4a2]/72 dark:text-[#685c20]/70">
                Despertador
              </span>
              <span className="min-w-0 truncate text-right text-[0.6875rem] font-semibold text-[#f3c4a2] dark:text-[#685c20]">
                {quickConfig.alarm}
              </span>
              <span
                className={cn(
                  "relative h-4 w-7 rounded-full transition-colors",
                  quickConfig.alarm === "Ligado"
                    ? "bg-[#f3c4a2] dark:bg-[#685c20]"
                    : "bg-[#f3c4a2]/22 dark:bg-[#685c20]/22"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 h-3 w-3 rounded-full transition-transform",
                    quickConfig.alarm === "Ligado"
                      ? "translate-x-3.5 bg-[#685c20] dark:bg-[#f3c4a2]"
                      : "translate-x-0.5 bg-[#f3c4a2]/70 dark:bg-[#685c20]/70"
                  )}
                />
              </span>
            </button>
          </div>

          <div className="mt-1">
            <button
              type="button"
              onClick={() => {
                setQuickModeOpen(false);
                setExpandedSetting(null);
                setExpandedAlertSetting(null);
                setAlertConfig((current) => ({
                  ...current,
                  enabled: !current.enabled,
                  status: current.enabled ? "cancelled" : "attention",
                }));
              }}
              className="grid w-full cursor-pointer grid-cols-[auto_1fr_auto_auto] items-center gap-2 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-[#f3c4a2]/8 dark:hover:bg-[#685c20]/8"
              aria-pressed={alertConfig.enabled}
            >
              <span className={cn("h-2.5 w-2.5 rounded-full", alertStatusClasses[alertConfig.status])} />
              <span className="min-w-0 truncate text-[0.65625rem] font-medium text-[#f3c4a2]/72 dark:text-[#685c20]/70">
                Alerta
              </span>
              <span className="min-w-0 truncate text-right text-[0.6875rem] font-semibold text-[#f3c4a2] dark:text-[#685c20]">
                {alertConfig.enabled ? "Ligado" : "Desligado"}
              </span>
              <span
                className={cn(
                  "relative h-4 w-7 rounded-full transition-colors",
                  alertConfig.enabled
                    ? "bg-[#f3c4a2] dark:bg-[#685c20]"
                    : "bg-[#f3c4a2]/22 dark:bg-[#685c20]/22"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 h-3 w-3 rounded-full transition-transform",
                    alertConfig.enabled
                      ? "translate-x-3.5 bg-[#685c20] dark:bg-[#f3c4a2]"
                      : "translate-x-0.5 bg-[#f3c4a2]/70 dark:bg-[#685c20]/70"
                  )}
                />
              </span>
            </button>
            {false && (
              <div className="px-1 pb-1">
                <button
                  type="button"
                  onClick={() =>
                    setAlertConfig((current) => ({
                      ...current,
                      enabled: !current.enabled,
                      status: current.enabled ? "cancelled" : "attention",
                    }))
                  }
                  className="grid w-full cursor-pointer grid-cols-[1fr_auto] items-center border-t border-[#f3c4a2]/10 px-2 py-1.5 text-left text-[0.65625rem] transition-colors hover:bg-[#f3c4a2]/8 dark:border-[#685c20]/10 dark:hover:bg-[#685c20]/8"
                  aria-pressed={alertConfig.enabled}
                >
                  <span className="font-medium text-[#f3c4a2]/72 dark:text-[#685c20]/72">
                    Usar alerta
                  </span>
                  <span
                    className={cn(
                      "relative h-4 w-7 rounded-full transition-colors",
                      alertConfig.enabled
                        ? "bg-[#f3c4a2] dark:bg-[#685c20]"
                        : "bg-[#f3c4a2]/22 dark:bg-[#685c20]/22"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 h-3 w-3 rounded-full transition-transform",
                        alertConfig.enabled
                          ? "translate-x-3.5 bg-[#685c20] dark:bg-[#f3c4a2]"
                          : "translate-x-0.5 bg-[#f3c4a2]/70 dark:bg-[#685c20]/70"
                      )}
                    />
                  </span>
                </button>
                {alertSettings.map((setting) => (
                  <div
                    key={setting.key}
                    className={cn(
                      "border-t border-[#f3c4a2]/10 dark:border-[#685c20]/10",
                      !alertConfig.enabled && "opacity-45"
                    )}
                  >
                    <button
                      type="button"
                      disabled={!alertConfig.enabled}
                      onClick={() =>
                        setExpandedAlertSetting((current) =>
                          current === setting.key ? null : setting.key,
                        )
                      }
                      className={cn(
                        "grid w-full grid-cols-[1fr_auto_auto] items-center gap-2 rounded-xl px-2 py-1.5 text-left text-[0.65625rem] transition-colors",
                        alertConfig.enabled
                          ? "cursor-pointer hover:bg-[#f3c4a2]/8 dark:hover:bg-[#685c20]/8"
                          : "cursor-not-allowed"
                      )}
                    >
                      <span className="font-medium text-[#f3c4a2]/72 dark:text-[#685c20]/72">
                        {setting.label}
                      </span>
                      <span className="font-semibold text-[#f3c4a2] dark:text-[#685c20]">
                        {setting.value}
                      </span>
                      {expandedAlertSetting === setting.key ? (
                        <ChevronUp className="h-3 w-3 opacity-70" />
                      ) : (
                        <ChevronDown className="h-3 w-3 opacity-70" />
                      )}
                    </button>
                    {expandedAlertSetting === setting.key && alertConfig.enabled && (
                      <div className="mx-1 mb-1 rounded-xl bg-[#f3c4a2]/7 p-1 dark:bg-[#685c20]/7">
                        {setting.options.map((option) => {
                          const active = setting.value === option;
                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() => {
                                updateAlertConfig(setting.key as "when" | "status", option);
                                setExpandedAlertSetting(null);
                              }}
                              className={cn(
                                "grid w-full cursor-pointer grid-cols-[1fr_auto] items-center rounded-lg px-2 py-1.5 text-left text-[0.65625rem] transition-colors",
                                active
                                  ? "font-semibold text-[#f3c4a2] dark:text-[#685c20]"
                                  : "text-[#f3c4a2]/72 hover:bg-[#f3c4a2]/8 dark:text-[#685c20]/72 dark:hover:bg-[#685c20]/8",
                              )}
                            >
                              <span>{option}</span>
                              {active && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {hasQuickChanges && (
            <div className="mt-2 flex items-center justify-between gap-2 border-t border-[#f3c4a2]/12 pt-2 dark:border-[#685c20]/12">
              <button
                type="button"
                onClick={restoreSystemConfig}
                className="cursor-pointer px-1 text-[0.625rem] font-medium text-[#f3c4a2]/64 hover:text-[#f3c4a2] dark:text-[#685c20]/64 dark:hover:text-[#685c20]"
              >
                Voltar ao padrão
              </button>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={cancelQuickChanges}
                  className="cursor-pointer rounded-full px-2.5 py-1 text-[0.625rem] font-medium text-[#f3c4a2]/70 hover:bg-[#f3c4a2]/8 hover:text-[#f3c4a2] dark:text-[#685c20]/70 dark:hover:bg-[#685c20]/8 dark:hover:text-[#685c20]"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={saveQuickChanges}
                  className="cursor-pointer rounded-full bg-[#f3c4a2] px-3 py-1 text-[0.625rem] font-semibold text-[#685c20] dark:bg-[#685c20] dark:text-[#f3c4a2]"
                >
                  Salvar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {createOpen && (
        <div
          ref={createPanelRef}
          className="mb-2 rounded-2xl bg-[#685c20] px-3 py-2.5 text-[0.65625rem] text-[#f3c4a2] dark:bg-[#f3c4a2] dark:text-[#685c20]"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <span className="text-[0.6875rem] font-semibold">Novo compromisso</span>
            <span className="text-[0.625rem] text-[#f3c4a2]/60 dark:text-[#685c20]/60">
              Visual
            </span>
          </div>
          <div className="hidden grid-cols-2 gap-1.5">
            <input
              type="date"
              className="rounded-xl bg-[#f3c4a2]/12 px-2 py-1.5 text-[0.65625rem] font-medium text-[#f3c4a2] outline-none dark:bg-[#685c20]/10 dark:text-[#685c20]"
              aria-label="Data do compromisso"
            />
            <input
              type="time"
              className="rounded-xl bg-[#f3c4a2]/12 px-2 py-1.5 text-[0.65625rem] font-medium text-[#f3c4a2] outline-none dark:bg-[#685c20]/10 dark:text-[#685c20]"
              aria-label="Horário do compromisso"
            />
          </div>
          <div className="mt-1.5">
            <div className="flex h-8 items-center gap-1 rounded-xl bg-[#f3c4a2]/12 px-1.5 dark:bg-[#685c20]/10">
              <button
                type="button"
                onClick={() => setCreateAttachmentOpen((value) => !value)}
                className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#f3c4a2]/78 transition-colors hover:bg-[#f3c4a2]/10 hover:text-[#f3c4a2] dark:text-[#685c20]/78 dark:hover:bg-[#685c20]/10 dark:hover:text-[#685c20]"
                aria-label="Inserir câmera, galeria ou vídeo"
                aria-expanded={createAttachmentOpen}
              >
                <Plus className="h-4 w-4 stroke-[2]" />
              </button>
              <input
                type="text"
                placeholder="Compromisso"
                value={newAgendaTitle}
                onChange={(event) => setNewAgendaTitle(event.target.value)}
                className="min-w-0 flex-1 bg-transparent px-1 text-[0.65625rem] font-medium text-[#f3c4a2] outline-none placeholder:text-[#f3c4a2]/45 dark:text-[#685c20] dark:placeholder:text-[#685c20]/45"
              />
              <button
                type="button"
                onClick={() => toast.info("Compromisso por áudio - em breve")}
                className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#f3c4a2]/78 transition-colors hover:bg-[#f3c4a2]/10 hover:text-[#f3c4a2] dark:text-[#685c20]/78 dark:hover:bg-[#685c20]/10 dark:hover:text-[#685c20]"
                aria-label="Inserir compromisso por áudio"
              >
                <Mic className="h-3.5 w-3.5 stroke-[2]" />
              </button>
            </div>
            {createAttachmentOpen && (
              <div className="mt-1 grid grid-cols-3 gap-1 rounded-xl bg-[#f3c4a2]/8 p-1 dark:bg-[#685c20]/8">
                <button
                  type="button"
                  onClick={() => toast.info("Abrir câmera - em breve")}
                  className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[0.625rem] font-medium text-[#f3c4a2]/76 transition-colors hover:bg-[#f3c4a2]/8 hover:text-[#f3c4a2] dark:text-[#685c20]/76 dark:hover:bg-[#685c20]/8 dark:hover:text-[#685c20]"
                >
                  <Image className="h-3.5 w-3.5" />
                  Câmera
                </button>
                <button
                  type="button"
                  onClick={() => toast.info("Abrir galeria - em breve")}
                  className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[0.625rem] font-medium text-[#f3c4a2]/76 transition-colors hover:bg-[#f3c4a2]/8 hover:text-[#f3c4a2] dark:text-[#685c20]/76 dark:hover:bg-[#685c20]/8 dark:hover:text-[#685c20]"
                >
                  <Image className="h-3.5 w-3.5" />
                  Galeria
                </button>
                <button
                  type="button"
                  onClick={() => toast.info("Inserir vídeo na agenda - em breve")}
                  className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[0.625rem] font-medium text-[#f3c4a2]/76 transition-colors hover:bg-[#f3c4a2]/8 hover:text-[#f3c4a2] dark:text-[#685c20]/76 dark:hover:bg-[#685c20]/8 dark:hover:text-[#685c20]"
                >
                  <Video className="h-3.5 w-3.5" />
                  Vídeo
                </button>
              </div>
            )}
          </div>
          <div className="mt-1.5 space-y-1">
            <button
              type="button"
              onClick={() => setCreateDateTimeOpen((value) => !value)}
              className="grid w-full cursor-pointer grid-cols-[1fr_auto_auto] items-center gap-2 rounded-xl bg-[#f3c4a2]/8 px-2 py-1.5 text-left transition-colors hover:bg-[#f3c4a2]/12 dark:bg-[#685c20]/8 dark:hover:bg-[#685c20]/12"
              aria-expanded={createDateTimeOpen}
            >
              <span className="text-[0.65625rem] font-medium text-[#f3c4a2]/76 dark:text-[#685c20]/76">
                {newAgendaDate ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(new Date(`${newAgendaDate}T00:00:00`)) : "Hoje"} · {newAgendaTime || "Sem horário"}
              </span>
              <span className="text-[0.625rem] text-[#f3c4a2]/52 dark:text-[#685c20]/52">Data</span>
              {createDateTimeOpen ? <ChevronUp className="h-3 w-3 opacity-70" /> : <ChevronDown className="h-3 w-3 opacity-70" />}
            </button>
            {createDateTimeOpen && (
              <div className="grid grid-cols-2 gap-1 rounded-xl bg-[#f3c4a2]/8 p-1 dark:bg-[#685c20]/8">
                <input
                  type="date"
                  value={newAgendaDate}
                  onChange={(event) => setNewAgendaDate(event.target.value)}
                  className="rounded-lg bg-[#f3c4a2]/10 px-2 py-1.5 text-[0.65625rem] font-medium text-[#f3c4a2] outline-none dark:bg-[#685c20]/10 dark:text-[#685c20]"
                  aria-label="Data do compromisso"
                />
                <input
                  type="time"
                  value={newAgendaTime}
                  onChange={(event) => setNewAgendaTime(event.target.value)}
                  className="rounded-lg bg-[#f3c4a2]/10 px-2 py-1.5 text-[0.65625rem] font-medium text-[#f3c4a2] outline-none dark:bg-[#685c20]/10 dark:text-[#685c20]"
                  aria-label="Horário do compromisso"
                />
              </div>
            )}
            <button
              type="button"
              onClick={() => setCreateOwnerOpen((value) => !value)}
              className="grid w-full cursor-pointer grid-cols-[1fr_auto] items-center gap-2 rounded-xl bg-[#f3c4a2]/8 px-2 py-1.5 text-left transition-colors hover:bg-[#f3c4a2]/12 dark:bg-[#685c20]/8 dark:hover:bg-[#685c20]/12"
              aria-expanded={createOwnerOpen}
            >
              <span className="min-w-0 truncate text-[0.65625rem] font-medium text-[#f3c4a2]/76 dark:text-[#685c20]/76">
                {newAgendaOwner === "Para mim" ? `${newAgendaOwner} · ${currentOperatorName}` : newAgendaOwner}
              </span>
              {createOwnerOpen ? <ChevronUp className="h-3 w-3 opacity-70" /> : <ChevronDown className="h-3 w-3 opacity-70" />}
            </button>
          </div>
          {createOwnerOpen && (
          <div className="mt-1 rounded-xl bg-[#f3c4a2]/8 p-1 dark:bg-[#685c20]/8">
            {["Para mim", "Atendimento", "Produção", "Caixa"].map((option) => {
              const disabled = option !== "Para mim" && !canCreateForOthers;
              const active = newAgendaOwner === option;
              return (
                <button
                  key={option}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    setNewAgendaOwner(option);
                    setCreateOwnerOpen(false);
                  }}
                  className={cn(
                    "grid w-full grid-cols-[1fr_auto] items-center rounded-lg px-2 py-1.5 text-left text-[0.65625rem] transition-colors",
                    disabled
                      ? "cursor-not-allowed text-[#f3c4a2]/34 dark:text-[#685c20]/34"
                      : "cursor-pointer text-[#f3c4a2]/74 hover:bg-[#f3c4a2]/8 dark:text-[#685c20]/74 dark:hover:bg-[#685c20]/8",
                    active && !disabled && "font-semibold text-[#f3c4a2] dark:text-[#685c20]",
                  )}
                >
                  <span>{option === "Para mim" ? `${option} · ${currentOperatorName}` : option}</span>
                  {disabled && <span className="text-[0.5625rem]">requer autorização</span>}
                  {active && !disabled && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                </button>
              );
            })}
          </div>
          )}
          {!canCreateForOthers && (
            <p className="mt-1.5 text-[0.625rem] leading-snug text-[#f3c4a2]/58 dark:text-[#685c20]/58">
              Criar para outro colaborador exige autorização do gerente e comunica o responsável.
            </p>
          )}
          {canCreateForOthers && (
            <p className="mt-1.5 text-[0.625rem] leading-snug text-[#f3c4a2]/58 dark:text-[#685c20]/58">
              Ao criar para outro colaborador, o sistema deve comunicar o responsável e registrar auditoria.
            </p>
          )}
          <div className="mt-2 flex justify-end gap-1.5">
            <button
              type="button"
              onClick={() => {
                setCreateOpen(false);
                resetNewAgendaForm();
              }}
              className="cursor-pointer rounded-full px-2.5 py-1 text-[0.625rem] font-medium text-[#f3c4a2]/70 hover:bg-[#f3c4a2]/8 hover:text-[#f3c4a2] dark:text-[#685c20]/70 dark:hover:bg-[#685c20]/8 dark:hover:text-[#685c20]"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={saveNewAgenda}
              disabled={savingNewAgenda}
              className="cursor-pointer rounded-full bg-[#f3c4a2] px-3 py-1 text-[0.625rem] font-semibold text-[#685c20] dark:bg-[#685c20] dark:text-[#f3c4a2]"
            >
              {savingNewAgenda ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col justify-center gap-1.5">
        {visibleItems.map((item) => {
          const key = `${item.time}-${item.label}`;
          const priority = item.priority ?? "info";
          const selected = selectedItem === key;
          const markerClass = priorityClasses[priority];
          const completed = item.completed ?? false;

          return (
            <div key={key}>
              <div
                className={cn(
                  "grid w-full cursor-pointer grid-cols-[0.55rem_1fr_4.25rem] items-center gap-1.5 rounded-xl px-0 py-0.5 text-sm transition-colors hover:bg-[#685c20]/5 dark:hover:bg-[#f3c4a2]/7",
                  selected && "bg-[#685c20]/6 dark:bg-[#f3c4a2]/8",
                )}
              >
                {completed ? (
                  <Check
                    className="h-3.5 w-3.5 -ml-0.5 text-[#1f1f1a] stroke-[2.6] dark:text-[#1f1f1a]"
                    aria-label="Compromisso concluído"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      toast.info(priorityLabels[priority]);
                    }}
                    className={cn(
                      "h-2.5 w-2.5 cursor-pointer rounded-full transition-transform hover:scale-125 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-current",
                      markerClass,
                    )}
                    aria-label={`Status da agenda: ${priorityLabels[priority]}`}
                  />
                )}
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedItem((value) => (value === key ? null : key));
                  }}
                  className={cn("contents", completed && "cursor-pointer")}
                >
                  <span
                    className={cn(
                      "truncate text-left text-[0.75rem] font-light text-[#685c20]/90 dark:text-[#f3c4a2]/90",
                      completed && "text-[#685c20]/48 line-through decoration-[#685c20]/38 decoration-[0.5px] dark:text-[#f3c4a2]/48 dark:decoration-[#f3c4a2]/38"
                    )}
                  >
                    {item.label}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center justify-end gap-0.5 text-right text-[0.65625rem] tabular-nums",
                      completed
                        ? "text-[#685c20]/58 dark:text-[#f3c4a2]/58"
                        : item.overdue
                        ? "font-semibold text-red-700 dark:text-red-300"
                        : "text-[#685c20]/54 dark:text-[#f3c4a2]/54",
                    )}
                  >
                    {item.alertEnabled && (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSettingsOpen(true);
                          setExpandedSetting("alert");
                        }}
                        className="cursor-pointer"
                        aria-label="Configurar alerta da agenda"
                      >
                        <Bell className="h-2.5 w-2.5" />
                      </button>
                    )}
                    {item.time}
                  </span>
                </button>
              </div>
              {selected && (
                <div
                  className="ml-[1.9rem] mt-1 flex items-center gap-1.5 text-[0.625rem]"
                  onClick={(event) => event.stopPropagation()}
                >
                  {completed ? (
                    <>
                      <span className="text-[#685c20]/54 dark:text-[#f3c4a2]/54">
                        Cumprido · histórico sem edição
                      </span>
                      <button
                        type="button"
                        onClick={() => toast.info("Registro permanente da agenda - consulta permitida.")}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-[#685c20]/7 px-2 py-1 font-medium text-[#685c20]/78 hover:bg-[#685c20]/10 dark:bg-[#f3c4a2]/8 dark:text-[#f3c4a2]/82 dark:hover:bg-[#f3c4a2]/12"
                      >
                        Ver registro
                      </button>
                    </>
                  ) : (
                    ["Ajustar", "Alertar", "Concluir"].map((action) => (
                      <button
                        key={action}
                        type="button"
                        onClick={() => toast.info(`${action} agenda - em breve`)}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-[#685c20]/7 px-2 py-1 font-medium text-[#685c20]/78 hover:bg-[#685c20]/10 dark:bg-[#f3c4a2]/8 dark:text-[#f3c4a2]/82 dark:hover:bg-[#f3c4a2]/12"
                      >
                        {action === "Alertar" && <Bell className="h-3 w-3" />}
                        {action}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
        {emptyMessage && (
          <p className="pt-1 text-center text-[0.6875rem] font-light text-[#685c20]/50 dark:text-[#f3c4a2]/52">
            {emptyMessage}
          </p>
        )}
      </div>
    </section>
  );
}
