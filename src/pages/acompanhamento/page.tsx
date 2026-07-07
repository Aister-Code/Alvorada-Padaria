import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { motion } from "motion/react";
import { ArrowLeft, ClipboardList, Bike } from "lucide-react";
import { toast } from "sonner";
import type { OperatorSession } from "@/App.tsx";
import type { Id } from "@/convex/_generated/dataModel.d.ts";
import PedidoCard from "./_components/PedidoCard.tsx";
import PedidoDetalheDrawer from "./_components/PedidoDetalheDrawer.tsx";
import ModalCancelamento from "./_components/ModalCancelamento.tsx";
import ModalReabertura from "./_components/ModalReabertura.tsx";
import FilaEntregaTab from "./_components/FilaEntregaTab.tsx";
import { cn } from "@/lib/utils.ts";

type Props = {
  operator: OperatorSession;
  onBack: () => void;
  initialAba?: "pedidos" | "delivery";
};

type Aba = "pedidos" | "delivery";
type Filtro = "todos" | "enviado_producao" | "em_producao" | "pronto" | "entregue";

type AcompanhamentoPedido = {
  _id: Id<"pedidos">;
  numero: string;
  status: string;
  modalidadeAtendimento: string;
  canalOrigem: string;
  dataAbertura: string;
  totalLiquido: number;
};

const FILTROS: { id: Filtro; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "enviado_producao", label: "Aguardando" },
  { id: "em_producao", label: "Em produção" },
  { id: "pronto", label: "Prontos" },
  { id: "entregue", label: "Entregues" },
];

export default function AcompanhamentoPage({ operator, onBack, initialAba = "pedidos" }: Props) {
  const [aba, setAba] = useState<Aba>(initialAba);
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [pedidoSelecionadoId, setPedidoSelecionadoId] = useState<Id<"pedidos"> | null>(null);
  const [showCancel, setShowCancel] = useState(false);
  const [showReabrir, setShowReabrir] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  const unit = operator.units?.[0] ?? "alvorada-01";

  const pedidos = useQuery(api.venda.pedidos.listarPedidosEmAndamento, { unit }) as AcompanhamentoPedido[] | undefined;
  const filaDelivery = useQuery(api.venda.delivery.listarFilaDelivery, { unit });
  const operadorConvex = useQuery(api.venda.operadores.resolveOperatorConvexId, { operatorId: operator.operatorId });

  const cancelarPedido = useMutation(api.venda.pedidos.cancelarPedido);
  const reabrirPedido = useMutation(api.venda.pedidos.reabrirPedido);

  const pedidosFiltrados = (pedidos ?? []).filter((p) =>
    filtro === "todos" ? true : p.status === filtro,
  );

  const handleCancelar = async (motivo: string) => {
    if (!pedidoSelecionadoId || !operadorConvex) return;
    setLoadingAction(true);
    try {
      await cancelarPedido({
        pedidoId: pedidoSelecionadoId,
        operadorId: operadorConvex._id,
        motivoCancelamento: motivo,
      });
      toast.success("Pedido cancelado com sucesso");
      setShowCancel(false);
      setPedidoSelecionadoId(null);
    } catch {
      toast.error("Erro ao cancelar pedido");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleReabrir = async (motivo: string) => {
    if (!pedidoSelecionadoId || !operadorConvex) return;
    setLoadingAction(true);
    try {
      await reabrirPedido({
        pedidoId: pedidoSelecionadoId,
        operadorId: operadorConvex._id,
        motivoReabertura: motivo,
      });
      toast.success("Pedido reaberto com sucesso");
      setShowReabrir(false);
      setPedidoSelecionadoId(null);
    } catch {
      toast.error("Erro ao reabrir pedido");
    } finally {
      setLoadingAction(false);
    }
  };

  const deliveryBadge = (filaDelivery?.length ?? 0);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background/95 backdrop-blur sticky top-0 z-10">
        <button onClick={onBack} className="cursor-pointer text-muted-foreground hover:text-foreground">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-foreground">Painel de Pedidos</h1>
          <p className="text-xs text-muted-foreground">
            {pedidos === undefined ? "Carregando..." : `${pedidos.length} pedido${pedidos.length !== 1 ? "s" : ""} em andamento`}
          </p>
        </div>
      </header>

      {/* Abas */}
      <div className="flex border-b border-border shrink-0">
        <button
          onClick={() => setAba("pedidos")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 text-sm font-medium py-2.5 transition-colors cursor-pointer",
            aba === "pedidos"
              ? "text-foreground border-b-2 border-[var(--brand-orange)]"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <ClipboardList size={15} />
          Todos os Pedidos
        </button>
        <button
          onClick={() => setAba("delivery")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 text-sm font-medium py-2.5 transition-colors cursor-pointer relative",
            aba === "delivery"
              ? "text-foreground border-b-2 border-sky-500"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Bike size={15} />
          Fila de Entrega
          {deliveryBadge > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-sky-500 text-white">
              {deliveryBadge}
            </span>
          )}
        </button>
      </div>

      {/* Conteúdo das abas */}
      {aba === "pedidos" ? (
        <>
          {/* Filtros */}
          <div className="flex gap-2 px-4 py-3 border-b border-border overflow-x-auto shrink-0">
            {FILTROS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFiltro(f.id)}
                className={cn(
                  "shrink-0 text-xs px-3 py-1.5 rounded-full border font-medium cursor-pointer transition-all",
                  filtro === f.id
                    ? "bg-[var(--brand-orange)] text-white border-[var(--brand-orange)]"
                    : "border-border text-muted-foreground hover:border-[var(--brand-orange)]",
                )}
              >
                {f.label}
                {f.id !== "todos" && pedidos && (
                  <span className="ml-1 opacity-70">
                    ({pedidos.filter((p) => p.status === f.id).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Lista */}
          <div className="flex-1 overflow-y-auto p-4">
            {pedidos === undefined ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-40 rounded-2xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : pedidosFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
                <ClipboardList size={36} className="text-muted-foreground/40" />
                <p className="text-sm font-medium text-muted-foreground">Nenhum pedido em andamento</p>
                <p className="text-xs text-muted-foreground/60">Pedidos confirmados aparecerão aqui em tempo real.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {pedidosFiltrados.map((p, i) => (
                  <motion.div
                    key={p._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.03, ease: "easeOut" as const }}
                  >
                    <PedidoCard
                      numero={p.numero}
                      status={p.status}
                      modalidade={p.modalidadeAtendimento}
                      canalOrigem={p.canalOrigem}
                      dataAbertura={p.dataAbertura}
                      itensAtivos={0}
                      itensProntos={0}
                      totalLiquido={p.totalLiquido}
                      onClick={() => setPedidoSelecionadoId(p._id)}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <FilaEntregaTab operator={operator} />
      )}

      {/* Drawer de detalhe */}
      {pedidoSelecionadoId && (
        <PedidoDetalheDrawer
          pedidoId={pedidoSelecionadoId}
          operator={operator}
          onClose={() => setPedidoSelecionadoId(null)}
          onRequestCancel={() => setShowCancel(true)}
          onRequestReabrir={() => setShowReabrir(true)}
        />
      )}

      {/* Modal cancelamento */}
      {showCancel && (
        <ModalCancelamento
          onConfirm={handleCancelar}
          onClose={() => setShowCancel(false)}
          loading={loadingAction}
        />
      )}

      {/* Modal reabertura */}
      {showReabrir && (
        <ModalReabertura
          onConfirm={handleReabrir}
          onClose={() => setShowReabrir(false)}
          loading={loadingAction}
        />
      )}
    </div>
  );
}
