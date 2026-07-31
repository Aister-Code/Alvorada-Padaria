import { ConvexError, v } from "convex/values";
import { internalMutation, mutation, query } from "../_generated/server";
import type { DatabaseReader } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import {
  CATALOG_DOCUMENT_VERSION,
  catalogMigrationStatusValidator,
  priceStatusValidator,
  productOriginValidator,
} from "./contracts";
import {
  assertCategoryExists,
  assertUniqueDocumentKey,
  findByDocumentKey,
} from "./dbHelpers";
import {
  assertDocumentKeyUpdateIsImmutable,
  assertProductPriceInvariants,
  compareCatalogOrder,
  determineProductSellability,
  getNextVersion,
  getSellableOptions,
} from "./helpers";

export const listByCategory = query({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .filter((q) => q.eq(q.field("active"), true))
      .collect();
    const mapped = await Promise.all(
      products
        .sort(compareCatalogOrder)
        .map((product) => buildPublicProduct(ctx, product)),
    );
    return mapped.filter((product) => product !== null);
  },
});

export const search = query({
  args: { term: v.string() },
  handler: async (ctx, args) => {
    if (!args.term.trim()) return [];
    const all = await ctx.db
      .query("products")
      .filter((q) => q.eq(q.field("active"), true))
      .collect();
    const lower = args.term.toLowerCase();
    const filtered = all.filter(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        (p.description ?? "").toLowerCase().includes(lower),
    );
    const mapped = await Promise.all(
      filtered
        .sort(compareCatalogOrder)
        .map((product) => buildPublicProduct(ctx, product)),
    );
    return mapped.filter((product) => product !== null);
  },
});

async function listActiveOptions(
  ctx: { db: DatabaseReader },
  productId: Id<"products">,
) {
  const options = await ctx.db
    .query("productOptions")
    .withIndex("by_product_active_order", (q) =>
      q.eq("productId", productId).eq("active", true),
    )
    .collect();
  return options.sort(compareCatalogOrder);
}

async function buildPublicProduct(
  ctx: { db: DatabaseReader },
  product: Doc<"products"> | null,
) {
  if (!product) return null;
  const category = await ctx.db.get(product.categoryId);
  if (!category || !category.active || !product.active) return null;
  const options = await listActiveOptions(ctx, product._id);
  const sellability = determineProductSellability({
    product,
    category,
    options,
  });
  const sellableOptions = getSellableOptions(options);
  const source = product.documentKey ? "structured" : "legacy";

  return {
    _id: product._id,
    _creationTime: product._creationTime,
    documentKey: product.documentKey,
    documentalId: product.documentalId,
    categoryId: product.categoryId,
    name: product.name,
    slug: product.slug,
    description: product.shortDescription ?? product.description,
    shortDescription: product.shortDescription,
    origin: product.origin,
    active: product.active,
    featured: product.featured,
    displayOrder: product.displayOrder ?? Number.MAX_SAFE_INTEGER,
    basePrice: product.basePrice,
    price: product.price,
    priceStatus: product.priceStatus,
    imageUrl: product.imageUrl,
    hasSizes: product.hasSizes,
    hasOptions: options.length > 0 || Boolean(product.hasSizes),
    options: sellableOptions,
    legacySizes: source === "legacy" ? product.sizes : undefined,
    sellable: sellability.sellable,
    sellabilityReason: sellability.reason,
    priceFrom: sellability.priceFrom,
    source,
  };
}

export const listPublicByCategoryMaster = query({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_category_active_order", (q) =>
        q.eq("categoryId", args.categoryId).eq("active", true),
      )
      .collect();
    const mapped = await Promise.all(
      products
        .sort(compareCatalogOrder)
        .map((product) => buildPublicProduct(ctx, product)),
    );
    return mapped.filter((product) => product !== null);
  },
});

