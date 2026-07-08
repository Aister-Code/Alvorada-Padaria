import { RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/utils.ts";

type ConfigField = {
  label: string;
  description: string;
  control: "switch" | "single" | "multi";
  options?: string[];
  disabled?: boolean;
};

type Props = {
  title: string;
  open: boolean;
  fields: ConfigField[];
  onClose: () => void;
};

export default function WidgetConfigPanel({ title, open, fields, onClose }: Props) {
  if (!open) return null;

  return (
    <aside className="fixed right-4 top-20 z-50 w-[min(20.5rem,calc(100vw-2rem))] animate-in fade-in-0 slide-in-from-top-2 duration-150 overflow-hidden rounded-2xl bg-[#5d5822] p-3 text-[#f8c6aa] dark:bg-[#f8c6aa] dark:text-[#5d5822]">
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold leading-tight">{title}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer rounded-full p-1.5 text-current/76 transition-colors hover:text-current focus:outline-none"
          aria-label="Fechar configuração"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <button
        type="button"
        className="mb-2.5 flex w-full cursor-pointer items-center gap-2 rounded-xl bg-[#f8c6aa]/12 px-2.5 py-1.5 text-left text-[11px] font-light text-[#f8c6aa]/90 transition-colors hover:bg-[#f8c6aa]/18 focus:outline-none dark:bg-[#5d5822]/8 dark:text-[#5d5822]/82 dark:hover:bg-[#5d5822]/12"
      >
        <RotateCcw className="h-3 w-3" />
        Usar sugestão do sistema
      </button>

      <div className="grid grid-cols-2 gap-1.5">
        {fields.map((field) => (
          <div
            key={field.label}
            className={cn(
              "min-w-0 rounded-xl bg-[#f8c6aa]/11 px-2 py-1.5 dark:bg-[#5d5822]/8",
              field.disabled && "opacity-45"
            )}
          >
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10.5px] font-medium leading-tight text-[#f8c6aa]/96 dark:text-[#5d5822]/92">{field.label}</p>
              </div>
              {field.control === "switch" && (
                  <span className="mt-0.5 h-5 w-9 rounded-full bg-[#f8c6aa]/18 p-0.5 dark:bg-[#5d5822]/18">
                  <span className="block h-4 w-4 rounded-full bg-[#f8c6aa]/62 dark:bg-[#5d5822]/62" />
                </span>
              )}
            </div>

            {field.control !== "switch" && field.options && (
              <div className="flex flex-wrap gap-1">
                {field.options.map((option, index) => (
                  <span
                    key={option}
                    className={cn(
                      "rounded-[0.55rem] px-2 py-px text-[7.5px] font-medium leading-tight",
                      index === 0
                        ? "bg-[#f8c6aa] text-[#5d5822] dark:bg-[#5d5822] dark:text-[#f8c6aa]"
                        : "bg-[#f8c6aa]/16 text-[#f8c6aa]/82 dark:bg-[#5d5822]/10 dark:text-[#5d5822]/74"
                    )}
                  >
                    {option}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}
