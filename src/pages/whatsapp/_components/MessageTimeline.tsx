import { cn } from "@/lib/utils.ts";
import type { WhatsAppMessage } from "./types.ts";

type Props = {
  messages: WhatsAppMessage[] | undefined;
};

function formatTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function MessageTimeline({ messages }: Props) {
  if (messages === undefined) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-14 animate-pulse rounded-2xl bg-current/8" />
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-center text-xs text-current/58">
        Nenhuma mensagem registrada.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {messages.map((message) => {
        const outgoing = message.direcao === "saida";
        return (
          <div key={message._id} className={cn("flex", outgoing ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[82%] rounded-2xl px-3 py-2",
                outgoing
                  ? "bg-[#685c20] text-[#fff4e8] dark:bg-[#f3c4a2] dark:text-[#685c20]"
                  : "bg-[#685c20]/8 text-[#685c20] dark:bg-[#f3c4a2]/8 dark:text-[#f3c4a2]",
              )}
            >
              <p className="whitespace-pre-wrap text-sm leading-snug">
                {message.texto || `[${message.tipo}]`}
              </p>
              <p className="mt-1 text-right text-[9px] text-current/58">
                {message.operadorNomeSnapshot ? `${message.operadorNomeSnapshot} · ` : ""}
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
