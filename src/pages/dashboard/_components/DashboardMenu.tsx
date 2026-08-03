import {
  Activity,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  HelpCircle,
  LogOut,
  Menu,
  Repeat2,
  Settings,
  User,
  Warehouse,
  ZoomIn,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils.ts";
import {
  calculateOperationalHealthScore,
  getOperationalHealthLevel,
  type HealthItem,
  type HealthLevel,
  type HealthStatus,
} from "../_lib/operationalHealth.ts";
import type { InterfaceScale } from "./InterfaceScalePopover.tsx";

const scaleOptions: { value: InterfaceScale; label: string; name: string }[] = [
  { value: "small", label: "aa", name: "Zoom pequeno" },
  { value: "normal", label: "Aa", name: "Zoom normal" },
  { value: "large", label: "AA", name: "Zoom grande" },
];

type Props = {
  contextualItems?: string[];
  healthItems?: HealthItem[];
  availableOperationalModes?: string[];
  currentOperationalMode?: string;
  onOperationalModeChange?: (mode: string) => void;
  interfaceScale?: InterfaceScale;
  onInterfaceScaleChange?: (value: InterfaceScale) => void;
  onHelp: () => void;
  onLogout: () => void;
  onFutureAction: (label: string) => void;
  compact?: boolean;
};

export default function DashboardMenu({
  contextualItems,
  healthItems = [],
  availableOperationalModes,
  currentOperationalMode,
  onOperationalModeChange,
  interfaceScale,
  onInterfaceScaleChange,
  onHelp,
  onLogout,
  onFutureAction,
  compact = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [modeOpen, setModeOpen] = useState(false);
  const [healthOpen, setHealthOpen] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [introPulse, setIntroPulse] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current || menuRef.current.contains(event.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (healthItems.length === 0 || typeof window === "undefined") return;
    const key = "rvl-health-intro-seen";
    if (window.sessionStorage.getItem(key)) return;
    window.sessionStorage.setItem(key, "true");
    setIntroPulse(true);
    const timer = window.setTimeout(() => setIntroPulse(false), 4800);
    return () => window.clearTimeout(timer);
  }, [healthItems.length]);

  useEffect(() => {
    if (!open || healthItems.length === 0) return;
    setHealthOpen(true);
    const timer = window.setTimeout(() => setHealthOpen(false), 7200);
    return () => window.clearTimeout(timer);
  }, [open, healthItems.length]);

  const runAndClose = (action: () => void) => {
    setOpen(false);
    setModeOpen(false);
    setZoomOpen(false);
    action();
  };

  const hasOperationalModes = Boolean(availableOperationalModes?.length && onOperationalModeChange);
  const hasInterfaceScale = Boolean(interfaceScale && onInterfaceScaleChange);
  const hasContextualHelp = contextualItems?.some((item) => item.toLowerCase() === "ajuda");
  const healthScore = healthItems.length > 0 ? calculateOperationalHealthScore(healthItems) : null;
  const healthLevel = healthScore === null ? "green" : getOperationalHealthLevel(healthScore);
  const hasHealthAlert = healthItems.length > 0 && healthLevel !== "green";
  const healthAttentionItems = healthItems.filter((item) => item.status !== "online");
  const shouldSignalMenu = hasHealthAlert || introPulse;

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "relative inline-flex cursor-pointer items-center justify-center rounded-full text-[#685c20]/62 transition-colors hover:text-[#685c20] focus:outline-none dark:text-[#f3c4a2]/62 dark:hover:text-[#f3c4a2]",
          compact ? "h-8 w-8 p-0" : "p-2",
          shouldSignalMenu && "text-[#685c20] dark:text-[#f3c4a2]",
          introPulse && "animate-pulse",
        )}
        aria-label="Menu"
        aria-expanded={open}
      >
        {introPulse ? (
          <Activity className="h-[1.15rem] w-[1.15rem] stroke-[1.8]" />
        ) : (
          <Menu className="h-[1.15rem] w-[1.15rem] stroke-[1.8]" />
        )}
        {shouldSignalMenu && (
          <span
            className={cn(
              "absolute right-1 top-1 h-1.5 w-1.5 rounded-full",
              introPulse && !hasHealthAlert ? "bg-emerald-500" : healthLevelDotClasses[healthLevel],
            )}
          />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-40 w-60 animate-in fade-in-0 slide-in-from-top-1 rounded-2xl bg-[#685c20] p-2 text-[#fff4e8] duration-150 dark:bg-[#f3c4a2] dark:text-[#685c20]">
          <MenuItem icon={User} label="Meu perfil" onClick={() => runAndClose(() => onFutureAction("Meu perfil"))} />
          {healthItems.length > 0 && (
            <>
              <div className="px-3 py-2">
                <button
                  type="button"
                  onClick={() => setHealthOpen((value) => !value)}
                  className="flex w-full cursor-pointer items-center gap-2 text-left focus:outline-none"
                  aria-expanded={healthOpen}
                >
                  <Activity className="h-4 w-4 shrink-0 stroke-[1.8]" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold leading-tight">Saúde do sistema</p>
                    <p className="text-[10.5px] font-light leading-tight opacity-70">ISO {healthScore}%</p>
                  </div>
                  <span className={cn("h-2 w-2 rounded-full", healthLevelDotClasses[healthLevel])} />
                  <span className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-current/7 text-current/72 transition-colors hover:bg-current/12 hover:text-current">
                    {healthOpen ? <ChevronUp className="h-3.5 w-3.5 stroke-[1.6]" /> : <ChevronDown className="h-3.5 w-3.5 stroke-[1.6]" />}
                    {!healthOpen && shouldSignalMenu && (
                      <span
                        className={cn(
                          "absolute right-0 top-0 h-1.5 w-1.5 rounded-full",
                          introPulse && !hasHealthAlert ? "bg-emerald-500" : healthLevelDotClasses[healthLevel],
                        )}
                      />
                    )}
                  </span>
                </button>

                {healthOpen && (
                  <div className="mt-2 space-y-1.5 border-t border-current/10 pt-2">
                    {(healthAttentionItems.length > 0 ? healthAttentionItems : healthItems).slice(0, 4).map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-2 text-[10.5px] leading-tight">
                        <span className="truncate opacity-82">{item.label}</span>
                        <span className="shrink-0 opacity-68">{healthStatusLabels[item.status]}</span>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => runAndClose(() => onFutureAction("Relatórios de saúde"))}
                      className="mt-2 flex w-full cursor-pointer items-center gap-2 rounded-lg bg-current/7 px-2 py-1.5 text-[10.5px] font-medium transition-colors hover:bg-current/12 focus:outline-none"
                    >
                      <FileText className="h-3.5 w-3.5 stroke-[1.6]" />
                      Relatórios de saúde
                    </button>
                  </div>
                )}
              </div>
              <div className="my-1 h-px bg-current/10" />
            </>
          )}

          {contextualItems?.map((item) => (
            <MenuItem
              key={item}
              icon={Settings}
              label={item}
              onClick={() => runAndClose(() => (item === "Ajuda" ? onHelp() : onFutureAction(item)))}
            />
          ))}
          {Boolean(contextualItems?.length) && <div className="my-1 h-px bg-current/10" />}
          <MenuItem icon={Warehouse} label="Trocar unidade" onClick={() => runAndClose(() => onFutureAction("Trocar unidade"))} />
          <MenuItem
            icon={Repeat2}
            label="Trocar modo operacional"
            onClick={() => {
              if (!hasOperationalModes) {
                runAndClose(() => onFutureAction("Trocar modo operacional"));
                return;
              }
              setModeOpen((value) => !value);
            }}
          />
          {modeOpen && hasOperationalModes && (
            <div className="mb-1 mt-0.5 rounded-xl bg-[#fff4e8]/8 px-1 py-1 dark:bg-[#685c20]/7">
              {availableOperationalModes!.map((mode) => {
                const active = mode === currentOperationalMode;
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => runAndClose(() => onOperationalModeChange!(mode))}
                    className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-[11px] font-medium text-[#fff4e8] transition-colors hover:bg-[#fff4e8]/10 focus:outline-none dark:text-[#685c20] dark:hover:bg-[#685c20]/8"
                  >
                    <span>{mode}</span>
                    {active && <Check className="h-3.5 w-3.5 stroke-[1.9]" />}
                  </button>
                );
              })}
            </div>
          )}
          {hasInterfaceScale && (
            <div className="my-1">
              <button
                type="button"
                onClick={() => setZoomOpen((value) => !value)}
                className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium text-[#fff4e8] transition-colors hover:bg-[#fff4e8]/10 focus:outline-none dark:text-[#685c20] dark:hover:bg-[#685c20]/8"
                aria-expanded={zoomOpen}
              >
                <ZoomIn className="h-4 w-4 shrink-0 stroke-[1.8]" />
                <span className="min-w-0 flex-1">Zoom da tela</span>
                <span className="shrink-0 text-[11px] font-semibold opacity-72">
                  {scaleOptions.find((option) => option.value === interfaceScale)?.label ?? "Aa"}
                </span>
                <span className="relative flex h-4 w-4 shrink-0 items-center justify-center text-current/72 transition-colors hover:text-current">
                  {zoomOpen ? <ChevronUp className="h-3.5 w-3.5 stroke-[1.6]" /> : <ChevronDown className="h-3.5 w-3.5 stroke-[1.6]" />}
                </span>
              </button>

              {zoomOpen && (
                <div className="mx-3 mb-1 grid grid-cols-3 gap-1 rounded-xl bg-[#fff4e8]/8 p-1 dark:bg-[#685c20]/7">
                  {scaleOptions.map((option) => {
                    const active = option.value === interfaceScale;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => onInterfaceScaleChange!(option.value)}
                        className={cn(
                          "h-8 cursor-pointer rounded-lg text-xs font-semibold transition-colors focus:outline-none",
                          active
                            ? "bg-[#fff4e8] text-[#685c20] dark:bg-[#685c20] dark:text-[#f3c4a2]"
                            : "text-current/72 hover:bg-current/10 hover:text-current",
                        )}
                        aria-label={option.name}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          {!hasContextualHelp && <MenuItem icon={HelpCircle} label="Ajuda" onClick={() => runAndClose(onHelp)} />}
          <MenuItem icon={Settings} label="Configurações" onClick={() => runAndClose(() => onFutureAction("Configurações"))} />
          <div className="my-1 h-px bg-current/10" />
          <MenuItem icon={LogOut} label="Sair" onClick={() => runAndClose(onLogout)} />
        </div>
      )}
    </div>
  );
}

const healthLevelDotClasses: Record<HealthLevel, string> = {
  green: "bg-emerald-500",
  yellow: "bg-amber-400",
  orange: "bg-orange-500",
  red: "bg-red-600",
};

const healthStatusLabels: Record<HealthStatus, string> = {
  online: "Online",
  warning: "Atenção",
  offline: "Offline",
  pending: "Pendente",
};

function MenuItem({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium text-[#fff4e8] transition-colors hover:bg-[#fff4e8]/10 focus:outline-none dark:text-[#685c20] dark:hover:bg-[#685c20]/8"
    >
      <Icon className="h-4 w-4 stroke-[1.8]" />
      {label}
    </button>
  );
}
