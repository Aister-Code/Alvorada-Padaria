import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type UIEvent,
} from "react";
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
  PizzaIcon,
  PlusIcon,
  SearchIcon,
  Share2Icon,
  ShoppingBagIcon,
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
import pizzaDoisSaboresImage from "@/assets/catalog/pizza-dois-sabores-realista.png";
import ProductSheet from "./_components/ProductSheet.tsx";
import PizzaBuilder from "./_components/PizzaBuilder.tsx";
import type {
  Product,
  ProductCustomization,
  ProductOption,
} from "./_components/ProductSheet.tsx";
import {
  getPizzaFlavorPrice,
  getPizzaKey,
  type PizzaFlavorChoice,
  type PizzaMode,
  type PizzaSize,
} from "./_components/pizzaBuilderUtils.ts";

type CategoryDoc = {
  _id: Id<"categories">;
  icon: string;
  name: string;
};

type ProductDoc = {
  _id: Id<"products">;
  _creationTime: number;
  documentKey?: string;
  name: string;
  description?: string;
  price?: number;
  basePrice?: number;
  priceFrom?: number;
  sellable?: boolean;
  hasOptions?: boolean;
  source?: "structured" | "legacy";
  options?: ProductOption[];
  imageUrl?: string;
  active: boolean;
  featured: boolean;
  categoryId: Id<"categories">;
  hasSizes?: boolean;
  sizes?: Array<{ label: string; extraPrice: number }>;
  legacySizes?: Array<{ label: string; extraPrice: number }>;
  fallbackConfiguration?: ProductCustomization;
};

type VisualCartItem = {
  product: Product;
  quantity: number;
};

type PizzaBuilderState = {
  mode: PizzaMode;
  initialFlavor: PizzaFlavorChoice | null;
  flavors: PizzaFlavorChoice[];
  fallbackConfiguration?: ProductCustomization | null;
};

