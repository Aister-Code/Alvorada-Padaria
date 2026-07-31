import type {
  ImageOrigin,
  ImageStatus,
  OptionType,
  PizzaKind,
  PizzaPricingPolicy,
  PriceStatus,
  ProductOrigin,
  UpgradeOperationalStatus,
} from "./contracts";

export const ALVORADA_CATALOG_INSTANCE = "CATALOG-INSTANCE-ALVORADA-001";
export const ALVORADA_DOCUMENT_VERSION = "001.2";
export const ALVORADA_MIGRATION_ACTOR = "catalog-real-alvorada-dev-migration";

export type AlvoradaCategorySeed = {
  code: string;
  documentKey: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  displayOrder: number;
  active: boolean;
};

export type AlvoradaProductSeed = {
  documentalId: string;
  documentKey: string;
  categoryCode: string;
  subcategory?: string;
  family?: string;
  name: string;
  slug: string;
  shortDescription?: string;
  origin: ProductOrigin;
  basePrice?: number;
  priceStatus?: PriceStatus;
  active: boolean;
  featured?: boolean;
  displayOrder: number;
  migrationStatus: "aplicado" | "aplicado_com_pendencias";
  pendingReason?: string;
};

export type AlvoradaOptionSeed = {
  productDocumentalId: string;
  documentKey: string;
  code: string;
  label: string;
  optionType: OptionType;
  price?: number;
  priceStatus: PriceStatus;
  active: boolean;
  sellable: boolean;
  required: boolean;
  displayOrder: number;
  metadata?: {
    size?: "P" | "M" | "G";
    volumeMl?: number;
    packageType?: string;
    liquidBase?: "agua" | "leite";
    displayHint?: string;
  };
  pendingReason?: string;
};

export type AlvoradaPizzaConfigurationSeed = {
  productDocumentalId: string;
  pizzaKind: PizzaKind;
  allowedSizes: Array<"P" | "M" | "G">;
  maxFlavorsBySize: Record<"P" | "M" | "G", number>;
  secondFlavorAllowed: boolean;
  pricingPolicy: PizzaPricingPolicy;
  active: boolean;
};

export type AlvoradaComplementGroupSeed = {
  documentKey: string;
  name: string;
  description?: string;
  minSelections: number;
  maxSelections?: number;
  required: boolean;
  active: boolean;
  displayOrder: number;
};

export type AlvoradaComplementItemSeed = {
  groupDocumentKey: string;
  documentKey: string;
  name: string;
  price?: number;
  priceStatus: PriceStatus;
  active: boolean;
  sellable: boolean;
  displayOrder: number;
  metadata?: Record<string, string>;
};

export type AlvoradaUpgradeSeed = {
  documentKey: string;
  name: string;
  description?: string;
  price?: number;
  priceStatus: PriceStatus;
  operationalStatus: UpgradeOperationalStatus;
  active: boolean;
  displayOrder: number;
};

export type AlvoradaUpgradeLinkSeed = {
  productDocumentalId: string;
  upgradeDocumentKey: string;
  active: boolean;
  displayOrder: number;
  rules?: Record<string, string>;
};

export type AlvoradaImageSeed = {
  productDocumentalId: string;
  documentKey: string;
  origin: ImageOrigin;
  status: ImageStatus;
  altText: string;
  replacementPending: boolean;
  isPrimary: boolean;
  displayOrder: number;
  active: boolean;
};

const categoryDocumentKeys = {
  lanches: "CATALOG-ALVORADA:CATEGORY:LANCHES",
  pizzas: "CATALOG-ALVORADA:CATEGORY:PIZZAS",
  bebidas: "CATALOG-ALVORADA:CATEGORY:BEBIDAS",
  padaria: "CATALOG-ALVORADA:CATEGORY:PADARIA",
  porcoes: "CATALOG-ALVORADA:CATEGORY:PORCOES",
  caldos: "CATALOG-ALVORADA:CATEGORY:CALDOS",
  conveniencia: "CATALOG-ALVORADA:CATEGORY:CONVENIENCIA",
} as const;

