import { motion, AnimatePresence } from "motion/react";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils.ts";
import type { Id } from "@/convex/_generated/dataModel.d.ts";

export type CartItem = {
  itemId: Id<"itensPedido">;
  produtoId: Id<"products">;
  nome: string;
  preco: number;
  categoria: string;
  quantidade: number;
  subtotal: number;
  observacaoItem?: string;
};

type Props = {
  items: CartItem[];
  onIncrement: (itemId: Id<"itensPedido">, quantidade: number) => void;
  onDecrement: (itemId: Id<"itensPedido">, quantidade: number) => void;
  onRemove: (itemId: Id<"itensPedido">) => void;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
  numero: string | null;
  totalLiquido: number;
};

function formatBRL(val: number) {
  return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function Carrinho({
  items, onIncrement, onDecrement, onRemove, onConfirm, onCancel, loading, numero, totalLiquido,
}: Props) {
  return (
    <div className={cn("flex flex-col h-full")}>
      {/* Cabeçalho */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <ShoppingBag size={18} className="text-[var(--brand-orange)]" />
        <span className="font-semibold text-sm text-foreground">
          Carrinho {numero ? <span className="text-muted-foreground font-normal">#{numero}</span> : ""}
        </span>
        <span className="ml-auto text-xs text-muted-foreground">
          {items.length} {items.length === 1 ? "item" : "itens"}
        </span>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence initial={false}>
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm gap-2">
              <ShoppingBag size={28} className="opacity-30" />
              <span>Nenhum item adicionado</span>
            </div>
          ) : (
            items.map((item) => (
              <motion.div
                key={item.itemId}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-start gap-3 px-4 py-3 border-b border-border/50"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.nome}</p>
                  <p className="text-xs text-muted-foreground">{formatBRL(item.preco)} × {item.quantidade}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onDecrement(item.itemId, item.quantidade)}
                    className="w-6 h-6 rounded-full border border-border flex items-center justify-center cursor-pointer hover:bg-muted"
                  >
                    <Minus size={11} />
                  </button>
                  <span className="text-sm font-semibold w-5 text-center">{item.quantidade}</span>
                  <button
                    onClick={() => onIncrement(item.itemId, item.quantidade)}
                    className="w-6 h-6 rounded-full border border-border flex items-center justify-center cursor-pointer hover:bg-muted"
                  >
                    <Plus size={11} />
                  </button>
                  <button
                    onClick={() => onRemove(item.itemId)}
                    className="ml-1 text-destructive cursor-pointer hover:opacity-70"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="w-16 text-right text-sm font-semibold text-foreground shrink-0">
                  {formatBRL(item.subtotal)}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Rodapé */}
      <div className="border-t border-border p-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total</span>
          <span className="font-bold text-lg text-foreground">{formatBRL(totalLiquido)}</span>
        </div>
        <Button
          className="w-full bg-[var(--brand-orange)] hover:bg-[var(--brand-orange)]/90 text-white cursor-pointer"
          onClick={onConfirm}
          disabled={items.length === 0 || loading}
        >
          {loading ? "Processando..." : "Confirmar Pedido"}
        </Button>
        <Button
          variant="ghost"
          className="w-full text-destructive hover:text-destructive cursor-pointer"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar Atendimento
        </Button>
      </div>
    </div>
  );
}
