import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, DollarSign, CreditCard, Smartphone, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils.ts";

type Props = {
  numero: string;
  totalBruto: number;
  onConfirm: (args: {
    formaPagamento: string;
    desconto: number;
    troco?: number;
  }) => void;
  onClose: () => void;
  loading: boolean;
};

const FORMAS: { id: string; label: string; icon: React.ReactNode }[] = [
  { id: "dinheiro",       label: "Dinheiro",  icon: <DollarSign size={16} /> },
  { id: "pix",            label: "PIX",       icon: <Smartphone size={16} /> },
  { id: "cartao_debito",  label: "Débito",    icon: <CreditCard size={16} /> },
  { id: "cartao_credito", label: "Crédito",   icon: <CreditCard size={16} /> },
];

function formatBRL(val: number) {
  return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ModalFecharVenda({ numero, totalBruto, onConfirm, onClose, loading }: Props) {
  const [forma, setForma] = useState<string | null>(null);
  const [desconto, setDesconto] = useState("");
  const [valorRecebido, setValorRecebido] = useState("");

  const descontoNum = Math.max(0, parseFloat(desconto.replace(",", ".")) || 0);
  const totalFinal = Math.max(0, totalBruto - descontoNum);
  const valorRecebidoNum = parseFloat(valorRecebido.replace(",", ".")) || 0;
  const troco = forma === "dinheiro" && valorRecebidoNum > totalFinal
    ? valorRecebidoNum - totalFinal
    : undefined;

  const valorInsuficiente = forma === "dinheiro" && valorRecebidoNum > 0 && valorRecebidoNum < totalFinal;
  const canConfirm = forma !== null && !loading &&
    (forma !== "dinheiro" || valorRecebidoNum >= totalFinal);

  const handleConfirm = () => {
    if (!forma) return;
    onConfirm({ formaPagamento: forma, desconto: descontoNum, troco });
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full sm:max-w-sm bg-background rounded-t-2xl sm:rounded-2xl shadow-2xl p-5 space-y-4"
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: "spring", damping: 26, stiffness: 280 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">Fechar Venda</h2>
              <p className="text-xs text-muted-foreground">Pedido #{numero}</p>
            </div>
            <button onClick={onClose} className="cursor-pointer text-muted-foreground hover:text-foreground">
              <X size={18} />
            </button>
          </div>

          {/* Total */}
          <div className="bg-muted/40 rounded-xl px-4 py-3 text-center">
            <p className="text-xs text-muted-foreground mb-0.5">Total a cobrar</p>
            <p className="text-2xl font-bold text-foreground">{formatBRL(totalFinal)}</p>
            {descontoNum > 0 && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                Desconto: − {formatBRL(descontoNum)}
              </p>
            )}
          </div>

          {/* Desconto */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Desconto (R$) — opcional
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0,00"
              value={desconto}
              onChange={(e) => setDesconto(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-muted/30 focus:outline-none focus:ring-2 focus:ring-[var(--brand-orange)] text-foreground"
            />
          </div>

          {/* Forma de pagamento */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Forma de pagamento
            </p>
            <div className="grid grid-cols-2 gap-2">
              {FORMAS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setForma(f.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium cursor-pointer transition-all",
                    forma === f.id
                      ? "bg-[var(--brand-orange)] text-white border-[var(--brand-orange)]"
                      : "border-border text-foreground hover:border-[var(--brand-orange)]",
                  )}
                >
                  {f.icon}
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Valor recebido — apenas dinheiro */}
          {forma === "dinheiro" && (
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Valor recebido (R$)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                value={valorRecebido}
                onChange={(e) => setValorRecebido(e.target.value)}
                autoFocus
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-muted/30 focus:outline-none focus:ring-2 focus:ring-[var(--brand-orange)] text-foreground"
              />
              {troco !== undefined && troco > 0 && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
                  Troco: {formatBRL(troco)}
                </p>
              )}
              {valorInsuficiente && (
                <p className="text-xs text-destructive mt-1">
                  Insuficiente. Faltam {formatBRL(totalFinal - valorRecebidoNum)}.
                </p>
              )}
            </div>
          )}

          {/* Confirmar */}
          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
            disabled={!canConfirm}
            onClick={handleConfirm}
          >
            <CheckCircle size={15} className="mr-2" />
            {loading ? "Registrando..." : "Confirmar Pagamento"}
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
