import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { ConvexError } from "convex/values";
import { toast } from "sonner";
import RoleSelect from "./RoleSelect.tsx";

function hashPin(pin: string): string {
  return `pin_${pin}`;
}

type OperatorData = {
  operatorId: string;
  name: string;
  role: string;
  phone?: string;
  active: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  initial?: OperatorData;
  sessionOperatorId: string;
  unit: string;
};

export default function OperatorFormModal({
  open, onClose, mode, initial, sessionOperatorId, unit,
}: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [role, setRole] = useState(initial?.role ?? "caixa");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [pin, setPin] = useState("1234");
  const [loading, setLoading] = useState(false);

  const createOp = useMutation(api.operators.manage.createOperator);
  const updateOp = useMutation(api.operators.manage.updateOperator);

  // Reset form when modal opens
  const handleOpen = () => {
    if (mode === "create") {
      setName("");
      setRole("caixa");
      setPhone("");
      setPin("1234");
    } else if (initial) {
      setName(initial.name);
      setRole(initial.role);
      setPhone(initial.phone ?? "");
    }
  };

  const canSave = name.trim().length >= 2 && role.length > 0 && (mode === "edit" || pin.length === 4);

  const handleSave = async () => {
    if (!canSave) return;
    setLoading(true);
    try {
      if (mode === "create") {
        const res = await createOp({
          sessionOperatorId,
          unit,
          name,
          role,
          pinHash: hashPin(pin),
          phone: phone.trim() || undefined,
        });
        toast.success(`Operador ${res.operatorId} criado. Faça o login com PIN ${pin}.`);
      } else if (initial) {
        await updateOp({
          sessionOperatorId,
          unit,
          operatorId: initial.operatorId,
          name,
          role,
          phone: phone.trim() || undefined,
        });
        toast.success("Operador atualizado.");
      }
      onClose();
    } catch (err) {
      if (err instanceof ConvexError) {
        const d = err.data as { message: string };
        toast.error(d.message);
      } else {
        toast.error("Erro ao salvar. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence onExitComplete={handleOpen}>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center px-6 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: "easeOut" as const }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-background rounded-2xl p-6 shadow-xl border border-border"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold tracking-wide">
                {mode === "create" ? "Novo Operador" : "Editar Operador"}
              </h2>
              <button onClick={onClose} className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Nome */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-medium text-muted-foreground tracking-widest uppercase">
                  Nome *
                </label>
                <input
                  type="text"
                  placeholder="Nome completo"
                  value={name}
                  autoComplete="off"
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                />
              </div>

              {/* Perfil */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-medium text-muted-foreground tracking-widest uppercase">
                  Perfil *
                </label>
                <RoleSelect value={role} onChange={setRole} />
              </div>

              {/* Telefone */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-medium text-muted-foreground tracking-widest uppercase">
                  Telefone
                </label>
                <input
                  type="tel"
                  inputMode="tel"
                  placeholder="(69) 99999-9999"
                  value={phone}
                  autoComplete="off"
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                />
              </div>

              {/* PIN inicial — somente na criação */}
              {mode === "create" && (
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-medium text-muted-foreground tracking-widest uppercase">
                    PIN inicial *
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="••••"
                    value={pin}
                    autoComplete="off"
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    className="w-full h-11 px-4 rounded-xl bg-secondary border border-border text-foreground text-center text-xl tracking-[0.5em] placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  />
                  <p className="text-[10px] text-muted-foreground px-1">
                    Padrão: 1234. Altere antes de salvar se necessário.
                  </p>
                </div>
              )}
            </div>

            <button
              disabled={!canSave || loading}
              onClick={handleSave}
              className="cursor-pointer w-full h-11 mt-6 rounded-xl bg-primary text-primary-foreground text-sm font-medium tracking-[0.15em] uppercase hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-35 disabled:cursor-not-allowed"
            >
              {loading ? "Salvando..." : mode === "create" ? "Criar Operador" : "Salvar Alterações"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
