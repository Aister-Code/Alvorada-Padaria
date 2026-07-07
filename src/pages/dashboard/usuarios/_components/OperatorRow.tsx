import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { ConvexError } from "convex/values";
import { toast } from "sonner";
import { KeyRound, Pencil, ToggleLeft, ToggleRight } from "lucide-react";
import { roleLabel } from "./RoleSelect.tsx";
import { cn } from "@/lib/utils.ts";
import type { Doc } from "@/convex/_generated/dataModel.d.ts";

type Operator = Doc<"operators">;

type Props = {
  operator: Operator;
  sessionOperatorId: string;
  unit: string;
  onEdit: (op: Operator) => void;
  onResetPin: (op: Operator) => void;
};

export default function OperatorRow({ operator, sessionOperatorId, unit, onEdit, onResetPin }: Props) {
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [loading, setLoading] = useState(false);

  const setActive = useMutation(api.operators.manage.setOperatorActive);

  const isSelf = operator.operatorId === sessionOperatorId;

  const handleToggle = async () => {
    if (operator.active && !confirmDeactivate) {
      setConfirmDeactivate(true);
      return;
    }
    setLoading(true);
    try {
      await setActive({
        sessionOperatorId,
        unit,
        operatorId: operator.operatorId,
        active: !operator.active,
      });
      toast.success(operator.active ? `${operator.name} desativado.` : `${operator.name} ativado.`);
      setConfirmDeactivate(false);
    } catch (err) {
      if (err instanceof ConvexError) {
        const d = err.data as { message: string };
        toast.error(d.message);
      } else {
        toast.error("Erro ao alterar status.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors",
      operator.active ? "bg-card border-border" : "bg-muted/40 border-border/50 opacity-60",
    )}>
      {/* ID + Nome */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            {operator.operatorId}
          </span>
          <span className="text-sm font-medium text-foreground truncate">{operator.name}</span>
          {isSelf && (
            <span className="text-[9px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded uppercase tracking-wider">
              Você
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-muted-foreground capitalize">{roleLabel(operator.role)}</span>
          {!operator.active && (
            <span className="text-[9px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded uppercase tracking-wider">
              Inativo
            </span>
          )}
        </div>
        {/* Confirmação inline de desativação */}
        {confirmDeactivate && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[11px] text-destructive">Desativar {operator.name}?</span>
            <button
              onClick={handleToggle}
              disabled={loading}
              className="cursor-pointer text-[11px] font-medium text-destructive underline underline-offset-2"
            >
              Confirmar
            </button>
            <button
              onClick={() => setConfirmDeactivate(false)}
              className="cursor-pointer text-[11px] text-muted-foreground underline underline-offset-2"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>

      {/* Ações */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onResetPin(operator)}
          className="cursor-pointer p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          title="Redefinir PIN"
        >
          <KeyRound className="w-4 h-4" />
        </button>
        <button
          onClick={() => onEdit(operator)}
          className="cursor-pointer p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          title="Editar"
        >
          <Pencil className="w-4 h-4" />
        </button>
        {!isSelf && !confirmDeactivate && (
          <button
            onClick={handleToggle}
            disabled={loading}
            className="cursor-pointer p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-40"
            title={operator.active ? "Desativar" : "Ativar"}
          >
            {operator.active
              ? <ToggleRight className="w-4 h-4 text-primary" />
              : <ToggleLeft className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
}
