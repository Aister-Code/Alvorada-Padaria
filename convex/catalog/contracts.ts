import { v } from "convex/values";

export const CATALOG_DOCUMENT_VERSION = "CATALOG-INSTANCE-ALVORADA-001";
export const CATALOG_CONTRACT_VERSION = "catalog-contract-v1";
export const CATALOG_CART_CONTRACT_VERSION = "catalog-cart-v1";
export const CATALOG_CONVERSION_SNAPSHOT_VERSION = "catalog-conversion-snapshot-v1";

export const productOriginValidator = v.union(
  v.literal("produzido"),
  v.literal("revendido"),
  v.literal("misto"),
);

export const priceStatusValidator = v.union(
  v.literal("confirmado"),
  v.literal("pendente"),
  v.literal("aguardando_confirmacao"),
);

export const imageOriginValidator = v.union(
  v.literal("propria"),
  v.literal("oficial_fabricante"),
  v.literal("generica"),
  v.literal("placeholder"),
);

export const imageStatusValidator = v.union(
  v.literal("aprovada"),
  v.literal("provisoria"),
  v.literal("substituir"),
);

export const upgradeOperationalStatusValidator = v.union(
  v.literal("pendente_modelagem"),
  v.literal("inativo"),
  v.literal("ativo"),
);

export const pizzaKindValidator = v.union(v.literal("salgada"), v.literal("doce"));

export const pizzaPricingPolicyValidator = v.literal("pendente_validacao");

export const catalogMigrationStatusValidator = v.union(
  v.literal("dry_run"),
  v.literal("pronto_para_aplicar"),
  v.literal("aplicado"),
  v.literal("aplicado_com_pendencias"),
  v.literal("rollback_necessario"),
);

export const catalogContractVersionValidator = v.literal(CATALOG_CONTRACT_VERSION);
export const cartContractVersionValidator = v.literal(CATALOG_CART_CONTRACT_VERSION);
export const conversionSnapshotVersionValidator = v.literal(CATALOG_CONVERSION_SNAPSHOT_VERSION);

export const priceComponentValidator = v.object({
  kind: v.union(
    v.literal("produto"),
    v.literal("opcao"),
    v.literal("complemento"),
    v.literal("upgrade"),
    v.literal("ajuste"),
  ),
  label: v.string(),
  amount: v.optional(v.number()),
  priceStatus: priceStatusValidator,
  documentKey: v.optional(v.string()),
});

export const catalogProductSnapshotValidator = v.object({
  productId: v.optional(v.id("products")),
  productDocumentKey: v.string(),
  productNameSnapshot: v.string(),
  productDescriptionSnapshot: v.optional(v.string()),
  categoryId: v.optional(v.id("categories")),
  categoryDocumentKey: v.optional(v.string()),
  categoryNameSnapshot: v.optional(v.string()),
  subcategorySnapshot: v.optional(v.string()),
  familySnapshot: v.optional(v.string()),
  productOriginSnapshot: productOriginValidator,
  productionSectorSnapshot: v.optional(v.string()),
  documentVersion: v.optional(v.string()),
});

export const selectedOptionSnapshotValidator = v.object({
  optionId: v.optional(v.id("productOptions")),
  optionDocumentKey: v.optional(v.string()),
  code: v.optional(v.string()),
  label: v.string(),
  optionType: v.string(),
  price: v.optional(v.number()),
  priceStatus: priceStatusValidator,
  metadata: v.optional(v.record(v.string(), v.string())),
});

export const pizzaConfigurationSnapshotValidator = v.object({
  size: v.union(v.literal("P"), v.literal("M"), v.literal("G")),
  firstFlavorProductId: v.optional(v.id("products")),
  firstFlavorDocumentKey: v.string(),
  firstFlavorNameSnapshot: v.string(),
  secondFlavorProductId: v.optional(v.id("products")),
  secondFlavorDocumentKey: v.optional(v.string()),
  secondFlavorNameSnapshot: v.optional(v.string()),
  maxFlavorsForSize: v.number(),
  pricingPolicy: pizzaPricingPolicyValidator,
  priceStatus: priceStatusValidator,
});