type PizzaKind = "savory" | "sweet";
type PizzaFlavorWithKind = PizzaFlavorChoice & {
  pizzaKind: PizzaKind;
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

type CategoryTouchZone = {
  key: CatalogCategoryKey;
  left: number;
  width: number;
};

type SearchScopeKey = "all" | CatalogCategoryKey;

type HeaderSurface =
  | "rail"
  | "customer"
  | "promotions"
  | "actions"
  | "benefits"
  | "loyalty"
  | "status"
  | "text"
  | "menu"
  | null;
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

const headerJourneyItems: Array<{
  key: Exclude<HeaderSurface, null>;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
}> = [
  {
    key: "promotions",
    label: "Minhas promoções",
    shortLabel: "Promoções",
    icon: SparklesIcon,
  },
  {
    key: "actions",
    label: "Minhas ações",
    shortLabel: "Ações",
    icon: StarIcon,
  },
  {
    key: "benefits",
    label: "Cupons e benefícios",
    shortLabel: "Benefícios",
    icon: GiftIcon,
  },
  {
    key: "loyalty",
    label: "Fidelidade",
    shortLabel: "Fidelidade",
    icon: TrophyIcon,
  },
];

const STATUS_LABEL_COLLAPSE_MS = 7000;
const CATALOG_TEXT_SCALE_STORAGE_KEY = "alvorada_catalog_text_scale";
const catalogTextScaleOptions: Array<{
  value: CatalogTextScale;
  label: string;
  name: string;
  factor: number;
}> = [
  { value: "compact", label: "aa", name: "compacto", factor: 0.9 },
  { value: "normal", label: "Aa", name: "padrão", factor: 1 },
  { value: "large", label: "AA", name: "ampliado", factor: 1.15 },
];
const isDevelopmentCatalogFallback = import.meta.env.DEV;
const pizzaSectionTitleColorClass = {
  custom: "text-[#A65312] dark:text-[#f0b17b]",
  savory: "text-[#626A49] dark:text-[#c7ceb0]",
  sweet: "text-[#8A3F62] dark:text-[#e6a5c0]",
} as const;

const isHeaderSurface = (
  value: string | null,
): value is Exclude<HeaderSurface, null> =>
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
  if (
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("cliente") === "novo"
  )
    return "";
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
  const factor =
    catalogTextScaleOptions.find((option) => option.value === scale)?.factor ??
    1;

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

function getCatalogMenuItems({
  customerIdentified,
}: CatalogMenuContext): CatalogMenuItem[] {
  void customerIdentified;

  return [
    { label: "Sobre", icon: StoreIcon },
    { label: "Como chegar", icon: MapPinIcon },
    { label: "Falar", icon: HelpCircleIcon },
    { label: "Compartilhar", icon: Share2Icon },
    { label: "Termos", icon: FileTextIcon },
  ];
}

const formatCatalogPrice = (value: number) =>
  value.toFixed(2).replace(".", ",");
const formatCatalogItemCount = (quantity: number) =>
  `${quantity} ${quantity === 1 ? "item" : "itens"}`;
const getProductDisplayPrice = (
  product: Pick<ProductDoc, "price" | "basePrice" | "priceFrom">,
) => product.price ?? product.basePrice ?? product.priceFrom;

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

const isPizzaProduct = (product: ProductDoc | Product) => {
  const normalizedName = normalizeKey(product.name);
  return (
    Boolean(product.fallbackConfiguration?.pizzaConfiguration) ||
    Boolean(
      product.options?.some((option) => option.optionType === "pizza_tamanho"),
    ) ||
    normalizedName.includes("pizza") ||
    product.documentKey?.includes("PIZ") === true
  );
};

const getFallbackPizzaFlavors = (product: ProductDoc): PizzaFlavorChoice[] =>
  (product.fallbackConfiguration?.pizzaFlavors ?? []).map((flavor) => ({
    _id: flavor._id ?? product._id,
    documentKey: flavor.documentKey,
    name: flavor.name,
    description:
      flavor.documentKey === product.documentKey ? product.description : "",
    imageUrl: flavor.documentKey === product.documentKey ? product.imageUrl : "",
    options: flavor.options,
    price: product.price,
    basePrice: product.basePrice,
    priceFrom: product.priceFrom,
    fallbackConfiguration: product.fallbackConfiguration,
  }));

const buildPizzaFlavorChoices = (products: ProductDoc[]) => {
  const choices = new Map<string, PizzaFlavorChoice>();
  for (const product of products.filter(isPizzaProduct)) {
    choices.set(getPizzaKey(product), product);
    for (const flavor of getFallbackPizzaFlavors(product)) {
      choices.set(getPizzaKey(flavor), {
        ...choices.get(getPizzaKey(flavor)),
        ...flavor,
        imageUrl: choices.get(getPizzaKey(flavor))?.imageUrl || flavor.imageUrl,
        description:
          choices.get(getPizzaKey(flavor))?.description || flavor.description,
      });
    }
  }
  return Array.from(choices.values());
};

const getPizzaKind = (
  flavor: Pick<PizzaFlavorChoice, "name" | "description" | "documentKey">,
): PizzaKind => {
  const haystack = normalizeKey(
    [flavor.name, flavor.description, flavor.documentKey].filter(Boolean).join(
      " ",
    ),
  );
  const sweetHints = [
    "doce",
    "chocolate",
    "brigadeiro",
    "banana",
    "nutella",
    "morango",
    "prestigio",
    "romeu",
    "goiabada",
    "leite condensado",
  ];
  return sweetHints.some((hint) => haystack.includes(normalizeKey(hint)))
    ? "sweet"
    : "savory";
};

const withPizzaKind = (flavors: PizzaFlavorChoice[]): PizzaFlavorWithKind[] =>
  flavors.map((flavor) => ({
    ...flavor,
    pizzaKind: getPizzaKind(flavor),
  }));

const getTwoFlavorStartPrice = (
  flavors: PizzaFlavorWithKind[],
  size: PizzaSize,
) => {
  const prices = flavors
    .map((flavor) => getPizzaFlavorPrice(flavor, size))
    .filter(
      (price): price is number =>
        typeof price === "number" && Number.isFinite(price),
    );
  return prices.length > 0 ? Math.min(...prices) : undefined;
};

const catalogCategorySlots: CatalogCategorySlot[] = [
  { key: "highlights", label: "Destaques", aliases: [], icon: StarIcon },
  {
    key: "lanches",
    label: "Lanches",
    aliases: [
      "lanches",
      "lanchonete",
      "hamburgueres artesanais",
      "lanches tradicionais",
    ],
    icon: HamburgerIcon,
  },
  {
    key: "pizzas",
    label: "Pizzas",
    aliases: ["pizzas", "pizzaria", "pizzas salgadas", "pizzas doces"],
    icon: PizzaIcon,
  },
  {
    key: "bebidas",
    label: "Bebidas",
    aliases: ["bebidas", "sucos", "cervejas"],
    icon: CupSodaIcon,
  },
  { key: "padaria", label: "Padaria", aliases: ["padaria"], icon: WheatIcon },
  {
    key: "porcoes",
    label: "Porções",
    aliases: ["porcoes", "porções"],
    icon: UtensilsCrossedIcon,
  },
  { key: "caldos", label: "Caldos", aliases: ["caldos"], icon: SoupIcon },
  {
    key: "conveniencia",
    label: "Conveniência",
    aliases: ["conveniencia", "conveniência"],
    icon: StoreIcon,
  },
];

const primaryCategorySlots = catalogCategorySlots.slice(0, 5);
const secondaryCategorySlots = catalogCategorySlots.slice(5);

const findCategoryIdForSlot = (
  categories: CategoryDoc[] | undefined,
  slot: CatalogCategorySlot,
) => {
  if (!categories || slot.key === "highlights") return null;
  return (
    categories.find((category) => {
      const current = normalizeKey(category.name);
      return slot.aliases.some(
        (alias) =>
          current === normalizeKey(alias) ||
          current.includes(normalizeKey(alias)),
      );
    })?._id ?? null
  );
};

const getProductCategoryLabel = (
  product: Pick<ProductDoc, "categoryId" | "featured">,
  categories: CategoryDoc[] | undefined,
) => {
  const categoryName = categories?.find(
    (category) => category._id === product.categoryId,
  )?.name;
  return normalizeText(categoryName ?? (product.featured ? "Destaques" : "Itens"));
};

const getProductSearchText = (
  product: ProductDoc,
  categories: CategoryDoc[] | undefined,
) => {
  const optionText = product.options
    ?.map((option) =>
      [
        option.label,
        option.code,
        option.documentKey,
        option.metadata?.displayHint,
        option.metadata?.size,
      ]
        .filter(Boolean)
        .join(" "),
    )
    .join(" ");
  const pizzaFlavorText = product.fallbackConfiguration?.pizzaFlavors
    ?.map((flavor) =>
      [flavor.name, flavor.documentKey, flavor.options?.map((option) => option.label).join(" ")]
        .filter(Boolean)
        .join(" "),
    )
    .join(" ");
  const complementText = product.fallbackConfiguration?.complementGroups
    ?.map((group) =>
      [
        group.name,
        group.description,
        group.items.map((item) => [item.name, item.documentKey].filter(Boolean).join(" ")).join(" "),
      ]
        .filter(Boolean)
        .join(" "),
    )
    .join(" ");
  const upgradeText = product.fallbackConfiguration?.upgrades
    ?.map((upgrade) =>
      [upgrade.name, upgrade.description, upgrade.documentKey]
        .filter(Boolean)
        .join(" "),
    )
    .join(" ");

  return normalizeKey(
    [
      product.name,
      product.description,
      product.documentKey,
      getProductCategoryLabel(product, categories),
      optionText,
      pizzaFlavorText,
      complementText,
      upgradeText,
    ]
      .filter(Boolean)
      .join(" "),
  );
};
const CATALOG_CATEGORY_SECONDARY_ID = "catalog-category-secondary";
const CATALOG_SEARCH_AUTO_COLLAPSE_AFTER = 36;
const CATALOG_SEARCH_SURFACE_DELTA = 52;
const CATALOG_SEARCH_PRESS_HIGHLIGHT_MS = 600;

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
    description:
      "Pão fresquinho assado na hora, crocante por fora e macio por dentro.",
    price: 0.75,
    imageUrl:
      "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=400&q=80",
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
    imageUrl:
      "https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?w=400&q=80",
    active: true,
    featured: true,
  },
  {
    _id: "fallback_pao_queijo" as Id<"products">,
    _creationTime: 0,
    categoryId: fallbackCategoryIds.padaria,
    name: "Pão de Queijo",
    description:
      "Pão de queijo macio, quentinho e pronto para acompanhar o café.",
    price: 4,
    imageUrl:
      "https://images.unsplash.com/photo-1566698629409-787a68fc5724?w=400&q=80",
    active: true,
    featured: false,
  },
  {
    _id: "fallback_x_burguer" as Id<"products">,
    _creationTime: 0,
    categoryId: fallbackCategoryIds.lanchonete,
    documentKey: "FALLBACK:PRODUCT:X-BURGUER",
    name: "X-Burguer Artesanal",
    description:
      "Hambúrguer artesanal, queijo, salada e molho especial da casa.",
    price: 22,
    imageUrl:
      "https://images.unsplash.com/photo-1555341483-889579a375bd?w=400&q=80",
    active: true,
    featured: true,
    hasOptions: true,
    fallbackConfiguration: {
      complementGroups: [
        {
          documentKey: "FALLBACK:GROUP:PONTO",
          name: "Ponto do hamburguer",
          minSelections: 1,
          maxSelections: 1,
          required: true,
          items: [
            {
              documentKey: "FALLBACK:ITEM:PONTO-PADRAO",
              name: "Ao ponto",
              price: 0,
              priceStatus: "confirmado",
              sellable: true,
            },
            {
              documentKey: "FALLBACK:ITEM:PONTO-BEM",
              name: "Bem passado",
              price: 0,
              priceStatus: "confirmado",
              sellable: true,
            },
          ],
        },
        {
          documentKey: "FALLBACK:GROUP:ADICIONAIS",
          name: "Adicionais",
          minSelections: 0,
          maxSelections: 2,
          required: false,
          items: [
            {
              documentKey: "FALLBACK:ITEM:BACON",
              name: "Bacon",
              price: 6,
              priceStatus: "confirmado",
              sellable: true,
            },
            {
              documentKey: "FALLBACK:ITEM:MUCARELA",
              name: "Mucarela",
              price: 6,
              priceStatus: "confirmado",
              sellable: true,
            },
          ],
        },
      ],
      upgrades: [
        {
          documentKey: "FALLBACK:UPGRADE:BATATA-100G",
          name: "+100 g de batata",
          price: 5,
          priceStatus: "confirmado",
          operationalStatus: "ativo",
          sellable: true,
        },
      ],
    },
  },
  {
    _id: "fallback_misto" as Id<"products">,
    _creationTime: 0,
    categoryId: fallbackCategoryIds.lanchonete,
    name: "Misto Quente",
    description: "Sanduíche de presunto e queijo grelhado na chapa.",
    price: 9,
    imageUrl:
      "https://images.unsplash.com/photo-1619708976768-50451a0b3c86?w=400&q=80",
    active: true,
    featured: false,
  },
  {
    _id: "fallback_pizza_calabresa" as Id<"products">,
    _creationTime: 0,
    categoryId: fallbackCategoryIds.pizzaria,
    documentKey: "FALLBACK:PRODUCT:PIZZA-CALABRESA",
    name: "Pizza Calabresa",
    description: "Molho de tomate, mussarela, calabresa fatiada e cebola.",
    price: 45,
    imageUrl:
      "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=400&q=80",
    active: true,
    featured: true,
    hasSizes: true,
    sizes: [
      { label: "Broto", extraPrice: 0 },
      { label: "Média", extraPrice: 10 },
      { label: "Grande", extraPrice: 20 },
    ],
    fallbackConfiguration: {
      pizzaConfiguration: {
        allowedSizes: ["P", "M", "G"],
        maxFlavorsBySize: { P: 1, M: 2, G: 2 },
        secondFlavorAllowed: true,
        pricingPolicy: "media_arredondada_050",
      },
      pizzaFlavors: [
        {
          documentKey: "FALLBACK:PRODUCT:PIZZA-CALABRESA",
          name: "Pizza Calabresa",
          options: [
            {
              documentKey: "FALLBACK:OPTION:PIZZA-CALABRESA-P",
              code: "P",
              label: "P",
              optionType: "pizza_tamanho",
              price: 45,
              priceStatus: "confirmado",
              metadata: { size: "P" },
            },
            {
              documentKey: "FALLBACK:OPTION:PIZZA-CALABRESA-M",
              code: "M",
              label: "M",
              optionType: "pizza_tamanho",
              price: 55,
              priceStatus: "confirmado",
              metadata: { size: "M" },
            },
            {
              documentKey: "FALLBACK:OPTION:PIZZA-CALABRESA-G",
              code: "G",
              label: "G",
              optionType: "pizza_tamanho",
              price: 65,
              priceStatus: "confirmado",
              metadata: { size: "G" },
            },
          ],
        },
        {
          documentKey: "FALLBACK:PRODUCT:PIZZA-FRANGO",
          name: "Pizza Frango com Catupiry",
          options: [
            {
              documentKey: "FALLBACK:OPTION:PIZZA-FRANGO-P",
              code: "P",
              label: "P",
              optionType: "pizza_tamanho",
              price: 48,
              priceStatus: "confirmado",
              metadata: { size: "P" },
            },
            {
              documentKey: "FALLBACK:OPTION:PIZZA-FRANGO-M",
              code: "M",
              label: "M",
              optionType: "pizza_tamanho",
              price: 58,
              priceStatus: "confirmado",
              metadata: { size: "M" },
            },
            {
              documentKey: "FALLBACK:OPTION:PIZZA-FRANGO-G",
              code: "G",
              label: "G",
              optionType: "pizza_tamanho",
              price: 70,
              priceStatus: "confirmado",
              metadata: { size: "G" },
            },
          ],
        },
        {
          documentKey: "FALLBACK:PRODUCT:PIZZA-QUEIJOS",
          name: "Pizza Quatro Queijos",
          options: [
            {
              documentKey: "FALLBACK:OPTION:PIZZA-QUEIJOS-P",
              code: "P",
              label: "P",
              optionType: "pizza_tamanho",
              price: 50,
              priceStatus: "confirmado",
              metadata: { size: "P" },
            },
            {
              documentKey: "FALLBACK:OPTION:PIZZA-QUEIJOS-M",
              code: "M",
              label: "M",
              optionType: "pizza_tamanho",
              price: 60,
              priceStatus: "confirmado",
              metadata: { size: "M" },
            },
            {
              documentKey: "FALLBACK:OPTION:PIZZA-QUEIJOS-G",
              code: "G",
              label: "G",
              optionType: "pizza_tamanho",
              price: 72,
              priceStatus: "confirmado",
              metadata: { size: "G" },
            },
          ],
        },
      ],
    },
  },
  {
    _id: "fallback_suco_laranja" as Id<"products">,
    _creationTime: 0,
    categoryId: fallbackCategoryIds.bebidas,
    name: "Suco Natural de Laranja",
    description: "Suco de laranja espremido na hora, 500ml.",
    price: 8,
    imageUrl:
      "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&q=80",
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
    imageUrl:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80",
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
    imageUrl:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80",
    active: true,
    featured: true,
  },
];

