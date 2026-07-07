import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { useState } from "react";
import { Plus, ToggleLeft, ToggleRight, KeyRound, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { toast } from "sonner";
import { cn } from "@/lib/utils.ts";

const ROLES = ["gerente", "caixa", "atendente", "garcom", "chapeiro", "entregador"];

type AdminOperator = {
  _id: string;
  operatorId: string;
  name: string;
  role: string;
  units: string[];
  active: boolean;
};

export default function OperatorsTab() {
  const operators = useQuery(api.admin.index.listOperators, {}) as AdminOperator[] | undefined;
  const toggleOp = useMutation(api.admin.index.toggleOperator);
  const createOp = useMutation(api.admin.index.createOperator);
  const resetPin = useMutation(api.admin.index.resetOperatorPin);

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ operatorId: "", name: "", role: "caixa", pin: "", unit: "matriz" });
  const [resetTarget, setResetTarget] = useState<string | null>(null);
  const [newPin, setNewPin] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!form.operatorId || !form.name || form.pin.length !== 4) return;
    setLoading(true);
    try {
      await createOp({ operatorId: form.operatorId.padStart(3, "0"), name: form.name, role: form.role, pin: form.pin, units: [form.unit] });
      toast.success(`Operador ${form.name} criado.`);
      setShowCreate(false);
      setForm({ operatorId: "", name: "", role: "caixa", pin: "", unit: "matriz" });
    } catch (e) {
      const err = e as { data?: { message?: string } };
      toast.error(err.data?.message ?? "Erro ao criar");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPin = async () => {
    if (!resetTarget || newPin.length !== 4) return;
    setLoading(true);
    try {
      await resetPin({ operatorId: resetTarget, newPin });
      toast.success("PIN redefinido.");
      setResetTarget(null);
      setNewPin("");
    } catch {
      toast.error("Erro ao redefinir PIN.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Operadores</h2>
        <button
          onClick={() => setShowCreate(true)}
          className="cursor-pointer flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-3.5 h-3.5" /> Novo
        </button>
      </div>

      {/* Lista */}
      {operators === undefined ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        </div>
      ) : (
        <div className="space-y-2">
          {operators.map((op) => (
            <div key={op._id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{op.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground font-mono">{op.operatorId}</span>
                  <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium", op.active ? "bg-emerald-500/10 text-emerald-600" : "bg-destructive/10 text-destructive")}>
                    {op.active ? "Ativo" : "Inativo"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground capitalize mt-0.5">{op.role} · {op.units.join(", ")}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => { setResetTarget(op.operatorId); setNewPin(""); }}
                  className="cursor-pointer p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  title="Redefinir PIN"
                >
                  <KeyRound className="w-4 h-4" />
                </button>
                <button
                  onClick={async () => {
                    await toggleOp({ operatorId: op.operatorId });
                    toast.info(`${op.name} ${op.active ? "desativado" : "ativado"}.`);
                  }}
                  className="cursor-pointer p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  title={op.active ? "Desativar" : "Ativar"}
                >
                  {op.active ? <ToggleRight className="w-4 h-4 text-emerald-500" /> : <ToggleLeft className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal criar operador */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-6 z-50" onClick={() => setShowCreate(false)}>
          <div className="w-full max-w-sm bg-background rounded-2xl p-6 border border-border shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold">Novo Operador</h3>
              <button onClick={() => setShowCreate(false)} className="cursor-pointer text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              {[
                { label: "ID (ex: 004)", key: "operatorId", type: "text", numeric: true, max: 3 },
                { label: "Nome", key: "name", type: "text", numeric: false, max: 40 },
                { label: "PIN (4 dígitos)", key: "pin", type: "password", numeric: true, max: 4 },
                { label: "Unidade", key: "unit", type: "text", numeric: false, max: 20 },
              ].map(({ label, key, type, numeric, max }) => (
                <div key={key} className="space-y-1">
                  <label className="text-[10px] font-medium text-muted-foreground tracking-widest uppercase">{label}</label>
                  <input
                    type={type}
                    inputMode={numeric ? "numeric" : "text"}
                    maxLength={max}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: numeric ? e.target.value.replace(/\D/g, "") : e.target.value }))}
                    className="w-full h-10 px-3 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  />
                </div>
              ))}
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-muted-foreground tracking-widest uppercase">Perfil</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                  className="w-full h-10 px-3 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                >
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <button
              disabled={loading || !form.operatorId || !form.name || form.pin.length !== 4}
              onClick={handleCreate}
              className="cursor-pointer w-full h-10 mt-5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-35 disabled:cursor-not-allowed"
            >
              {loading ? "Criando..." : "Criar"}
            </button>
          </div>
        </div>
      )}

      {/* Modal redefinir PIN */}
      {resetTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-6 z-50" onClick={() => setResetTarget(null)}>
          <div className="w-full max-w-xs bg-background rounded-2xl p-6 border border-border shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Redefinir PIN — {resetTarget}</h3>
              <button onClick={() => setResetTarget(null)} className="cursor-pointer text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
            </div>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="Novo PIN"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              className="w-full h-11 px-4 rounded-xl bg-secondary border border-border text-foreground text-center text-xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
            <button
              disabled={loading || newPin.length !== 4}
              onClick={handleResetPin}
              className="cursor-pointer w-full h-10 mt-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-35 disabled:cursor-not-allowed"
            >
              {loading ? "Salvando..." : "Confirmar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
