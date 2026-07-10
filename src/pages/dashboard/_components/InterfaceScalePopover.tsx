import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils.ts";

export type InterfaceScale = "small" | "normal" | "large";

type Props = {
  value: InterfaceScale;
  onChange: (value: InterfaceScale) => void;
};

const options: { value: InterfaceScale; label: string }[] = [
  { value: "small", label: "aa" },
  { value: "normal", label: "Aa" },
  { value: "large", label: "AA" },
];

export default function InterfaceScalePopover({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const currentLabel = options.find((option) => option.value === value)?.label ?? "Aa";

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
        onClick={() => setOpen((current) => !current)}
        className="flex h-[2.15rem] min-w-[2.15rem] cursor-pointer items-center justify-center rounded-full px-2 text-[calc(12px*var(--rvl-font-scale,1))] font-semibold tracking-[-0.01em] text-[#1f1f1a]/62 transition-colors hover:text-[#685c20] focus:outline-none dark:text-[#f7f2ec]/68 dark:hover:text-[#f3c4a2]"
        aria-label="Escala Operacional"
        aria-expanded={open}
      >
        {currentLabel}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 flex animate-in fade-in-0 slide-in-from-top-1 gap-1 rounded-2xl bg-[#685c20] p-1.5 text-[#fff4e8] duration-150 dark:bg-[#f3c4a2] dark:text-[#685c20]">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={cn(
                "flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-xl px-2 text-[calc(12px*var(--rvl-font-scale,1))] font-semibold tracking-[-0.01em] transition-all duration-150 focus:outline-none",
                value === option.value
                  ? "bg-[#454116] text-[#fff4e8] dark:bg-[#685c20] dark:text-[#fff4e8]"
                  : "border border-[#fff4e8]/24 bg-[#fff4e8]/8 text-[#fff4e8] hover:bg-[#fff4e8]/14 dark:border-[#685c20]/18 dark:bg-[#685c20]/7 dark:text-[#685c20] dark:hover:bg-[#685c20]/12"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
