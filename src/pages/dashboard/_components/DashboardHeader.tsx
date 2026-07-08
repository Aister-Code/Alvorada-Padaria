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

export default function DashboardHeader({
  operatorName,
  role,
  unit,
  showUnit = false,
  healthItems = [],
  interfaceScale,
  onInterfaceScaleChange,
  onLogout,
}: Props) {
  const [showHelp, setShowHelp] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const unitLabel = formatUnitLabel(unit);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 bg-[#d5d4c8]/92 px-4 py-2.5 text-[#5d5822] backdrop-blur-sm dark:bg-[#5d5822]/92 dark:text-[#f8c6aa] md:px-6">
      <div className="flex min-w-0 items-center gap-2.5">
        <AlvoradaLogo variant="icon" size="sm" />
        <div className="hidden min-w-0 sm:block">
          <p className="truncate text-[14.5px] font-semibold leading-[1.05]">
            {operatorName}
          </p>
          {showUnit && (
            <p className="truncate text-[10px] font-light leading-tight text-[#5d5822]/68 dark:text-[#f8c6aa]/68">
              {unitLabel}
            </p>
          )}
        </div>
        <div className="min-w-0 sm:hidden">
          <p className="text-[14.5px] font-semibold leading-[1.05]">
            {operatorName}
          </p>
          {showUnit && (
            <p className="truncate text-[10px] font-light leading-tight text-[#5d5822]/68 dark:text-[#f8c6aa]/68">
              {unitLabel}
            </p>
          )}
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
          className="cursor-pointer rounded-full p-2 text-[#5d5822]/62 transition-colors hover:text-[#5d5822] focus:outline-none dark:text-[#f8c6aa]/62 dark:hover:text-[#f8c6aa]"
          aria-label="Alternar tema"
        >
          {isDark ? <Sun className="h-[1.15rem] w-[1.15rem] stroke-[1.8]" /> : <Moon className="h-[1.15rem] w-[1.15rem] stroke-[1.8]" />}
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
