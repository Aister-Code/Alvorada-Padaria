import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils.ts";

type Props = {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "default" | "action" | "warning";
};

const toneClasses: Record<NonNullable<Props["tone"]>, string> = {
  default: "text-[#1f1f1a] dark:text-[#f7f2ec]",
  action: "text-[#f04a2a]",
  warning: "text-[#f04a2a]",
};

export default function OperationMetricCard({
  label,
  value,
  icon: Icon,
  tone = "default",
}: Props) {
  return (
    <div className="flex min-h-[calc(4.25rem*var(--rvl-card-scale,1))] min-w-0 flex-col items-center justify-center gap-0.5 rounded-2xl bg-white px-2.5 py-2.5 text-center dark:bg-[#151513]">
      <div className={cn("flex items-end gap-1.25", toneClasses[tone])}>
        <Icon className="mb-0.5 h-[calc(1.18rem*var(--rvl-font-scale,1))] w-[calc(1.18rem*var(--rvl-font-scale,1))] stroke-[1.7]" />
        <span className="text-[calc(1.96rem*var(--rvl-font-scale,1))] font-semibold tabular-nums leading-none">
          {value}
        </span>
      </div>
      <p className="text-[calc(9px*var(--rvl-font-scale,1))] font-light uppercase tracking-[0.08em] text-[#1f1f1a]/58 dark:text-[#f7f2ec]/58">
        {label}
      </p>
    </div>
  );
}
