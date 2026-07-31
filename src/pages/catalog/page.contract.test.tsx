import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const catalogSource = readFileSync("src/pages/catalog/page.tsx", "utf8");
const decisionSource = readFileSync("docs/arquitetura/decisoes/pizza.yaml", "utf8");

describe("Catalog floating cart and help decision contract", () => {
  it("registers the approved attached help dock decision", () => {
    expect(decisionSource).toContain("id: DEC-CATALOGO-003");
    expect(decisionSource).toContain("Ajuda integrada ao dock do carrinho");
    expect(decisionSource).toContain(
      "Com carrinho ativo, Ajuda fica visualmente anexada ao dock",
    );
    expect(decisionSource).toContain("id: DEC-CATALOGO-004");
    expect(decisionSource).toContain("Dock do carrinho com superficie oliva");
  });

  it("keeps help as an independent FAB only when the cart is empty", () => {
    expect(catalogSource).toContain("{visualCartQuantity === 0 && (");
    expect(catalogSource).toContain('aria-label="Abrir ajuda"');
    expect(catalogSource).toMatch(/>\s*Ajuda\s*</);
    expect(catalogSource).not.toContain(
      "bottom-[calc(env(safe-area-inset-bottom)+5.55rem)]",
    );
  });

  it("renders one dock surface with separate cart and help actions when cart has items", () => {
    expect(catalogSource).toContain("{visualCartQuantity > 0 && (");
    expect(catalogSource).toContain("flex h-[58px] w-full overflow-hidden");
    expect(catalogSource).toContain("border-[#6f7429] bg-[#626a2d] text-white");
    expect(catalogSource).not.toContain("border-[#e8ded1] bg-[#fffdfa]");
    expect(catalogSource).toContain("text-white/86");
    expect(catalogSource).toContain("bg-emerald-600");
    expect(catalogSource).toContain("aria-hidden=\"true\"");
    expect(catalogSource).toContain("w-[50px] shrink-0");
    expect(catalogSource).toContain("Ver carrinho");
    expect(catalogSource).toContain("aria-label={`Ver carrinho: ${formatCatalogItemCount");
    expect(catalogSource).toContain('aria-label="Abrir ajuda"');
  });

  it("keeps cart quantity and subtotal sourced from the visual cart state", () => {
    expect(catalogSource).toContain("const visualCartQuantity = visualCart.reduce");
    expect(catalogSource).toContain("const visualCartTotal = visualCart.reduce");
    expect(catalogSource).toContain("const formatCatalogItemCount");
    expect(catalogSource).toContain('quantity === 1 ? "item" : "itens"');
    expect(catalogSource).toContain("formatCatalogItemCount(visualCartQuantity)");
    expect(catalogSource).toContain("formatCatalogPrice(visualCartTotal)");
    expect(catalogSource).not.toContain('> 1 ? "s" : ""');
  });
});