export const getPublicByDocumentKey = query({
  args: { documentKey: v.string() },
  handler: async (ctx, args) => {
    const product = await ctx.db
      .query("products")
      .withIndex("by_document_key", (q) =>
        q.eq("documentKey", args.documentKey),
      )
      .first();
    return await buildPublicProduct(ctx, product);
  },
});

export const getById = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.productId);
  },
});

export const listInternal = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    return products.sort(compareCatalogOrder);
  },
});

export const existsByDocumentKey = query({
  args: { documentKey: v.string() },
  handler: async (ctx, args) => {
    return Boolean(await findByDocumentKey(ctx, "products", args.documentKey));
  },
});

export const listWithActiveOptions = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    return await Promise.all(
      products.sort(compareCatalogOrder).map(async (product) => ({
        ...product,
        options: await listActiveOptions(ctx, product._id),
      })),
    );
  },
});

export const listSellable = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();
    const mapped = await Promise.all(
      products.map((product) => buildPublicProduct(ctx, product)),
    );
    return mapped.filter((product) => product?.sellable);
  },
});

export const listWithCatalogIssues = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    return products
      .filter(
        (product) =>
          product.priceStatus === "pendente" ||
          product.priceStatus === "aguardando_confirmacao" ||
          product.migrationStatus === "dry_run" ||
          product.migrationStatus === "aplicado_com_pendencias" ||
          product.migrationStatus === "rollback_necessario",
      )
      .sort(compareCatalogOrder);
  },
});

async function assertDocumentalIdAvailable(
  ctx: { db: DatabaseReader },
  documentalId: string | undefined,
  currentId?: string,
) {
  if (!documentalId) return;
  const existing = await ctx.db
    .query("products")
    .withIndex("by_documental_id", (q) => q.eq("documentalId", documentalId))
    .first();
  if (existing && existing._id !== currentId)
    throw new ConvexError("documentalId_duplicado");
}

async function assertSlugAvailable(
  ctx: { db: DatabaseReader },
  slug: string,
  currentId?: string,
) {
  const products = await ctx.db.query("products").collect();
  const existing = products.find((product) => product.slug === slug);
  if (existing && existing._id !== currentId)
    throw new ConvexError("slug_duplicado");
}

export const createMaster = internalMutation({
  args: {
    documentKey: v.string(),
    documentalId: v.optional(v.string()),
    categoryId: v.id("categories"),
    subcategory: v.optional(v.string()),
    family: v.optional(v.string()),
    name: v.string(),
    slug: v.string(),
    shortDescription: v.optional(v.string()),
    origin: productOriginValidator,
    active: v.optional(v.boolean()),
    featured: v.optional(v.boolean()),
    displayOrder: v.number(),
    basePrice: v.optional(v.number()),
    priceStatus: v.optional(priceStatusValidator),
    productionSector: v.optional(v.string()),
    migrationStatus: v.optional(catalogMigrationStatusValidator),
    createdBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await assertUniqueDocumentKey(ctx, "products", args.documentKey);
    await assertDocumentalIdAvailable(ctx, args.documentalId);
    await assertSlugAvailable(ctx, args.slug);
    const category = await assertCategoryExists(ctx, args.categoryId);
    assertProductPriceInvariants({
      basePrice: args.basePrice,
      priceStatus: args.priceStatus,
    });
    if (args.active ?? false) {
      const sellability = determineProductSellability({
        product: {
          active: true,
          basePrice: args.basePrice,
          priceStatus: args.priceStatus,
        },
        category,
        options: [],
      });
      if (!sellability.sellable) throw new ConvexError(sellability.reason);
    }

    const now = new Date().toISOString();
    return await ctx.db.insert("products", {
      categoryId: args.categoryId,
      name: args.name,
      description: args.shortDescription ?? "",
      active: args.active ?? false,
      featured: args.featured ?? false,
      documentKey: args.documentKey,
      documentalId: args.documentalId,
      slug: args.slug,
      subcategory: args.subcategory,
      family: args.family,
      shortDescription: args.shortDescription,
      origin: args.origin,
      displayOrder: args.displayOrder,
      basePrice: args.basePrice,
      priceStatus: args.priceStatus,
      productionSector: args.productionSector,
      migrationStatus: args.migrationStatus,
      documentVersion: CATALOG_DOCUMENT_VERSION,
      createdAt: now,
      updatedAt: now,
      createdBy: args.createdBy,
      updatedBy: args.createdBy,
      version: "1",
    });
  },
});

