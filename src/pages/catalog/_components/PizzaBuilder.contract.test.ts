import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const builderSource = readFileSync("src/pages/catalog/_components/PizzaBuilder.tsx", "utf8");
const decisionSource = readFileSync("docs/arquitetura/decisoes/pizza.yaml", "utf8");
const previewFixtureSource = readFileSync(
  "src/pages/catalog/_components/pizzaBuilderPreviewFixtures.ts",
  "utf8",
);

describe("PizzaBuilder decision contract", () => {
  it("keeps the canonical SelectionSquare as the only eligible selection marker", () => {
    expect(builderSource).toContain("function SelectionSquare");
    expect(builderSource).toContain("h-[18px] w-[18px]");
    expect(builderSource).toContain("rounded-[5px]");
    expect(builderSource).toContain("<CheckIcon className=\"h-3 w-3\" />");
    expect(builderSource.match(/<SelectionSquare active=\{active\} \/>/g)).toHaveLength(6);
    expect(builderSource).not.toContain("label={kind");
    expect(builderSource).not.toContain("label={size");
    expect(builderSource).not.toContain('kind === "savory" ? "S" : "D"');
    expect(builderSource).not.toContain('type="radio"');
  });

  it("does not render the forbidden intermediate CTA between type and size", () => {
    expect(builderSource).not.toContain("Continuar para o tamanho");
    expect(builderSource).not.toContain("goToSizeStep");
    expect(builderSource).toContain("setOpenGlobalEditor(null);");
    expect(builderSource).toContain("setActiveStep(\"size\");");
    expect(builderSource).toContain('label="Tipo"');
    expect(builderSource).toContain('label="Tamanho"');
  });

  it("keeps Tamanho hidden until Tipo has a selected value and then opens the size editor", () => {
    expect(builderSource).toContain('(!selectedFlavorKind || openGlobalEditor === "type")');
    expect(builderSource).toContain('{(mode === "single" || selectedFlavorKind) &&');
    expect(builderSource).not.toContain('selectedFlavorKind || activeStep === "type"');
    expect(builderSource).toContain('className={openGlobalEditor === "type" ? "mt-2.5" : "mt-0"}');
    expect(builderSource).toContain('setOpenGlobalEditor("size");');
    expect(builderSource).toContain("function CompactGlobalSettings");
    expect(builderSource).toContain('label="Tamanho"');
  });

  it("does not expose Borda before the selected flavor sequence is complete", () => {
    expect(builderSource).toContain("const canShowBorderControl");
    expect(builderSource).toContain("flavor1 && confirmedHalves.flavor1");
    expect(builderSource).toContain("flavor2 &&");
    expect(builderSource).toContain("confirmedHalves.flavor2");
    expect(builderSource).toContain("{canShowBorderControl &&");
  });

  it("registers the initial approved pizza decisions with sources", () => {
    for (const id of [
      "DEC-PIZZA-001",
      "DEC-PIZZA-002",
      "DEC-PIZZA-003",
      "DEC-PIZZA-004",
      "DEC-PIZZA-005",
      "DEC-PIZZA-006",
      "DEC-PIZZA-007",
      "DEC-PIZZA-008",
      "DEC-PIZZA-009",
      "DEC-PIZZA-010",
      "DEC-PIZZA-011",
      "DEC-PIZZA-012",
      "DEC-PIZZA-013",
      "DEC-PIZZA-014",
      "DEC-PIZZA-015",
      "DEC-PIZZA-016",
      "DEC-PIZZA-017",
      "DEC-PIZZA-018",
      "DEC-PIZZA-019",
      "DEC-PIZZA-020",
      "DEC-PIZZA-021",
      "DEC-PIZZA-022",
    ]) {
      expect(decisionSource).toContain(`id: ${id}`);
    }
    expect(decisionSource).toContain("status: approved_dna");
    expect(decisionSource).toContain("status: approved_later");
    expect(decisionSource).toContain("forbidden_copy:");
  });

  it("keeps visual evidence snapshots for the canonical selection states", () => {
    const visualReferences = [
      "docs/screenshots/m003-pizza-selection-final-01-tipo-aberto-nao-selecionada-408.png",
      "docs/screenshots/m003-pizza-selection-final-02-tipo-aberto-selecionada-408.png",
      "docs/screenshots/m003-pizza-selection-final-03-tamanho-aberto-408.png",
      "docs/screenshots/m003-pizza-selection-final-04-borda-aberta-408.png",
      "docs/screenshots/m003-pizza-selection-final-05-retirar-ingredientes-aberto-408.png",
      "docs/screenshots/m003-pizza-selection-final-06-tipo-recolhido-sem-cta-408.png",
    ];

    for (const reference of visualReferences) {
      expect(existsSync(reference), reference).toBe(true);
    }

    expect(visualReferences).toMatchInlineSnapshot(`
      [
        "docs/screenshots/m003-pizza-selection-final-01-tipo-aberto-nao-selecionada-408.png",
        "docs/screenshots/m003-pizza-selection-final-02-tipo-aberto-selecionada-408.png",
        "docs/screenshots/m003-pizza-selection-final-03-tamanho-aberto-408.png",
        "docs/screenshots/m003-pizza-selection-final-04-borda-aberta-408.png",
        "docs/screenshots/m003-pizza-selection-final-05-retirar-ingredientes-aberto-408.png",
        "docs/screenshots/m003-pizza-selection-final-06-tipo-recolhido-sem-cta-408.png",
      ]
    `);
  });

  it("keeps the canonical visual states of pizza halves centralized", () => {
    expect(builderSource).toContain("function getPizzaHalfVisualStateClasses");
    expect(builderSource).toContain("type PizzaHalfVisualState");
    expect(builderSource).toContain('"activeHalf1"');
    expect(builderSource).toContain('"activeHalf2"');
    expect(builderSource).toContain('"confirmedInactiveHalf1"');
    expect(builderSource).toContain('"confirmedInactiveHalf2"');
    expect(builderSource).toContain('"unavailable"');
    expect(builderSource).toContain('"editPending"');
    expect(builderSource).toContain("bg-[#ffeadf]");
    expect(builderSource).toContain("bg-[#fff4ee]");
    expect(builderSource).toContain("border-[#edcdbb]");
    expect(builderSource).toContain("shadow-[0_2px_8px_rgba(166,83,18,0.11)]");
    expect(builderSource).toContain("bg-[#e7ebdd]");
    expect(builderSource).toContain("bg-[#f3f6ec]");
    expect(builderSource).toContain("border-[#d7deca]");
    expect(builderSource).toContain("shadow-[0_2px_8px_rgba(98,106,73,0.12)]");
    expect(builderSource).toContain("bg-[#fff8e8]");
  });

  it("keeps half completion free of visual checks", () => {
    const halfChoiceStart = builderSource.indexOf("function HalfChoiceCard");
    const nextSectionStart = builderSource.indexOf("function PizzaTypeStep");
    const halfChoiceSource = builderSource.slice(halfChoiceStart, nextSectionStart);

    expect(halfChoiceStart).toBeGreaterThan(-1);
    expect(nextSectionStart).toBeGreaterThan(halfChoiceStart);
    expect(halfChoiceSource).not.toContain("CheckIcon");
    expect(halfChoiceSource).toContain("ChevronDownIcon");
    expect(halfChoiceSource).toContain("concluída, sabor");
    expect(builderSource).toContain("const showFlavorSummary = Boolean(flavorLabel && (!isChoosing || editPending));");
    expect(builderSource).toContain("{!isChoosing && (");
  });

  it("keeps pizza addon preview gated to DEV and explicit URL parameter", () => {
    expect(builderSource).toContain("import.meta.env.DEV");
    expect(builderSource).toContain("pizzaAddonsPreview");
    expect(builderSource).toContain('get("pizzaAddonsPreview") === "1"');
    expect(builderSource).toContain("pizzaAddonsPreviewComplementGroups");
    expect(builderSource).toContain("selectedPreviewComplements");
    expect(builderSource).toContain("setSelectedPreviewComplements");
    expect(builderSource).toContain("function DevPreviewBadge");
    expect(builderSource).toContain("PRÉVIA DEV");
    expect(builderSource).not.toContain("selectedPreviewComplementItems");
  });

  it("keeps DEV preview fixture isolated and explicitly scoped", () => {
    expect(previewFixtureSource).toContain(
      "DEV PREVIEW ONLY — NÃO USAR COMO VERDADE COMERCIAL",
    );
    expect(previewFixtureSource).toContain("Bacon adicional");
    expect(previewFixtureSource).toContain("Catupiry adicional");
    expect(previewFixtureSource).toContain("Queijo extra");
    expect(previewFixtureSource).toContain("Queijo extra na pizza inteira");
    expect(previewFixtureSource).toContain('pizzaAddonScope: "flavor1"');
    expect(previewFixtureSource).toContain('pizzaAddonScope: "flavor2"');
    expect(previewFixtureSource).toContain('pizzaAddonScope: "global"');
    expect(previewFixtureSource).not.toContain("api.");
    expect(previewFixtureSource).not.toContain("useQuery");
  });

  it("keeps global pizza addons contextualized after both halves and without an intermediate CTA", () => {
    const collapsedStepSource = builderSource.slice(
      builderSource.indexOf("function CollapsedStep"),
      builderSource.indexOf("function FutureStep"),
    );
    const globalHalfSource = builderSource.slice(
      builderSource.indexOf("function GlobalAddonsHalfSummary"),
      builderSource.indexOf("function AddonsStep"),
    );

    expect(builderSource).toContain("const canRenderGlobalAddons");
    expect(builderSource).toContain("visualGlobalComplementGroups.length > 0 && flavorSequenceConfirmed");
    expect(builderSource).toContain("const showConfirmedHalvesContext");
    expect(builderSource).toContain('activeStep === "border"');
    expect(builderSource).toContain('activeStep === "observation"');
    expect(builderSource).toContain("function ConfirmedHalvesContext");
    expect(builderSource).toContain("function GlobalAddonsHalfSummary");
    expect(builderSource).toContain("formatGlobalAddonsRemovalContext");
    expect(builderSource).toContain("buildConfirmedHalfDetails(");
    expect(builderSource).toContain("half1ComplementSummary");
    expect(builderSource).toContain("half2ComplementSummary");
    expect(builderSource).toContain("onEditFlavor1={() => jumpTo(\"flavor1Adjust\")}");
    expect(builderSource).toContain("onEditFlavor2={() => jumpTo(\"flavor2Adjust\")}");
    expect(collapsedStepSource).toContain("aria-label={editLabel}");
    expect(collapsedStepSource).toContain("<ChevronDownIcon");
    expect(collapsedStepSource).not.toContain("Alterar");
    expect(globalHalfSource).toContain("aria-label={`Editar ${label}, sabor ${ariaFlavorName}`}");
    expect(globalHalfSource).toContain("<ChevronDownIcon");
    expect(globalHalfSource).not.toContain("Alterar");
    expect(globalHalfSource).not.toContain("PencilIcon");
    expect(builderSource).not.toContain('if (step === "addons") return "Continuar";');
  });

  it("renders collapsed observation with the canonical compact row instead of an active card", () => {
    const observationSummaryStart = builderSource.indexOf("function ObservationSummaryStep");
    const observationEditorStart = builderSource.indexOf("function ObservationStep");
    const observationSummarySource = builderSource.slice(
      observationSummaryStart,
      observationEditorStart,
    );

    expect(observationSummaryStart).toBeGreaterThan(-1);
    expect(observationEditorStart).toBeGreaterThan(observationSummaryStart);
    expect(observationSummarySource).toContain("<CompactSettingRow");
    expect(observationSummarySource).toContain('label="Observação"');
    expect(observationSummarySource).toContain("value={summaryValue}");
    expect(observationSummarySource).toContain("ariaLabel={formatObservationSummaryAriaLabel(value)}");
    expect(observationSummarySource).toContain("buttonRef={buttonRef}");
    expect(builderSource).toContain("function formatObservationSummaryValue");
    expect(builderSource).toContain(".split(/\\r?\\n/)[0]");
    expect(builderSource).toContain('return firstLine || "Sem observação";');
    expect(builderSource).toContain("function formatObservationSummaryAriaLabel");
    expect(builderSource).not.toContain('value={filled ? "Preenchida" : "Opcional"}');
    expect(observationSummarySource).not.toContain("<StepShell");
    expect(observationSummarySource).not.toContain("pizzaSectionTitleClass");
    expect(builderSource).toContain("buttonRef?: RefObject<HTMLButtonElement | null>;");
    expect(builderSource).toContain("ref={buttonRef}");
    expect(builderSource).toContain("ariaLabel?: string;");
    expect(builderSource).toContain("aria-label={ariaLabel}");
  });

  it("uses Pizza Atual as a finalization state of the same builder surface", () => {
    expect(builderSource).toContain('double: "DOIS SABORES"');
    expect(builderSource).toContain("completion.complete && unitPrice !== undefined");
    expect(builderSource).toContain("reviewTotal");
    expect(builderSource).toContain("complete: completion.complete");
    expect(builderSource).toContain("const finalizationOpen = summaryExpanded && completion.complete;");
    expect(builderSource).toContain("const finalizationSubtitle =");
    expect(builderSource).toContain("pizzaFlavorKindLabels[selectedFlavorKind].toUpperCase()");
    expect(builderSource).toContain("2 SABORES");
    expect(builderSource).toContain("const summaryFooterStatus = completion.complete");
    expect(builderSource).toContain('? "Conferir antes de adicionar"');
    expect(builderSource).toContain("if (finalizationOpen) {");
    expect(builderSource).toContain("setSummaryExpanded(false);");
    expect(builderSource).toContain('aria-label={finalizationOpen ? "Pizza Atual" : "Monte sua pizza"}');
    expect(builderSource).toContain("key=\"pizza-finalization-view\"");
    expect(builderSource).toContain("key=\"pizza-assembly-view\"");
    expect(builderSource).toContain('aria-label="Conferência da pizza atual"');
    expect(builderSource).toContain("finalizationContentRef.current?.scrollTo");
    expect(builderSource).not.toContain("key=\"pizza-current-review-modal\"");
    expect(builderSource).not.toContain("key=\"pizza-current-review-backdrop\"");
    expect(builderSource).not.toContain("bg-black/45");
    expect(builderSource).toContain("function FinalPriceSummary");
    expect(builderSource).toContain("if (completion.complete) setSummaryExpanded(true);");
    expect(builderSource).toContain("Total da pizza");
    expect(builderSource).toContain("preview ?");
    expect(builderSource).not.toContain("Como o preÃ§o foi calculado");
    expect(builderSource).not.toContain("ReferÃªncia da");
    expect(builderSource).not.toContain("ConfiguraÃ§Ã£o concluÃ­da");
    expect(builderSource).not.toContain("PreÃ§o final calculado");
    expect(builderSource).not.toContain("PreÃ§o calculado");
    expect(builderSource).not.toContain("preÃ§o da metade");
    expect(builderSource).not.toContain("preco da metade");
    expect(builderSource).not.toContain("function HalfPizzaHeaderIcon");
    expect(builderSource).not.toContain("<HalfPizzaHeaderIcon");
    expect(builderSource).not.toContain("function ReviewStep");
    expect(builderSource).not.toContain("Revisar pizza");
    expect(builderSource).not.toContain("Pronta");
  });
  it("keeps the final review clear for half 2, observation and quantity", () => {
    expect(builderSource).toContain("const isHalf2 = label === \"Metade 2\";");
    expect(builderSource).toContain("border border-[#d7deca] bg-[#f3f6ec]");
    expect(builderSource).toContain("function FinalPriceSummary");
    expect(builderSource).toContain("Pizza com 2 sabores");
    expect(builderSource).toContain("Adicionais da Metade 1");
    expect(builderSource).toContain("Adicionais da Metade 2");
    expect(builderSource).toContain("Adicional da pizza");
    expect(builderSource).toContain('isHalf2 ? "text-[#626A49]" : "text-[#8a4a18]"');
    expect(builderSource).toContain('label="Metade 1"');
    expect(builderSource).toContain('label="Metade 2"');
    expect(builderSource).toContain("function FinalHalfSummary");
    expect(builderSource).toContain('{removed.length > 0 ? removed.join(", ") : "Sem retiradas"}');
    expect(builderSource).toContain("{addons.length > 0 && (");
    expect(builderSource).not.toContain('"Adicionais: sem adicionais"');
    expect(builderSource).toContain('return firstLine || "Sem observação";');
    expect(builderSource).not.toContain('return firstLine || "Opcional";');
    expect(builderSource).toContain('return "Sem observação. Toque para editar.";');
    expect(builderSource).toContain("const total = unitPrice !== undefined ? unitPrice * quantity : undefined;");
    expect(builderSource).toContain("disabled={quantity <= 1}");
    expect(builderSource).toContain("setQuantity((current) => Math.max(1, current - 1))");
    expect(builderSource).toContain("setQuantity((current) => current + 1)");
    expect(builderSource).toContain('aria-live="polite"');
    expect(builderSource).toContain('aria-atomic="true"');
    expect(builderSource).toContain("{quantity}");
  });

  it("uses one compact review pattern and chevron-right edit action in final review", () => {
    const detailsStart = builderSource.indexOf("function FinalReviewCompactGroup");
    const detailsLineStart = builderSource.indexOf("function FinalReviewCompactLine");
    const globalHalfStart = builderSource.indexOf("function GlobalAddonsHalfSummary");
    const detailsSource = builderSource.slice(detailsStart, globalHalfStart);
    const finalHalfSource = builderSource.slice(
      builderSource.indexOf("function FinalHalfSummary"),
      builderSource.indexOf("function FinalGlobalAddonsSummary"),
    );
    const finalGlobalSource = builderSource.slice(
      builderSource.indexOf("function FinalGlobalAddonsSummary"),
      builderSource.indexOf("function FinalPriceSummary"),
    );

    expect(detailsStart).toBeGreaterThan(-1);
    expect(detailsLineStart).toBeGreaterThan(-1);
    expect(detailsSource).toContain("overflow-hidden rounded-[12px] border border-[#eee6da] bg-white");
    expect(builderSource).toContain("function FinalReviewChevronButton");
    expect(builderSource).toContain("function FinalReviewChevronRightIcon");
    expect(builderSource).toContain("ChevronRightIcon className=\"h-3.5 w-3.5 shrink-0\"");
    expect(builderSource).not.toContain("PencilIcon");
    expect(builderSource).toContain("ariaLabel: \"Editar tamanho\"");
    expect(builderSource).toContain("ariaLabel: \"Editar borda\"");
    expect(builderSource).toContain("ariaLabel: \"Editar observação\"");
    expect(builderSource).toContain("const editLabel = `Editar ${label}`;");
    expect(builderSource).toContain("ariaLabel={editLabel}");
    expect(builderSource).toContain("ariaLabel=\"Editar adicionais da pizza\"");
    expect(detailsSource).toContain("h-px bg-[#eee6da]");
    expect(detailsSource).toContain("min-h-[42px]");
    expect(detailsSource).toContain("grid-cols-[82px_minmax(0,1fr)_auto]");
    expect(detailsSource).toContain('return firstLine || "Sem observação";');
    expect(detailsSource).not.toContain("Alterar");
    expect(finalHalfSource).not.toContain("Alterar");
    expect(finalGlobalSource).not.toContain("Alterar");
    expect(detailsSource).not.toContain("Opcional");
    expect(detailsSource).not.toContain("Preenchida");
  });

  it("opens the final review automatically after Borda selection", () => {
    const borderSelectStart = builderSource.indexOf("onSelect={(key) => {\n                    triggerSelectionFeedback(`border:${key}`);");
    const observationSummaryStart = builderSource.indexOf("{activeStep === \"observation\"");
    const borderSelectSource = builderSource.slice(borderSelectStart, observationSummaryStart);

    expect(borderSelectStart).toBeGreaterThan(-1);
    expect(borderSelectSource).toContain("setBorderKey(key);");
    expect(borderSelectSource).toContain("setOpenGlobalEditor(null);");
    expect(borderSelectSource).toContain("setActiveStep(\"observation\");");
    expect(borderSelectSource).toContain("setSummaryExpanded(true);");
    expect(borderSelectSource).not.toContain("setOpenGlobalEditor(\"observation\")");
    expect(borderSelectSource).not.toContain("Continuar");
    expect(borderSelectSource).not.toContain("Revisar pizza");
    expect(borderSelectSource).not.toContain("Confirmar borda");
  });
});
