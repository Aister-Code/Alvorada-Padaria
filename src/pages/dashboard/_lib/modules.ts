import {
  ShoppingCart,
  UtensilsCrossed,
  Bike,
  Store,
  BookOpen,
  Package,
  BarChart2,
  Settings,
  Users,
  ClipboardList,
  Banknote,
  type LucideIcon,
} from "lucide-react";

export type ModuleId =
  | "pdv"
  | "acompanhamento"
  | "caixa"
  | "mesas"
  | "delivery"
  | "conveniencia"
  | "cardapio"
  | "estoque"
  | "financeiro"
  | "gestao"
  | "usuarios";

export type Module = {
  id: ModuleId;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;         // bg color class
  roles: string[];       // which roles can see this module
};

export const MODULES: Module[] = [
  {
    id: "pdv",
    label: "PDV",
    description: "Ponto de venda",
    icon: ShoppingCart,
    color: "bg-orange-500",
    roles: ["gerente", "caixa", "atendente"],
  },
  {
    id: "acompanhamento",
    label: "Pedidos",
    description: "Painel de pedidos",
    icon: ClipboardList,
    color: "bg-violet-600",
    roles: ["gerente", "caixa", "atendente"],
  },
  {
    id: "caixa",
    label: "Caixa",
    description: "Pagamentos e vendas",
    icon: Banknote,
    color: "bg-emerald-600",
    roles: ["gerente", "caixa"],
  },
  {
    id: "mesas",
    label: "Mesas",
    description: "Salão e comandas",
    icon: UtensilsCrossed,
    color: "bg-amber-600",
    roles: ["gerente", "atendente"],
  },
  {
    id: "delivery",
    label: "Delivery",
    description: "Pedidos para entrega",
    icon: Bike,
    color: "bg-sky-600",
    roles: ["gerente", "caixa"],
  },
  {
    id: "conveniencia",
    label: "Conveniência",
    description: "Loja de conveniência",
    icon: Store,
    color: "bg-teal-600",
    roles: ["gerente", "caixa"],
  },
  {
    id: "cardapio",
    label: "Cardápio",
    description: "Produtos e preços",
    icon: BookOpen,
    color: "bg-violet-600",
    roles: ["gerente", "atendente"],
  },
  {
    id: "estoque",
    label: "Estoque",
    description: "Insumos e inventário",
    icon: Package,
    color: "bg-lime-700",
    roles: ["gerente"],
  },
  {
    id: "financeiro",
    label: "Financeiro",
    description: "Caixa e relatórios",
    icon: BarChart2,
    color: "bg-emerald-700",
    roles: ["gerente"],
  },
  {
    id: "gestao",
    label: "Gestão",
    description: "Relatórios e métricas",
    icon: Settings,
    color: "bg-slate-600",
    roles: ["gerente"],
  },
  {
    id: "usuarios",
    label: "Usuários",
    description: "M-002.1 · Operadores e acessos",
    icon: Users,
    color: "bg-indigo-600",
    roles: ["gerente"],
  },
];

// Perfis operacionais válidos da unidade
export const OPERATIONAL_ROLES = ["gerente", "caixa", "atendente", "producao", "estoque", "financeiro"] as const;

export function getModulesForRole(role: string): Module[] {
  return MODULES.filter((m) => m.roles.includes(role));
}
