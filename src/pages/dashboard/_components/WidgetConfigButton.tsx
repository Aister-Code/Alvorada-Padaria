import { MoreVertical } from "lucide-react";

type Props = {
  label: string;
  onClick: () => void;
};

export default function WidgetConfigButton({ label, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer rounded-full p-1.5 text-current/58 transition-colors hover:text-current focus:outline-none"
      aria-label={label}
    >
      <MoreVertical className="h-4 w-4" />
    </button>
  );
}
