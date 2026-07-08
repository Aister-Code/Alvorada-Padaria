import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export const CANAIS_ORIGEM = [
  { value: "balcao", label: "Balcão" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "aplicativo", label: "Aplicativo" },
  { value: "telefone", label: "Telefone" },
  { value: "ifood", label: "iFood" },
  { value: "totem", label: "Totem" },
  { value: "garcom", label: "Garçom" },
] as const;

export const MODALIDADES = [
  { value: "consumo_local", label: "Consumo no local" },
  { value: "retirada", label: "Retirada" },
  { value: "mesa", label: "Mesa" },
  { value: "delivery", label: "Delivery" },
] as const;

type Props = {
  onConfirm: (canal: string, modalidade: string, obs?: string) => void;
  onClose: () => void;
};

export default function NovoPedidoModal({ onConfirm, onClose }: Props) {
  const [canal, setCanal] = useState("balcao");
  const [modalidade, setModalidade] = useState("consumo_local");
  const [obs, setObs] = useState("");

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-background w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl"
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-foreground">Novo Atendimento</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer">
              <X size={20} />
            </button>
          </div>

          {/* Canal de Origem */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Canal de Origem
            </label>
            <select
              value={canal}
              onChange={(event) => setCanal(event.target.value)}
              className="h-11 w-full cursor-pointer rounded-xl border border-border bg-muted/30 px-3 text-sm font-medium text-foreground outline-none transition-colors focus:border-[var(--brand-olive)]"
            >
              {CANAIS_ORIGEM.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Modalidade de Atendimento */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Modalidade
            </label>
            <select
              value={modalidade}
              onChange={(event) => setModalidade(event.target.value)}
              className="h-11 w-full cursor-pointer rounded-xl border border-border bg-muted/30 px-3 text-sm font-medium text-foreground outline-none transition-colors focus:border-[var(--brand-olive)]"
            >
              {MODALIDADES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Observação */}
          <div className="mb-5">
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Observação <span className="normal-case font-normal">(opcional)</span>
            </label>
            <textarea
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              rows={2}
              placeholder="Ex: cliente com pressa..."
              className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-muted/30 focus:outline-none focus:ring-2 focus:ring-[var(--brand-orange)] resize-none text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1 cursor-pointer" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-[var(--brand-orange)] hover:bg-[var(--brand-orange)]/90 text-white cursor-pointer"
              onClick={() => onConfirm(canal, modalidade, obs || undefined)}
            >
              Iniciar Atendimento
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
