import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
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
  getPizzaBuilderRequirement,
  getPizzaBuilderStepOrder,
  getPizzaBorderPrice,
  getPizzaCompletionState,
  getPizzaCurrentSummaryStatus,
  getPizzaFlavorKind,
  getPizzaFlavorPrice,
  getPizzaPrimaryActionLabel,
  getPizzaProgressStage,
  getPizzaRemovalCountLabel,
  isPizzaSizeAllowed,
  roundPizzaPriceToHalf,
  shouldShowPizzaQuantity,
  type PizzaAddonGroupForScope,
  type PizzaBorderChoice,
  type PizzaFlavorChoice,
} from "./pizzaBuilderUtils";
import type { Id } from "@/convex/_generated/dataModel.d.ts";

const calabresa: PizzaFlavorChoice = {
  _id: "pizza-calabresa" as Id<"products">,
  documentKey: "PIZS-CALABRESA",
  name: "Pizza Calabresa",
  options: [
    {
      documentKey: "PIZS-CALABRESA-P",
      label: "P",
      optionType: "pizza_tamanho",
      price: 45,
      priceStatus: "confirmado",
      metadata: { size: "P" },
    },
    {
      documentKey: "PIZS-CALABRESA-M",
      label: "M",
      optionType: "pizza_tamanho",
      price: 55,
      priceStatus: "confirmado",
      metadata: { size: "M" },
    },
    {
      documentKey: "PIZS-CALABRESA-G",
      label: "G",
      optionType: "pizza_tamanho",
      price: 65,
      priceStatus: "confirmado",
      metadata: { size: "G" },
    },
  ],
};

const frango: PizzaFlavorChoice = {
  _id: "pizza-frango" as Id<"products">,
  documentKey: "PIZS-FRANGO-CATUPIRY",
  name: "Pizza Frango com Catupiry",
  options: [
    {
      documentKey: "PIZS-FRANGO-P",
      label: "P",
      optionType: "pizza_tamanho",
      price: 48,
      priceStatus: "confirmado",
      metadata: { size: "P" },
    },
    {
      documentKey: "PIZS-FRANGO-M",
      label: "M",
      optionType: "pizza_tamanho",
      price: 58,
      priceStatus: "confirmado",
      metadata: { size: "M" },
    },
    {
      documentKey: "PIZS-FRANGO-G",
      label: "G",
      optionType: "pizza_tamanho",
      price: 70,
      priceStatus: "confirmado",
      metadata: { size: "G" },
    },
  ],
};

const chocolate: PizzaFlavorChoice = {
  _id: "pizza-chocolate" as Id<"products">,
  documentKey: "PIZD-CHOCOLATE",
  name: "Pizza Chocolate",
  pizzaKind: "sweet",
  options: [
    {
      documentKey: "PIZD-CHOCOLATE-M",
      label: "M",
      optionType: "pizza_tamanho",
      price: 57,
      priceStatus: "confirmado",
      metadata: { size: "M" },
    },
    {
      documentKey: "PIZD-CHOCOLATE-G",
      label: "G",
      optionType: "pizza_tamanho",
      price: 67,
      priceStatus: "confirmado",
      metadata: { size: "G" },
    },
  ],
};

const calabresaSalgada: PizzaFlavorChoice = {
  ...calabresa,
  pizzaKind: "savory",
};

const semBorda: PizzaBorderChoice = {
  key: "none",
  name: "Sem borda",
  price: 0,
  priceStatus: "confirmado",
  sellable: true,
};

const bordaCatupiry: PizzaBorderChoice = {
  key: "borda-catupiry",
  name: "Borda de catupiry",
  price: 8,
  priceStatus: "confirmado",
  sellable: true,
};

const pizzaBuilderSource = () =>
  readFileSync(
    new URL("./PizzaBuilder.tsx", import.meta.url),
    "latin1",
  );

