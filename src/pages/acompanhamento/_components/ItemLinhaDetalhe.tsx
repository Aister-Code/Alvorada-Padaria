import { cn } from "@/lib/utils.ts";

type Props = {
  nome: string;
  quantidade: number;
  subtotal: number;
  statusProducao: string;
  observacaoItem?: string;
};

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  aguardando:  { label: "Aguardando",  classes: "bg-muted text-muted-foreground" },
  em_producao: { label: "Em produção", classes: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" },
  pronto:      { label: "Pronto",      classes: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" },
  entregue:    { label: "Entregue",    classes: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400" },
  cancelado:   { label: "Cancelado",   classes: "bg-destructive/10 text-destructive" },
};

function formatBRL(val: number) {
  return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ItemLinhaDetalhe({ nome, quantidade, subtotal, statusProducao, observacaoItem }: Props) {
  const cfg = STATUS_CONFIG[statusProducao] ?? { label: statusProducao, classes: "bg-muted text-muted-foreground" };

  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border/50 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{nome}</p>
        {observacaoItem && (
          <p className="text-[11px] text-muted-foreground italic mt-0.5 truncate">{observacaoItem}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-muted-foreground">×{quantidade}</span>
        <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full", cfg.classes)}>{cfg.label}</span>
        <span className="text-sm font-semibold text-foreground w-16 text-right">{formatBRL(subtotal)}</span>
      </div>
    </div>
  );
}
