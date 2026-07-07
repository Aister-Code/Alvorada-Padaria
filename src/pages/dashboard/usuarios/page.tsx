import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import OperatorList from "./_components/OperatorList.tsx";

type OperatorSession = {
  operatorId: string;
  name: string;
  role: string;
  units?: string[];
};

type Props = {
  operator: OperatorSession;
  onBack: () => void;
};

export default function UsuariosPage({ operator, onBack }: Props) {
  const unit = operator.units?.[0] ?? "matriz";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-4 md:px-6 py-4 flex items-center gap-3">
        <button
          onClick={onBack}
          className="cursor-pointer p-2 -ml-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base font-semibold text-foreground leading-tight">
            Usuários e Permissões
          </h1>
          <p className="text-[11px] text-muted-foreground capitalize">{unit}</p>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="flex-1 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" as const }}
          className="max-w-2xl mx-auto px-4 md:px-6 py-6"
        >
          <OperatorList
            sessionOperatorId={operator.operatorId}
            unit={unit}
          />
        </motion.div>
      </main>
    </div>
  );
}
