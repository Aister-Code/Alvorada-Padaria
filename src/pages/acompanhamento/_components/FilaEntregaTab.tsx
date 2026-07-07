import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { motion } from "motion/react";
import { Bike, Clock, MapPin, Phone, User, Truck, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button.tsx";
import type { OperatorSession } from "@/App.tsx";
import { cn } from "@/lib/utils.ts";

type Props = {
  operator: OperatorSession;
};

type FilaDeliveryPedido = {
  _id: string;
  numero: string;
  status: string;
  dataAbertura: string;
  clienteNomeSnapshot?: string;
  clienteTelefoneSnapshot?: string;
  enderecoEntrega?: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    referencia?: string;
  };
  totalLiquido: number;
};

function formatBRL(val: number) {
  return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDecorrido(dataAbertura: string): string {
  const ms = Date.now() - new Date(dataAbertura).getTime();
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  if (m < 1) return `${s}s`;
  const h = Math.floor(m / 60);
  if (h < 1) return `${m}min`;
  return `${h}h${m % 60}min`;
}

const STATUS_FILA: Record<string, { label: string; classes: string; dot: string }> = {
  pronto: {
    label: "Aguardando motoboy",
    classes: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  saiu_para_entrega: {
    label: "Em rota",
    classes: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
    dot: "bg-sky-500",
  },
};

export default function FilaEntregaTab({ operator }: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [agora, setAgora] = useState(Date.now());

  const unit = operator.units?.[0] ?? "alvorada-01";
  const pedidos = useQuery(api.venda.delivery.listarFilaDelivery, { unit }) as FilaDeliveryPedido[] | undefined;
  const operadorConvex = useQuery(api.venda.operadores.resolveOperatorConvexId, {
    operatorId: operator.operatorId,
  });

  const registrarSaida = useMutation(api.venda.delivery.registrarSaidaMotoboy);
  const confirmarEntrega = useMutation(api.venda.delivery.confirmarEntregaDelivery);

  useEffect(() => {
    const id = setInterval(() => setAgora(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const handleSaidaMotoboy = async (pedidoId: string) => {
    if (!operadorConvex) return;
    setLoadingId(pedidoId);
    try {
      await registrarSaida({
        pedidoId: pedidoId as Parameters<typeof registrarSaida>[0]["pedidoId"],
        operadorId: operadorConvex._id,
      });
      toast.success("Motoboy saiu para entrega!");
    } catch {
      toast.error("Erro ao registrar saída do motoboy");
    } finally {
      setLoadingId(null);
    }
  };

  const handleConfirmarEntrega = async (pedidoId: string) => {
    if (!operadorConvex) return;
    setLoadingId(pedidoId);
    try {
      await confirmarEntrega({
        pedidoId: pedidoId as Parameters<typeof confirmarEntrega>[0]["pedidoId"],
        operadorId: operadorConvex._id,
      });
      toast.success("Entrega confirmada! Pedido encaminhado ao Caixa.");
    } catch {
      toast.error("Erro ao confirmar entrega");
    } finally {
      setLoadingId(null);
    }
  };

  if (pedidos === undefined) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-44 rounded-2xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (pedidos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3 text-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
          <Bike size={22} className="text-muted-foreground/50" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">Nenhum pedido na fila de entrega</p>
        <p className="text-xs text-muted-foreground/60">
          Pedidos delivery prontos aparecerão aqui para o motoboy retirar.
        </p>
      </div>
    );
  }

  const prontos = pedidos.filter((p) => p.status === "pronto");
  const emRota = pedidos.filter((p) => p.status === "saiu_para_entrega");

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-5">
      {prontos.length > 0 && (
        <section>
          <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            Aguardando motoboy ({prontos.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {prontos.map((p, i) => {
              const cfg = STATUS_FILA[p.status] ?? STATUS_FILA.pronto;
              const minutos = Math.floor((agora - new Date(p.dataAbertura).getTime()) / 60_000);
              const urgente = minutos >= 30;
              return (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.04, ease: "easeOut" as const }}
                  className={cn(
                    "bg-card border rounded-2xl p-4 space-y-3",
                    urgente ? "border-destructive/60" : "border-emerald-300/60 dark:border-emerald-700/40",
                  )}
                >
                  {/* Topo */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-base font-bold text-foreground">#{p.numero}</p>
                      <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1", cfg.classes)}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
                        {cfg.label}
                      </span>
                    </div>
                    <div className={cn(
                      "flex items-center gap-1 text-xs font-medium",
                      urgente ? "text-destructive" : "text-muted-foreground",
                    )}>
                      <Clock size={11} />
                      {formatDecorrido(p.dataAbertura)}
                    </div>
                  </div>

                  {/* Cliente */}
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2 text-foreground font-medium">
                      <User size={13} className="text-muted-foreground shrink-0" />
                      <span className="truncate">{p.clienteNomeSnapshot ?? "—"}</span>
                    </div>
                    {p.clienteTelefoneSnapshot && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone size={13} className="shrink-0" />
                        <span className="text-xs">{p.clienteTelefoneSnapshot}</span>
                      </div>
                    )}
                    {p.enderecoEntrega && (
                      <div className="flex items-start gap-2 text-muted-foreground">
                        <MapPin size={13} className="shrink-0 mt-0.5" />
                        <p className="text-xs leading-snug">
                          {p.enderecoEntrega.logradouro}, {p.enderecoEntrega.numero}
                          {p.enderecoEntrega.complemento ? ` · ${p.enderecoEntrega.complemento}` : ""}
                          <br />
                          <span className="font-medium text-foreground">{p.enderecoEntrega.bairro}</span>
                          {p.enderecoEntrega.referencia && (
                            <> · {p.enderecoEntrega.referencia}</>
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center border-t border-border/50 pt-2 text-xs">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-bold text-foreground text-sm">{formatBRL(p.totalLiquido)}</span>
                  </div>

                  {/* Ação */}
                  <Button
                    className="w-full bg-sky-600 hover:bg-sky-700 text-white cursor-pointer text-sm"
                    disabled={loadingId === p._id}
                    onClick={() => { void handleSaidaMotoboy(p._id); }}
                  >
                    <Truck size={14} className="mr-2" />
                    {loadingId === p._id ? "Registrando..." : "Motoboy Saiu"}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {emRota.length > 0 && (
        <section>
          <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            Em rota ({emRota.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {emRota.map((p, i) => {
              const cfg = STATUS_FILA[p.status] ?? STATUS_FILA.saiu_para_entrega;
              return (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.04, ease: "easeOut" as const }}
                  className="bg-card border border-sky-200/60 dark:border-sky-700/40 rounded-2xl p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-base font-bold text-foreground">#{p.numero}</p>
                      <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1", cfg.classes)}>
                        <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", cfg.dot)} />
                        {cfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock size={11} />
                      {formatDecorrido(p.dataAbertura)}
                    </div>
                  </div>

                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2 text-foreground font-medium">
                      <User size={13} className="text-muted-foreground shrink-0" />
                      <span className="truncate">{p.clienteNomeSnapshot ?? "—"}</span>
                    </div>
                    {p.enderecoEntrega && (
                      <div className="flex items-start gap-2 text-muted-foreground">
                        <MapPin size={13} className="shrink-0 mt-0.5" />
                        <p className="text-xs leading-snug">
                          {p.enderecoEntrega.logradouro}, {p.enderecoEntrega.numero}
                          <br />
                          <span className="font-medium text-foreground">{p.enderecoEntrega.bairro}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center border-t border-border/50 pt-2 text-xs">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-bold text-foreground text-sm">{formatBRL(p.totalLiquido)}</span>
                  </div>

                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer text-sm"
                    disabled={loadingId === p._id}
                    onClick={() => { void handleConfirmarEntrega(p._id); }}
                  >
                    <CheckCircle2 size={14} className="mr-2" />
                    {loadingId === p._id ? "Confirmando..." : "Confirmar Entrega"}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
