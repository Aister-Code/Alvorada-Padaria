import { AnimatePresence, motion } from "motion/react";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Maximize2Icon,
  Minimize2Icon,
  MinusIcon,
  PlusIcon,
  SearchIcon,
  ShoppingCartIcon,
  XIcon,
} from "lucide-react";
import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
  type CSSProperties,
  type UIEvent,
} from "react";
import { useQuery } from "convex/react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { api } from "@/convex/_generated/api.js";
import type { ProductCustomization, Product } from "./ProductSheet.tsx";
import { pizzaAddonsPreviewComplementGroups } from "./pizzaBuilderPreviewFixtures.ts";
import {
  buildPizzaSummary,
  canExitPizzaBuilderWithoutConfirmation,
  calculatePizzaFlavorUnitPrice,
  defaultPizzaConfiguration,
  arePizzaFlavorsCompatible,
  filterPizzaFlavorsByKind,
  getAllowedPizzaSizes,
  getPizzaAddonGroupsForScope,
  getPizzaAddonSelectedItems,
  getPizzaAddonSelectionTotal,
  getPizzaBorderPrice,
  getPizzaBuilderStepOrder,
  getPizzaFlavorKind,
  getPizzaCompletionState,
  getPizzaCurrentSummaryStatus,
  getPizzaFlavorPrice,
  getPizzaKey,
  getPizzaPrimaryActionLabel,
  getPizzaRemovalCountLabel,
  pizzaSizeLabels,
  shouldShowPizzaQuantity,
  type PizzaBorderChoice,
  type PizzaAddonGroupForScope,
  type PizzaBuilderUiStep,
  type PizzaFlavorChoice,
  type PizzaFlavorKind,
  type PizzaMode,
  type PizzaSize,
} from "./pizzaBuilderUtils.ts";

type Props = {
  open: boolean;
  mode: PizzaMode;
  initialFlavor: PizzaFlavorChoice | null;
  flavors: PizzaFlavorChoice[];
  fallbackConfiguration?: ProductCustomization | null;
  onClose: () => void;
  onBackToList: () => void;
  onAdd: (product: Product) => void;
};

type PizzaComplementGroup = NonNullable<ProductCustomization["complementGroups"]>[number];
type PizzaComplementItem = PizzaComplementGroup["items"][number];
type ScopedPizzaComplementItem = PizzaComplementItem & {
  metadata?: Record<string, string>;
};
type ScopedPizzaComplementGroup = PizzaComplementGroup &
  PizzaAddonGroupForScope<ScopedPizzaComplementItem> & {
    rules?: Record<string, string>;
    items: ScopedPizzaComplementItem[];
  };

const getCustomizationKey = (item: {
  _id?: string;
  documentKey?: string;
  name?: string;
}) => item.documentKey ?? item.name ?? item._id ?? "";

const SELECTION_FEEDBACK_DURATION_MS = 260;
const NEXT_HALF_GUIDANCE_DURATION_MS = 750;
const selectionFeedbackClass =
  "motion-safe:animate-[pizzaSelectionFeedback_260ms_ease-out_1]";
const nextHalfGuidanceClass =
  "motion-safe:animate-[pizzaHalfGuidancePulse_750ms_ease-out_1]";
const pizzaSectionTitleClass =
  "text-[length:var(--catalog-text-xs)] font-extrabold uppercase tracking-wide text-[#A65312]";
const formatPizzaPrice = (value: number) => value.toFixed(2).replace(".", ",");
const modeLabel = {
  single: "UM SABOR",
  double: "DOIS SABORES",
} satisfies Record<PizzaMode, string>;
const modeHeaderLabel = {
  single: "UM SABOR",
  double: "DOIS SABORES",
} satisfies Record<PizzaMode, string>;

type PizzaActiveStep = PizzaBuilderUiStep;

const pizzaFlavorKindLabels = {
  savory: "Salgada",
  sweet: "Doce",
} satisfies Record<PizzaFlavorKind, string>;

function isFallbackProduct(product: PizzaFlavorChoice | null) {
  return Boolean(product && String(product._id).startsWith("fallback_"));
}

function normalizePizzaTerm(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function cleanPizzaFlavorName(name: string) {
  return name.replace(/^pizza\s+/i, "").trim();
}

function formatCompactSize(size: PizzaSize | null) {
  if (!size) return "Escolher";
  return `${size} \u00b7 ${pizzaSizeLabels[size].slices.toLowerCase()}`;
}

function titleCaseIngredient(value: string) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/^./, (letter) => letter.toUpperCase());
}

function getRemovableIngredients(flavor: PizzaFlavorChoice | undefined) {
  const descriptionParts = (flavor?.description ?? "")
    .replace(/\.$/, "")
    .split(/,|\se\s/gi)
    .map(titleCaseIngredient)
    .filter((item) => item.length > 2);
  if (descriptionParts.length > 0) return Array.from(new Set(descriptionParts));

  return cleanPizzaFlavorName(flavor?.name ?? "")
    .split(/\s+com\s+|\se\s+|\/|-/gi)
    .map(titleCaseIngredient)
    .filter((item) => item.length > 2 && !/^quatro$/i.test(item));
}

function buildRemovedSummaryLines(
  removed: Record<"flavor1" | "flavor2", string[]>,
) {
  return [
    removed.flavor1.length > 0
      ? `Metade 1: sem ${removed.flavor1.join(", ")}`
      : null,
    removed.flavor2.length > 0
      ? `Metade 2: sem ${removed.flavor2.join(", ")}`
      : null,
  ].filter((line): line is string => Boolean(line));
}

function mergePizzaFlavors({
  products,
  configuration,
  initialFlavor,
}: {
  products: PizzaFlavorChoice[];
  configuration?: ProductCustomization | null;
  initialFlavor: PizzaFlavorChoice | null;
}) {
  const map = new Map<string, PizzaFlavorChoice>();
  for (const product of products) {
    map.set(getPizzaKey(product), product);
  }
  if (initialFlavor) {
    map.set(getPizzaKey(initialFlavor), initialFlavor);
  }
  for (const flavor of configuration?.pizzaFlavors ?? []) {
    const key = getPizzaKey({
      _id: flavor._id,
      documentKey: flavor.documentKey,
      name: flavor.name,
    });
    const existing = map.get(key);
    const fallbackId = flavor._id ?? existing?._id ?? initialFlavor?._id;
    if (!fallbackId) continue;
    map.set(key, {
      ...existing,
      _id: fallbackId,
      documentKey: flavor.documentKey ?? existing?.documentKey,
      name: flavor.name,
      options: flavor.options ?? existing?.options,
      description: existing?.description,
      imageUrl: existing?.imageUrl,
      price: existing?.price,
      basePrice: existing?.basePrice,
      priceFrom: existing?.priceFrom,
      sizes: existing?.sizes,
      legacySizes: existing?.legacySizes,
    });
  }
  return Array.from(map.values()).filter((flavor) => flavor.name);
}

function buildBorderChoices({
  configuration,
  includeDevPricedBorder,
}: {
  configuration?: ProductCustomization | null;
  includeDevPricedBorder: boolean;
}) {
  const choices: PizzaBorderChoice[] = [
    {
      key: "none",
      name: "Sem borda",
      price: 0,
      priceStatus: "confirmado",
      sellable: true,
    },
  ];

  for (const upgrade of configuration?.upgrades ?? []) {
    choices.push({
      key: upgrade.documentKey ?? upgrade._id ?? upgrade.name,
      name: upgrade.name,
      price: upgrade.price,
      priceStatus: upgrade.priceStatus,
      sellable:
        upgrade.sellable !== false && upgrade.operationalStatus === "ativo",
    });
  }

  if (includeDevPricedBorder && choices.length === 1) {
    choices.push({
      key: "dev-borda-catupiry",
      name: "Borda de catupiry",
      price: 8,
      priceStatus: "confirmado",
      sellable: true,
    });
  }

  return choices;
}

