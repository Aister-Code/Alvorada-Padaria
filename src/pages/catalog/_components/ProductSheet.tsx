import { AnimatePresence, motion } from "motion/react";
import { HelpCircleIcon, MinusIcon, PlusIcon, ShoppingCartIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import type { Id } from "@/convex/_generated/dataModel.d.ts";

export type Product = {
  _id: Id<"products">;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  hasSizes?: boolean;
  sizes?: Array<{ label: string; extraPrice: number }>;
};

type Props = {
  product: Product | null;
  onAdd?: (product: Product) => void;
  onClose: () => void;
};

const formatSheetPrice = (value: number) => value.toFixed(2).replace(".", ",");

export default function ProductSheet({ product, onAdd, onClose }: Props) {
  const [qty, setQty] = useState(1);
  const [sizeIdx, setSizeIdx] = useState(0);

  const isOpen = product !== null;
  const sizeExtra = product?.hasSizes && product.sizes ? product.sizes[sizeIdx]?.extraPrice ?? 0 : 0;
  const unitPrice = (product?.price ?? 0) + sizeExtra;
  const total = unitPrice * qty;

  const handleOpen = () => {
    setQty(1);
    setSizeIdx(0);
  };

  return (
    <AnimatePresence onExitComplete={handleOpen}>
      {isOpen && product && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/45"
            onClick={onClose}
          />

          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-h-[86vh] max-w-md overflow-hidden rounded-t-3xl bg-card shadow-lg"
          >
            <div className="relative h-44 bg-muted">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[length:var(--catalog-text-sm)] font-semibold text-muted-foreground">
                  Produto
                </div>
              )}
              <button
                type="button"
                onClick={onClose}
                className="absolute right-3 top-3 rounded-full bg-black/40 p-1.5 text-white transition-colors hover:bg-black/60"
                aria-label="Fechar ficha do produto"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto px-4 pb-5 pt-3" data-rvl-scroll>
              <div>
                <h2 className="text-[length:var(--catalog-text-lg)] font-extrabold leading-6 text-foreground">{product.name}</h2>
                {product.description && <p className="mt-1 text-[length:var(--catalog-text-sm)] leading-snug text-muted-foreground">{product.description}</p>}
              </div>

              <div>
                <p className="text-[length:var(--catalog-text-xs)] font-bold uppercase tracking-wide text-muted-foreground">Preço base</p>
                <p className="mt-0.5 text-[length:var(--catalog-text-title)] font-extrabold text-foreground">{formatSheetPrice(product.price)}</p>
              </div>

              {product.hasSizes && product.sizes && product.sizes.length > 0 && (
                <div>
                  <p className="mb-2 text-[length:var(--catalog-text-xs)] font-bold uppercase tracking-wide text-muted-foreground">Tamanho</p>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSizeIdx(i)}
                        className={`rounded-xl border px-3 py-1.5 text-[length:var(--catalog-text-sm)] font-semibold transition-colors ${
                          sizeIdx === i
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-transparent bg-secondary text-secondary-foreground"
                        }`}
                      >
                        {s.label}
                        {s.extraPrice > 0 && <span className="ml-1 text-[length:var(--catalog-text-xs)] opacity-70">+{formatSheetPrice(s.extraPrice)}</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-[length:var(--catalog-text-xs)] font-bold uppercase tracking-wide text-muted-foreground">Observação</p>
                <textarea
                  className="min-h-10 w-full resize-none rounded-xl border-0 bg-secondary px-3 py-2 text-[length:var(--catalog-text-sm)] text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/25"
                  placeholder="Algum detalhe para este item?"
                  rows={2}
                />
              </div>

              <button
                type="button"
                className="flex h-9 w-full items-center justify-center gap-1.5 rounded-xl bg-secondary text-[length:var(--catalog-text-xs)] font-semibold text-secondary-foreground"
              >
                <HelpCircleIcon className="h-4 w-4 stroke-[1.8]" />
                Ajuda sobre este produto
              </button>

              <div className="flex items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2 rounded-xl bg-secondary px-2 py-1">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="rounded-lg p-1 transition-colors hover:bg-border"
                    aria-label="Diminuir quantidade"
                  >
                    <MinusIcon className="h-4 w-4 text-foreground" />
                  </button>
                  <span className="w-5 text-center text-[length:var(--catalog-text-title)] font-bold text-foreground">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty((q) => q + 1)}
                    className="rounded-lg p-1 transition-colors hover:bg-border"
                    aria-label="Aumentar quantidade"
                  >
                    <PlusIcon className="h-4 w-4 text-foreground" />
                  </button>
                </div>

                <Button
                  className="h-11 flex-1 gap-2 rounded-xl text-[length:var(--catalog-text-title)] font-bold"
                  onClick={() => {
                    onAdd?.(product);
                    onClose();
                  }}
                >
                  <ShoppingCartIcon className="h-4 w-4" />
                  Adicionar . {formatSheetPrice(total)}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
