import { AnimatePresence, motion } from "motion/react";
import {
  HelpCircleIcon,
  MinusIcon,
  PlusIcon,
  ShoppingCartIcon,
  XIcon,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useQuery } from "convex/react";
import { Button } from "@/components/ui/button.tsx";
import { api } from "@/convex/_generated/api.js";
import type { Id } from "@/convex/_generated/dataModel.d.ts";

type PriceStatus = "confirmado" | "pendente" | "aguardando_confirmacao";
type PizzaSize = "P" | "M" | "G";

export type ProductOption = {
  _id?: Id<"productOptions">;
  documentKey?: string;
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
  metadata?: { size?: PizzaSize; displayHint?: string };
};

type ComplementItem = {
  _id?: Id<"complementItems">;
  documentKey?: string;
  name: string;
  price?: number;
  priceStatus: PriceStatus;
  maxQuantity?: number;
  sellable?: boolean;
};

type ComplementGroup = {
  _id?: Id<"complementGroups">;
  documentKey?: string;
  name: string;
  description?: string;
  minSelections: number;
  maxSelections?: number;
  required: boolean;
  items: ComplementItem[];
};

type UpgradeItem = {
  _id?: Id<"commercialUpgrades">;
  documentKey?: string;
  name: string;
  description?: string;
  price?: number;
  priceStatus: PriceStatus;
  operationalStatus: "pendente_modelagem" | "inativo" | "ativo";
  sellable?: boolean;
};

type PizzaConfiguration = {
  allowedSizes: PizzaSize[];
  maxFlavorsBySize: Record<PizzaSize, number>;
  secondFlavorAllowed: boolean;
  pricingPolicy: "pendente_validacao" | "media_arredondada_050";
};

type PizzaFlavor = {
  _id?: Id<"products">;
  documentKey?: string;
  name: string;
  options?: ProductOption[];
};

export type ProductCustomization = {
  complementGroups?: ComplementGroup[];
  upgrades?: UpgradeItem[];
  pizzaConfiguration?: PizzaConfiguration | null;
  pizzaFlavors?: PizzaFlavor[];
};

export type Product = {
  _id: Id<"products">;
  documentKey?: string;
  name: string;
  description?: string;
  price?: number;
  basePrice?: number;
  priceFrom?: number;
  source?: "structured" | "legacy";
  imageUrl?: string;
  hasSizes?: boolean;
  sizes?: Array<{ label: string; extraPrice: number }>;
  legacySizes?: Array<{ label: string; extraPrice: number }>;
  options?: ProductOption[];
  fallbackConfiguration?: ProductCustomization;
  cartKey?: string;
};

type Props = {
  product: Product | null;
  onAdd?: (product: Product) => void;
  onClose: () => void;
};

const formatSheetPrice = (value: number) => value.toFixed(2).replace(".", ",");
const keyOf = (item: {
  _id?: string;
  documentKey?: string;
  code?: string;
  label?: string;
  name?: string;
}) =>
  item.documentKey ?? item.code ?? item.label ?? item.name ?? item._id ?? "";
const isConfirmedPrice = (price: number | undefined, priceStatus?: string) =>
  priceStatus === "confirmado" &&
  typeof price === "number" &&
  Number.isFinite(price);
const optionPrice = (option: ProductOption | undefined) =>
  isConfirmedPrice(option?.price, option?.priceStatus)
    ? option?.price
    : undefined;
const roundPriceToHalf = (value: number) => Math.round(value * 2) / 2;
const pizzaFlavorPriceForSize = (
  flavor: PizzaFlavor | undefined,
  size: PizzaSize | undefined,
) =>
  size
    ? optionPrice(
        flavor?.options?.find(
          (option) =>
            option.optionType === "pizza_tamanho" &&
            option.metadata?.size === size,
        ),
      )
    : undefined;
const productDisplayBasePrice = (product: Product) =>
  product.price ?? product.basePrice ?? product.priceFrom;
const isFallbackProduct = (product: Product) =>
  String(product._id).startsWith("fallback_");

