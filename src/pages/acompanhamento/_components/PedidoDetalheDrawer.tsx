import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, CheckCircle, Truck, RefreshCw, XCircle, ChevronsRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button.tsx";
import type { Id } from "@/convex/_generated/dataModel.d.ts";
import type { OperatorSession } from "@/App.tsx";
import ItemLinhaDetalhe from "./ItemLinhaDetalhe.tsx";
import EventoTimeline from "./EventoTimeline.tsx";
import { cn } from "@/lib/utils.ts";

type Props = {
  pedidoId: Id<"pedidos">;
  operator: OperatorSession;
  onClose: () => void;
  onRequestCancel: () => void;
  onRequestReabrir: () => void;
};

type PedidoDetalheItem = {
  _id: string;
  nomeProdutoSnapshot: string;
  quantidade: number;
  subtotal: number;
  statusProducao: string;
  observacaoItem?: string;
};

const STATUS_LABEL: Record<string, string> = {
  aberto: "Aberto",
  enviado_producao: "Aguardando produção",
  em_producao: "Em produção",
  pronto: "Pronto",
  entregue: "Entregue",
  cancelado: "Cancelado",
  reaberto: "Reaberto",
};

// Avançar status — apenas transições operacionais (sem financeiro)
const AVANCAR_LABEL: Record<string, string> = {
  enviado_producao: "Iniciar Produção",
  em_producao: "Marcar como Pronto",
};