export const alvoradaCategories: AlvoradaCategorySeed[] = [
  {
    code: "LANCHES",
    documentKey: categoryDocumentKeys.lanches,
    name: "Lanches",
    slug: "lanches",
    icon: "burger",
    description: "Lanches tradicionais e hamburgueres artesanais.",
    displayOrder: 20,
    active: true,
  },
  {
    code: "PIZZAS",
    documentKey: categoryDocumentKeys.pizzas,
    name: "Pizzas",
    slug: "pizzas",
    icon: "pizza",
    description: "Pizzas salgadas e doces.",
    displayOrder: 30,
    active: true,
  },
  {
    code: "BEBIDAS",
    documentKey: categoryDocumentKeys.bebidas,
    name: "Bebidas",
    slug: "bebidas",
    icon: "cup-soda",
    description: "Sucos, bebidas e cervejas.",
    displayOrder: 40,
    active: true,
  },
  {
    code: "PADARIA",
    documentKey: categoryDocumentKeys.padaria,
    name: "Padaria",
    slug: "padaria",
    icon: "wheat",
    description: "Categoria homologada preservada ate reconciliacao propria.",
    displayOrder: 50,
    active: true,
  },
  {
    code: "PORCOES",
    documentKey: categoryDocumentKeys.porcoes,
    name: "Porções",
    slug: "porcoes",
    icon: "utensils",
    description: "Porções.",
    displayOrder: 60,
    active: true,
  },
  {
    code: "CALDOS",
    documentKey: categoryDocumentKeys.caldos,
    name: "Caldos",
    slug: "caldos",
    icon: "soup",
    description: "Caldos.",
    displayOrder: 70,
    active: true,
  },
  {
    code: "CONVENIENCIA",
    documentKey: categoryDocumentKeys.conveniencia,
    name: "Conveniência",
    slug: "conveniencia",
    icon: "store",
    description: "Categoria homologada preservada ate reconciliacao propria.",
    displayOrder: 80,
    active: true,
  },
];

const simpleProducts = [
  ["LAN-001", "Lanches", "Tradicionais", "Misto", "Misto Quente", "Pão, presunto, mucarela e orégano.", 9],
  ["LAN-002", "Lanches", "Tradicionais", "Bauru", "Bauru", "Pão, presunto, mucarela, tomate e orégano.", 11],
  ["LAN-003", "Lanches", "Tradicionais", "X", "X-Burguer", "Pão, presunto, mucarela, hambúrguer e orégano.", 13],
  ["LAN-004", "Lanches", "Tradicionais", "Americano", "Americano", "Pão, presunto, mucarela, ovo, tomate, alface e orégano.", 13],
  ["LAN-005", "Lanches", "Tradicionais", "X", "X-Salada", "Hambúrguer, presunto, mucarela, milho, tomate, alface e orégano.", 15],
  ["LAN-006", "Lanches", "Tradicionais", "X", "X-Salada com Catupiry", "Hambúrguer, catupiry, presunto, mucarela, milho, tomate, alface e orégano.", 17],
  ["LAN-007", "Lanches", "Tradicionais", "Cachorro-Quente", "Cachorro-Quente", "Salsicha, bacon, calabresa, mucarela, tomate, milho, batata palha e orégano.", 13],
  ["LAN-008", "Lanches", "Tradicionais", "Cachorro-Quente", "Cachorro-Quente c/ Catupiry", "Salsicha, bacon, calabresa, catupiry, mucarela, tomate, milho, batata palha e orégano.", 15],
  ["LAN-009", "Lanches", "Tradicionais", "Cachorro-Quente", "Cachorro-Quente Prime", "Salsicha, hambúrguer, bacon, calabresa, mucarela, tomate, milho, batata palha e orégano.", 17],
  ["LAN-010", "Lanches", "Tradicionais", "X", "X-Egg", "Hambúrguer, ovo, presunto, mucarela, tomate, alface e orégano.", 17],
  ["LAN-011", "Lanches", "Tradicionais", "X", "X-Bacon", "Hambúrguer, bacon, presunto, mucarela, tomate, alface e orégano.", 18],
  ["LAN-012", "Lanches", "Tradicionais", "X", "X-Egg Bacon", "Hambúrguer, bacon, ovo, presunto, mucarela, tomate, alface e orégano.", 19],
  ["LAN-013", "Lanches", "Tradicionais", "X", "X-Egg Calabresa", "Hambúrguer, calabresa, ovo, presunto, mucarela, tomate, alface e orégano.", 19],
  ["LAN-014", "Lanches", "Tradicionais", "X", "X-Calabresa", "Hambúrguer, calabresa, presunto, mucarela, tomate, alface e orégano.", 18],
  ["LAN-015", "Lanches", "Tradicionais", "X", "X-Tudo", "Hambúrguer, salsicha, ovo, bacon, calabresa, presunto, mucarela, tomate, milho, alface e orégano.", 22],
  ["LAN-016", "Lanches", "Tradicionais", "X", "X-Tudo Prime", "2 hambúrgueres, salsicha, ovo, bacon, calabresa, catupiry, presunto, mucarela, milho, tomate, alface e orégano.", 27],
  ["ART-001", "Lanches", "Hambúrgueres Artesanais", "Simples", "Burguer Simples", "Pão brioche, hambúrguer artesanal, mucarela, molho cheddar.", 20],
  ["ART-002", "Lanches", "Hambúrgueres Artesanais", "Alvorada", "Alvorada Burguer", "Pão brioche, hambúrguer artesanal, cheddar, bacon, alface e tomate.", 24],
  ["ART-003", "Lanches", "Hambúrgueres Artesanais", "Alvorada", "Alvorada Burguer Duplo", "Pão brioche, 2 hambúrgueres artesanais, bacon, barbecue, mucarela e cheddar.", 28],
  ["ART-004", "Lanches", "Hambúrgueres Artesanais", "Tropical", "Tropical", "Pão brioche, hambúrguer artesanal, abacaxi, cebola caramelizada, molho barbecue.", 25],
  ["ART-005", "Lanches", "Hambúrgueres Artesanais", "Favorito", "Burguer Favorito", "Pão brioche, hambúrguer artesanal, cheddar, cebola caramelizada, banana e farofa de bacon.", 26],
  ["ART-006", "Lanches", "Hambúrgueres Artesanais", "Fitness", "Fitness", "Pão brioche, hambúrguer artesanal, palmito, alface, tomate, picles, cebola roxa, mucarela.", 28],
  ["ART-007", "Lanches", "Hambúrgueres Artesanais", "Suprema", "Suprema", "Pão brioche, 2 hambúrgueres artesanais, banana da terra, cebola caramelizada, cheddar, mussarela.", 30],
  ["ART-008", "Lanches", "Hambúrgueres Artesanais", "Caribe", "Caribe", "Pão brioche, hambúrguer artesanal, molho barbecue, mucarela, abacaxi.", 25],
  ["POR-001", "Porções", "Porções", "Batata", "Batata Frita", "Batata frita.", 35],
  ["POR-002", "Porções", "Porções", "Calabresa", "Calabresa", "Calabresa.", 50],
  ["POR-003", "Porções", "Porções", "Mista", "Porção Mista", "Porção mista.", 60],
  ["POR-004", "Porções", "Porções", "Batata", "Batata Frita c/ Cheddar e Bacon", "Batata frita, cheddar e bacon.", 48],
] as const;