describe("Catalog category menu distribution contract", () => {
  it("registers the approved uniform category menu decision", () => {
    expect(decisionSource).toContain("id: DEC-CATALOGO-005");
    expect(decisionSource).toContain(
      "Distribuicao uniforme do menu de categorias",
    );
    expect(decisionSource).toContain(
      "as cinco categorias principais ocupam uma regiao central estavel",
    );
    expect(decisionSource).toContain("id: DEC-CATALOGO-006");
    expect(decisionSource).toContain(
      "Alinhamento optico do menu de categorias",
    );
    expect(decisionSource).toContain(
      "a homologacao depende da percepcao visual real",
    );
    expect(decisionSource).toContain("id: DEC-CATALOGO-007");
    expect(decisionSource).toContain(
      "Ritmo vertical uniforme do menu de categorias",
    );
    expect(decisionSource).toContain("id: DEC-CATALOGO-008");
    expect(decisionSource).toContain(
      "Alternancia funcional de tema Dia/Noite",
    );
    expect(decisionSource).toContain("id: DEC-CATALOGO-009");
    expect(decisionSource).toContain(
      "Distribuicao optica do menu por largura real dos conjuntos",
    );
    expect(decisionSource).toContain(
      "nao usa cinco celulas iguais nem centros equidistantes",
    );
    expect(decisionSource).toContain("id: DEC-CATALOGO-010");
    expect(decisionSource).toContain(
      "Gap uniforme entre conjuntos visuais das categorias",
    );
    expect(decisionSource).toContain(
      "areas invisiveis de toque nao podem interferir no espacamento optico",
    );
    expect(decisionSource).toContain("id: DEC-CATALOGO-011");
    expect(decisionSource).toContain(
      "Areas de toque independentes em telas estreitas",
    );
    expect(decisionSource).toContain(
      "fronteiras deterministicas pelos pontos medios entre os centros visuais",
    );
  });

  it("keeps the compact menu split into fixed search, visible category group and fixed expander", () => {
    expect(catalogSource).toContain(
      "grid grid-cols-[44px_minmax(0,1fr)_44px] items-center",
    );
    expect(catalogSource).toContain(
      "mx-auto flex h-full w-max max-w-full min-w-0 items-center justify-center gap-[19px]",
    );
    expect(catalogSource).toContain(
      "mx-auto flex h-full w-max max-w-full min-w-0 items-end justify-center gap-[19px]",
    );
    expect(catalogSource).not.toContain(
      'className="flex w-full min-w-0 items-center justify-between"',
    );
    expect(catalogSource).not.toContain(
      'className="flex w-full min-w-0 items-end justify-between"',
    );
    expect(catalogSource).not.toContain("grid-cols-[repeat(5,minmax(0,1fr))]");
    expect(catalogSource).not.toContain("grid-template-columns: repeat(5");
    expect(catalogSource).not.toContain("grid-cols-5 items-center");
    expect(catalogSource).not.toContain("grid-cols-5 items-end");
  });

  it("separates the visible category layer from the 44px touch area", () => {
    expect(catalogSource).toContain("data-category-visual={primary ? slot.key : undefined}");
    expect(catalogSource).toContain("const [categoryTouchZones, setCategoryTouchZones]");
    expect(catalogSource).toContain("ResizeObserver");
    expect(catalogSource).toContain("data-category-touch-key={slot.key}");
    expect(catalogSource).toContain("aria-pressed={activeCatalogKey === slot.key}");
    expect(catalogSource).toContain("(visualRects[index - 1].center + item.center) / 2");
    expect(catalogSource).toContain("(item.center + visualRects[index + 1].center) / 2");
    expect(catalogSource).toContain("style={{");
    expect(catalogSource).not.toContain("before:h-11 before:w-11");
    expect(catalogSource).not.toContain("before:content-['']");
    expect(catalogSource).toContain('primary ? "w-max gap-[5px]" : "w-full gap-1"');
    expect(catalogSource).not.toContain("min-w-11 flex-none");
    expect(catalogSource).not.toContain("max-[340px]:min-w-10");
  });

  it("makes each main category use its own visible width without grow or label-based offsets", () => {
    expect(catalogSource).toContain("flex-none p-0");
    expect(catalogSource).toContain("w-max");
    expect(catalogSource).toContain("primary");
    expect(catalogSource).toContain("gap-[19px]");
    expect(catalogSource).toContain("w-max gap-[5px]");
    expect(catalogSource).toContain("text-[9.5px]");
    expect(catalogSource).toContain("max-[380px]:text-[8px]");
    expect(catalogSource).toContain("max-[340px]:text-[7px]");
    expect(catalogSource).toContain("primary ? \"w-7\" : \"w-9\"");
    expect(catalogSource).toContain("whitespace-nowrap text-center");
    expect(catalogSource).not.toContain("space-around");
    expect(catalogSource).not.toContain("flex: 1");
    expect(catalogSource).not.toContain("width: 20%");
    expect(catalogSource).not.toContain("data-category-key=\"highlights\"");
    expect(catalogSource).not.toContain("data-category-key=\"lanches\"");
  });

  it("keeps category tab vertical metrics identical between active and inactive states", () => {
    expect(catalogSource).toContain("h-[10px] leading-[10px]");
    expect(catalogSource).toContain('aria-hidden="true"');
    expect(catalogSource).toContain(
      'active ? "opacity-100" : "opacity-0"',
    );
    expect(catalogSource).not.toContain("{active && (\n        <span");
  });

  it("lets the URL theme parameter initialize without blocking the theme toggle", () => {
    expect(catalogSource).toContain("const themeUrlAppliedRef = useRef(false)");
    expect(catalogSource).toContain("if (themeUrlAppliedRef.current) return");
    expect(catalogSource).toContain("themeUrlAppliedRef.current = true");
    expect(catalogSource).toContain("handleToggleCatalogTheme");
    expect(catalogSource).toContain("nextUrl.searchParams.set(\"theme\", nextTheme)");
    expect(catalogSource).toContain("window.history.replaceState");
    expect(catalogSource).toContain("aria-pressed={isDark}");
  });
});
