import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Users, KeyRound, BookOpen, Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton.tsx";

type StatCardProps = { label: string; value: number | undefined; icon: typeof Users; color: string };

function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card px-5 py-4">
      <div className={`flex items-center justify-center w-10 h-10 rounded-xl text-white shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-[11px] text-muted-foreground tracking-widest uppercase">{label}</p>
        {value === undefined ? (
          <Skeleton className="h-7 w-16 mt-1" />
        ) : (
          <p className="text-2xl font-bold tabular-nums">{value}</p>
        )}
      </div>
    </div>
  );
}

export default function OverviewTab() {
  const stats = useQuery(api.admin.index.getStats, {});

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold mb-1">Visão Geral do Sistema</h2>
        <p className="text-sm text-muted-foreground">Estado atual do ERP Alvorada.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard label="Operadores" value={stats?.totalOperators} icon={Users} color="bg-orange-500" />
        <StatCard label="Ativos" value={stats?.activeOperators} icon={Users} color="bg-emerald-600" />
        <StatCard label="PIN Pendentes" value={stats?.pendingPinResets} icon={KeyRound} color="bg-amber-500" />
        <StatCard label="Categorias" value={stats?.totalCategories} icon={BookOpen} color="bg-violet-600" />
        <StatCard label="Produtos" value={stats?.totalProducts} icon={Package} color="bg-sky-600" />
      </div>
    </div>
  );
}
