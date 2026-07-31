import type { Product, ProductOption } from "./ProductSheet.tsx";

export type PizzaMode = "single" | "double";
export type PizzaSize = "P" | "M" | "G";
export type PizzaFlavorKind = "savory" | "sweet";

export type PizzaFlavorChoice = Pick<
  Product,
  | "_id"
  | "documentKey"
  | "name"
  | "description"
  | "price"
  | "basePrice"
  | "priceFrom"
  | "imageUrl"
  | "options"
  | "sizes"
  | "legacySizes"
  | "fallbackConfiguration"
> & {
  pizzaKind?: PizzaFlavorKind;
};

export type PizzaBuilderRequirement =
  | "type"
  | "size"
  | "flavor1"
  | "flavor2"
  | "border"
  | "complete";

export type PizzaBuilderUiStep =
  | Exclude<PizzaBuilderRequirement, "complete">
  | "flavor1Adjust"
  | "flavor2Adjust"
  | "addons"
  | "observation";

export type PizzaProgressStage =
  | "Escolha o tipo"
  | "Escolha o tamanho"
  | "Metades"
  | "Borda"
  | "Adicionais"
  | "Observa\u00e7\u00e3o";

export type PizzaBorderChoice = {
  key: string;
  name: string;
  price?: number;
  priceStatus?: "confirmado" | "pendente" | "aguardando_confirmacao";
  sellable?: boolean;
};

export type PizzaAddonScope = "flavor1" | "flavor2" | "global";

export type PizzaAddonItemForScope = {
  _id?: string;
  documentKey?: string;
  name: string;
  price?: number;
  priceStatus?: "confirmado" | "pendente" | "aguardando_confirmacao";
  maxQuantity?: number;
  sellable?: boolean;
  metadata?: Record<string, string>;
};

export type PizzaAddonGroupForScope<
  TItem extends PizzaAddonItemForScope = PizzaAddonItemForScope,
> = {
  _id?: string;
  documentKey?: string;
  name: string;
  description?: string;
  minSelections: number;
  maxSelections?: number;
  required: boolean;
  active?: boolean;
  rules?: Record<string, string>;
  items: TItem[];
};

export type PizzaPricingConfiguration = {
  allowedSizes: PizzaSize[];
  maxFlavorsBySize: Record<PizzaSize, number>;
  secondFlavorAllowed: boolean;
  pricingPolicy: "pendente_validacao" | "media_arredondada_050";
};

export const pizzaSizeLabels: Record<
  PizzaSize,
  { label: PizzaSize; slices: string; aria: string }
> = {
  P: { label: "P", slices: "4 fatias", aria: "Pizza pequena, 4 fatias" },
  M: { label: "M", slices: "6 fatias", aria: "Pizza media, 6 fatias" },
  G: { label: "G", slices: "8 fatias", aria: "Pizza grande, 8 fatias" },
};

export const defaultPizzaConfiguration = {
  allowedSizes: ["P", "M", "G"] as PizzaSize[],
  maxFlavorsBySize: { P: 1, M: 2, G: 2 } as Record<PizzaSize, number>,
  secondFlavorAllowed: true,
  pricingPolicy: "media_arredondada_050" as const,
};

export function getPizzaKey(
  flavor: {
    _id?: string;
    documentKey?: string;
    name: string;
  },
) {
  return flavor.documentKey ?? flavor._id ?? flavor.name;
}

export function getPizzaFlavorKind(
  flavor: (PizzaFlavorChoice & { pizzaKind?: PizzaFlavorKind }) | undefined,
) {
  return flavor?.pizzaKind ?? null;
}

export function filterPizzaFlavorsByKind<
  T extends PizzaFlavorChoice & { pizzaKind?: PizzaFlavorKind },
>(flavors: T[], kind: PizzaFlavorKind | null) {
  if (!kind) return flavors;
  return flavors.filter((flavor) => getPizzaFlavorKind(flavor) === kind);
}

export function arePizzaFlavorsCompatible(
  first: (PizzaFlavorChoice & { pizzaKind?: PizzaFlavorKind }) | undefined,
  second: (PizzaFlavorChoice & { pizzaKind?: PizzaFlavorKind }) | undefined,
) {
  const firstKind = getPizzaFlavorKind(first);
  const secondKind = getPizzaFlavorKind(second);
  return !firstKind || !secondKind || firstKind === secondKind;
}

