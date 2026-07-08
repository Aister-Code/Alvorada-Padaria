import { HelpCircle, LogOut, Menu, Settings, User, Warehouse, type LucideIcon } from "lucide-react";
import { useState } from "react";

type Props = {
  onHelp: () => void;
  onLogout: () => void;
  onFutureAction: (label: string) => void;
};

export default function DashboardMenu({ onHelp, onLogout, onFutureAction }: Props) {
  const [open, setOpen] = useState(false);

  const runAndClose = (action: () => void) => {
    setOpen(false);
    action();
  };

  return (
    <div className="relative">
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
        <div className="absolute right-0 top-10 z-40 w-56 rounded-2xl bg-[#f4f2ea] p-2 text-[#5d5822] dark:bg-[#f8c6aa] dark:text-[#5d5822]">
          <MenuItem icon={Warehouse} label="Trocar unidade" onClick={() => runAndClose(() => onFutureAction("Trocar unidade"))} />
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
      className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-light transition-colors hover:bg-[#e8e6dc] focus:outline-none dark:hover:bg-[#f4f2ea]/54"
    >
      <Icon className="h-4 w-4 stroke-[1.8]" />
      {label}
    </button>
  );
}
