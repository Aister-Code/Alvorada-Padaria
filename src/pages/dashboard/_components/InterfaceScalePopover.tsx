import { useState } from "react";
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
  const currentLabel = options.find((option) => option.value === value)?.label ?? "Aa";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-[2.15rem] min-w-[2.15rem] cursor-pointer items-center justify-center rounded-full px-2 text-[12px] font-semibold tracking-[-0.01em] text-[#5d5822]/68 transition-colors hover:text-[#5d5822] focus:outline-none dark:text-[#f8c6aa]/68 dark:hover:text-[#f8c6aa]"
        aria-label="Escala Operacional"
        aria-expanded={open}
      >
        {currentLabel}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 flex animate-in fade-in-0 slide-in-from-top-1 gap-1 rounded-2xl bg-[#f4f2ea] p-1.5 text-[#5d5822] duration-150 dark:bg-[#f8c6aa] dark:text-[#5d5822]">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={cn(
                "flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-xl px-2 text-[12px] font-semibold tracking-[-0.01em] transition-all duration-150 focus:outline-none",
                value === option.value
                  ? "bg-[#5d5822]/12 text-[#5d5822]"
                  : "text-[#5d5822]/50 hover:bg-[#5d5822]/7 hover:text-[#5d5822]/78"
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