export function getPizzaBuilderRequirement({
  mode,
  flavorKind,
  size,
  flavor1,
  flavor2,
  border,
}: {
  mode: PizzaMode;
  flavorKind?: PizzaFlavorKind | null;
  size?: PizzaSize | null;
  flavor1?: PizzaFlavorChoice;
  flavor2?: PizzaFlavorChoice;
  border?: PizzaBorderChoice | null;
}): PizzaBuilderRequirement {
  if (mode === "double" && !flavorKind) return "type";
  if (!size) return "size";
  if (!flavor1) return "flavor1";
  if (mode === "double" && !flavor2) return "flavor2";
  if (!border || getPizzaBorderPrice(border) === undefined) return "border";
  return "complete";
}

export function getPizzaBuilderStepOrder(mode: PizzaMode): PizzaBuilderUiStep[] {
  return mode === "double"
    ? [
        "type",
        "size",
        "flavor1",
        "flavor1Adjust",
        "flavor2",
        "flavor2Adjust",
        "addons",
        "border",
        "observation",
      ]
    : ["size", "flavor1", "flavor1Adjust", "addons", "border", "observation"];
}

export function getPizzaProgressStage(step: PizzaBuilderUiStep): {
  index: number;
  label: PizzaProgressStage;
} {
  if (step === "type") return { index: 1, label: "Escolha o tipo" };
  if (step === "size") return { index: 2, label: "Escolha o tamanho" };
  if (
    step === "flavor1" ||
    step === "flavor1Adjust" ||
    step === "flavor2" ||
    step === "flavor2Adjust"
  ) {
    return { index: 3, label: "Metades" };
  }
  if (step === "addons") return { index: 4, label: "Adicionais" };
  if (step === "border") return { index: 5, label: "Borda" };
  if (step === "observation") return { index: 6, label: "Observa\u00e7\u00e3o" };
  return { index: 6, label: "Observa\u00e7\u00e3o" };
}
export function getPizzaRemovalCountLabel(count: number) {
  if (count <= 0) return "Sem retiradas";
  if (count === 1) return "1 ingrediente retirado";
  return `${count} ingredientes retirados`;
}

export function getPizzaCurrentSummaryStatus({
  mode,
  flavorKind,
  size,
  complete,
}: {
  mode: PizzaMode;
  flavorKind?: PizzaFlavorKind | null;
  size?: PizzaSize | null;
  complete?: boolean;
}) {
  if (complete) {
    return mode === "double"
      ? "Conferir antes de adicionar"
      : "Conferir antes de adicionar";
  }
  if (mode === "double" && flavorKind && size) {
    const kindLabel = flavorKind === "savory" ? "Salgada" : "Doce";
    return `${kindLabel} · ${size} · 2 sabores`;
  }
  if (mode === "double" && flavorKind) {
    const kindLabel = flavorKind === "savory" ? "Salgada" : "Doce";
    return `${kindLabel} · 2 sabores`;
  }
  return mode === "double" ? "Montando · 2 sabores" : "Montando · 1 sabor";
}

export function getPizzaPrimaryActionLabel({
  step,
  total,
  readyForObservation = false,
}: {
  step: PizzaBuilderUiStep;
  total?: number;
  readyForObservation?: boolean;
}) {
  if (step === "type") return "Escolha o tipo";
  if (step === "size") return "Escolha o tamanho";
  if (step === "flavor1") return "Escolha a Metade 1";
  if (step === "flavor1Adjust") return "Confirmar Metade 1";
  if (step === "flavor2") return "Escolha a Metade 2";
  if (step === "flavor2Adjust") return "Confirmar Metade 2";
  if (step === "border")
    return readyForObservation ? "Escolha a borda" : "Escolha a borda";
  if (step === "addons") return "Escolha os adicionais";
  if (step === "observation") return "Adicionar";
  return total !== undefined
    ? `Adicionar · ${total.toFixed(2).replace(".", ",")}`
    : "Adicionar";
}
export function canExitPizzaBuilderWithoutConfirmation({
  flavorKind,
  size,
  flavor1,
  flavor2,
  border,
  observation,
}: {
  flavorKind?: PizzaFlavorKind | null;
  size?: PizzaSize | null;
  flavor1?: PizzaFlavorChoice;
  flavor2?: PizzaFlavorChoice;
  border?: PizzaBorderChoice | null;
  observation?: string;
}) {
  return !flavorKind && !size && !flavor1 && !flavor2 && !border && !observation;
}

