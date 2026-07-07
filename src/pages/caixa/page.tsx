import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { motion } from "motion/react";
import { ArrowLeft, Banknote, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import type { OperatorSession } from "@/App.tsx";
import type { Id } from "@/convex/_generated/dataModel.d.ts";
import FilaPedidoCard from "./_components/FilaPedidoCard.tsx";
import ModalFecharVenda from "./_components/ModalFecharVenda.tsx";

type Props = {
  operator: OperatorSession;
  onBack: () => void;
};

function formatBRL(val: number) {
  return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

type CaixaPedido = {
  _id: Id<"pedidos">;
  numero: string;
  modalidadeAtendimento: string;
  canalOrigem: string;
  dataAbertura: string;
  totalBruto: number;
};

type VendaDoDia = {
  totalLiquido: number;
};

export default function CaixaPage({ operator, onBack }: Props) {
  const [pedidoSelecionado, setPedidoSelecionado] = useState<{
    id: Id<"pedidos">;
    numero: string;
    totalBruto: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const unit = operator.units?.[0] ?? "alvorada-01";

  const pedidos = useQuery(api.caixa.vendas.listarPedidosParaPagamento, { unit }) as CaixaPedido[] | undefined;
  const vendasDoDia = useQuery(api.caixa.vendas.listarVendasDoDia, { unit }) as VendaDoDia[] | undefined;
  const operadorConvex = useQuery(api.venda.operadores.resolveOperatorConvexId, {
    operatorId: operator.operatorId,
  });

  const fecharVenda = useMutation(api.caixa.vendas.fecharVenda);

  // Resumo do dia
  const totalDia = (vendasDoDia ?? []).reduce((acc, v) => acc + v.totalLiquido, 0);
  const qtdVendas = vendasDoDia?.length ?? 0;

  const handleFechar = async (args: {
    formaPagamento: string;
    desconto: number;
    troco?: number;
  }) => {
    if (!pedidoSelecionado || !operadorConvex) return;
    setLoading(true);
    try {
      const res = await fecharVenda({
        pedidoId: pedidoSelecionado.id,
        operadorId: operadorConvex._id,
        formaPagamento: args.formaPagamento,
        desconto: args.desconto > 0 ? args.desconto : undefined,
        troco: args.troco,
      });
      toast.success(`Venda #${res.numero} registrada com sucesso!`);
      setPedidoSelecionado(null);
    } catch {
      toast.error("Erro ao registrar venda");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background/95 backdrop-blur sticky top-0 z-10">
        <button onClick={onBack} className="cursor-pointer text-muted-foreground hover:text-foreground">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-foreground">Caixa</h1>
          <p className="text-xs text-muted-foreground">
            {pedidos === undefined
              ? "Carregando..."
              : `${pedidos.length} pedido${pedidos.length !== 1 ? "s" : ""} aguardando pagamento`}
          </p>
        </div>
      </header>

      {/* Resumo do dia */}
      <div className="flex gap-3 px-4 py-3 border-b border-border shrink-0">
        <div className="flex-1 bg-muted/40 rounded-xl px-3 py-2.5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Vendas hoje</p>
          <p className="text-lg font-bold text-foreground">{qtdVendas}</p>
        </div>
        <div className="flex-1 bg-[var(--brand-orange)]/10 rounded-xl px-3 py-2.5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5 flex items-center gap-1">
            <TrendingUp size={9} /> Total
          </p>
          <p className="text-lg font-bold text-[var(--brand-orange)]">{formatBRL(totalDia)}</p>
        </div>
      </div>

      {/* Fila de pedidos */}
      <div className="flex-1 overflow-y-auto p-4">
        {pedidos === undefined ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-36 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : pedidos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
            <Banknote size={36} className="text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">Nenhum pedido aguardando pagamento</p>
            <p className="text-xs text-muted-foreground/60">
              Pedidos marcados como entregues aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {pedidos.map((p, i) => (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.03, ease: "easeOut" as const }}
              >
                <FilaPedidoCard
                  numero={p.numero}
                  modalidade={p.modalidadeAtendimento}
                  canalOrigem={p.canalOrigem}
                  dataAbertura={p.dataAbertura}
                  totalBruto={p.totalBruto}
                  onClick={() =>
                    setPedidoSelecionado({ id: p._id, numero: p.numero, totalBruto: p.totalBruto })
                  }
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de fechamento */}
      {pedidoSelecionado && (
        <ModalFecharVenda
          numero={pedidoSelecionado.numero}
          totalBruto={pedidoSelecionado.totalBruto}
          onConfirm={handleFechar}
          onClose={() => setPedidoSelecionado(null)}
          loading={loading}
        />
      )}
    </div>
  );
}