const pizzaProducts = [
  ["PIZ-S-001", "Salgadas", "Tradicional", "Tradicional", "Presunto, mucarela, tomate, milho, calabresa, azeitona, cebola e orégano.", 42, 50, 60, "salgada"],
  ["PIZ-S-002", "Salgadas", "Moda Alvorada", "Moda Alvorada", "Mucarela, presunto, lombo canadense, tomate, azeitona, palmito, cebola e orégano.", 42, 50, 60, "salgada"],
  ["PIZ-S-003", "Salgadas", "Lombo", "Lombo Canadense", "Mucarela, catupiry, lombo canadense, azeitona, cebola e orégano.", 49, 57, 67, "salgada"],
  ["PIZ-S-004", "Salgadas", "Calabresa", "Calabresa", "Presunto, mucarela, calabresa, cebola e orégano.", 42, 50, 60, "salgada"],
  ["PIZ-S-005", "Salgadas", "Frango", "Frango", "Frango desfiado, mucarela, tomate, cebola e orégano.", 42, 50, 60, "salgada"],
  ["PIZ-S-006", "Salgadas", "Frango", "Frango com Palmito", "Frango desfiado, mucarela, palmito, tomate, cebola e orégano.", 47, 55, 65, "salgada"],
  ["PIZ-S-007", "Salgadas", "Frango", "Frango com Catupiry", "Frango desfiado, catupiry, mucarela, tomate, cebola e orégano.", 47, 55, 65, "salgada"],
  ["PIZ-S-008", "Salgadas", "Strogonoff", "Strogonoff de Filé Mignon", "Strogonoff, mucarela e batata palha.", 45, 57, 67, "salgada"],
  ["PIZ-S-009", "Salgadas", "Quatro Queijos", "Quatro Queijos", "Mucarela, catupiry, parmesão, provolone.", 45, 55, 65, "salgada"],
  ["PIZ-S-010", "Salgadas", "Portuguesa", "Portuguesa", "Presunto, mucarela, tomate, ovos, azeitona, cebola e orégano.", 42, 50, 60, "salgada"],
  ["PIZ-S-011", "Salgadas", "Especial", "Mediterrânea", "Calabresa ralada, catupiry, mucarela, champignon, palmito, cebola e orégano.", 52, 60, 70, "salgada"],
  ["PIZ-D-001", "Doces", "Banana", "Banana e Doce de Leite", "Mucarela, banana, doce de leite e canela.", 50, 60, 70, "doce"],
  ["PIZ-D-002", "Doces", "Frutas", "Californiana", "Mucarela, pêssego em calda, abacaxi em calda, figo em calda, creme de leite.", 50, 60, 70, "doce"],
  ["PIZ-D-003", "Doces", "Chocolate", "Dois Amores", "Mucarela, chocolate ao leite, chocolate branco, creme de leite.", 50, 60, 70, "doce"],
] as const;

