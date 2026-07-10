
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
    quantidadeItens: v.optional(v.number()),
    valorEstimado: v.optional(v.number()),
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
