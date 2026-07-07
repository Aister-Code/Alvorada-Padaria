import { useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { AlertTriangle } from "lucide-react";

type Props = {
  onConfirm: (motivo: string) => void;
  onClose: () => void;
  loading: boolean;
  titulo?: string;
};

export default function ModalCancelamento({ onConfirm, onClose, loading, titulo = "Cancelar Pedido" }: Props) {
  const [motivo, setMotivo] = useState("");
  const valid = motivo.trim().length >= 5;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-sm p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
            <AlertTriangle size={18} className="text-destructive" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">{titulo}</h2>
            <p className="text-xs text-muted-foreground">Informe o motivo para registrar na linha do tempo.</p>
          </div>
        </div>

        <textarea
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Descreva o motivo do cancelamento..."
          rows={3}
          className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-muted/30 resize-none focus:outline-none focus:ring-2 focus:ring-destructive/50 text-foreground placeholder:text-muted-foreground"
        />

        <div className="flex gap-2">
          <Button variant="ghost" className="flex-1 cursor-pointer" onClick={onClose} disabled={loading}>
            Voltar
          </Button>
          <Button
            className="flex-1 bg-destructive hover:bg-destructive/90 text-white cursor-pointer"
            onClick={() => onConfirm(motivo.trim())}
            disabled={!valid || loading}
          >
            {loading ? "Cancelando..." : "Confirmar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