export default function PizzaBuilder({
  open,
  mode,
  initialFlavor,
  flavors,
  fallbackConfiguration,
  onClose,
  onBackToList,
  onAdd,
}: Props) {
  const [selectedFlavorKind, setSelectedFlavorKind] =
    useState<PizzaFlavorKind | null>(null);
  const [selectedSize, setSelectedSize] = useState<PizzaSize | null>(
    mode === "double" ? null : "M",
  );
  const [flavor1Key, setFlavor1Key] = useState<string | null>(null);
  const [flavor2Key, setFlavor2Key] = useState<string | null>(null);
  const [borderKey, setBorderKey] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [observation, setObservation] = useState("");
  const [removedIngredients, setRemovedIngredients] = useState<
    Record<"flavor1" | "flavor2", string[]>
  >({ flavor1: [], flavor2: [] });
  const [selectedComplements, setSelectedComplements] = useState<Record<string, number>>({});
  const [selectedPreviewComplements, setSelectedPreviewComplements] = useState<Record<string, number>>({});
  const [confirmedHalves, setConfirmedHalves] = useState<
    Record<"flavor1" | "flavor2", boolean>
  >({ flavor1: false, flavor2: false });
  const [transitionMessage, setTransitionMessage] = useState("");
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [exitConfirmationOpen, setExitConfirmationOpen] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const [flavorSearch, setFlavorSearch] = useState("");
  const [observationExpanded, setObservationExpanded] = useState(false);
  const [half1EditPending, setHalf1EditPending] = useState(false);
  const [half2EditPending, setHalf2EditPending] = useState(false);
  const [openGlobalEditor, setOpenGlobalEditor] = useState<
    "type" | "size" | "border" | "addons" | "observation" | null
  >(null);
  const [activeStep, setActiveStep] = useState<PizzaActiveStep>(
    mode === "double" ? "type" : initialFlavor ? "size" : "flavor1",
  );
  const typeRef = useRef<HTMLDivElement | null>(null);
  const sizeRef = useRef<HTMLDivElement | null>(null);
  const firstFlavorRef = useRef<HTMLDivElement | null>(null);
  const secondFlavorRef = useRef<HTMLDivElement | null>(null);
  const borderRef = useRef<HTMLDivElement | null>(null);
  const addonsRef = useRef<HTMLDivElement | null>(null);
  const observationRef = useRef<HTMLDivElement | null>(null);
  const observationSummaryButtonRef = useRef<HTMLButtonElement | null>(null);
  const finalizationContentRef = useRef<HTMLDivElement | null>(null);
  const pendingExitActionRef = useRef<(() => void) | null>(null);
  const typeAdvanceTimerRef = useRef<number | null>(null);
  const selectionFeedbackTimerRef = useRef<number | null>(null);
  const halfGuidanceTimerRef = useRef<number | null>(null);
  const [selectionFeedbackKey, setSelectionFeedbackKey] = useState<string | null>(null);
  const [halfGuidanceKey, setHalfGuidanceKey] = useState<"flavor1" | "flavor2" | null>(null);

  const remoteConfiguration = useQuery(
    api.catalog.customizations.getProductConfiguration,
    initialFlavor && !isFallbackProduct(initialFlavor)
      ? { productId: initialFlavor._id }
      : "skip",
  ) as ProductCustomization | null | undefined;
  const configuration =
    fallbackConfiguration ??
    initialFlavor?.fallbackConfiguration ??
    remoteConfiguration ??
    null;
  const pizzaConfiguration =
    configuration?.pizzaConfiguration ?? defaultPizzaConfiguration;
  const allFlavors = useMemo(
    () => mergePizzaFlavors({ products: flavors, configuration, initialFlavor }),
    [configuration, flavors, initialFlavor],
  );
  const compatibleFlavors = useMemo(
    () =>
      mode === "double"
        ? filterPizzaFlavorsByKind(allFlavors, selectedFlavorKind)
        : allFlavors,
    [allFlavors, mode, selectedFlavorKind],
  );
  const borderChoices = useMemo(
    () =>
      buildBorderChoices({
        configuration,
        includeDevPricedBorder:
          isFallbackProduct(initialFlavor) || allFlavors.some(isFallbackProduct),
      }),
    [allFlavors, configuration, initialFlavor],
  );
  const flavor1 =
    allFlavors.find((flavor) => getPizzaKey(flavor) === flavor1Key) ??
    undefined;
  const flavor2 =
    allFlavors.find((flavor) => getPizzaKey(flavor) === flavor2Key) ??
    undefined;
  const selectedBorder =
    borderChoices.find((border) => border.key === borderKey) ?? undefined;
  const borderPrice = getPizzaBorderPrice(selectedBorder);
  const pizzaAddonsPreviewEnabled =
    import.meta.env.DEV &&
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("pizzaAddonsPreview") === "1";
  const realComplementGroups = (configuration?.complementGroups ??
    []) as ScopedPizzaComplementGroup[];
  const previewComplementGroups = useMemo(
    () =>
      pizzaAddonsPreviewEnabled
        ? (pizzaAddonsPreviewComplementGroups as unknown as ScopedPizzaComplementGroup[])
        : [],
    [pizzaAddonsPreviewEnabled],
  );
  const complementGroups = realComplementGroups;
  const previewHalf1ComplementGroups = useMemo(
    () => getPizzaAddonGroupsForScope(previewComplementGroups, "flavor1"),
    [previewComplementGroups],
  );
  const previewHalf2ComplementGroups = useMemo(
    () => getPizzaAddonGroupsForScope(previewComplementGroups, "flavor2"),
    [previewComplementGroups],
  );
  const previewGlobalComplementGroups = useMemo(
    () => getPizzaAddonGroupsForScope(previewComplementGroups, "global"),
    [previewComplementGroups],
  );
  const half1ComplementGroups = useMemo(
    () => getPizzaAddonGroupsForScope(complementGroups, "flavor1"),
    [complementGroups],
  );
  const half2ComplementGroups = useMemo(
    () => getPizzaAddonGroupsForScope(complementGroups, "flavor2"),
    [complementGroups],
  );
  const globalComplementGroups = useMemo(
    () => getPizzaAddonGroupsForScope(complementGroups, "global"),
    [complementGroups],
  );
  const scopedComplementGroups = useMemo(
    () => [
      ...half1ComplementGroups,
      ...half2ComplementGroups,
      ...globalComplementGroups,
    ],
    [globalComplementGroups, half1ComplementGroups, half2ComplementGroups],
  );
  const visualHalf1ComplementGroups =
    half1ComplementGroups.length > 0 ? half1ComplementGroups : previewHalf1ComplementGroups;
  const visualHalf2ComplementGroups =
    half2ComplementGroups.length > 0 ? half2ComplementGroups : previewHalf2ComplementGroups;
  const visualGlobalComplementGroups =
    globalComplementGroups.length > 0 ? globalComplementGroups : previewGlobalComplementGroups;
  const visualSelectedComplements =
    scopedComplementGroups.length > 0 ? selectedComplements : selectedPreviewComplements;
  const visualAddonsArePreview =
    pizzaAddonsPreviewEnabled && scopedComplementGroups.length === 0;
  const visualSelectedHalf1ComplementItems = getPizzaAddonSelectedItems(
    visualHalf1ComplementGroups,
    visualSelectedComplements,
  );
  const visualSelectedHalf2ComplementItems = getPizzaAddonSelectedItems(
    visualHalf2ComplementGroups,
    visualSelectedComplements,
  );
  const visualSelectedGlobalComplementItems = getPizzaAddonSelectedItems(
    visualGlobalComplementGroups,
    visualSelectedComplements,
  );
  const visualComplementTotal = getPizzaAddonSelectionTotal(
    [
      ...visualHalf1ComplementGroups,
      ...visualHalf2ComplementGroups,
      ...visualGlobalComplementGroups,
    ],
    visualSelectedComplements,
  );
  const complementTotal = getPizzaAddonSelectionTotal(
    scopedComplementGroups,
    selectedComplements,
  );
  const selectedComplementItems = getPizzaAddonSelectedItems(
    scopedComplementGroups,
    selectedComplements,
  );
  const selectedHalf1ComplementItems = getPizzaAddonSelectedItems(
    half1ComplementGroups,
    selectedComplements,
  );
  const selectedHalf2ComplementItems = getPizzaAddonSelectedItems(
    half2ComplementGroups,
    selectedComplements,
  );
  const selectedGlobalComplementItems = getPizzaAddonSelectedItems(
    globalComplementGroups,
    selectedComplements,
  );
  const flavorUnitPrice = selectedSize
    ? calculatePizzaFlavorUnitPrice({
        mode,
        size: selectedSize,
        flavor1,
        flavor2,
        configuration: pizzaConfiguration,
      })
    : undefined;
  const unitPrice =
    flavorUnitPrice !== undefined && borderPrice !== undefined
      ? flavorUnitPrice + borderPrice + complementTotal
      : undefined;
  const total = unitPrice !== undefined ? unitPrice * quantity : undefined;
  const reviewComplementTotal = visualAddonsArePreview
    ? visualComplementTotal
    : complementTotal;
  const reviewUnitPrice =
    flavorUnitPrice !== undefined && borderPrice !== undefined
      ? flavorUnitPrice + borderPrice + reviewComplementTotal
      : undefined;
  const reviewTotal =
    reviewUnitPrice !== undefined ? reviewUnitPrice * quantity : undefined;
  const completion = getPizzaCompletionState({
    mode,
    size: selectedSize ?? undefined,
    flavor1,
    flavor2,
    border: selectedBorder,
  });
  const allowedSizes = getAllowedPizzaSizes(mode, pizzaConfiguration);
  const filteredFlavors = compatibleFlavors.filter((flavor) => {
    const term = normalizePizzaTerm(flavorSearch.trim());
    if (!term) return true;
    return (
      normalizePizzaTerm(flavor.name).includes(term) ||
      normalizePizzaTerm(flavor.description ?? "").includes(term)
    );
  });
  const flavor1Price = selectedSize
    ? getPizzaFlavorPrice(flavor1, selectedSize)
    : undefined;
  const flavor2Price = selectedSize
    ? getPizzaFlavorPrice(flavor2, selectedSize)
    : undefined;
  const flavor1RemovableIngredients = getRemovableIngredients(flavor1);
  const flavor2RemovableIngredients = getRemovableIngredients(flavor2);
  const removedSummary = buildRemovedSummaryLines(removedIngredients).join(" | ");
  const formatComplementSelections = (
    selections: typeof selectedComplementItems,
  ) =>
    selections
      .map(({ item, quantity }) => `${item.name}${quantity > 1 ? ` x${quantity}` : ""}`)
      .join(", ");
  const half1ComplementSummary = formatComplementSelections(
    selectedHalf1ComplementItems,
  );
  const half2ComplementSummary = formatComplementSelections(
    selectedHalf2ComplementItems,
  );
  const globalComplementSummary = formatComplementSelections(
    selectedGlobalComplementItems,
  );
  const flavor1RemovalLabel = getPizzaRemovalCountLabel(
    removedIngredients.flavor1.length,
  );
  const flavor2RemovalLabel = getPizzaRemovalCountLabel(
    removedIngredients.flavor2.length,
  );
  const flavorSequenceConfirmed =
    mode === "single"
      ? Boolean(flavor1 && confirmedHalves.flavor1)
      : Boolean(
          selectedFlavorKind &&
            flavor1 &&
            flavor2 &&
            confirmedHalves.flavor1 &&
            confirmedHalves.flavor2,
        );
  const canRenderGlobalAddons =
    visualGlobalComplementGroups.length > 0 && flavorSequenceConfirmed;
  const canAdd = completion.complete && unitPrice !== undefined;
  const showQuantity = shouldShowPizzaQuantity({
    step: activeStep,
    complete: completion.complete,
  });
  const finalizationOpen = summaryExpanded && completion.complete;
  const showHalfTabs =
    (activeStep === "flavor1" ||
      activeStep === "flavor1Adjust" ||
      activeStep === "flavor2" ||
      activeStep === "flavor2Adjust") &&
    Boolean(selectedSize) &&
    (mode === "single" || Boolean(selectedFlavorKind));
  const activeHalf =
    activeStep === "flavor2" || activeStep === "flavor2Adjust"
      ? "flavor2"
      : "flavor1";
  const half2Unlocked = mode === "single" || confirmedHalves.flavor1;
  const lockHalfChoiceHeader =
    mode === "double" &&
    Boolean(selectedFlavorKind && selectedSize && showHalfTabs);
  const canShowBorderControl =
    Boolean(selectedSize) && flavorSequenceConfirmed;
  const showConfirmedHalvesContext =
    mode === "double" &&
    flavorSequenceConfirmed &&
    (activeStep === "addons" ||
      activeStep === "border" ||
      activeStep === "observation" ||
      openGlobalEditor === "addons" ||
      openGlobalEditor === "border" ||
      openGlobalEditor === "observation");

  useEffect(() => {
    if (
      !open ||
      mode !== "double" ||
      !selectedFlavorKind ||
      !selectedSize ||
      !["border", "addons", "observation"].includes(activeStep)
    ) {
      return;
    }
    if (!flavor1 || !confirmedHalves.flavor1) {
      setActiveStep(flavor1 ? "flavor1Adjust" : "flavor1");
      return;
    }
    if (!flavor2 || !confirmedHalves.flavor2) {
      setActiveStep(flavor2 ? "flavor2Adjust" : "flavor2");
    }
  }, [
    activeStep,
    confirmedHalves.flavor1,
    confirmedHalves.flavor2,
    flavor1,
    flavor2,
    mode,
    open,
    selectedFlavorKind,
    selectedSize,
  ]);

  useEffect(() => {
    if (!open || (activeStep !== "addons" && openGlobalEditor !== "addons")) {
      return;
    }
    if (canRenderGlobalAddons) return;

    setOpenGlobalEditor(null);
    if (mode === "double") {
      if (!flavor1 || !confirmedHalves.flavor1) {
        setActiveStep(flavor1 ? "flavor1Adjust" : "flavor1");
        return;
      }
      if (!flavor2 || !confirmedHalves.flavor2) {
        setActiveStep(flavor2 ? "flavor2Adjust" : "flavor2");
        return;
      }
    }
    setActiveStep("border");
  }, [
    activeStep,
    canRenderGlobalAddons,
    confirmedHalves.flavor1,
    confirmedHalves.flavor2,
    flavor1,
    flavor2,
    mode,
    open,
    openGlobalEditor,
  ]);
  useEffect(() => {
    if (!open) return;
    setSelectedFlavorKind(
      mode === "double" ? null : getPizzaFlavorKind(initialFlavor ?? undefined),
    );
    setSelectedSize(mode === "double" ? null : "M");
    setFlavor1Key(initialFlavor ? getPizzaKey(initialFlavor) : null);
    setFlavor2Key(null);
    setBorderKey("none");
    setQuantity(1);
    setObservation("");
    setRemovedIngredients({ flavor1: [], flavor2: [] });
    setSelectedComplements({});
    setSelectedPreviewComplements({});
    setConfirmedHalves({ flavor1: false, flavor2: false });
    setHalfGuidanceKey(null);
    setTransitionMessage("");
    setExitConfirmationOpen(false);
    if (typeAdvanceTimerRef.current) {
      window.clearTimeout(typeAdvanceTimerRef.current);
      typeAdvanceTimerRef.current = null;
    }
    setSummaryExpanded(false);
    setFlavorSearch("");
    setObservationExpanded(false);
    setHalf1EditPending(false);
    setHalf2EditPending(false);
    setOpenGlobalEditor(null);
    setActiveStep(mode === "double" ? "type" : initialFlavor ? "size" : "flavor1");
  }, [initialFlavor, mode, open]);

  useEffect(() => {
    return () => {
      if (typeAdvanceTimerRef.current) {
        window.clearTimeout(typeAdvanceTimerRef.current);
      }
      if (selectionFeedbackTimerRef.current) {
        window.clearTimeout(selectionFeedbackTimerRef.current);
      }
      if (halfGuidanceTimerRef.current) {
        window.clearTimeout(halfGuidanceTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (!selectedSize) return;
    if (allowedSizes.includes(selectedSize)) return;
    setSelectedSize(null);
  }, [allowedSizes, selectedSize]);

  useEffect(() => {
    if (mode === "single") setFlavor2Key(null);
  }, [mode]);

  useEffect(() => {
    if (mode !== "double" || !selectedFlavorKind) return;
    if (flavor1 && getPizzaFlavorKind(flavor1) !== selectedFlavorKind) {
      setFlavor1Key(null);
    }
    if (flavor2 && getPizzaFlavorKind(flavor2) !== selectedFlavorKind) {
      setFlavor2Key(null);
    }
  }, [flavor1, flavor2, mode, selectedFlavorKind]);

  const toggleRemovedIngredient = (
    slot: "flavor1" | "flavor2",
    ingredient: string,
  ) => {
    setRemovedIngredients((current) => {
      const selected = current[slot].includes(ingredient);
      return {
        ...current,
        [slot]: selected
          ? current[slot].filter((item) => item !== ingredient)
          : [...current[slot], ingredient],
      };
    });
  };

  const toggleComplement = (
    item: PizzaComplementItem,
    group: PizzaComplementGroup,
  ) => {
    const itemKey = getCustomizationKey(item);
    if (!itemKey) return;
    setSelectedComplements((current) => {
      const active = (current[itemKey] ?? 0) > 0;
      if (active) {
        const next = { ...current };
        delete next[itemKey];
        return next;
      }
      const selectedInGroup = group.items.reduce(
        (count, candidate) =>
          count + ((current[getCustomizationKey(candidate)] ?? 0) > 0 ? 1 : 0),
        0,
      );
      if (group.maxSelections !== undefined && selectedInGroup >= group.maxSelections) {
        const firstSelected = group.items.find(
          (candidate) => (current[getCustomizationKey(candidate)] ?? 0) > 0,
        );
        if (firstSelected) {
          const next = { ...current };
          delete next[getCustomizationKey(firstSelected)];
          return { ...next, [itemKey]: 1 };
        }
      }
      return { ...current, [itemKey]: 1 };
    });
  };

  const togglePreviewComplement = (
    item: ScopedPizzaComplementItem,
    group: ScopedPizzaComplementGroup,
  ) => {
    const itemKey = getCustomizationKey(item);
    if (!itemKey) return;
    setSelectedPreviewComplements((current) => {
      const active = (current[itemKey] ?? 0) > 0;
      if (active) {
        const next = { ...current };
        delete next[itemKey];
        return next;
      }
      const selectedInGroup = group.items.reduce(
        (count, candidate) =>
          count + ((current[getCustomizationKey(candidate)] ?? 0) > 0 ? 1 : 0),
        0,
      );
      if (group.maxSelections !== undefined && selectedInGroup >= group.maxSelections) {
        const firstSelected = group.items.find(
          (candidate) => (current[getCustomizationKey(candidate)] ?? 0) > 0,
        );
        if (firstSelected) {
          const next = { ...current };
          delete next[getCustomizationKey(firstSelected)];
          return { ...next, [itemKey]: 1 };
        }
      }
      return { ...current, [itemKey]: 1 };
    });
  };

  const handleAdd = () => {
    if (!selectedSize || !flavor1 || !completion.complete || unitPrice === undefined)
      return;
    const summary = buildPizzaSummary({
      mode,
      size: selectedSize,
      flavor1,
      flavor2,
      border: selectedBorder,
      quantity,
    });
    const cartName =
      mode === "double" && flavor2
        ? `Pizza ${selectedSize} - ${flavor1?.name.replace(/^Pizza /, "")} / ${flavor2.name.replace(/^Pizza /, "")}`
        : `Pizza ${selectedSize} - ${flavor1?.name.replace(/^Pizza /, "")}`;
    const cartDescription = [
      selectedBorder?.name,
      removedSummary ? `Retiradas: ${removedSummary}` : null,
      half1ComplementSummary
        ? `Adicionais da Metade 1: ${half1ComplementSummary}`
        : null,
      half2ComplementSummary
        ? `Adicionais da Metade 2: ${half2ComplementSummary}`
        : null,
      globalComplementSummary
        ? `Adicionais da pizza: ${globalComplementSummary}`
        : null,
      observation.trim() ? `Obs.: ${observation.trim()}` : null,
    ]
      .filter(Boolean)
      .join(" | ");
    onAdd({
      ...flavor1,
      name: cartName,
      description: cartDescription,
      price: unitPrice,
      cartKey: [
        "pizza-builder",
        mode,
        selectedSize,
        flavor1Key,
        flavor2Key,
        borderKey,
        half1ComplementSummary,
        half2ComplementSummary,
        globalComplementSummary,
        removedSummary,
        observation.trim(),
      ]
        .filter(Boolean)
        .join("|"),
      fallbackConfiguration: {
        ...flavor1.fallbackConfiguration,
        pizzaConfiguration,
      },
    } as Product);
    for (let index = 1; index < quantity; index += 1) {
      onAdd({
        ...flavor1,
        name: cartName,
        description: cartDescription,
        price: unitPrice,
        cartKey: [
          "pizza-builder",
          mode,
          selectedSize,
          flavor1Key,
          flavor2Key,
          borderKey,
          half1ComplementSummary,
          half2ComplementSummary,
          globalComplementSummary,
          removedSummary,
          observation.trim(),
        ]
          .filter(Boolean)
          .join("|"),
      } as Product);
    }
    void summary;
    onClose();
  };

  const hasDiscardableChoices =
    !canExitPizzaBuilderWithoutConfirmation({
      flavorKind: selectedFlavorKind,
      size: selectedSize,
      flavor1,
      flavor2,
      border: borderKey && borderKey !== "none" ? selectedBorder : null,
      observation: observation.trim(),
    }) ||
    removedIngredients.flavor1.length > 0 ||
    removedIngredients.flavor2.length > 0 ||
    selectedComplementItems.length > 0;

  const requestExit = (action: () => void) => {
    if (!hasDiscardableChoices) {
      action();
      return;
    }
    pendingExitActionRef.current = action;
    setExitConfirmationOpen(true);
  };

  const confirmExit = () => {
    const action = pendingExitActionRef.current ?? onClose;
    pendingExitActionRef.current = null;
    setExitConfirmationOpen(false);
    action();
  };

  const confirmHalf1 = () => {
    setConfirmedHalves((current) => ({ ...current, flavor1: true }));
    setHalf1EditPending(false);
    setHalf2EditPending(false);
    if (mode === "double") {
      setActiveStep("flavor2");
      setTransitionMessage("Agora escolha a Metade 2.");
      triggerHalfGuidance("flavor2");
      window.setTimeout(() => {
        setTransitionMessage("");
      }, NEXT_HALF_GUIDANCE_DURATION_MS);
      return;
    }
    setActiveStep(visualGlobalComplementGroups.length > 0 ? "addons" : "border");
  };

  const confirmHalf2 = () => {
    setConfirmedHalves((current) => ({ ...current, flavor2: true }));
    setHalf2EditPending(false);
    setActiveStep(visualGlobalComplementGroups.length > 0 ? "addons" : "border");
  };

  const triggerSelectionFeedback = (key: string) => {
    if (prefersReducedMotion) return;
    if (selectionFeedbackTimerRef.current) {
      window.clearTimeout(selectionFeedbackTimerRef.current);
      selectionFeedbackTimerRef.current = null;
    }
    setSelectionFeedbackKey(null);
    window.requestAnimationFrame(() => {
      setSelectionFeedbackKey(key);
      selectionFeedbackTimerRef.current = window.setTimeout(() => {
        setSelectionFeedbackKey(null);
        selectionFeedbackTimerRef.current = null;
      }, SELECTION_FEEDBACK_DURATION_MS);
    });
  };
  const triggerHalfGuidance = (half: "flavor1" | "flavor2") => {
    if (prefersReducedMotion) return;
    if (halfGuidanceTimerRef.current) {
      window.clearTimeout(halfGuidanceTimerRef.current);
      halfGuidanceTimerRef.current = null;
    }
    setHalfGuidanceKey(null);
    window.requestAnimationFrame(() => {
      setHalfGuidanceKey(half);
      halfGuidanceTimerRef.current = window.setTimeout(() => {
        setHalfGuidanceKey(null);
        halfGuidanceTimerRef.current = null;
      }, NEXT_HALF_GUIDANCE_DURATION_MS);
    });
  };
  const runAfterSelectionFeedback = (action: () => void) => {
    if (typeAdvanceTimerRef.current) {
      window.clearTimeout(typeAdvanceTimerRef.current);
      typeAdvanceTimerRef.current = null;
    }
    typeAdvanceTimerRef.current = window.setTimeout(
      () => {
        action();
        typeAdvanceTimerRef.current = null;
      },
      prefersReducedMotion ? 0 : SELECTION_FEEDBACK_DURATION_MS,
    );
  };
  const jumpTo = (target: PizzaActiveStep) => {
    setSummaryExpanded(false);
    const refs = {
      type: typeRef,
      size: sizeRef,
      flavor1: firstFlavorRef,
      flavor1Adjust: firstFlavorRef,
      flavor2: secondFlavorRef,
      flavor2Adjust: secondFlavorRef,
      border: borderRef,
      addons: addonsRef,
      observation: observationRef,
    };
    if (target === "type" || target === "size" || target === "border" || target === "addons" || target === "observation") {
      setOpenGlobalEditor(target);
    } else {
      setOpenGlobalEditor(null);
    }
    setActiveStep(target);
    refs[target].current?.scrollIntoView({ block: "start", behavior: "smooth" });
  };

  const concludeObservation = () => {
    setOpenGlobalEditor(null);
    setObservationExpanded(false);
    if (completion.complete) {
      setSummaryExpanded(true);
      return;
    }
    window.requestAnimationFrame(() => {
      observationSummaryButtonRef.current?.focus();
    });
  };

  const handleBack = () => {
    if (finalizationOpen) {
      setSummaryExpanded(false);
      return;
    }
    requestExit(onBackToList);
  };

  const primaryCtaLabel =
    canAdd && total !== undefined
      ? `Adicionar · ${formatPizzaPrice(total)}`
      : getPizzaPrimaryActionLabel({
          step: activeStep,
          total,
          readyForObservation: false,
        });
  const primaryCtaEnabled = canAdd;

  const handlePrimaryAction = () => {
    if (canAdd) {
      handleAdd();
      return;
    }
    if (activeStep === "flavor1Adjust") {
      confirmHalf1();
      return;
    }
    if (activeStep === "flavor2Adjust") {
      confirmHalf2();
      return;
    }
  };

  const summaryStatus = getPizzaCurrentSummaryStatus({
    mode,
    flavorKind: selectedFlavorKind,
    size: selectedSize,
    complete: completion.complete,
  });
  const summaryFooterStatus = completion.complete
    ? "Conferir antes de adicionar"
    : summaryStatus;
  const finalizationSubtitle =
    mode === "double" && selectedFlavorKind
      ? `${pizzaFlavorKindLabels[selectedFlavorKind].toUpperCase()} · 2 SABORES`
      : modeHeaderLabel[mode];

  useEffect(() => {
    if (!completion.complete && summaryExpanded) {
      setSummaryExpanded(false);
    }
  }, [completion.complete, summaryExpanded]);

  useEffect(() => {
    if (!finalizationOpen) return;
    finalizationContentRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [finalizationOpen]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (finalizationOpen) {
        setSummaryExpanded(false);
        return;
      }
      requestExit(onClose);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [finalizationOpen, onClose, open, requestExit]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="pizza-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/58"
            onClick={() => requestExit(onClose)}
          />
          <motion.section
            key="pizza-builder"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 mx-auto flex h-[100dvh] max-h-[100dvh] min-h-[100dvh] max-w-md flex-col overflow-hidden bg-[#fbfaf7] font-sans tracking-normal text-[#191815] shadow-2xl dark:bg-card dark:text-card-foreground"
            aria-label={finalizationOpen ? "Pizza Atual" : "Monte sua pizza"}
          >
            <style>{`
              @keyframes pizzaSelectionFeedback {
                0% { box-shadow: inset 0 0 0 1px rgba(240, 74, 42, 0.28), 0 0 0 0 rgba(240, 74, 42, 0.16); }
                58% { box-shadow: inset 0 0 0 1px rgba(240, 74, 42, 0.32), 0 0 0 4px rgba(240, 74, 42, 0.08); }
                100% { box-shadow: inset 0 0 0 1px rgba(240, 74, 42, 0), 0 0 0 0 rgba(240, 74, 42, 0); }
              }
              @keyframes pizzaHalfGuidancePulse {
                0% { box-shadow: inset 0 0 0 1px rgba(var(--pizza-half-pulse-rgb), 0.32), 0 0 0 0 rgba(var(--pizza-half-pulse-rgb), 0.28), 0 2px 8px rgba(var(--pizza-half-pulse-rgb), 0.12); }
                68% { box-shadow: inset 0 0 0 1px rgba(var(--pizza-half-pulse-rgb), 0.38), 0 0 0 8px rgba(var(--pizza-half-pulse-rgb), 0.06), 0 3px 10px rgba(var(--pizza-half-pulse-rgb), 0.14); }
                100% { box-shadow: inset 0 0 0 1px rgba(var(--pizza-half-pulse-rgb), 0.18), 0 0 0 0 rgba(var(--pizza-half-pulse-rgb), 0), 0 2px 8px rgba(var(--pizza-half-pulse-rgb), 0.10); }
              }
            `}</style>
            <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-[#eee6da]/60 bg-[#f7f3ea] px-[7.8px] pb-2 pt-[calc(env(safe-area-inset-top)+0.62rem)] dark:border-border/45 dark:bg-card">
              <button
                type="button"
                onClick={handleBack}
                className="flex h-6 w-6 items-center justify-center rounded-full border border-[#eadfce] bg-white/72 text-[#555c49] transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 dark:border-border/45 dark:bg-background/60 dark:text-muted-foreground"
                aria-label={finalizationOpen ? "Voltar para a montagem" : "Sair da montagem"}
              >
                <ChevronLeftIcon className="h-[14px] w-[14px]" />
              </button>
              <div className="min-w-0 flex-1 text-center">
                <h2 className="text-[14.5px] font-bold leading-[17px] text-[#151410]">
                  {finalizationOpen ? "Pizza Atual" : "Monte sua pizza"}
                </h2>
                <p className="mt-[1px] text-center text-[9px] font-semibold uppercase tracking-[0.085em] text-[#A65312] dark:text-muted-foreground">
                  <span>
                    {finalizationOpen ? finalizationSubtitle : modeHeaderLabel[mode]}
                  </span>
                </p>
              </div>
              <div className="h-6 w-6" aria-hidden="true" />
            </div>

            <div
              className={`flex-1 ${
                finalizationOpen
                  ? "min-h-0 overflow-hidden"
                  : `px-[7.8px] pt-3.5 ${
                      lockHalfChoiceHeader
                        ? "flex min-h-0 flex-col overflow-hidden pb-0"
                        : "overflow-y-auto pb-4"
                    }`
              }`}
            >
              <AnimatePresence mode="wait" initial={false}>
                {finalizationOpen ? (
                  <motion.div
                    key="pizza-finalization-view"
                    ref={finalizationContentRef}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReducedMotion ? undefined : { opacity: 0, y: -4 }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: "easeOut" }}
                    className="h-full overflow-y-auto px-3 py-3"
                    aria-label="Conferência da pizza atual"
                  >
                    <div className="grid gap-2">
                      {selectedSize && (
                        <FinalReviewCompactGroup
                          rows={[
                            {
                              label: "Tamanho",
                              value: formatCompactSize(selectedSize),
                              ariaLabel: "Editar tamanho",
                              onEdit: () => jumpTo("size"),
                            },
                          ]}
                        />
                      )}

                      <FinalHalfSummary
                        label="Metade 1"
                        flavorName={flavor1?.name}
                        removed={removedIngredients.flavor1}
                        addons={visualSelectedHalf1ComplementItems}
                        onEdit={() => jumpTo("flavor1Adjust")}
                      />
                      {mode === "double" && (
                        <FinalHalfSummary
                          label="Metade 2"
                          flavorName={flavor2?.name}
                          removed={removedIngredients.flavor2}
                          addons={visualSelectedHalf2ComplementItems}
                          onEdit={() => jumpTo("flavor2Adjust")}
                        />
                      )}

                      {visualSelectedGlobalComplementItems.length > 0 && (
                        <FinalGlobalAddonsSummary
                          items={visualSelectedGlobalComplementItems}
                          preview={visualAddonsArePreview}
                          onEdit={() => jumpTo("addons")}
                        />
                      )}

                      <FinalReviewCompactGroup
                        rows={[
                          {
                            label: "Borda",
                            value: selectedBorder?.name ?? "Sem borda",
                            ariaLabel: "Editar borda",
                            onEdit: () => jumpTo("border"),
                          },
                          {
                            label: "Observação",
                            value: formatFinalObservationLine(observation),
                            ariaLabel: "Editar observação",
                            onEdit: () => jumpTo("observation"),
                          },
                        ]}
                      />

                      <FinalPriceSummary
                        mode={mode}
                        flavorUnitPrice={flavorUnitPrice}
                        borderPrice={borderPrice}
                        half1Addons={visualSelectedHalf1ComplementItems}
                        half2Addons={visualSelectedHalf2ComplementItems}
                        globalAddons={visualSelectedGlobalComplementItems}
                        total={reviewUnitPrice}
                        preview={visualAddonsArePreview}
                      />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="pizza-assembly-view"
                    initial={prefersReducedMotion ? false : { opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReducedMotion ? undefined : { opacity: 0, y: 6 }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: "easeOut" }}
                    className={lockHalfChoiceHeader ? "flex min-h-0 flex-1 flex-col" : ""}
                  >
              {mode === "double" &&
                (!selectedFlavorKind || openGlobalEditor === "type") && (
                  <PizzaTypeStep
                    refTarget={typeRef}
                    selectedKind={selectedFlavorKind}
                    feedbackKey={selectionFeedbackKey}
                    onSelect={(kind) => {
                      triggerSelectionFeedback(`type:${kind}`);
                      setSelectedFlavorKind(kind);
                      setSelectedSize(null);
                      setBorderKey(null);
                      setConfirmedHalves({ flavor1: false, flavor2: false });
                                        setFlavorSearch("");
                      setHalf1EditPending(false);
                      setHalf2EditPending(false);
                      if (flavor1 && getPizzaFlavorKind(flavor1) !== kind) {
                        setFlavor1Key(null);
                      }
                      if (flavor2 && getPizzaFlavorKind(flavor2) !== kind) {
                        setFlavor2Key(null);
                      }
                      runAfterSelectionFeedback(() => {
                        setOpenGlobalEditor("size");
                        setActiveStep("size");
                      });
                    }}
                  />
                )}

              {mode === "double" &&
                selectedFlavorKind &&
                openGlobalEditor !== "type" && (
                <CompactTypeSummary
                  kind={selectedFlavorKind}
                  onEdit={() => {
                    setOpenGlobalEditor("type");
                    setActiveStep("type");
                  }}
                />
              )}

              {(mode === "single" || selectedFlavorKind) &&
                openGlobalEditor !== "size" && (
                <CompactGlobalSettings
                  selectedSize={selectedSize}
                  className={openGlobalEditor === "type" ? "mt-2.5" : "mt-0"}
                  onOpenSize={() => {
                    setActiveStep("size");
                    setOpenGlobalEditor("size");
                  }}
                />
              )}

              {(mode === "single" || selectedFlavorKind) &&
                (openGlobalEditor === "size" ||
                  (mode === "single" && activeStep === "size" && !selectedSize)) &&
                activeStep !== "type" && (
                  <PizzaSizeStep
                    refTarget={sizeRef}
                    mode={mode}
                    allowedSizes={allowedSizes}
                    selectedSize={selectedSize}
                    feedbackKey={selectionFeedbackKey}
                    onSelect={(size) => {
                      triggerSelectionFeedback(`size:${size}`);
                      setSelectedSize(size);
                      if (size === "P") setFlavor2Key(null);
                      setBorderKey(null);
                      setFlavorSearch("");
                      runAfterSelectionFeedback(() => {
                        setOpenGlobalEditor(null);
                        if (mode === "double") {
                          if (!flavor1 || !confirmedHalves.flavor1) {
                            setActiveStep(flavor1 ? "flavor1Adjust" : "flavor1");
                            triggerHalfGuidance("flavor1");
                            return;
                          }
                          if (!flavor2 || !confirmedHalves.flavor2) {
                            setActiveStep(flavor2 ? "flavor2Adjust" : "flavor2");
                            return;
                          }
                          setActiveStep("border");
                          return;
                        }
                        setActiveStep(flavor1 ? "border" : "flavor1");
                      });
                    }}
                  />
                )}

              {mode === "double" &&
                selectedSize &&
                selectedFlavorKind &&
                showHalfTabs && (
                  <PizzaHalvesStage
                    activeHalf={activeHalf}
                    choosingHalf={
                      activeStep === "flavor1"
                        ? "flavor1"
                        : activeStep === "flavor2"
                          ? "flavor2"
                          : null
                    }
                    flavor1Name={flavor1?.name}
                    flavor2Name={flavor2?.name}
                    flavor1Confirmed={confirmedHalves.flavor1}
                    flavor2Confirmed={confirmedHalves.flavor2}
                    flavor1EditPending={half1EditPending}
                    flavor2EditPending={half2EditPending}
                    half2Unlocked={half2Unlocked}
                    guidanceHalf={halfGuidanceKey}
                    searchValue={flavorSearch}
                    onSearchChange={setFlavorSearch}
                    onSelectFlavor1={() => {
                      setFlavorSearch("");
                      if (confirmedHalves.flavor1) {
                        setHalf1EditPending(true);
                      }
                      setHalf2EditPending(false);
                      setActiveStep(
                        activeHalf === "flavor1" && flavor1
                          ? "flavor1"
                          : flavor1
                            ? "flavor1Adjust"
                            : "flavor1",
                      );
                    }}
                    onSelectFlavor2={() => {
                      if (!half2Unlocked) return;
                      setFlavorSearch("");
                      setHalf1EditPending(false);
                      if (confirmedHalves.flavor2) {
                        setHalf2EditPending(true);
                      }
                      setActiveStep(
                        activeHalf === "flavor2" && flavor2
                          ? "flavor2"
                          : flavor2
                            ? "flavor2Adjust"
                            : "flavor2",
                      );
                    }}
                  >
                    {activeHalf === "flavor1" ? (
                      activeStep === "flavor1" || !flavor1 ? (
                        <FlavorStep
                          refTarget={firstFlavorRef}
                          title="Metade 1"
                          searchLabel="Metade 1"
                          hint="Escolha o sabor da primeira metade."
                          flavors={filteredFlavors}
                          selectedKey={flavor1Key}
                          selectedSize={selectedSize}
                          searchValue={flavorSearch}
                          onSearchChange={setFlavorSearch}
                          hideSearchHeader
                          onSelect={(key) => {
                            const sameFlavor = flavor1Key === key;
                            setFlavor1Key(key);
                            setHalf1EditPending(false);
                            if (flavor2Key === key) setFlavor2Key(null);
                            setConfirmedHalves((current) => ({
                              flavor1: false,
                              flavor2:
                                flavor2Key === key ? false : current.flavor2,
                            }));
                            setRemovedIngredients((current) => ({
                              flavor1: sameFlavor ? current.flavor1 : [],
                              flavor2: flavor2Key === key ? [] : current.flavor2,
                            }));
                            setFlavorSearch("");
                            setActiveStep("flavor1Adjust");
                          }}
                        />
                      ) : (
                        <HalfAdjustmentStep
                          refTarget={firstFlavorRef}
                          ingredients={flavor1RemovableIngredients}
                          selected={removedIngredients.flavor1}
                          addonGroups={visualHalf1ComplementGroups}
                          selectedComplements={visualSelectedComplements}
                          preview={visualAddonsArePreview}
                          slot="flavor1"
                          editPending={half1EditPending}
                          onToggle={toggleRemovedIngredient}
                          onToggleComplement={
                            visualAddonsArePreview ? togglePreviewComplement : toggleComplement
                          }
                          onConfirm={confirmHalf1}
                          confirmLabel="Confirmar Metade 1"
                        />
                      )
                    ) : activeStep === "flavor2" || !flavor2 ? (
                      <FlavorStep
                        refTarget={secondFlavorRef}
                        title="Metade 2"
                        searchLabel="Metade 2"
                        hint="Escolha o sabor da segunda metade."
                        flavors={filteredFlavors.filter(
                          (flavor) => getPizzaKey(flavor) !== flavor1Key,
                        )}
                        selectedKey={flavor2Key}
                        selectedSize={selectedSize}
                        searchValue={flavorSearch}
                        onSearchChange={setFlavorSearch}
                        hideSearchHeader
                        onSelect={(key) => {
                          const selectedFlavor = compatibleFlavors.find(
                            (flavor) => getPizzaKey(flavor) === key,
                          );
                          if (!arePizzaFlavorsCompatible(flavor1, selectedFlavor)) {
                            return;
                          }
                          const sameFlavor = flavor2Key === key;
                          setFlavor2Key(key);
                          setHalf2EditPending(false);
                          setConfirmedHalves((current) => ({
                            ...current,
                            flavor2: false,
                          }));
                          setRemovedIngredients((current) => ({
                            ...current,
                            flavor2: sameFlavor ? current.flavor2 : [],
                          }));
                          setFlavorSearch("");
                          setActiveStep("flavor2Adjust");
                        }}
                      />
                    ) : (
                      <HalfAdjustmentStep
                        refTarget={secondFlavorRef}
                        ingredients={flavor2RemovableIngredients}
                        selected={removedIngredients.flavor2}
                        addonGroups={visualHalf2ComplementGroups}
                        selectedComplements={visualSelectedComplements}
                        preview={visualAddonsArePreview}
                        slot="flavor2"
                        onToggle={toggleRemovedIngredient}
                        onToggleComplement={
                          visualAddonsArePreview ? togglePreviewComplement : toggleComplement
                        }
                        onConfirm={confirmHalf2}
                        confirmLabel="Confirmar Metade 2"
                      />
                    )}
                  </PizzaHalvesStage>
                )}

              {mode === "single" && selectedSize &&
                (activeStep === "flavor1" || !flavor1 ? (
                  <FlavorStep
                    refTarget={firstFlavorRef}
                    title="Metade 1"
                    searchLabel="Sabor 1"
                    hint="Escolha o sabor da primeira metade."
                    flavors={filteredFlavors}
                    selectedKey={flavor1Key}
                    selectedSize={selectedSize}
                    searchValue={flavorSearch}
                    onSearchChange={setFlavorSearch}
                    onSelect={(key) => {
                      const sameFlavor = flavor1Key === key;
                      setFlavor1Key(key);
                      if (flavor2Key === key) setFlavor2Key(null);
                      setConfirmedHalves((current) => ({
                        flavor1: false,
                        flavor2: flavor2Key === key ? false : current.flavor2,
                      }));
                      setRemovedIngredients((current) => ({
                        flavor1: sameFlavor ? current.flavor1 : [],
                        flavor2: flavor2Key === key ? [] : current.flavor2,
                      }));
                      setFlavorSearch("");
                      setActiveStep("flavor1Adjust");
                    }}
                  />
                ) : activeStep === "flavor1Adjust" ? (
                  <HalfAdjustmentStep
                    refTarget={firstFlavorRef}
                    ingredients={flavor1RemovableIngredients}
                    selected={removedIngredients.flavor1}
                    addonGroups={visualHalf1ComplementGroups}
                    selectedComplements={visualSelectedComplements}
                    preview={visualAddonsArePreview}
                    slot="flavor1"
                    editPending={half1EditPending}
                    onToggle={toggleRemovedIngredient}
                    onToggleComplement={
                      visualAddonsArePreview ? togglePreviewComplement : toggleComplement
                    }
                    onConfirm={confirmHalf1}
                    confirmLabel="Confirmar sabor"
                  />
                ) : (
                  <CollapsedStep
                    refTarget={firstFlavorRef}
                    title="Metade 1"
                    value={flavor1.name}
                    detail={flavor1RemovalLabel}
                    onEdit={() => jumpTo("flavor1")}
                  />
                ))}

              {showConfirmedHalvesContext && (
                <ConfirmedHalvesContext
                  flavor1Name={flavor1?.name}
                  flavor2Name={flavor2?.name}
                  flavor1Details={buildConfirmedHalfDetails(
                    removedIngredients.flavor1.length,
                    half1ComplementSummary,
                  )}
                  flavor2Details={buildConfirmedHalfDetails(
                    removedIngredients.flavor2.length,
                    half2ComplementSummary,
                  )}
                  onEditFlavor1={() => jumpTo("flavor1Adjust")}
                  onEditFlavor2={() => jumpTo("flavor2Adjust")}
                />
              )}

              {canRenderGlobalAddons &&
                (activeStep === "addons" || openGlobalEditor === "addons") && (
                <>
                  <AddonsStep
                    refTarget={addonsRef}
                    title="Adicionais da pizza"
                    groups={visualGlobalComplementGroups}
                    selected={visualSelectedComplements}
                    preview={visualAddonsArePreview}
                    showGroupTitles={false}
                    onToggle={visualAddonsArePreview ? togglePreviewComplement : toggleComplement}
                  />
                </>
              )}

              {canShowBorderControl &&
                activeStep !== "border" &&
                openGlobalEditor !== "border" && (
                  <div className="mt-2">
                    <CompactSettingRow
                      label="Borda"
                      value={selectedBorder?.name ?? "Escolher"}
                      onClick={() => {
                        setOpenGlobalEditor("border");
                        setActiveStep("border");
                      }}
                    />
                  </div>
                )}

              {(activeStep === "border" || openGlobalEditor === "border") && (
                <BorderStep
                  refTarget={borderRef}
                  choices={borderChoices}
                  selectedKey={borderKey}
                  feedbackKey={selectionFeedbackKey}
                  onSelect={(key) => {
                    triggerSelectionFeedback(`border:${key}`);
                    setBorderKey(key);
                    runAfterSelectionFeedback(() => {
                      setOpenGlobalEditor(null);
                      setActiveStep("observation");
                      setSummaryExpanded(true);
                    });
                  }}
                />
              )}

              {activeStep === "observation" && openGlobalEditor !== "observation" && (
                <ObservationSummaryStep
                  refTarget={observationRef}
                  buttonRef={observationSummaryButtonRef}
                  value={observation}
                  onOpen={() => setOpenGlobalEditor("observation")}
                />
              )}

              {openGlobalEditor === "observation" && (
                <ObservationStep
                  refTarget={observationRef}
                  value={observation}
                  expanded={observationExpanded}
                  onChange={setObservation}
                  onExpandedChange={setObservationExpanded}
                  onClose={concludeObservation}
                />
              )}

                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {finalizationOpen ? (
              (showQuantity || primaryCtaEnabled) && (
                <footer className="shrink-0 border-t border-[#6f7429] bg-[#626a2d] px-3 pb-[calc(env(safe-area-inset-bottom)+0.55rem)] pt-2 text-white">
                  <div className="flex items-center gap-2">
                    {showQuantity && (
                      <div className="flex h-10 items-center gap-2 rounded-[13px] bg-white px-2">
                        <button
                          type="button"
                          disabled={quantity <= 1}
                          onClick={() =>
                            setQuantity((current) => Math.max(1, current - 1))
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-[10px] text-[#24241f] hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-45"
                          aria-label="Diminuir quantidade"
                        >
                          <MinusIcon className="h-4 w-4" />
                        </button>
                        <span
                          aria-live="polite"
                          aria-atomic="true"
                          className="min-w-5 text-center text-[length:var(--catalog-text-title)] font-extrabold text-[#24241f]"
                        >
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity((current) => current + 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-[10px] text-[#24241f] hover:bg-black/5"
                          aria-label="Aumentar quantidade"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    {primaryCtaEnabled && (
                      <Button
                        className="h-10 flex-1 rounded-[13px] text-[length:var(--catalog-text-sm)] font-extrabold"
                        onClick={handlePrimaryAction}
                      >
                        {canAdd && <ShoppingCartIcon className="h-4 w-4" />}
                        {canAdd && reviewTotal !== undefined
                          ? `Adicionar · ${formatPizzaPrice(reviewTotal)}`
                          : primaryCtaLabel}
                      </Button>
                    )}
                  </div>
                </footer>
              )
            ) : (
              <footer className="shrink-0 border-t border-[#6f7429] bg-[#626a2d] px-[7.8px] pb-[calc(env(safe-area-inset-bottom)+0.55rem)] pt-2 text-white dark:border-border/60">
                <button
                  type="button"
                  onClick={() => {
                    if (completion.complete) setSummaryExpanded(true);
                  }}
                  className="flex w-full items-center justify-between gap-3 rounded-[14px] px-3 py-1.5 text-left text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/55"
                  aria-expanded={finalizationOpen}
                  aria-disabled={!completion.complete}
                >
                  <span className="flex min-w-0 flex-col leading-tight">
                    <span className="text-[length:var(--catalog-text-xs)] font-extrabold">
                      Pizza Atual
                    </span>
                    <span className="truncate text-[length:var(--catalog-text-xs)] font-semibold text-white/78">
                      {summaryFooterStatus}
                    </span>
                  </span>
                  <ChevronDownIcon className="h-4 w-4 shrink-0" />
                </button>
              </footer>
            )}
          </motion.section>
          {exitConfirmationOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 px-5">
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="pizza-exit-title"
                className="w-full max-w-[340px] rounded-[18px] bg-[#fbfaf7] p-4 text-[#191815] shadow-2xl dark:bg-card dark:text-card-foreground"
              >
                <h3
                  id="pizza-exit-title"
                  className="text-[length:var(--catalog-text-title)] font-extrabold"
                >
                  Sair da montagem?
                </h3>
                <p className="mt-1 text-[length:var(--catalog-text-sm)] font-medium text-[#716c60] dark:text-muted-foreground">
                  As escolhas feitas serão descartadas.
                </p>
                <div className="mt-4 grid gap-2">
                  <Button
                    type="button"
                    className="h-10 rounded-[13px] text-[length:var(--catalog-text-sm)] font-extrabold"
                    onClick={() => {
                      pendingExitActionRef.current = null;
                      setExitConfirmationOpen(false);
                    }}
                  >
                    Continuar montando
                  </Button>
                  <button
                    type="button"
                    onClick={confirmExit}
                    className="h-10 rounded-[13px] border border-[#e0d7c9] text-[length:var(--catalog-text-sm)] font-extrabold text-[#716c60] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 dark:border-border/50 dark:text-muted-foreground"
                  >
                    Sair da montagem
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}

function StepShell({
  refTarget,
  children,
  muted = false,
}: {
  refTarget?: RefObject<HTMLDivElement | null>;
  children: ReactNode;
  muted?: boolean;
}) {
  return (
    <section
      ref={refTarget}
      className={`mt-3 rounded-[14px] border border-[#e5e2dc] bg-white p-3 transition-opacity dark:border-border/40 dark:bg-background/55 ${
        muted ? "opacity-55" : ""
      }`}
    >
      {children}
    </section>
  );
}

function CollapsedStep({
  refTarget,
  title,
  value,
  detail,
  onEdit,
}: {
  refTarget: RefObject<HTMLDivElement | null>;
  title: string;
  value: string;
  detail?: string;
  onEdit: () => void;
}) {
  const editLabel = title.toLowerCase().startsWith("metade")
    ? `Editar ${title}, sabor ${value}`
    : `Editar ${title}`;

  return (
    <StepShell refTarget={refTarget}>
      <button
        type="button"
        onClick={onEdit}
        aria-label={editLabel}
        className="flex w-full items-center justify-between gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
      >
        <span>
          <span className="block text-[length:var(--catalog-text-xs)] font-bold uppercase tracking-wide text-[#716c60] dark:text-muted-foreground">
            {title}
          </span>
          <span className="mt-0.5 block text-[length:var(--catalog-text-sm)] font-extrabold text-[#24241f] dark:text-foreground">
            {value}
          </span>
          {detail && (
            <span className="mt-0.5 block text-[length:var(--catalog-text-xs)] font-semibold text-[#716c60] dark:text-muted-foreground">
              {detail}
            </span>
          )}
        </span>
        <ChevronDownIcon className="h-3.5 w-3.5 shrink-0 text-[#f04a2a]" aria-hidden="true" />
      </button>
    </StepShell>
  );
}

function FutureStep({ title, hint }: { title: string; hint: string }) {
  return (
    <StepShell muted>
      <p className="text-[length:var(--catalog-text-xs)] font-bold uppercase tracking-wide text-[#716c60] dark:text-muted-foreground">
        {title}
      </p>
      <p className="mt-0.5 text-[length:var(--catalog-text-xs)] font-semibold text-[#716c60] dark:text-muted-foreground">
        {hint}
      </p>
    </StepShell>
  );
}

function SelectionSquare({
  active,
  disabled = false,
}: {
  active: boolean;
  disabled?: boolean;
}) {
  return (
    <span
      className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-colors ${
        disabled
          ? "border-[#ddd6ca] bg-[#f4f1eb] text-[#9b9488]"
          : active
          ? "border-[#f04a2a] bg-[#f04a2a] text-white"
          : "border-[#d8d0c2] bg-white text-[#716c60]"
      }`}
      aria-hidden="true"
    >
      {active && <CheckIcon className="h-3 w-3" />}
    </span>
  );
}

function CompactTypeSummary({
  kind,
  onEdit,
}: {
  kind: PizzaFlavorKind;
  onEdit: () => void;
}) {
  return (
    <div className="mb-2">
      <CompactSettingRow
        label="Tipo"
        value={pizzaFlavorKindLabels[kind]}
        onClick={onEdit}
      />
    </div>
  );
}

function CompactGlobalSettings({
  selectedSize,
  className = "mt-0",
  onOpenSize,
}: {
  selectedSize: PizzaSize | null;
  className?: string;
  onOpenSize: () => void;
}) {
  return (
    <div className={`${className} grid gap-2`}>
      <CompactSettingRow
        label="Tamanho"
        value={formatCompactSize(selectedSize)}
        onClick={onOpenSize}
      />
    </div>
  );
}

function CompactSettingRow({
  label,
  value,
  onClick,
  buttonRef,
  ariaLabel,
}: {
  label: string;
  value: string;
  onClick: () => void;
  buttonRef?: RefObject<HTMLButtonElement | null>;
  ariaLabel?: string;
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="flex min-h-[32px] w-full items-center justify-between gap-3 rounded-[10px] border border-[#eee6da] bg-[#fcfaf6] px-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 dark:border-border/35 dark:bg-background/55"
    >
      <span className="text-[10.5px] font-medium text-[#716c60] dark:text-muted-foreground">
        {label}
      </span>
      <span className="flex min-w-0 items-center gap-1 text-right text-[10.5px] font-semibold text-[#191815] dark:text-foreground">
        <span className="truncate">{value}</span>
        <ChevronDownIcon className="h-3 w-3 shrink-0 text-[#ff6747]" />
      </span>
    </button>
  );
}

function PizzaHalvesStage({
  activeHalf,
  choosingHalf,
  flavor1Name,
  flavor2Name,
  flavor1Confirmed,
  flavor2Confirmed,
  flavor1EditPending,
  flavor2EditPending,
  half2Unlocked,
  guidanceHalf,
  searchValue,
  onSearchChange,
  onSelectFlavor1,
  onSelectFlavor2,
  children,
}: {
  activeHalf: "flavor1" | "flavor2";
  choosingHalf: "flavor1" | "flavor2" | null;
  flavor1Name?: string;
  flavor2Name?: string;
  flavor1Confirmed: boolean;
  flavor2Confirmed: boolean;
  flavor1EditPending: boolean;
  flavor2EditPending: boolean;
  half2Unlocked: boolean;
  guidanceHalf: "flavor1" | "flavor2" | null;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSelectFlavor1: () => void;
  onSelectFlavor2: () => void;
  children: ReactNode;
}) {
  const searchHalf = choosingHalf ?? activeHalf;
  const searchVisual = getPizzaHalfVisualStateClasses(
    searchHalf,
    searchHalf === "flavor1" ? "activeHalf1" : "activeHalf2",
  );
  const searchHasText = searchValue.trim().length > 0;
  const [halfSearchCollapsed, setHalfSearchCollapsed] = useState(false);
  const flavorListRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setHalfSearchCollapsed(false);
    flavorListRef.current?.scrollTo({ top: 0 });
  }, [choosingHalf]);

  useEffect(() => {
    if (searchHasText) setHalfSearchCollapsed(false);
  }, [searchHasText]);

  const handleFlavorListScroll = (event: UIEvent<HTMLDivElement>) => {
    if (!choosingHalf || searchHasText) return;
    if (event.currentTarget.scrollTop > 28) setHalfSearchCollapsed(true);
  };

  const firstHalfCard = (
    <HalfChoiceCard
      label="Metade 1"
      tone="flavor1"
      flavorName={flavor1Name}
      active={activeHalf === "flavor1"}
      choosing={choosingHalf === "flavor1"}
      editPending={flavor1EditPending}
      confirmed={flavor1Confirmed}
      disabled={false}
      highlight={guidanceHalf === "flavor1"}
      searchCollapsed={halfSearchCollapsed && choosingHalf === "flavor1" && !flavor1Name}
      onSearchOpen={() => {
        flavorListRef.current?.scrollTo({ top: 0 });
        setHalfSearchCollapsed(false);
      }}
      onClick={onSelectFlavor1}
    />
  );
  const secondHalfCard = (
    <HalfChoiceCard
      label="Metade 2"
      tone="flavor2"
      flavorName={flavor2Name}
      active={activeHalf === "flavor2"}
      choosing={choosingHalf === "flavor2"}
      editPending={flavor2EditPending}
      confirmed={flavor2Confirmed}
      disabled={!half2Unlocked}
      searchCollapsed={halfSearchCollapsed && choosingHalf === "flavor2" && !flavor2Name}
      onSearchOpen={() => {
        flavorListRef.current?.scrollTo({ top: 0 });
        setHalfSearchCollapsed(false);
      }}
      highlight={guidanceHalf === "flavor2"}
      onClick={onSelectFlavor2}
    />
  );
  const halfGridClass = "grid w-full grid-cols-2";
  const activeHalfLabel = choosingHalf === "flavor2" ? "Metade 2" : "Metade 1";

  const renderTopHalf = (
    slot: "flavor1" | "flavor2",
    label: "Metade 1" | "Metade 2",
    flavorName: string | undefined,
    disabled: boolean,
    onClick: () => void,
  ) => {
    const tone = getHalfTone(slot);
    const isChoosing = choosingHalf === slot;
    const confirmed = slot === "flavor1" ? flavor1Confirmed : flavor2Confirmed;
    const editPending = slot === "flavor1" ? flavor1EditPending : flavor2EditPending;
    const visual = getPizzaHalfVisualStateClasses(
      slot,
      resolvePizzaHalfVisualState(slot, {
        active: activeHalf === slot,
        choosing: isChoosing,
        confirmed,
        disabled,
        editPending,
      }),
    );
    const flavorLabel = flavorName?.replace(/^Pizza\s+/i, "");
    const showFlavorSummary = Boolean(flavorLabel && (!isChoosing || editPending));
    const ariaLabel = confirmed && flavorLabel
      ? `${label} concluída, sabor ${flavorLabel}. Toque para alterar.`
      : flavorName
        ? `${label}: ${flavorName}`
        : disabled
          ? label
          : `${label}: escolher sabor`;

    return (
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        aria-label={ariaLabel}
        title={flavorName}
        className={`flex h-[26px] min-w-0 flex-col justify-center px-2.5 text-left transition-colors disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 ${slot === "flavor1" ? "border-r border-[#e8dfd2]" : ""} ${visual.surface}`}
      >
        <span className={`block w-full truncate text-[8px] font-extrabold uppercase tracking-wide ${visual.title}`}>
          {label}
        </span>
        {showFlavorSummary && (
          <span className="mt-[1px] flex w-full min-w-0 items-center gap-1">
            <span className="block min-w-0 flex-1 truncate text-[10px] font-bold leading-[11px] text-[#2f2b25] dark:text-foreground/85">
              {flavorLabel}
            </span>
            {!isChoosing && (
              <ChevronDownIcon
                className={`h-3 w-3 shrink-0 ${tone.title}`}
                aria-hidden="true"
              />
            )}
          </span>
        )}
      </button>
    );
  };

  return (
    <section className="mt-2 flex min-h-0 flex-1 flex-col">
      <style>{`
      `}</style>
      {choosingHalf ? (
        <>
          <div
            className={`overflow-hidden rounded-[13px] ${searchVisual.contextualSurface} dark:bg-background/55 ${
              halfSearchCollapsed
                ? "border-0"
                : `border ${searchVisual.border} ${searchVisual.elevation} dark:border-border/35`
            } ${guidanceHalf === searchHalf ? nextHalfGuidanceClass : ""}`}
            style={
              guidanceHalf === searchHalf
                ? ({ "--pizza-half-pulse-rgb": searchVisual.pulseRgb } as CSSProperties)
                : undefined
            }
          >
            {halfSearchCollapsed ? (
              <div className={halfGridClass}>
                {firstHalfCard}
                {secondHalfCard}
              </div>
            ) : (
              <div>
                <div className={halfGridClass}>
                  {renderTopHalf("flavor1", "Metade 1", flavor1Name, false, onSelectFlavor1)}
                  {renderTopHalf("flavor2", "Metade 2", flavor2Name, !half2Unlocked, onSelectFlavor2)}
                </div>
                <label className={`relative flex h-[30px] items-center border-t ${searchVisual.border} ${searchVisual.contextualSurface} px-2.5 transition-colors dark:border-border/35 dark:bg-background/55`}>
                  <span className="sr-only">Buscar sabor para {activeHalfLabel}</span>
                  <SearchIcon className={`h-4 w-4 shrink-0 ${searchVisual.title}`} aria-hidden="true" />
                  <input
                    value={searchValue}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder="Digite ou role para escolher"
                    aria-label={`Buscar sabor para ${activeHalfLabel}`}
                    className="h-full min-w-0 flex-1 border-0 bg-transparent pl-2 pr-7 text-[length:var(--catalog-text-sm)] font-medium text-[#2f2b25] outline-none placeholder:text-[#9aa2aa] focus-visible:outline-none"
                    autoFocus
                  />
                  {searchValue.trim() && (
                    <button
                      type="button"
                      onClick={() => onSearchChange("")}
                      className="absolute right-1 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[#716c60] hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                      aria-label="Limpar busca de sabores"
                    >
                      <XIcon className="h-3.5 w-3.5" />
                    </button>
                  )}
                </label>
              </div>
            )}
          </div>
          <div
            ref={flavorListRef}
            onScroll={handleFlavorListScroll}
            className="mt-3 min-h-0 flex-1 overflow-y-auto pb-4"
          >
            {children}
          </div>
        </>
      ) : (
        <>
          <div className={`${halfGridClass} border-b border-[#e8dfd2]`}>
            {firstHalfCard}
            {secondHalfCard}
          </div>
          <div className="mt-2 min-h-0 flex-1 overflow-y-auto pb-4">
            {children}
          </div>
        </>
      )}
    </section>
  );
}

function HalfChoiceCard({
  label,
  tone,
  flavorName,
  active,
  choosing,
  editPending = false,
  confirmed,
  disabled,
  highlight = false,
  searchCollapsed = false,
  onSearchOpen,
  onClick,
}: {
  label: "Metade 1" | "Metade 2";
  tone: "flavor1" | "flavor2";
  flavorName?: string;
  active: boolean;
  choosing: boolean;
  editPending?: boolean;
  confirmed: boolean;
  disabled: boolean;
  highlight?: boolean;
  searchCollapsed?: boolean;
  onSearchOpen?: () => void;
  onClick: () => void;
}) {
  const halfTone = getHalfTone(tone);
  const visual = getPizzaHalfVisualStateClasses(
    tone,
    resolvePizzaHalfVisualState(tone, {
      active,
      choosing,
      confirmed,
      disabled,
      editPending,
    }),
  );
  const flavorLabel = flavorName?.replace(/^Pizza\s+/i, "");
  const isCurrent = (active || choosing) && !disabled;
  const detailLabel = flavorLabel ?? (isCurrent && searchCollapsed ? "Escolher sabor" : "");
  const ariaLabel = confirmed && flavorLabel && !editPending
    ? `${label} concluída, sabor ${flavorLabel}. Toque para alterar.`
    : `${label}${flavorName ? `: ${flavorName}` : isCurrent ? ": escolher sabor" : ""}`;

  return (
    <div
      className={`relative min-w-0 border-b transition-colors dark:border-border/35 ${visual.border} ${visual.surface} ${visual.elevation} ${
        highlight ? nextHalfGuidanceClass : ""
      }`}
      style={
        highlight
          ? ({ "--pizza-half-pulse-rgb": halfTone.pulseRgb } as CSSProperties)
          : undefined
      }
      aria-current={active ? "step" : undefined}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={searchCollapsed && onSearchOpen ? onSearchOpen : onClick}
        className="relative flex h-[46px] w-full flex-col justify-center gap-[2px] px-2 py-1 text-left transition-colors disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
        title={flavorName}
        aria-label={ariaLabel}
      >
        <span className="flex min-w-0 items-center gap-1">
          <span className={`block min-w-0 flex-1 truncate text-[9px] font-extrabold uppercase tracking-wide ${visual.title}`}>
            {label}
          </span>
        </span>
        <span className="flex min-w-0 items-center gap-1">
          <span className={`block min-w-0 flex-1 truncate text-[10px] font-bold leading-[12px] ${detailLabel ? "text-[#2f2b25] dark:text-foreground/85" : "text-transparent"}`}>
            {detailLabel || "-"}
          </span>
          {searchCollapsed && isCurrent ? (
            <SearchIcon className={`h-3.5 w-3.5 shrink-0 ${halfTone.title}`} aria-hidden="true" />
          ) : flavorLabel && !disabled ? (
            <ChevronDownIcon className={`h-3.5 w-3.5 shrink-0 ${halfTone.title}`} aria-hidden="true" />
          ) : null}
        </span>
      </button>
    </div>
  );
}

function PizzaTypeStep({
  refTarget,
  selectedKind,
  feedbackKey,
  onSelect,
}: {
  refTarget: RefObject<HTMLDivElement | null>;
  selectedKind: PizzaFlavorKind | null;
  feedbackKey: string | null;
  onSelect: (kind: PizzaFlavorKind) => void;
}) {
  const options: PizzaFlavorKind[] = ["savory", "sweet"];

  return (
    <section ref={refTarget} className="mt-3">
      <p className={pizzaSectionTitleClass}>
        Tipo
      </p>
      <div className="mt-2 overflow-hidden rounded-[13px] border border-[#e8dfd2]">
        {options.map((kind) => {
          const active = selectedKind === kind;
          return (
            <button
              key={kind}
              type="button"
              onClick={() => onSelect(kind)}
              aria-pressed={active}
              className={`flex min-h-[45px] w-full items-center gap-3 px-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 ${feedbackKey === `type:${kind}` ? selectionFeedbackClass : ""} ${active ? "bg-[#fff0e9] text-[#24140d]" : "bg-transparent text-[#38342d]"}`}
            >
              <SelectionSquare active={active} />
              <span className="font-extrabold text-[length:var(--catalog-text-sm)]">
                {pizzaFlavorKindLabels[kind]}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function PizzaSizeStep({
  refTarget,
  mode,
  allowedSizes,
  selectedSize,
  feedbackKey,
  onSelect,
}: {
  refTarget: RefObject<HTMLDivElement | null>;
  mode: PizzaMode;
  allowedSizes: PizzaSize[];
  selectedSize: PizzaSize | null;
  feedbackKey: string | null;
  onSelect: (size: PizzaSize) => void;
}) {
  void mode;

  return (
    <section ref={refTarget} className="mt-3">
      <p className={pizzaSectionTitleClass}>
        Tamanho
      </p>
      <div className="mt-2 overflow-hidden rounded-[13px] border border-[#e8dfd2]">
        {allowedSizes.map((size) => {
          const active = selectedSize === size;
          return (
            <button
              key={size}
              type="button"
              onClick={() => onSelect(size)}
              aria-pressed={active}
              className={`flex min-h-[45px] w-full items-center gap-3 border-t border-[#eee6da] px-3 text-left first:border-t-0 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 ${feedbackKey === `size:${size}` ? selectionFeedbackClass : ""} ${active ? "bg-[#fff0e9] text-[#24140d]" : "bg-transparent text-[#38342d]"}`}
            >
              <SelectionSquare active={active} />
              <span className="min-w-0 flex-1">
                <span className="block text-[length:var(--catalog-text-sm)] font-extrabold">
                  {size === "P" ? "Pequena" : size === "M" ? "Média" : "Grande"}
                </span>
                <span className="block text-[length:var(--catalog-text-xs)] font-semibold text-[#716c60]">
                  {pizzaSizeLabels[size].slices.toLowerCase()}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function FlavorStep({
  refTarget,
  title,
  searchLabel,
  hint,
  flavors,
  selectedKey,
  selectedSize,
  searchValue,
  onSearchChange,
  onSelect,
  hideSearchHeader = false,
}: {
  refTarget: RefObject<HTMLDivElement | null>;
  title: string;
  searchLabel: string;
  hint: string;
  flavors: PizzaFlavorChoice[];
  selectedKey: string | null;
  selectedSize: PizzaSize | null;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSelect: (key: string) => void;
  hideSearchHeader?: boolean;
}) {
  const disabled = !selectedSize;

  return (
    <div ref={refTarget}>
      {!hideSearchHeader && (
        <StepShell>
          <p className={pizzaSectionTitleClass}>
            {title}
          </p>
          <p className="mt-0.5 text-[length:var(--catalog-text-xs)] font-semibold text-[#716c60]">
            {hint}
          </p>
          <label className="relative mt-2 block h-9 rounded-[12px] border border-[#e8dfd2] bg-[#fbfaf7]">
            <span className="sr-only">Buscar {searchLabel.toLowerCase()} de pizza</span>
            <SearchIcon className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#716c60]" aria-hidden="true" />
            <Input
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Digite ou role para escolher"
              aria-label={`Buscar ${searchLabel.toLowerCase()} de pizza`}
              className="h-full border-0 bg-transparent pl-8 pr-8 shadow-none focus-visible:ring-0"
            />
            {searchValue.trim() && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-1 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[#716c60] hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                aria-label="Limpar busca de sabores"
              >
                <XIcon className="h-3.5 w-3.5" />
              </button>
            )}
          </label>
        </StepShell>
      )}
      <div className={`${hideSearchHeader ? "mt-0" : "mt-2"} grid gap-2`}>
        {flavors.map((flavor) => {
          const flavorKey = getPizzaKey(flavor);
          const active = selectedKey === flavorKey;
          const price = selectedSize ? getPizzaFlavorPrice(flavor, selectedSize) : undefined;
          return (
            <button
              key={flavorKey}
              type="button"
              disabled={disabled || price === undefined}
              onClick={() => onSelect(flavorKey)}
              className={`flex min-h-[68px] items-center gap-2 rounded-[13px] border px-2.5 py-2 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
                active
                  ? "border-[#f04a2a] bg-[#fff0e9]"
                  : "border-[#ece7dd] bg-[#fbfaf7] dark:border-border/40 dark:bg-card"
              }`}
            >
              <PizzaFlavorImage flavor={flavor} />
              <span className="min-w-0 flex-1">
                <span className="block line-clamp-2 text-[length:var(--catalog-text-sm)] font-extrabold leading-tight text-[#191815] dark:text-foreground">
                  {flavor.name}
                </span>
                {flavor.description && (
                  <span className="mt-0.5 line-clamp-2 text-[length:var(--catalog-text-xs)] leading-[var(--catalog-leading-sm)] text-[#667078] dark:text-muted-foreground">
                    {flavor.description}
                  </span>
                )}
              </span>
              <span className="shrink-0 text-right text-[length:var(--catalog-text-sm)] font-extrabold text-[#f04a2a]">
                {price !== undefined ? formatPizzaPrice(price) : "pendente"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
function HalfAdjustmentStep({
  refTarget,
  ingredients,
  selected,
  addonGroups,
  selectedComplements,
  preview = false,
  slot,
  editPending = false,
  onToggle,
  onToggleComplement,
  onConfirm,
  confirmLabel,
}: {
  refTarget: RefObject<HTMLDivElement | null>;
  ingredients: string[];
  selected: string[];
  addonGroups: ScopedPizzaComplementGroup[];
  selectedComplements: Record<string, number>;
  preview?: boolean;
  slot: "flavor1" | "flavor2";
  editPending?: boolean;
  onToggle: (slot: "flavor1" | "flavor2", ingredient: string) => void;
  onToggleComplement: (
    item: ScopedPizzaComplementItem,
    group: ScopedPizzaComplementGroup,
  ) => void;
  onConfirm: () => void;
  confirmLabel: string;
}) {
  const [removalOpen, setRemovalOpen] = useState(false);
  const [addonsOpen, setAddonsOpen] = useState(false);

  useEffect(() => {
    setRemovalOpen(false);
    setAddonsOpen(false);
  }, [slot]);

  return (
    <div
      ref={refTarget}
      className={`mt-2 rounded-[12px] px-1 pb-1 ${
        editPending ? "border border-[#f1d78f] bg-[#fff8e8] p-2" : ""
      }`}
    >
      <IngredientRemovalChecklist
        title="Quer retirar algo?"
        slot={slot}
        ingredients={ingredients}
        selected={selected}
        open={removalOpen}
        onOpenChange={setRemovalOpen}
        onToggle={onToggle}
      />
      <HalfAddonsChecklist
        groups={addonGroups}
        selected={selectedComplements}
        open={addonsOpen}
        preview={preview}
        onOpenChange={setAddonsOpen}
        onToggle={onToggleComplement}
      />
      <Button
        type="button"
        onClick={onConfirm}
        className="mx-auto mt-4 flex h-[34px] w-full max-w-[236px] rounded-[11px] text-[length:var(--catalog-text-xs)] font-bold"
      >
        {confirmLabel}
      </Button>
    </div>
  );
}

function IngredientRemovalChecklist({
  title,
  slot,
  ingredients,
  selected,
  open,
  onOpenChange,
  onToggle,
}: {
  title: string;
  slot: "flavor1" | "flavor2";
  ingredients: string[];
  selected: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggle: (slot: "flavor1" | "flavor2", ingredient: string) => void;
}) {
  const hasIngredients = ingredients.length > 0;

  if (!hasIngredients) return null;

  const isHalf2 = slot === "flavor2";
  const shellClassName = isHalf2
    ? "border-[#d7deca] bg-[#f3f6ec]"
    : "border-[#edcdbb] bg-[#fff4ee]";
  const titleClassName = isHalf2 ? "text-[#626A49]" : "text-[#8a4a18]";
  const selectedDecorationClassName = isHalf2
    ? "decoration-[#626A49]/50"
    : "decoration-[#A65312]/50";

  return (
    <div className={`rounded-[12px] border ${shellClassName}`}>
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className="flex min-h-[34px] w-full items-center justify-between gap-3 px-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
        aria-expanded={open}
      >
        <span className={`text-[length:var(--catalog-text-xs)] font-extrabold ${titleClassName}`}>
          {title}
        </span>
        <span className="flex items-center gap-2 text-[length:var(--catalog-text-xs)] font-semibold text-[#716c60]">
          <span>{selected.length > 0 ? `${selected.length} marcado(s)` : "(opcional)"}</span>
          <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
        </span>
      </button>
      {open && (
        <div className="border-t border-[#e8dfd2] bg-[#fbfaf7] px-3 pb-2 pt-2">
          <div className="grid gap-1.5">
            {ingredients.map((ingredient) => {
              const active = selected.includes(ingredient);
              return (
                <button
                  key={ingredient}
                  type="button"
                  onClick={() => onToggle(slot, ingredient)}
                  className="flex min-h-[30px] items-center gap-2 rounded-[9px] text-left text-[length:var(--catalog-text-xs)] font-semibold text-[#525846] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                  aria-pressed={active}
                >
                  <SelectionSquare active={active} />
                  <span className={active ? `line-through ${selectedDecorationClassName}` : ""}>
                    {active ? `Retirar ${ingredient}` : ingredient}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function HalfAddonsChecklist({
  groups,
  selected,
  open,
  preview = false,
  onOpenChange,
  onToggle,
}: {
  groups: ScopedPizzaComplementGroup[];
  selected: Record<string, number>;
  open: boolean;
  preview?: boolean;
  onOpenChange: (open: boolean) => void;
  onToggle: (
    item: ScopedPizzaComplementItem,
    group: ScopedPizzaComplementGroup,
  ) => void;
}) {
  const selectedCount = getPizzaAddonSelectedItems(groups, selected).reduce(
    (total, selection) => total + selection.quantity,
    0,
  );

  if (groups.length === 0) return null;

  return (
    <div className="mt-2 rounded-[12px] border border-[#e8dfd2] bg-[#fbfaf7]">
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className="flex min-h-[34px] w-full items-center justify-between gap-3 px-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
        aria-expanded={open}
      >
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="text-[length:var(--catalog-text-xs)] font-extrabold text-[#8a4a18]">
            {selectedCount > 0 ? "Adicionais" : "Quer adicionar algo?"}
          </span>
          {preview && <DevPreviewBadge />}
        </span>
        <span className="flex items-center gap-2 text-[length:var(--catalog-text-xs)] font-semibold text-[#716c60]">
          <span>
            {selectedCount > 0
              ? `${selectedCount} selecionado${selectedCount > 1 ? "s" : ""}`
              : "(opcional)"}
          </span>
          <ChevronDownIcon
            className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </span>
      </button>
      {open && (
        <div className="px-3 pb-2">
          <div className="grid gap-1.5">
            {groups.map((group) => (
              <div key={group.documentKey ?? group.name} className="grid gap-1.5">
                {groups.length > 1 && (
                  <p className="px-0.5 text-[10px] font-bold text-[#716c60]">
                    {group.name}
                    {group.maxSelections !== undefined
                      ? ` · até ${group.maxSelections}`
                      : ""}
                  </p>
                )}
                {group.items.map((item) => {
                  const key = getCustomizationKey(item);
                  const active = key ? (selected[key] ?? 0) > 0 : false;
                  return (
                    <button
                      key={key || item.name}
                      type="button"
                      onClick={() => onToggle(item, group)}
                      aria-pressed={active}
                      className={`flex min-h-[32px] items-center justify-between gap-3 rounded-[9px] text-left text-[length:var(--catalog-text-xs)] font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 ${
                        active ? "text-[#8a4a18]" : "text-[#525846]"
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <SelectionSquare active={active} />
                        <span className="truncate">{item.name}</span>
                      </span>
                      <span className="shrink-0 font-extrabold text-[#f04a2a]">
                        +{formatPizzaPrice(item.price ?? 0)}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DevPreviewBadge() {
  return (
    <span className="inline-flex h-[16px] shrink-0 items-center rounded-full border border-[#ded6c7] bg-[#f7f4ed] px-1.5 text-[8px] font-extrabold uppercase tracking-wide text-[#716c60]">
      PRÉVIA DEV
    </span>
  );
}

function BorderStep({
  refTarget,
  choices,
  selectedKey,
  feedbackKey,
  onSelect,
}: {
  refTarget: RefObject<HTMLDivElement | null>;
  choices: PizzaBorderChoice[];
  selectedKey: string | null;
  feedbackKey: string | null;
  onSelect: (key: string) => void;
}) {
  return (
    <section ref={refTarget} className="mt-3">
      <p className={pizzaSectionTitleClass}>
        Borda
      </p>
      <p className="mt-0.5 text-[length:var(--catalog-text-xs)] font-semibold text-[#716c60]">
        A mesma borda vale para a pizza inteira.
      </p>
      <div className="mt-2 grid gap-1.5">
        {choices.map((choice) => {
          const active = selectedKey === choice.key;
          return (
            <button
              key={choice.key}
              type="button"
              onClick={() => onSelect(choice.key)}
              aria-pressed={active}
              className={`flex min-h-[42px] items-center justify-between gap-3 rounded-[11px] border px-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 ${feedbackKey === `border:${choice.key}` ? selectionFeedbackClass : ""} ${active ? "border-[#f04a2a] bg-[#fff0e9]" : "border-[#e8dfd2] bg-[#fbfaf7]"}`}
            >
              <span className="flex min-w-0 items-center gap-2">
                <SelectionSquare active={active} />
                <span className="truncate font-extrabold text-[length:var(--catalog-text-sm)] text-[#24241f]">
                  {choice.name}
                </span>
              </span>
              <span className="text-[length:var(--catalog-text-xs)] font-extrabold text-[#f04a2a]">
                {choice.price ? `+${formatPizzaPrice(choice.price)}` : "0,00"}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function ConfirmedHalvesContext({
  flavor1Name,
  flavor2Name,
  flavor1Details,
  flavor2Details,
  onEditFlavor1,
  onEditFlavor2,
}: {
  flavor1Name?: string;
  flavor2Name?: string;
  flavor1Details: string[];
  flavor2Details: string[];
  onEditFlavor1: () => void;
  onEditFlavor2: () => void;
}) {
  return (
    <section className="mt-3 grid gap-2 text-[length:var(--catalog-text-xs)]">
      <div className="grid gap-1.5">
        <GlobalAddonsHalfSummary
          label="Metade 1"
          flavorName={flavor1Name}
          details={flavor1Details}
          onEdit={onEditFlavor1}
        />
        <GlobalAddonsHalfSummary
          label="Metade 2"
          flavorName={flavor2Name}
          details={flavor2Details}
          onEdit={onEditFlavor2}
        />
      </div>
    </section>
  );
}

function formatGlobalAddonsRemovalContext(count: number) {
  if (count <= 0) return "Sem retiradas";
  if (count === 1) return "1 item retirado";
  return `${count} itens retirados`;
}

function buildConfirmedHalfDetails(removalCount: number, complementSummary: string) {
  const details = [formatGlobalAddonsRemovalContext(removalCount)];
  if (complementSummary) {
    details.push(`Adicionais: ${complementSummary}`);
  }
  return details;
}

type PizzaAddonSelection = {
  item: {
    _id?: string;
    documentKey?: string;
    name?: string;
    price?: number;
  };
  quantity: number;
};

function formatAddonSelectionName({ item, quantity }: PizzaAddonSelection) {
  return `${item.name ?? "Adicional"}${quantity > 1 ? ` x${quantity}` : ""}`;
}

function FinalHalfSummary({
  label,
  flavorName,
  removed,
  addons,
  onEdit,
}: {
  label: "Metade 1" | "Metade 2";
  flavorName?: string;
  removed: string[];
  addons: PizzaAddonSelection[];
  onEdit: () => void;
}) {
  const isHalf2 = label === "Metade 2";
  const shellClassName = isHalf2
    ? "rounded-[12px] border border-[#d7deca] bg-[#f3f6ec] px-3 py-[7px]"
    : "rounded-[12px] border border-[#edcdbb] bg-[#fff4ee] px-3 py-[7px]";
  const titleClassName = isHalf2 ? "text-[#626A49]" : "text-[#8a4a18]";
  const editLabel = `Editar ${label}`;

  return (
    <section className={shellClassName}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`text-[10px] font-extrabold uppercase tracking-wide ${titleClassName}`}>
            {label}
          </p>
          <p className="mt-0.5 line-clamp-2 text-[length:var(--catalog-text-sm)] font-extrabold leading-snug text-[#24241f]">
            {flavorName ?? "pendente"}
          </p>
        </div>
        <FinalReviewChevronButton ariaLabel={editLabel} onEdit={onEdit} />
      </div>
      <div className="mt-1.5 grid gap-1 text-[length:var(--catalog-text-xs)]">
        <div>
          <p className="font-semibold leading-snug text-[#6d685d]">
            <span className="font-extrabold">Retiradas</span>
            <span className="text-[#8a8579]"> · </span>
            <span className="text-[#525846]">
              {removed.length > 0 ? removed.join(", ") : "Sem retiradas"}
            </span>
          </p>
        </div>
        {addons.length > 0 && (
          <div>
            <p className="font-semibold leading-snug text-[#6d685d]">
              <span className="font-extrabold">Adicionais</span>
              <span className="text-[#8a8579]"> · </span>
              <span className="text-[#525846]">
                {addons.map(formatAddonSelectionName).join(", ")}
              </span>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function FinalGlobalAddonsSummary({
  items,
  preview,
  onEdit,
}: {
  items: PizzaAddonSelection[];
  preview: boolean;
  onEdit: () => void;
}) {
  return (
    <section className="rounded-[12px] border border-[#eee6da] bg-white px-3 py-2 dark:border-border/40 dark:bg-background/65">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#716c60]">
              {items.length > 1 ? "Adicionais da pizza" : "Adicional da pizza"}
            </p>
            {preview && <DevPreviewBadge />}
          </div>
          <div className="mt-1 grid gap-0.5 text-[length:var(--catalog-text-xs)] font-semibold text-[#525846]">
            {items.map((selection) => (
              <p key={getCustomizationKey(selection.item)}>
                {formatAddonSelectionName(selection)}
              </p>
            ))}
          </div>
        </div>
        <FinalReviewChevronButton
          ariaLabel="Editar adicionais da pizza"
          onEdit={onEdit}
        />
      </div>
    </section>
  );
}
function FinalPriceSummary({
  mode,
  flavorUnitPrice,
  borderPrice,
  half1Addons,
  half2Addons,
  globalAddons,
  total,
  preview,
}: {
  mode: PizzaMode;
  flavorUnitPrice?: number;
  borderPrice?: number;
  half1Addons: PizzaAddonSelection[];
  half2Addons: PizzaAddonSelection[];
  globalAddons: PizzaAddonSelection[];
  total?: number;
  preview: boolean;
}) {
  const sumSelections = (items: PizzaAddonSelection[]) =>
    items.reduce(
      (sum, selection) =>
        sum + (selection.item.price ?? 0) * selection.quantity,
      0,
    );
  const half1AddonsTotal = sumSelections(half1Addons);
  const half2AddonsTotal = sumSelections(half2Addons);
  const globalAddonsTotal = sumSelections(globalAddons);
  const rows = [
    flavorUnitPrice !== undefined
      ? {
          label: mode === "double" ? "Pizza com 2 sabores" : "Pizza",
          value: flavorUnitPrice,
          prefix: "",
        }
      : null,
    half1AddonsTotal > 0
      ? {
          label: "Adicionais da Metade 1",
          value: half1AddonsTotal,
          prefix: "+",
        }
      : null,
    half2AddonsTotal > 0
      ? {
          label: "Adicionais da Metade 2",
          value: half2AddonsTotal,
          prefix: "+",
        }
      : null,
    globalAddonsTotal > 0
      ? {
          label: "Adicional da pizza",
          value: globalAddonsTotal,
          prefix: "+",
        }
      : null,
    borderPrice !== undefined
      ? {
          label: "Borda",
          value: borderPrice,
          prefix: "+",
        }
      : null,
  ].filter(Boolean) as Array<{ label: string; value: number; prefix: string }>;

  return (
    <section className="rounded-[13px] border border-[#eee6da] bg-white px-3 py-3 dark:border-border/40 dark:bg-background/65">
      <div className="flex items-end justify-between gap-3">
        <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#716c60]">
          {preview ? "Total da prévia" : "Total da pizza"}
        </p>
        {total !== undefined && (
          <p className="text-[21px] font-extrabold leading-none text-[#f04a2a]">
            {formatPizzaPrice(total)}
          </p>
        )}
      </div>
      <div className="mt-3 grid gap-1 border-t border-[#eee6da] pt-2 text-[length:var(--catalog-text-xs)]">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-3">
            <span className="font-medium text-[#756f63]">{row.label}</span>
            <span className="shrink-0 font-bold text-[#3a3831]">
              {row.prefix}
              {formatPizzaPrice(row.value)}
            </span>
          </div>
        ))}
        {total !== undefined && (
          <div className="mt-1 flex items-center justify-between gap-3 border-t border-[#eee6da] pt-2">
            <span className="font-extrabold text-[#24241f]">Total</span>
            <span className="shrink-0 font-extrabold text-[#f04a2a]">
              {formatPizzaPrice(total)}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

type FinalReviewCompactRow = {
  label: string;
  value: string;
  ariaLabel: string;
  onEdit: () => void;
};

function FinalReviewCompactGroup({ rows }: { rows: FinalReviewCompactRow[] }) {
  return (
    <section className="overflow-hidden rounded-[12px] border border-[#eee6da] bg-white dark:border-border/40 dark:bg-background/65">
      {rows.map((row, index) => (
        <Fragment key={row.label}>
          {index > 0 && <div className="h-px bg-[#eee6da]" aria-hidden="true" />}
          <FinalReviewCompactLine {...row} />
        </Fragment>
      ))}
    </section>
  );
}

function FinalReviewCompactLine({
  label,
  value,
  ariaLabel,
  onEdit,
}: {
  label: string;
  value: string;
  ariaLabel: string;
  onEdit: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onEdit}
      className="grid min-h-[42px] w-full grid-cols-[82px_minmax(0,1fr)_auto] items-center gap-2 px-3 py-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
      aria-label={ariaLabel}
    >
      <span className="text-[length:var(--catalog-text-xs)] font-bold text-[#716c60]">
        {label}
      </span>
      <span className="min-w-0 truncate text-[length:var(--catalog-text-xs)] font-semibold text-[#525846]">
        {value}
      </span>
      <FinalReviewChevronRightIcon />
    </button>
  );
}

function FinalReviewChevronButton({
  ariaLabel,
  onEdit,
}: {
  ariaLabel: string;
  onEdit: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onEdit}
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#f04a2a] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
      aria-label={ariaLabel}
    >
      <FinalReviewChevronRightIcon />
    </button>
  );
}

function FinalReviewChevronRightIcon() {
  return <ChevronRightIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />;
}

function formatFinalObservationLine(value: string) {
  const firstLine = value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);
  return firstLine || "Sem observação";
}

function GlobalAddonsHalfSummary({
  label,
  flavorName,
  details,
  onEdit,
}: {
  label: "Metade 1" | "Metade 2";
  flavorName?: string;
  details: string[];
  onEdit: () => void;
}) {
  const isHalf2 = label === "Metade 2";
  const shellClassName = isHalf2
    ? "rounded-[12px] border border-[#d7deca] bg-[#f3f6ec] px-3 py-2"
    : "rounded-[12px] border border-[#eee6da] bg-[#fcfaf6] px-3 py-2";
  const ariaFlavorName = flavorName ?? "pendente";

  return (
    <button
      type="button"
      onClick={onEdit}
      aria-label={`Editar ${label}, sabor ${ariaFlavorName}`}
      className={`${shellClassName} w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className={`text-[10px] font-extrabold uppercase tracking-wide ${
              isHalf2 ? "text-[#626A49]" : "text-[#8a4a18]"
            }`}
          >
            {label}
          </p>
          <p className="mt-0.5 line-clamp-2 text-[length:var(--catalog-text-sm)] font-extrabold leading-snug text-[#24241f]">
            {flavorName ?? "pendente"}
          </p>
          <div className="mt-1 grid gap-0.5">
            {details.map((detail) => (
              <p
                key={detail}
                className="truncate text-[length:var(--catalog-text-xs)] font-semibold text-[#716c60]"
              >
                {detail}
              </p>
            ))}
          </div>
        </div>
        <ChevronDownIcon className="mt-4 h-3.5 w-3.5 shrink-0 text-[#f04a2a]" aria-hidden="true" />
      </div>
    </button>
  );
}

function AddonsStep({
  refTarget,
  title,
  groups,
  selected,
  preview = false,
  showGroupTitles = true,
  onToggle,
}: {
  refTarget: RefObject<HTMLDivElement | null>;
  title: string;
  groups: ScopedPizzaComplementGroup[];
  selected: Record<string, number>;
  preview?: boolean;
  showGroupTitles?: boolean;
  onToggle: (
    item: ScopedPizzaComplementItem,
    group: ScopedPizzaComplementGroup,
  ) => void;
}) {
  if (groups.length === 0) return null;

  return (
    <section ref={refTarget} className="mt-3">
      <div className="flex items-center gap-1.5">
        <p className={pizzaSectionTitleClass}>
          {title}
        </p>
        {preview && <DevPreviewBadge />}
      </div>
      <div className="mt-2 grid gap-2">
        {groups.map((group) => (
          <div key={group.name} className="grid gap-1.5">
            {showGroupTitles && (
              <p className="text-[length:var(--catalog-text-xs)] font-bold text-[#716c60]">
                {group.name}
              </p>
            )}
            {group.items.map((item) => {
              const key = getCustomizationKey(item);
              const active = key ? (selected[key] ?? 0) > 0 : false;
              return (
                <button
                  key={key || item.name}
                  type="button"
                  onClick={() => onToggle(item, group)}
                  aria-pressed={active}
                  className={`flex min-h-[38px] items-center justify-between rounded-[10px] border px-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 ${active ? "border-[#f04a2a] bg-[#fff0e9]" : "border-[#e8dfd2] bg-[#fbfaf7]"}`}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <SelectionSquare active={active} />
                    <span className="truncate font-bold text-[length:var(--catalog-text-xs)] text-[#24241f]">
                      {item.name}
                    </span>
                  </span>
                  <span className="font-extrabold text-[length:var(--catalog-text-xs)] text-[#f04a2a]">
                    {item.price ? `+${formatPizzaPrice(item.price)}` : "0,00"}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}

function ObservationSummaryStep({
  refTarget,
  buttonRef,
  value,
  onOpen,
}: {
  refTarget: RefObject<HTMLDivElement | null>;
  buttonRef: RefObject<HTMLButtonElement | null>;
  value: string;
  onOpen: () => void;
}) {
  const summaryValue = formatObservationSummaryValue(value);

  return (
    <div ref={refTarget} className="mt-2">
      <CompactSettingRow
        buttonRef={buttonRef}
        label="Observação"
        value={summaryValue}
        ariaLabel={formatObservationSummaryAriaLabel(value)}
        onClick={onOpen}
      />
    </div>
  );
}

function formatObservationSummaryValue(value: string) {
  const firstLine = value
    .split(/\r?\n/)[0]
    .replace(/\s+/g, " ")
    .trim();
  return firstLine || "Sem observação";
}

function formatObservationSummaryAriaLabel(value: string) {
  const normalizedValue = value.replace(/\s+/g, " ").trim();
  if (!normalizedValue) {
    return "Sem observação. Toque para editar.";
  }
  return `Observação: ${normalizedValue}. Toque para editar.`;
}

function ObservationStep({
  refTarget,
  value,
  expanded,
  onChange,
  onExpandedChange,
  onClose,
}: {
  refTarget: RefObject<HTMLDivElement | null>;
  value: string;
  expanded: boolean;
  onChange: (value: string) => void;
  onExpandedChange: (expanded: boolean) => void;
  onClose: () => void;
}) {
  return (
    <section ref={refTarget} className="mt-3">
      <p className={pizzaSectionTitleClass}>
        Observação
      </p>
      <div className="relative mt-2">
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Algum detalhe para esta pizza?"
          className={`w-full resize-none rounded-[12px] border border-[#e4dbcf] bg-[#fbfaf7] px-3 py-2 pb-8 pr-11 text-[length:var(--catalog-text-sm)] font-medium outline-none transition-[height,border-color] duration-200 ease-out placeholder:text-[#8f948b] focus-visible:border-[#d9c7b6] focus-visible:ring-2 focus-visible:ring-primary/20 motion-reduce:transition-none ${
            expanded ? "h-[132px]" : "h-[68px]"
          }`}
        />
        <button
          type="button"
          onClick={() => onExpandedChange(!expanded)}
          aria-label={expanded ? "Recolher observação" : "Expandir observação"}
          className="absolute bottom-1.5 right-1.5 flex h-8 w-8 items-center justify-center rounded-full text-[#716c60] transition-colors hover:bg-[#eee6da] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
        >
          {expanded ? (
            <Minimize2Icon className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <Maximize2Icon className="h-3.5 w-3.5" aria-hidden="true" />
          )}
        </button>
      </div>
      <div className="mt-2 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="min-h-[34px] rounded-[11px] border border-[#e1d8c8] bg-[#fbfaf7] px-3 text-[length:var(--catalog-text-xs)] font-bold text-[#626a49] transition-colors hover:bg-[#f3eee5] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
        >
          Concluir
        </button>
      </div>
    </section>
  );
}

type PizzaHalfTone = "flavor1" | "flavor2";

type PizzaHalfVisualState =
  | "activeHalf1"
  | "activeHalf2"
  | "confirmedInactiveHalf1"
  | "confirmedInactiveHalf2"
  | "unavailable"
  | "editPending";

function resolvePizzaHalfVisualState(
  tone: PizzaHalfTone,
  state: {
    active: boolean;
    choosing: boolean;
    confirmed: boolean;
    disabled: boolean;
    editPending: boolean;
  },
): PizzaHalfVisualState {
  if (state.editPending) return "editPending";
  if (state.disabled) return "unavailable";
  if (state.active || state.choosing) return tone === "flavor1" ? "activeHalf1" : "activeHalf2";
  if (state.confirmed) return tone === "flavor1" ? "confirmedInactiveHalf1" : "confirmedInactiveHalf2";
  return "unavailable";
}

function getPizzaHalfVisualStateClasses(tone: PizzaHalfTone, visualState: PizzaHalfVisualState) {
  const halfTone = getHalfTone(tone);

  if (visualState === "editPending") {
    return {
      surface: "bg-[#fff8e8]",
      contextualSurface: "bg-[#fff8e8]",
      border: "border-[#f1d78f]",
      title: "text-[#8a5a0a]",
      elevation: "",
      pulseRgb: halfTone.pulseRgb,
    };
  }

  if (visualState === "unavailable") {
    return {
      surface: "bg-[#ebe8df] text-[#777164]",
      contextualSurface: "bg-[#f6f4ef]",
      border: "border-transparent",
      title: "text-[#777164]",
      elevation: "",
      pulseRgb: halfTone.pulseRgb,
    };
  }

  if (visualState === "activeHalf1" || visualState === "activeHalf2") {
    return {
      surface: halfTone.activeSurface,
      contextualSurface: halfTone.contentSurface,
      border: halfTone.border,
      title: halfTone.activeTitle,
      elevation: halfTone.activeElevation,
      pulseRgb: halfTone.pulseRgb,
    };
  }

  return {
    surface: halfTone.confirmedSurface,
    contextualSurface: halfTone.confirmedSurface,
    border: halfTone.border,
    title: halfTone.title,
    elevation: "",
    pulseRgb: halfTone.pulseRgb,
  };
}

function getHalfTone(tone: PizzaHalfTone) {
  if (tone === "flavor2") {
    return {
      border: "border-[#d7deca]",
      activeSurface: "bg-[#e7ebdd]",
      contentSurface: "bg-[#f3f6ec]",
      confirmedSurface: "bg-[#f8faf3]",
      title: "text-[#626A49]",
      activeTitle: "text-[#4f5734]",
      activeElevation: "shadow-[0_2px_8px_rgba(98,106,73,0.12)]",
      pulseRgb: "98, 106, 73",
    };
  }
  return {
    border: "border-[#edcdbb]",
    activeSurface: "bg-[#ffeadf]",
    contentSurface: "bg-[#fff4ee]",
    confirmedSurface: "bg-[#fff8f4]",
    title: "text-[#A65312]",
    activeTitle: "text-[#8c410d]",
    activeElevation: "shadow-[0_2px_8px_rgba(166,83,18,0.11)]",
    pulseRgb: "166, 83, 18",
  };
}
function PizzaFlavorImage({ flavor }: { flavor: PizzaFlavorChoice }) {
  if (flavor.imageUrl) {
    return (
      <span className="h-10 w-10 shrink-0 overflow-hidden rounded-[9px] bg-[#fde5d6]">
        <img
          src={flavor.imageUrl}
          alt={flavor.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </span>
    );
  }
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[9px] bg-[#fde5d6]">
      <span className="font-serif text-[18px] font-bold text-[#6a742b]">A</span>
    </span>
  );
}

function SummaryLine({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-0.5">
      <span className="font-semibold text-[#716c60] dark:text-muted-foreground">
        {label}
      </span>
      <span
        className={`min-w-0 text-right ${strong ? "font-extrabold text-[#f04a2a]" : "font-bold text-[#24241f] dark:text-foreground"}`}
      >
        {value}
      </span>
    </div>
  );
}

function SummaryEditLine({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: string;
  onEdit: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-0.5">
      <span className="font-semibold text-[#716c60] dark:text-muted-foreground">
        {label}
      </span>
      <button
        type="button"
        onClick={onEdit}
        className="flex min-w-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-right font-bold text-[#24241f] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 dark:text-foreground"
      >
        <span className="truncate">{value}</span>
        <ChevronRightIcon className="h-3 w-3 shrink-0 text-[#f04a2a]" />
      </button>
    </div>
  );
}
