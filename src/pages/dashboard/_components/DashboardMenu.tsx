import { Check, HelpCircle, LogOut, Menu, Repeat2, Settings, User, Warehouse, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Props = {
  availableOperationalModes?: string[];
  currentOperationalMode?: string;
  onOperationalModeChange?: (mode: string) => void;
  onHelp: () => void;
  onLogout: () => void;
  onFutureAction: (label: string) => void;
};

export default function DashboardMenu({
  availableOperationalModes,
  currentOperationalMode,
  onOperationalModeChange,
  onHelp,
  onLogout,
  onFutureAction,
}: Props) {
  const [open, setOpen] = useState(false);
  const [modeOpen, setModeOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current || menuRef.current.contains(event.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  const runAndClose = (action: () => void) => {
    setOpen(false);
    setModeOpen(false);
    action();
  };

  const hasOperationalModes = Boolean(availableOperationalModes?.length && onOperationalModeChange);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="cursor-pointer rounded-full p-2 text-[#5d5822]/62 transition-colors hover:text-[#5d5822] focus:outline-none dark:text-[#f8c6aa]/62 dark:hover:text-[#f8c6aa]"
        aria-label="Menu"
        aria-expanded={open}
      >
        <Menu className="h-[1.15rem] w-[1.15rem] stroke-[1.8]" />
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-40 w-56 animate-in fade-in-0 slide-in-from-top-1 rounded-2xl bg-[#5d5822] p-2 text-[#fff4e8] duration-150 dark:bg-[#f8c6aa] dark:text-[#5d5822]">
          <MenuItem icon={Warehouse} label="Trocar unidade" onClick={() => runAndClose(() => onFutureAction("Trocar unidade"))} />
          <MenuItem
            icon={Repeat2}
            label="Trocar Modo Operacional"
            onClick={() => {
              if (!hasOperationalModes) {
                runAndClose(() => onFutureAction("Trocar Modo Operacional"));
                return;
              }
              setModeOpen((value) => !value);
            }}
          />
          {modeOpen && hasOperationalModes && (
            <div className="mb-1 mt-0.5 rounded-xl bg-[#fff4e8]/8 px-1 py-1 dark:bg-[#5d5822]/7">
              {availableOperationalModes!.map((mode) => {
                const active = mode === currentOperationalMode;
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => runAndClose(() => onOperationalModeChange!(mode))}
                    className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-[11px] font-medium text-[#fff4e8] transition-colors hover:bg-[#fff4e8]/10 focus:outline-none dark:text-[#5d5822] dark:hover:bg-[#5d5822]/8"
                  >
                    <span>{mode}</span>
                    {active && <Check className="h-3.5 w-3.5 stroke-[1.9]" />}
                  </button>
                );
              })}
            </div>
          )}
          <MenuItem icon={User} label="Meu Perfil" onClick={() => runAndClose(() => onFutureAction("Meu Perfil"))} />
          <MenuItem icon={HelpCircle} label="Ajuda" onClick={() => runAndClose(onHelp)} />
          <MenuItem icon={Settings} label="Configurações" onClick={() => runAndClose(() => onFutureAction("Configurações"))} />
          <MenuItem icon={LogOut} label="Sair" onClick={() => runAndClose(onLogout)} />
        </div>
      )}
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium text-[#fff4e8] transition-colors hover:bg-[#fff4e8]/10 focus:outline-none dark:text-[#5d5822] dark:hover:bg-[#5d5822]/8"
    >
      <Icon className="h-4 w-4 stroke-[1.8]" />
      {label}
    </button>
  );
}
