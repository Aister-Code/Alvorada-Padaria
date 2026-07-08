import { CheckCircle2, MessageCircle, PackagePlus, UserCheck } from "lucide-react";
import type { WhatsAppConversation } from "./types.ts";

type Props = {
  conversation: WhatsAppConversation;
};

export default function NextActionPanel({ conversation }: Props) {
  if (conversation.pedidoId) {
    return {
      icon: CheckCircle2,
      title: "Pedido vinculado",
      description: "A conversa já virou pedido. Acompanhe o andamento no fluxo operacional.",
    };
  }

  if (!conversation.operadorResponsavelId) {
    return {
      icon: UserCheck,
      title: "Assumir atendimento",
      description: "Defina um responsável antes de responder ou iniciar pedido.",
    };
  }

  if (conversation.naoLidas > 0) {
    return {
      icon: MessageCircle,
      title: "Responder cliente",
      description: "Há mensagem nova aguardando leitura e retorno do atendente.",
    };
  }

  return {
    icon: PackagePlus,
    title: "Iniciar pedido",
    description: "Cliente identificado. O próximo passo pode ser abrir um pedido a partir da conversa.",
  };
}
