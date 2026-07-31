import {
  CATALOG_CART_CONTRACT_VERSION,
  type PizzaPricingPolicy,
  type PriceStatus,
  type UpgradeOperationalStatus,
} from "./contracts";
import type { Id } from "../_generated/dataModel";

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

export type CatalogComplementGroupForValidation = CatalogDocument & {
  active: boolean;
  required: boolean;
  minSelections: number;
  maxSelections?: number;
  items: CatalogComplementItemForValidation[];
};

export type CatalogComplementItemForValidation = CatalogDocument & {
  active: boolean;
  sellable: boolean;
  price?: number;
  priceStatus: PriceStatus;
  maxQuantity?: number;
};

export type ComplementSelectionInput = {
  groupDocumentKey: string;
  itemDocumentKey: string;
  quantity: number;
};

export type CatalogUpgradeForValidation = CatalogDocument & {
  active: boolean;
  price?: number;
  priceStatus: PriceStatus;
  operationalStatus: UpgradeOperationalStatus;
};

export type PizzaSize = "P" | "M" | "G";

export type PizzaConfigurationForValidation = {
  active: boolean;
  allowedSizes: PizzaSize[];
  maxFlavorsBySize: Record<PizzaSize, number>;
  secondFlavorAllowed: boolean;
  pricingPolicy: PizzaPricingPolicy;
};

export type PizzaFlavorForPricing = {
  documentKey: string;
  name: string;
  price?: number;
  priceStatus: PriceStatus;
};

