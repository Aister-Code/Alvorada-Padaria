import { ArrowLeft, MessageCircle, PackagePlus, Send, UserCheck } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils.ts";
import type { WhatsAppConversation, WhatsAppMessage } from "./types.ts";
import getNextAction from "./NextActionPanel.tsx";

type Props = {
  conversation: WhatsAppConversation | null;
  messages: WhatsAppMessage[] | undefined;
  sending: boolean;
  onBack?: () => void;
  onAssume: () => void;
  onMarkRead: () => void;
  onSend: (text: string) => void;
  onStartOrder: () => void;
  timeline: React.ReactNode;
};

const statusLabels = {
  nova: "Nova",
  em_atendimento: "Em atendimento",
  aguardando_cliente: "Aguardando cliente",
  convertida_pedido: "Pedido iniciado",
  encerrada: "Encerrada",
};

export default function ConversationDetail({
  conversation,
  messages,
  sending,
  onBack,
  onAssume,
  onMarkRead,
  onSend,
  onStartOrder,
  timeline,
}: Props) {
  const [text, setText] = useState("");

  if (!conversation) {
    return (
      <section className="flex h-full min-h-0 flex-col items-center justify-center rounded-2xl bg-[#f8dcc8] px-6 text-center text-[#685c20] dark:bg-[#756c2c] dark:text-[#f3c4a2]">
        <MessageCircle className="mb-3 h-9 w-9 stroke-[1.6] opacity-60" />
        <p className="text-sm font-medium">Selecione uma conversa</p>
        <p className="mt-1 max-w-xs text-xs text-current/62">
          A recepção mostra quem chamou, o contexto e o próximo passo do atendimento.
        </p>
      </section>
    );
  }

  const nextAction = getNextAction({ conversation });
  const NextIcon = nextAction.icon;

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  };

  return (
    <section className="flex h-full min-h-0 flex-col rounded-2xl bg-[#f8dcc8] text-[#685c20] dark:bg-[#756c2c] dark:text-[#f3c4a2]">
      <header className="flex shrink-0 items-center gap-3 px-3 py-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="cursor-pointer rounded-full p-2 text-current/70 hover:text-current"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold leading-tight">
            {conversation.clienteNomeSnapshot || conversation.clienteTelefoneSnapshot}
          </p>
          <p className="truncate text-[11px] text-current/62">
            {conversation.clienteId ? "Cliente conhecido" : "Cliente novo"} · {conversation.clienteTelefoneSnapshot}
          </p>
        </div>
        <span className="rounded-full bg-current/10 px-2 py-1 text-[10px] font-semibold">
          {statusLabels[conversation.status]}
        </span>
      </header>

      <div className="mx-3 mb-2 rounded-2xl bg-[#685c20]/7 px-3 py-2 dark:bg-[#f3c4a2]/7">
        <div className="flex items-start gap-2">
          <NextIcon className="mt-0.5 h-4 w-4 shrink-0 stroke-[1.8]" />
          <div className="min-w-0">
            <p className="text-xs font-semibold">{nextAction.title}</p>
            <p className="mt-0.5 text-[11px] leading-snug text-current/62">{nextAction.description}</p>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2">
        {timeline}
        {messages?.length === 0 && null}
      </div>

      <div className="shrink-0 space-y-2 px-3 pb-3">
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={onAssume}
            className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#685c20]/8 px-2 py-2 text-[11px] font-semibold hover:bg-[#685c20]/12 dark:bg-[#f3c4a2]/8 dark:hover:bg-[#f3c4a2]/12"
          >
            <UserCheck className="h-3.5 w-3.5" />
            Assumir
          </button>
          <button
            type="button"
            onClick={onMarkRead}
            className="cursor-pointer rounded-xl bg-[#685c20]/8 px-2 py-2 text-[11px] font-semibold hover:bg-[#685c20]/12 dark:bg-[#f3c4a2]/8 dark:hover:bg-[#f3c4a2]/12"
          >
            Lida
          </button>
          <button
            type="button"
            onClick={onStartOrder}
            className={cn(
              "flex cursor-pointer items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-[11px] font-semibold",
              conversation.pedidoId
                ? "bg-current/8 text-current/48"
                : "bg-[#f04a2a] text-white hover:bg-[#df3e21]",
            )}
            disabled={Boolean(conversation.pedidoId)}
          >
            <PackagePlus className="h-3.5 w-3.5" />
            Pedido
          </button>
        </div>

        <div className="flex items-center gap-2 rounded-2xl bg-[#685c20]/8 px-2 py-2 dark:bg-[#f3c4a2]/8">
          <input
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleSubmit();
            }}
            placeholder="Responder mensagem..."
            className="min-w-0 flex-1 bg-transparent px-1 text-sm text-current placeholder:text-current/42 focus:outline-none"
            disabled={sending}
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={sending || !text.trim()}
            className="cursor-pointer rounded-full bg-[#685c20] p-2 text-[#fff4e8] disabled:cursor-default disabled:opacity-45 dark:bg-[#f3c4a2] dark:text-[#685c20]"
            aria-label="Enviar resposta simulada"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
