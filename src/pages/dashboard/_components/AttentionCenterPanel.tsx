import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { motion, AnimatePresence } from "motion/react";
import { X, KeyRound, CheckCircle2, XCircle, TriangleAlert } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel.js";
import { toast } from "sonner";
import { useState } from "react";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty.tsx";

type PendingReset = {
  _id: Id<"pinResets">;
  operatorId: string;
  operatorName: string;
  status: "pending" | "approved" | "rejected";
};

type Props = {
  open: boolean;
  onClose: () => void;
  pendingResets: PendingReset[];
};

export default function AttentionCenterPanel({ open, onClose, pendingResets }: Props) {
  const approve = useMutation(api.auth.pinReset.approveReset);
  const reject = useMutation(api.auth.pinReset.rejectReset);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleApprove = async (id: Id<"pinResets">, name: string) => {
    setLoadingId(id);
    try {
      await approve({ resetId: id });
      toast.success(`PIN de ${name} redefinido.`);
    } catch {
      toast.error("Erro ao aprovar.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (id: Id<"pinResets">, name: string) => {
    setLoadingId(id);
    try {
      await reject({ resetId: id });
      toast.info(`Solicitação de ${name} recusada.`);
    } catch {
      toast.error("Erro ao recusar.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40"
          />

          {/* Drawer — desliza da direita */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-background border-l border-border flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <TriangleAlert className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-semibold">Centro de Atenção</h2>
                {pendingResets.length > 0 && (
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-destructive text-[10px] font-bold text-white">
                    {pendingResets.length}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="cursor-pointer p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">

              {/* Solicitações de PIN */}
              {pendingResets.length > 0 && (
                <section>
                  <p className="text-[10px] font-semibold text-foreground/76 tracking-widest uppercase mb-3">
                    Atenção · PIN
                  </p>
                  <div className="space-y-2">
                    {pendingResets.map((r) => (
                      <div
                        key={r._id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/10 shrink-0">
                            <KeyRound className="w-4 h-4 text-amber-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{r.operatorName}</p>
                            <p className="text-[11px] text-foreground/68">Usuário {r.operatorId}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            disabled={loadingId === r._id}
                            onClick={() => handleReject(r._id, r.operatorName)}
                            className="cursor-pointer p-1.5 rounded-lg text-foreground/68 hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-40"
                            aria-label="Recusar"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                          <button
                            disabled={loadingId === r._id}
                            onClick={() => handleApprove(r._id, r.operatorName)}
                            className="cursor-pointer p-1.5 rounded-lg text-foreground/68 hover:text-emerald-600 hover:bg-emerald-600/10 transition-colors disabled:opacity-40"
                            aria-label="Aprovar"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Vazio */}
              {pendingResets.length === 0 && (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon"><TriangleAlert /></EmptyMedia>
                    <EmptyTitle>Sem atenção pendente</EmptyTitle>
                    <EmptyDescription>Tudo em dia na operação.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}

            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
