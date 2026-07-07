import { motion, AnimatePresence } from "motion/react";
import { XIcon, PlusIcon, MinusIcon, ShoppingCartIcon } from "lucide-react";
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
  onClose: () => void;
};

export default function ProductSheet({ product, onClose }: Props) {
  const [qty, setQty] = useState(1);
  const [sizeIdx, setSizeIdx] = useState(0);

  const isOpen = product !== null;

  const sizeExtra = product?.hasSizes && product.sizes ? product.sizes[sizeIdx]?.extraPrice ?? 0 : 0;
  const unitPrice = (product?.price ?? 0) + sizeExtra;
  const total = unitPrice * qty;

  // reset when new product opens
  const handleOpen = () => {
    setQty(1);
    setSizeIdx(0);
  };

  return (
    <AnimatePresence onExitComplete={handleOpen}>
      {isOpen && product && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto bg-card rounded-t-3xl shadow-2xl overflow-hidden"
          >
            {/* Image */}
            <div className="relative h-52 bg-muted">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">🍽️</div>
              )}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 cursor-pointer bg-black/40 text-white rounded-full p-1.5 hover:bg-black/60 transition-colors"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="px-5 pt-4 pb-6 space-y-4">
              <div>
                <h2 className="text-xl font-extrabold text-foreground">{product.name}</h2>
                {product.description && (
                  <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
                )}
              </div>

              {/* Sizes */}
              {product.hasSizes && product.sizes && product.sizes.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
                    Tamanho
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => setSizeIdx(i)}
                        className={`cursor-pointer px-3 py-1.5 rounded-xl text-sm font-semibold border transition-all ${
                          sizeIdx === i
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-secondary text-secondary-foreground border-transparent"
                        }`}
                      >
                        {s.label}
                        {s.extraPrice > 0 && (
                          <span className="ml-1 text-xs opacity-70">
                            +R${s.extraPrice.toFixed(2).replace(".", ",")}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Qty + Add */}
              <div className="flex items-center justify-between gap-4 pt-2">
                {/* Quantity */}
                <div className="flex items-center gap-3 bg-secondary rounded-xl px-2 py-1">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="cursor-pointer p-1 rounded-lg hover:bg-border transition-colors"
                  >
                    <MinusIcon className="w-4 h-4 text-foreground" />
                  </button>
                  <span className="text-base font-bold text-foreground w-5 text-center">{qty}</span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="cursor-pointer p-1 rounded-lg hover:bg-border transition-colors"
                  >
                    <PlusIcon className="w-4 h-4 text-foreground" />
                  </button>
                </div>

                {/* Add to cart */}
                <Button
                  className="flex-1 rounded-xl font-bold text-base gap-2 h-11"
                  onClick={onClose}
                >
                  <ShoppingCartIcon className="w-4 h-4" />
                  Adicionar · R$ {total.toFixed(2).replace(".", ",")}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