export function shouldShowPizzaQuantity({
  step,
  complete,
}: {
  step: PizzaBuilderUiStep;
  complete: boolean;
}) {
  return complete;
}

export function getAllowedPizzaSizes(
  mode: PizzaMode,
  configuration: PizzaPricingConfiguration = defaultPizzaConfiguration,
) {
  return configuration.allowedSizes.filter((size) => {
    if (mode === "single") return true;
    return size !== "P" && configuration.maxFlavorsBySize[size] > 1;
  });
}

export function isPizzaSizeAllowed(
  mode: PizzaMode,
  size: PizzaSize,
  configuration: PizzaPricingConfiguration = defaultPizzaConfiguration,
) {
  return getAllowedPizzaSizes(mode, configuration).includes(size);
}

export function getConfirmedOptionPrice(option: ProductOption | undefined) {
  return option?.priceStatus === "confirmado" &&
    typeof option.price === "number" &&
    Number.isFinite(option.price)
    ? option.price
    : undefined;
}

export function getPizzaFlavorPrice(
  flavor: PizzaFlavorChoice | undefined,
  size: PizzaSize,
) {
  if (!flavor) return undefined;
  const structuredPrice = getConfirmedOptionPrice(
    flavor.options?.find(
      (option) =>
        option.optionType === "pizza_tamanho" && option.metadata?.size === size,
    ),
  );
  if (structuredPrice !== undefined) return structuredPrice;

  const legacySizes = flavor.legacySizes ?? flavor.sizes;
  const legacyIndex = size === "P" ? 0 : size === "M" ? 1 : 2;
  const legacySize = legacySizes?.[legacyIndex];
  const basePrice = flavor.price ?? flavor.basePrice ?? flavor.priceFrom;
  if (typeof basePrice !== "number" || !Number.isFinite(basePrice))
    return undefined;
  return basePrice + (legacySize?.extraPrice ?? 0);
}

export function roundPizzaPriceToHalf(value: number) {
  return Math.round(value * 2) / 2;
}

export function calculatePizzaFlavorUnitPrice({
  mode,
  size,
  flavor1,
  flavor2,
  configuration = defaultPizzaConfiguration,
}: {
  mode: PizzaMode;
  size: PizzaSize;
  flavor1?: PizzaFlavorChoice;
  flavor2?: PizzaFlavorChoice;
  configuration?: PizzaPricingConfiguration;
}) {
  if (!isPizzaSizeAllowed(mode, size, configuration)) return undefined;
  const firstPrice = getPizzaFlavorPrice(flavor1, size);
  if (firstPrice === undefined) return undefined;
  if (mode === "single") return firstPrice;
  const secondPrice = getPizzaFlavorPrice(flavor2, size);
  if (secondPrice === undefined) return undefined;
  return roundPizzaPriceToHalf((firstPrice + secondPrice) / 2);
}

export function getPizzaBorderPrice(border: PizzaBorderChoice | undefined) {
  if (!border || border.key === "none") return 0;
  if (
    border.sellable === false ||
    border.priceStatus !== "confirmado" ||
    typeof border.price !== "number" ||
    !Number.isFinite(border.price)
  ) {
    return undefined;
  }
  return border.price;
}

const pizzaAddonScopeKeys = [
  "pizzaAddonScope",
  "pizzaScope",
  "scope",
  "escopo",
];

export function normalizePizzaAddonScope(value: string | undefined | null) {
  if (!value) return null;
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

  if (["flavor1", "metade1", "half1", "sabor1"].includes(normalized)) {
    return "flavor1" satisfies PizzaAddonScope;
  }
  if (["flavor2", "metade2", "half2", "sabor2"].includes(normalized)) {
    return "flavor2" satisfies PizzaAddonScope;
  }
  if (["global", "pizza", "pizzainteira", "wholepizza"].includes(normalized)) {
    return "global" satisfies PizzaAddonScope;
  }
  return null;
}