export const complementSnapshotValidator = v.object({
  groupId: v.optional(v.id("complementGroups")),
  groupDocumentKey: v.optional(v.string()),
  groupNameSnapshot: v.string(),
  itemId: v.optional(v.id("complementItems")),
  itemDocumentKey: v.optional(v.string()),
  itemNameSnapshot: v.string(),
  quantity: v.number(),
  unitPrice: v.optional(v.number()),
  priceStatus: priceStatusValidator,
  total: v.optional(v.number()),
});

export const upgradeSnapshotValidator = v.object({
  upgradeId: v.optional(v.id("commercialUpgrades")),
  upgradeDocumentKey: v.string(),
  nameSnapshot: v.string(),
  price: v.optional(v.number()),
  priceStatus: priceStatusValidator,
  operationalStatus: upgradeOperationalStatusValidator,
});

export const imagePresentationSnapshotValidator = v.object({
  imageId: v.optional(v.id("productImages")),
  imageDocumentKey: v.optional(v.string()),
  assetReference: v.optional(v.string()),
  storageId: v.optional(v.string()),
  externalUrl: v.optional(v.string()),
  origin: imageOriginValidator,
  status: imageStatusValidator,
  altText: v.string(),
});

export const cartItemContractValidator = v.object({
  contractVersion: cartContractVersionValidator,
  cartItemId: v.string(),
  productId: v.optional(v.id("products")),
  productDocumentKey: v.string(),
  productNameSnapshot: v.string(),
  productOriginSnapshot: productOriginValidator,
  quantity: v.number(),
  selectedOption: v.optional(selectedOptionSnapshotValidator),
  pizzaConfiguration: v.optional(pizzaConfigurationSnapshotValidator),
  complements: v.optional(v.array(complementSnapshotValidator)),
  upgrade: v.optional(upgradeSnapshotValidator),
  customerNote: v.optional(v.string()),
  unitPrice: v.optional(v.number()),
  priceComponents: v.optional(v.array(priceComponentValidator)),
  itemTotal: v.optional(v.number()),
  imagePresentation: v.optional(imagePresentationSnapshotValidator),
  createdAt: v.string(),
  updatedAt: v.string(),
});

export const catalogCartContractValidator = v.object({
  contractVersion: cartContractVersionValidator,
  unit: v.string(),
  items: v.array(cartItemContractValidator),
  quantityItems: v.number(),
  estimatedTotal: v.optional(v.number()),
  updatedAt: v.string(),
});

export const conversionSnapshotValidator = v.object({
  snapshotVersion: conversionSnapshotVersionValidator,
  cartContractVersion: cartContractVersionValidator,
  unit: v.string(),
  sessionId: v.optional(v.id("sessoesCatalogo")),
  customerSnapshot: v.optional(v.string()),
  items: v.array(cartItemContractValidator),
  quantityItems: v.number(),
  estimatedTotal: v.optional(v.number()),
  convertedAt: v.string(),
  convertedBy: v.optional(v.string()),
});

export type ProductOrigin = "produzido" | "revendido" | "misto";
export type PriceStatus = "confirmado" | "pendente" | "aguardando_confirmacao";
export type ImageOrigin = "propria" | "oficial_fabricante" | "generica" | "placeholder";
export type ImageStatus = "aprovada" | "provisoria" | "substituir";
export type UpgradeOperationalStatus = "pendente_modelagem" | "inativo" | "ativo";
export type PizzaKind = "salgada" | "doce";
export type PizzaPricingPolicy = "pendente_validacao";
export type CatalogContractVersion = typeof CATALOG_CONTRACT_VERSION;
export type CartContractVersion = typeof CATALOG_CART_CONTRACT_VERSION;
export type ConversionSnapshotVersion = typeof CATALOG_CONVERSION_SNAPSHOT_VERSION;
