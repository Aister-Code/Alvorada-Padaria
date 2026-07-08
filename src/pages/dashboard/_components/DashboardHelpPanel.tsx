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
      <aside className="ml-auto flex h-svh w-full max-w-sm flex-col bg-[#5d5822] px-5 py-5 text-[#fff4e8] dark:bg-[#f8c6aa] dark:text-[#5d5822]">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold leading-tight">Ajuda</h2>
            <p className="text-xs font-medium text-[#d8c8bb] dark:text-[#6f6932]">
              Apoio operacional
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full p-2 text-[#fff4e8] transition-colors hover:text-white focus:outline-none dark:text-[#5d5822] dark:hover:text-[#3f3b12]"
            aria-label="Fechar ajuda"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          <HelpItem title="Manual rápido" description="Resumo do Centro de Operações." />
          <HelpItem title="Atalhos" description="Ações rápidas por perfil." />
          <HelpItem title="Perguntas frequentes" description="Dúvidas comuns da operação." />
          {canContactManager && (
            <HelpItem title="Contatar gerente" description="Solicitar apoio interno." />
          )}
          <HelpItem title="Suporte RondonIA Apps" description="Suporte assistido futuro." />
        </div>
      </aside>
    </div>
  );
}

function HelpItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-[#fff4e8]/18 bg-[#fff4e8]/8 px-4 py-3 dark:border-[#5d5822]/14 dark:bg-[#5d5822]/7">
      <p className="text-sm font-semibold leading-tight text-[#fff4e8] dark:text-[#5d5822]">{title}</p>
      <p className="mt-1 text-xs font-medium leading-relaxed text-[#d8c8bb] dark:text-[#6f6932]">
        {description}
      </p>
    </div>
  );
}
