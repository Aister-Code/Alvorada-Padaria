import { Moon, Sun } from "lucide-react";
import { useState } from "react";
import { useTheme } from "next-themes";
import AlvoradaLogo from "@/components/branding/AlvoradaLogo.tsx";
import type { HealthItem } from "../_lib/operationalHealth.ts";
import DashboardMenu from "./DashboardMenu.tsx";
import DashboardHelpPanel from "./DashboardHelpPanel.tsx";
import type { InterfaceScale } from "./InterfaceScalePopover.tsx";
import { toast } from "sonner";

export type AttentionPriority = "info" | "attention" | "important" | "critical";

type Props = {
  operatorName: string;
  role: string;
  unit: string;
  showUnit?: boolean;
  healthItems?: HealthItem[];
  interfaceScale: InterfaceScale;
  onInterfaceScaleChange: (value: InterfaceScale) => void;
  onLogout: () => void;
  compactMargins?: boolean;
};

function formatUnitLabel(value: string) {
  return value
    .replace(/[-_]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function formatRoleLabel(value: string) {
  const normalized = value.trim().toLowerCase();
  const labels: Record<string, string> = {
    admin: "Administração",
    superadmin: "Administração",
    gerente: "Gerente",
    atendimento: "Atendimento",
    atendente: "Atendimento",
    caixa: "Caixa",
    producao: "Produção",
    produção: "Produção",
    delivery: "Delivery",
    estoque: "Estoque",
    financeiro: "Financeiro",
  };

  return labels[normalized] ?? formatUnitLabel(value);
}

export default function DashboardHeader({
  operatorName,
  role,
  unit,
  healthItems = [],
  interfaceScale,
  onInterfaceScaleChange,
  onLogout,
  compactMargins = false,
}: Props) {
  const [showHelp, setShowHelp] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const unitLabel = formatUnitLabel(unit);
  const roleLabel = formatRoleLabel(role);

  return (
    <header
      className={`sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-[#1f1f1a]/12 bg-[#f7f7f4]/96 py-2.5 text-[#1f1f1a] backdrop-blur-sm dark:border-[#f7f2ec]/12 dark:bg-[#151513] dark:text-[#f7f2ec] ${
        compactMargins ? "px-[7.8px] md:px-[7.8px]" : "px-4 md:px-6"
      }`}
    >
      <div className={`flex min-w-0 items-center ${compactMargins ? "gap-[7.8px]" : "gap-2.5"}`}>
        <AlvoradaLogo
          variant="icon"
          size="sm"
          className={compactMargins ? "-translate-x-[2.75px]" : undefined}
        />
        <div className="hidden min-w-0 sm:block">
          <p className="truncate text-[calc(14.5px*var(--rvl-font-scale,1))] font-semibold leading-[1.05]">
            {operatorName}
          </p>
          <p className="truncate text-[calc(10px*var(--rvl-font-scale,1))] font-light leading-tight text-[#1f1f1a]/64 dark:text-[#f7f2ec]/68">
            {roleLabel} <span aria-hidden="true">•</span> {unitLabel}
          </p>
        </div>
        <div className="min-w-0 sm:hidden">
          <p className="text-[calc(14.5px*var(--rvl-font-scale,1))] font-semibold leading-[1.05]">
            {operatorName}
          </p>
          <p className="truncate text-[calc(10px*var(--rvl-font-scale,1))] font-light leading-tight text-[#1f1f1a]/64 dark:text-[#f7f2ec]/68">
            {roleLabel} <span aria-hidden="true">•</span> {unitLabel}
          </p>
        </div>
      </div>

      <div className={`flex shrink-0 items-center justify-end ${compactMargins ? "min-w-[4.75rem] translate-x-[9px] gap-[6px]" : "gap-1"}`}>
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className={`cursor-pointer rounded-full text-[#1f1f1a]/62 transition-colors hover:text-[#685c20] focus:outline-none dark:text-[#f7f2ec]/58 dark:hover:text-[#f3c4a2] ${compactMargins ? "p-1.5" : "p-2"}`}
          aria-label="Alternar tema"
        >
          {isDark ? <Sun className="h-[calc(1.15rem*var(--rvl-font-scale,1))] w-[calc(1.15rem*var(--rvl-font-scale,1))] stroke-[1.8]" /> : <Moon className="h-[calc(1.15rem*var(--rvl-font-scale,1))] w-[calc(1.15rem*var(--rvl-font-scale,1))] stroke-[1.8]" />}
        </button>

        <DashboardMenu
          healthItems={healthItems}
          interfaceScale={interfaceScale}
          onInterfaceScaleChange={onInterfaceScaleChange}
          onHelp={() => setShowHelp(true)}
          onLogout={onLogout}
          onFutureAction={(label) => toast.info(`${label} - em breve`)}
          compact={compactMargins}
        />
      </div>

      <DashboardHelpPanel
        open={showHelp}
        role={role}
        onClose={() => setShowHelp(false)}
      />
    </header>
  );
}
