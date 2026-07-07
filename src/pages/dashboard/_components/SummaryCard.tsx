import { cn } from "@/lib/utils.ts";
import type { LucideIcon } from "lucide-react";

type Props = {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  color: string;     // icon bg class
  alert?: boolean;   // highlight if needs attention
};

export default function SummaryCard({ label, value, sub, icon: Icon, color, alert }: Props) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-2xl border bg-card px-5 py-4",
        alert ? "border-destructive/50 bg-destructive/5" : "border-border"
      )}
    >
      <div className={cn("flex items-center justify-center rounded-xl text-white w-11 h-11 shrink-0", color)}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground tracking-widest uppercase truncate">{label}</p>
        <p className={cn("text-2xl font-bold leading-tight tabular-nums", alert ? "text-destructive" : "text-foreground")}>
          {value}
        </p>
        {sub && <p className="text-[11px] text-muted-foreground truncate">{sub}</p>}
      </div>
    </div>
  );
}
