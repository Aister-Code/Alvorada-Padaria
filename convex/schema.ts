
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import {
  cartContractVersionValidator,
  catalogCartContractValidator,
  catalogMigrationStatusValidator,
  conversionSnapshotValidator,
  conversionSnapshotVersionValidator,
  imageOriginValidator,
  imageStatusValidator,
  optionMetadataValidator,
  optionTypeValidator,
  pizzaKindValidator,
  pizzaPricingPolicyValidator,
  priceStatusValidator,
  productOriginValidator,
  upgradeOperationalStatusValidator,
} from "./catalog/contracts";

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
    documentKey: v.optional(v.string()),
    code: v.optional(v.string()),
    description: v.optional(v.string()),
    displayOrder: v.optional(v.number()),
    createdAt: v.optional(v.string()),
    updatedAt: v.optional(v.string()),
    createdBy: v.optional(v.string()),
    updatedBy: v.optional(v.string()),
    version: v.optional(v.string()),
  })
    .index("by_slug", ["slug"])
    .index("by_order", ["order"])
    .index("by_document_key", ["documentKey"])
    .index("by_active_order", ["active", "displayOrder"]),

  products: defineTable({
    categoryId: v.id("categories"),
    name: v.string(),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    imageUrl: v.optional(v.string()),
    active: v.boolean(),
    featured: v.boolean(),
    hasSizes: v.optional(v.boolean()),
    sizes: v.optional(v.array(v.object({ label: v.string(), extraPrice: v.number() }))),
    documentKey: v.optional(v.string()),
    documentalId: v.optional(v.string()),
    slug: v.optional(v.string()),
    subcategory: v.optional(v.string()),
    family: v.optional(v.string()),
    shortDescription: v.optional(v.string()),
    origin: v.optional(productOriginValidator),
    displayOrder: v.optional(v.number()),
    basePrice: v.optional(v.number()),
    priceStatus: v.optional(priceStatusValidator),
    productionSector: v.optional(v.string()),
    migrationStatus: v.optional(catalogMigrationStatusValidator),
    documentVersion: v.optional(v.string()),
    createdAt: v.optional(v.string()),
    updatedAt: v.optional(v.string()),
    createdBy: v.optional(v.string()),
    updatedBy: v.optional(v.string()),
    version: v.optional(v.string()),
  })
    .index("by_category", ["categoryId"])
    .index("by_active", ["active"])
    .index("by_document_key", ["documentKey"])
    .index("by_category_active_order", ["categoryId", "active", "displayOrder"])
    .index("by_documental_id", ["documentalId"]),

  productOptions: defineTable({
    documentKey: v.string(),
    productId: v.id("products"),
    code: v.string(),
    label: v.string(),
    optionType: optionTypeValidator,
    price: v.optional(v.number()),
    priceStatus: priceStatusValidator,
    active: v.boolean(),
    sellable: v.boolean(),
    required: v.boolean(),
    displayOrder: v.number(),
    metadata: v.optional(optionMetadataValidator),
    createdAt: v.string(),
    updatedAt: v.string(),
    createdBy: v.optional(v.string()),
    updatedBy: v.optional(v.string()),
    version: v.string(),
  })
    .index("by_document_key", ["documentKey"])
    .index("by_product_active_order", ["productId", "active", "displayOrder"])
    .index("by_product_sellable", ["productId", "sellable"]),

  complementGroups: defineTable({
    documentKey: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    minSelections: v.number(),
    maxSelections: v.optional(v.number()),
    required: v.boolean(),
    active: v.boolean(),
    displayOrder: v.number(),
    createdAt: v.string(),
    updatedAt: v.string(),
    createdBy: v.optional(v.string()),
    updatedBy: v.optional(v.string()),
    version: v.string(),
  })
    .index("by_document_key", ["documentKey"])
    .index("by_active_order", ["active", "displayOrder"]),

  complementItems: defineTable({
    documentKey: v.string(),
    groupId: v.id("complementGroups"),
    name: v.string(),
    price: v.optional(v.number()),
    priceStatus: priceStatusValidator,
    maxQuantity: v.optional(v.number()),
    active: v.boolean(),
    sellable: v.boolean(),
    displayOrder: v.number(),
    metadata: v.optional(v.record(v.string(), v.string())),
    createdAt: v.string(),
    updatedAt: v.string(),
    createdBy: v.optional(v.string()),
    updatedBy: v.optional(v.string()),
    version: v.string(),
  })
    .index("by_document_key", ["documentKey"])
    .index("by_group_active_order", ["groupId", "active", "displayOrder"])
    .index("by_group_sellable", ["groupId", "sellable"]),

  productComplementGroups: defineTable({
    productId: v.id("products"),
    groupId: v.id("complementGroups"),
    active: v.boolean(),
    displayOrder: v.number(),
    rules: v.optional(v.record(v.string(), v.string())),
    createdAt: v.string(),
    updatedAt: v.string(),
    createdBy: v.optional(v.string()),
    updatedBy: v.optional(v.string()),
    version: v.string(),
  })
    .index("by_product", ["productId"])
    .index("by_group", ["groupId"])
    .index("by_product_active_order", ["productId", "active", "displayOrder"]),

  commercialUpgrades: defineTable({
    documentKey: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    priceStatus: priceStatusValidator,
    operationalStatus: upgradeOperationalStatusValidator,
    active: v.boolean(),
    displayOrder: v.number(),
    createdAt: v.string(),
    updatedAt: v.string(),
    createdBy: v.optional(v.string()),
    updatedBy: v.optional(v.string()),
    version: v.string(),
  })
    .index("by_document_key", ["documentKey"])
    .index("by_operational_status", ["operationalStatus"])
    .index("by_active_order", ["active", "displayOrder"]),

  productUpgrades: defineTable({
    productId: v.id("products"),
    upgradeId: v.id("commercialUpgrades"),
    active: v.boolean(),
    displayOrder: v.number(),
    rules: v.optional(v.record(v.string(), v.string())),
    createdAt: v.string(),
    updatedAt: v.string(),
    createdBy: v.optional(v.string()),
    updatedBy: v.optional(v.string()),
    version: v.string(),
  })
    .index("by_product", ["productId"])
    .index("by_upgrade", ["upgradeId"])
    .index("by_product_active_order", ["productId", "active", "displayOrder"]),

  productImages: defineTable({
    documentKey: v.string(),
    productId: v.id("products"),
    assetReference: v.optional(v.string()),
    storageId: v.optional(v.string()),
    externalUrl: v.optional(v.string()),
    origin: imageOriginValidator,
    status: imageStatusValidator,
    altText: v.string(),
    replacementPending: v.boolean(),
    isPrimary: v.boolean(),
    displayOrder: v.number(),
    active: v.boolean(),
    createdAt: v.string(),
    updatedAt: v.string(),
    createdBy: v.optional(v.string()),
    updatedBy: v.optional(v.string()),
    version: v.string(),
  })
    .index("by_document_key", ["documentKey"])
    .index("by_product", ["productId"])
    .index("by_product_primary", ["productId", "isPrimary"])
    .index("by_origin", ["origin"])
    .index("by_status", ["status"]),

  productUnitAvailability: defineTable({
    productId: v.id("products"),
    unit: v.string(),
    available: v.boolean(),
    temporarilyUnavailable: v.boolean(),
    unavailableReason: v.optional(v.string()),
    active: v.boolean(),
    createdAt: v.string(),
    updatedAt: v.string(),
    createdBy: v.optional(v.string()),
    updatedBy: v.optional(v.string()),
    version: v.string(),
  })
    .index("by_unit_available", ["unit", "available"])
    .index("by_product_unit", ["productId", "unit"])
    .index("by_product_active", ["productId", "active"]),

  pizzaConfigurations: defineTable({
    productId: v.id("products"),
    pizzaKind: pizzaKindValidator,
    allowedSizes: v.array(v.union(v.literal("P"), v.literal("M"), v.literal("G"))),
    maxFlavorsBySize: v.object({
      P: v.number(),
      M: v.number(),
      G: v.number(),
    }),
    secondFlavorAllowed: v.boolean(),
    pricingPolicy: pizzaPricingPolicyValidator,
    active: v.boolean(),
    createdAt: v.string(),
    updatedAt: v.string(),
    createdBy: v.optional(v.string()),
    updatedBy: v.optional(v.string()),
    version: v.string(),
  })
    .index("by_product", ["productId"])
    .index("by_kind_active", ["pizzaKind", "active"]),

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
    conversaWhatsAppId: v.optional(v.id("conversasWhatsApp")),
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
    .index("by_conversa_whatsapp", ["conversaWhatsAppId"])
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
    telefoneNormalizado: v.optional(v.string()),
    cpf: v.optional(v.string()),
    enderecos: v.optional(v.array(enderecoEntrega)),
    observacoes: v.optional(v.string()),
    statusEntidade: v.string(),
  })
    .index("by_unit_telefone", ["unit", "telefone"])
    .index("by_unit_telefone_normalizado", ["unit", "telefoneNormalizado"])
    .index("by_unit_status", ["unit", "statusEntidade"]),

  conversasWhatsApp: defineTable({
    unit: v.string(),
    clienteId: v.optional(v.id("clientes")),
    clienteNomeSnapshot: v.optional(v.string()),
    clienteTelefoneSnapshot: v.string(),
    telefoneNormalizado: v.string(),
    whatsappChatId: v.string(),
    canalOrigem: v.literal("whatsapp"),
    status: v.union(
      v.literal("nova"),
      v.literal("em_atendimento"),
      v.literal("aguardando_cliente"),
      v.literal("convertida_pedido"),
      v.literal("encerrada"),
    ),
    prioridade: v.union(
      v.literal("info"),
      v.literal("attention"),
      v.literal("important"),
      v.literal("critical"),
    ),
    operadorResponsavelId: v.optional(v.id("operators")),
    operadorResponsavelNomeSnapshot: v.optional(v.string()),
    pedidoId: v.optional(v.id("pedidos")),
    ultimoTextoSnapshot: v.optional(v.string()),
    ultimaMensagemEm: v.optional(v.string()),
    naoLidas: v.number(),
    dataCriacao: v.string(),
    dataAtualizacao: v.string(),
    dataEncerramento: v.optional(v.string()),
  })
    .index("by_unit_status", ["unit", "status"])
    .index("by_unit_ultima", ["unit", "ultimaMensagemEm"])
    .index("by_chat", ["whatsappChatId"])
    .index("by_cliente", ["clienteId"])
    .index("by_pedido", ["pedidoId"])
    .index("by_operador", ["operadorResponsavelId"])
    .index("by_unit_telefone", ["unit", "telefoneNormalizado"]),

  mensagensWhatsApp: defineTable({
    conversaId: v.id("conversasWhatsApp"),
    unit: v.string(),
    whatsappMessageId: v.optional(v.string()),
    direcao: v.union(v.literal("entrada"), v.literal("saida")),
    tipo: v.union(
      v.literal("texto"),
      v.literal("imagem"),
      v.literal("audio"),
      v.literal("documento"),
      v.literal("sistema"),
    ),
    texto: v.optional(v.string()),
    mediaUrl: v.optional(v.string()),
    payload: v.optional(v.string()),
    status: v.union(
      v.literal("recebida"),
      v.literal("enviada"),
      v.literal("entregue"),
      v.literal("lida"),
      v.literal("erro"),
    ),
    operadorId: v.optional(v.id("operators")),
    operadorNomeSnapshot: v.optional(v.string()),
    timestamp: v.string(),
  })
    .index("by_conversa", ["conversaId", "timestamp"])
    .index("by_unit_timestamp", ["unit", "timestamp"])
    .index("by_whatsapp_message", ["whatsappMessageId"]),

  sessoesCatalogo: defineTable({
    unit: v.string(),
    clienteId: v.optional(v.id("clientes")),
    clienteNomeSnapshot: v.optional(v.string()),
    clienteTelefoneSnapshot: v.optional(v.string()),
    telefoneNormalizado: v.optional(v.string()),
    canalOrigem: v.string(),
    origemDetalhe: v.optional(v.string()),
    conversaWhatsAppId: v.optional(v.id("conversasWhatsApp")),
    pedidoId: v.optional(v.id("pedidos")),
    status: v.union(
      v.literal("navegando"),
      v.literal("carrinho"),
      v.literal("aguardando"),
      v.literal("abandonada"),
      v.literal("assumida"),
      v.literal("convertida"),
      v.literal("encerrada"),
    ),
    prioridade: v.union(
      v.literal("info"),
      v.literal("attention"),
      v.literal("important"),
      v.literal("critical"),
    ),
    itensSnapshot: v.optional(v.string()),
    cartContractVersion: v.optional(cartContractVersionValidator),
    cartSnapshot: v.optional(catalogCartContractValidator),
    quantidadeItens: v.optional(v.number()),
    valorEstimado: v.optional(v.number()),
    conversionSnapshotVersion: v.optional(conversionSnapshotVersionValidator),
    conversionSnapshot: v.optional(conversionSnapshotValidator),
    enderecoEntregaSnapshot: v.optional(v.string()),
    observacoes: v.optional(v.string()),
    responsavelAtualId: v.optional(v.id("operators")),
    responsavelAtualNomeSnapshot: v.optional(v.string()),
    ajudaSolicitada: v.boolean(),
    ajudaSolicitadaEm: v.optional(v.string()),
    criadaEm: v.string(),
    atualizadaEm: v.string(),
    ultimaInteracaoEm: v.optional(v.string()),
    abandonadaEm: v.optional(v.string()),
    assumidaEm: v.optional(v.string()),
    convertidaEm: v.optional(v.string()),
    encerradaEm: v.optional(v.string()),
  })
    .index("by_unit_status", ["unit", "status"])
    .index("by_unit_atualizada", ["unit", "atualizadaEm"])
    .index("by_cliente", ["clienteId"])
    .index("by_telefone", ["unit", "telefoneNormalizado"])
    .index("by_conversa_whatsapp", ["conversaWhatsAppId"])
    .index("by_pedido", ["pedidoId"])
    .index("by_responsavel", ["responsavelAtualId"])
    .index("by_ajuda", ["unit", "ajudaSolicitada"]),

  catalogConversionSnapshots: defineTable({
    sessaoCatalogoId: v.id("sessoesCatalogo"),
    unit: v.string(),
    snapshotVersion: conversionSnapshotVersionValidator,
    cartContractVersion: cartContractVersionValidator,
    conversionSnapshot: conversionSnapshotValidator,
    status: v.union(
      v.literal("preparado"),
      v.literal("vinculado_pedido"),
      v.literal("cancelado"),
    ),
    pedidoId: v.optional(v.id("pedidos")),
    createdAt: v.string(),
    createdBy: v.optional(v.string()),
  })
    .index("by_sessao", ["sessaoCatalogoId"])
    .index("by_unit_status", ["unit", "status"])
    .index("by_pedido", ["pedidoId"]),

  transferenciasTrabalho: defineTable({
    unit: v.string(),
    origemTipo: v.string(),
    origemId: v.string(),
    dePerfil: v.string(),
    deOperadorId: v.id("operators"),
    paraPerfil: v.string(),
    paraOperadorId: v.optional(v.id("operators")),
    motivo: v.string(),
    acaoEsperada: v.string(),
    contexto: v.string(),
    prioridade: v.union(
      v.literal("info"),
      v.literal("attention"),
      v.literal("important"),
      v.literal("critical"),
    ),
    status: v.union(
      v.literal("pendente"),
      v.literal("aceita"),
      v.literal("concluida"),
      v.literal("cancelada"),
    ),
    criadaEm: v.string(),
    aceitaEm: v.optional(v.string()),
    concluidaEm: v.optional(v.string()),
  })
    .index("by_unit_status", ["unit", "status"])
    .index("by_destino_perfil_status", ["unit", "paraPerfil", "status"])
    .index("by_destino_operador_status", ["paraOperadorId", "status"])
    .index("by_de_operador", ["deOperadorId"])
    .index("by_origem", ["origemTipo", "origemId"])
    .index("by_unit_criada", ["unit", "criadaEm"]),

  tarefasAgenda: defineTable({
    unit: v.string(),
    titulo: v.string(),
    descricao: v.optional(v.string()),
    dataReferencia: v.string(),
    horario: v.optional(v.string()),
    dataHoraInicio: v.optional(v.string()),
    modoOperacional: v.string(),
    operadorResponsavelId: v.id("operators"),
    operadorResponsavelCodigo: v.string(),
    operadorResponsavelNomeSnapshot: v.string(),
    criadoPorOperadorId: v.id("operators"),
    criadoPorOperadorCodigo: v.string(),
    criadoPorOperadorNomeSnapshot: v.string(),
    origemTipo: v.string(),
    origemId: v.optional(v.string()),
    prioridade: v.union(
      v.literal("info"),
      v.literal("attention"),
      v.literal("important"),
      v.literal("critical"),
    ),
    status: v.union(
      v.literal("pendente"),
      v.literal("em_andamento"),
      v.literal("concluida"),
      v.literal("cancelada"),
      v.literal("atrasada"),
    ),
    alertaAtivo: v.boolean(),
    alertaQuando: v.optional(v.string()),
    despertadorAtivo: v.boolean(),
    criadaEm: v.string(),
    atualizadaEm: v.string(),
    concluidaEm: v.optional(v.string()),
    canceladaEm: v.optional(v.string()),
  })
    .index("by_unit_data", ["unit", "dataReferencia"])
    .index("by_responsavel_data", ["operadorResponsavelId", "dataReferencia"])
    .index("by_unit_status_data", ["unit", "status", "dataReferencia"])
    .index("by_criado_por", ["criadoPorOperadorId"]),
});
