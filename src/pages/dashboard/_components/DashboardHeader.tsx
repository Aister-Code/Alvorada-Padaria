import { Bell, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils.ts";
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
  pendingCount: number;
  pendingPriority?: AttentionPriority;
  healthItems?: HealthItem[];
  interfaceScale: InterfaceScale;
  onInterfaceScaleChange: (value: InterfaceScale) => void;
  onNotificationsClick: () => void;
  onLogout: () => void;
};

const pendingDotClasses: Record<AttentionPriority, string> = {
  info: "bg-emerald-500",
  attention: "bg-amber-400",
  important: "bg-[#f04a2a]",
  critical: "bg-red-700",
};

export default function DashboardHeader({
  operatorName,
  role,
  unit,
  showUnit = false,
  pendingCount,
  pendingPriority = "info",
  healthItems = [],
  interfaceScale,
  onInterfaceScaleChange,
  onNotificationsClick,
  onLogout,
}: Props) {
  const [showHelp, setShowHelp] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 bg-[#d5d4c8]/92 px-4 py-2.5 text-[#5d5822] backdrop-blur-sm dark:bg-[#5d5822]/92 dark:text-[#f8c6aa] md:px-6">
      <div className="flex min-w-0 items-center gap-2.5">
        <AlvoradaLogo variant="icon" size="sm" />
        <div className="hidden min-w-0 sm:block">
          <p className="truncate text-sm font-medium leading-[1.05]">
            {operatorName}
          </p>
          {showUnit && (
            <p className="truncate text-[10.5px] font-light leading-tight text-[#5d5822]/72 dark:text-[#f8c6aa]/70">
              {unit}
            </p>
          )}
        </div>
        <div className="min-w-0 sm:hidden">
          <p className="text-sm font-medium leading-[1.05]">
            {operatorName}
          </p>
          {showUnit && (
            <p className="truncate text-[10px] font-light leading-tight text-[#5d5822]/72 dark:text-[#f8c6aa]/70">
              {unit}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onNotificationsClick}
          className="relative cursor-pointer rounded-full p-2 text-[#5d5822]/62 transition-colors hover:text-[#5d5822] focus:outline-none dark:text-[#f8c6aa]/62 dark:hover:text-[#f8c6aa]"
          aria-label="Pendências"
        >
          <Bell className="h-[1.15rem] w-[1.15rem] stroke-[1.8]" />
          {pendingCount > 0 && (
            <span
              className={cn(
                "absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold leading-none text-white",
                pendingDotClasses[pendingPriority]
              )}
            >
              {pendingCount > 9 ? "9+" : pendingCount}
            </span>
          )}
        </button>

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
