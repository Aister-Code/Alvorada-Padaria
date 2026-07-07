import { useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { RefreshCw, AlertTriangle } from "lucide-react";

type Props = {
  onConfirm: (motivo: string) => void;
  onClose: () => void;
  loading: boolean;
};

export default function ModalReabertura({ onConfirm, onClose, loading }: Props) {
  const [motivo, setMotivo] = useState("");
  const valid = motivo.trim().length >= 5;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-sm p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
            <RefreshCw size={18} className="text-indigo-500" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">Reabrir Pedido</h2>
            <p className="text-xs text-muted-foreground">Exclusivo para gerentes.</p>
          </div>
        </div>

        {/* Alerta sobre itens cancelados */}
        <div className="flex gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg px-3 py-2.5">
          <AlertTriangle size={14} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed">
            Itens cancelados antes do cancelamento do pedido <strong>permanecem cancelados</strong>. Apenas o status do pedido será restaurado para "aberto".
          </p>
        </div>

        <textarea
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Motivo da reabertura..."
          rows={3}
          className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-muted/30 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-foreground placeholder:text-muted-foreground"
        />

        <div className="flex gap-2">
          <Button variant="ghost" className="flex-1 cursor-pointer" onClick={onClose} disabled={loading}>
            Voltar
          </Button>
          <Button
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
            onClick={() => onConfirm(motivo.trim())}
            disabled={!valid || loading}
          >
            {loading ? "Reabrindo..." : "Reabrir Pedido"}
          </Button>
        </div>
      </div>
    </div>
  );
}
