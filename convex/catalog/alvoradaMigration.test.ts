import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import { api } from "../_generated/api";
import schema from "../schema";
import {
  alvoradaCommercialUpgrades,
  alvoradaComplementItems,
  alvoradaPizzaConfigurations,
  alvoradaProductOptions,
  alvoradaProducts,
  expectedSourceCounts,
} from "./alvoradaCatalogData";

const modules = {
  "./_generated/api.js": () => import("../_generated/api.js"),
  "./_generated/server.js": () => import("../_generated/server.js"),
  "./catalog/alvoradaMigration.ts": () => import("./alvoradaMigration"),
};

describe("migração controlada do catálogo real Alvorada", () => {
  it("mantém as contagens da fonte sem inventar opções além do documento", () => {
    expect(alvoradaProducts).toHaveLength(expectedSourceCounts.products);
    expect(alvoradaProductOptions).toHaveLength(
      expectedSourceCounts.productOptions,
    );
    expect(expectedSourceCounts.sourceDocumentMentionsOptions).toBe(94);
    expect(expectedSourceCounts.requestMentionsOptionsOrVariations).toBe(98);
  });

  it("não converte preço pendente em zero nem deixa opção pendente vendável", () => {
    const pendingOptions = alvoradaProductOptions.filter(
      (option) => option.priceStatus !== "confirmado",
    );

    expect(pendingOptions.map((option) => option.documentKey)).toEqual([
      "CATALOG-ALVORADA:OPTION:BEB-001:600ML",
      "CATALOG-ALVORADA:OPTION:BEB-001:1L",
      "CATALOG-ALVORADA:OPTION:BEB-003:2L",
    ]);
    expect(
      pendingOptions.every(
        (option) =>
          option.price !== 0 &&
          option.priceStatus !== "confirmado" &&
          option.sellable === false,
      ),
    ).toBe(true);
  });

  it("mantém pizzas com P/M/G e política media_arredondada_050", () => {
    const pizzaOptions = alvoradaProductOptions.filter((option) =>
      option.documentKey.includes(":PIZ-"),
    );
    expect(pizzaOptions).toHaveLength(42);
    expect(
      alvoradaPizzaConfigurations.every(
        (config) =>
          config.allowedSizes.join(",") === "P,M,G" &&
          config.maxFlavorsBySize.P === 1 &&
          config.maxFlavorsBySize.M === 2 &&
          config.maxFlavorsBySize.G === 2 &&
          config.pricingPolicy === "media_arredondada_050",
      ),
    ).toBe(true);
  });

  it("registra adicionais reais dos artesanais sem vínculo operacional amplo", () => {
    expect(alvoradaComplementItems.map((item) => item.name)).toEqual([
      "Hambúrguer",
      "Mucarela",
      "Bacon",
    ]);
    expect(alvoradaComplementItems.every((item) => item.price === 6)).toBe(true);
    expect(alvoradaCommercialUpgrades[0]).toMatchObject({
      name: "+100 g de batata",
      active: false,
      operationalStatus: "pendente_modelagem",
      priceStatus: "pendente",
    });
  });

  it("aplica no banco de teste de forma idempotente", async () => {
    const t = convexTest(schema, modules);

    const first = await t.mutation(api.catalog.alvoradaMigration.applyToDev, {
      target: "DEV",
      confirm: "APPLY_CATALOG_INSTANCE_ALVORADA_001_TO_DEV",
    });
    expect(first.totals.sourceProductsAppliedOrUpdated).toBe(59);
    expect(first.totals.sourceProductOptionsAppliedOrUpdated).toBe(94);
    expect(first.totals.conflicts).toBe(0);

    const second = await t.mutation(api.catalog.alvoradaMigration.applyToDev, {
      target: "DEV",
      confirm: "APPLY_CATALOG_INSTANCE_ALVORADA_001_TO_DEV",
    });
    expect(second.counts.product.create).toBe(0);
    expect(second.counts.productOption.create).toBe(0);
    expect(second.counts.product.update).toBe(0);
    expect(second.counts.productOption.update).toBe(0);

    const summary = await t.query(
      api.catalog.alvoradaMigration.postMigrationSummary,
      {},
    );
    expect(summary.database.sourceProducts).toBe(59);
    expect(summary.database.sourceProductOptions).toBe(94);
    expect(summary.database.pendingOptions).toBe(3);
  });
});