function findExplicitPizzaAddonScope(
  records: Array<Record<string, string> | undefined>,
) {
  for (const record of records) {
    for (const key of pizzaAddonScopeKeys) {
      const scope = normalizePizzaAddonScope(record?.[key]);
      if (scope) return scope;
    }
  }
  return null;
}

export function getPizzaAddonItemScope<
  TItem extends PizzaAddonItemForScope,
  TGroup extends PizzaAddonGroupForScope<TItem>,
>(group: TGroup, item: TItem) {
  return findExplicitPizzaAddonScope([item.metadata, group.rules]);
}

export function isPizzaAddonItemSellable(item: PizzaAddonItemForScope) {
  return (
    item.sellable !== false &&
    item.priceStatus === "confirmado" &&
    typeof item.price === "number" &&
    Number.isFinite(item.price)
  );
}

export function getPizzaAddonGroupsForScope<
  TItem extends PizzaAddonItemForScope,
  TGroup extends PizzaAddonGroupForScope<TItem>,
>(groups: TGroup[], scope: PizzaAddonScope) {
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          getPizzaAddonItemScope(group, item) === scope &&
          isPizzaAddonItemSellable(item),
      ),
    }))
    .filter((group) => group.active !== false && group.items.length > 0);
}

export function getPizzaAddonSelectionTotal<
  TItem extends PizzaAddonItemForScope,
  TGroup extends PizzaAddonGroupForScope<TItem>,
>(groups: TGroup[], selected: Record<string, number>) {
  return groups.reduce(
    (total, group) =>
      total +
      group.items.reduce((groupTotal, item) => {
        const key = item.documentKey ?? item.name ?? item._id ?? "";
        const quantity = selected[key] ?? 0;
        return groupTotal + (item.price ?? 0) * quantity;
      }, 0),
    0,
  );
}

export function getPizzaAddonSelectedItems<
  TItem extends PizzaAddonItemForScope,
  TGroup extends PizzaAddonGroupForScope<TItem>,
>(groups: TGroup[], selected: Record<string, number>) {
  return groups.flatMap((group) =>
    group.items
      .map((item) => ({
        group,
        item,
        quantity: selected[item.documentKey ?? item.name ?? item._id ?? ""] ?? 0,
      }))
      .filter((selection) => selection.quantity > 0),
  );
}

export function getPizzaCompletionState({
  mode,
  size,
  flavor1,
  flavor2,
  border,
}: {
  mode: PizzaMode;
  size?: PizzaSize;
  flavor1?: PizzaFlavorChoice;
  flavor2?: PizzaFlavorChoice;
  border?: PizzaBorderChoice;
}) {
  if (!size) return { complete: false, reason: "Escolha o tamanho" };
  if (!flavor1) return { complete: false, reason: "Escolha o sabor 1" };
  if (mode === "double" && !flavor2)
    return { complete: false, reason: "Escolha o sabor 2" };
  if (!border) return { complete: false, reason: "Escolha a borda" };
  if (getPizzaBorderPrice(border) === undefined)
    return { complete: false, reason: "Borda indisponivel" };
  return { complete: true, reason: null };
}

export function buildPizzaSummary({
  mode,
  size,
  flavor1,
  flavor2,
  border,
  quantity,
}: {
  mode: PizzaMode;
  size: PizzaSize;
  flavor1?: PizzaFlavorChoice;
  flavor2?: PizzaFlavorChoice;
  border?: PizzaBorderChoice;
  quantity: number;
}) {
  return {
    mode,
    size,
    flavors: [flavor1, mode === "double" ? flavor2 : undefined]
      .filter(Boolean)
      .map((flavor) => ({
        documentKey: flavor!.documentKey,
        name: flavor!.name,
      })),
    border: border
      ? {
          key: border.key,
          name: border.name,
          price: getPizzaBorderPrice(border),
        }
      : undefined,
    quantity,
  };
}
