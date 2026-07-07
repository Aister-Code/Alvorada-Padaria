import { Clock, Plus, Minus, Edit2, CheckCircle, XCircle, RefreshCw, Package, Truck } from "lucide-react";
import { cn } from "@/lib/utils.ts";

type Evento = {
  _id: string;
  tipo: string;
  operadorNomeSnapshot: string;
  timestamp: string;
  payload?: string;
};

type Props = {
  eventos: Evento[];
};

const TIPO_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pedido_criado:          { label: "Pedido aberto",        color: "text-blue-500",      icon: <Plus size={13} /> },
  item_adicionado:        { label: "Item adicionado",      color: "text-emerald-500",   icon: <Plus size={13} /> },
  item_removido:          { label: "Item removido",        color: "text-orange-500",    icon: <Minus size={13} /> },
  item_alterado:          { label: "Quantidade alterada",  color: "text-amber-500",     icon: <Edit2 size={13} /> },
  pedido_enviado_producao:{ label: "Enviado à produção",   color: "text-violet-500",    icon: <Package size={13} /> },
  pedido_em_producao:     { label: "Em produção",          color: "text-amber-500",     icon: <Package size={13} /> },
  pedido_pronto:          { label: "Pedido pronto",        color: "text-emerald-500",   icon: <CheckCircle size={13} /> },
  pedido_entregue:        { label: "Entregue ao cliente",  color: "text-blue-500",      icon: <Truck size={13} /> },
  pedido_cancelado:       { label: "Pedido cancelado",     color: "text-destructive",   icon: <XCircle size={13} /> },
  pedido_reaberto:        { label: "Pedido reaberto",      color: "text-indigo-500",    icon: <RefreshCw size={13} /> },
};

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });
}

export default function EventoTimeline({ eventos }: Props) {
  if (eventos.length === 0) {
    return (
      <div className="flex items-center gap-2 py-4 text-xs text-muted-foreground">
        <Clock size={14} />
        <span>Nenhum evento registrado.</span>
      </div>
    );
  }

  return (
    <div className="relative pl-5 space-y-4">
      {/* Linha vertical */}
      <div className="absolute left-1.5 top-1 bottom-1 w-px bg-border" />

      {eventos.map((ev) => {
        const config = TIPO_CONFIG[ev.tipo] ?? { label: ev.tipo, color: "text-muted-foreground", icon: <Clock size={13} /> };
        return (
          <div key={ev._id} className="relative">
            {/* Ponto na linha */}
            <div className={cn("absolute -left-[13px] top-0.5 w-3 h-3 rounded-full bg-background border-2 border-border flex items-center justify-center", config.color)}>
              <div className={cn("w-1.5 h-1.5 rounded-full bg-current")} />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn("flex items-center gap-1 text-xs font-semibold", config.color)}>
                  {config.icon}
                  {config.label}
                </span>
                <span className="text-[10px] text-muted-foreground">{formatTimestamp(ev.timestamp)}</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">{ev.operadorNomeSnapshot}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
