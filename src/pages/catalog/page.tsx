import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronDownIcon,
  ClockIcon,
  CupSodaIcon,
  EllipsisVerticalIcon,
  FileTextIcon,
  GiftIcon,
  HelpCircleIcon,
  HamburgerIcon,
  MapPinIcon,
  MoonIcon,
  MoreVerticalIcon,
  PizzaIcon,
  PlusIcon,
  SearchIcon,
  Share2Icon,
  SparklesIcon,
  SoupIcon,
  StarIcon,
  StoreIcon,
  SunIcon,
  TrophyIcon,
  UtensilsCrossedIcon,
  WheatIcon,
  XIcon,
  type LucideIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import type { Id } from "@/convex/_generated/dataModel.d.ts";
import AlvoradaLogo from "@/components/branding/AlvoradaLogo.tsx";
import ProductSheet from "./_components/ProductSheet.tsx";
import type { Product } from "./_components/ProductSheet.tsx";

type CategoryDoc = {
  _id: Id<"categories">;
  icon: string;
  name: string;
};

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

type VisualCartItem = {
  product: Product;
  quantity: number;
};

type CatalogCategoryKey =
  | "highlights"
  | "lanches"
  | "pizzas"
  | "bebidas"
  | "padaria"
  | "porcoes"
  | "caldos"
  | "conveniencia";

type CatalogCategorySlot = {
  key: CatalogCategoryKey;
  label: string;
  aliases: string[];
  icon: LucideIcon;
};

type HeaderSurface = "rail" | "customer" | "promotions" | "actions" | "benefits" | "loyalty" | "status" | "text" | "menu" | null;
type CatalogTextScale = "compact" | "normal" | "large";
type CatalogMenuContext = {
  route: string;
  customerIdentified: boolean;
  userRole?: string;
  permissions?: string[];
  capabilities?: string[];
};
type CatalogMenuItem = {
  label: string;
  icon: LucideIcon;
  surface?: Exclude<HeaderSurface, null>;
};

const headerJourneyItems: Array<{ key: Exclude<HeaderSurface, null>; label: string; shortLabel: string; icon: LucideIcon }> = [
  { key: "promotions", label: "Minhas promoções", shortLabel: "Promoções", icon: SparklesIcon },
  { key: "actions", label: "Minhas ações", shortLabel: "Ações", icon: StarIcon },
  { key: "benefits", label: "Cupons e benefícios", shortLabel: "Benefícios", icon: GiftIcon },
  { key: "loyalty", label: "Fidelidade", shortLabel: "Fidelidade", icon: TrophyIcon },
];

const STATUS_LABEL_COLLAPSE_MS = 7000;
const CATALOG_TEXT_SCALE_STORAGE_KEY = "alvorada_catalog_text_scale";
const catalogTextScaleOptions: Array<{ value: CatalogTextScale; label: string; name: string; factor: number }> = [
  { value: "compact", label: "aa", name: "compacto", factor: 0.9 },
  { value: "normal", label: "Aa", name: "padrão", factor: 1 },
  { value: "large", label: "AA", name: "ampliado", factor: 1.15 },
];
const isDevelopmentCatalogFallback = import.meta.env.DEV;

const isHeaderSurface = (value: string | null): value is Exclude<HeaderSurface, null> =>
  value === "rail" ||
  value === "customer" ||
  value === "promotions" ||
  value === "actions" ||
  value === "benefits" ||
  value === "loyalty" ||
  value === "status" ||
  value === "text" ||
  value === "menu";

const initialCustomerNameFromUrl = () => {
  if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("cliente") === "novo") return "";
  return "João";
};

const isCatalogTextScale = (value: string | null): value is CatalogTextScale =>
  value === "compact" || value === "normal" || value === "large";

const initialCatalogTextScale = (): CatalogTextScale => {
  if (typeof window === "undefined") return "normal";
  const fromUrl = new URLSearchParams(window.location.search).get("textScale");
  if (isCatalogTextScale(fromUrl)) return fromUrl;
  const stored = localStorage.getItem(CATALOG_TEXT_SCALE_STORAGE_KEY);
  return isCatalogTextScale(stored) ? stored : "normal";
};

const catalogTextScaleStyle = (scale: CatalogTextScale) => {
  const factor = catalogTextScaleOptions.find((option) => option.value === scale)?.factor ?? 1;

  return {
    "--catalog-text-scale": String(factor),
    "--catalog-text-micro": "calc(9.5px * var(--catalog-text-scale))",
    "--catalog-text-tiny": "calc(10px * var(--catalog-text-scale))",
    "--catalog-text-xs": "calc(11px * var(--catalog-text-scale))",
    "--catalog-text-sm": "calc(12px * var(--catalog-text-scale))",
    "--catalog-text-body": "calc(13.5px * var(--catalog-text-scale))",
    "--catalog-text-title": "calc(14px * var(--catalog-text-scale))",
    "--catalog-text-lg": "calc(18px * var(--catalog-text-scale))",
    "--catalog-leading-body": "calc(16px * var(--catalog-text-scale))",
    "--catalog-leading-sm": "calc(14px * var(--catalog-text-scale))",
  } as CSSProperties;
};

function getCatalogMenuItems({ customerIdentified }: CatalogMenuContext): CatalogMenuItem[] {
  void customerIdentified;

  return [
    { label: "Sobre", icon: StoreIcon },
    { label: "Como chegar", icon: MapPinIcon },
    { label: "Falar", icon: HelpCircleIcon },
    { label: "Compartilhar", icon: Share2Icon },
    { label: "Termos", icon: FileTextIcon },
  ];
}

const formatCatalogPrice = (value: number) => value.toFixed(2).replace(".", ",");

const normalizeText = (value: string | undefined) =>
  (value ?? "")
    .replace(/PÃ£/g, "Pã")
    .replace(/FrancÃªs/g, "Francês")
    .replace(/HambÃºrguer/g, "Hambúrguer")
    .replace(/SanduÃ­che/g, "Sanduíche")
    .replace(/PorÃ§Ã£o/g, "Porção")
    .replace(/Ãgua/g, "Água")
    .replace(/gÃ¡s/g, "gás")
    .replace(/CafÃ©/g, "Café")
    .replace(/GuaranÃ¡/g, "Guaraná")
    .replace(/MÃ©dia/g, "Média")
    .replace(/PreÃ§o/g, "Preço")
    .replace(/ObservaÃ§Ã£o/g, "Observação")
    .replace(/ConveniÃªncia/g, "Conveniência");

