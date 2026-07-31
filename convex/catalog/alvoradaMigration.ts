import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import {
  ALVORADA_DOCUMENT_VERSION,
  ALVORADA_MIGRATION_ACTOR,
  alvoradaCategories,
  alvoradaCommercialUpgrades,
  alvoradaComplementGroups,
  alvoradaComplementItems,
  alvoradaPizzaConfigurations,
  alvoradaProductOptions,
  alvoradaProducts,
  alvoradaUpgradeLinks,
  expectedSourceCounts,
  type AlvoradaCategorySeed,
  type AlvoradaComplementGroupSeed,
  type AlvoradaComplementItemSeed,
  type AlvoradaOptionSeed,
  type AlvoradaPizzaConfigurationSeed,
  type AlvoradaProductSeed,
  type AlvoradaUpgradeLinkSeed,
  type AlvoradaUpgradeSeed,
} from "./alvoradaCatalogData";
import {
  CATALOG_CONTRACT_VERSION,
  CATALOG_DOCUMENT_VERSION,
} from "./contracts";

type CatalogCtx = QueryCtx | MutationCtx;
type Operation = "create" | "update" | "skip" | "pending" | "conflict";
type Entity =
  | "category"
  | "product"
  | "productOption"
  | "pizzaConfiguration"
  | "complementGroup"
  | "complementItem"
  | "commercialUpgrade"
  | "productUpgrade"
  | "preserved";

type ReconciliationEntry = {
  entity: Entity;
  source: string;
  current: string;
  action: Operation;
  finalState: string;
  note?: string;
};

type MigrationSummary = {
  dryRun: boolean;
  source: {
    products: number;
    productOptions: number;
    complementItemsSellable: number;
    commercialUpgradesPending: number;
    sourceDocumentMentionsOptions: number;
    requestMentionsOptionsOrVariations: number;
  };
  counts: Record<Entity, Record<Operation, number>>;
  totals: {
    sourceProducts: number;
    sourceProductOptions: number;
    sourceProductsAppliedOrUpdated: number;
    sourceProductOptionsAppliedOrUpdated: number;
    pendingEntries: number;
    conflicts: number;
    preservedPreviousProducts: number;
    finalProducts?: number;
    finalOptions?: number;
  };
  pending: ReconciliationEntry[];
  conflicts: ReconciliationEntry[];
  preserved: ReconciliationEntry[];
  matrix: ReconciliationEntry[];
};

const nowIso = () => new Date().toISOString();