const caldoProducts = [
  ["CAL-001", "Carne", "Caldo de Carne", "Caldo de carne.", [["300ML", "300 ml", 18], ["500ML", "500 ml", 23]]],
  ["CAL-002", "Frango", "Caldo de Frango", "Caldo de frango.", [["300ML", "300 ml", 18], ["500ML", "500 ml", 23]]],
] as const;

const sucoProducts = [
  ["SUC-001", "Acerola", "Suco de Acerola", "Natural. Água ou leite.", [["COPO-AGUA", "Copo com água", 8, "agua"], ["COPO-LEITE", "Copo com leite", 10, "leite"], ["JARRA-AGUA", "Jarra com água", 16, "agua"], ["JARRA-LEITE", "Jarra com leite", 18, "leite"]]],
  ["SUC-002", "Abacaxi", "Suco de Abacaxi", "Natural. Água ou leite.", [["COPO-AGUA", "Copo com água", 8, "agua"], ["COPO-LEITE", "Copo com leite", 10, "leite"], ["JARRA-AGUA", "Jarra com água", 16, "agua"], ["JARRA-LEITE", "Jarra com leite", 18, "leite"]]],
  ["SUC-003", "Cupuaçu", "Suco de Cupuaçu", "Natural. Água ou leite.", [["COPO-AGUA", "Copo com água", 8, "agua"], ["COPO-LEITE", "Copo com leite", 10, "leite"], ["JARRA-AGUA", "Jarra com água", 16, "agua"], ["JARRA-LEITE", "Jarra com leite", 18, "leite"]]],
  ["SUC-004", "Goiaba", "Suco de Goiaba", "Natural. Água ou leite.", [["COPO-AGUA", "Copo com água", 8, "agua"], ["COPO-LEITE", "Copo com leite", 10, "leite"], ["JARRA-AGUA", "Jarra com água", 16, "agua"], ["JARRA-LEITE", "Jarra com leite", 18, "leite"]]],
  ["SUC-005", "Maracujá", "Suco de Maracujá", "Natural. Água ou leite.", [["COPO-AGUA", "Copo com água", 10, "agua"], ["COPO-LEITE", "Copo com leite", 12, "leite"], ["JARRA-AGUA", "Jarra com água", 18, "agua"], ["JARRA-LEITE", "Jarra com leite", 20, "leite"]]],
  ["SUC-006", "Morango", "Suco de Morango", "Natural. Água ou leite.", [["COPO-AGUA", "Copo com água", 10, "agua"], ["COPO-LEITE", "Copo com leite", 12, "leite"], ["JARRA-AGUA", "Jarra com água", 18, "agua"], ["JARRA-LEITE", "Jarra com leite", 20, "leite"]]],
  ["SUC-007", "Laranja", "Suco de Laranja", "Natural.", [["COPO", "Copo", 10, undefined], ["JARRA", "Jarra", 20, undefined]]],
  ["SUC-008", "Laranja", "Suco de Laranja com Leite Condensado", "Natural. Leite condensado.", [["COPO", "Copo", 12, undefined], ["JARRA", "Jarra", 22, undefined]]],
] as const;