function formatBRL(val: number) {
  return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const isGerente = (role: string) => role === "gerente" || role === "superadmin";

export default function PedidoDetalheDrawer({ pedidoId, operator, onClose, onRequestCancel, onRequestReabrir }: Props) {
  const [loadingAvancar, setLoadingAvancar] = useState(false);

  const detalhe = useQuery(api.venda.pedidos.getPedidoDetalhe, { pedidoId });
  const operadorConvex = useQuery(api.venda.operadores.resolveOperatorConvexId, { operatorId: operator.operatorId });
  const marcarEntregue = useMutation(api.venda.pedidos.marcarEntregue);
  const avancarStatus = useMutation(api.venda.pedidos.avancarStatus);

  const pedido = detalhe?.pedido;
  const itens = (detalhe?.itens ?? []) as PedidoDetalheItem[];
  const eventos = detalhe?.eventos ?? [];

  // Marcar entregue — conclusão operacional (M-004 termina aqui)
  const handleEntregue = async (forcar = false) => {
    if (!operadorConvex || !pedido) return;
    try {
      await marcarEntregue({ pedidoId, operadorId: operadorConvex._id, forcar });
      toast.success(`Pedido #${pedido.numero} entregue. Encaminhar ao Caixa para pagamento.`);
      onClose();
    } catch {
      toast.error("Erro ao marcar como entregue");
    }
  };

  // Avançar status de produção — operacional puro
  const handleAvancar = async () => {
    if (!operadorConvex || !pedido) return;
    setLoadingAvancar(true);
    try {
      const res = await avancarStatus({ pedidoId, operadorId: operadorConvex._id });
      const novoLabel = STATUS_LABEL[res.novoStatus] ?? res.novoStatus;
      toast.success(`Pedido #${pedido.numero} → ${novoLabel}`);
    } catch {
      toast.error("Erro ao avançar status");
    } finally {
      setLoadingAvancar(false);
    }
  };

  // Transições de produção permitidas no M-004 (sem financeiro)
  const podeAvancar = pedido ? ["enviado_producao", "em_producao"].includes(pedido.status) : false;
  const podeEntregue = pedido?.status === "pronto";
  const podeForcarEntregue = isGerente(operator.role) &&
    (pedido?.status === "em_producao" || pedido?.status === "enviado_producao");

  const podeCancelar = pedido &&
    ["aberto", "enviado_producao", "em_producao", "pronto"].includes(pedido.status) &&
    (["aberto", "enviado_producao"].includes(pedido.status) || isGerente(operator.role));
  const podeReabrir = isGerente(operator.role) && pedido?.status === "cancelado";

  // Pedido já concluído operacionalmente — aguarda Caixa (M-005)
  const statusTerminal = pedido?.status === "entregue" || pedido?.status === "cancelado";

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 z-40 flex justify-end"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative w-full max-w-md bg-background h-full overflow-y-auto shadow-2xl flex flex-col"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 280 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-background border-b border-border px-4 py-3 flex items-center gap-3 z-10">
            <button onClick={onClose} className="cursor-pointer text-muted-foreground hover:text-foreground">
              <ArrowLeft size={18} />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">
                Pedido #{pedido?.numero ?? "..."}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {pedido ? STATUS_LABEL[pedido.status] ?? pedido.status : "Carregando..."}
              </p>
            </div>
            {pedido?.status === "entregue" && (
              <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300 shrink-0">
                Entregue · Aguarda Caixa
              </span>
            )}
          </div>

          {!detalhe ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">Carregando...</div>
          ) : (
            <div className="flex-1 p-4 space-y-6">

              {/* Info do pedido */}
              <section>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Detalhes</p>
                <div className="bg-muted/40 rounded-xl px-4 py-3 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Canal</span>
                    <span className="font-medium capitalize">{pedido!.canalOrigem}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Modalidade</span>
                    <span className="font-medium capitalize">{pedido!.modalidadeAtendimento.replace("_", " ")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Operador</span>
                    <span className="font-medium">{pedido!.operadorAberturaNomeSnapshot}</span>
                  </div>
                  <div className="flex justify-between border-t border-border/50 pt-1 mt-1">
                    <span className="text-muted-foreground">Total operacional</span>
                    <span className="font-bold text-foreground">{formatBRL(pedido!.totalLiquido)}</span>
                  </div>
                </div>
              </section>

              {/* Aviso de entrega concluída — aguarda M-005 */}
              {pedido?.status === "entregue" && (
                <section className="bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-xl px-4 py-3 text-sm text-sky-700 dark:text-sky-300">
                  <p className="font-semibold mb-0.5">Entrega concluída</p>
                  <p className="text-xs opacity-80">O pagamento será processado pelo Módulo Caixa (M-005).</p>
                </section>
              )}

              {/* Itens */}
              <section>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Itens ({itens.length})
                </p>
                <div className="bg-card border border-border rounded-xl px-4">
                  {itens.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">Sem itens ativos</p>
                  ) : (
                    itens.map((item) => (
                      <ItemLinhaDetalhe
                        key={item._id}
                        nome={item.nomeProdutoSnapshot}
                        quantidade={item.quantidade}
                        subtotal={item.subtotal}
                        statusProducao={item.statusProducao}
                        observacaoItem={item.observacaoItem}
                      />
                    ))
                  )}
                </div>
              </section>

              {/* Linha do tempo */}
              <section>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Linha do tempo
                </p>
                <EventoTimeline eventos={eventos} />
              </section>
            </div>
          )}

          {/* Ações operacionais — M-004 encerra em "entregue" */}
          {pedido && !statusTerminal && (
            <div className={cn("border-t border-border p-4 space-y-2 bg-background")}>
              {/* Avançar produção */}
              {podeAvancar && (
                <Button
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white cursor-pointer"
                  disabled={loadingAvancar}
                  onClick={() => { void handleAvancar(); }}
                >
                  <ChevronsRight size={15} className="mr-2" />
                  {loadingAvancar ? "Avançando..." : AVANCAR_LABEL[pedido.status] ?? "Avançar"}
                </Button>
              )}
              {/* Marcar entregue — término operacional */}
              {podeEntregue && (
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                  onClick={() => { void handleEntregue(false); }}
                >
                  <Truck size={15} className="mr-2" /> Marcar como Entregue
                </Button>
              )}
              {/* Forçar entrega — gerente */}
              {podeForcarEntregue && (
                <Button
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
                  onClick={() => { void handleEntregue(true); }}
                >
                  <CheckCircle size={15} className="mr-2" /> Forçar Entrega (Gerente)
                </Button>
              )}
              {/* Reabrir pedido cancelado */}
              {podeReabrir && (
                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                  onClick={onRequestReabrir}
                >
                  <RefreshCw size={15} className="mr-2" /> Reabrir Pedido
                </Button>
              )}
              {/* Cancelar pedido */}
              {podeCancelar && (
                <Button
                  variant="ghost"
                  className="w-full text-destructive hover:text-destructive cursor-pointer"
                  onClick={onRequestCancel}
                >
                  <XCircle size={15} className="mr-2" /> Cancelar Pedido
                </Button>
              )}
            </div>
          )}

          {/* Status terminal — pedido entregue ao Caixa */}
          {pedido?.status === "entregue" && (
            <div className="border-t border-border p-4 bg-background">
              <p className="text-xs text-center text-muted-foreground">
                Pedido entregue. Pagamento via M-005 Caixa.
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