const normalizeKey = (value: string) =>
  normalizeText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const catalogCategorySlots: CatalogCategorySlot[] = [
  { key: "highlights", label: "Destaques", aliases: [], icon: StarIcon },
  { key: "lanches", label: "Lanches", aliases: ["lanches", "lanchonete", "hamburgueres artesanais", "lanches tradicionais"], icon: HamburgerIcon },
  { key: "pizzas", label: "Pizzas", aliases: ["pizzas", "pizzaria", "pizzas salgadas", "pizzas doces"], icon: PizzaIcon },
  { key: "bebidas", label: "Bebidas", aliases: ["bebidas", "sucos", "cervejas"], icon: CupSodaIcon },
  { key: "padaria", label: "Padaria", aliases: ["padaria"], icon: WheatIcon },
  { key: "porcoes", label: "Porções", aliases: ["porcoes", "porções"], icon: UtensilsCrossedIcon },
  { key: "caldos", label: "Caldos", aliases: ["caldos"], icon: SoupIcon },
  { key: "conveniencia", label: "Conveniência", aliases: ["conveniencia", "conveniência"], icon: StoreIcon },
];

const fallbackCategoryIds = {
  padaria: "fallback_padaria" as Id<"categories">,
  lanchonete: "fallback_lanchonete" as Id<"categories">,
  pizzaria: "fallback_pizzaria" as Id<"categories">,
  bebidas: "fallback_bebidas" as Id<"categories">,
  sobremesas: "fallback_sobremesas" as Id<"categories">,
};

const fallbackCategories: CategoryDoc[] = [
  { _id: fallbackCategoryIds.padaria, icon: "🍞", name: "Padaria" },
  { _id: fallbackCategoryIds.lanchonete, icon: "🍔", name: "Lanches" },
  { _id: fallbackCategoryIds.pizzaria, icon: "🍕", name: "Pizzas" },
  { _id: fallbackCategoryIds.bebidas, icon: "🥤", name: "Bebidas" },
  { _id: fallbackCategoryIds.sobremesas, icon: "🍰", name: "Sobremesas" },
];

const fallbackProducts: ProductDoc[] = [
  {
    _id: "fallback_pao_frances" as Id<"products">,
    _creationTime: 0,
    categoryId: fallbackCategoryIds.padaria,
    name: "Pão Francês",
    description: "Pão fresquinho assado na hora, crocante por fora e macio por dentro.",
    price: 0.75,
    imageUrl: "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=400&q=80",
    active: true,
    featured: true,
  },
  {
    _id: "fallback_croissant" as Id<"products">,
    _creationTime: 0,
    categoryId: fallbackCategoryIds.padaria,
    name: "Croissant de Presunto e Queijo",
    description: "Croissant folhado recheado com presunto e queijo derretido.",
    price: 7.5,
    imageUrl: "https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?w=400&q=80",
    active: true,
    featured: true,
  },
  {
    _id: "fallback_pao_queijo" as Id<"products">,
    _creationTime: 0,
    categoryId: fallbackCategoryIds.padaria,
    name: "Pão de Queijo",
    description: "Pão de queijo macio, quentinho e pronto para acompanhar o café.",
    price: 4,
    imageUrl: "https://images.unsplash.com/photo-1566698629409-787a68fc5724?w=400&q=80",
    active: true,
    featured: false,
  },
  {
    _id: "fallback_x_burguer" as Id<"products">,
    _creationTime: 0,
    categoryId: fallbackCategoryIds.lanchonete,
    name: "X-Burguer Artesanal",
    description: "Hambúrguer artesanal, queijo, salada e molho especial da casa.",
    price: 22,
    imageUrl: "https://images.unsplash.com/photo-1555341483-889579a375bd?w=400&q=80",
    active: true,
    featured: true,
  },
  {
    _id: "fallback_misto" as Id<"products">,
    _creationTime: 0,
    categoryId: fallbackCategoryIds.lanchonete,
    name: "Misto Quente",
    description: "Sanduíche de presunto e queijo grelhado na chapa.",
    price: 9,
    imageUrl: "https://images.unsplash.com/photo-1619708976768-50451a0b3c86?w=400&q=80",
    active: true,
    featured: false,
  },
  {
    _id: "fallback_pizza_calabresa" as Id<"products">,
    _creationTime: 0,
    categoryId: fallbackCategoryIds.pizzaria,
    name: "Pizza Calabresa",
    description: "Molho de tomate, mussarela, calabresa fatiada e cebola.",
    price: 45,
    imageUrl: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=400&q=80",
    active: true,
    featured: true,
    hasSizes: true,
    sizes: [
      { label: "Broto", extraPrice: 0 },
      { label: "Média", extraPrice: 10 },
      { label: "Grande", extraPrice: 20 },
    ],
  },
  {
    _id: "fallback_suco_laranja" as Id<"products">,
    _creationTime: 0,
    categoryId: fallbackCategoryIds.bebidas,
    name: "Suco Natural de Laranja",
    description: "Suco de laranja espremido na hora, 500ml.",
    price: 8,
    imageUrl: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&q=80",
    active: true,
    featured: true,
  },
  {
    _id: "fallback_cafe" as Id<"products">,
    _creationTime: 0,
    categoryId: fallbackCategoryIds.bebidas,
    name: "Café Expresso",
    description: "Café expresso encorpado, feito na hora.",
    price: 4.5,
    imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80",
    active: true,
    featured: false,
  },
  {
    _id: "fallback_bolo_chocolate" as Id<"products">,
    _creationTime: 0,
    categoryId: fallbackCategoryIds.sobremesas,
    name: "Bolo de Chocolate",
    description: "Fatia macia com cobertura de chocolate da casa.",
    price: 8.5,
    imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80",
    active: true,
    featured: true,
  },
];

