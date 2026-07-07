
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const enderecoEntrega = v.object({
  cep: v.string(),
  logradouro: v.string(),
  numero: v.string(),
  complemento: v.optional(v.string()),
  bairro: v.string(),
  cidade: v.string(),
  uf: v.string(),
  referencia: v.optional(v.string()),
  latitude: v.optional(v.number()),
  longitude: v.optional(v.number()),
});

const adicionalItem = v.object({
  adicionalId: v.string(),
  nomeSnapshot: v.string(),
  precoSnapshot: v.number(),
  quantidade: v.number(),
});

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    role: v.optional(v.union(v.literal("superadmin"), v.literal("admin"), v.literal("user"))),
  }).index("by_token", ["tokenIdentifier"]).index("by_role", ["role"]),

  operators: defineTable({
    operatorId: v.string(),
    name: v.string(),
    role: v.string(),
    pinHash: v.string(),
    units: v.array(v.string()),
    active: v.boolean(),
    phone: v.optional(v.string()),
    createdBy: v.optional(v.string()),
    createdAt: v.optional(v.string()),
    updatedAt: v.optional(v.string()),
  }).index("by_operatorId", ["operatorId"]),

  pinResets: defineTable({
    operatorId: v.string(),
    newPinHash: v.string(),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
  }).index("by_operatorId", ["operatorId"]).index("by_status", ["status"]),

  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    icon: v.string(),
    order: v.number(),
    active: v.boolean(),
  }).index("by_slug", ["slug"]).index("by_order", ["order"]),

  products: defineTable({
    categoryId: v.id("categories"),
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    imageUrl: v.optional(v.string()),
    active: v.boolean(),
    featured: v.boolean(),
    hasSizes: v.optional(v.boolean()),
    sizes: v.optional(v.array(v.object({ label: v.string(), extraPrice: v.number() }))),
  })
    .index("by_category", ["categoryId"])
    .index("by_active", ["active"]),

  pedidos: defineTable({
    numero: v.string(),
    unit: v.string(),
    canalOrigem: v.string(),
    modalidadeAtendimento: v.string(),
    status: v.string(),
    statusEntidade: v.string(),
    operadorAberturaId: v.id("operators"),
    operadorAberturaNomeSnapshot: v.string(),
    operadorFechamentoId: v.optional(v.id("operators")),
    operadorFechamentoNomeSnapshot: v.optional(v.string()),
    operadorCancelamentoId: v.optional(v.id("operators")),
    operadorCancelamentoNomeSnapshot: v.optional(v.string()),
    operadorEntregaId: v.optional(v.id("operators")),
    operadorEntregaNomeSnapshot: v.optional(v.string()),
    clienteId: v.optional(v.id("clientes")),
    clienteNomeSnapshot: v.optional(v.string()),
    clienteNomeImpressaoSnapshot: v.optional(v.string()),
    clienteNomeEntregaSnapshot: v.optional(v.string()),
    clienteTelefoneSnapshot: v.optional(v.string()),
    clienteCpfSnapshot: v.optional(v.string()),
    mesaId: v.optional(v.string()),
    mesaNumeroSnapshot: v.optional(v.number()),
    enderecoEntrega: v.optional(enderecoEntrega),
    totalBruto: v.number(),
    desconto: v.optional(v.number()),
    totalLiquido: v.number(),
    formaPagamento: v.optional(v.string()),
    troco: v.optional(v.number()),
    observacoes: v.optional(v.string()),
    motivoCancelamento: v.optional(v.string()),
    dataAbertura: v.string(),
    dataFechamento: v.optional(v.string()),
    dataCancelamento: v.optional(v.string()),
  })
    .index("by_unit_status", ["unit", "status"])
    .index("by_unit_data", ["unit", "dataAbertura"])
    .index("by_unit_numero", ["unit", "numero"])
    .index("by_mesa", ["mesaId"])
    .index("by_cliente", ["clienteId"])
    .index("by_operador_abertura", ["operadorAberturaId"]),

  itensPedido: defineTable({
    pedidoId: v.id("pedidos"),
    unit: v.string(),
    produtoId: v.id("products"),
    nomeProdutoSnapshot: v.string(),
    precoProdutoSnapshot: v.number(),
    categoriaProdutoSnapshot: v.string(),
    quantidade: v.number(),
    subtotal: v.number(),
    adicionais: v.optional(v.array(adicionalItem)),
    observacaoItem: v.optional(v.string()),
    statusProducao: v.string(),
    statusEntidade: v.string(),
    dataAdicionado: v.string(),
  })
    .index("by_pedido", ["pedidoId"])
    .index("by_status_producao", ["pedidoId", "statusProducao"]),

  eventosPedido: defineTable({
    pedidoId: v.id("pedidos"),
    unit: v.string(),
    tipo: v.string(),
    categoria: v.string(),
    operadorId: v.id("operators"),
    operadorNomeSnapshot: v.string(),
    payload: v.optional(v.string()),
    timestamp: v.string(),
  })
    .index("by_pedido", ["pedidoId"])
    .index("by_unit_data", ["unit", "timestamp"])
    .index("by_categoria", ["pedidoId", "categoria"]),

  vendas: defineTable({
    pedidoId: v.id("pedidos"),
    unit: v.string(),
    numero: v.string(),
    status: v.string(),
    statusEntidade: v.string(),
    totalBruto: v.number(),
    desconto: v.number(),
    totalLiquido: v.number(),
    formaPagamento: v.string(),
    troco: v.optional(v.number()),
    operadorCaixaId: v.id("operators"),
    operadorCaixaNomeSnapshot: v.string(),
    dataVenda: v.string(),
  })
    .index("by_unit_status", ["unit", "status"])
    .index("by_pedido", ["pedidoId"])
    .index("by_unit_data", ["unit", "dataVenda"]),

  clientes: defineTable({
    unit: v.string(),
    nome: v.string(),
    nomeImpressao: v.optional(v.string()),
    nomeEntrega: v.optional(v.string()),
    telefone: v.string(),
    cpf: v.optional(v.string()),
    enderecos: v.optional(v.array(enderecoEntrega)),
    observacoes: v.optional(v.string()),
    statusEntidade: v.string(),
  })
    .index("by_unit_telefone", ["unit", "telefone"])
    .index("by_unit_status", ["unit", "statusEntidade"]),
});
