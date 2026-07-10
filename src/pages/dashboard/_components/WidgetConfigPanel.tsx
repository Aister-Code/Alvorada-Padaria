import { Check, ChevronDown, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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

function initialSelection(fields: ConfigField[]) {
  return Object.fromEntries(
    fields.map((field) => [field.label, field.options?.[0] ? [field.options[0]] : []])
  );
}

function selectionSummary(field: ConfigField, selected: string[]) {
  if (selected.length === 0) return "Selecionar";
  if (field.control === "multi") {
    if (selected.length <= 2) return selected.join(", ");
    return `${selected.slice(0, 2).join(", ")} +${selected.length - 2}`;
  }
  return selected[0];
}

function isAllOption(option: string) {
  return option.trim().toLowerCase() === "todos";
}

export default function WidgetConfigPanel({ title, open, fields, onClose }: Props) {
  const panelRef = useRef<HTMLElement>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>(() =>
    initialSelection(fields)
  );
  const [openField, setOpenField] = useState<string | null>(null);
  const [useSystemSuggestion, setUseSystemSuggestion] = useState(true);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [dirty, setDirty] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSelectedOptions(initialSelection(fields));
    setOpenField(null);
    setUseSystemSuggestion(true);
    setSaveState("idle");
    setDirty(false);
    setConfirmClose(false);
  }, [open, title, fields]);

  const requestClose = () => {
    if (saveState === "saving") return;
    if (dirty) {
      setConfirmClose(true);
      return;
    }
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!panelRef.current || panelRef.current.contains(event.target as Node)) return;
      requestClose();
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [dirty, open, saveState]);

  if (!open) return null;

  const toggleSystemSuggestion = () => {
    setDirty(true);
    setOpenField(null);
    setUseSystemSuggestion((current) => {
      const next = !current;
      if (next) setSelectedOptions(initialSelection(fields));
      return next;
    });
  };

  const handleOptionClick = (field: ConfigField, option: string) => {
    setDirty(true);
    setUseSystemSuggestion(false);
    setSelectedOptions((current) => {
      const active = current[field.label] ?? [];
      if (field.control === "multi") {
        if (isAllOption(option)) {
          return { ...current, [field.label]: [option] };
        }

        const activeWithoutAll = active.filter((item) => !isAllOption(item));
        const next = activeWithoutAll.includes(option)
          ? activeWithoutAll.filter((item) => item !== option)
          : [...activeWithoutAll, option];

        return { ...current, [field.label]: next.length > 0 ? next : [option] };
      }
      return { ...current, [field.label]: [option] };
    });
    setOpenField(null);
  };

  const handleSave = () => {
    setSaveState("saving");
    window.setTimeout(() => {
      setSaveState("saved");
      setDirty(false);
      window.setTimeout(() => {
        setSaveState("idle");
        onClose();
      }, 650);
    }, 450);
  };

  return (
    <aside
      ref={panelRef}
      className="fixed right-4 top-28 z-50 w-max min-w-[17rem] max-w-[calc(100vw-2rem)] animate-in fade-in-0 slide-in-from-top-2 duration-150 overflow-hidden rounded-2xl bg-[#685c20] p-3 text-[#fff4e8] dark:bg-[#f3c4a2] dark:text-[#685c20]"
    >
      <div className="mb-2.5 flex items-center justify-between gap-5">
        <h2 className="whitespace-nowrap text-[13px] font-semibold leading-tight text-[#fff4e8] dark:text-[#685c20]">
          Configuração
        </h2>
        <button
          type="button"
          onClick={requestClose}
          className="cursor-pointer rounded-full p-1.5 text-[#fff4e8] transition-colors hover:text-white focus:outline-none dark:text-[#685c20] dark:hover:text-[#3f3b12]"
          aria-label="Fechar configuração"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <button
        type="button"
        onClick={toggleSystemSuggestion}
        className="mb-2 flex w-full cursor-pointer items-center gap-2 rounded-xl px-1.5 py-1 text-left text-xs text-[#fff4e8] transition-colors hover:bg-[#fff4e8]/8 focus:outline-none dark:text-[#685c20] dark:hover:bg-[#685c20]/7"
        aria-pressed={useSystemSuggestion}
      >
        <span className="min-w-0 flex-1 truncate font-medium">Usar sugestão do sistema</span>
        <span
          className={cn(
            "flex h-4 w-4 shrink-0 items-center justify-center rounded-[0.3rem] border transition-colors",
            useSystemSuggestion
              ? "border-[#fff4e8] bg-[#fff4e8] text-[#685c20] dark:border-[#685c20] dark:bg-[#685c20] dark:text-[#fff4e8]"
              : "border-[#fff4e8]/52 bg-transparent text-transparent dark:border-[#685c20]/52"
          )}
        >
          <Check className="h-3 w-3 stroke-[2.4]" />
        </span>
      </button>

      <div className="space-y-1">
        {fields.map((field) => {
          const selected = selectedOptions[field.label] ?? [];
          const options = field.options ?? [];
          const isOpen = openField === field.label;

          if (field.control === "switch") {
            return (
              <div
                key={field.label}
                className={cn(
                  "flex min-w-0 items-center gap-3 rounded-xl px-1.5 py-1.5 text-xs",
                  field.disabled && "opacity-45"
                )}
              >
                <span className="min-w-[5.5rem] flex-1 truncate font-medium text-[#fff4e8] dark:text-[#685c20]">
                  {field.label}
                </span>
                <span className="h-5 w-9 rounded-full bg-[#fff4e8]/18 p-0.5 dark:bg-[#685c20]/18">
                  <span className="block h-4 w-4 rounded-full bg-[#fff4e8]/72 dark:bg-[#685c20]/72" />
                </span>
              </div>
            );
          }

          return (
            <div key={field.label} className={cn("rounded-xl", field.disabled && "opacity-45")}>
              <button
                type="button"
                onClick={() => setOpenField(isOpen ? null : field.label)}
                disabled={field.disabled}
                className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-1.5 py-1.5 text-left text-xs transition-colors hover:bg-[#fff4e8]/8 focus:outline-none dark:hover:bg-[#685c20]/7"
              >
                <span className="min-w-[5.5rem] flex-1 truncate font-medium text-[#fff4e8] dark:text-[#685c20]">
                  {field.label}
                </span>
                <span className="min-w-[5.5rem] max-w-[11rem] truncate text-right text-[11px] font-medium text-[#d8c8bb] dark:text-[#6f6932]">
                  {selectionSummary(field, selected)}
                </span>
                <ChevronDown
                  className={cn("h-3.5 w-3.5 shrink-0 transition-transform", isOpen && "rotate-180")}
                />
              </button>

              {isOpen && options.length > 0 && (
                <div className="mt-0.5 space-y-0.5 rounded-xl bg-[#fff4e8]/8 px-1 py-1 dark:bg-[#685c20]/7">
                  {options.map((option) => {
                    const active = selected.includes(option);
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleOptionClick(field, option)}
                        className={cn(
                          "flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-left text-[11px] transition-colors focus:outline-none",
                          active
                            ? "bg-[#fff4e8]/12 text-[#fff4e8] dark:bg-[#685c20]/10 dark:text-[#685c20]"
                            : "text-[#d8c8bb] hover:bg-[#fff4e8]/8 hover:text-[#fff4e8] dark:text-[#6f6932] dark:hover:bg-[#685c20]/8 dark:hover:text-[#685c20]"
                        )}
                      >
                        <span className="min-w-0 flex-1 truncate font-medium">{option}</span>
                        {active && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={requestClose}
          className="h-9 flex-1 cursor-pointer rounded-xl bg-transparent text-[11px] font-semibold text-[#fff4e8] transition-colors hover:bg-[#fff4e8]/10 focus:outline-none dark:text-[#685c20] dark:hover:bg-[#685c20]/8"
          disabled={saveState === "saving"}
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saveState !== "idle"}
          className="h-9 flex-1 cursor-pointer rounded-xl bg-[#fff4e8] text-[11px] font-semibold text-[#685c20] transition-colors hover:bg-white disabled:cursor-default dark:bg-[#685c20] dark:text-[#fff4e8]"
        >
          {saveState === "saving"
            ? "Salvando..."
            : saveState === "saved"
              ? "✓ Salvo"
              : "Salvar Alterações"}
        </button>
      </div>

      {confirmClose && (
        <div className="mt-2 rounded-xl bg-[#fff4e8]/8 px-2.5 py-2 dark:bg-[#685c20]/7">
          <p className="text-[10.5px] font-semibold text-[#fff4e8] dark:text-[#685c20]">
            Descartar alterações?
          </p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => setConfirmClose(false)}
              className="h-8 flex-1 cursor-pointer rounded-lg text-[10.5px] font-semibold text-[#fff4e8] hover:bg-[#fff4e8]/10 dark:text-[#685c20] dark:hover:bg-[#685c20]/8"
            >
              Continuar editando
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-8 flex-1 cursor-pointer rounded-lg bg-[#fff4e8] text-[10.5px] font-semibold text-[#685c20] dark:bg-[#685c20] dark:text-[#fff4e8]"
            >
              Descartar
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
