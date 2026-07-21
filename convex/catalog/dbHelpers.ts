import { ConvexError } from "convex/values";
import type { DatabaseReader } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { getDocumentKeyConflict } from "./helpers";

type DocumentKeyTable = "categories" | "products" | "productOptions";

export async function findByDocumentKey(ctx: { db: DatabaseReader }, table: DocumentKeyTable, documentKey: string) {
  if (table === "categories") {
    return await ctx.db
      .query("categories")
      .withIndex("by_document_key", (q) => q.eq("documentKey", documentKey))
      .first();
  }
  if (table === "products") {
    return await ctx.db
      .query("products")
      .withIndex("by_document_key", (q) => q.eq("documentKey", documentKey))
      .first();
  }
  return await ctx.db
    .query("productOptions")
    .withIndex("by_document_key", (q) => q.eq("documentKey", documentKey))
    .first();
}

export async function assertUniqueDocumentKey(
  ctx: { db: DatabaseReader },
  table: DocumentKeyTable,
  documentKey: string,
  currentId?: string,
) {
  const existing = await findByDocumentKey(ctx, table, documentKey);
  if (getDocumentKeyConflict(existing?._id, currentId)) {
    throw new ConvexError("documentKey_duplicado");
  }
}

export async function assertCategoryExists(ctx: { db: DatabaseReader }, categoryId: Id<"categories">) {
  const category = await ctx.db.get(categoryId);
  if (!category) throw new ConvexError("categoria_nao_encontrada");
  return category;
}

export async function assertProductExists(ctx: { db: DatabaseReader }, productId: Id<"products">) {
  const product = await ctx.db.get(productId);
  if (!product) throw new ConvexError("produto_nao_encontrado");
  return product;
}
