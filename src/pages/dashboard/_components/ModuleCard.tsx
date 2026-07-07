"use client";
import { cn } from "@/lib/utils.ts";
import type { Module } from "../_lib/modules.ts";
import { toast } from "sonner";

type Props = {
  module: Module;
  large?: boolean;
  onNavigate?: () => void;
};

export default function ModuleCard({ module, large, onNavigate }: Props) {
  const Icon = module.icon;

  const handleClick = () => {
    if (onNavigate) {
      onNavigate();
      return;
    }
    toast.info(`${module.label} — em breve`);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "cursor-pointer group flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card",
        "hover:bg-accent active:scale-[0.97] transition-all duration-150 select-none",
        large ? "p-6 aspect-square" : "p-4 aspect-square"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-xl text-white shrink-0",
          module.color,
          large ? "w-14 h-14" : "w-10 h-10"
        )}
      >
        <Icon className={large ? "w-7 h-7" : "w-5 h-5"} />
      </div>
      <div className="text-center">
        <p className={cn("font-semibold text-foreground leading-tight", large ? "text-base" : "text-sm")}>
          {module.label}
        </p>
        <p className={cn("text-muted-foreground leading-tight mt-0.5 hidden sm:block", large ? "text-xs" : "text-[11px]")}>
          {module.description}
        </p>
      </div>
    </button>
  );
}
