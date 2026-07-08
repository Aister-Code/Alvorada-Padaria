import { X } from "lucide-react";

type Props = {
  open: boolean;
  role: string;
  onClose: () => void;
};

export default function DashboardHelpPanel({ open, role, onClose }: Props) {
  if (!open) return null;

  const canContactManager = role !== "gerente" && role !== "superadmin";

  return (
    <div className="fixed inset-0 z-50 bg-black/25">
      <aside className="ml-auto flex h-full w-full max-w-sm flex-col bg-[#f4f2ea] px-5 py-5 text-[#5d5822] dark:bg-[#f8c6aa] dark:text-[#5d5822]">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-medium leading-tight">Ajuda</h2>
            <p className="text-xs font-light text-[#5d5822]/68">
              Centro de apoio operacional
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full p-2 text-[#5d5822]/62 transition-colors hover:text-[#5d5822] focus:outline-none"
            aria-label="Fechar ajuda"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          <HelpItem title="Manual rápido da tela" description="Resumo operacional do Centro de Operações." />
          <HelpItem title="Atalhos" description="Lista futura de ações rápidas por perfil." />
          <HelpItem title="Perguntas frequentes" description="Dúvidas recorrentes da operação." />
          {canContactManager && (
            <HelpItem title="Contatar gerente" description="Canal futuro para solicitar apoio interno." />
          )}
          <HelpItem title="Suporte RondonIA Apps" description="Estrutura futura de suporte assistido." />
        </div>
      </aside>
    </div>
  );
}

function HelpItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl bg-[#e8e6dc]/70 px-4 py-3 dark:bg-[#f4f2ea]/64">
      <p className="text-sm font-medium leading-tight">{title}</p>
      <p className="mt-1 text-xs font-light leading-relaxed text-[#5d5822]/70">
        {description}
      </p>
    </div>
  );
}
