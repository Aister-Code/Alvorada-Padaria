import { Bell, LogOut, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils.ts";
import AlvoradaLogo from "@/components/branding/AlvoradaLogo.tsx";

type Props = {
  operatorName: string;
  role: string;
  unit: string;
  pendingCount: number;
  onNotificationsClick: () => void;
  onLogout: () => void;
};

const ROLE_LABELS: Record<string, string> = {
  gerente: "Gerente",
  caixa: "Caixa",
  atendente: "Atendente",
};

export default function DashboardHeader({
  operatorName,
  role,
  unit,
  pendingCount,
  onNotificationsClick,
  onLogout,
}: Props) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <header className="flex items-center justify-between gap-3 px-4 md:px-6 py-3 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-30">
      {/* Logo + info */}
      <div className="flex items-center gap-3 min-w-0">
        <AlvoradaLogo variant="icon" size="sm" />
        <div className="min-w-0 hidden sm:block">
          <p className="text-sm font-semibold text-foreground leading-tight truncate">
            {operatorName}
          </p>
          <p className="text-[11px] text-muted-foreground leading-tight truncate">
            {ROLE_LABELS[role] ?? role} · {unit}
          </p>
        </div>
        {/* Mobile: só role */}
        <div className="sm:hidden min-w-0">
          <p className="text-sm font-semibold text-foreground leading-tight">
            {ROLE_LABELS[role] ?? role}
          </p>
        </div>
      </div>

      {/* Ações */}
      <div className="flex items-center gap-1.5">
        {/* Notificações */}
        <button
          onClick={onNotificationsClick}
          className="relative cursor-pointer p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          aria-label="Notificações"
        >
          <Bell className="w-5 h-5" />
          {pendingCount > 0 && (
            <span
              className={cn(
                "absolute top-1 right-1 flex items-center justify-center rounded-full text-[9px] font-bold text-white leading-none",
                pendingCount > 0 ? "w-4 h-4 bg-destructive" : ""
              )}
            >
              {pendingCount > 9 ? "9+" : pendingCount}
            </span>
          )}
        </button>

        {/* Tema */}
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="cursor-pointer p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          aria-label="Alternar tema"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Sair */}
        <button
          onClick={onLogout}
          className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          aria-label="Sair"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
    </header>
  );
}