const bebidaProducts = [
  ["BEB-001", "Refrigerantes", "Coca-Cola", "Coca-Cola.", [["LATA", "Lata", 6, "confirmado"], ["600ML", "600 ml", undefined, "pendente"], ["1L", "1 litro", undefined, "pendente"], ["2L", "2 litros", 15, "confirmado"]]],
  ["BEB-002", "Refrigerantes", "Fanta", "Fanta.", [["LATA", "Lata", 6, "confirmado"], ["600ML", "600 ml", 8, "confirmado"], ["1L", "1 litro", 11, "confirmado"], ["2L", "2 litros", 15, "confirmado"]]],
  ["BEB-003", "Refrigerantes", "Tuchaua", "Tuchaua.", [["LATA", "Lata", 6, "confirmado"], ["600ML", "600 ml", 8, "confirmado"], ["1L", "1 litro", 11, "confirmado"], ["2L", "2 litros", 10, "aguardando_confirmacao"]]],
  ["BEB-004", "Água Mineral", "Água Mineral", "Água mineral.", [["SEM-GAS", "Sem gás", 4, "confirmado"], ["COM-GAS", "Com gás", 5, "confirmado"]]],
] as const;

const cervejaProducts = [
  ["CER-001", "Cervejas", "Skol", "Skol.", [["LATA", "Lata", 5], ["600ML", "600 ml", 12]]],
  ["CER-002", "Cervejas", "Brahma", "Brahma.", [["LATA", "Lata", 5], ["600ML", "600 ml", 12]]],
  ["CER-003", "Cervejas", "Original", "Original.", [["LATA", "Lata", 5], ["600ML", "600 ml", 13]]],
] as const;

