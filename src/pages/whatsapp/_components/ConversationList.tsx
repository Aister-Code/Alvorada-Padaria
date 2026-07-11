import { MessageCircle, PackageCheck } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import type { Id } from "@/convex/_generated/dataModel.d.ts";
import type { WhatsAppConversation } from "./types.ts";

type Props = {
  conversations: WhatsAppConversation[] | undefined;
  selectedId: Id<"conversasWhatsApp"> | null;
  onSelect: (conversation: WhatsAppConversation) => void;
};

const priorityClasses = {
  info: "bg-emerald-500",
  attention: "bg-amber-400",
  important: "bg-[#f04a2a]",
  critical: "bg-red-700",
};

function formatTime(value?: string) {
  if (!value) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function customerLabel(conversation: WhatsAppConversation) {
  return conversation.clienteNomeSnapshot?.trim() || conversation.clienteTelefoneSnapshot;
}

export default function ConversationList({ conversations, selectedId, onSelect }: Props) {
  if (conversations === undefined) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-20 animate-pulse rounded-2xl bg-white dark:bg-[#151513]" />
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex h-full min-h-60 flex-col items-center justify-center rounded-2xl bg-white px-6 text-center text-[#685c20] dark:bg-[#151513] dark:text-[#f3c4a2]">
        <MessageCircle className="mb-3 h-8 w-8 stroke-[1.6] opacity-60" />
        <p className="text-sm font-medium">Nenhuma conversa aberta</p>
        <p className="mt-1 max-w-xs text-xs text-current/62">
          Novas mensagens do WhatsApp aparecerão aqui quando chegarem.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => {
        const selected = selectedId === conversation._id;
        return (
          <button
            key={conversation._id}
            type="button"
            onClick={() => onSelect(conversation)}
            className={cn(
              "w-full cursor-pointer rounded-2xl px-3 py-3 text-left transition-colors",
              selected
                ? "bg-[#685c20] text-[#fff4e8] dark:bg-[#f3c4a2] dark:text-[#685c20]"
                : "bg-white text-[#685c20] hover:bg-white/78 dark:bg-[#151513] dark:text-[#f3c4a2] dark:hover:bg-[#756c2c]/82",
            )}
          >
            <div className="flex items-start gap-2.5">
              <span
                className={cn(
                  "mt-1 h-2.5 w-2.5 shrink-0 rounded-full",
                  priorityClasses[conversation.prioridade],
                )}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold leading-tight">
                      {customerLabel(conversation)}
                    </p>
                    <p className="mt-0.5 truncate text-[10.5px] text-current/62">
                      {conversation.clienteId ? "Cliente conhecido" : "Cliente novo"} · {conversation.clienteTelefoneSnapshot}
                    </p>
                  </div>
                  <span className="shrink-0 text-[10px] tabular-nums text-current/58">
                    {formatTime(conversation.ultimaMensagemEm ?? conversation.dataAtualizacao)}
                  </span>
                </div>

                <p className="mt-2 line-clamp-1 text-xs text-current/76">
                  {conversation.ultimoTextoSnapshot ?? "Mensagem sem texto"}
                </p>

                <div className="mt-2 flex items-center gap-1.5">
                  {conversation.naoLidas > 0 && (
                    <span className="rounded-full bg-[#f04a2a] px-1.5 py-0.5 text-[9px] font-semibold text-white">
                      {conversation.naoLidas}
                    </span>
                  )}
                  {conversation.pedidoId && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-current/10 px-1.5 py-0.5 text-[9px] font-semibold">
                      <PackageCheck className="h-2.5 w-2.5" />
                      Pedido
                    </span>
                  )}
                  {conversation.operadorResponsavelNomeSnapshot && (
                    <span className="truncate text-[9px] text-current/58">
                      {conversation.operadorResponsavelNomeSnapshot}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
