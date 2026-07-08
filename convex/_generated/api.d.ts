/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin_index from "../admin/index.js";
import type * as auth_operators from "../auth/operators.js";
import type * as auth_pinReset from "../auth/pinReset.js";
import type * as caixa_vendas from "../caixa/vendas.js";
import type * as catalog_categories from "../catalog/categories.js";
import type * as catalog_list from "../catalog/list.js";
import type * as catalog_products from "../catalog/products.js";
import type * as ojc_catalogo from "../ojc/catalogo.js";
import type * as ojc_transferencias from "../ojc/transferencias.js";
import type * as ojc_whatsapp from "../ojc/whatsapp.js";
import type * as operators_manage from "../operators/manage.js";
import type * as users from "../users.js";
import type * as venda_delivery from "../venda/delivery.js";
import type * as venda_operadores from "../venda/operadores.js";
import type * as venda_pedidos from "../venda/pedidos.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "admin/index": typeof admin_index;
  "auth/operators": typeof auth_operators;
  "auth/pinReset": typeof auth_pinReset;
  "caixa/vendas": typeof caixa_vendas;
  "catalog/categories": typeof catalog_categories;
  "catalog/list": typeof catalog_list;
  "catalog/products": typeof catalog_products;
  "ojc/catalogo": typeof ojc_catalogo;
  "ojc/transferencias": typeof ojc_transferencias;
  "ojc/whatsapp": typeof ojc_whatsapp;
  "operators/manage": typeof operators_manage;
  users: typeof users;
  "venda/delivery": typeof venda_delivery;
  "venda/operadores": typeof venda_operadores;
  "venda/pedidos": typeof venda_pedidos;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
