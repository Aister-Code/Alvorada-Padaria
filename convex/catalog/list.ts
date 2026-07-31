import { query } from "../_generated/server";
import {
  compareCatalogOrder,
  determineProductSellability,
  getSellableOptions,
} from "./helpers";

export const listCategories = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("categories")
      .withIndex("by_order")
      .filter((q) => q.eq(q.field("active"), true))
      .collect();
  },
});

export const listProducts = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();
    const mapped = await Promise.all(
      products.sort(compareCatalogOrder).map(async (product) => {
        const category = await ctx.db.get(product.categoryId);
        const activeOptions = (
          await ctx.db
            .query("productOptions")
            .withIndex("by_product_active_order", (q) =>
              q.eq("productId", product._id).eq("active", true),
            )
            .collect()
        ).sort(compareCatalogOrder);
        const sellability = determineProductSellability({
          product,
          category,
          options: activeOptions,
        });
        return {
          ...product,
          options: getSellableOptions(activeOptions),
          hasOptions: activeOptions.length > 0 || Boolean(product.hasSizes),
          legacySizes: product.documentKey ? undefined : product.sizes,
          sellable: sellability.sellable,
          sellabilityReason: sellability.reason,
          priceFrom: sellability.priceFrom,
          source: product.documentKey ? "structured" : "legacy",
        };
      }),
    );
    return mapped;
  },
});

export const getPublicCatalog = query({
  args: {},
  handler: async (ctx) => {
    const categories = (
      await ctx.db
        .query("categories")
        .withIndex("by_active_order", (q) => q.eq("active", true))
        .collect()
    ).sort(compareCatalogOrder);

    const products = await ctx.db
      .query("products")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();
    const productsByCategory = new Map<string, typeof products>();
    for (const product of products.sort(compareCatalogOrder)) {
      const list = productsByCategory.get(product.categoryId) ?? [];
      list.push(product);
      productsByCategory.set(product.categoryId, list);
    }

    const categoriesWithProducts = await Promise.all(
      categories.map(async (category) => {
        const categoryProducts = productsByCategory.get(category._id) ?? [];
        const publicProducts = await Promise.all(
          categoryProducts.map(async (product) => {
            const activeOptions = (
              await ctx.db
                .query("productOptions")
                .withIndex("by_product_active_order", (q) =>
                  q.eq("productId", product._id).eq("active", true),
                )
                .collect()
            ).sort(compareCatalogOrder);
            const sellableOptions = getSellableOptions(activeOptions);
            const sellability = determineProductSellability({
              product,
              category,
              options: activeOptions,
            });

            return {
              _id: product._id,
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
              displayOrder: product.displayOrder,
              basePrice: product.basePrice,
              price: product.price,
              priceStatus: product.priceStatus,
              imageUrl: product.imageUrl,
              options: sellableOptions,
              hasOptions: activeOptions.length > 0 || Boolean(product.hasSizes),
              legacySizes: product.documentKey ? undefined : product.sizes,
              sellable: sellability.sellable,
              sellabilityReason: sellability.reason,
              priceFrom: sellability.priceFrom,
              source: product.documentKey ? "structured" : "legacy",
            };
          }),
        );

        return {
          _id: category._id,
          documentKey: category.documentKey,
          code: category.code,
          name: category.name,
          slug: category.slug,
          icon: category.icon,
          displayOrder: category.displayOrder ?? category.order,
          products: publicProducts,
        };
      }),
    );

    return {
      categories: categoriesWithProducts,
      empty: categoriesWithProducts.length === 0,
    };
  },
});
