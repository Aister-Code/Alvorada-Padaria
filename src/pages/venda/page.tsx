import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { motion } from "motion/react";
import { ArrowLeft, Plus, Search, Bike } from "lucide-react";
import { toast } from "sonner";
import type { OperatorSession } from "@/App.tsx";
import type { Id } from "@/convex/_generated/dataModel.d.ts";
import NovoPedidoModal from "./_components/NovoPedidoModal.tsx";
import ModalDadosDelivery, { type DadosDelivery } from "./_components/ModalDadosDelivery.tsx";
import Carrinho, { type CartItem } from "./_components/Carrinho.tsx";
import { cn } from "@/lib/utils.ts";

type Props = {
  operator: OperatorSession;
  onBack: () => void;
};

function formatBRL(val: number) {
  return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

type PedidoDetalheItem = {
  _id: Id<"itensPedido">;
  produtoId: Id<"products">;
  nomeProdutoSnapshot: string;
  precoProdutoSnapshot: number;
  categoriaProdutoSnapshot: string;
  quantidade: number;
  subtotal: number;
  observacaoItem?: string;
};

type CatalogCategory = {
  _id: Id<"categories">;
  name: string;
};

type CatalogProduct = {
  _id: Id<"products">;
  name: string;
  price: number;
  categoryId: Id<"categories">;
  active: boolean;
  imageUrl?: string;
};

export default function VendaPage({ operator, onBack }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [loadingDelivery, setLoadingDelivery] = useState(false);
  const [pedidoAberto, setPedidoAberto] = useState<{
    pedidoId: Id<"pedidos">;
    numero: string;
    canalOrigem: string;
    modalidade: string;
  } | null>(null);
  const [busca, setBusca] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Resolve _id Convex do operador logado
  const operadorConvex = useQuery(api.venda.operadores.resolveOperatorConvexId, {
    operatorId: operator.operatorId,
  });

  // Catálogo
  const categories = useQuery(api.catalog.list.listCategories) as CatalogCategory[] | undefined;
  const products = useQuery(api.catalog.list.listProducts) as CatalogProduct[] | undefined;

  // Pedido em tempo real — fonte da verdade
  const pedidoDetalhe = useQuery(
    api.venda.pedidos.getPedidoDetalhe,
    pedidoAberto ? { pedidoId: pedidoAberto.pedidoId } : "skip",
  );

  // Mutations
  const criarPedido = useMutation(api.venda.pedidos.criarPedido);
  const adicionarItemMutation = useMutation(api.venda.pedidos.adicionarItem);
  const removerItemMutation = useMutation(api.venda.pedidos.removerItem);
  const atualizarQuantidadeMutation = useMutation(api.venda.pedidos.atualizarQuantidadeItem);
  const confirmarPedido = useMutation(api.venda.pedidos.confirmarPedido);
  const cancelarPedido = useMutation(api.venda.pedidos.cancelarPedido);
  const atualizarDadosDelivery = useMutation(api.venda.delivery.atualizarDadosDelivery);

  const unit = operator.units?.[0] ?? "alvorada-01";

  // Derivar CartItems a partir da query reativa (fonte da verdade = backend)
  const cartItems: CartItem[] = ((pedidoDetalhe?.itens ?? []) as PedidoDetalheItem[]).map((item) => ({
    itemId: item._id,
    produtoId: item.produtoId,
    nome: item.nomeProdutoSnapshot,
    preco: item.precoProdutoSnapshot,
    categoria: item.categoriaProdutoSnapshot,
    quantidade: item.quantidade,
    subtotal: item.subtotal,
    observacaoItem: item.observacaoItem,
  }));

  const totalLiquido = pedidoDetalhe?.pedido.totalLiquido ?? 0;

  // Filtrar produtos
  const produtosFiltrados = (products ?? []).filter((p) => {
    if (!p.active) return false;
    if (categoriaSelecionada && p.categoryId !== categoriaSelecionada) return false;
    if (busca.trim()) {
      return p.name.toLowerCase().includes(busca.toLowerCase());
    }
    return true;
  });

  // Iniciar novo atendimento
  const handleIniciarAtendimento = async (canal: string, modalidade: string, obs?: string) => {
    if (!operadorConvex) {
      toast.error("Operador não encontrado. Faça login novamente.");
      return;
    }
    setLoading(true);
    try {
      const result = await criarPedido({
        unit,
        canalOrigem: canal,
        modalidadeAtendimento: modalidade,
        operadorAberturaId: operadorConvex._id,
        observacoes: obs,
      });
      setPedidoAberto({
        pedidoId: result.pedidoId,
        numero: result.numero,
        canalOrigem: canal,
        modalidade,
      });
      setShowModal(false);
      toast.success(`Pedido #${result.numero} aberto`);
    } catch {
      toast.error("Erro ao abrir pedido");
    } finally {
      setLoading(false);
    }
  };

  // Adicionar item — persiste imediatamente no backend
  const handleAddProduto = async (produto: {
    _id: Id<"products">;
    name: string;
    price: number;
    categoryId: Id<"categories">;
  }) => {
    if (!pedidoAberto) {
      setShowModal(true);
      return;
    }
    if (!operadorConvex) return;

    // Se já existe item ativo para este produto, incrementa quantidade
    const itemExistente = cartItems.find((i) => i.produtoId === produto._id);
    if (itemExistente) {
      try {
        await atualizarQuantidadeMutation({
          itemId: itemExistente.itemId,
          operadorId: operadorConvex._id,
          novaQuantidade: itemExistente.quantidade + 1,
        });
      } catch {
        toast.error("Erro ao atualizar item");
      }
      return;
    }

    try {
      await adicionarItemMutation({
        pedidoId: pedidoAberto.pedidoId,
        operadorId: operadorConvex._id,
        produtoId: produto._id,
        quantidade: 1,
      });
    } catch {
      toast.error("Erro ao adicionar item");
    }
  };

  // Incrementar quantidade — mutation imediata
  const handleIncrement = async (itemId: Id<"itensPedido">, quantidadeAtual: number) => {
    if (!operadorConvex) return;
    try {
      await atualizarQuantidadeMutation({
        itemId,
        operadorId: operadorConvex._id,
        novaQuantidade: quantidadeAtual + 1,
      });
    } catch {
      toast.error("Erro ao atualizar quantidade");
    }
  };

  // Decrementar quantidade — se chegar a 1, remove o item
  const handleDecrement = async (itemId: Id<"itensPedido">, quantidadeAtual: number) => {
    if (!operadorConvex) return;
    try {
      if (quantidadeAtual <= 1) {
        await removerItemMutation({ itemId, operadorId: operadorConvex._id });
      } else {
        await atualizarQuantidadeMutation({
          itemId,
          operadorId: operadorConvex._id,
          novaQuantidade: quantidadeAtual - 1,
        });
      }
    } catch {
      toast.error("Erro ao atualizar quantidade");
    }
  };

  // Remover item — soft delete imediato no backend
  const handleRemove = async (itemId: Id<"itensPedido">) => {
    if (!operadorConvex) return;
    try {
      await removerItemMutation({ itemId, operadorId: operadorConvex._id });
    } catch {
      toast.error("Erro ao remover item");
    }
  };

  // Confirmar pedido — se delivery, exige dados antes de enviar
  const handleConfirmarPedido = async () => {
    if (!pedidoAberto || !operadorConvex) return;
    if (cartItems.length === 0) {
      toast.error("Adicione ao menos um item antes de confirmar");
      return;
    }
    // Delivery: verificar se tem cliente e endereço
    if (pedidoAberto.modalidade === "delivery") {
      const pedido = pedidoDetalhe?.pedido;
      const temCliente = pedido?.clienteNomeSnapshot && pedido?.clienteTelefoneSnapshot;
      const temEndereco = pedido?.enderecoEntrega?.logradouro;
      if (!temCliente || !temEndereco) {
        setShowDeliveryModal(true);
        return;
      }
    }
    await executarConfirmarPedido();
  };

  const executarConfirmarPedido = async () => {
    if (!pedidoAberto || !operadorConvex) return;
    setLoading(true);
    try {
      await confirmarPedido({
        pedidoId: pedidoAberto.pedidoId,
        operadorId: operadorConvex._id,
      });
      toast.success(`Pedido #${pedidoAberto.numero} enviado à produção!`);
      setPedidoAberto(null);
    } catch {
      toast.error("Erro ao confirmar pedido");
    } finally {
      setLoading(false);
    }
  };

  const handleSalvarDadosDelivery = async (dados: DadosDelivery) => {
    if (!pedidoAberto || !operadorConvex) return;
    setLoadingDelivery(true);
    try {
      await atualizarDadosDelivery({
        pedidoId: pedidoAberto.pedidoId,
        operadorId: operadorConvex._id,
        ...dados,
      });
      setShowDeliveryModal(false);
      toast.success("Dados do delivery salvos");
      // Após salvar, confirma o pedido
      await executarConfirmarPedido();
    } catch {
      toast.error("Erro ao salvar dados do delivery");
    } finally {
      setLoadingDelivery(false);
    }
  };

  // Cancelar pedido
  const handleCancelarPedido = async () => {
    if (!pedidoAberto || !operadorConvex) return;
    setLoading(true);
    try {
      await cancelarPedido({
        pedidoId: pedidoAberto.pedidoId,
        operadorId: operadorConvex._id,
        motivoCancelamento: "Cancelado pelo operador no atendimento",
      });
      setPedidoAberto(null);
      toast.success("Pedido cancelado");
    } catch {
      toast.error("Erro ao cancelar pedido");
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
        <div>
          <h1 className="text-base font-bold text-foreground">
            {pedidoAberto?.modalidade === "delivery" ? "Delivery" : "Venda Balcão"}
          </h1>
          {pedidoAberto && (
            <p className="text-xs text-muted-foreground">
              Pedido #{pedidoAberto.numero} · {pedidoAberto.canalOrigem} / {pedidoAberto.modalidade.replace("_", " ")}
            </p>
          )}
        </div>
        {pedidoAberto?.modalidade === "delivery" && (
          <button
            onClick={() => setShowDeliveryModal(true)}
            className="ml-2 flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400 border border-sky-200 dark:border-sky-700 cursor-pointer hover:bg-sky-200 dark:hover:bg-sky-800 transition-colors"
          >
            <Bike size={12} />
            Dados delivery
          </button>
        )}
        {!pedidoAberto && (
          <button
            onClick={() => setShowModal(true)}
            className="ml-auto flex items-center gap-1.5 bg-[var(--brand-orange)] text-white text-sm font-semibold px-3 py-1.5 rounded-lg cursor-pointer hover:opacity-90"
          >
            <Plus size={15} />
            Novo Atendimento
          </button>
        )}
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Catálogo */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Busca + categorias */}
          <div className="px-4 py-3 space-y-3 border-b border-border">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar produto..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-muted/30 focus:outline-none focus:ring-2 focus:ring-[var(--brand-orange)] text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setCategoriaSelecionada(null)}
                className={cn(
                  "shrink-0 text-xs px-3 py-1.5 rounded-full border font-medium cursor-pointer transition-all",
                  !categoriaSelecionada
                    ? "bg-[var(--brand-orange)] text-white border-[var(--brand-orange)]"
                    : "border-border text-muted-foreground hover:border-[var(--brand-orange)]",
                )}
              >
                Todos
              </button>
              {(categories ?? []).map((c) => (
                <button
                  key={c._id}
                  onClick={() => setCategoriaSelecionada(c._id)}
                  className={cn(
                    "shrink-0 text-xs px-3 py-1.5 rounded-full border font-medium cursor-pointer transition-all",
                    categoriaSelecionada === c._id
                      ? "bg-[var(--brand-orange)] text-white border-[var(--brand-orange)]"
                      : "border-border text-muted-foreground hover:border-[var(--brand-orange)]",
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Grade de produtos */}
          <div className="flex-1 overflow-y-auto p-4">
            {!pedidoAberto && (
              <div className="mb-4 bg-[var(--brand-orange)]/10 border border-[var(--brand-orange)]/30 rounded-lg px-4 py-3 text-sm text-[var(--brand-orange)] font-medium">
                Toque em "Novo Atendimento" para iniciar antes de adicionar itens.
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {produtosFiltrados.map((p) => (
                <motion.button
                  key={p._id}
                  onClick={() => { void handleAddProduto(p); }}
                  whileTap={{ scale: 0.97 }}
                  className={cn(
                    "flex flex-col bg-card border border-border rounded-xl p-3 text-left cursor-pointer hover:border-[var(--brand-orange)] hover:shadow-sm transition-all",
                    !pedidoAberto && "opacity-60",
                  )}
                >
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-24 object-cover rounded-lg mb-2"
                    />
                  ) : (
                    <div className="w-full h-24 bg-muted rounded-lg mb-2 flex items-center justify-center text-2xl">
                      🍽️
                    </div>
                  )}
                  <p className="text-sm font-semibold text-foreground leading-tight truncate">{p.name}</p>
                  <p className="text-xs text-[var(--brand-orange)] font-bold mt-1">{formatBRL(p.price)}</p>
                </motion.button>
              ))}
              {produtosFiltrados.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground text-sm">
                  Nenhum produto encontrado
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Carrinho lateral — desktop */}
        <div className="hidden lg:flex w-80 border-l border-border flex-col">
          <Carrinho
            items={cartItems}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
            onRemove={handleRemove}
            onConfirm={handleConfirmarPedido}
            onCancel={handleCancelarPedido}
            loading={loading}
            numero={pedidoAberto?.numero ?? null}
            totalLiquido={totalLiquido}
          />
        </div>
      </div>

      {/* Carrinho flutuante — mobile */}
      {cartItems.length > 0 && (
        <motion.div
          className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-2xl z-20 max-h-[60vh] flex flex-col"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
        >
          <Carrinho
            items={cartItems}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
            onRemove={handleRemove}
            onConfirm={handleConfirmarPedido}
            onCancel={handleCancelarPedido}
            loading={loading}
            numero={pedidoAberto?.numero ?? null}
            totalLiquido={totalLiquido}
          />
        </motion.div>
      )}

      {/* Modal de novo atendimento */}
      {showModal && (
        <NovoPedidoModal
          onConfirm={handleIniciarAtendimento}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Modal de dados delivery */}
      {showDeliveryModal && pedidoAberto && (
        <ModalDadosDelivery
          dadosIniciais={{
            clienteNomeSnapshot: pedidoDetalhe?.pedido.clienteNomeSnapshot,
            clienteTelefoneSnapshot: pedidoDetalhe?.pedido.clienteTelefoneSnapshot,
            enderecoEntrega: pedidoDetalhe?.pedido.enderecoEntrega,
          }}
          onConfirm={handleSalvarDadosDelivery}
          onClose={() => setShowDeliveryModal(false)}
          loading={loadingDelivery}
        />
      )}
    </div>
  );
}
