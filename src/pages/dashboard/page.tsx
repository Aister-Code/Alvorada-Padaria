import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { motion } from "motion/react";
import {
  ShoppingBag, Bike, CheckCircle2, AlertCircle, Truck,
} from "lucide-react";
import DashboardHeader from "./_components/DashboardHeader.tsx";
import SummaryCard from "./_components/SummaryCard.tsx";
import ModuleCard from "./_components/ModuleCard.tsx";
import NotificationsPanel from "./_components/NotificationsPanel.tsx";
import { getModulesForRole } from "./_lib/modules.ts";
import { cn } from "@/lib/utils.ts";

type OperatorSession = {
  operatorId: string;
  name: string;
  role: string;
  units?: string[];
};

type Props = {
  operator: OperatorSession;
  onLogout: () => void;
  onNavigate: (page: "dashboard" | "usuarios" | "venda" | "acompanhamento" | "caixa" | "delivery") => void;
};

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function todayLabel(): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "short",
  }).format(new Date());
}

export default function DashboardPage({ operator, onLogout, onNavigate }: Props) {
  const [showNotifications, setShowNotifications] = useState(false);

  const pendingResets = useQuery(api.auth.pinReset.listPending, {});
  const pendingCount = pendingResets?.length ?? 0;

  const unit = operator.units?.[0] ?? "alvorada-01";
  const resumo = useQuery(api.venda.delivery.resumoDashboard, { unit });

  const modules = getModulesForRole(operator.role);

  const isTablet = window.innerWidth >= 768;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardHeader
        operatorName={operator.name}
        role={operator.role}
        unit={unit}
        pendingCount={pendingCount}
        onNotificationsClick={() => setShowNotifications(true)}
        onLogout={onLogout}
      />

      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 space-y-8">

          {/* Saudação */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" as const }}
          >
            <p className="text-2xl font-serif font-semibold text-foreground">
              {greeting()}, {operator.name.split(" ")[0]}.
            </p>
            <p className="text-sm text-muted-foreground capitalize mt-0.5">{todayLabel()}</p>
          </motion.div>

          {/* Resumo do dia — apenas gerente */}
          {operator.role === "gerente" && (
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05, ease: "easeOut" as const }}
            >
              <h2 className="text-[11px] font-medium text-muted-foreground tracking-widest uppercase mb-3">
                Resumo do dia
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <SummaryCard
                  label="Em andamento"
                  value={resumo === undefined ? "—" : String(resumo.emAndamento)}
                  sub="pedidos ativos agora"
                  icon={ShoppingBag}
                  color="bg-orange-500"
                />
                <SummaryCard
                  label="Entregues hoje"
                  value={resumo === undefined ? "—" : String(resumo.entreguesHoje)}
                  sub="concluídos hoje"
                  icon={CheckCircle2}
                  color="bg-emerald-700"
                />
                {/* Delivery em rota */}
                <SummaryCard
                  label="Em rota"
                  value={resumo === undefined ? "—" : String(resumo.saiuParaEntrega)}
                  sub="motoboys em campo"
                  icon={Truck}
                  color="bg-sky-600"
                />
                {/* Prontos aguardando motoboy */}
                {(resumo?.prontoDelivery ?? 0) > 0 && (
                  <SummaryCard
                    label="Aguard. motoboy"
                    value={String(resumo!.prontoDelivery)}
                    sub="delivery pronto p/ sair"
                    icon={Bike}
                    color="bg-amber-500"
                    alert
                  />
                )}
                {pendingCount > 0 && (
                  <SummaryCard
                    label="Pendências"
                    value={String(pendingCount)}
                    sub={pendingCount === 1 ? "aprovação necessária" : "aprovações necessárias"}
                    icon={AlertCircle}
                    color="bg-destructive"
                    alert
                  />
                )}
              </div>
            </motion.section>
          )}

          {/* Módulos */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" as const }}
          >
            <h2 className="text-[11px] font-medium text-muted-foreground tracking-widest uppercase mb-3">
              Módulos
            </h2>
            {modules.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <AlertCircle className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">Nenhum módulo disponível</p>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
                  Seu perfil ainda não possui módulos liberados. Fale com o gerente da unidade.
                </p>
              </div>
            ) : (
              <div
                className={cn(
                  "grid gap-3",
                  "grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5"
                )}
              >
                {modules.map((mod, i) => (
                  <motion.div
                    key={mod.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: 0.1 + i * 0.03, ease: "easeOut" as const }}
                  >
                    <ModuleCard
                      module={mod}
                      large={isTablet}
                      onNavigate={
                        mod.id === "usuarios"
                          ? () => onNavigate("usuarios")
                          : mod.id === "pdv"
                          ? () => onNavigate("venda")
                          : mod.id === "acompanhamento"
                          ? () => onNavigate("acompanhamento")
                          : mod.id === "caixa"
                          ? () => onNavigate("caixa")
                          : mod.id === "delivery"
                          ? () => onNavigate("delivery")
                          : undefined
                      }
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.section>

        </div>
      </main>

      {/* Painel de notificações */}
      <NotificationsPanel
        open={showNotifications}
        onClose={() => setShowNotifications(false)}
        pendingResets={pendingResets ?? []}
      />
    </div>
  );
}