export const updateMaster = internalMutation({
  args: {
    productId: v.id("products"),
    documentKey: v.optional(v.string()),
    documentalId: v.optional(v.string()),
    categoryId: v.optional(v.id("categories")),
    subcategory: v.optional(v.string()),
    family: v.optional(v.string()),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    shortDescription: v.optional(v.string()),
    origin: v.optional(productOriginValidator),
    displayOrder: v.optional(v.number()),
    basePrice: v.optional(v.number()),
    priceStatus: v.optional(priceStatusValidator),
    productionSector: v.optional(v.string()),
    updatedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) throw new ConvexError("produto_nao_encontrado");
    assertDocumentKeyUpdateIsImmutable(product.documentKey, args.documentKey);
    await assertDocumentalIdAvailable(ctx, args.documentalId, args.productId);
    if (args.categoryId) await assertCategoryExists(ctx, args.categoryId);
    if (args.slug !== undefined && args.slug !== product.slug) {
      await assertSlugAvailable(ctx, args.slug, args.productId);
    }
    assertProductPriceInvariants({
      basePrice: args.basePrice ?? product.basePrice,
      priceStatus: args.priceStatus ?? product.priceStatus,
    });

    await ctx.db.patch(args.productId, {
      ...(args.documentalId !== undefined
        ? { documentalId: args.documentalId }
        : {}),
      ...(args.categoryId !== undefined ? { categoryId: args.categoryId } : {}),
      ...(args.subcategory !== undefined
        ? { subcategory: args.subcategory }
        : {}),
      ...(args.family !== undefined ? { family: args.family } : {}),
      ...(args.name !== undefined ? { name: args.name } : {}),
      ...(args.slug !== undefined ? { slug: args.slug } : {}),
      ...(args.shortDescription !== undefined
        ? {
            shortDescription: args.shortDescription,
            description: args.shortDescription,
          }
        : {}),
      ...(args.origin !== undefined ? { origin: args.origin } : {}),
      ...(args.displayOrder !== undefined
        ? { displayOrder: args.displayOrder }
        : {}),
      ...(args.basePrice !== undefined ? { basePrice: args.basePrice } : {}),
      ...(args.priceStatus !== undefined
        ? { priceStatus: args.priceStatus }
        : {}),
      ...(args.productionSector !== undefined
        ? { productionSector: args.productionSector }
        : {}),
      updatedAt: new Date().toISOString(),
      updatedBy: args.updatedBy,
      version: getNextVersion(product.version),
    });
    return args.productId;
  },
});

export const setActiveMaster = internalMutation({
  args: {
    productId: v.id("products"),
    active: v.boolean(),
    updatedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) throw new ConvexError("produto_nao_encontrado");
    const category = await assertCategoryExists(ctx, product.categoryId);
    if (args.active) {
      const options = await listActiveOptions(ctx, args.productId);
      const sellability = determineProductSellability({
        product: { ...product, active: true },
        category,
        options,
      });
      if (!sellability.sellable) throw new ConvexError(sellability.reason);
    }
    await ctx.db.patch(args.productId, {
      active: args.active,
      updatedAt: new Date().toISOString(),
      updatedBy: args.updatedBy,
      version: getNextVersion(product.version),
    });
    return args.productId;
  },
});

