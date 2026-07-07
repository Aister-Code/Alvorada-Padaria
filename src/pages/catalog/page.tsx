import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SearchIcon, ShoppingCartIcon, XIcon, ChevronRightIcon, StarIcon } from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import type { Id } from "@/convex/_generated/dataModel.d.ts";
import ProductSheet from "./_components/ProductSheet.tsx";
import type { Product } from "./_components/ProductSheet.tsx";

type CategoryDoc = {
  _id: Id<"categories">;
  icon: string;
  name: string;
};

export default function CatalogPage() {
  const categories = useQuery(api.catalog.categories.list, {}) as CategoryDoc[] | undefined;
  const seedCategories = useMutation(api.catalog.categories.seed);
  const seedProducts = useMutation(api.catalog.products.seed);
  const [activeCategoryId, setActiveCategoryId] = useState<Id<"categories"> | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [seeded, setSeeded] = useState(false);

  // Seed data on first load
  useEffect(() => {
    if (seeded) return;
    const run = async () => {
      const ids = await seedCategories();
      if (ids) {
        await seedProducts({ categoryIds: ids as Record<string, Id<"categories">> });
      }
      setSeeded(true);
    };
    run().catch(console.error);
  }, [seedCategories, seedProducts, seeded]);

  // Set first category active once loaded
  useEffect(() => {
    if (categories && categories.length > 0 && !activeCategoryId) {
      setActiveCategoryId(categories[0]._id);
    }
  }, [categories, activeCategoryId]);

  const isSearching = searchTerm.trim().length > 0;

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-primary px-4 pt-10 pb-3 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-extrabold text-primary-foreground leading-tight">
              🏠 Sabor da Casa
            </h1>
            <p className="text-primary-foreground/70 text-xs">Padaria • Lanchonete • Pizzaria</p>
          </div>
          <button
            className="relative p-2 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors cursor-pointer"
            onClick={() => {}}
          >
            <ShoppingCartIcon className="w-5 h-5 text-primary-foreground" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-card border-0 rounded-xl text-sm shadow-inner focus-visible:ring-primary/30"
          />
          {searchTerm && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
              onClick={() => setSearchTerm("")}
            >
              <XIcon className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </header>

      {/* Category tabs */}
      {!isSearching && (
        <nav className="sticky top-[114px] z-20 bg-card border-b border-border shadow-sm overflow-x-auto flex gap-1 px-3 py-2 scrollbar-hide">
          {!categories
            ? Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-24 rounded-full shrink-0" />
              ))
            : categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => setActiveCategoryId(cat._id)}
                  className={`cursor-pointer shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                    activeCategoryId === cat._id
                      ? "bg-primary text-primary-foreground shadow"
                      : "bg-secondary text-secondary-foreground hover:bg-accent"
                  }`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
        </nav>
      )}

      {/* Content */}
      <main className="flex-1 px-3 py-4 pb-24">
        {isSearching ? (
          <SearchResults term={searchTerm} onSelect={setSelectedProduct} />
        ) : activeCategoryId ? (
          <CategoryProducts categoryId={activeCategoryId} onSelect={setSelectedProduct} />
        ) : null}
      </main>

      {/* Product Sheet */}
      <ProductSheet
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}

// --- Search results ---
function SearchResults({
  term,
  onSelect,
}: {
  term: string;
  onSelect: (p: Product) => void;
}) {
  const results = useQuery(api.catalog.products.search, { term }) as ProductDoc[] | undefined;

  if (!results)
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );

  if (results.length === 0)
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <SearchIcon className="w-12 h-12 mb-3 opacity-30" />
        <p className="font-semibold">Nenhum produto encontrado</p>
        <p className="text-sm">Tente outro nome ou categoria</p>
      </div>
    );

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground px-1">
        {results.length} resultado{results.length !== 1 ? "s" : ""} para &quot;{term}&quot;
      </p>
      {results.map((product) => (
        <ProductCard key={product._id} product={product} onSelect={onSelect} />
      ))}
    </div>
  );
}

// --- Category Products ---
function CategoryProducts({
  categoryId,
  onSelect,
}: {
  categoryId: Id<"categories">;
  onSelect: (p: Product) => void;
}) {
  const products = useQuery(api.catalog.products.listByCategory, { categoryId }) as ProductDoc[] | undefined;

  if (!products)
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );

  if (products.length === 0)
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p className="font-semibold">Nenhum produto nesta categoria</p>
      </div>
    );

  const featured = products.filter((p) => p.featured);
  const rest = products.filter((p) => !p.featured);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={categoryId}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        className="space-y-4"
      >
        {featured.length > 0 && (
          <section>
            <div className="flex items-center gap-1.5 mb-2 px-1">
              <StarIcon className="w-4 h-4 text-yellow-500 fill-yellow-400" />
              <span className="text-xs font-bold text-foreground uppercase tracking-wide">Destaques</span>
            </div>
            <div className="space-y-3">
              {featured.map((p) => (
                <ProductCard key={p._id} product={p} onSelect={onSelect} featured />
              ))}
            </div>
          </section>
        )}

        {rest.length > 0 && (
          <section>
            {featured.length > 0 && (
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2 px-1">
                Todos os itens
              </p>
            )}
            <div className="space-y-3">
              {rest.map((p) => (
                <ProductCard key={p._id} product={p} onSelect={onSelect} />
              ))}
            </div>
          </section>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// --- Product Card ---
type ProductDoc = {
  _id: Id<"products">;
  _creationTime: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  active: boolean;
  featured: boolean;
  categoryId: Id<"categories">;
  hasSizes?: boolean;
  sizes?: Array<{ label: string; extraPrice: number }>;
};

function ProductCard({
  product,
  onSelect,
  featured = false,
}: {
  product: ProductDoc;
  onSelect: (p: Product) => void;
  featured?: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(product)}
      className={`cursor-pointer w-full flex items-center gap-3 bg-card rounded-2xl p-3 shadow-sm border border-border hover:shadow-md transition-shadow text-left ${
        featured ? "border-primary/20 bg-gradient-to-r from-card to-primary/5" : ""
      }`}
    >
      {/* Image */}
      <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-muted">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">🍽️</div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-foreground truncate">{product.name}</p>
        {product.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
            {product.description}
          </p>
        )}
        <p className="mt-1.5 text-primary font-extrabold text-sm">
          {product.hasSizes && product.sizes
            ? `A partir de R$ ${product.price.toFixed(2).replace(".", ",")}`
            : `R$ ${product.price.toFixed(2).replace(".", ",")}`}
        </p>
      </div>

      <ChevronRightIcon className="w-4 h-4 text-muted-foreground shrink-0" />
    </motion.button>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="flex items-center gap-3 bg-card rounded-2xl p-3">
      <Skeleton className="w-20 h-20 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}
