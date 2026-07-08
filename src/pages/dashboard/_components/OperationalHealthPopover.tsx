import { Activity } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils.ts";
import {
  calculateOperationalHealthScore,
  getOperationalHealthLevel,
  type HealthItem,
  type HealthLevel,
  type HealthStatus,
} from "../_lib/operationalHealth.ts";

type Props = {
  items: HealthItem[];
};

const levelClasses: Record<HealthLevel, string> = {
  green: "bg-emerald-500",
  yellow: "bg-amber-400",
  orange: "bg-[#f04a2a]",
  red: "bg-red-700",
};

const statusLabels: Record<HealthStatus, string> = {
  online: "Online",
  warning: "Atenção",
  offline: "Offline",
  pending: "Pendente",
};

const statusDotClasses: Record<HealthStatus, string> = {
  online: "bg-emerald-500",
  warning: "bg-amber-400",
  offline: "bg-red-700",
  pending: "bg-[#d8c8bb] dark:bg-[#5d5822]/38",
};

export default function OperationalHealthPopover({ items }: Props) {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const score = calculateOperationalHealthScore(items);
  const level = getOperationalHealthLevel(score);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!popoverRef.current || popoverRef.current.contains(event.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  return (
    <div ref={popoverRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative cursor-pointer rounded-full p-2 text-[#5d5822]/70 transition-colors hover:text-[#5d5822] focus:outline-none dark:text-[#f8c6aa]/70 dark:hover:text-[#f8c6aa]"
        aria-label={`Saúde operacional ISO ${score}%`}
        aria-expanded={open}
      >
        <Activity className="h-[1.15rem] w-[1.15rem] stroke-[1.8]" />
        <span className={cn("absolute right-1 top-1 h-2.5 w-2.5 rounded-full", levelClasses[level])} />
      </button>

      {open && (
        <div className="fixed right-4 top-14 z-40 w-[min(16rem,calc(100vw-2rem))] animate-in fade-in-0 slide-in-from-top-1 rounded-2xl bg-[#5d5822] p-4 text-[#fff4e8] duration-150 dark:bg-[#f8c6aa] dark:text-[#5d5822]">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium leading-tight">Saúde Operacional</p>
              <p className="text-[11px] font-medium text-[#d8c8bb] dark:text-[#6f6932]">
                ISO {score}%
              </p>
            </div>
            <span className={cn("h-3 w-3 rounded-full", levelClasses[level])} />
          </div>

          <div className="space-y-2">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="flex items-center gap-2 text-xs">
                  <Icon className="h-4 w-4 shrink-0 stroke-[1.8] text-[#fff4e8] dark:text-[#5d5822]" />
                  <span className="min-w-0 flex-1 truncate font-medium text-[#fff4e8] dark:text-[#5d5822]">{item.label}</span>
                  <span className="flex items-center gap-1.5 text-[#d8c8bb] dark:text-[#6f6932]">
                    <span className={cn("h-2 w-2 rounded-full", statusDotClasses[item.status])} />
                    {statusLabels[item.status]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
