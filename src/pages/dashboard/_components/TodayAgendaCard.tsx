import type { LucideIcon } from "lucide-react";
import WidgetConfigButton from "./WidgetConfigButton.tsx";
import { cn } from "@/lib/utils.ts";

export type TodayAgendaItem = {
  time: string;
  label: string;
  icon: LucideIcon;
};

type Props = {
  items: TodayAgendaItem[];
  className?: string;
  onConfigure?: () => void;
};

export default function TodayAgendaCard({
  items,
  className,
  onConfigure,
}: Props) {
  const visibleItems = items.slice(0, 3);

  return (
    <section className={cn("relative flex h-full min-h-0 flex-col rounded-2xl bg-[#e8e6dc] px-3.5 py-3 dark:bg-[#696328]", className)}>
      <div className="mb-2 flex items-center gap-2 pr-9 text-[#5d5822] dark:text-[#f8c6aa]">
        <div className="flex items-center gap-2">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.12em]">
            Jornada Hoje
          </h2>
        </div>
        {onConfigure && (
          <div
            className="absolute right-2.5 top-2.5 flex items-center gap-0.5 text-[#5d5822]/58 dark:text-[#f8c6aa]/58"
            onClick={(event) => event.stopPropagation()}
          >
            <WidgetConfigButton
              label="Configurar Jornada Hoje"
              onClick={onConfigure}
            />
          </div>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col justify-center gap-1.5">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={`${item.time}-${item.label}`}
              className="grid grid-cols-[0.9rem_1fr_2.75rem] items-center gap-1.5 text-sm"
            >
              <Icon className="h-3 w-3 text-[#5d5822]/84 dark:text-[#f8c6aa]/84" />
              <span className="truncate text-[12px] font-light text-[#5d5822]/90 dark:text-[#f8c6aa]/90">
                {item.label}
              </span>
              <span className="text-right text-[10.5px] tabular-nums text-[#5d5822]/54 dark:text-[#f8c6aa]/54">
                {item.time}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
