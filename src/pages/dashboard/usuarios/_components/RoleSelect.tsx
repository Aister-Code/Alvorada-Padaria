import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";

export const ROLE_OPTIONS = [
  { value: "gerente",    label: "Gerente" },
  { value: "caixa",      label: "Caixa" },
  { value: "atendente",  label: "Atendente" },
  { value: "producao",   label: "Produção" },
  { value: "estoque",    label: "Estoque" },
  { value: "financeiro", label: "Financeiro" },
] as const;

export function roleLabel(role: string): string {
  return ROLE_OPTIONS.find((r) => r.value === role)?.label ?? role;
}

type Props = {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
};

export default function RoleSelect({ value, onChange, disabled }: Props) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-full h-11 rounded-xl bg-secondary border-border">
        <SelectValue placeholder="Selecione o perfil" />
      </SelectTrigger>
      <SelectContent>
        {ROLE_OPTIONS.map((r) => (
          <SelectItem key={r.value} value={r.value}>
            {r.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
