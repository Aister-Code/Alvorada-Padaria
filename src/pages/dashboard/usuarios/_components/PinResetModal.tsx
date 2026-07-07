import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { ConvexError } from "convex/values";
import { toast } from "sonner";

function hashPin(pin: string): string {
  return `pin_${pin}`;
}

type Props = {
  open: boolean;
  onClose: () => void;
  operatorId: string;
  operatorName: string;
  sessionOperatorId: string;
  unit: string;
};

export default function PinResetModal({
  open, onClose, operatorId, operatorName, sessionOperatorId, unit,
}: Props) {
  const [pin, setPin] = useState("1234");
  const [pin2, setPin2] = useState("1234");
  const [loading, setLoading] = useState(false);

  const resetPin = useMutation(api.operators.manage.resetOperatorPin);

  const canSave = pin.length === 4 && pin === pin2;

  const handleSave = async () => {
    if (!canSave) return;
    setLoading(true);
    try {
      await resetPin({
        sessionOperatorId,
        unit,
        operatorId,
        newPinHash: hashPin(pin),
      });
      toast.success(`PIN de ${operatorName} redefinido com sucesso.`);
      onClose();
    } catch (err) {
      if (err instanceof ConvexError) {
        const d = err.data as { message: string };
        toast.error(d.message);
      } else {
        toast.error("Erro ao redefinir PIN. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
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
            className="w-full max-w-xs bg-background rounded-2xl p-6 shadow-xl border border-border"
          >
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-semibold tracking-wide">Redefinir PIN</h2>
              <button onClick={onClose} className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-5">
              Operador: <span className="font-medium text-foreground">{operatorName}</span>
            </p>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-medium text-muted-foreground tracking-widest uppercase">
                  Novo PIN
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
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-medium text-muted-foreground tracking-widest uppercase">
                  Confirmar PIN
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="••••"
                  value={pin2}
                  autoComplete="off"
                  onChange={(e) => setPin2(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  className="w-full h-11 px-4 rounded-xl bg-secondary border border-border text-foreground text-center text-xl tracking-[0.5em] placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                />
              </div>
              {pin.length === 4 && pin2.length === 4 && pin !== pin2 && (
                <p className="text-xs text-destructive">Os PINs não coincidem.</p>
              )}
            </div>

            <button
              disabled={!canSave || loading}
              onClick={handleSave}
              className="cursor-pointer w-full h-11 mt-5 rounded-xl bg-primary text-primary-foreground text-sm font-medium tracking-[0.15em] uppercase hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-35 disabled:cursor-not-allowed"
            >
              {loading ? "Salvando..." : "Salvar PIN"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
