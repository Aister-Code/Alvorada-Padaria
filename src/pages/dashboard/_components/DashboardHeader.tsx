import { Moon, Sun } from "lucide-react";
import { useState } from "react";
import { useTheme } from "next-themes";
import AlvoradaLogo from "@/components/branding/AlvoradaLogo.tsx";
import OperationalHealthPopover from "./OperationalHealthPopover.tsx";
import type { HealthItem } from "../_lib/operationalHealth.ts";
import DashboardMenu from "./DashboardMenu.tsx";
import DashboardHelpPanel from "./DashboardHelpPanel.tsx";
import InterfaceScalePopover, { type InterfaceScale } from "./InterfaceScalePopover.tsx";
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
}: Props) {
  const [showHelp, setShowHelp] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const unitLabel = formatUnitLabel(unit);
  const roleLabel = formatRoleLabel(role);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 bg-white/92 px-4 py-2.5 text-[#1f1f1a] backdrop-blur-sm dark:bg-[#0d0d0b]/94 dark:text-[#f7f2ec] md:px-6">
      <div className="flex min-w-0 items-center gap-2.5">
        <AlvoradaLogo variant="icon" size="sm" />
        <div className="hidden min-w-0 sm:block">
          <p className="truncate text-[calc(14.5px*var(--rvl-font-scale,1))] font-semibold leading-[1.05]">
            {operatorName}
          </p>
          <p className="truncate text-[calc(10px*var(--rvl-font-scale,1))] font-light leading-tight text-[#1f1f1a]/58 dark:text-[#f7f2ec]/58">
            {roleLabel} <span aria-hidden="true">•</span> {unitLabel}
          </p>
        </div>
        <div className="min-w-0 sm:hidden">
          <p className="text-[calc(14.5px*var(--rvl-font-scale,1))] font-semibold leading-[1.05]">
            {operatorName}
          </p>
          <p className="truncate text-[calc(10px*var(--rvl-font-scale,1))] font-light leading-tight text-[#1f1f1a]/58 dark:text-[#f7f2ec]/58">
            {roleLabel} <span aria-hidden="true">•</span> {unitLabel}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {healthItems.length > 0 && (
          <OperationalHealthPopover items={healthItems} />
        )}

        <InterfaceScalePopover
          value={interfaceScale}
          onChange={onInterfaceScaleChange}
        />

        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="cursor-pointer rounded-full p-2 text-[#1f1f1a]/56 transition-colors hover:text-[#685c20] focus:outline-none dark:text-[#f7f2ec]/58 dark:hover:text-[#f3c4a2]"
          aria-label="Alternar tema"
        >
          {isDark ? <Sun className="h-[calc(1.15rem*var(--rvl-font-scale,1))] w-[calc(1.15rem*var(--rvl-font-scale,1))] stroke-[1.8]" /> : <Moon className="h-[calc(1.15rem*var(--rvl-font-scale,1))] w-[calc(1.15rem*var(--rvl-font-scale,1))] stroke-[1.8]" />}
        </button>

        <DashboardMenu
          onHelp={() => setShowHelp(true)}
          onLogout={onLogout}
          onFutureAction={(label) => toast.info(`${label} - em breve`)}
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