export type CatalogCartSnapshotInput = {
  cartItemId: string;
  productId?: Id<"products">;
  productDocumentKey: string;
  productNameSnapshot: string;
  productDescriptionSnapshot?: string;
  categoryId?: Id<"categories">;
  categoryDocumentKey?: string;
  categoryNameSnapshot?: string;
  subcategorySnapshot?: string;
  familySnapshot?: string;
  productOriginSnapshot: "produzido" | "revendido" | "misto";
  productionSectorSnapshot?: string;
  documentVersion?: string;
  quantity: number;
  selectedOption?: {
    optionId?: Id<"productOptions">;
    optionDocumentKey?: string;
    code?: string;
    label: string;
    optionType:
      | "padrao"
      | "tamanho"
      | "volume"
      | "embalagem"
      | "combinacao_suco"
      | "pizza_tamanho";
    price?: number;
    priceStatus: PriceStatus;
    metadata?: {
      size?: PizzaSize;
      volumeMl?: number;
      packageType?: string;
      liquidBase?: "agua" | "leite";
      portionGrams?: number;
      displayHint?: string;
    };
  };
  complements?: Array<{
    groupId?: Id<"complementGroups">;
    groupDocumentKey?: string;
    groupNameSnapshot: string;
    itemId?: Id<"complementItems">;
    itemDocumentKey?: string;
    itemNameSnapshot: string;
    quantity: number;
    unitPrice?: number;
    priceStatus: PriceStatus;
  }>;
  upgrade?: {
    upgradeId?: Id<"commercialUpgrades">;
    upgradeDocumentKey: string;
    nameSnapshot: string;
    price?: number;
    priceStatus: PriceStatus;
    operationalStatus: UpgradeOperationalStatus;
  };
  pizzaConfiguration?: {
    size: PizzaSize;
    firstFlavorProductId?: Id<"products">;
    firstFlavorDocumentKey: string;
    firstFlavorNameSnapshot: string;
    secondFlavorProductId?: Id<"products">;
    secondFlavorDocumentKey?: string;
    secondFlavorNameSnapshot?: string;
    maxFlavorsForSize: number;
    pricingPolicy: PizzaPricingPolicy;
    priceStatus: PriceStatus;
  };
  customerNote?: string;
  unitPrice?: number;
  priceComponents?: Array<{
    kind: "produto" | "opcao" | "complemento" | "upgrade" | "ajuste";
    label: string;
    amount?: number;
    priceStatus: PriceStatus;
    documentKey?: string;
  }>;
  itemTotal?: number;
  createdAt: string;
  updatedAt: string;
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

export function hasConfirmedPrice(
  priceStatus: PriceStatus | undefined,
  price: number | undefined,
) {
  return (
    priceStatus === "confirmado" &&
    typeof price === "number" &&
    Number.isFinite(price) &&
    price >= 0
  );
}

export function isPendingPriceStatus(priceStatus: PriceStatus | undefined) {
  return priceStatus === "pendente" || priceStatus === "aguardando_confirmacao";
}

export function isOptionCommerciallySellable(
  option: CatalogOptionForSellability,
) {
  return (
    option.active &&
    option.sellable &&
    hasConfirmedPrice(option.priceStatus, option.price)
  );
}

export function getDocumentKeyConflict(
  existingId: string | undefined,
  currentId?: string,
) {
  return Boolean(existingId && existingId !== currentId);
}

export function assertDocumentKeyUpdateIsImmutable(
  currentDocumentKey: string | undefined,
  nextDocumentKey: string | undefined,
) {
  if (
    nextDocumentKey !== undefined &&
    currentDocumentKey !== undefined &&
    nextDocumentKey !== currentDocumentKey
  ) {
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
  if (category && !category.active)
    return { sellable: false, reason: "inactive_category" };

  const sellableOptions = getSellableOptions(options);
  if (sellableOptions.length > 0) {
    return {
      sellable: true,
      reason: "sellable_option",
      priceFrom: sellableOptions[0].price,
    };
  }

  if (hasConfirmedPrice(product.priceStatus, product.basePrice)) {
    return {
      sellable: true,
      reason: "sellable_base_price",
      priceFrom: product.basePrice,
    };
  }

  if (product.priceStatus === undefined && hasLegacyPrice(product.price)) {
    return {
      sellable: true,
      reason: "sellable_base_price",
      priceFrom: product.price,
    };
  }

  return {
    sellable: false,
    reason:
      options.length > 0
        ? "missing_sellable_option"
        : "missing_confirmed_price",
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
  if (
    priceStatus === "confirmado" &&
    !hasConfirmedPrice(priceStatus, basePrice)
  ) {
    throw new Error("base_price_confirmado_exige_valor");
  }
}

export function assertComplementGroupInvariants({
  minSelections,
  maxSelections,
  required,
}: {
  minSelections: number;
  maxSelections?: number;
  required: boolean;
}) {
  if (!Number.isInteger(minSelections) || minSelections < 0) {
    throw new Error("minimo_complementos_invalido");
  }
  if (
    maxSelections !== undefined &&
    (!Number.isInteger(maxSelections) || maxSelections < minSelections)
  ) {
    throw new Error("maximo_complementos_invalido");
  }
  if (required && minSelections < 1) {
    throw new Error("grupo_obrigatorio_exige_minimo");
  }
}

export function assertComplementItemPriceInvariants({
  active,
  sellable,
  price,
  priceStatus,
}: {
  active: boolean;
  sellable: boolean;
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
    throw new Error("complemento_inativo_nao_vendavel");
  }
}

export function isComplementItemSellable(
  item: CatalogComplementItemForValidation,
) {
  return (
    item.active &&
    item.sellable &&
    hasConfirmedPrice(item.priceStatus, item.price)
  );
}

export function validateComplementSelections({
  groups,
  selections,
}: {
  groups: CatalogComplementGroupForValidation[];
  selections: ComplementSelectionInput[];
}) {
  const totalsByGroup = new Map<string, number>();
  const selectedByGroup = new Map<string, ComplementSelectionInput[]>();

  for (const selection of selections) {
    if (!Number.isInteger(selection.quantity) || selection.quantity < 1) {
      throw new Error("quantidade_complemento_invalida");
    }
    totalsByGroup.set(
      selection.groupDocumentKey,
      (totalsByGroup.get(selection.groupDocumentKey) ?? 0) + selection.quantity,
    );
    selectedByGroup.set(selection.groupDocumentKey, [
      ...(selectedByGroup.get(selection.groupDocumentKey) ?? []),
      selection,
    ]);
  }

  for (const group of groups) {
    assertComplementGroupInvariants(group);
    if (!group.active) continue;

    const groupKey = group.documentKey ?? "";
    const groupTotal = totalsByGroup.get(groupKey) ?? 0;
    if (group.required && groupTotal < group.minSelections) {
      throw new Error("grupo_obrigatorio_sem_selecao");
    }
    if (groupTotal < group.minSelections) {
      throw new Error("selecao_abaixo_do_minimo");
    }
    if (group.maxSelections !== undefined && groupTotal > group.maxSelections) {
      throw new Error("selecao_acima_do_maximo");
    }

    for (const selection of selectedByGroup.get(groupKey) ?? []) {
      const item = group.items.find(
        (candidate) => candidate.documentKey === selection.itemDocumentKey,
      );
      if (!item) throw new Error("complemento_nao_pertence_ao_grupo");
      if (!isComplementItemSellable(item))
        throw new Error("complemento_indisponivel");
      if (
        item.maxQuantity !== undefined &&
        selection.quantity > item.maxQuantity
      ) {
        throw new Error("quantidade_complemento_acima_do_maximo");
      }
    }
  }

  const validGroupKeys = new Set(groups.map((group) => group.documentKey));
  for (const selection of selections) {
    if (!validGroupKeys.has(selection.groupDocumentKey))
      throw new Error("grupo_complemento_invalido");
  }
}

export function assertUpgradeInvariants({
  active,
  price,
  priceStatus,
  operationalStatus,
}: {
  active: boolean;
  price?: number;
  priceStatus: PriceStatus;
  operationalStatus: UpgradeOperationalStatus;
}) {
  if (priceStatus === "confirmado" && !hasConfirmedPrice(priceStatus, price)) {
    throw new Error("preco_confirmado_exige_valor");
  }
  if (isPendingPriceStatus(priceStatus) && active) {
    throw new Error("upgrade_com_preco_pendente_nao_vendavel");
  }
  if (active && operationalStatus !== "ativo") {
    throw new Error("upgrade_ativo_exige_modelagem_ativa");
  }
}

export function isUpgradeSellable(upgrade: CatalogUpgradeForValidation) {
  return (
    upgrade.active &&
    upgrade.operationalStatus === "ativo" &&
    hasConfirmedPrice(upgrade.priceStatus, upgrade.price)
  );
}

export function assertPizzaConfigurationInvariants(
  config: PizzaConfigurationForValidation,
) {
  if (config.allowedSizes.length === 0) throw new Error("pizza_sem_tamanho");
  for (const size of config.allowedSizes) {
    const max = config.maxFlavorsBySize[size];
    if (!Number.isInteger(max) || max < 1)
      throw new Error("maximo_sabores_invalido");
  }
  if (config.maxFlavorsBySize.P !== 1)
    throw new Error("pizza_p_nao_permite_segundo_sabor");
  if (
    !config.secondFlavorAllowed &&
    (config.maxFlavorsBySize.M > 1 || config.maxFlavorsBySize.G > 1)
  ) {
    throw new Error("segundo_sabor_desabilitado_com_limite_multiplo");
  }
}

export function getPizzaMaxFlavorsForSize(
  config: PizzaConfigurationForValidation,
  size: PizzaSize,
) {
  if (!config.active) throw new Error("pizza_configuracao_inativa");
  if (!config.allowedSizes.includes(size))
    throw new Error("tamanho_pizza_indisponivel");
  return config.maxFlavorsBySize[size];
}

export function validatePizzaFlavorSelection({
  config,
  size,
  flavorDocumentKeys,
}: {
  config: PizzaConfigurationForValidation;
  size: PizzaSize;
  flavorDocumentKeys: string[];
}) {
  assertPizzaConfigurationInvariants(config);
  const max = getPizzaMaxFlavorsForSize(config, size);
  if (flavorDocumentKeys.length < 1) throw new Error("pizza_sem_sabor");
  if (flavorDocumentKeys.length > max)
    throw new Error("quantidade_sabores_incompativel");
  if (new Set(flavorDocumentKeys).size !== flavorDocumentKeys.length) {
    throw new Error("sabor_duplicado_na_pizza");
  }
  if (flavorDocumentKeys.length > 1 && !config.secondFlavorAllowed) {
    throw new Error("segundo_sabor_nao_permitido");
  }
}

export function calculatePizzaPrice({
  config,
  size,
  flavors,
}: {
  config: PizzaConfigurationForValidation;
  size: PizzaSize;
  flavors: PizzaFlavorForPricing[];
}) {
  validatePizzaFlavorSelection({
    config,
    size,
    flavorDocumentKeys: flavors.map((flavor) => flavor.documentKey),
  });

  if (
    flavors.some(
      (flavor) => !hasConfirmedPrice(flavor.priceStatus, flavor.price),
    )
  ) {
    return {
      sellable: false,
      priceStatus: "pendente" as PriceStatus,
      price: undefined,
    };
  }

  if (flavors.length > 1 && config.pricingPolicy === "pendente_validacao") {
    return {
      sellable: false,
      priceStatus: "pendente" as PriceStatus,
      price: undefined,
    };
  }

  if (flavors.length > 1 && config.pricingPolicy === "media_arredondada_050") {
    const average =
      flavors.reduce((total, flavor) => total + flavor.price!, 0) /
      flavors.length;
    return {
      sellable: true,
      priceStatus: "confirmado" as PriceStatus,
      price: Math.round(average * 2) / 2,
    };
  }

  return {
    sellable: true,
    priceStatus: "confirmado" as PriceStatus,
    price: flavors[0].price,
  };
}

export function buildCatalogCartItemSnapshot(input: CatalogCartSnapshotInput) {
  if (!Number.isInteger(input.quantity) || input.quantity < 1)
    throw new Error("quantidade_item_invalida");
  for (const complement of input.complements ?? []) {
    if (!Number.isInteger(complement.quantity) || complement.quantity < 1) {
      throw new Error("quantidade_complemento_invalida");
    }
  }

  return {
    contractVersion: CATALOG_CART_CONTRACT_VERSION as "catalog-cart-v1",
    cartItemId: input.cartItemId,
    productId: input.productId,
    productDocumentKey: input.productDocumentKey,
    productNameSnapshot: input.productNameSnapshot,
    productDescriptionSnapshot: input.productDescriptionSnapshot,
    categoryId: input.categoryId,
    categoryDocumentKey: input.categoryDocumentKey,
    categoryNameSnapshot: input.categoryNameSnapshot,
    subcategorySnapshot: input.subcategorySnapshot,
    familySnapshot: input.familySnapshot,
    productOriginSnapshot: input.productOriginSnapshot,
    productionSectorSnapshot: input.productionSectorSnapshot,
    documentVersion: input.documentVersion,
    quantity: input.quantity,
    selectedOption: input.selectedOption,
    pizzaConfiguration: input.pizzaConfiguration,
    complements: input.complements?.map((complement) => ({
      ...complement,
      total:
        complement.unitPrice !== undefined &&
        complement.priceStatus === "confirmado"
          ? complement.unitPrice * complement.quantity
          : undefined,
    })),
    upgrade: input.upgrade,
    customerNote: input.customerNote,
    unitPrice: input.unitPrice,
    priceComponents: input.priceComponents,
    itemTotal: input.itemTotal,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  };
}
