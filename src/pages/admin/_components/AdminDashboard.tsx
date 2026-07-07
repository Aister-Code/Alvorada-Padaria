import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { useState } from "react";
import { motion } from "motion/react";
import { Users, KeyRound, LayoutGrid, Activity, ShieldCheck, LogOut, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { Spinner } from "@/components/ui/spinner.tsx";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth.ts";
import OperatorsTab from "./OperatorsTab.tsx";
import PinResetsTab from "./PinResetsTab.tsx";
import OverviewTab from "./OverviewTab.tsx";
import { cn } from "@/lib/utils.ts";

type Tab = "overview" | "operators" | "pinresets";

const TABS: { id: Tab; label: string; icon: typeof Users }[] = [
  { id: "overview", label: "Visão Geral", icon: Activity },
  { id: "operators", label: "Operadores", icon: Users },
  { id: "pinresets", label: "Redefinições", icon: KeyRound },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { signout } = useAuth();

  const me = useQuery(api.admin.index.getMe, {});
  const bootstrap = useMutation(api.admin.index.bootstrapSuperAdmin);

  if (me === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="size-8" />
      </div>
    );
  }

  // Not superadmin yet — show bootstrap button
  if (!me || me.role !== "superadmin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-background px-6">
        <ShieldCheck className="w-12 h-12 text-primary" />
        <div className="text-center space-y-1">
          <h1 className="text-lg font-semibold">Configuração inicial</h1>
          <p className="text-sm text-muted-foreground max-w-xs text-center">
            Nenhum superadmin configurado. Clique para promover sua conta.
          </p>
        </div>
        <button
          onClick={async () => {
            try {
              await bootstrap({});
              toast.success("Superadmin ativado!");
            } catch (e) {
              const err = e as { data?: { message?: string } };
              toast.error(err.data?.message ?? "Erro ao ativar");
            }
          }}
          className="cursor-pointer px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
        >
          Ativar como Superadmin
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 py-3 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <img
            src="https://hercules-cdn.com/file_HPjTSRmu0Y2UO4eTkNA5IUvH"
            alt="Alvorada"
            className="w-8 h-8 rounded-lg object-cover"
          />
          <div>
            <p className="text-sm font-semibold leading-tight">Admin</p>
            <p className="text-[11px] text-muted-foreground leading-tight">RondônIA Apps</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="cursor-pointer p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => signout()}
            className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair</span>
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-1 px-4 md:px-6 pt-4 border-b border-border">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "cursor-pointer flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px",
                tab === t.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" as const }}
          >
            {tab === "overview" && <OverviewTab />}
            {tab === "operators" && <OperatorsTab />}
            {tab === "pinresets" && <PinResetsTab />}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