export const updateDisplayOrderMaster = internalMutation({
  args: {
    productId: v.id("products"),
    displayOrder: v.number(),
    updatedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) throw new ConvexError("produto_nao_encontrado");
    await ctx.db.patch(args.productId, {
      displayOrder: args.displayOrder,
      updatedAt: new Date().toISOString(),
      updatedBy: args.updatedBy,
      version: getNextVersion(product.version),
    });
    return args.productId;
  },
});

export const setFeaturedMaster = internalMutation({
  args: {
    productId: v.id("products"),
    featured: v.boolean(),
    updatedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) throw new ConvexError("produto_nao_encontrado");
    await ctx.db.patch(args.productId, {
      featured: args.featured,
      updatedAt: new Date().toISOString(),
      updatedBy: args.updatedBy,
      version: getNextVersion(product.version),
    });
    return args.productId;
  },
});

export const updateMigrationStatusMaster = internalMutation({
  args: {
    productId: v.id("products"),
    migrationStatus: catalogMigrationStatusValidator,
    updatedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) throw new ConvexError("produto_nao_encontrado");
    await ctx.db.patch(args.productId, {
      migrationStatus: args.migrationStatus,
      updatedAt: new Date().toISOString(),
      updatedBy: args.updatedBy,
      version: getNextVersion(product.version),
    });
    return args.productId;
  },
});

