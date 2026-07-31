type PreviewComplementItem = {
  documentKey: string;
  name: string;
  price: number;
  priceStatus: "confirmado";
  sellable: true;
  metadata: { pizzaAddonScope: "flavor1" | "flavor2" | "global" };
};

type PreviewComplementGroup = {
  documentKey: string;
  name: string;
  minSelections: 0;
  maxSelections: number;
  required: false;
  rules: { pizzaAddonScope: "flavor1" | "flavor2" | "global" };
  items: PreviewComplementItem[];
};

// DEV PREVIEW ONLY — NÃO USAR COMO VERDADE COMERCIAL
export const pizzaAddonsPreviewComplementGroups = [
  {
    documentKey: "dev-preview-pizza-addons-half-1",
    name: "Adicionais da Metade 1",
    minSelections: 0,
    maxSelections: 2,
    required: false,
    rules: { pizzaAddonScope: "flavor1" },
    items: [
      {
        documentKey: "dev-preview-half-1-bacon",
        name: "Bacon adicional",
        price: 6,
        priceStatus: "confirmado",
        sellable: true,
        metadata: { pizzaAddonScope: "flavor1" },
      },
      {
        documentKey: "dev-preview-half-1-catupiry",
        name: "Catupiry adicional",
        price: 5,
        priceStatus: "confirmado",
        sellable: true,
        metadata: { pizzaAddonScope: "flavor1" },
      },
    ],
  },
  {
    documentKey: "dev-preview-pizza-addons-half-2",
    name: "Adicionais da Metade 2",
    minSelections: 0,
    maxSelections: 2,
    required: false,
    rules: { pizzaAddonScope: "flavor2" },
    items: [
      {
        documentKey: "dev-preview-half-2-queijo-extra",
        name: "Queijo extra",
        price: 5,
        priceStatus: "confirmado",
        sellable: true,
        metadata: { pizzaAddonScope: "flavor2" },
      },
      {
        documentKey: "dev-preview-half-2-bacon",
        name: "Bacon adicional",
        price: 6,
        priceStatus: "confirmado",
        sellable: true,
        metadata: { pizzaAddonScope: "flavor2" },
      },
    ],
  },
  {
    documentKey: "dev-preview-pizza-addons-global",
    name: "Adicionais da pizza",
    minSelections: 0,
    maxSelections: 1,
    required: false,
    rules: { pizzaAddonScope: "global" },
    items: [
      {
        documentKey: "dev-preview-global-queijo-extra",
        name: "Queijo extra na pizza inteira",
        price: 8,
        priceStatus: "confirmado",
        sellable: true,
        metadata: { pizzaAddonScope: "global" },
      },
    ],
  },
] satisfies PreviewComplementGroup[];
