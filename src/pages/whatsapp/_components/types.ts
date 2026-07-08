import type { Id } from "@/convex/_generated/dataModel.d.ts";

export type ConversationStatus =
  | "nova"
  | "em_atendimento"
  | "aguardando_cliente"
  | "convertida_pedido"
  | "encerrada";

export type ConversationPriority = "info" | "attention" | "important" | "critical";

export type WhatsAppConversation = {
  _id: Id<"conversasWhatsApp">;
  unit: string;
  clienteId?: Id<"clientes">;
  clienteNomeSnapshot?: string;
  clienteTelefoneSnapshot: string;
  telefoneNormalizado: string;
  status: ConversationStatus;
  prioridade: ConversationPriority;
  operadorResponsavelId?: Id<"operators">;
  operadorResponsavelNomeSnapshot?: string;
  pedidoId?: Id<"pedidos">;
  ultimoTextoSnapshot?: string;
  ultimaMensagemEm?: string;
  naoLidas: number;
  dataCriacao: string;
  dataAtualizacao: string;
};

export type WhatsAppMessage = {
  _id: Id<"mensagensWhatsApp">;
  conversaId: Id<"conversasWhatsApp">;
  direcao: "entrada" | "saida";
  tipo: "texto" | "imagem" | "audio" | "documento" | "sistema";
  texto?: string;
  status: "recebida" | "enviada" | "entregue" | "lida" | "erro";
  operadorNomeSnapshot?: string;
  timestamp: string;
};
