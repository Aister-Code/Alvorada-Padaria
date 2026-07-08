import { Type } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils.ts";

export type InterfaceScale = "small" | "normal" | "large";

type Props = {
  value: InterfaceScale;
  onChange: (value: InterfaceScale) => void;
};

const options: { value: InterfaceScale; label: string }[] = [
  { value: "small", label: "Pequeno" },
  { value: "normal", label: "Normal" },
  { value: "large", label: "Grande" },
];

export default function InterfaceScalePopover({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="cursor-pointer rounded-full p-2 text-[#5d5822]/62 transition-colors hover:text-[#5d5822] focus:outline-none dark:text-[#f8c6aa]/62 dark:hover:text-[#f8c6aa]"
        aria-label="Tamanho da interface"
        aria-expanded={open}
      >
        <Type className="h-[1.15rem] w-[1.15rem] stroke-[1.8]" />
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-36 rounded-2xl bg-[#f4f2ea] p-1.5 text-[#5d5822] dark:bg-[#f8c6aa] dark:text-[#5d5822]">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={cn(
                "flex w-full cursor-pointer items-center justify-between rounded-xl px-2.5 py-2 text-left text-[11px] font-light transition-colors focus:outline-none",
                value === option.value
                  ? "bg-[#5d5822] text-[#f4f2ea]"
                  : "text-[#5d5822]/72 hover:bg-[#5d5822]/8"
              )}
            >
              {option.label}
              {value === option.value && (
                <span className="h-1.5 w-1.5 rounded-full bg-[#f4f2ea]" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