export default function CatalogPage() {
  const { resolvedTheme, setTheme } = useTheme();
  const remoteCategories = useQuery(api.catalog.categories.list, {}) as CategoryDoc[] | undefined;
  const [activeCategoryId, setActiveCategoryId] = useState<Id<"categories"> | null>(null);
  const [activeCatalogKey, setActiveCatalogKey] = useState<CatalogCategoryKey>("highlights");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [useLocalCatalog, setUseLocalCatalog] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [activeHeaderSurface, setActiveHeaderSurface] = useState<HeaderSurface>(() => {
    if (typeof window === "undefined") return null;
    const surface = new URLSearchParams(window.location.search).get("surface");
    return isHeaderSurface(surface) ? surface : null;
  });
  const [customerName, setCustomerName] = useState(initialCustomerNameFromUrl);
  const [customerDraftName, setCustomerDraftName] = useState("");
  const [customerDiscardConfirmOpen, setCustomerDiscardConfirmOpen] = useState(false);
  const [textScale, setTextScale] = useState<CatalogTextScale>(initialCatalogTextScale);
  const [showTextScaleChoices, setShowTextScaleChoices] = useState(() => {
    if (typeof window === "undefined") return true;
    return new URLSearchParams(window.location.search).get("textScaleCompact") !== "1";
  });
  const [showStatusLabel, setShowStatusLabel] = useState(() => {
    if (typeof window === "undefined") return true;
    return new URLSearchParams(window.location.search).get("statusCompact") !== "1";
  });
  const [visualCart, setVisualCart] = useState<VisualCartItem[]>([]);
  const headerRef = useRef<HTMLElement | null>(null);
  const lastHeaderTriggerRef = useRef<HTMLButtonElement | null>(null);
  const shouldUseLocalCatalog = isDevelopmentCatalogFallback && (useLocalCatalog || remoteCategories?.length === 0);
  const categories = shouldUseLocalCatalog ? fallbackCategories : remoteCategories;
  const isDark = resolvedTheme === "dark";
  const isStoreOpen = true;
  const showGuideLines = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("guides") === "1";
  const customerDisplayName = customerName.trim();
  const customerDraftDirty = activeHeaderSurface === "customer" && !customerDisplayName && customerDraftName.trim().length > 0;
  const customerLeadText = customerDisplayName ? "Olá," : "Seja";
  const customerMainText = customerDisplayName ? `${customerDisplayName}!` : "Bem-vindo(a)!";
  const currentTextScaleOption = catalogTextScaleOptions.find((option) => option.value === textScale) ?? catalogTextScaleOptions[1];
  const visualCartQuantity = visualCart.reduce((total, item) => total + item.quantity, 0);
  const visualCartTotal = visualCart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  const closeHeaderSurface = (force = false) => {
    if (!force && customerDraftDirty) {
      setCustomerDiscardConfirmOpen(true);
      return;
    }
    setCustomerDiscardConfirmOpen(false);
    setActiveHeaderSurface(null);
    window.setTimeout(() => lastHeaderTriggerRef.current?.focus(), 0);
  };
  const toggleHeaderSurface = (surface: Exclude<HeaderSurface, null>, trigger: HTMLButtonElement) => {
    lastHeaderTriggerRef.current = trigger;
    if (customerDraftDirty && activeHeaderSurface !== surface) {
      setCustomerDiscardConfirmOpen(true);
      return;
    }
    setActiveHeaderSurface((current) => {
      if (current === surface) {
        if (customerDraftDirty) {
          setCustomerDiscardConfirmOpen(true);
          return current;
        }
        setCustomerDiscardConfirmOpen(false);
        window.setTimeout(() => lastHeaderTriggerRef.current?.focus(), 0);
        return null;
      }
      setCustomerDiscardConfirmOpen(false);
      return surface;
    });
  };
  const openHeaderSurface = (surface: Exclude<HeaderSurface, null>) => {
    if (customerDraftDirty && activeHeaderSurface !== surface) {
      setCustomerDiscardConfirmOpen(true);
      return;
    }
    setCustomerDiscardConfirmOpen(false);
    setActiveHeaderSurface(surface);
  };
  const openCustomerSurface = (trigger: HTMLButtonElement) => {
    lastHeaderTriggerRef.current = trigger;
    if (customerDraftDirty) {
      setCustomerDiscardConfirmOpen(true);
      return;
    }
    setCustomerDiscardConfirmOpen(false);
    setActiveHeaderSurface((current) => {
      return current === "customer" ? null : "customer";
    });
  };
  const handleTextScaleChange = (scale: CatalogTextScale, closeSurface = true) => {
    setTextScale(scale);
    if (closeSurface) closeHeaderSurface(true);
  };
  const handleAddVisualItem = (product: Product) => {
    setVisualCart((items) => {
      const current = items.find((item) => item.product._id === product._id);
      if (current) {
        return items.map((item) => (item.product._id === product._id ? { ...item, quantity: item.quantity + 1 } : item));
      }
      return [...items, { product, quantity: 1 }];
    });
  };

  useEffect(() => {
    if (remoteCategories !== undefined) {
      setUseLocalCatalog(false);
      return;
    }
    const timer = window.setTimeout(() => setUseLocalCatalog(true), 1200);
    return () => window.clearTimeout(timer);
  }, [remoteCategories]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const forcedTheme = new URLSearchParams(window.location.search).get("theme");
    if (forcedTheme === "dark" || forcedTheme === "light") {
      setTheme(forcedTheme);
    }
  }, [setTheme]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (new URLSearchParams(window.location.search).get("statusCompact") === "1") return;
    setShowStatusLabel(true);
    const timer = window.setTimeout(() => setShowStatusLabel(false), STATUS_LABEL_COLLAPSE_MS);
    return () => window.clearTimeout(timer);
  }, [isStoreOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(CATALOG_TEXT_SCALE_STORAGE_KEY, textScale);
  }, [textScale]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (new URLSearchParams(window.location.search).get("textScaleCompact") === "1") return;
    setShowTextScaleChoices(true);
    const timer = window.setTimeout(() => setShowTextScaleChoices(false), STATUS_LABEL_COLLAPSE_MS);
    return () => window.clearTimeout(timer);
  }, []);

  // Set first category active once loaded
  useEffect(() => {
    if (categories && categories.length > 0 && (!activeCategoryId || !categories.some((cat) => cat._id === activeCategoryId))) {
      setActiveCategoryId(categories[0]._id);
    }
  }, [categories, activeCategoryId]);

  useEffect(() => {
    if (!activeHeaderSurface) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) {
        closeHeaderSurface();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeHeaderSurface();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeHeaderSurface, customerDraftDirty]);

  const isSearching = searchTerm.trim().length > 0;
  const findCategoryId = (slot: CatalogCategorySlot) => {
    if (!categories || slot.key === "highlights") return null;
    return (
      categories.find((category) => {
        const current = normalizeKey(category.name);
        return slot.aliases.some((alias) => current === normalizeKey(alias) || current.includes(normalizeKey(alias)));
      })?._id ?? null
    );
  };
  const activeSlot = catalogCategorySlots.find((slot) => slot.key === activeCatalogKey) ?? catalogCategorySlots[0];
  const activeSlotCategoryId = findCategoryId(activeSlot);
  const visibleCategorySlots = categoriesExpanded ? catalogCategorySlots : catalogCategorySlots.slice(0, 4);
  const handleSelectSlot = (slot: CatalogCategorySlot) => {
    setActiveCatalogKey(slot.key);
    const categoryId = findCategoryId(slot);
    if (categoryId) setActiveCategoryId(categoryId);
  };

  return (
    <div
      className="scrollbar-hide relative mx-auto flex h-screen max-h-screen w-full max-w-md flex-col overflow-y-auto overflow-x-hidden bg-[#f7f7f4] text-[#171717] dark:bg-background dark:text-foreground"
      data-text-scale={textScale}
      style={catalogTextScaleStyle(textScale)}
    >
      {showGuideLines && (
        <div aria-hidden="true" className="pointer-events-none fixed inset-y-0 left-1/2 z-[90] w-full max-w-md -translate-x-1/2">
          <span className="absolute bottom-0 top-0 w-px scale-x-50 bg-cyan-500/85 dark:bg-cyan-300/85" style={{ left: "7.8px" }} />
          <span className="absolute bottom-0 top-0 w-px scale-x-50 bg-cyan-500/85 dark:bg-cyan-300/85" style={{ right: "7.8px" }} />
        </div>
      )}
      <header ref={headerRef} className="relative z-30 bg-[#f7f7f4] px-[7.8px] pb-2.5 pt-3.5 dark:border-b dark:border-border/30 dark:bg-background/96">
        <div className="grid h-10 grid-cols-[2rem_minmax(4.5rem,1fr)_auto_auto] items-center gap-1">
          <button
            type="button"
            onClick={(event) => toggleHeaderSurface("rail", event.currentTarget)}
            className="flex h-10 w-8 shrink-0 items-center justify-start focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
            aria-label="Abrir atalhos do cardápio"
            aria-expanded={activeHeaderSurface === "rail"}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-[9px] border border-[#d9d3c8]/80 bg-white/35 shadow-[0_1px_3px_rgba(36,32,22,0.07)] dark:border-white/12 dark:bg-white/[0.035] dark:shadow-none">
              <AlvoradaLogo variant="icon" size="lg" className="w-7" />
            </span>
          </button>

          {activeHeaderSurface === "rail" ? (
            <CatalogHeaderRail onOpen={openHeaderSurface} onClose={closeHeaderSurface} />
          ) : (
            <>
              <button
                type="button"
                onClick={(event) => openCustomerSurface(event.currentTarget)}
                className="flex h-10 min-w-0 flex-col items-start justify-center rounded-full px-1 text-left leading-none text-[#181818] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 dark:text-foreground"
                aria-label="Cliente atual"
                aria-expanded={activeHeaderSurface === "customer"}
              >
                <span className="text-[length:var(--catalog-text-micro)] font-medium leading-[10px] text-[#777268] dark:text-muted-foreground">{customerLeadText}</span>
                <span className="flex max-w-full items-center gap-0.5 text-[length:var(--catalog-text-body)] font-bold leading-[14px]">
                  <span className="truncate">{customerMainText}</span>
                  <ChevronDownIcon className="h-3 w-3 shrink-0 stroke-[2] text-[#f04a2a]/62" />
                </span>
              </button>

              <button
                type="button"
                onClick={(event) => toggleHeaderSurface("status", event.currentTarget)}
                className="flex h-10 shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full px-1 text-[length:var(--catalog-text-sm)] font-semibold leading-none text-emerald-600 transition-all duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/18 dark:text-emerald-300 min-[360px]:gap-1.5"
                aria-label={isStoreOpen ? "Loja aberta. Ver horários." : "Loja fechada. Ver horários."}
                aria-expanded={activeHeaderSurface === "status"}
              >
                <ClockIcon className="h-3.5 w-3.5 stroke-[1.9]" />
                <AnimatePresence initial={false}>
                  {showStatusLabel && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className={`overflow-hidden whitespace-nowrap ${showTextScaleChoices ? "max-[359px]:hidden" : ""}`}
                    >
                      {isStoreOpen ? "Aberta" : "Fechada"}
                    </motion.span>
                  )}
                </AnimatePresence>
                <ChevronDownIcon className="h-3 w-3 stroke-[1.7] text-emerald-600/58 dark:text-emerald-300/58" />
              </button>

              <div className="flex shrink-0 items-center justify-end gap-0.5">
                <AnimatePresence initial={false} mode="wait">
                  {showTextScaleChoices ? (
                    <motion.div
                      key="text-scale-options"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.16, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <TextScaleSelector value={textScale} onChange={(scale) => handleTextScaleChange(scale, false)} />
                    </motion.div>
                  ) : (
                    <motion.button
                      key="text-scale-trigger"
                      type="button"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 28 }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.16, ease: "easeOut" }}
                      onClick={(event) => toggleHeaderSurface("text", event.currentTarget)}
                      className="flex h-9 items-center justify-center overflow-hidden rounded-full text-[length:var(--catalog-text-sm)] font-bold leading-none text-[#101010]/70 transition-colors hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 dark:text-foreground/76 dark:hover:bg-white/8"
                      aria-label={`Tamanho do texto: ${currentTextScaleOption.name}. Alterar tamanho.`}
                      aria-expanded={activeHeaderSurface === "text"}
                    >
                      Aa
                    </motion.button>
                  )}
                </AnimatePresence>
                <button
                  type="button"
                  onClick={(event) => {
                    setTheme(isDark ? "light" : "dark");
                    event.currentTarget.blur();
                  }}
                  className="flex h-9 w-7 items-center justify-center rounded-full text-[#101010] transition-colors hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 dark:text-foreground/76 dark:hover:bg-white/8"
                  aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
                  title={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
                >
                  {isDark ? <SunIcon className="h-[17px] w-[17px] stroke-[1.8]" /> : <MoonIcon className="h-[17px] w-[17px] stroke-[1.8]" />}
                </button>
                <button
                  type="button"
                  onClick={(event) => toggleHeaderSurface("menu", event.currentTarget)}
                  className="flex h-9 w-7 items-center justify-center rounded-full text-[#101010] transition-colors hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 dark:text-foreground/76 dark:hover:bg-white/8"
                  aria-label="Menu do cardápio"
                  aria-expanded={activeHeaderSurface === "menu"}
                >
                  <EllipsisVerticalIcon className="h-[19px] w-[19px] stroke-[2.1]" />
                </button>
              </div>
            </>
          )}
        </div>

        <CatalogHeaderSurface
          surface={activeHeaderSurface}
          customerName={customerDisplayName}
          customerDraftName={customerDraftName}
          customerDiscardConfirmOpen={customerDiscardConfirmOpen}
          textScale={textScale}
          onOpen={openHeaderSurface}
          onClose={closeHeaderSurface}
          onCustomerDraftNameChange={setCustomerDraftName}
          onCustomerNameChange={(name) => {
            setCustomerName(name);
            setCustomerDraftName("");
            closeHeaderSurface(true);
          }}
          onSkipCustomerName={() => {
            setCustomerDraftName("");
            closeHeaderSurface(true);
          }}
          onDiscardCustomerDraft={() => {
            setCustomerDraftName("");
            closeHeaderSurface(true);
          }}
          onContinueCustomerDraft={() => setCustomerDiscardConfirmOpen(false)}
          onTextScaleChange={(scale) => handleTextScaleChange(scale)}
        />
      </header>

      <section className="border-b border-[#deded9] px-[7.8px] pb-2 pt-1 dark:border-border/35">
        <div className="relative">
          <SearchIcon className="absolute left-3.5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-[#8a9299]" />
          <Input
            placeholder="Buscar produto ou sabor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-11 rounded-[11px] border border-[#e1e2de] bg-white pl-10 pr-9 text-[length:var(--catalog-text-title)] font-medium text-[#202020] shadow-none placeholder:text-[#8e969d] focus-visible:ring-primary/20 dark:border-border/50 dark:bg-card dark:text-foreground"
          />
          {searchTerm && (
            <button
              type="button"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7e8790]"
              onClick={() => setSearchTerm("")}
              aria-label="Limpar busca"
            >
              <XIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </section>

      {!isSearching && (
      <nav className="border-b border-[#deded9] bg-[#f7f7f4] px-[7.8px] py-2.5 dark:border-border/30 dark:bg-background/96">
          {!categories
            ? (
              <div className="grid grid-cols-5 gap-1">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-xl" />)}
              </div>
            )
            : (
              <div className={categoriesExpanded ? "grid grid-cols-5 gap-x-1.5 gap-y-3" : "flex items-end justify-between gap-1"}>
                {visibleCategorySlots.map((slot, index) => (
                  <CategoryTab
                    key={slot.key}
                    slot={slot}
                    active={activeCatalogKey === slot.key}
                    onClick={() => handleSelectSlot(slot)}
                    spread={categoriesExpanded ? "center" : index === 0 ? "start" : "center"}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => setCategoriesExpanded((open) => !open)}
                  className={`relative flex h-12 w-8 min-w-0 flex-col items-center justify-center gap-0.5 text-[length:var(--catalog-text-tiny)] font-extrabold uppercase tracking-[0.01em] text-[#f04a2a] focus:outline-none before:absolute before:-left-2 before:top-1 before:h-10 before:w-px before:bg-[#deded9] dark:before:bg-border/35 ${
                    categoriesExpanded ? "" : "shrink-0 justify-self-end"
                  }`}
                  aria-expanded={categoriesExpanded}
                >
                  <MoreVerticalIcon className="h-4 w-4 stroke-[2.3]" />
                  <span>{categoriesExpanded ? "Menos" : "Mais"}</span>
                </button>
              </div>
            )}
        </nav>
      )}

      <main className="flex-1 px-[7.8px] py-4 pb-20">
        {isSearching ? (
          <SearchResults
            term={searchTerm}
            onSelect={setSelectedProduct}
            onAdd={handleAddVisualItem}
            fallbackProducts={shouldUseLocalCatalog ? fallbackProducts : undefined}
          />
        ) : activeCatalogKey === "highlights" ? (
          <FeaturedProducts
            onSelect={setSelectedProduct}
            onAdd={handleAddVisualItem}
            fallbackProducts={shouldUseLocalCatalog ? fallbackProducts : undefined}
          />
        ) : activeSlotCategoryId ? (
          <CategoryProducts
            categoryId={activeSlotCategoryId}
            onSelect={setSelectedProduct}
            onAdd={handleAddVisualItem}
            fallbackProducts={
              shouldUseLocalCatalog ? fallbackProducts.filter((product) => product.categoryId === activeSlotCategoryId) : undefined
            }
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-14 text-center text-[#74808a] dark:text-muted-foreground">
            <p className="text-[length:var(--catalog-text-title)] font-semibold">Nenhum produto nesta categoria</p>
          </div>
        )}
      </main>

      <button
        type="button"
        className="fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] right-[max(7.8px,calc((100vw-28rem)/2+7.8px))] z-40 flex h-11 w-11 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-emerald-600 shadow-[0_6px_16px_rgba(16,185,129,0.18)] transition-colors hover:bg-emerald-100 dark:border-emerald-400/20 dark:bg-emerald-400/12 dark:text-emerald-300"
        aria-label="Ajuda"
      >
        <HelpCircleIcon className="h-5 w-5 stroke-[2]" />
      </button>

      {visualCartQuantity > 0 && (
        <footer className="fixed bottom-[calc(env(safe-area-inset-bottom)+0.85rem)] left-1/2 z-30 w-full max-w-md -translate-x-1/2 pl-[7.8px] pr-[4.35rem]">
          <button
            type="button"
            className="ml-auto flex h-10 w-full max-w-[14rem] items-center justify-between gap-3 rounded-full border border-[#e2e1dc] bg-white/94 px-3 text-left text-[#24241f] shadow-[0_6px_18px_rgba(30,30,20,0.10)] backdrop-blur dark:border-border/40 dark:bg-card/94 dark:text-card-foreground"
          >
            <span className="min-w-0">
              <span className="block truncate text-[length:var(--catalog-text-sm)] font-semibold">
                {visualCartQuantity} item{visualCartQuantity > 1 ? "s" : ""}
              </span>
              <span className="block truncate text-[length:var(--catalog-text-tiny)] text-muted-foreground">
                {formatCatalogPrice(visualCartTotal)} no carrinho
              </span>
            </span>
            <span className="shrink-0 text-[length:var(--catalog-text-sm)] font-bold text-primary">Ver</span>
          </button>
        </footer>
      )}

      <ProductSheet
        product={selectedProduct}
        onAdd={handleAddVisualItem}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}

function CategoryTab({
  slot,
  active,
  onClick,
  spread = "center",
}: {
  slot: CatalogCategorySlot;
  active: boolean;
  onClick: () => void;
  spread?: "start" | "center";
}) {
  const Icon = slot.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex h-12 min-w-0 flex-col items-center justify-center gap-1 text-[length:var(--catalog-text-tiny)] font-semibold transition-colors focus:outline-none ${
        active ? "text-[#f04a2a]" : "text-[#242824] dark:text-foreground/76"
      } ${spread === "start" ? "shrink-0" : "shrink-0"}`}
    >
      <span className="flex h-5 items-center justify-center">
        <Icon className={`h-[17px] w-[17px] stroke-[1.8] ${active ? "text-[#f04a2a]" : "text-[#667078] dark:text-foreground/62"}`} />
      </span>
      <span className="max-w-full whitespace-nowrap leading-none">{slot.label}</span>
      {active && <span className="absolute bottom-0 h-0.5 w-9 rounded-full bg-[#f04a2a]" />}
    </button>
  );
}

function CatalogHeaderRail({
  onOpen,
  onClose,
}: {
  onOpen: (surface: Exclude<HeaderSurface, null>) => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      transition={{ duration: 0.16 }}
      className="col-span-3 flex min-w-0 items-center gap-1 overflow-x-auto rounded-full bg-black/[0.035] px-1 py-1 scrollbar-hide dark:bg-white/[0.055]"
      aria-label="Esteira do cardápio"
    >
      {headerJourneyItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onOpen(item.key)}
            className="flex h-8 shrink-0 items-center gap-1 rounded-full px-2 text-[length:var(--catalog-text-tiny)] font-semibold text-[#2f2d26] hover:bg-white/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 dark:text-foreground/82 dark:hover:bg-white/10"
          >
            <Icon className="h-3.5 w-3.5 stroke-[1.8] text-[#7a6b35] dark:text-[#d7c98a]" />
            <span>{item.shortLabel}</span>
          </button>
        );
      })}
      <button
        type="button"
        onClick={onClose}
        className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#6b6557] hover:bg-white/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 dark:text-foreground/70 dark:hover:bg-white/10"
        aria-label="Fechar esteira"
      >
        <XIcon className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}

function getHeaderSurfaceLayout(surface: Exclude<HeaderSurface, null>, customerIdentified = true) {
  if (surface === "menu") {
    return "right-[7.8px] w-[min(12rem,calc(100vw-15.6px))]";
  }

  if (surface === "status") {
    return "right-[4.5rem] w-[min(9.75rem,calc(100vw-15.6px))]";
  }

  if (surface === "text") {
    return "right-[2.65rem] w-[min(9.75rem,calc(100vw-15.6px))]";
  }

  if (surface === "customer") {
    return customerIdentified
      ? "left-1/2 w-[min(12rem,calc(100vw-15.6px))] -translate-x-1/2"
      : "left-1/2 w-[min(14rem,calc(100vw-15.6px))] -translate-x-1/2";
  }

  return "left-1/2 w-[min(12rem,calc(100vw-15.6px))] -translate-x-1/2";
}

function CatalogHeaderSurface({
  surface,
  customerName,
  customerDraftName,
  customerDiscardConfirmOpen,
  textScale,
  onOpen,
  onClose,
  onCustomerDraftNameChange,
  onCustomerNameChange,
  onSkipCustomerName,
  onDiscardCustomerDraft,
  onContinueCustomerDraft,
  onTextScaleChange,
}: {
  surface: HeaderSurface;
  customerName: string;
  customerDraftName: string;
  customerDiscardConfirmOpen: boolean;
  textScale: CatalogTextScale;
  onOpen: (surface: Exclude<HeaderSurface, null>) => void;
  onClose: (force?: boolean) => void;
  onCustomerDraftNameChange: (name: string) => void;
  onCustomerNameChange: (name: string) => void;
  onSkipCustomerName: () => void;
  onDiscardCustomerDraft: () => void;
  onContinueCustomerDraft: () => void;
  onTextScaleChange: (scale: CatalogTextScale) => void;
}) {
  if (!surface || surface === "rail") return null;

  const currentJourney = headerJourneyItems.find((item) => item.key === surface);
  const menuItems = getCatalogMenuItems({
    route: typeof window === "undefined" ? "/cardapio" : window.location.pathname,
    customerIdentified: Boolean(customerName),
  });

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={surface}
        initial={{ opacity: 0, y: -4, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -4, scale: 0.985 }}
        transition={{ duration: 0.16 }}
        className={`absolute top-[3.55rem] z-50 overflow-hidden rounded-[16px] border border-[#e5e1da] bg-[#fffdfa] text-[#27251f] shadow-[0_10px_24px_rgba(32,28,20,0.12)] backdrop-blur dark:border-border/50 dark:bg-[#171712] dark:text-[#f4eee4] ${getHeaderSurfaceLayout(surface, Boolean(customerName))}`}
        role="dialog"
        aria-label="Superfície do cabeçalho"
      >
        {surface === "customer" && (
          <CustomerPanel
            customerName={customerName}
            draftName={customerDraftName}
            discardConfirmOpen={customerDiscardConfirmOpen}
            onClose={onClose}
            onDraftNameChange={onCustomerDraftNameChange}
            onNameChange={onCustomerNameChange}
            onSkip={onSkipCustomerName}
            onDiscardDraft={onDiscardCustomerDraft}
            onContinueDraft={onContinueCustomerDraft}
          />
        )}

        {currentJourney && (
          <div className="p-2.5">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f3eadc] text-[#77652e] dark:bg-white/10">
                  <currentJourney.icon className="h-4 w-4 stroke-[1.9]" />
                </span>
                <div>
                  <p className="text-[length:var(--catalog-text-sm)] font-semibold leading-tight">{currentJourney.label}</p>
                </div>
              </div>
              <button type="button" onClick={() => onClose()} className="rounded-full p-1.5 text-[#7b776d] hover:bg-black/[0.04]" aria-label="Fechar painel">
                <XIcon className="h-4 w-4" />
              </button>
            </div>
            <CustomerParticipationArea focus={surface} compact />
          </div>
        )}

        {surface === "status" && (
          <div className="p-3">
            <PanelTitle title="Horários" onClose={onClose} />
            <p className="mt-3 text-[length:var(--catalog-text-sm)] font-semibold leading-relaxed text-[#6f6a5d] dark:text-muted-foreground">
              Em atualização.
            </p>
          </div>
        )}

        {surface === "text" && (
          <div className="p-2.5">
            <PanelTitle title="Texto" onClose={onClose} />
            <TextScaleSelector value={textScale} onChange={onTextScaleChange} surface />
          </div>
        )}

        {surface === "menu" && (
          <div className="grid gap-1 p-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => (item.surface ? onOpen(item.surface) : onClose())}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-[length:var(--catalog-text-xs)] font-semibold hover:bg-black/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 dark:hover:bg-white/8"
                >
                  <Icon className="h-4 w-4 stroke-[1.75] text-[#7a6b35]" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

function TextScaleSelector({
  value,
  onChange,
  surface = false,
}: {
  value: CatalogTextScale;
  onChange: (scale: CatalogTextScale) => void;
  surface?: boolean;
}) {
  return (
    <div className={`${surface ? "mt-2 justify-start" : "justify-center"} flex items-center gap-0.5`} role="group" aria-label="Escolher tamanho do texto">
      {catalogTextScaleOptions.map((option) => {
        const active = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`flex h-8 min-w-7 items-center justify-center rounded-full px-1.5 text-[length:var(--catalog-text-sm)] font-bold leading-none transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 ${
              active
                ? "bg-[#f04a2a] text-white shadow-[0_2px_5px_rgba(240,74,42,0.13)]"
                : "text-[#4f4a40]/70 hover:bg-black/5 dark:text-foreground/70 dark:hover:bg-white/8"
            }`}
            aria-label={`Texto ${option.name}`}
            aria-pressed={active}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function CustomerPanel({
  customerName,
  draftName,
  discardConfirmOpen,
  onClose,
  onDraftNameChange,
  onNameChange,
  onSkip,
  onDiscardDraft,
  onContinueDraft,
}: {
  customerName: string;
  draftName: string;
  discardConfirmOpen: boolean;
  onClose: (force?: boolean) => void;
  onDraftNameChange: (name: string) => void;
  onNameChange: (name: string) => void;
  onSkip: () => void;
  onDiscardDraft: () => void;
  onContinueDraft: () => void;
}) {
  if (!customerName) {
    return (
      <div className="p-3">
        <PanelTitle title="Que bom ter você aqui." onClose={() => onClose()} />
        <label className="mt-3 block text-[length:var(--catalog-text-sm)] font-semibold leading-tight text-[#6f6a5d] dark:text-muted-foreground" htmlFor="catalog-customer-name">
          Como podemos chamar você?
        </label>
        <input
          id="catalog-customer-name"
          value={draftName}
          onChange={(event) => onDraftNameChange(event.target.value)}
          className="mt-2 h-10 w-full rounded-[13px] border border-[#e1ded5] bg-white px-3 text-[length:var(--catalog-text-sm)] font-semibold text-[#28251f] outline-none focus:ring-2 focus:ring-primary/20 dark:border-border/50 dark:bg-white/8 dark:text-foreground"
          placeholder="Nome"
          autoFocus
        />
        <div className="mt-3 grid gap-2">
          <button
            type="button"
            onClick={() => {
              const cleanName = draftName.trim();
              if (!cleanName) return;
              onNameChange(cleanName);
            }}
            className="h-9 rounded-full bg-[#f04a2a] px-4 text-[length:var(--catalog-text-xs)] font-bold text-white"
          >
            Continuar
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="h-9 rounded-full bg-[#f2eadb] px-4 text-[length:var(--catalog-text-xs)] font-bold text-[#6b5f33] dark:bg-white/10 dark:text-foreground/80"
          >
            Agora não
          </button>
        </div>
        {discardConfirmOpen && (
          <div className="mt-3 rounded-[14px] border border-[#eadfc9] bg-[#fff7ed] p-2.5 dark:border-white/10 dark:bg-white/8">
            <p className="text-[length:var(--catalog-text-xs)] font-bold text-[#3a3326] dark:text-foreground">Descartar nome?</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onContinueDraft}
                className="h-8 rounded-full bg-[#eadfc9] px-2 text-[length:var(--catalog-text-xs)] font-bold text-[#6b5f33] dark:bg-white/10 dark:text-foreground/80"
              >
                Continuar
              </button>
              <button
                type="button"
                onClick={onDiscardDraft}
                className="h-8 rounded-full bg-[#f04a2a] px-2 text-[length:var(--catalog-text-xs)] font-bold text-white"
              >
                Descartar
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-2.5">
      <PanelTitle title="Participações" onClose={onClose} />
      <CustomerParticipationArea />
    </div>
  );
}

function PanelTitle({ title, subtitle, onClose }: { title: string; subtitle?: string; onClose: () => void }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-[length:var(--catalog-text-sm)] font-bold leading-tight">{title}</h2>
        {subtitle && <p className="mt-0.5 text-[length:var(--catalog-text-xs)] leading-snug text-[#7b776d] dark:text-muted-foreground">{subtitle}</p>}
      </div>
      <button type="button" onClick={onClose} className="rounded-full p-1.5 text-[#7b776d] hover:bg-black/[0.04]" aria-label="Fechar painel">
        <XIcon className="h-4 w-4" />
      </button>
    </div>
  );
}

function CustomerParticipationArea({
  focus,
  compact = false,
}: {
  focus?: HeaderSurface;
  compact?: boolean;
}) {
  const title =
    focus === "promotions"
      ? "Promoções"
      : focus === "actions"
        ? "Ações"
        : focus === "benefits"
          ? "Benefícios"
          : focus === "loyalty"
            ? "Fidelidade"
          : "Participações";
  const items = headerJourneyItems.map((item) => {
    const Icon = item.icon;

    return (
      <li key={item.key} className="flex h-8 items-center gap-2 rounded-xl px-1.5 text-[length:var(--catalog-text-xs)] font-bold">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f3eadc] text-[#6b5f33] dark:bg-white/10 dark:text-[#d7c98a]">
          <Icon className="h-3.5 w-3.5 stroke-[1.8]" />
        </span>
        <span>{item.shortLabel}</span>
      </li>
    );
  });

  return (
    <section className={`${compact ? "mt-1" : "mt-2"} ${compact ? "" : "border-t border-[#e6e0d5] pt-2 dark:border-white/10"}`}>
      {!compact && <p className="mb-1 text-[length:var(--catalog-text-xs)] font-bold">{title}</p>}
      <ul className="grid gap-0.5">{items}</ul>
      <p className="mt-2 text-[length:var(--catalog-text-xs)] leading-relaxed text-[#6f6a5d] dark:text-muted-foreground">Nenhuma no momento.</p>
    </section>
  );
}

function FeaturedProducts({
  onSelect,
  onAdd,
  fallbackProducts,
}: {
  onSelect: (p: Product) => void;
  onAdd: (p: Product) => void;
  fallbackProducts?: ProductDoc[];
}) {
  const remoteProducts = useQuery(api.catalog.list.listProducts, fallbackProducts ? "skip" : {}) as ProductDoc[] | undefined;
  const products = fallbackProducts ?? remoteProducts;

  if (!products) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const featured = products.filter((product) => product.featured);
  const visible = featured.length > 0 ? featured : products.slice(0, 4);

  if (visible.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center text-[#74808a] dark:text-muted-foreground">
        <p className="text-[length:var(--catalog-text-sm)] font-semibold">Nenhum produto disponível agora</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {visible.map((product, index) => (
        <ProductCard
          key={product._id}
          product={product}
          onSelect={onSelect}
          onAdd={onAdd}
          badgeVariant={index === 1 ? "promo" : index === 3 ? "today" : "always"}
        />
      ))}
    </div>
  );
}

// --- Search results ---
function SearchResults({
  term,
  onSelect,
  onAdd,
  fallbackProducts,
}: {
  term: string;
  onSelect: (p: Product) => void;
  onAdd: (p: Product) => void;
  fallbackProducts?: ProductDoc[];
}) {
  const remoteResults = useQuery(api.catalog.products.search, fallbackProducts ? "skip" : { term }) as ProductDoc[] | undefined;
  const results =
    fallbackProducts?.filter((product) => {
      const normalizedTerm = term.trim().toLowerCase();
      return (
        product.name.toLowerCase().includes(normalizedTerm) ||
        (product.description ?? "").toLowerCase().includes(normalizedTerm)
      );
    }) ?? remoteResults;

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
        <p className="text-[length:var(--catalog-text-sm)]">Tente outro nome ou categoria</p>
      </div>
    );

  return (
    <div className="space-y-3">
      <p className="px-1 text-[length:var(--catalog-text-xs)] text-muted-foreground">
        {results.length} resultado{results.length !== 1 ? "s" : ""} para &quot;{term}&quot;
      </p>
      {results.map((product, index) => (
        <ProductCard key={product._id} product={product} onSelect={onSelect} onAdd={onAdd} badgeVariant={index === 0 ? "today" : "always"} />
      ))}
    </div>
  );
}

// --- Category Products ---
function CategoryProducts({
  categoryId,
  onSelect,
  onAdd,
  fallbackProducts,
}: {
  categoryId: Id<"categories">;
  onSelect: (p: Product) => void;
  onAdd: (p: Product) => void;
  fallbackProducts?: ProductDoc[];
}) {
  const remoteProducts = useQuery(api.catalog.products.listByCategory, fallbackProducts ? "skip" : { categoryId }) as
    | ProductDoc[]
    | undefined;
  const products = fallbackProducts ?? remoteProducts;

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
        className="space-y-2.5"
      >
        {featured.length > 0 && (
          <section>
            <div className="mb-1.5 flex items-center gap-1.5 px-1">
              <StarIcon className="h-3.5 w-3.5 fill-yellow-400 text-yellow-500" />
              <span className="text-[length:var(--catalog-text-xs)] font-bold uppercase tracking-wide text-foreground">Destaques</span>
            </div>
            <div className="space-y-2">
              {featured.map((p, index) => (
                <ProductCard key={p._id} product={p} onSelect={onSelect} onAdd={onAdd} badgeVariant={index === 1 ? "promo" : "always"} />
              ))}
            </div>
          </section>
        )}

        {rest.length > 0 && (
          <section>
            {featured.length > 0 && (
              <p className="mb-1.5 px-1 text-[length:var(--catalog-text-xs)] font-bold uppercase tracking-wide text-muted-foreground">
                Todos os itens
              </p>
            )}
            <div className="space-y-2">
              {rest.map((p, index) => (
                <ProductCard key={p._id} product={p} onSelect={onSelect} onAdd={onAdd} badgeVariant={index === 0 ? "today" : "always"} />
              ))}
            </div>
          </section>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

function ProductCard({
  product,
  onSelect,
  onAdd,
  badgeVariant = "always",
}: {
  product: ProductDoc;
  onSelect: (p: Product) => void;
  onAdd: (p: Product) => void;
  badgeVariant?: "always" | "promo" | "today";
}) {
  const cleanName = normalizeText(product.name);
  const cleanDescription = normalizeText(product.description);
  const priceText = product.hasSizes && product.sizes ? `A partir de ${formatCatalogPrice(product.price)}` : formatCatalogPrice(product.price);
  const badgeConfig = {
    always: { label: "DE SEMPRE", dot: "bg-[#d45519]", text: "text-[#d45519]", bg: "bg-[#fff0e7]" },
    promo: { label: "PROMOÇÃO", dot: "bg-[#d83b7d]", text: "text-[#c63872]", bg: "bg-[#fdebf3]" },
    today: { label: "HOJE", dot: "bg-[#0fae79]", text: "text-[#138865]", bg: "bg-[#e8f8f0]" },
  }[badgeVariant];

  return (
    <motion.article
      whileTap={{ scale: 0.99 }}
      className="relative overflow-hidden rounded-[11px] border border-[#e2e2de] bg-white px-2.5 pb-2.5 pt-3.5 text-left shadow-[0_1px_2px_rgba(30,30,20,0.025)] transition-colors dark:border-border/40 dark:bg-card"
    >
      <span className={`absolute left-3 top-0 inline-flex -translate-y-1/2 items-center gap-1 rounded-full px-2 py-0.5 text-[length:var(--catalog-text-tiny)] font-extrabold tracking-[0.04em] ${badgeConfig.bg} ${badgeConfig.text}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${badgeConfig.dot}`} />
        {badgeConfig.label}
      </span>

      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onSelect(product)} className="flex w-0 min-w-0 flex-1 items-center gap-2 text-left">
          <ProductVisualImage product={product} />

          <div className="w-0 min-w-0 flex-1">
            <p className="line-clamp-2 text-[length:var(--catalog-text-body)] font-semibold leading-[var(--catalog-leading-body)] text-[#111827] dark:text-foreground">{cleanName}</p>
            {cleanDescription && (
              <p className="mt-0.5 line-clamp-2 text-[length:var(--catalog-text-xs)] font-normal leading-[var(--catalog-leading-sm)] text-[#5c6978] dark:text-muted-foreground">
                {cleanDescription}
              </p>
            )}
            <p className="mt-1 text-[length:var(--catalog-text-sm)] font-semibold leading-none text-[#f04a2a]">{priceText}</p>
          </div>
        </button>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onAdd(product);
          }}
          className="mr-1 flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[11px] bg-[#ff4a2a] text-white shadow-[0_2px_5px_rgba(240,74,42,0.13)] transition-colors hover:bg-[#ec3f22]"
          aria-label={`Adicionar ${cleanName}`}
        >
          <PlusIcon className="h-[18px] w-[18px] stroke-[2.05]" />
        </button>
      </div>
    </motion.article>
  );
}

function ProductVisualImage({ product }: { product: ProductDoc }) {
  const cleanName = normalizeText(product.name);

  if (product.imageUrl) {
    return (
      <div className="h-[66px] w-[66px] shrink-0 overflow-hidden rounded-[10px] bg-[#fde5d6] dark:bg-muted">
        <img
          src={product.imageUrl}
          alt={cleanName}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div className="flex h-[66px] w-[66px] shrink-0 items-center justify-center rounded-[10px] bg-[#fde5d6]">
      <div className="flex h-[46px] w-[46px] items-center justify-center rounded-[3px] bg-[#ffc9ae]">
        <span className="font-serif text-[25px] font-bold leading-none text-[#6a742b]">A</span>
      </div>
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-[11px] border border-[#e0e0dd] bg-white p-3 dark:border-border/40 dark:bg-card">
      <Skeleton className="h-[76px] w-[76px] shrink-0 rounded-[11px]" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}
