import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { CheckCircle2, XCircle, KeyRound } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty.tsx";
import { toast } from "sonner";
import { useState } from "react";
import type { Id } from "@/convex/_generated/dataModel.js";
import { cn } from "@/lib/utils.ts";

type PendingReset = {
  _id: Id<"pinResets">;
  operatorId: string;
  operatorName: string;
};

export default function PinResetsTab() {
  const resets = useQuery(api.auth.pinReset.listPending, {}) as PendingReset[] | undefined;
  const approve = useMutation(api.auth.pinReset.approveReset);
  const reject = useMutation(api.auth.pinReset.rejectReset);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handle = async (id: Id<"pinResets">, name: string, action: "approve" | "reject") => {
    setLoadingId(id);
    try {
      if (action === "approve") {
        await approve({ resetId: id });
        toast.success(`PIN de ${name} aprovado.`);
      } else {
        await reject({ resetId: id });
        toast.info(`Solicitação de ${name} recusada.`);
      }
    } catch {
      toast.error("Erro ao processar.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold">Redefinições de PIN Pendentes</h2>

      {resets === undefined ? (
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        </div>
      ) : resets.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><KeyRound /></EmptyMedia>
            <EmptyTitle>Nenhuma pendência</EmptyTitle>
            <EmptyDescription>Todas as solicitações foram processadas.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-2">
          {resets.map((r) => (
            <div key={r._id} className="flex items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-500/15 shrink-0">
                  <KeyRound className="w-4 h-4 text-amber-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{r.operatorName}</p>
                  <p className="text-xs text-muted-foreground">Usuário {r.operatorId} · aguardando aprovação</p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  disabled={loadingId === r._id}
                  onClick={() => handle(r._id, r.operatorName, "reject")}
                  className="cursor-pointer p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-40"
                  title="Recusar"
                >
                  <XCircle className="w-4 h-4" />
                </button>
                <button
                  disabled={loadingId === r._id}
                  onClick={() => handle(r._id, r.operatorName, "approve")}
                  className="cursor-pointer p-2 rounded-lg text-muted-foreground hover:text-emerald-600 hover:bg-emerald-600/10 transition-colors disabled:opacity-40"
                  title="Aprovar"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
