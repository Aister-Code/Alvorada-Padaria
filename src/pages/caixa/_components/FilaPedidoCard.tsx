import { useEffect, useState } from "react";
import { Clock, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils.ts";

type Props = {
  numero: string;
  modalidade: string;
  canalOrigem: string;
  dataAbertura: string;
  totalBruto: number;
  onClick: () => void;
};

function formatBRL(val: number) {
  return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDecorrido(ms: number): string {
  const m = Math.floor(ms / 60_000);
  if (m < 1) return "< 1min";
  const h = Math.floor(m / 60);
  if (h < 1) return `${m}min`;
  return `${h}h${m % 60}min`;
}

export default function FilaPedidoCard({ numero, modalidade, canalOrigem, dataAbertura, totalBruto, onClick }: Props) {
  const [agora, setAgora] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setAgora(Date.now()), 15_000);
    return () => clearInterval(id);
  }, []);

  const decorrido = agora - new Date(dataAbertura).getTime();
  const urgente = Math.floor(decorrido / 60_000) >= 10;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left bg-card border rounded-2xl p-4 space-y-3 cursor-pointer hover:shadow-md transition-all",
        urgente ? "border-amber-400/60" : "border-border",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-base font-bold text-foreground">#{numero}</p>
          <p className="text-[11px] text-muted-foreground capitalize">
            {modalidade.replace("_", " ")} · {canalOrigem}
          </p>
        </div>
        <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300 shrink-0">
          Aguarda Pagamento
        </span>
      </div>

      <div className={cn(
        "flex items-center gap-1.5 text-xs font-medium",
        urgente ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground",
      )}>
        <Clock size={12} />
        <span>{formatDecorrido(decorrido)}</span>
        {urgente && <span className="text-[10px]">· Atenção</span>}
      </div>

      <div className="flex justify-between items-center border-t border-border/50 pt-2">
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <ShoppingBag size={11} /> Total
        </span>
        <span className="text-sm font-bold text-foreground">{formatBRL(totalBruto)}</span>
      </div>
    </button>
  );
}