export default function ProductSheet({ product, onAdd, onClose }: Props) {
  const [qty, setQty] = useState(1);
  const [sizeIdx, setSizeIdx] = useState(0);
  const [selectedOptionKey, setSelectedOptionKey] = useState<string | null>(
    null,
  );
  const [selectedComplements, setSelectedComplements] = useState<
    Record<string, number>
  >({});
  const [selectedUpgradeKey, setSelectedUpgradeKey] = useState<string | null>(
    null,
  );
  const [selectedSecondFlavorKey, setSelectedSecondFlavorKey] = useState<
    string | null
  >(null);

  const isOpen = product !== null;
  const remoteConfiguration = useQuery(
    api.catalog.customizations.getProductConfiguration,
    product && !isFallbackProduct(product)
      ? { productId: product._id }
      : "skip",
  ) as ProductCustomization | null | undefined;
  const configuration =
    product?.fallbackConfiguration ?? remoteConfiguration ?? undefined;
  const productOptions = product?.options ?? [];
  const legacySizes = product?.legacySizes ?? product?.sizes;
  const pricedOptions = productOptions.filter((option) =>
    isConfirmedPrice(option.price, option.priceStatus),
  );
  const currentStructuredOption =
    productOptions.find((option) => keyOf(option) === selectedOptionKey) ??
    pricedOptions[0];
  const currentLegacySize =
    product?.hasSizes && legacySizes ? legacySizes[sizeIdx] : undefined;
  const pizzaConfiguration = configuration?.pizzaConfiguration ?? null;
  const currentPizzaSize = getCurrentPizzaSize(
    currentStructuredOption,
    currentLegacySize,
    sizeIdx,
  );
  const selectedSecondFlavor = (configuration?.pizzaFlavors ?? []).find(
    (flavor) => keyOf(flavor) === selectedSecondFlavorKey,
  );
  const primaryPizzaPrice =
    optionPrice(currentStructuredOption) ??
    (product && typeof product.price === "number"
      ? product.price + (currentLegacySize?.extraPrice ?? 0)
      : product
        ? productDisplayBasePrice(product)
        : undefined);
  const selectedSecondFlavorPrice = pizzaFlavorPriceForSize(
    selectedSecondFlavor,
    currentPizzaSize,
  );
  const basePrice = product
    ? pizzaConfiguration?.pricingPolicy === "media_arredondada_050" &&
      selectedSecondFlavor &&
      primaryPizzaPrice !== undefined &&
      selectedSecondFlavorPrice !== undefined
      ? roundPriceToHalf((primaryPizzaPrice + selectedSecondFlavorPrice) / 2)
      : primaryPizzaPrice
    : undefined;
  const hasTwoFlavorAverage =
    pizzaConfiguration?.pricingPolicy === "media_arredondada_050" &&
    Boolean(selectedSecondFlavor);

  const complementTotal = (configuration?.complementGroups ?? []).reduce(
    (total, group) =>
      total +
      group.items.reduce((groupTotal, item) => {
        const quantity = selectedComplements[keyOf(item)] ?? 0;
        return (
          groupTotal +
          (isConfirmedPrice(item.price, item.priceStatus)
            ? item.price! * quantity
            : 0)
        );
      }, 0),
    0,
  );
  const selectedUpgrade = (configuration?.upgrades ?? []).find(
    (upgrade) => keyOf(upgrade) === selectedUpgradeKey,
  );
  const upgradePrice =
    selectedUpgrade &&
    isConfirmedPrice(selectedUpgrade.price, selectedUpgrade.priceStatus)
      ? (selectedUpgrade.price ?? 0)
      : 0;
  const maxPizzaFlavors =
    currentPizzaSize && pizzaConfiguration
      ? pizzaConfiguration.maxFlavorsBySize[currentPizzaSize]
      : 1;
  const secondFlavorSelected = Boolean(selectedSecondFlavorKey);
  const pizzaMultiFlavorBlocked =
    Boolean(pizzaConfiguration) &&
    secondFlavorSelected &&
    pizzaConfiguration?.pricingPolicy === "pendente_validacao";
  const unitPrice =
    basePrice !== undefined && !pizzaMultiFlavorBlocked
      ? basePrice + complementTotal + upgradePrice
      : undefined;
  const total = unitPrice !== undefined ? unitPrice * qty : undefined;
  const selectedSizePriceText =
    pizzaConfiguration && primaryPizzaPrice !== undefined
      ? formatSheetPrice(primaryPizzaPrice)
      : undefined;
  const primaryPizzaPriceText =
    primaryPizzaPrice !== undefined
      ? formatSheetPrice(primaryPizzaPrice)
      : null;
  const secondFlavorPriceText =
    selectedSecondFlavorPrice !== undefined
      ? formatSheetPrice(selectedSecondFlavorPrice)
      : null;
  const validationMessage = getValidationMessage({
    groups: configuration?.complementGroups ?? [],
    selectedComplements,
    pizzaConfiguration,
    currentPizzaSize,
    secondFlavorSelected,
  });
  const canAdd = total !== undefined && !validationMessage;

  const handleOpen = () => {
    setQty(1);
    setSizeIdx(0);
    setSelectedOptionKey(null);
    setSelectedComplements({});
    setSelectedUpgradeKey(null);
    setSelectedSecondFlavorKey(null);
  };

  const toggleComplement = (item: ComplementItem, group: ComplementGroup) => {
    const itemKey = keyOf(item);
    if (!item.sellable || !isConfirmedPrice(item.price, item.priceStatus))
      return;
    setSelectedComplements((current) => {
      const currentQty = current[itemKey] ?? 0;
      if (currentQty > 0) {
        const next = { ...current };
        delete next[itemKey];
        return next;
      }
      const groupSelected = group.items.reduce(
        (total, candidate) => total + (current[keyOf(candidate)] ?? 0),
        0,
      );
      if (
        group.maxSelections !== undefined &&
        groupSelected >= group.maxSelections
      )
        return current;
      return { ...current, [itemKey]: 1 };
    });
  };

  return (
    <AnimatePresence onExitComplete={handleOpen}>
      {isOpen && product && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/45"
            onClick={onClose}
          />

          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-h-[86vh] max-w-md overflow-hidden rounded-t-3xl bg-card shadow-lg"
          >
            <div className="relative h-44 bg-muted">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[length:var(--catalog-text-sm)] font-semibold text-muted-foreground">
                  Produto
                </div>
              )}
              <button
                type="button"
                onClick={onClose}
                className="absolute right-3 top-3 rounded-full bg-black/40 p-1.5 text-white transition-colors hover:bg-black/60"
                aria-label="Fechar ficha do produto"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            <div
              className="space-y-3 overflow-y-auto overflow-x-hidden px-4 pb-5 pt-3"
              data-rvl-scroll
            >
              <div>
                <h2 className="text-[length:var(--catalog-text-lg)] font-extrabold leading-6 text-foreground">
                  {product.name}
                </h2>
                {product.description && (
                  <p className="mt-1 text-[length:var(--catalog-text-sm)] leading-snug text-muted-foreground">
                    {product.description}
                  </p>
                )}
              </div>

              <div>
                <p className="text-[length:var(--catalog-text-xs)] font-bold uppercase tracking-wide text-muted-foreground">
                  {hasTwoFlavorAverage
                    ? "Total"
                    : pizzaConfiguration
                      ? "Preco do tamanho"
                      : "Preco base"}
                </p>
                <p className="mt-0.5 text-[length:var(--catalog-text-title)] font-extrabold text-foreground">
                  {basePrice !== undefined
                    ? formatSheetPrice(basePrice)
                    : "Preco indisponivel"}
                </p>
              </div>

              {productOptions.length > 0 && (
                <ChoiceGroup title={pizzaConfiguration ? "Tamanho" : "Opcoes"}>
                  {productOptions.map((option) => {
                    const optionKey = keyOf(option);
                    const active =
                      keyOf(currentStructuredOption ?? {}) === optionKey;
                    const disabled = !isConfirmedPrice(
                      option.price,
                      option.priceStatus,
                    );
                    return (
                      <button
                        key={optionKey}
                        type="button"
                        onClick={() => {
                          setSelectedOptionKey(optionKey);
                          if (option.metadata?.size === "P")
                            setSelectedSecondFlavorKey(null);
                        }}
                        disabled={disabled}
                        className={`rounded-xl border px-3 py-1.5 text-[length:var(--catalog-text-sm)] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-transparent bg-secondary text-secondary-foreground"
                        }`}
                      >
                        {option.label}
                        {option.price !== undefined && (
                          <span className="ml-1 text-[length:var(--catalog-text-xs)] opacity-70">
                            {formatSheetPrice(option.price)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </ChoiceGroup>
              )}

              {productOptions.length === 0 &&
                product.hasSizes &&
                legacySizes &&
                legacySizes.length > 0 && (
                  <ChoiceGroup title="Tamanho">
                    {legacySizes.map((size, index) => (
                      <button
                        key={size.label}
                        type="button"
                        onClick={() => {
                          setSizeIdx(index);
                          if (index === 0) setSelectedSecondFlavorKey(null);
                        }}
                        className={`rounded-xl border px-3 py-1.5 text-[length:var(--catalog-text-sm)] font-semibold transition-colors ${
                          sizeIdx === index
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-transparent bg-secondary text-secondary-foreground"
                        }`}
                      >
                        {size.label}
                        {size.extraPrice > 0 && (
                          <span className="ml-1 text-[length:var(--catalog-text-xs)] opacity-70">
                            {pizzaConfiguration &&
                            typeof product.price === "number"
                              ? formatSheetPrice(
                                  product.price + size.extraPrice,
                                )
                              : `+${formatSheetPrice(size.extraPrice)}`}
                          </span>
                        )}
                      </button>
                    ))}
                  </ChoiceGroup>
                )}

              {pizzaConfiguration && (
                <ChoiceGroup
                  title="Sabores"
                  hint={
                    currentPizzaSize === "P"
                      ? "P permite 1 sabor."
                      : "M e G permitem ate 2 sabores."
                  }
                >
                  <div className="w-full rounded-xl bg-secondary px-3 py-2 text-[length:var(--catalog-text-sm)] font-semibold text-secondary-foreground">
                    {product.name}
                  </div>
                  {maxPizzaFlavors > 1 && (
                    <select
                      value={selectedSecondFlavorKey ?? ""}
                      onChange={(event) =>
                        setSelectedSecondFlavorKey(event.target.value || null)
                      }
                      className="h-9 min-w-0 rounded-xl border-0 bg-secondary px-3 text-[length:var(--catalog-text-sm)] font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary/25"
                      aria-label="Segundo sabor"
                    >
                      <option value="">Sem segundo sabor</option>
                      {(configuration?.pizzaFlavors ?? [])
                        .filter(
                          (flavor) =>
                            flavor.documentKey !== product.documentKey,
                        )
                        .map((flavor) => (
                          <option key={keyOf(flavor)} value={keyOf(flavor)}>
                            {flavor.name}
                          </option>
                        ))}
                    </select>
                  )}
                  {pizzaMultiFlavorBlocked && (
                    <p className="w-full text-[length:var(--catalog-text-xs)] font-semibold leading-snug text-[#b45309]">
                      Dois sabores ja estao modelados, mas aguardam validacao da
                      regra de preco.
                    </p>
                  )}
                </ChoiceGroup>
              )}

              {pizzaConfiguration && (
                <div className="rounded-2xl border border-[#efe2d8] bg-[#fff7f1] px-3 py-2.5 text-[#4d4036] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] dark:border-border/40 dark:bg-secondary/70 dark:text-foreground">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[length:var(--catalog-text-tiny)] font-bold uppercase tracking-wide text-muted-foreground">
                        Preco do tamanho selecionado
                      </p>
                      <p className="mt-0.5 text-[length:var(--catalog-text-sm)] font-extrabold">
                        {selectedSizePriceText ?? "Indisponivel"}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[length:var(--catalog-text-tiny)] font-bold uppercase tracking-wide text-muted-foreground">
                        Total do item
                      </p>
                      <p className="mt-0.5 text-[length:var(--catalog-text-sm)] font-extrabold text-[#f04a2a]">
                        {total !== undefined
                          ? formatSheetPrice(total)
                          : "Indisponivel"}
                      </p>
                    </div>
                  </div>
                  {selectedSecondFlavor ? (
                    <>
                      <p className="mt-2 text-[length:var(--catalog-text-xs)] font-semibold leading-snug text-muted-foreground">
                        2 sabores: media dos sabores arredondada para R$ 0,50.
                      </p>
                      {primaryPizzaPriceText && (
                        <p className="mt-1 text-[length:var(--catalog-text-xs)] leading-snug text-muted-foreground">
                          {product.name} {primaryPizzaPriceText}
                          {secondFlavorPriceText
                            ? ` + ${selectedSecondFlavor.name} ${secondFlavorPriceText}`
                            : ""}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="mt-2 text-[length:var(--catalog-text-xs)] font-semibold leading-snug text-muted-foreground">
                      Preco do sabor no tamanho selecionado.
                    </p>
                  )}
                </div>
              )}

              {(configuration?.complementGroups ?? []).map((group) => (
                <ChoiceGroup
                  key={keyOf(group)}
                  title={group.name}
                  hint={`${group.required ? "Obrigatorio" : "Opcional"} - minimo ${group.minSelections}${
                    group.maxSelections !== undefined
                      ? ` - maximo ${group.maxSelections}`
                      : ""
                  }`}
                >
                  {group.items.map((item) => {
                    const itemKey = keyOf(item);
                    const active = (selectedComplements[itemKey] ?? 0) > 0;
                    const disabled =
                      !item.sellable ||
                      !isConfirmedPrice(item.price, item.priceStatus);
                    return (
                      <button
                        key={itemKey}
                        type="button"
                        onClick={() => toggleComplement(item, group)}
                        disabled={disabled}
                        className={`flex min-h-9 items-center gap-2 rounded-xl px-3 py-1.5 text-left text-[length:var(--catalog-text-sm)] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
                          active
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        <span className="min-w-0 flex-1">{item.name}</span>
                        <span className="shrink-0 text-[length:var(--catalog-text-xs)] opacity-75">
                          {item.price !== undefined
                            ? `+${formatSheetPrice(item.price)}`
                            : "pendente"}
                        </span>
                      </button>
                    );
                  })}
                </ChoiceGroup>
              ))}

              {(configuration?.upgrades ?? []).length > 0 && (
                <ChoiceGroup title="Upgrade" hint="Oferta comercial separada.">
                  {(configuration?.upgrades ?? []).map((upgrade) => {
                    const upgradeKey = keyOf(upgrade);
                    const active = selectedUpgradeKey === upgradeKey;
                    const disabled =
                      !upgrade.sellable ||
                      !isConfirmedPrice(upgrade.price, upgrade.priceStatus);
                    return (
                      <button
                        key={upgradeKey}
                        type="button"
                        onClick={() =>
                          setSelectedUpgradeKey((current) =>
                            current === upgradeKey ? null : upgradeKey,
                          )
                        }
                        disabled={disabled}
                        className={`flex min-h-9 items-center gap-2 rounded-xl px-3 py-1.5 text-left text-[length:var(--catalog-text-sm)] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
                          active
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        <span className="min-w-0 flex-1">{upgrade.name}</span>
                        <span className="shrink-0 text-[length:var(--catalog-text-xs)] opacity-75">
                          {upgrade.price !== undefined
                            ? `+${formatSheetPrice(upgrade.price)}`
                            : "pendente"}
                        </span>
                      </button>
                    );
                  })}
                </ChoiceGroup>
              )}

              <div className="space-y-2">
                <p className="text-[length:var(--catalog-text-xs)] font-bold uppercase tracking-wide text-muted-foreground">
                  Observacao
                </p>
                <textarea
                  className="min-h-10 w-full resize-none rounded-xl border border-[#d9d5cc] bg-white px-3 py-2 text-[length:var(--catalog-text-sm)] text-foreground shadow-[inset_0_1px_2px_rgba(17,24,39,0.045)] outline-none placeholder:text-muted-foreground/80 focus:border-primary/60 focus:ring-2 focus:ring-primary/25 dark:border-border/55 dark:bg-background/70"
                  placeholder="Algum detalhe para este item?"
                  rows={2}
                />
              </div>

              <button
                type="button"
                className="flex h-9 w-full items-center justify-center gap-1.5 rounded-xl bg-secondary text-[length:var(--catalog-text-xs)] font-semibold text-secondary-foreground"
              >
                <HelpCircleIcon className="h-4 w-4 stroke-[1.8]" />
                Ajuda sobre este produto
              </button>

              <div className="flex items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2 rounded-xl bg-secondary px-2 py-1">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="rounded-lg p-1 transition-colors hover:bg-border"
                    aria-label="Diminuir quantidade"
                  >
                    <MinusIcon className="h-4 w-4 text-foreground" />
                  </button>
                  <span className="w-5 text-center text-[length:var(--catalog-text-title)] font-bold text-foreground">
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQty((q) => q + 1)}
                    className="rounded-lg p-1 transition-colors hover:bg-border"
                    aria-label="Aumentar quantidade"
                  >
                    <PlusIcon className="h-4 w-4 text-foreground" />
                  </button>
                </div>

                <Button
                  className="h-11 flex-1 gap-2 rounded-xl text-[length:var(--catalog-text-title)] font-bold disabled:bg-[#f2a699] disabled:text-white disabled:opacity-100 dark:disabled:bg-[#6b4a44]"
                  disabled={!canAdd}
                  onClick={() => {
                    if (unitPrice === undefined) return;
                    onAdd?.({
                      ...product,
                      price: unitPrice,
                      cartKey: [
                        product._id,
                        keyOf(currentStructuredOption ?? {}),
                        currentLegacySize?.label,
                        selectedSecondFlavorKey,
                        Object.entries(selectedComplements)
                          .filter(([, value]) => value > 0)
                          .map(([key]) => key)
                          .sort()
                          .join(","),
                        selectedUpgradeKey,
                      ]
                        .filter(Boolean)
                        .join("|"),
                    });
                    onClose();
                  }}
                >
                  <ShoppingCartIcon className="h-4 w-4" />
                  {validationMessage ??
                    (total === undefined
                      ? "Indisponivel"
                      : `Adicionar . ${formatSheetPrice(total)}`)}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ChoiceGroup({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-end justify-between gap-2">
        <p className="text-[length:var(--catalog-text-xs)] font-bold uppercase tracking-wide text-muted-foreground">
          {title}
        </p>
        {hint && (
          <p className="text-right text-[length:var(--catalog-text-tiny)] font-semibold leading-tight text-muted-foreground">
            {hint}
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function getCurrentPizzaSize(
  option: ProductOption | undefined,
  legacySize: { label: string } | undefined,
  legacyIndex: number,
) {
  if (option?.metadata?.size) return option.metadata.size;
  if (!legacySize) return undefined;
  if (legacyIndex === 0) return "P";
  if (legacyIndex === 1) return "M";
  return "G";
}

function getValidationMessage({
  groups,
  selectedComplements,
  pizzaConfiguration,
  currentPizzaSize,
  secondFlavorSelected,
}: {
  groups: ComplementGroup[];
  selectedComplements: Record<string, number>;
  pizzaConfiguration: PizzaConfiguration | null;
  currentPizzaSize?: PizzaSize;
  secondFlavorSelected: boolean;
}) {
  for (const group of groups) {
    const count = group.items.reduce(
      (total, item) => total + (selectedComplements[keyOf(item)] ?? 0),
      0,
    );
    if (group.required && count < group.minSelections)
      return `Escolha ${group.minSelections} em ${group.name}`;
    if (count < group.minSelections)
      return `Minimo ${group.minSelections} em ${group.name}`;
    if (group.maxSelections !== undefined && count > group.maxSelections)
      return `Maximo ${group.maxSelections} em ${group.name}`;
  }
  if (pizzaConfiguration && currentPizzaSize === "P" && secondFlavorSelected)
    return "P permite 1 sabor";
  if (
    pizzaConfiguration &&
    secondFlavorSelected &&
    pizzaConfiguration.pricingPolicy === "pendente_validacao"
  ) {
    return "Preco de 2 sabores pendente";
  }
  return null;
}