export const seed = mutation({
  args: { categoryIds: v.record(v.string(), v.id("categories")) },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("products").collect();
    if (existing.length > 0) return null;
    const { padaria, lanchonete, pizzaria, conveniencia, bebidas } =
      args.categoryIds;
    const products = [
      {
        categoryId: padaria,
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
        categoryId: padaria,
        name: "Croissant de Presunto e Queijo",
        description:
          "Croissant folhado recheado com presunto e queijo derretido.",
        price: 7.5,
        imageUrl:
          "https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?w=400&q=80",
        active: true,
        featured: true,
      },
      {
        categoryId: padaria,
        name: "Pão de Queijo",
        description: "Pão de queijo mineiro, macio e quentinho.",
        price: 4.0,
        imageUrl:
          "https://images.unsplash.com/photo-1566698629409-787a68fc5724?w=400&q=80",
        active: true,
        featured: false,
      },
      {
        categoryId: padaria,
        name: "Bolo de Cenoura com Chocolate",
        description:
          "Bolo caseiro de cenoura com cobertura de chocolate cremosa.",
        price: 6.0,
        imageUrl:
          "https://images.unsplash.com/photo-1546337719-5d8c8b9cb6af?w=400&q=80",
        active: true,
        featured: false,
      },
      {
        categoryId: padaria,
        name: "Sonho Recheado",
        description:
          "Sonho frito e fofo recheado com creme de baunilha ou doce de leite.",
        price: 5.0,
        imageUrl:
          "https://images.unsplash.com/photo-1523294587484-bae6cc870010?w=400&q=80",
        active: true,
        featured: false,
      },
      {
        categoryId: lanchonete,
        name: "X-Burguer Artesanal",
        description:
          "Hambúrguer artesanal 150g, queijo, alface, tomate e molho especial.",
        price: 22.0,
        imageUrl:
          "https://images.unsplash.com/photo-1555341483-889579a375bd?w=400&q=80",
        active: true,
        featured: true,
      },
      {
        categoryId: lanchonete,
        name: "X-Bacon",
        description:
          "Hambúrguer, bacon crocante, queijo cheddar e molho barbecue.",
        price: 26.0,
        imageUrl:
          "https://images.unsplash.com/photo-1514904298838-b62571b3257d?w=400&q=80",
        active: true,
        featured: false,
      },
      {
        categoryId: lanchonete,
        name: "Misto Quente",
        description: "Sanduíche de presunto e queijo grelhado na chapa.",
        price: 9.0,
        imageUrl:
          "https://images.unsplash.com/photo-1619708976768-50451a0b3c86?w=400&q=80",
        active: true,
        featured: false,
      },
      {
        categoryId: lanchonete,
        name: "Batata Frita Porção",
        description: "Porção de batata frita crocante com molho à sua escolha.",
        price: 15.0,
        imageUrl:
          "https://images.unsplash.com/photo-1624981013208-bb9adbb3f7b4?w=400&q=80",
        active: true,
        featured: false,
      },
      {
        categoryId: lanchonete,
        name: "Cachorro Quente Completo",
        description:
          "Salsicha, molho de tomate, purê de batata, milho, ervilha e mostarda.",
        price: 12.0,
        imageUrl:
          "https://images.unsplash.com/photo-1588258127399-549e8f09f904?w=400&q=80",
        active: true,
        featured: false,
      },
      {
        categoryId: pizzaria,
        name: "Pizza Calabresa",
        description: "Molho de tomate, mussarela, calabresa fatiada e cebola.",
        price: 45.0,
        imageUrl:
          "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=400&q=80",
        active: true,
        featured: true,
        hasSizes: true,
        sizes: [
          { label: "Broto (4 fatias)", extraPrice: 0 },
          { label: "Média (6 fatias)", extraPrice: 10 },
          { label: "Grande (8 fatias)", extraPrice: 20 },
        ],
      },
      {
        categoryId: pizzaria,
        name: "Pizza Margherita",
        description: "Molho de tomate, mussarela fresca e manjericão.",
        price: 42.0,
        imageUrl:
          "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=400&q=80",
        active: true,
        featured: false,
        hasSizes: true,
        sizes: [
          { label: "Broto (4 fatias)", extraPrice: 0 },
          { label: "Média (6 fatias)", extraPrice: 10 },
          { label: "Grande (8 fatias)", extraPrice: 20 },
        ],
      },
      {
        categoryId: pizzaria,
        name: "Pizza Frango com Catupiry",
        description: "Frango desfiado temperado com catupiry cremoso.",
        price: 48.0,
        imageUrl:
          "https://images.unsplash.com/photo-1554136812-8b7875b188b2?w=400&q=80",
        active: true,
        featured: true,
        hasSizes: true,
        sizes: [
          { label: "Broto (4 fatias)", extraPrice: 0 },
          { label: "Média (6 fatias)", extraPrice: 10 },
          { label: "Grande (8 fatias)", extraPrice: 20 },
        ],
      },
      {
        categoryId: conveniencia,
        name: "Água Mineral 500ml",
        description: "Água mineral natural sem gás.",
        price: 3.0,
        imageUrl:
          "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&q=80",
        active: true,
        featured: false,
      },
      {
        categoryId: conveniencia,
        name: "Biscoito Recheado",
        description: "Biscoito recheado de chocolate ou baunilha.",
        price: 2.5,
        imageUrl:
          "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80",
        active: true,
        featured: false,
      },
      {
        categoryId: conveniencia,
        name: "Chips Batata 50g",
        description: "Batata chips crocante, original ou temperada.",
        price: 4.0,
        imageUrl:
          "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80",
        active: true,
        featured: false,
      },
      {
        categoryId: bebidas,
        name: "Suco Natural de Laranja",
        description: "Suco de laranja espremido na hora, 500ml.",
        price: 8.0,
        imageUrl:
          "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&q=80",
        active: true,
        featured: true,
      },
      {
        categoryId: bebidas,
        name: "Café Expresso",
        description: "Café expresso encorpado, torrado artesanalmente.",
        price: 4.5,
        imageUrl:
          "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80",
        active: true,
        featured: true,
      },
      {
        categoryId: bebidas,
        name: "Refrigerante Lata",
        description: "Coca-Cola, Guaraná ou Sprite gelado, 350ml.",
        price: 5.0,
        imageUrl:
          "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80",
        active: true,
        featured: false,
      },
    ];
    for (const p of products) {
      await ctx.db.insert(
        "products",
        p as Parameters<typeof ctx.db.insert<"products">>[1],
      );
    }
    return true;
  },
});