describe("pizza builder utils", () => {
  it("abre pizza de um sabor com P, M e G disponiveis", () => {
    expect(getAllowedPizzaSizes("single")).toEqual(["P", "M", "G"]);
    expect(isPizzaSizeAllowed("single", "P")).toBe(true);
  });

  it("bloqueia P para pizza de dois sabores", () => {
    expect(getAllowedPizzaSizes("double")).toEqual(["M", "G"]);
    expect(isPizzaSizeAllowed("double", "P")).toBe(false);
  });

  it("filtra sabores pelo tipo escolhido antes da montagem de dois sabores", () => {
    expect(getPizzaFlavorKind(calabresaSalgada)).toBe("savory");
    expect(getPizzaFlavorKind(chocolate)).toBe("sweet");
    expect(
      filterPizzaFlavorsByKind([calabresaSalgada, chocolate], "savory"),
    ).toEqual([calabresaSalgada]);
    expect(
      filterPizzaFlavorsByKind([calabresaSalgada, chocolate], "sweet"),
    ).toEqual([chocolate]);
  });

  it("bloqueia mistura doce e salgada no fluxo de dois sabores", () => {
    expect(arePizzaFlavorsCompatible(calabresaSalgada, chocolate)).toBe(false);
    expect(arePizzaFlavorsCompatible(calabresaSalgada, frango)).toBe(true);
  });

  it("descreve a proxima etapa obrigatoria da jornada progressiva", () => {
    expect(getPizzaBuilderRequirement({ mode: "double" })).toBe("type");
    expect(
      getPizzaBuilderRequirement({
        mode: "double",
        flavorKind: "savory",
      }),
    ).toBe("size");
    expect(
      getPizzaBuilderRequirement({
        mode: "double",
        flavorKind: "savory",
        size: "M",
      }),
    ).toBe("flavor1");
    expect(
      getPizzaBuilderRequirement({
        mode: "double",
        flavorKind: "savory",
        size: "M",
        flavor1: calabresaSalgada,
      }),
    ).toBe("flavor2");
    expect(
      getPizzaBuilderRequirement({
        mode: "double",
        flavorKind: "savory",
        size: "M",
        flavor1: calabresaSalgada,
        flavor2: frango,
      }),
    ).toBe("border");
    expect(
      getPizzaBuilderRequirement({
        mode: "double",
        flavorKind: "savory",
        size: "M",
        flavor1: calabresaSalgada,
        flavor2: frango,
        border: semBorda,
      }),
    ).toBe("complete");
  });

  it("organiza a jornada visual com retiradas dentro de cada metade", () => {
    expect(getPizzaBuilderStepOrder("double")).toEqual([
      "type",
      "size",
      "flavor1",
      "flavor1Adjust",
      "flavor2",
      "flavor2Adjust",
      "addons",
      "border",
      "observation",
    ]);
  });
  it("mantem Metade 2 bloqueada ate a etapa posterior a Metade 1", () => {
    const order = getPizzaBuilderStepOrder("double");
    expect(order.indexOf("flavor2")).toBeGreaterThan(
      order.indexOf("flavor1Adjust"),
    );
  });

  it("agrupa Metade 1 e Metade 2 no progresso geral de Metades", () => {
    expect(getPizzaProgressStage("type")).toEqual({
      index: 1,
      label: "Escolha o tipo",
    });
    expect(getPizzaProgressStage("size")).toEqual({
      index: 2,
      label: "Escolha o tamanho",
    });
    expect(getPizzaProgressStage("flavor1")).toEqual({
      index: 3,
      label: "Metades",
    });
    expect(getPizzaProgressStage("flavor2Adjust")).toEqual({
      index: 3,
      label: "Metades",
    });
    expect(getPizzaProgressStage("addons")).toEqual({
      index: 4,
      label: "Adicionais",
    });
    expect(getPizzaProgressStage("border")).toEqual({
      index: 5,
      label: "Borda",
    });
    expect(getPizzaProgressStage("observation")).toEqual({
      index: 6,
      label: "Observa\u00e7\u00e3o",
    });
  });

  it("mantem adicionais globais depois das duas metades e antes da borda", () => {
    const order = getPizzaBuilderStepOrder("double");
    expect(order.indexOf("addons")).toBeGreaterThan(
      order.indexOf("flavor2Adjust"),
    );
    expect(order.indexOf("border")).toBeGreaterThan(
      order.indexOf("addons"),
    );
    expect(order.indexOf("observation")).toBeGreaterThan(
      order.indexOf("border"),
    );
  });

  it("classifica adicionais somente por escopo explicito e vendavel", () => {
    const groups: PizzaAddonGroupForScope[] = [
      {
        documentKey: "GROUP-M1",
        name: "Adicionais Metade 1",
        minSelections: 0,
        required: false,
        rules: { pizzaAddonScope: "flavor1" },
        items: [
          {
            documentKey: "ADD-BACON-M1",
            name: "Bacon",
            price: 6,
            priceStatus: "confirmado",
            sellable: true,
          },
          {
            documentKey: "ADD-PENDENTE",
            name: "Item pendente",
            price: 4,
            priceStatus: "pendente",
            sellable: true,
          },
        ],
      },
      {
        documentKey: "GROUP-M2",
        name: "Adicionais Metade 2",
        minSelections: 0,
        required: false,
        items: [
          {
            documentKey: "ADD-CATUPIRY-M2",
            name: "Catupiry",
            price: 5,
            priceStatus: "confirmado",
            sellable: true,
            metadata: { pizzaAddonScope: "metade2" },
          },
        ],
      },
      {
        documentKey: "GROUP-GLOBAL",
        name: "Adicionais da pizza",
        minSelections: 0,
        required: false,
        rules: { pizzaAddonScope: "pizza" },
        items: [
          {
            documentKey: "ADD-AZEITONA",
            name: "Azeitona",
            price: 3,
            priceStatus: "confirmado",
            sellable: true,
          },
        ],
      },
      {
        documentKey: "GROUP-SEM-ESCOPO",
        name: "Sem escopo explicito",
        minSelections: 0,
        required: false,
        items: [
          {
            documentKey: "ADD-SEM-ESCOPO",
            name: "Bacon da Metade 1",
            price: 6,
            priceStatus: "confirmado",
            sellable: true,
          },
        ],
      },
    ];

    expect(getPizzaAddonGroupsForScope(groups, "flavor1")[0].items).toHaveLength(1);
    expect(getPizzaAddonGroupsForScope(groups, "flavor2")[0].items[0].name).toBe(
      "Catupiry",
    );
    expect(getPizzaAddonGroupsForScope(groups, "global")[0].items[0].name).toBe(
      "Azeitona",
    );
    expect(getPizzaAddonGroupsForScope(groups, "flavor1")[0].items[0].name).toBe(
      "Bacon",
    );
    expect(
      getPizzaAddonGroupsForScope(groups, "flavor1").some(
        (group) => group.documentKey === "GROUP-SEM-ESCOPO",
      ),
    ).toBe(false);
  });

  it("mantem selecoes de adicionais separadas por escopo", () => {
    const groups: PizzaAddonGroupForScope[] = [
      {
        documentKey: "GROUP-M1",
        name: "Adicionais Metade 1",
        minSelections: 0,
        required: false,
        rules: { pizzaAddonScope: "flavor1" },
        items: [
          {
            documentKey: "ADD-BACON-M1",
            name: "Bacon",
            price: 6,
            priceStatus: "confirmado",
            sellable: true,
          },
        ],
      },
      {
        documentKey: "GROUP-M2",
        name: "Adicionais Metade 2",
        minSelections: 0,
        required: false,
        rules: { pizzaAddonScope: "flavor2" },
        items: [
          {
            documentKey: "ADD-BACON-M2",
            name: "Bacon",
            price: 6,
            priceStatus: "confirmado",
            sellable: true,
          },
        ],
      },
    ];

    const selected = { "ADD-BACON-M1": 1 };
    const half1 = getPizzaAddonGroupsForScope(groups, "flavor1");
    const half2 = getPizzaAddonGroupsForScope(groups, "flavor2");

    expect(getPizzaAddonSelectedItems(half1, selected)).toHaveLength(1);
    expect(getPizzaAddonSelectedItems(half2, selected)).toHaveLength(0);
    expect(getPizzaAddonSelectionTotal(half1, selected)).toBe(6);
    expect(getPizzaAddonSelectionTotal(half2, selected)).toBe(0);
  });
  it("resume retiradas confirmadas sem apagar contexto da metade", () => {
    expect(getPizzaRemovalCountLabel(0)).toBe("Sem retiradas");
    expect(getPizzaRemovalCountLabel(1)).toBe("1 ingrediente retirado");
    expect(getPizzaRemovalCountLabel(2)).toBe("2 ingredientes retirados");
  });

  it("mantem Pizza Atual como contexto resumido sem instrucao duplicada", () => {
    expect(getPizzaCurrentSummaryStatus({ mode: "double" })).toBe(
      "Montando · 2 sabores",
    );
    expect(
      getPizzaCurrentSummaryStatus({ mode: "double", flavorKind: "savory" }),
    ).toBe("Salgada · 2 sabores");
    expect(
      getPizzaCurrentSummaryStatus({
        mode: "double",
        flavorKind: "savory",
        size: "M",
      }),
    ).toBe("Salgada · M · 2 sabores");
    expect(
      getPizzaCurrentSummaryStatus({
        mode: "double",
        flavorKind: "savory",
        size: "M",
        complete: true,
      }),
    ).toBe("Conferir antes de adicionar");
  });

  it("mantem quantidade somente quando a configuracao esta completa", () => {
    expect(
      shouldShowPizzaQuantity({ step: "flavor1Adjust", complete: false }),
    ).toBe(false);
    expect(shouldShowPizzaQuantity({ step: "observation", complete: true })).toBe(
      true,
    );
  });

  it("expoe CTA progressivo sem etapa separada de revisao", () => {
    expect(getPizzaPrimaryActionLabel({ step: "flavor1" })).toBe(
      "Escolha a Metade 1",
    );
    expect(getPizzaPrimaryActionLabel({ step: "flavor1Adjust" })).toBe(
      "Confirmar Metade 1",
    );
    expect(getPizzaPrimaryActionLabel({ step: "flavor2Adjust" })).toBe(
      "Confirmar Metade 2",
    );
    expect(
      getPizzaPrimaryActionLabel({
        step: "border",
        readyForObservation: true,
      }),
    ).toBe("Escolha a borda");
    expect(getPizzaPrimaryActionLabel({ step: "addons" })).toBe(
      "Escolha os adicionais",
    );
    expect(getPizzaPrimaryActionLabel({ step: "observation" })).toBe(
      "Adicionar",
    );
  });

  it("solicita confirmacao de saida somente quando existem escolhas", () => {
    expect(canExitPizzaBuilderWithoutConfirmation({})).toBe(true);
    expect(
      canExitPizzaBuilderWithoutConfirmation({
        flavorKind: "savory",
      }),
    ).toBe(false);
    expect(
      canExitPizzaBuilderWithoutConfirmation({
        size: "M",
        flavor1: calabresa,
      }),
    ).toBe(false);
  });

  it("resolve preco do sabor no tamanho selecionado", () => {
    expect(getPizzaFlavorPrice(calabresa, "G")).toBe(65);
  });

  it("usa preco legado quando o produto ainda nao tem opcao estruturada", () => {
    const legacyFlavor: PizzaFlavorChoice = {
      _id: "pizza-legada" as Id<"products">,
      name: "Pizza Legada",
      price: 40,
      legacySizes: [
        { label: "Broto", extraPrice: 0 },
        { label: "Media", extraPrice: 10 },
        { label: "Grande", extraPrice: 20 },
      ],
    };
    expect(getPizzaFlavorPrice(legacyFlavor, "G")).toBe(60);
  });

  it("arredonda media de dois sabores para multiplos de R$ 0,50", () => {
    expect(roundPizzaPriceToHalf((65 + 70) / 2)).toBe(67.5);
    expect(roundPizzaPriceToHalf(67.26)).toBe(67.5);
  });

  it("calcula pizza de um sabor pelo preco do sabor no tamanho", () => {
    expect(
      calculatePizzaFlavorUnitPrice({
        mode: "single",
        size: "G",
        flavor1: calabresa,
      }),
    ).toBe(65);
  });

  it("calcula pizza de dois sabores pela media arredondada", () => {
    expect(
      calculatePizzaFlavorUnitPrice({
        mode: "double",
        size: "G",
        flavor1: calabresa,
        flavor2: frango,
      }),
    ).toBe(67.5);
  });

  it("nao calcula segundo sabor antes do sabor 1 estar completo", () => {
    expect(
      calculatePizzaFlavorUnitPrice({
        mode: "double",
        size: "G",
        flavor2: frango,
      }),
    ).toBeUndefined();
  });

  it("considera Sem borda como escolha valida sem impacto no preco", () => {
    expect(getPizzaBorderPrice(semBorda)).toBe(0);
    expect(
      getPizzaCompletionState({
        mode: "single",
        size: "M",
        flavor1: calabresa,
        border: semBorda,
      }),
    ).toEqual({ complete: true, reason: null });
  });

  it("soma borda vendavel como impacto separado", () => {
    expect(getPizzaBorderPrice(bordaCatupiry)).toBe(8);
  });

  it("bloqueia borda com preco pendente", () => {
    expect(
      getPizzaBorderPrice({
        key: "borda-pendente",
        name: "Borda pendente",
        priceStatus: "pendente",
        sellable: true,
      }),
    ).toBeUndefined();
  });

  it("mantem Pizza Atual incompleta sem sabor obrigatorio", () => {
    expect(
      getPizzaCompletionState({
        mode: "double",
        size: "G",
        flavor1: calabresa,
        border: semBorda,
      }),
    ).toEqual({ complete: false, reason: "Escolha o sabor 2" });
  });

  it("mantem Pizza Atual completa com dois sabores", () => {
    expect(
      getPizzaCompletionState({
        mode: "double",
        size: "G",
        flavor1: calabresa,
        flavor2: frango,
        border: semBorda,
      }),
    ).toEqual({ complete: true, reason: null });
  });

  it("preserva escolhas no resumo/snapshot visual", () => {
    expect(
      buildPizzaSummary({
        mode: "double",
        size: "G",
        flavor1: calabresa,
        flavor2: frango,
        border: bordaCatupiry,
        quantity: 2,
      }),
    ).toEqual({
      mode: "double",
      size: "G",
      flavors: [
        { documentKey: "PIZS-CALABRESA", name: "Pizza Calabresa" },
        {
          documentKey: "PIZS-FRANGO-CATUPIRY",
          name: "Pizza Frango com Catupiry",
        },
      ],
      border: { key: "borda-catupiry", name: "Borda de catupiry", price: 8 },
      quantity: 2,
    });
  });

  it("aceita configuracao que limita segundo sabor por tamanho", () => {
    const configuration = {
      ...defaultPizzaConfiguration,
      maxFlavorsBySize: { P: 1, M: 1, G: 2 },
    };
    expect(getAllowedPizzaSizes("double", configuration)).toEqual(["G"]);
  });

  it("mantem a linguagem visual aprovada para retirada e edicao das metades", () => {
    const source = pizzaBuilderSource();

    expect(source).toContain('title="Quer retirar algo?"');
    expect(source).toContain("`Retirar ${ingredient}`");
    expect(source).not.toContain('title="Quer remover algo?"');
    expect(source).not.toContain("Remover {ingredient}");
    expect(source).not.toContain("showAlterAction");
    expect(source).not.toContain("confirmed && !editPending && (");
    expect(source).toContain("confirmed && flavorLabel && !editPending");
    expect(source).toContain("const showFlavorSummary = Boolean(flavorLabel && (!isChoosing || editPending));");
    expect(source).toContain("{!isChoosing && (");
    expect(source).toContain("Toque para alterar.");
    expect(source).toContain("activeElevation");
  });

  it("mantem os estados visuais canonicos das metades em uma unica fonte", () => {
    const source = pizzaBuilderSource();
    const halfChoiceStart = source.indexOf("function HalfChoiceCard");
    const typeStepStart = source.indexOf("function PizzaTypeStep");
    const halfChoiceSource = source.slice(halfChoiceStart, typeStepStart);

    expect(source).toContain("function getPizzaHalfVisualStateClasses");
    expect(source).toContain("function resolvePizzaHalfVisualState");
    expect(source).toContain('"activeHalf1"');
    expect(source).toContain('"activeHalf2"');
    expect(source).toContain('"confirmedInactiveHalf1"');
    expect(source).toContain('"confirmedInactiveHalf2"');
    expect(source).toContain('"unavailable"');
    expect(source).toContain('"editPending"');
    expect(source).toContain("bg-[#ffeadf]");
    expect(source).toContain("bg-[#fff4ee]");
    expect(source).toContain("border-[#edcdbb]");
    expect(source).toContain("shadow-[0_2px_8px_rgba(166,83,18,0.11)]");
    expect(source).toContain("bg-[#e7ebdd]");
    expect(source).toContain("bg-[#f3f6ec]");
    expect(source).toContain("border-[#d7deca]");
    expect(source).toContain("shadow-[0_2px_8px_rgba(98,106,73,0.12)]");
    expect(source).toContain("bg-[#fff8e8]");
    expect(halfChoiceSource).not.toContain("CheckIcon");
    expect(halfChoiceSource).not.toContain("addonGroups");
    expect(halfChoiceSource).not.toContain("selectedComplements");
  });

  it("mantem busca recolhivel na metade ativa e cabecalho sem X de fechamento", () => {
    const source = pizzaBuilderSource();

    expect(source).toContain("setHalfSearchCollapsed(true)");
    expect(source).toContain("isCurrent && searchCollapsed ? \"Escolher sabor\" : \"\"");
    expect(source).toContain("searchCollapsed && isCurrent");
    expect(source).toContain("flavorLabel && !disabled");
    expect(source).toContain("flavorListRef.current?.scrollTo({ top: 0 })");
    expect(source).toContain("setHalfSearchCollapsed(false)");
    expect(source).not.toContain("Fechar montagem");
    expect(source).toContain('aria-label={finalizationOpen ? "Voltar para a montagem" : "Sair da montagem"}');
    expect(source).toContain("requestExit(onBackToList)");
    expect(source).toContain("Sair da montagem?");
  });

  it("usa o mesmo quadradinho canonico em tipo, tamanho, borda, retiradas e adicionais", () => {
    const source = pizzaBuilderSource();

    expect(source).toContain("function SelectionSquare");
    expect(source).toContain("h-[18px] w-[18px]");
    expect(source).toContain("rounded-[5px]");
    expect(source).toContain('active && <CheckIcon className="h-3 w-3" />');
    expect(source.match(/<SelectionSquare active=\{active\} \/>/g)).toHaveLength(6);
    expect(source).not.toContain("label={kind");
    expect(source).not.toContain("label={size");
    expect(source).not.toContain("kind === \"savory\" ? \"S\" : \"D\"");
    expect(source).not.toContain("compact =");
    expect(source).not.toContain("compact />");
  });

  it("mantem tipo e tamanho sem marcador circular ou letras no marcador", () => {
    const source = pizzaBuilderSource();
    const typeStart = source.indexOf("function PizzaTypeStep");
    const sizeStart = source.indexOf("function PizzaSizeStep");
    const flavorStart = source.indexOf("function FlavorStep");
    const typeAndSizeSource = source.slice(typeStart, flavorStart);

    expect(typeStart).toBeGreaterThan(-1);
    expect(sizeStart).toBeGreaterThan(typeStart);
    expect(typeAndSizeSource).toContain("<SelectionSquare active={active} />");
    expect(typeAndSizeSource).not.toContain("rounded-full border text");
    expect(typeAndSizeSource).not.toContain("label=");
    expect(typeAndSizeSource).not.toContain('aria-label="S"');
    expect(typeAndSizeSource).not.toContain('aria-label="D"');
  });

  it("remove CTA intermediario entre tipo e tamanho", () => {
    const source = pizzaBuilderSource();

    expect(source).not.toContain("Continuar para o tamanho");
    expect(source).not.toContain("goToSizeStep");
    expect(source).not.toContain('activeStep === "type" && selectedFlavorKind');
    expect(source).not.toContain('activeStep === "type" && Boolean(selectedFlavorKind)');
    expect(source).toContain('setOpenGlobalEditor("size");');
    expect(source).toContain('setActiveStep("size");');
    expect(source).toContain("<CompactTypeSummary");
    expect(source).toContain('label="Tipo"');
  });
});
