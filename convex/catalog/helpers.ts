import type { PriceStatus } from "./contracts";

export type CatalogDocument = {
  _id?: string;
  documentKey?: string;
  name?: string;
  label?: string;
  displayOrder?: number;
  order?: number;
};

export type CatalogOptionForSellability = CatalogDocument & {
  active: boolean;
  sellable: boolean;
  price?: number;
  priceStatus: PriceStatus;
};

export type CatalogProductForSellability = CatalogDocument & {
  active: boolean;
  basePrice?: number;
  priceStatus?: PriceStatus;
  price?: number;
};

export type CatalogCategoryForSellability = {
  active: boolean;
};

export type SellabilityResult = {
  sellable: boolean;
  reason:
    | "sellable_base_price"
    | "sellable_option"
    | "inactive_product"
    | "inactive_category"
    | "missing_confirmed_price"
    | "missing_sellable_option";
  priceFrom?: number;
};

export function hasConfirmedPrice(priceStatus: PriceStatus | undefined, price: number | undefined) {
  return priceStatus === "confirmado" && typeof price === "number" && Number.isFinite(price) && price >= 0;
}

export function isPendingPriceStatus(priceStatus: PriceStatus | undefined) {
  return priceStatus === "pendente" || priceStatus === "aguardando_confirmacao";
}

export function isOptionCommerciallySellable(option: CatalogOptionForSellability) {
  return option.active && option.sellable && hasConfirmedPrice(option.priceStatus, option.price);
}

export function getDocumentKeyConflict(existingId: string | undefined, currentId?: string) {
  return Boolean(existingId && existingId !== currentId);
}

export function assertDocumentKeyUpdateIsImmutable(currentDocumentKey: string | undefined, nextDocumentKey: string | undefined) {
  if (nextDocumentKey !== undefined && currentDocumentKey !== undefined && nextDocumentKey !== currentDocumentKey) {
    throw new Error("documentKey_imutavel");
  }
}

export function getNextVersion(currentVersion: string | undefined) {
  const parsed = Number.parseInt(currentVersion ?? "0", 10);
  return String(Number.isFinite(parsed) ? parsed + 1 : 1);
}

export function getStableCatalogOrderValue(item: CatalogDocument) {
  return item.displayOrder ?? item.order ?? Number.MAX_SAFE_INTEGER;
}

export function compareCatalogOrder(a: CatalogDocument, b: CatalogDocument) {
  const byOrder = getStableCatalogOrderValue(a) - getStableCatalogOrderValue(b);
  if (byOrder !== 0) return byOrder;

  const aName = a.name ?? a.label ?? a.documentKey ?? a._id ?? "";
  const bName = b.name ?? b.label ?? b.documentKey ?? b._id ?? "";
  return aName.localeCompare(bName, "pt-BR", { sensitivity: "base" });
}

export function getSellableOptions(options: CatalogOptionForSellability[]) {
  return options.filter(isOptionCommerciallySellable).sort(compareCatalogOrder);
}

export function determineProductSellability({
  product,
  category,
  options,
}: {
  product: CatalogProductForSellability;
  category?: CatalogCategoryForSellability | null;
  options: CatalogOptionForSellability[];
}): SellabilityResult {
  if (!product.active) return { sellable: false, reason: "inactive_product" };
  if (category && !category.active) return { sellable: false, reason: "inactive_category" };

  const sellableOptions = getSellableOptions(options);
  if (sellableOptions.length > 0) {
    return {
      sellable: true,
      reason: "sellable_option",
      priceFrom: sellableOptions[0].price,
    };
  }

  if (hasConfirmedPrice(product.priceStatus, product.basePrice)) {
    return { sellable: true, reason: "sellable_base_price", priceFrom: product.basePrice };
  }

  if (product.priceStatus === undefined && hasLegacyPrice(product.price)) {
    return { sellable: true, reason: "sellable_base_price", priceFrom: product.price };
  }

  return {
    sellable: false,
    reason: options.length > 0 ? "missing_sellable_option" : "missing_confirmed_price",
  };
}

export function hasLegacyPrice(price: number | undefined) {
  return typeof price === "number" && Number.isFinite(price) && price >= 0;
}

export function assertOptionPriceInvariants({
  active,
  sellable,
  required,
  price,
  priceStatus,
}: {
  active: boolean;
  sellable: boolean;
  required: boolean;
  price?: number;
  priceStatus: PriceStatus;
}) {
  if (priceStatus === "confirmado" && !hasConfirmedPrice(priceStatus, price)) {
    throw new Error("preco_confirmado_exige_valor");
  }
  if (isPendingPriceStatus(priceStatus) && sellable) {
    throw new Error("preco_pendente_nao_vendavel");
  }
  if (!active && sellable) {
    throw new Error("opcao_inativa_nao_vendavel");
  }
  if (required && sellable && !hasConfirmedPrice(priceStatus, price)) {
    throw new Error("opcao_obrigatoria_sem_preco_confirmado");
  }
}

export function assertProductPriceInvariants({
  basePrice,
  priceStatus,
}: {
  basePrice?: number;
  priceStatus?: PriceStatus;
}) {
  if (priceStatus === "confirmado" && !hasConfirmedPrice(priceStatus, basePrice)) {
    throw new Error("base_price_confirmado_exige_valor");
  }
}