export default function CatalogPage() {
  const { resolvedTheme, setTheme } = useTheme();
  const remoteCategories = useQuery(api.catalog.categories.list, {}) as
    CategoryDoc[] | undefined;
  const [activeCategoryId, setActiveCategoryId] =
    useState<Id<"categories"> | null>(null);
  const [activeCatalogKey, setActiveCatalogKey] =
    useState<CatalogCategoryKey>("highlights");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchScopeKey, setSearchScopeKey] =
    useState<SearchScopeKey>("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [pizzaBuilder, setPizzaBuilder] = useState<PizzaBuilderState | null>(
    null,
  );
  const [useLocalCatalog, setUseLocalCatalog] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [activeHeaderSurface, setActiveHeaderSurface] = useState<HeaderSurface>(
    () => {
      if (typeof window === "undefined") return null;
      const surface = new URLSearchParams(window.location.search).get(
        "surface",
      );
      return isHeaderSurface(surface) ? surface : null;
    },
  );
  const [customerName, setCustomerName] = useState(initialCustomerNameFromUrl);
  const [customerDraftName, setCustomerDraftName] = useState("");
  const [customerDiscardConfirmOpen, setCustomerDiscardConfirmOpen] =
    useState(false);
  const [textScale, setTextScale] = useState<CatalogTextScale>(
    initialCatalogTextScale,
  );
  const [showStatusLabel, setShowStatusLabel] = useState(() => {
    if (typeof window === "undefined") return true;
    return (
      new URLSearchParams(window.location.search).get("statusCompact") !== "1"
    );
  });
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [isSearchPressHighlighted, setIsSearchPressHighlighted] =
    useState(false);
  const [categoryTouchZones, setCategoryTouchZones] = useState<
    CategoryTouchZone[]
  >([]);
  const [visualCart, setVisualCart] = useState<VisualCartItem[]>([]);
  const headerRef = useRef<HTMLElement | null>(null);
  const pageScrollRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const searchHighlightTimerRef = useRef<number | null>(null);
  const lastCatalogScrollTopRef = useRef(0);
  const suppressSearchAutoCollapseUntilRef = useRef(0);
  const themeUrlAppliedRef = useRef(false);
  const preSearchCatalogKeyRef = useRef<CatalogCategoryKey | null>(null);
  const preSearchCategoryIdRef = useRef<Id<"categories"> | null>(null);
  const categoryNavRef = useRef<HTMLElement | null>(null);
  const categoryRailRef = useRef<HTMLDivElement | null>(null);
  const lastHeaderTriggerRef = useRef<HTMLButtonElement | null>(null);
  const shouldUseLocalCatalog =
    isDevelopmentCatalogFallback &&
    (useLocalCatalog || remoteCategories?.length === 0);
  const categories = shouldUseLocalCatalog
    ? fallbackCategories
    : remoteCategories;
  const isDark = resolvedTheme === "dark";
  const isStoreOpen = true;
  const showGuideLines =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("guides") === "1";
  const customerDisplayName = customerName.trim();
  const customerDraftDirty =
    activeHeaderSurface === "customer" &&
    !customerDisplayName &&
    customerDraftName.trim().length > 0;
  const customerLeadText = customerDisplayName ? "Olá," : "Seja";
  const customerMainText = customerDisplayName
    ? `${customerDisplayName}!`
    : "Bem-vindo(a)!";
  const currentTextScaleOption =
    catalogTextScaleOptions.find((option) => option.value === textScale) ??
    catalogTextScaleOptions[1];
  const visualCartQuantity = visualCart.reduce(
    (total, item) => total + item.quantity,
    0,
  );
  const visualCartTotal = visualCart.reduce(
    (total, item) => total + (item.product.price ?? 0) * item.quantity,
    0,
  );
  const closeHeaderSurface = (force = false) => {
    if (!force && customerDraftDirty) {
      setCustomerDiscardConfirmOpen(true);
      return;
    }
    setCustomerDiscardConfirmOpen(false);
    setActiveHeaderSurface(null);
    window.setTimeout(() => lastHeaderTriggerRef.current?.focus(), 0);
  };
  const toggleHeaderSurface = (
    surface: Exclude<HeaderSurface, null>,
    trigger: HTMLButtonElement,
  ) => {
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
  const handleTextScaleChange = (
    scale: CatalogTextScale,
    closeSurface = true,
  ) => {
    setTextScale(scale);
    if (closeSurface) closeHeaderSurface(true);
  };
  const handleAddVisualItem = (product: Product) => {
    if (typeof product.price !== "number") return;
    setVisualCart((items) => {
      const productKey = product.cartKey ?? product._id;
      const current = items.find(
        (item) => (item.product.cartKey ?? item.product._id) === productKey,
      );
      if (current) {
        return items.map((item) =>
          (item.product.cartKey ?? item.product._id) === productKey
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...items, { product, quantity: 1 }];
    });
  };
  const handleToggleCatalogTheme = () => {
    const nextTheme = isDark ? "light" : "dark";
    setTheme(nextTheme);
    if (typeof window === "undefined") return;
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("theme", nextTheme);
    window.history.replaceState(window.history.state, "", nextUrl);
  };
  const openPizzaBuilder = ({
    mode,
    initialFlavor,
    flavors,
    fallbackConfiguration,
  }: PizzaBuilderState) => {
    setSelectedProduct(null);
    setPizzaBuilder({
      mode,
      initialFlavor,
      flavors,
      fallbackConfiguration,
    });
  };
  const handleSelectProduct = (product: Product) => {
    if (isPizzaProduct(product)) {
      openPizzaBuilder({
        mode: "single",
        initialFlavor: product,
        flavors: buildPizzaFlavorChoices([product as ProductDoc]),
        fallbackConfiguration: product.fallbackConfiguration,
      });
      return;
    }
    setSelectedProduct(product);
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
    if (themeUrlAppliedRef.current) return;
    themeUrlAppliedRef.current = true;
    const forcedTheme = new URLSearchParams(window.location.search).get(
      "theme",
    );
    if (forcedTheme === "dark" || forcedTheme === "light") {
      setTheme(forcedTheme);
    }
  }, [setTheme]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (
      new URLSearchParams(window.location.search).get("statusCompact") === "1"
    )
      return;
    setShowStatusLabel(true);
    const timer = window.setTimeout(
      () => setShowStatusLabel(false),
      STATUS_LABEL_COLLAPSE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [isStoreOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(CATALOG_TEXT_SCALE_STORAGE_KEY, textScale);
  }, [textScale]);

  useEffect(() => {
    return () => {
      if (searchHighlightTimerRef.current) {
        window.clearTimeout(searchHighlightTimerRef.current);
      }
    };
  }, []);

  // Set first category active once loaded
  useEffect(() => {
    if (
      categories &&
      categories.length > 0 &&
      (!activeCategoryId ||
        !categories.some((cat) => cat._id === activeCategoryId))
    ) {
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
  const showFullSearch = searchExpanded || isSearching;

  useEffect(() => {
    if (!categoriesExpanded) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!categoryNavRef.current?.contains(event.target as Node)) {
        setCategoriesExpanded(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setCategoriesExpanded(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [categoriesExpanded]);

  useEffect(() => {
    const rail = categoryRailRef.current;
    if (!rail || !categories) {
      setCategoryTouchZones([]);
      return;
    }

    let frame = 0;
    const scheduleUpdate = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const railRect = rail.getBoundingClientRect();
        const visualRects = primaryCategorySlots
          .map((slot) => {
            const visual = rail.querySelector(
              `[data-category-visual="${slot.key}"]`,
            );
            if (!visual) return null;
            const rect = visual.getBoundingClientRect();
            return {
              key: slot.key,
              center: rect.left - railRect.left + rect.width / 2,
            };
          })
          .filter((zone): zone is { key: CatalogCategoryKey; center: number } =>
            Boolean(zone),
          );

        if (visualRects.length !== primaryCategorySlots.length) {
          setCategoryTouchZones([]);
          return;
        }

        const nextZones = visualRects.map((item, index) => {
          const left =
            index === 0
              ? 0
              : (visualRects[index - 1].center + item.center) / 2;
          const right =
            index === visualRects.length - 1
              ? railRect.width
              : (item.center + visualRects[index + 1].center) / 2;

          return {
            key: item.key,
            left: Math.max(0, left),
            width: Math.max(0, Math.min(railRect.width, right) - left),
          };
        });

        setCategoryTouchZones((current) => {
          const changed =
            current.length !== nextZones.length ||
            current.some(
              (zone, index) =>
                zone.key !== nextZones[index].key ||
                Math.abs(zone.left - nextZones[index].left) > 0.25 ||
                Math.abs(zone.width - nextZones[index].width) > 0.25,
            );
          return changed ? nextZones : current;
        });
      });
    };

    scheduleUpdate();
    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(rail);
    rail
      .querySelectorAll("[data-category-visual]")
      .forEach((visual) => observer.observe(visual));
    window.addEventListener("resize", scheduleUpdate);
    document.fonts?.ready.then(scheduleUpdate).catch(() => undefined);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [categories, showFullSearch, textScale]);

  useEffect(() => {
    const activeButton = categoryRailRef.current?.querySelector(
      `[data-category-touch-key="${activeCatalogKey}"]`,
    );
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    activeButton?.scrollIntoView({
      block: "nearest",
      inline: "center",
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, [activeCatalogKey, showFullSearch]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (categoriesExpanded) {
        setCategoriesExpanded(false);
        return;
      }
      if (searchExpanded && searchTerm.trim()) {
        clearSearchAndRestoreCategory();
        return;
      }
      if (searchExpanded) {
        setSearchExpanded(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [categoriesExpanded, searchExpanded, searchTerm]);

  const handleCatalogScroll = (event: UIEvent<HTMLDivElement>) => {
    const scrollTop = event.currentTarget.scrollTop;
    const previousScrollTop = lastCatalogScrollTopRef.current;
    lastCatalogScrollTopRef.current = scrollTop;
    const isDescending = scrollTop > previousScrollTop + 4;
    if (
      !searchExpanded ||
      searchTerm.trim().length > 0 ||
      scrollTop < CATALOG_SEARCH_AUTO_COLLAPSE_AFTER ||
      !isDescending ||
      Date.now() < suppressSearchAutoCollapseUntilRef.current
    ) {
      return;
    }

    const restoreScrollPosition = () => {
      if (pageScrollRef.current && scrollTop > 0) {
        pageScrollRef.current.scrollTop = Math.max(
          0,
          scrollTop - CATALOG_SEARCH_SURFACE_DELTA,
        );
      }
    };
    setSearchExpanded(false);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        restoreScrollPosition();
        window.setTimeout(restoreScrollPosition, 220);
      });
    });
  };

  const activateSearchPressHighlight = () => {
    setIsSearchPressHighlighted(true);
    if (searchHighlightTimerRef.current) {
      window.clearTimeout(searchHighlightTimerRef.current);
    }
    searchHighlightTimerRef.current = window.setTimeout(() => {
      setIsSearchPressHighlighted(false);
      searchHighlightTimerRef.current = null;
    }, CATALOG_SEARCH_PRESS_HIGHLIGHT_MS);
  };

  const restorePreSearchCategory = () => {
    if (preSearchCatalogKeyRef.current) {
      setActiveCatalogKey(preSearchCatalogKeyRef.current);
      if (preSearchCategoryIdRef.current) {
        setActiveCategoryId(preSearchCategoryIdRef.current);
      }
    }
    preSearchCatalogKeyRef.current = null;
    preSearchCategoryIdRef.current = null;
  };

  const handleSearchTermChange = (value: string) => {
    const hadSearch = searchTerm.trim().length > 0;
    const hasSearch = value.trim().length > 0;
    if (hasSearch && !hadSearch) {
      preSearchCatalogKeyRef.current = activeCatalogKey;
      preSearchCategoryIdRef.current = activeCategoryId;
      setSearchScopeKey("all");
    }
    if (!hasSearch) {
      setSearchScopeKey("all");
      if (hadSearch) {
        restorePreSearchCategory();
      }
    }
    setSearchTerm(value);
  };

  const clearSearchAndRestoreCategory = () => {
    setSearchTerm("");
    setSearchScopeKey("all");
    restorePreSearchCategory();
    setSearchExpanded(false);
  };

  const openSearchFromCompact = () => {
    const previousScrollTop = pageScrollRef.current?.scrollTop ?? 0;
    suppressSearchAutoCollapseUntilRef.current = Date.now() + 700;
    const restoreScrollPosition = () => {
      if (pageScrollRef.current && previousScrollTop > 0) {
        pageScrollRef.current.scrollTop = Math.max(
          pageScrollRef.current.scrollTop,
          previousScrollTop + CATALOG_SEARCH_SURFACE_DELTA,
        );
      }
    };
    setSearchExpanded(true);
    activateSearchPressHighlight();
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        searchInputRef.current?.focus({ preventScroll: true });
        restoreScrollPosition();
        window.setTimeout(restoreScrollPosition, 220);
        window.setTimeout(restoreScrollPosition, 520);
      });
    });
  };

  const toggleCategoryExpansion = () => {
    setCategoriesExpanded((open) => !open);
  };

  const findCategoryId = (slot: CatalogCategorySlot) => {
    return findCategoryIdForSlot(categories, slot);
  };
  const activeSlot =
    catalogCategorySlots.find((slot) => slot.key === activeCatalogKey) ??
    catalogCategorySlots[0];
  const activeSlotCategoryId = findCategoryId(activeSlot);
  const handleSelectSlot = (slot: CatalogCategorySlot) => {
    setActiveCatalogKey(slot.key);
    if (isSearching) {
      setSearchScopeKey(slot.key);
    }
    const categoryId = findCategoryId(slot);
    if (categoryId) setActiveCategoryId(categoryId);
  };

  return (
    <div
      ref={pageScrollRef}
      onScroll={handleCatalogScroll}
      className="scrollbar-hide relative mx-auto flex h-screen max-h-screen w-full max-w-md flex-col overflow-y-auto overflow-x-hidden bg-[#f7f7f4] text-[#171717] dark:bg-background dark:text-foreground"
      data-text-scale={textScale}
      style={catalogTextScaleStyle(textScale)}
    >
      {showGuideLines && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-y-0 left-1/2 z-[90] w-full max-w-md -translate-x-1/2"
        >
          <span
            className="absolute bottom-0 top-0 w-px scale-x-50 bg-cyan-500/85 dark:bg-cyan-300/85"
            style={{ left: "7.8px" }}
          />
          <span
            className="absolute bottom-0 top-0 w-px scale-x-50 bg-cyan-500/85 dark:bg-cyan-300/85"
            style={{ right: "7.8px" }}
          />
        </div>
      )}
      <header
        ref={headerRef}
        className="sticky top-0 z-40 bg-[#f7f7f4] px-[7.8px] pb-2.5 pt-3.5 dark:border-b dark:border-border/30 dark:bg-background"
      >
        <div className="grid h-10 grid-cols-[2rem_minmax(6.7rem,1fr)_auto_auto] items-center gap-1">
          <button
            type="button"
            onClick={(event) =>
              toggleHeaderSurface("rail", event.currentTarget)
            }
            className="flex h-10 w-8 shrink-0 items-center justify-start focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
            aria-label="Abrir atalhos do cardápio"
            aria-expanded={activeHeaderSurface === "rail"}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-[9px] border border-[#d9d3c8]/80 bg-white/35 shadow-[0_1px_3px_rgba(36,32,22,0.07)] dark:border-white/12 dark:bg-white/[0.035] dark:shadow-none">
              <AlvoradaLogo variant="icon" size="lg" className="w-7" />
            </span>
          </button>

          {activeHeaderSurface === "rail" ? (
            <CatalogHeaderRail
              onOpen={openHeaderSurface}
              onClose={closeHeaderSurface}
            />
          ) : (
            <>
              <button
                type="button"
                onClick={(event) => openCustomerSurface(event.currentTarget)}
                className="flex h-10 min-w-[6.7rem] flex-col items-start justify-center rounded-full px-1 text-left leading-none text-[#181818] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 dark:text-foreground"
                aria-label="Cliente atual"
                aria-expanded={activeHeaderSurface === "customer"}
              >
                <span className="text-[length:var(--catalog-text-micro)] font-medium leading-[10px] text-[#777268] dark:text-muted-foreground">
                  {customerLeadText}
                </span>
                <span className="flex max-w-full items-center gap-0.5 text-[length:var(--catalog-text-body)] font-bold leading-[14px]">
                  <span className="whitespace-nowrap">{customerMainText}</span>
                  <ChevronDownIcon className="h-3 w-3 shrink-0 stroke-[2] text-[#f04a2a]/62" />
                </span>
              </button>

              <button
                type="button"
                onClick={(event) =>
                  toggleHeaderSurface("status", event.currentTarget)
                }
                className="flex h-10 shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full px-1 text-[length:var(--catalog-text-sm)] font-semibold leading-none text-emerald-600 transition-all duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/18 dark:text-emerald-300 min-[360px]:gap-1.5"
                aria-label={
                  isStoreOpen
                    ? "Loja aberta. Ver horários."
                    : "Loja fechada. Ver horários."
                }
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
                      className="overflow-hidden whitespace-nowrap"
                    >
                      {isStoreOpen ? "Aberta" : "Fechada"}
                    </motion.span>
                  )}
                </AnimatePresence>
                <ChevronDownIcon className="h-3 w-3 stroke-[1.7] text-emerald-600/58 dark:text-emerald-300/58" />
              </button>

              <div className="flex shrink-0 items-center justify-end gap-0.5">
                <button
                  type="button"
                  onClick={(event) =>
                    toggleHeaderSurface("text", event.currentTarget)
                  }
                  className="flex h-9 w-7 items-center justify-center rounded-full text-[length:var(--catalog-text-sm)] font-bold leading-none text-[#101010]/70 transition-colors hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 dark:text-foreground/76 dark:hover:bg-white/8"
                  aria-label={`Tamanho do texto: ${currentTextScaleOption.name}. Alterar tamanho.`}
                  aria-expanded={activeHeaderSurface === "text"}
                  aria-controls="catalog-header-text-surface"
                >
                  Aa
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    handleToggleCatalogTheme();
                    event.currentTarget.blur();
                  }}
                  className="flex h-9 w-7 items-center justify-center rounded-full text-[#101010] transition-colors hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 dark:text-foreground/76 dark:hover:bg-white/8"
                  aria-pressed={isDark}
                  aria-label={
                    isDark ? "Ativar modo claro" : "Ativar modo escuro"
                  }
                  title={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
                >
                  {isDark ? (
                    <SunIcon className="h-[17px] w-[17px] stroke-[1.8]" />
                  ) : (
                    <MoonIcon className="h-[17px] w-[17px] stroke-[1.8]" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={(event) =>
                    toggleHeaderSurface("menu", event.currentTarget)
                  }
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

      <section
        ref={categoryNavRef}
        className="sticky top-[64px] z-30 bg-[#f7f7f4] px-[7.8px] pb-2 pt-1 transition-[padding] duration-200 motion-reduce:transition-none max-[340px]:px-1 dark:bg-background"
        aria-label="Busca e categorias do cardápio"
      >
        {!showFullSearch && (
          <>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-[7.8px] right-[7.8px] top-0 h-px bg-[#deded9] max-[340px]:left-1 max-[340px]:right-1 dark:bg-border/35"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-0 left-[7.8px] right-[7.8px] h-px bg-[#deded9] max-[340px]:left-1 max-[340px]:right-1 dark:bg-border/35"
            />
          </>
        )}
        <AnimatePresence initial={false} mode="wait">
          {showFullSearch ? (
            <motion.div
              key="full-search"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16 }}
              className="relative mx-auto mb-1.5 flex h-11 w-[calc(100%-40px)] max-w-[352px] items-center"
            >
              <SearchIcon className="absolute left-3.5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-[#8a9299]" />
              <Input
                ref={searchInputRef}
                aria-label="Buscar produto ou sabor"
                placeholder="Buscar produto ou sabor..."
                value={searchTerm}
                onChange={(e) => handleSearchTermChange(e.target.value)}
                onPointerDown={activateSearchPressHighlight}
                onClick={activateSearchPressHighlight}
                className={`h-10 rounded-[14px] border bg-white pl-10 pr-9 text-[length:var(--catalog-text-title)] font-medium text-[#202020] shadow-none transition-[border-color,box-shadow] duration-300 placeholder:text-[#8e969d] focus-visible:border-[#b7c3b3] focus-visible:ring-1 focus-visible:ring-[#0fae79]/25 motion-reduce:transition-none dark:bg-card dark:text-foreground ${
                  isSearchPressHighlighted
                    ? "border-[#f04a2a] ring-2 ring-[#f04a2a]/20 focus-visible:border-[#f04a2a] focus-visible:ring-[#f04a2a]/20 dark:border-[#f04a2a] dark:ring-[#f04a2a]/20 dark:focus-visible:border-[#f04a2a]"
                    : "border-[#e1e2de] dark:border-border/50"
                }`}
              />
              {isSearching && (
                <button
                  type="button"
                  className="absolute right-3.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[#7e8790] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                  onClick={clearSearchAndRestoreCategory}
                  aria-label="Limpar busca"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="compact-search"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16 }}
              className="mb-1 grid grid-cols-[44px_minmax(0,1fr)_44px] items-center"
            >
              <button
                type="button"
                onClick={openSearchFromCompact}
                className="flex h-11 w-full items-center justify-center rounded-full text-[#667078] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 dark:text-foreground/68"
                aria-label="Abrir busca"
              >
                <SearchIcon className="h-[17px] w-[17px] stroke-[1.9]" />
              </button>
              <div
                className="scrollbar-hide min-w-0 overflow-x-auto scroll-smooth motion-reduce:scroll-auto"
                aria-label="Categorias principais"
              >
                <div
                  ref={categoryRailRef}
                  className="relative h-11 min-w-0"
                >
                  {categories ? (
                    <>
                      <div
                        aria-hidden="true"
                        className="pointer-events-none mx-auto flex h-full w-max max-w-full min-w-0 items-center justify-center gap-[19px]"
                      >
                        {primaryCategorySlots.map((slot) => (
                          <CategoryTab
                            key={slot.key}
                            slot={slot}
                            active={activeCatalogKey === slot.key}
                            compact
                            primary
                            visualOnly
                          />
                        ))}
                      </div>
                      <div className="absolute inset-0 z-20">
                        {primaryCategorySlots.map((slot) => {
                          const zone = categoryTouchZones.find(
                            (current) => current.key === slot.key,
                          );

                          return (
                            <button
                              key={slot.key}
                              type="button"
                              data-category-key={slot.key}
                              data-category-touch-key={slot.key}
                              onClick={() => handleSelectSlot(slot)}
                              className="absolute top-0 h-11 rounded-[10px] bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                              style={{
                                left: zone ? `${zone.left}px` : "0px",
                                width: zone ? `${zone.width}px` : "0px",
                              }}
                              aria-label={slot.label}
                              aria-pressed={activeCatalogKey === slot.key}
                            />
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="grid h-full grid-cols-5 gap-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 rounded-xl" />
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <CategoryExpander
                expanded={categoriesExpanded}
                onClick={toggleCategoryExpansion}
                compact
              />
            </motion.div>
          )}
        </AnimatePresence>

        {showFullSearch && (
          <div className="grid grid-cols-[44px_minmax(0,1fr)_44px] items-end">
            <span aria-hidden="true" className="h-10 w-full" />
            <div
              className="scrollbar-hide min-w-0 overflow-x-auto scroll-smooth motion-reduce:scroll-auto"
              aria-label="Categorias principais"
            >
              <div
                ref={categoryRailRef}
                className="relative h-12 min-w-0"
              >
                {categories ? (
                  <>
                    <div
                      aria-hidden="true"
                      className="pointer-events-none mx-auto flex h-full w-max max-w-full min-w-0 items-end justify-center gap-[19px]"
                    >
                      {primaryCategorySlots.map((slot) => (
                        <CategoryTab
                          key={slot.key}
                          slot={slot}
                          active={activeCatalogKey === slot.key}
                          primary
                          visualOnly
                        />
                      ))}
                    </div>
                    <div className="absolute inset-0 z-20">
                      {primaryCategorySlots.map((slot) => {
                        const zone = categoryTouchZones.find(
                          (current) => current.key === slot.key,
                        );

                        return (
                          <button
                            key={slot.key}
                            type="button"
                            data-category-key={slot.key}
                            data-category-touch-key={slot.key}
                            onClick={() => handleSelectSlot(slot)}
                            className="absolute top-0 h-12 rounded-[10px] bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                            style={{
                              left: zone ? `${zone.left}px` : "0px",
                              width: zone ? `${zone.width}px` : "0px",
                            }}
                            aria-label={slot.label}
                            aria-pressed={activeCatalogKey === slot.key}
                          />
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="grid h-full grid-cols-5 gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 rounded-xl" />
                    ))}
                  </div>
                )}
              </div>
            </div>
            <CategoryExpander
              expanded={categoriesExpanded}
              onClick={toggleCategoryExpansion}
            />
          </div>
        )}

        <AnimatePresence initial={false}>
          {categoriesExpanded && categories && (
            <motion.div
              id={CATALOG_CATEGORY_SECONDARY_ID}
              key="secondary-categories"
              initial={{ opacity: 0, height: 0, y: -4 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              className="mt-2 grid grid-cols-3 overflow-hidden"
            >
              {secondaryCategorySlots.map((slot) => (
                <CategoryTab
                  key={slot.key}
                  slot={slot}
                  active={activeCatalogKey === slot.key}
                  onClick={() => handleSelectSlot(slot)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <main
        className={`flex-1 px-[7.8px] py-4 ${
          visualCartQuantity > 0 ? "pb-24" : "pb-20"
        }`}
      >
        {isSearching ? (
          <SearchResults
            term={searchTerm}
            categories={categories}
            scopeKey={searchScopeKey}
            onScopeChange={setSearchScopeKey}
            onStartPizza={openPizzaBuilder}
            onSelect={handleSelectProduct}
            onAdd={handleAddVisualItem}
            fallbackProducts={
              shouldUseLocalCatalog ? fallbackProducts : undefined
            }
          />
        ) : activeCatalogKey === "highlights" ? (
          <FeaturedProducts
            onSelect={handleSelectProduct}
            onAdd={handleAddVisualItem}
            fallbackProducts={
              shouldUseLocalCatalog ? fallbackProducts : undefined
            }
          />
        ) : activeCatalogKey === "pizzas" && activeSlotCategoryId ? (
          <PizzaCatalogSection
            categoryId={activeSlotCategoryId}
            fallbackProducts={
              shouldUseLocalCatalog
                ? fallbackProducts.filter(
                    (product) => product.categoryId === activeSlotCategoryId,
                  )
                : undefined
            }
            onStartPizza={openPizzaBuilder}
          />
        ) : activeSlotCategoryId ? (
          <CategoryProducts
            categoryId={activeSlotCategoryId}
            onSelect={handleSelectProduct}
            onAdd={handleAddVisualItem}
            fallbackProducts={
              shouldUseLocalCatalog
                ? fallbackProducts.filter(
                    (product) => product.categoryId === activeSlotCategoryId,
                  )
                : undefined
            }
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-14 text-center text-[#74808a] dark:text-muted-foreground">
            <p className="text-[length:var(--catalog-text-title)] font-semibold">
              Nenhum produto nesta categoria
            </p>
          </div>
        )}
      </main>

      {visualCartQuantity === 0 && (
        <button
          type="button"
          className="fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] right-[max(7.8px,calc((100vw-28rem)/2+7.8px))] z-40 flex h-12 min-w-12 items-center justify-center gap-2 rounded-full border border-emerald-300/70 bg-emerald-500 px-3 text-white shadow-[0_14px_28px_rgba(16,185,129,0.30)] transition-colors hover:bg-emerald-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 dark:border-emerald-300/35 dark:bg-emerald-500 dark:hover:bg-emerald-400"
          aria-label="Abrir ajuda"
        >
          <HelpCircleIcon className="h-5 w-5 stroke-[2]" />
          <span className="hidden text-[length:var(--catalog-text-xs)] font-extrabold leading-none min-[360px]:inline">
            Ajuda
          </span>
        </button>
      )}

      {visualCartQuantity > 0 && (
        <footer className="fixed bottom-[calc(env(safe-area-inset-bottom)+0.85rem)] left-1/2 z-50 w-full max-w-md -translate-x-1/2 px-[7.8px]">
          <div className="flex h-[58px] w-full overflow-hidden rounded-[18px] border border-[#6f7429] bg-[#626a2d] text-white shadow-[0_12px_24px_rgba(31,36,24,0.24)] dark:border-[#6f7429] dark:bg-[#626a2d]">
            <button
              type="button"
              className="flex h-full min-w-0 flex-1 items-center gap-2.5 px-3 text-left transition-colors hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f04a2a]/35"
              aria-label={`Ver carrinho: ${formatCatalogItemCount(
                visualCartQuantity,
              )}, ${formatCatalogPrice(visualCartTotal)} no carrinho`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-[#f04a2a] text-white shadow-[0_7px_14px_rgba(240,74,42,0.24)]">
                <ShoppingBagIcon className="h-[18px] w-[18px] stroke-[2.2]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[length:var(--catalog-text-sm)] font-extrabold leading-tight">
                  Carrinho
                </span>
                <span className="mt-0.5 block truncate text-[length:var(--catalog-text-xs)] font-semibold leading-tight text-white/86">
                  {formatCatalogItemCount(visualCartQuantity)} ·{" "}
                  {formatCatalogPrice(visualCartTotal)}
                </span>
              </span>
              <span className="flex h-9 shrink-0 items-center justify-center rounded-[12px] bg-[#f04a2a] px-3 text-[length:var(--catalog-text-xs)] font-extrabold leading-none text-white shadow-[0_7px_14px_rgba(240,74,42,0.22)]">
                Ver carrinho
              </span>
            </button>
            <div
              aria-hidden="true"
              className="my-2 w-px shrink-0 bg-white/16"
            />
            <button
              type="button"
              className="flex h-full w-[50px] shrink-0 items-center justify-center text-emerald-200 transition-colors hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/35"
              aria-label="Abrir ajuda"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white shadow-[0_6px_14px_rgba(16,185,129,0.24)]">
                <HelpCircleIcon className="h-5 w-5 stroke-[2]" />
              </span>
            </button>
          </div>
        </footer>
      )}

      <ProductSheet
        product={selectedProduct}
        onAdd={handleAddVisualItem}
        onClose={() => setSelectedProduct(null)}
      />
      <PizzaBuilder
        open={pizzaBuilder !== null}
        mode={pizzaBuilder?.mode ?? "single"}
        initialFlavor={pizzaBuilder?.initialFlavor ?? null}
        flavors={pizzaBuilder?.flavors ?? []}
        fallbackConfiguration={pizzaBuilder?.fallbackConfiguration}
        onAdd={handleAddVisualItem}
        onClose={() => setPizzaBuilder(null)}
        onBackToList={() => setPizzaBuilder(null)}
      />
    </div>
  );
}

function CategoryTab({
  slot,
  active,
  onClick,
  spread = "center",
  compact = false,
  primary = false,
  visualOnly = false,
}: {
  slot: CatalogCategorySlot;
  active: boolean;
  onClick?: () => void;
  spread?: "start" | "center";
  compact?: boolean;
  primary?: boolean;
  visualOnly?: boolean;
}) {
  const Icon = slot.icon;
  const content = (
      <span
        data-category-visual={primary ? slot.key : undefined}
        className={`relative z-10 flex h-full flex-col items-center justify-center ${
          primary ? "w-max gap-[5px]" : "w-full gap-1"
        }`}
      >
        <span className="flex h-5 w-full items-center justify-center">
        <Icon
          className={`h-[17px] w-[17px] stroke-[1.8] ${active ? "text-[#f04a2a]" : "text-[#667078] dark:text-foreground/62"}`}
        />
        </span>
        <span
          className={`block max-w-full whitespace-nowrap text-center ${
            primary ? "h-[10px] leading-[10px]" : "leading-none"
          }`}
        >
          {slot.label}
        </span>
        <span
          aria-hidden="true"
          className={`absolute bottom-0 h-0.5 rounded-full bg-[#f04a2a] ${
            primary ? "w-7" : "w-9"
          } ${active ? "opacity-100" : "opacity-0"}`}
        />
      </span>
  );
  const className = `relative flex min-w-0 items-center justify-center rounded-[10px] text-center font-semibold transition-colors ${
    active ? "text-[#f04a2a]" : "text-[#242824] dark:text-foreground/76"
  } ${
    primary
      ? "flex-none p-0 text-[9.5px] max-[380px]:text-[8px] max-[340px]:text-[7px]"
      : "text-[length:var(--catalog-text-tiny)]"
  } ${compact ? "h-11" : "h-12"} ${primary ? "w-max" : "w-full"} ${
    !primary && spread === "start"
      ? "justify-self-start"
      : !primary
        ? "justify-self-stretch"
        : ""
  }`;

  if (visualOnly) {
    return <span className={className}>{content}</span>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      data-category-key={slot.key}
      className={`${className} focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20`}
    >
      {content}
    </button>
  );
}

function CategoryExpander({
  expanded,
  onClick,
  compact = false,
}: {
  expanded: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-10 items-center justify-center rounded-full text-[#f04a2a] transition-colors hover:bg-[#f04a2a]/7 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 dark:hover:bg-white/8 ${
        compact ? "w-full justify-self-stretch" : "w-9 justify-self-end"
      }`}
      aria-label={expanded ? "Recolher categorias" : "Expandir categorias"}
      aria-expanded={expanded}
      aria-controls={CATALOG_CATEGORY_SECONDARY_ID}
    >
      <ChevronDownIcon
        className={`h-[18px] w-[18px] stroke-[2.2] transition-transform duration-200 motion-reduce:transition-none ${
          expanded ? "rotate-180" : ""
        }`}
      />
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

function getHeaderSurfaceLayout(
  surface: Exclude<HeaderSurface, null>,
  customerIdentified = true,
) {
  if (surface === "menu") {
    return "right-[7.8px] w-[min(12rem,calc(100vw-15.6px))]";
  }

  if (surface === "status") {
    return "right-[4.5rem] w-[min(9.75rem,calc(100vw-15.6px))]";
  }

  if (surface === "text") {
    return "right-[4.55rem] w-max min-w-[9rem] max-w-[calc(100vw-15.6px)]";
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

  const currentJourney = headerJourneyItems.find(
    (item) => item.key === surface,
  );
  const menuItems = getCatalogMenuItems({
    route:
      typeof window === "undefined" ? "/cardapio" : window.location.pathname,
    customerIdentified: Boolean(customerName),
  });

  return (
    <AnimatePresence mode="wait">
      <motion.div
        id={`catalog-header-${surface}-surface`}
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
                  <p className="text-[length:var(--catalog-text-sm)] font-semibold leading-tight">
                    {currentJourney.label}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onClose()}
                className="rounded-full p-1.5 text-[#7b776d] hover:bg-black/[0.04]"
                aria-label="Fechar painel"
              >
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
          <div className="px-2.5 py-2">
            <PanelTitle title="Texto" onClose={onClose} />
            <TextScaleSelector
              value={textScale}
              onChange={onTextScaleChange}
              surface
            />
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
                  onClick={() =>
                    item.surface ? onOpen(item.surface) : onClose()
                  }
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
  const surfaceLabels: Record<CatalogTextScale, string> = {
    compact: "Menor",
    normal: "Padrão",
    large: "Maior",
  };

  return (
    <div
      className={`${surface ? "mt-2 grid gap-1" : "flex items-center justify-center gap-0.5"}`}
      role="group"
      aria-label="Escolher tamanho do texto"
    >
      {catalogTextScaleOptions.map((option) => {
        const active = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`flex h-7 items-center rounded-full text-[length:var(--catalog-text-sm)] font-bold leading-none transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 ${
              active
                ? "bg-[#f04a2a] text-white shadow-[0_2px_5px_rgba(240,74,42,0.13)]"
                : "text-[#4f4a40]/70 hover:bg-black/5 dark:text-foreground/70 dark:hover:bg-white/8"
            } ${surface ? "justify-between gap-4 px-3" : "min-w-7 justify-center px-1.5"}`}
            aria-label={`Texto ${option.name}`}
            aria-pressed={active}
          >
            <span>{surface ? surfaceLabels[option.value] : option.label}</span>
            {surface && (
              <span
                className={`text-[length:var(--catalog-text-xs)] ${
                  active ? "text-white/78" : "text-[#4f4a40]/48"
                }`}
              >
                {option.label}
              </span>
            )}
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
        <label
          className="mt-3 block text-[length:var(--catalog-text-sm)] font-semibold leading-tight text-[#6f6a5d] dark:text-muted-foreground"
          htmlFor="catalog-customer-name"
        >
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
            <p className="text-[length:var(--catalog-text-xs)] font-bold text-[#3a3326] dark:text-foreground">
              Descartar nome?
            </p>
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

function PanelTitle({
  title,
  subtitle,
  onClose,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-[length:var(--catalog-text-sm)] font-bold leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-0.5 text-[length:var(--catalog-text-xs)] leading-snug text-[#7b776d] dark:text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="rounded-full p-1.5 text-[#7b776d] hover:bg-black/[0.04]"
        aria-label="Fechar painel"
      >
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
      <li
        key={item.key}
        className="flex h-8 items-center gap-2 rounded-xl px-1.5 text-[length:var(--catalog-text-xs)] font-bold"
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f3eadc] text-[#6b5f33] dark:bg-white/10 dark:text-[#d7c98a]">
          <Icon className="h-3.5 w-3.5 stroke-[1.8]" />
        </span>
        <span>{item.shortLabel}</span>
      </li>
    );
  });

  return (
    <section
      className={`${compact ? "mt-1" : "mt-2"} ${compact ? "" : "border-t border-[#e6e0d5] pt-2 dark:border-white/10"}`}
    >
      {!compact && (
        <p className="mb-1 text-[length:var(--catalog-text-xs)] font-bold">
          {title}
        </p>
      )}
      <ul className="grid gap-0.5">{items}</ul>
      <p className="mt-2 text-[length:var(--catalog-text-xs)] leading-relaxed text-[#6f6a5d] dark:text-muted-foreground">
        Nenhuma no momento.
      </p>
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
  const remoteProducts = useQuery(
    api.catalog.list.listProducts,
    fallbackProducts ? "skip" : {},
  ) as ProductDoc[] | undefined;
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
        <p className="text-[length:var(--catalog-text-sm)] font-semibold">
          Nenhum produto disponível agora
        </p>
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
          badgeVariant={
            index === 1 ? "promo" : index === 3 ? "today" : "always"
          }
        />
      ))}
    </div>
  );
}

function PizzaCatalogSection({
  categoryId,
  fallbackProducts,
  onStartPizza,
}: {
  categoryId: Id<"categories">;
  fallbackProducts?: ProductDoc[];
  onStartPizza: (state: PizzaBuilderState) => void;
}) {
  const remoteProducts = useQuery(
    api.catalog.products.listByCategory,
    fallbackProducts ? "skip" : { categoryId },
  ) as ProductDoc[] | undefined;
  const products = fallbackProducts ?? remoteProducts;
  const allFlavors = useMemo(
    () => (products ? withPizzaKind(buildPizzaFlavorChoices(products)) : []),
    [products],
  );
  const savoryFlavors = allFlavors.filter(
    (flavor) => flavor.pizzaKind === "savory",
  );
  const sweetFlavors = allFlavors.filter(
    (flavor) => flavor.pizzaKind === "sweet",
  );
  const fallbackConfiguration =
    products?.find((product) => product.fallbackConfiguration)
      ?.fallbackConfiguration ?? null;

  if (!products) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (allFlavors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p className="font-semibold">Nenhuma pizza disponivel agora</p>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.section
        key="pizza-catalog"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        className="space-y-2.5"
        aria-label="Relação de pizzas"
      >
        <section className="space-y-2">
          <div
            className={`px-1 text-[length:var(--catalog-text-xs)] font-extrabold uppercase tracking-wide ${pizzaSectionTitleColorClass.custom}`}
          >
            <span>Personalizada</span>
          </div>
          <PizzaTwoFlavorsEntryCard
            flavors={allFlavors}
            onStart={() =>
              onStartPizza({
                mode: "double",
                initialFlavor: null,
                flavors: allFlavors,
                fallbackConfiguration,
              })
            }
          />
        </section>

        <PizzaFlavorSection
          title="Salgadas"
          flavors={savoryFlavors}
          onStartPizza={onStartPizza}
          allFlavors={savoryFlavors}
          fallbackConfiguration={fallbackConfiguration}
        />
        <PizzaFlavorSection
          title="Doces"
          flavors={sweetFlavors}
          onStartPizza={onStartPizza}
          allFlavors={sweetFlavors}
          fallbackConfiguration={fallbackConfiguration}
        />
      </motion.section>
    </AnimatePresence>
  );
}

function PizzaTwoFlavorsEntryCard({
  flavors,
  onStart,
}: {
  flavors: PizzaFlavorWithKind[];
  onStart: () => void;
}) {
  const sizes: Array<{
    value: PizzaSize;
    slices: string;
    devFallbackPrice: number;
  }> = [
    { value: "M", slices: "6 FATIAS", devFallbackPrice: 55 },
    { value: "G", slices: "8 FATIAS", devFallbackPrice: 65 },
  ];
  const priceRows = sizes.map((size) => {
    const price =
      getTwoFlavorStartPrice(flavors, size.value) ??
      (import.meta.env.DEV ? size.devFallbackPrice : undefined);
    return { ...size, price };
  });
  const startPrice = priceRows.reduce<number | undefined>(
    (lowest, size) =>
      size.price === undefined
        ? lowest
        : lowest === undefined
          ? size.price
          : Math.min(lowest, size.price),
    undefined,
  );
  const canStart = flavors.length > 0;
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (!canStart) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onStart();
    }
  };

  return (
    <motion.article
      whileTap={{ scale: 0.99 }}
      onClick={() => {
        if (canStart) onStart();
      }}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label="Montar pizza com 2 sabores"
      className="relative h-[92px] cursor-pointer overflow-hidden rounded-[11px] border border-[#ffd4c8] bg-[#fff5ef] px-2.5 pb-2.5 pt-3.5 text-left shadow-[0_1px_2px_rgba(30,30,20,0.025)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 dark:border-[#f04a2a]/30 dark:bg-[#f04a2a]/10"
    >
      <div className="flex h-full items-center gap-2">
        <HalfPizzaVisual />
        <div className="flex min-h-[66px] w-0 min-w-0 flex-1 flex-col justify-center pt-px">
          <p className="whitespace-nowrap text-[length:var(--catalog-text-body)] font-semibold leading-[var(--catalog-leading-body)] text-[#111827] dark:text-foreground">
            Pizza com 2 sabores
          </p>
          <p className="mt-[2px] whitespace-nowrap text-[length:var(--catalog-text-tiny)] leading-none text-[#6f777e] dark:text-muted-foreground">
            Você escolhe os sabores
          </p>
          <p className="mt-[4px] whitespace-nowrap text-[length:var(--catalog-text-tiny)] font-medium leading-none text-[#6f777e] dark:text-muted-foreground">
            M e G disponíveis
          </p>
          <p className="mt-[5px] whitespace-nowrap text-[length:var(--catalog-text-xs)] font-medium leading-none text-[#8a9095] dark:text-muted-foreground">
            A partir de{" "}
            <span className="font-semibold text-[#f04a2a]">
              {startPrice !== undefined
                ? formatCatalogPrice(startPrice)
                : "indisponível"}
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            if (canStart) onStart();
          }}
          disabled={!canStart}
          className="mr-1 flex h-11 w-14 shrink-0 items-center justify-center rounded-[12px] bg-transparent p-0 text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:text-[#8f746b]"
        >
          <span className="flex h-[34px] w-[54px] items-center justify-center rounded-[11px] bg-[#ff4a2a] text-[11px] font-semibold shadow-[0_2px_5px_rgba(240,74,42,0.13)] transition-colors hover:bg-[#ec3f22]">
            Montar
          </span>
        </button>
      </div>
    </motion.article>
  );
}

function HalfPizzaVisual() {
  return (
    <div className="h-[66px] w-[66px] shrink-0 overflow-hidden rounded-[10px] bg-[#fde5d6]">
      <img
        src={pizzaDoisSaboresImage}
        alt="Pizza dividida em dois sabores"
        className="h-full w-full object-cover"
        loading="eager"
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
      />
    </div>
  );
}

function PizzaFlavorSection({
  title,
  flavors,
  allFlavors,
  fallbackConfiguration,
  onStartPizza,
}: {
  title: string;
  flavors: PizzaFlavorWithKind[];
  allFlavors: PizzaFlavorWithKind[];
  fallbackConfiguration: ProductCustomization | null;
  onStartPizza: (state: PizzaBuilderState) => void;
}) {
  const isSweetSection = normalizeKey(title).includes("doce");
  const sectionTitleClass = isSweetSection
    ? pizzaSectionTitleColorClass.sweet
    : pizzaSectionTitleColorClass.savory;

  if (flavors.length === 0) {
    return (
      <section className="space-y-2">
        <div
          className={`px-1 text-[length:var(--catalog-text-xs)] font-extrabold uppercase tracking-wide ${sectionTitleClass}`}
        >
          <span>{title}</span>
        </div>
        <div className="rounded-[13px] border border-dashed border-[#e2e2de] bg-white/55 px-3 py-4 text-center text-[length:var(--catalog-text-sm)] font-semibold text-[#667078] dark:border-border/40 dark:bg-card/45 dark:text-muted-foreground">
          Nenhuma pizza {title.toLowerCase()} disponivel nesta base.
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-2">
      <div
        className={`px-1 text-[length:var(--catalog-text-xs)] font-extrabold uppercase tracking-wide ${sectionTitleClass}`}
      >
        <span>{title}</span>
      </div>
      {flavors.map((flavor, index) => (
        <PizzaFlavorCatalogCard
          key={getPizzaKey(flavor)}
          flavor={flavor}
          badgeVariant={index === 1 ? "promo" : index === 3 ? "today" : "always"}
          onStart={() =>
            onStartPizza({
              mode: "single",
              initialFlavor: flavor,
              flavors: allFlavors,
              fallbackConfiguration,
            })
          }
        />
      ))}
    </section>
  );
}

function PizzaFlavorCatalogCard({
  flavor,
  badgeVariant,
  onStart,
}: {
  flavor: PizzaFlavorChoice;
  badgeVariant: "always" | "promo" | "today";
  onStart: () => void;
}) {
  const cleanName = normalizeText(flavor.name);
  const cleanDescription = normalizeText(flavor.description);
  const prices = (["P", "M", "G"] as const)
    .map((size) => [size, getPizzaFlavorPrice(flavor, size)] as const)
    .filter(([, price]) => typeof price === "number");
  const minPrice = prices.reduce<number | undefined>(
    (lowest, [, price]) =>
      price === undefined
        ? lowest
        : lowest === undefined
          ? price
          : Math.min(lowest, price),
    undefined,
  );
  const badgeConfig = {
    always: {
      label: "DE SEMPRE",
      dot: "bg-[#d45519]",
      text: "text-[#d45519]",
      bg: "bg-[#fff0e7]",
    },
    promo: {
      label: "PROMOÇÃO",
      dot: "bg-[#d83b7d]",
      text: "text-[#c63872]",
      bg: "bg-[#fdebf3]",
    },
    today: {
      label: "HOJE",
      dot: "bg-[#0fae79]",
      text: "text-[#138865]",
      bg: "bg-[#e8f8f0]",
    },
  }[badgeVariant];

  return (
    <motion.article
      whileTap={{ scale: 0.99 }}
      className="relative overflow-hidden rounded-[11px] border border-[#e2e2de] bg-white px-2.5 pb-2.5 pt-3.5 text-left shadow-[0_1px_2px_rgba(30,30,20,0.025)] transition-colors dark:border-border/40 dark:bg-card"
    >
      <span
        className={`absolute left-3 top-0 inline-flex -translate-y-1/2 items-center gap-1 rounded-full px-2 py-0.5 text-[length:var(--catalog-text-tiny)] font-extrabold tracking-[0.04em] ${badgeConfig.bg} ${badgeConfig.text}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${badgeConfig.dot}`} />
        {badgeConfig.label}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onStart}
          className="flex w-0 min-w-0 flex-1 items-center gap-2 text-left"
          aria-label={`Montar ${cleanName}`}
        >
          <ProductVisualImage product={flavor as ProductDoc} />
          <div className="w-0 min-w-0 flex-1">
            <p className="line-clamp-2 text-[length:var(--catalog-text-body)] font-semibold leading-[var(--catalog-leading-body)] text-[#111827] dark:text-foreground">
              {cleanName}
            </p>
            {cleanDescription && (
              <p className="mt-0.5 line-clamp-2 text-[length:var(--catalog-text-xs)] font-normal leading-[var(--catalog-leading-sm)] text-[#5c6978] dark:text-muted-foreground">
                {cleanDescription}
              </p>
            )}
            <p className="mt-1 text-[length:var(--catalog-text-sm)] font-semibold leading-none text-[#f04a2a]">
              {minPrice !== undefined
                ? `A partir de ${formatCatalogPrice(minPrice)}`
                : "Preço por tamanho"}
            </p>
          </div>
        </button>
        <button
          type="button"
          onClick={onStart}
          className="mr-1 flex h-11 w-14 shrink-0 items-center justify-center rounded-[12px] bg-transparent p-0 text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
          aria-label={`Montar ${cleanName} em um sabor`}
        >
          <span className="flex h-[34px] w-[54px] items-center justify-center rounded-[11px] bg-[#ff4a2a] text-[11px] font-semibold shadow-[0_2px_5px_rgba(240,74,42,0.13)] transition-colors hover:bg-[#ec3f22]">
            Montar
          </span>
        </button>
      </div>
    </motion.article>
  );
}

// --- Search results ---
function SearchResults({
  term,
  categories,
  scopeKey,
  onScopeChange,
  onStartPizza,
  onSelect,
  onAdd,
  fallbackProducts,
}: {
  term: string;
  categories: CategoryDoc[] | undefined;
  scopeKey: SearchScopeKey;
  onScopeChange: (scope: SearchScopeKey) => void;
  onStartPizza: (state: PizzaBuilderState) => void;
  onSelect: (p: Product) => void;
  onAdd: (p: Product) => void;
  fallbackProducts?: ProductDoc[];
}) {
  const remoteProducts = useQuery(
    api.catalog.list.listProducts,
    fallbackProducts ? "skip" : {},
  ) as ProductDoc[] | undefined;
  const products = fallbackProducts ?? remoteProducts;
  const normalizedTerm = normalizeKey(term.trim());
  const activeScopeSlot =
    scopeKey === "all"
      ? null
      : catalogCategorySlots.find((slot) => slot.key === scopeKey) ?? null;
  const activeScopeCategoryId = activeScopeSlot
    ? findCategoryIdForSlot(categories, activeScopeSlot)
    : null;
  const pizzaFlavors = useMemo(
    () => (products ? withPizzaKind(buildPizzaFlavorChoices(products)) : []),
    [products],
  );
  const hasPizzaIntent = [
    "pizza",
    "pizzas",
    "sabor",
    "sabores",
    "montar",
    "monte",
    "dois sabores",
  ].some((keyword) => normalizedTerm.includes(normalizeKey(keyword)));
  const results = useMemo(() => {
    if (!products) return undefined;
    return products.filter((product) => {
      if (normalizedTerm && !getProductSearchText(product, categories).includes(normalizedTerm)) {
        return false;
      }
      if (scopeKey === "all") return true;
      if (scopeKey === "highlights") return product.featured;
      return activeScopeCategoryId
        ? product.categoryId === activeScopeCategoryId
        : false;
    });
  }, [activeScopeCategoryId, categories, normalizedTerm, products, scopeKey]);
  const groupedResults = useMemo(() => {
    const groups = new Map<string, ProductDoc[]>();
    for (const product of results ?? []) {
      const label = getProductCategoryLabel(product, categories);
      const current = groups.get(label) ?? [];
      current.push(product);
      groups.set(label, current);
    }
    return Array.from(groups.entries());
  }, [categories, results]);
  const showTwoFlavorEntry =
    hasPizzaIntent &&
    pizzaFlavors.length > 0 &&
    (scopeKey === "all" || scopeKey === "pizzas");

  if (!results)
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );

  if (results.length === 0 && !showTwoFlavorEntry)
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <SearchIcon className="w-12 h-12 mb-3 opacity-30" />
        <p className="font-semibold">Nenhum produto encontrado</p>
        <p className="text-[length:var(--catalog-text-sm)]">
          Tente outro nome ou categoria
        </p>
      </div>
    );

  return (
    <div className="space-y-3">
      <div className="rounded-[13px] border border-[#e2e2de] bg-white px-3 py-2 dark:border-border/40 dark:bg-card">
        <p className="text-[length:var(--catalog-text-xs)] font-semibold text-[#667078] dark:text-muted-foreground">
          {results.length} resultado{results.length !== 1 ? "s" : ""} para
          &quot;{term}&quot;
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => onScopeChange("all")}
            className={`rounded-full border px-2.5 py-1 text-[length:var(--catalog-text-xs)] font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 ${
              scopeKey === "all"
                ? "border-[#f04a2a] bg-[#fff0e9] text-[#f04a2a]"
                : "border-[#ece7dd] bg-[#fbfaf7] text-[#667078] dark:border-border/40 dark:bg-background dark:text-muted-foreground"
            }`}
          >
            Todos
          </button>
          {activeScopeSlot && (
            <span className="rounded-full bg-[#f3f1eb] px-2.5 py-1 text-[length:var(--catalog-text-xs)] font-bold text-[#667078] dark:bg-muted/30 dark:text-muted-foreground">
              Filtrando: {activeScopeSlot.label}
            </span>
          )}
        </div>
      </div>

      {showTwoFlavorEntry && (
        <PizzaTwoFlavorsEntryCard
          flavors={pizzaFlavors}
          onStart={() =>
            onStartPizza({
              mode: "double",
              initialFlavor: null,
              flavors: pizzaFlavors,
              fallbackConfiguration:
                products?.find((product) => product.fallbackConfiguration)
                  ?.fallbackConfiguration ?? null,
            })
          }
        />
      )}

      {groupedResults.map(([label, productsInGroup]) => (
        <section key={label} className="space-y-2">
          <p className="px-1 text-[length:var(--catalog-text-xs)] font-extrabold uppercase tracking-wide text-[#716c60] dark:text-muted-foreground">
            {label}
          </p>
          {productsInGroup.map((product, index) =>
            isPizzaProduct(product) ? (
              <PizzaFlavorCatalogCard
                key={product._id}
                flavor={withPizzaKind([product])[0]}
                badgeVariant={
                  index === 1 ? "promo" : index === 3 ? "today" : "always"
                }
                onStart={() =>
                  onStartPizza({
                    mode: "single",
                    initialFlavor: product,
                    flavors: withPizzaKind(buildPizzaFlavorChoices([product])),
                    fallbackConfiguration: product.fallbackConfiguration,
                  })
                }
              />
            ) : (
              <ProductCard
                key={product._id}
                product={product}
                onSelect={onSelect}
                onAdd={onAdd}
                badgeVariant={index === 0 ? "today" : "always"}
              />
            ),
          )}
        </section>
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
  const remoteProducts = useQuery(
    api.catalog.products.listByCategory,
    fallbackProducts ? "skip" : { categoryId },
  ) as ProductDoc[] | undefined;
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
              <span className="text-[length:var(--catalog-text-xs)] font-bold uppercase tracking-wide text-foreground">
                Destaques
              </span>
            </div>
            <div className="space-y-2">
              {featured.map((p, index) => (
                <ProductCard
                  key={p._id}
                  product={p}
                  onSelect={onSelect}
                  onAdd={onAdd}
                  badgeVariant={index === 1 ? "promo" : "always"}
                />
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
                <ProductCard
                  key={p._id}
                  product={p}
                  onSelect={onSelect}
                  onAdd={onAdd}
                  badgeVariant={index === 0 ? "today" : "always"}
                />
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
  const displayPrice = getProductDisplayPrice(product);
  const hasDisplayPrice = typeof displayPrice === "number";
  const canAddVisualItem =
    typeof product.price === "number" &&
    !product.hasOptions &&
    !product.hasSizes;
  const priceText = hasDisplayPrice
    ? product.hasOptions || (product.hasSizes && product.sizes)
      ? `A partir de ${formatCatalogPrice(displayPrice)}`
      : formatCatalogPrice(displayPrice)
    : "Preço indisponível";
  const badgeConfig = {
    always: {
      label: "DE SEMPRE",
      dot: "bg-[#d45519]",
      text: "text-[#d45519]",
      bg: "bg-[#fff0e7]",
    },
    promo: {
      label: "PROMOÇÃO",
      dot: "bg-[#d83b7d]",
      text: "text-[#c63872]",
      bg: "bg-[#fdebf3]",
    },
    today: {
      label: "HOJE",
      dot: "bg-[#0fae79]",
      text: "text-[#138865]",
      bg: "bg-[#e8f8f0]",
    },
  }[badgeVariant];

  return (
    <motion.article
      whileTap={{ scale: 0.99 }}
      className="relative overflow-hidden rounded-[11px] border border-[#e2e2de] bg-white px-2.5 pb-2.5 pt-3.5 text-left shadow-[0_1px_2px_rgba(30,30,20,0.025)] transition-colors dark:border-border/40 dark:bg-card"
    >
      <span
        className={`absolute left-3 top-0 inline-flex -translate-y-1/2 items-center gap-1 rounded-full px-2 py-0.5 text-[length:var(--catalog-text-tiny)] font-extrabold tracking-[0.04em] ${badgeConfig.bg} ${badgeConfig.text}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${badgeConfig.dot}`} />
        {badgeConfig.label}
      </span>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onSelect(product)}
          className="flex w-0 min-w-0 flex-1 items-center gap-2 text-left"
        >
          <ProductVisualImage product={product} />

          <div className="w-0 min-w-0 flex-1">
            <p className="line-clamp-2 text-[length:var(--catalog-text-body)] font-semibold leading-[var(--catalog-leading-body)] text-[#111827] dark:text-foreground">
              {cleanName}
            </p>
            {cleanDescription && (
              <p className="mt-0.5 line-clamp-2 text-[length:var(--catalog-text-xs)] font-normal leading-[var(--catalog-leading-sm)] text-[#5c6978] dark:text-muted-foreground">
                {cleanDescription}
              </p>
            )}
            <p className="mt-1 text-[length:var(--catalog-text-sm)] font-semibold leading-none text-[#f04a2a]">
              {priceText}
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            if (!canAddVisualItem) {
              onSelect(product);
              return;
            }
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
        <span className="font-serif text-[25px] font-bold leading-none text-[#6a742b]">
          A
        </span>
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