function documentKey(kind: "PRODUCT" | "OPTION" | "COMPLEMENT-GROUP" | "COMPLEMENT" | "UPGRADE", id: string) {
  return `CATALOG-ALVORADA:${kind}:${id}`;
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function categoryCodeForName(name: string) {
  if (name === "Pizzas") return "PIZZAS";
  if (name === "Bebidas") return "BEBIDAS";
  if (name === "Porções") return "PORCOES";
  if (name === "Caldos") return "CALDOS";
  return "LANCHES";
}

const simpleProductSeeds: AlvoradaProductSeed[] = simpleProducts.map(
  ([id, category, subcategory, family, name, description, price], index) => ({
    documentalId: id,
    documentKey: documentKey("PRODUCT", id),
    categoryCode: categoryCodeForName(category),
    subcategory,
    family,
    name,
    slug: slugify(name),
    shortDescription: description,
    origin: "produzido",
    basePrice: price,
    priceStatus: "confirmado",
    active: true,
    featured: id === "LAN-016" || id === "ART-002" || id === "POR-004",
    displayOrder: index + 1,
    migrationStatus:
      id === "POR-003" ? "aplicado_com_pendencias" : "aplicado",
    pendingReason:
      id === "POR-003"
        ? "Composição da porção mista pendente na fonte."
        : undefined,
  }),
);

const pizzaProductSeeds: AlvoradaProductSeed[] = pizzaProducts.map(
  ([id, subcategory, family, name, description], index) => ({
    documentalId: id,
    documentKey: documentKey("PRODUCT", id),
    categoryCode: "PIZZAS",
    subcategory,
    family,
    name,
    slug: slugify(`pizza-${name}`),
    shortDescription: description,
    origin: "produzido",
    active: true,
    featured: id === "PIZ-S-004" || id === "PIZ-S-007",
    displayOrder: index + 1,
    migrationStatus:
      id === "PIZ-S-008" ? "aplicado_com_pendencias" : "aplicado",
    pendingReason:
      id === "PIZ-S-008" ? "Confirmar grafia operacional de Filé Mignon." : undefined,
  }),
);

const caldoProductSeeds: AlvoradaProductSeed[] = caldoProducts.map(
  ([id, family, name, description], index) => ({
    documentalId: id,
    documentKey: documentKey("PRODUCT", id),
    categoryCode: "CALDOS",
    subcategory: "Caldos",
    family,
    name,
    slug: slugify(name),
    shortDescription: description,
    origin: "produzido",
    active: true,
    displayOrder: index + 1,
    migrationStatus: "aplicado",
  }),
);

const sucoProductSeeds: AlvoradaProductSeed[] = sucoProducts.map(
  ([id, family, name, description], index) => ({
    documentalId: id,
    documentKey: documentKey("PRODUCT", id),
    categoryCode: "BEBIDAS",
    subcategory: "Sucos",
    family,
    name,
    slug: slugify(name),
    shortDescription: description,
    origin: "produzido",
    active: true,
    displayOrder: 100 + index,
    migrationStatus:
      id === "SUC-007" || id === "SUC-008"
        ? "aplicado_com_pendencias"
        : "aplicado",
    pendingReason:
      id === "SUC-007"
        ? "Confirmar se não existem opções água/leite para laranja."
        : id === "SUC-008"
          ? "Confirmar composição final e classificação."
          : undefined,
  }),
);

const bebidaProductSeeds: AlvoradaProductSeed[] = bebidaProducts.map(
  ([id, subcategory, name, description], index) => ({
    documentalId: id,
    documentKey: documentKey("PRODUCT", id),
    categoryCode: "BEBIDAS",
    subcategory,
    family: name,
    name,
    slug: slugify(name),
    shortDescription: description,
    origin: "revendido",
    active: true,
    displayOrder: 200 + index,
    migrationStatus:
      id === "BEB-001" || id === "BEB-003"
        ? "aplicado_com_pendencias"
        : "aplicado",
    pendingReason:
      id === "BEB-001"
        ? "Preços de 600 ml e 1 litro pendentes."
        : id === "BEB-003"
          ? "Preço de 2 litros aguardando confirmação."
          : undefined,
  }),
);

const cervejaProductSeeds: AlvoradaProductSeed[] = cervejaProducts.map(
  ([id, family, name, description], index) => ({
    documentalId: id,
    documentKey: documentKey("PRODUCT", id),
    categoryCode: "BEBIDAS",
    subcategory: "Cervejas",
    family,
    name,
    slug: slugify(name),
    shortDescription: description,
    origin: "revendido",
    active: true,
    displayOrder: 300 + index,
    migrationStatus: "aplicado",
  }),
);

export const alvoradaProducts: AlvoradaProductSeed[] = [
  ...simpleProductSeeds,
  ...pizzaProductSeeds,
  ...caldoProductSeeds,
  ...sucoProductSeeds,
  ...bebidaProductSeeds,
  ...cervejaProductSeeds,
];

export const alvoradaProductOptions: AlvoradaOptionSeed[] = [
  ...pizzaProducts.flatMap(([id, , , , , p, m, g]) =>
    [
      ["P", "P", p, 1],
      ["M", "M", m, 2],
      ["G", "G", g, 3],
    ].map(([code, label, price, order]) => ({
      productDocumentalId: id,
      documentKey: documentKey("OPTION", `${id}:${code}`),
      code: String(code),
      label: String(label),
      optionType: "pizza_tamanho" as OptionType,
      price: Number(price),
      priceStatus: "confirmado" as PriceStatus,
      active: true,
      sellable: true,
      required: true,
      displayOrder: Number(order),
      metadata: { size: code as "P" | "M" | "G" },
    })),
  ),
  ...caldoProducts.flatMap(([id, , , , options]) =>
    options.map(([code, label, price], index) => ({
      productDocumentalId: id,
      documentKey: documentKey("OPTION", `${id}:${code}`),
      code,
      label,
      optionType: "volume" as OptionType,
      price,
      priceStatus: "confirmado" as PriceStatus,
      active: true,
      sellable: true,
      required: true,
      displayOrder: index + 1,
      metadata: { volumeMl: code === "300ML" ? 300 : 500 },
    })),
  ),
  ...sucoProducts.flatMap(([id, , , , options]) =>
    options.map(([code, label, price, liquidBase], index) => ({
      productDocumentalId: id,
      documentKey: documentKey("OPTION", `${id}:${code}`),
      code,
      label,
      optionType: "combinacao_suco" as OptionType,
      price,
      priceStatus: "confirmado" as PriceStatus,
      active: true,
      sellable: true,
      required: true,
      displayOrder: index + 1,
      metadata: {
        ...(liquidBase ? { liquidBase: liquidBase as "agua" | "leite" } : {}),
        displayHint: label,
      },
    })),
  ),
  ...bebidaProducts.flatMap(([id, , , , options]) =>
    options.map(([code, label, price, status], index) => ({
      productDocumentalId: id,
      documentKey: documentKey("OPTION", `${id}:${code}`),
      code,
      label,
      optionType: id === "BEB-004" ? ("embalagem" as OptionType) : ("embalagem" as OptionType),
      price,
      priceStatus: status as PriceStatus,
      active: true,
      sellable: status === "confirmado",
      required: true,
      displayOrder: index + 1,
      metadata: { packageType: label },
      pendingReason:
        status === "pendente"
          ? "Preço pendente de validação; opção não vendável."
          : status === "aguardando_confirmacao"
            ? "Preço aguardando confirmação; opção não vendável."
            : undefined,
    })),
  ),
  ...cervejaProducts.flatMap(([id, , , , options]) =>
    options.map(([code, label, price], index) => ({
      productDocumentalId: id,
      documentKey: documentKey("OPTION", `${id}:${code}`),
      code,
      label,
      optionType: "embalagem" as OptionType,
      price,
      priceStatus: "confirmado" as PriceStatus,
      active: true,
      sellable: true,
      required: true,
      displayOrder: index + 1,
      metadata: { packageType: label },
    })),
  ),
];

export const alvoradaPizzaConfigurations: AlvoradaPizzaConfigurationSeed[] =
  pizzaProducts.map(([id, , , , , , , , kind]) => ({
    productDocumentalId: id,
    pizzaKind: kind as PizzaKind,
    allowedSizes: ["P", "M", "G"],
    maxFlavorsBySize: { P: 1, M: 2, G: 2 },
    secondFlavorAllowed: true,
    pricingPolicy: "media_arredondada_050",
    active: true,
  }));

export const alvoradaComplementGroups: AlvoradaComplementGroupSeed[] = [
  {
    documentKey: documentKey("COMPLEMENT-GROUP", "ADD-ART-001"),
    name: "Adicionais dos artesanais",
    description:
      "Grupo confirmado no documento, com vínculos individuais pendentes.",
    minSelections: 0,
    maxSelections: 3,
    required: false,
    active: true,
    displayOrder: 1,
  },
];

export const alvoradaComplementItems: AlvoradaComplementItemSeed[] = [
  {
    groupDocumentKey: documentKey("COMPLEMENT-GROUP", "ADD-ART-001"),
    documentKey: documentKey("COMPLEMENT", "ADD-ART-HAMBURGUER"),
    name: "Hambúrguer",
    price: 6,
    priceStatus: "confirmado",
    active: true,
    sellable: true,
    displayOrder: 1,
  },
  {
    groupDocumentKey: documentKey("COMPLEMENT-GROUP", "ADD-ART-001"),
    documentKey: documentKey("COMPLEMENT", "ADD-ART-MUCARELA"),
    name: "Mucarela",
    price: 6,
    priceStatus: "confirmado",
    active: true,
    sellable: true,
    displayOrder: 2,
  },
  {
    groupDocumentKey: documentKey("COMPLEMENT-GROUP", "ADD-ART-001"),
    documentKey: documentKey("COMPLEMENT", "ADD-ART-BACON"),
    name: "Bacon",
    price: 6,
    priceStatus: "confirmado",
    active: true,
    sellable: true,
    displayOrder: 3,
  },
];

export const alvoradaCommercialUpgrades: AlvoradaUpgradeSeed[] = [
  {
    documentKey: documentKey("UPGRADE", "UPG-ART-001"),
    name: "+100 g de batata",
    description:
      "Upgrade comercial documentado, pendente de modelagem operacional.",
    priceStatus: "pendente",
    operationalStatus: "pendente_modelagem",
    active: false,
    displayOrder: 1,
  },
];

export const alvoradaUpgradeLinks: AlvoradaUpgradeLinkSeed[] = [
  {
    productDocumentalId: "ART-001",
    upgradeDocumentKey: documentKey("UPGRADE", "UPG-ART-001"),
    active: false,
    displayOrder: 1,
    rules: {
      documentedFinalPrice: "30,00",
      status: "pendente_modelagem_operacional",
    },
  },
  {
    productDocumentalId: "ART-008",
    upgradeDocumentKey: documentKey("UPGRADE", "UPG-ART-001"),
    active: false,
    displayOrder: 1,
    rules: {
      documentedFinalPrice: "35,00",
      status: "pendente_modelagem_operacional",
    },
  },
];

export const expectedSourceCounts = {
  products: 59,
  productOptions: 94,
  complementItemsSellable: 3,
  commercialUpgradesPending: 1,
  sourceDocumentMentionsOptions: 94,
  requestMentionsOptionsOrVariations: 98,
};
