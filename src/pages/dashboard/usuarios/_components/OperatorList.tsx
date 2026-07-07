import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { UserPlus, Users } from "lucide-react";
import { motion } from "motion/react";
import OperatorRow from "./OperatorRow.tsx";
import OperatorFormModal from "./OperatorFormModal.tsx";
import PinResetModal from "./PinResetModal.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import type { Doc } from "@/convex/_generated/dataModel.d.ts";

type Operator = Doc<"operators">;

type Props = {
  sessionOperatorId: string;
  unit: string;
};

type Filter = "all" | "active" | "inactive";

export default function OperatorList({ sessionOperatorId, unit }: Props) {
  const operators = useQuery(api.operators.manage.listOperatorsByUnit, { unit }) as Operator[] | undefined;

  const [filter, setFilter] = useState<Filter>("active");
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<Operator | null>(null);
  const [pinTarget, setPinTarget] = useState<Operator | null>(null);

  const filtered = (operators ?? []).filter((op) => {
    if (filter === "active") return op.active;
    if (filter === "inactive") return !op.active;
    return true;
  });

  const filterBtn = (f: Filter, label: string) => (
    <button
      onClick={() => setFilter(f)}
      className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
        filter === f
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-accent"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-4">
      {/* Cabeçalho da lista */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1 bg-secondary rounded-xl p-1">
          {filterBtn("active", "Ativos")}
          {filterBtn("inactive", "Inativos")}
          {filterBtn("all", "Todos")}
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="cursor-pointer flex items-center gap-1.5 h-9 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-medium tracking-wide hover:opacity-90 active:scale-[0.98] transition-all"
        >
          <UserPlus className="w-3.5 h-3.5" />
          Novo Operador
        </button>
      </div>

      {/* Lista */}
      {operators === undefined ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[64px] w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">
            {filter === "inactive" ? "Nenhum operador inativo" : "Nenhum operador cadastrado"}
          </p>
          <p className="text-xs text-muted-foreground">
            {filter === "active" || filter === "all"
              ? 'Clique em "Novo Operador" para adicionar.'
              : "Operadores desativados aparecerão aqui."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((op, i) => (
            <motion.div
              key={op._id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, delay: i * 0.04, ease: "easeOut" as const }}
            >
              <OperatorRow
                operator={op}
                sessionOperatorId={sessionOperatorId}
                unit={unit}
                onEdit={setEditTarget}
                onResetPin={setPinTarget}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Modais */}
      <OperatorFormModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        mode="create"
        sessionOperatorId={sessionOperatorId}
        unit={unit}
      />

      {editTarget && (
        <OperatorFormModal
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
          mode="edit"
          initial={{
            operatorId: editTarget.operatorId,
            name: editTarget.name,
            role: editTarget.role,
            phone: editTarget.phone,
            active: editTarget.active,
          }}
          sessionOperatorId={sessionOperatorId}
          unit={unit}
        />
      )}

      {pinTarget && (
        <PinResetModal
          open={!!pinTarget}
          onClose={() => setPinTarget(null)}
          operatorId={pinTarget.operatorId}
          operatorName={pinTarget.name}
          sessionOperatorId={sessionOperatorId}
          unit={unit}
        />
      )}
    </div>
  );
}
