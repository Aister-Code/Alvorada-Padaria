import { useEffect, useState } from "react";
import { Clock, Package } from "lucide-react";
import { cn } from "@/lib/utils.ts";

type Props = {
  numero: string;
  status: string;
  modalidade: string;
  canalOrigem: string;
  dataAbertura: string;
  itensAtivos: number;
  itensProntos: number;
  totalLiquido: number;
  onClick: () => void;
};

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  enviado_producao: { label: "Aguardando produção", classes: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300" },
  em_producao:      { label: "Em produção",          classes: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
  pronto:           { label: "Pronto",                classes: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  entregue:         { label: "Entregue",              classes: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300" },
};

function formatBRL(val: number) {
  return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDecorrido(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  if (m < 1) return `${s}s`;
  const h = Math.floor(m / 60);
  if (h < 1) return `${m}min`;
  return `${h}h${m % 60}min`;
}

export default function PedidoCard({ numero, status, modalidade, canalOrigem, dataAbertura, itensAtivos, itensProntos, totalLiquido, onClick }: Props) {
  const [agora, setAgora] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setAgora(Date.now()), 10_000);
    return () => clearInterval(id);
  }, []);

  const decorrido = agora - new Date(dataAbertura).getTime();
  const minutos = Math.floor(decorrido / 60_000);
  const urgente = minutos >= 30;
  const atencao = minutos >= 15 && !urgente;

  const cfg = STATUS_CONFIG[status] ?? { label: status, classes: "bg-muted text-muted-foreground" };
  const progresso = itensAtivos > 0 ? Math.round((itensProntos / itensAtivos) * 100) : 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left bg-card border rounded-2xl p-4 space-y-3 cursor-pointer hover:shadow-md transition-all",
        urgente ? "border-destructive/60" : atencao ? "border-amber-400/60" : "border-border",
      )}
    >
      {/* Linha topo */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-base font-bold text-foreground">#{numero}</p>
          <p className="text-[11px] text-muted-foreground capitalize">{modalidade.replace("_", " ")} · {canalOrigem}</p>
        </div>
        <span className={cn("text-[10px] font-semibold px-2 py-1 rounded-full shrink-0", cfg.classes)}>
          {cfg.label}
        </span>
      </div>

      {/* Tempo decorrido */}
      <div className={cn(
        "flex items-center gap-1.5 text-xs font-medium",
        urgente ? "text-destructive" : atencao ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground",
      )}>
        <Clock size={12} />
        <span>{formatDecorrido(decorrido)}</span>
        {(urgente || atencao) && <span className="text-[10px]">{urgente ? "· Atrasado" : "· Atenção"}</span>}
      </div>

      {/* Progresso de produção */}
      {itensAtivos > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><Package size={10} /> {itensProntos}/{itensAtivos} itens</span>
            <span>{progresso}%</span>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", progresso === 100 ? "bg-emerald-500" : "bg-[var(--brand-orange)]")}
              style={{ width: `${progresso}%` }}
            />
          </div>
        </div>
      )}

      {/* Total */}
      <div className="flex justify-between items-center border-t border-border/50 pt-2">
        <span className="text-[11px] text-muted-foreground">Total</span>
        <span className="text-sm font-bold text-foreground">{formatBRL(totalLiquido)}</span>
      </div>
    </button>
  );
}