function normalize(value: string | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function isMutationCtx(ctx: CatalogCtx): ctx is MutationCtx {
  return "patch" in ctx.db;
}

function record(
  matrix: ReconciliationEntry[],
  entry: ReconciliationEntry,
) {
  matrix.push(entry);
}

function createEmptyCounts(): MigrationSummary["counts"] {
  const entities: Entity[] = [
    "category",
    "product",
    "productOption",
    "pizzaConfiguration",
    "complementGroup",
    "complementItem",
    "commercialUpgrade",
    "productUpgrade",
    "preserved",
  ];
  const operations: Operation[] = [
    "create",
    "update",
    "skip",
    "pending",
    "conflict",
  ];
  return Object.fromEntries(
    entities.map((entity) => [
      entity,
      Object.fromEntries(operations.map((operation) => [operation, 0])),
    ]),
  ) as MigrationSummary["counts"];
}

function summarize(
  matrix: ReconciliationEntry[],
  finalProducts?: number,
  finalOptions?: number,
): MigrationSummary {
  const counts = createEmptyCounts();
  for (const entry of matrix) counts[entry.entity][entry.action] += 1;
  const pending = matrix.filter((entry) => entry.action === "pending");
  const conflicts = matrix.filter((entry) => entry.action === "conflict");
  const preserved = matrix.filter((entry) => entry.entity === "preserved");

  return {
    dryRun: true,
    source: expectedSourceCounts,
    counts,
    totals: {
      sourceProducts: expectedSourceCounts.products,
      sourceProductOptions: expectedSourceCounts.productOptions,
      sourceProductsAppliedOrUpdated:
        counts.product.create +
        counts.product.update +
        counts.product.skip +
        counts.product.pending,
      sourceProductOptionsAppliedOrUpdated:
        counts.productOption.create +
        counts.productOption.update +
        counts.productOption.skip +
        counts.productOption.pending,
      pendingEntries: pending.length,
      conflicts: conflicts.length,
      preservedPreviousProducts: preserved.length,
      finalProducts,
      finalOptions,
    },
    pending,
    conflicts,
    preserved,
    matrix,
  };
}

function shallowChanged<T extends Record<string, unknown>>(
  current: Record<string, unknown>,
  patch: T,
) {
  const auditKeys = new Set(["createdAt", "createdBy", "updatedAt", "updatedBy", "version"]);
  return Object.entries(patch).some(([key, value]) => {
    if (auditKeys.has(key)) return false;
    const currentValue = current[key];
    return stableStringify(currentValue ?? null) !== stableStringify(value ?? null);
  });
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    const recordValue = value as Record<string, unknown>;
    return `{${Object.keys(recordValue)
      .filter((key) => recordValue[key] !== undefined)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(recordValue[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

async function getCategoryByDocumentKey(ctx: CatalogCtx, documentKey: string) {
  return await ctx.db
    .query("categories")
    .withIndex("by_document_key", (q) => q.eq("documentKey", documentKey))
    .first();
}

async function getProductByDocumentKey(ctx: CatalogCtx, documentKey: string) {
  return await ctx.db
    .query("products")
    .withIndex("by_document_key", (q) => q.eq("documentKey", documentKey))
    .first();
}

async function getProductByDocumentalId(
  ctx: CatalogCtx,
  documentalId: string,
) {
  return await ctx.db
    .query("products")
    .withIndex("by_documental_id", (q) => q.eq("documentalId", documentalId))
    .first();
}

async function getOptionByDocumentKey(ctx: CatalogCtx, documentKey: string) {
  return await ctx.db
    .query("productOptions")
    .withIndex("by_document_key", (q) => q.eq("documentKey", documentKey))
    .first();
}

async function getComplementGroupByDocumentKey(
  ctx: CatalogCtx,
  documentKey: string,
) {
  return await ctx.db
    .query("complementGroups")
    .withIndex("by_document_key", (q) => q.eq("documentKey", documentKey))
    .first();
}

async function getComplementItemByDocumentKey(
  ctx: CatalogCtx,
  documentKey: string,
) {
  return await ctx.db
    .query("complementItems")
    .withIndex("by_document_key", (q) => q.eq("documentKey", documentKey))
    .first();
}

async function getUpgradeByDocumentKey(ctx: CatalogCtx, documentKey: string) {
  return await ctx.db
    .query("commercialUpgrades")
    .withIndex("by_document_key", (q) => q.eq("documentKey", documentKey))
    .first();
}

async function findLegacyCategory(
  ctx: CatalogCtx,
  seed: AlvoradaCategorySeed,
) {
  const bySlug = await ctx.db
    .query("categories")
    .withIndex("by_slug", (q) => q.eq("slug", seed.slug))
    .first();
  if (bySlug) return bySlug;

  const aliases: Record<string, string[]> = {
    Lanches: ["lanches", "lanchonete"],
    Pizzas: ["pizzas", "pizzaria"],
    Bebidas: ["bebidas", "sucos", "cervejas"],
    Padaria: ["padaria"],
    "Porções": ["porcoes", "porcoes"],
    Caldos: ["caldos"],
    Conveniência: ["conveniencia"],
  };
  const normalizedAliases = new Set(
    (aliases[seed.name] ?? [seed.name]).map(normalize),
  );
  const all = await ctx.db.query("categories").collect();
  return (
    all.find((category) => normalizedAliases.has(normalize(category.name))) ??
    null
  );
}

async function findLegacyProduct(
  ctx: CatalogCtx,
  seed: AlvoradaProductSeed,
  categoryId: Id<"categories">,
) {
  const products = await ctx.db
    .query("products")
    .withIndex("by_category", (q) => q.eq("categoryId", categoryId))
    .collect();
  return (
    products.find((product) => normalize(product.name) === normalize(seed.name)) ??
    null
  );
}

async function upsertCategory(
  ctx: CatalogCtx,
  seed: AlvoradaCategorySeed,
  matrix: ReconciliationEntry[],
) {
  const existing =
    (await getCategoryByDocumentKey(ctx, seed.documentKey)) ??
    (await findLegacyCategory(ctx, seed));
  const patch = {
    name: seed.name,
    slug: seed.slug,
    icon: seed.icon,
    order: seed.displayOrder,
    active: seed.active,
    documentKey: seed.documentKey,
    code: seed.code,
    description: seed.description,
    displayOrder: seed.displayOrder,
    updatedAt: nowIso(),
    updatedBy: ALVORADA_MIGRATION_ACTOR,
    version: "1",
  };

  if (!existing) {
    record(matrix, {
      entity: "category",
      source: seed.documentKey,
      current: "ausente",
      action: "create",
      finalState: seed.active ? "ativa" : "inativa",
    });
    if (isMutationCtx(ctx)) {
      return await ctx.db.insert("categories", {
        ...patch,
        createdAt: patch.updatedAt,
        createdBy: ALVORADA_MIGRATION_ACTOR,
      });
    }
    return seed.documentKey as Id<"categories">;
  }

  const changed = shallowChanged(existing, patch);
  record(matrix, {
    entity: "category",
    source: seed.documentKey,
    current: existing.documentKey ? "documentKey existente" : "legado reconciliado",
    action: changed ? "update" : "skip",
    finalState: seed.active ? "ativa" : "inativa",
  });
  if (isMutationCtx(ctx) && changed) await ctx.db.patch(existing._id, patch);
  return existing._id;
}

function productPatch(seed: AlvoradaProductSeed, categoryId: Id<"categories">) {
  return {
    categoryId,
    name: seed.name,
    description: seed.shortDescription ?? "",
    active: seed.active,
    featured: seed.featured ?? false,
    documentKey: seed.documentKey,
    documentalId: seed.documentalId,
    slug: seed.slug,
    subcategory: seed.subcategory,
    family: seed.family,
    shortDescription: seed.shortDescription,
    origin: seed.origin,
    displayOrder: seed.displayOrder,
    basePrice: seed.basePrice,
    priceStatus: seed.priceStatus,
    migrationStatus: seed.migrationStatus,
    documentVersion: CATALOG_DOCUMENT_VERSION,
    updatedAt: nowIso(),
    updatedBy: ALVORADA_MIGRATION_ACTOR,
  };
}

async function upsertProduct(
  ctx: CatalogCtx,
  seed: AlvoradaProductSeed,
  categoryId: Id<"categories">,
  matrix: ReconciliationEntry[],
) {
  const existing =
    (await getProductByDocumentKey(ctx, seed.documentKey)) ??
    (await getProductByDocumentalId(ctx, seed.documentalId)) ??
    (await findLegacyProduct(ctx, seed, categoryId));
  const patch = productPatch(seed, categoryId);

  if (!existing) {
    record(matrix, {
      entity: "product",
      source: seed.documentKey,
      current: "ausente",
      action: seed.pendingReason ? "pending" : "create",
      finalState: seed.active ? "vendavel" : "bloqueado",
      note: seed.pendingReason,
    });
    if (isMutationCtx(ctx)) {
      return await ctx.db.insert("products", {
        ...patch,
        createdAt: patch.updatedAt,
        createdBy: ALVORADA_MIGRATION_ACTOR,
        version: "1",
      });
    }
    return seed.documentKey as Id<"products">;
  }

  const changed = shallowChanged(existing, patch);
  record(matrix, {
    entity: "product",
    source: seed.documentKey,
    current: existing.documentKey ? "documentKey existente" : "legado reconciliado",
    action: seed.pendingReason ? "pending" : changed ? "update" : "skip",
    finalState: seed.active ? "vendavel" : "bloqueado",
    note: seed.pendingReason,
  });
  if (isMutationCtx(ctx) && changed) await ctx.db.patch(existing._id, patch);
  return existing._id;
}

async function upsertOption(
  ctx: CatalogCtx,
  seed: AlvoradaOptionSeed,
  productId: Id<"products">,
  matrix: ReconciliationEntry[],
) {
  const byDocumentKey = await getOptionByDocumentKey(ctx, seed.documentKey);
  const byCode = (
    await ctx.db
      .query("productOptions")
      .withIndex("by_product_active_order", (q) => q.eq("productId", productId))
      .collect()
  ).find((option) => option.code === seed.code);
  const existing = byDocumentKey ?? byCode ?? null;
  const patch = {
    documentKey: seed.documentKey,
    productId,
    code: seed.code,
    label: seed.label,
    optionType: seed.optionType,
    price: seed.price,
    priceStatus: seed.priceStatus,
    active: seed.active,
    sellable: seed.sellable,
    required: seed.required,
    displayOrder: seed.displayOrder,
    metadata: seed.metadata,
    updatedAt: nowIso(),
    updatedBy: ALVORADA_MIGRATION_ACTOR,
    version: "1",
  };

  if (!existing) {
    record(matrix, {
      entity: "productOption",
      source: seed.documentKey,
      current: "ausente",
      action: seed.sellable ? "create" : "pending",
      finalState: seed.sellable ? "vendavel" : "bloqueada",
      note: seed.pendingReason,
    });
    if (isMutationCtx(ctx)) {
      return await ctx.db.insert("productOptions", {
        ...patch,
        createdAt: patch.updatedAt,
        createdBy: ALVORADA_MIGRATION_ACTOR,
      });
    }
    return null;
  }

  const changed = shallowChanged(existing, patch);
  record(matrix, {
    entity: "productOption",
    source: seed.documentKey,
    current: existing.documentKey ? "documentKey existente" : "codigo legado reconciliado",
    action: seed.sellable ? (changed ? "update" : "skip") : "pending",
    finalState: seed.sellable ? "vendavel" : "bloqueada",
    note: seed.pendingReason,
  });
  if (isMutationCtx(ctx) && changed) await ctx.db.patch(existing._id, patch);
  return existing._id;
}

async function upsertPizzaConfiguration(
  ctx: CatalogCtx,
  seed: AlvoradaPizzaConfigurationSeed,
  productId: Id<"products">,
  matrix: ReconciliationEntry[],
) {
  const existing = await ctx.db
    .query("pizzaConfigurations")
    .withIndex("by_product", (q) => q.eq("productId", productId))
    .first();
  const patch = {
    productId,
    pizzaKind: seed.pizzaKind,
    allowedSizes: seed.allowedSizes,
    maxFlavorsBySize: seed.maxFlavorsBySize,
    secondFlavorAllowed: seed.secondFlavorAllowed,
    pricingPolicy: seed.pricingPolicy,
    active: seed.active,
    updatedAt: nowIso(),
    updatedBy: ALVORADA_MIGRATION_ACTOR,
    version: "1",
  };
  const source = `PIZZA-CONFIG:${seed.productDocumentalId}`;

  if (!existing) {
    record(matrix, {
      entity: "pizzaConfiguration",
      source,
      current: "ausente",
      action: "create",
      finalState: "media_arredondada_050",
    });
    if (isMutationCtx(ctx)) {
      return await ctx.db.insert("pizzaConfigurations", {
        ...patch,
        createdAt: patch.updatedAt,
        createdBy: ALVORADA_MIGRATION_ACTOR,
      });
    }
    return null;
  }

  const changed = shallowChanged(existing, patch);
  record(matrix, {
    entity: "pizzaConfiguration",
    source,
    current: "existente",
    action: changed ? "update" : "skip",
    finalState: "media_arredondada_050",
  });
  if (isMutationCtx(ctx) && changed) await ctx.db.patch(existing._id, patch);
  return existing._id;
}

async function upsertComplementGroup(
  ctx: CatalogCtx,
  seed: AlvoradaComplementGroupSeed,
  matrix: ReconciliationEntry[],
) {
  const existing = await getComplementGroupByDocumentKey(ctx, seed.documentKey);
  const patch = {
    documentKey: seed.documentKey,
    name: seed.name,
    description: seed.description,
    minSelections: seed.minSelections,
    maxSelections: seed.maxSelections,
    required: seed.required,
    active: seed.active,
    displayOrder: seed.displayOrder,
    updatedAt: nowIso(),
    updatedBy: ALVORADA_MIGRATION_ACTOR,
    version: "1",
  };
  if (!existing) {
    record(matrix, {
      entity: "complementGroup",
      source: seed.documentKey,
      current: "ausente",
      action: "create",
      finalState: "estrutura criada sem vinculos operacionais amplos",
      note: "Aplicacao a todos os artesanais permanece pendente de confirmacao.",
    });
    if (isMutationCtx(ctx)) {
      return await ctx.db.insert("complementGroups", {
        ...patch,
        createdAt: patch.updatedAt,
        createdBy: ALVORADA_MIGRATION_ACTOR,
      });
    }
    return seed.documentKey as Id<"complementGroups">;
  }
  const changed = shallowChanged(existing, patch);
  record(matrix, {
    entity: "complementGroup",
    source: seed.documentKey,
    current: "existente",
    action: changed ? "update" : "skip",
    finalState: "estrutura criada sem vinculos operacionais amplos",
    note: "Aplicacao a todos os artesanais permanece pendente de confirmacao.",
  });
  if (isMutationCtx(ctx) && changed) await ctx.db.patch(existing._id, patch);
  return existing._id;
}

async function upsertComplementItem(
  ctx: CatalogCtx,
  seed: AlvoradaComplementItemSeed,
  groupId: Id<"complementGroups">,
  matrix: ReconciliationEntry[],
) {
  const existing = await getComplementItemByDocumentKey(ctx, seed.documentKey);
  const patch = {
    documentKey: seed.documentKey,
    groupId,
    name: seed.name,
    price: seed.price,
    priceStatus: seed.priceStatus,
    active: seed.active,
    sellable: seed.sellable,
    displayOrder: seed.displayOrder,
    metadata: seed.metadata,
    updatedAt: nowIso(),
    updatedBy: ALVORADA_MIGRATION_ACTOR,
    version: "1",
  };
  if (!existing) {
    record(matrix, {
      entity: "complementItem",
      source: seed.documentKey,
      current: "ausente",
      action: "create",
      finalState: "preco confirmado; sem vinculo amplo aplicado",
    });
    if (isMutationCtx(ctx)) {
      return await ctx.db.insert("complementItems", {
        ...patch,
        createdAt: patch.updatedAt,
        createdBy: ALVORADA_MIGRATION_ACTOR,
      });
    }
    return null;
  }
  const changed = shallowChanged(existing, patch);
  record(matrix, {
    entity: "complementItem",
    source: seed.documentKey,
    current: "existente",
    action: changed ? "update" : "skip",
    finalState: "preco confirmado; sem vinculo amplo aplicado",
  });
  if (isMutationCtx(ctx) && changed) await ctx.db.patch(existing._id, patch);
  return existing._id;
}

async function upsertUpgrade(
  ctx: CatalogCtx,
  seed: AlvoradaUpgradeSeed,
  matrix: ReconciliationEntry[],
) {
  const existing = await getUpgradeByDocumentKey(ctx, seed.documentKey);
  const patch = {
    documentKey: seed.documentKey,
    name: seed.name,
    description: seed.description,
    price: seed.price,
    priceStatus: seed.priceStatus,
    operationalStatus: seed.operationalStatus,
    active: seed.active,
    displayOrder: seed.displayOrder,
    updatedAt: nowIso(),
    updatedBy: ALVORADA_MIGRATION_ACTOR,
    version: "1",
  };
  if (!existing) {
    record(matrix, {
      entity: "commercialUpgrade",
      source: seed.documentKey,
      current: "ausente",
      action: "pending",
      finalState: "pendente_modelagem; inativo",
      note: "Upgrade +100 g de batata nao fica vendavel ate decisao operacional.",
    });
    if (isMutationCtx(ctx)) {
      return await ctx.db.insert("commercialUpgrades", {
        ...patch,
        createdAt: patch.updatedAt,
        createdBy: ALVORADA_MIGRATION_ACTOR,
      });
    }
    return seed.documentKey as Id<"commercialUpgrades">;
  }
  const changed = shallowChanged(existing, patch);
  record(matrix, {
    entity: "commercialUpgrade",
    source: seed.documentKey,
    current: "existente",
    action: "pending",
    finalState: "pendente_modelagem; inativo",
    note: "Upgrade +100 g de batata nao fica vendavel ate decisao operacional.",
  });
  if (isMutationCtx(ctx) && changed) await ctx.db.patch(existing._id, patch);
  return existing._id;
}

async function upsertUpgradeLink(
  ctx: CatalogCtx,
  seed: AlvoradaUpgradeLinkSeed,
  productId: Id<"products">,
  upgradeId: Id<"commercialUpgrades">,
  matrix: ReconciliationEntry[],
) {
  const existing = (
    await ctx.db
      .query("productUpgrades")
      .withIndex("by_product", (q) => q.eq("productId", productId))
      .collect()
  ).find((link) => link.upgradeId === upgradeId);
  const patch = {
    productId,
    upgradeId,
    active: seed.active,
    displayOrder: seed.displayOrder,
    rules: seed.rules,
    updatedAt: nowIso(),
    updatedBy: ALVORADA_MIGRATION_ACTOR,
    version: "1",
  };
  const source = `${seed.productDocumentalId}->${seed.upgradeDocumentKey}`;
  if (!existing) {
    record(matrix, {
      entity: "productUpgrade",
      source,
      current: "ausente",
      action: "pending",
      finalState: "vinculo inativo; pendente_modelagem",
    });
    if (isMutationCtx(ctx)) {
      return await ctx.db.insert("productUpgrades", {
        ...patch,
        createdAt: patch.updatedAt,
        createdBy: ALVORADA_MIGRATION_ACTOR,
      });
    }
    return null;
  }
  const changed = shallowChanged(existing, patch);
  record(matrix, {
    entity: "productUpgrade",
    source,
    current: "existente",
    action: "pending",
    finalState: "vinculo inativo; pendente_modelagem",
  });
  if (isMutationCtx(ctx) && changed) await ctx.db.patch(existing._id, patch);
  return existing._id;
}

async function recordPreservedPreviousProducts(
  ctx: CatalogCtx,
  matrix: ReconciliationEntry[],
) {
  const sourceKeys = new Set(alvoradaProducts.map((product) => product.documentKey));
  const products = await ctx.db.query("products").collect();
  for (const product of products) {
    if (product.documentKey && sourceKeys.has(product.documentKey)) continue;
    record(matrix, {
      entity: "preserved",
      source: product.documentKey ?? product.name,
      current: "produto anterior fora da fonte atual",
      action: "skip",
      finalState: "preservado para reconciliacao futura",
    });
  }
}

async function runMigration(ctx: CatalogCtx) {
  const matrix: ReconciliationEntry[] = [];
  const categoryIds = new Map<string, Id<"categories">>();
  const productIds = new Map<string, Id<"products">>();
  const complementGroupIds = new Map<string, Id<"complementGroups">>();
  const upgradeIds = new Map<string, Id<"commercialUpgrades">>();

  for (const category of alvoradaCategories) {
    const id = await upsertCategory(ctx, category, matrix);
    if (id) categoryIds.set(category.code, id);
  }

  for (const product of alvoradaProducts) {
    const categoryId = categoryIds.get(product.categoryCode);
    if (!categoryId) {
      record(matrix, {
        entity: "product",
        source: product.documentKey,
        current: "categoria ausente",
        action: "conflict",
        finalState: "bloqueado",
      });
      continue;
    }
    const id = await upsertProduct(ctx, product, categoryId, matrix);
    if (id) productIds.set(product.documentalId, id);
  }

  for (const option of alvoradaProductOptions) {
    const productId = productIds.get(option.productDocumentalId);
    if (!productId) {
      record(matrix, {
        entity: "productOption",
        source: option.documentKey,
        current: "produto ausente",
        action: "conflict",
        finalState: "bloqueada",
      });
      continue;
    }
    await upsertOption(ctx, option, productId, matrix);
  }

  for (const config of alvoradaPizzaConfigurations) {
    const productId = productIds.get(config.productDocumentalId);
    if (!productId) continue;
    await upsertPizzaConfiguration(ctx, config, productId, matrix);
  }

  for (const group of alvoradaComplementGroups) {
    const id = await upsertComplementGroup(ctx, group, matrix);
    if (id) complementGroupIds.set(group.documentKey, id);
  }

  for (const item of alvoradaComplementItems) {
    const groupId = complementGroupIds.get(item.groupDocumentKey);
    if (!groupId) {
      record(matrix, {
        entity: "complementItem",
        source: item.documentKey,
        current: "grupo ausente",
        action: "conflict",
        finalState: "bloqueado",
      });
      continue;
    }
    await upsertComplementItem(ctx, item, groupId, matrix);
  }

  for (const upgrade of alvoradaCommercialUpgrades) {
    const id = await upsertUpgrade(ctx, upgrade, matrix);
    if (id) upgradeIds.set(upgrade.documentKey, id);
  }

  for (const link of alvoradaUpgradeLinks) {
    const productId = productIds.get(link.productDocumentalId);
    const upgradeId = upgradeIds.get(link.upgradeDocumentKey);
    if (!productId || !upgradeId) {
      record(matrix, {
        entity: "productUpgrade",
        source: `${link.productDocumentalId}->${link.upgradeDocumentKey}`,
        current: "produto ou upgrade ausente",
        action: "conflict",
        finalState: "bloqueado",
      });
      continue;
    }
    await upsertUpgradeLink(ctx, link, productId, upgradeId, matrix);
  }

  await recordPreservedPreviousProducts(ctx, matrix);
  const finalProducts = (await ctx.db.query("products").collect()).length;
  const finalOptions = (await ctx.db.query("productOptions").collect()).length;
  return summarize(matrix, finalProducts, finalOptions);
}

export const dryRun = query({
  args: {},
  handler: async (ctx) => {
    return await runMigration(ctx);
  },
});

export const applyToDev = mutation({
  args: {
    target: v.literal("DEV"),
    confirm: v.literal("APPLY_CATALOG_INSTANCE_ALVORADA_001_TO_DEV"),
  },
  handler: async (ctx) => {
    const result = await runMigration(ctx);
    return { ...result, dryRun: false };
  },
});

export const postMigrationSummary = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    const options = await ctx.db.query("productOptions").collect();
    const categories = await ctx.db.query("categories").collect();
    const sourceProductKeys = new Set(
      alvoradaProducts.map((product) => product.documentKey),
    );
    const sourceOptionKeys = new Set(
      alvoradaProductOptions.map((option) => option.documentKey),
    );
    return {
      catalogInstance: CATALOG_DOCUMENT_VERSION,
      contractVersion: CATALOG_CONTRACT_VERSION,
      source: expectedSourceCounts,
      database: {
        categories: categories.length,
        products: products.length,
        productOptions: options.length,
        sourceProducts: products.filter((product) =>
          product.documentKey ? sourceProductKeys.has(product.documentKey) : false,
        ).length,
        sourceProductOptions: options.filter((option) =>
          sourceOptionKeys.has(option.documentKey),
        ).length,
        pendingProducts: products.filter(
          (product) => product.migrationStatus === "aplicado_com_pendencias",
        ).length,
        pendingOptions: options.filter(
          (option) =>
            option.priceStatus === "pendente" ||
            option.priceStatus === "aguardando_confirmacao",
        ).length,
      },
    };
  },
});

export const validateSourceData = query({
  args: {},
  handler: async () => {
    const pendingOptions = alvoradaProductOptions.filter(
      (option) => !option.sellable,
    );
    if (
      alvoradaProducts.length !== expectedSourceCounts.products ||
      alvoradaProductOptions.length !== expectedSourceCounts.productOptions
    ) {
      throw new ConvexError("contagem_fonte_invalida");
    }
    return {
      products: alvoradaProducts.length,
      productOptions: alvoradaProductOptions.length,
      pendingOptions: pendingOptions.map((option) => ({
        documentKey: option.documentKey,
        label: option.label,
        price: option.price,
        priceStatus: option.priceStatus,
        sellable: option.sellable,
      })),
      countDivergence: {
        sourceDocumentMentionsOptions:
          expectedSourceCounts.sourceDocumentMentionsOptions,
        requestMentionsOptionsOrVariations:
          expectedSourceCounts.requestMentionsOptionsOrVariations,
        treatment:
          "A migracao usa as 94 opcoes documentadas e trata a diferenca como itens adicionais/pendencias, sem inventar opcoes.",
      },
    };
  },
});
