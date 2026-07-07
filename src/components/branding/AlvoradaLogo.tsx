import { cn } from "@/lib/utils.ts";
import alvoradaIcon from "@/assets/branding/alvorada-icon-v1.png";
import alvoradaLogo from "@/assets/branding/alvorada-logo-v1.png";

type Props = {
  variant?: "full" | "icon";
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZE_CLASSES: Record<NonNullable<Props["variant"]>, Record<NonNullable<Props["size"]>, string>> = {
  full: {
    sm: "w-24",
    md: "w-40",
    lg: "w-64",
  },
  icon: {
    sm: "w-8",
    md: "w-11",
    lg: "w-16",
  },
};

export default function AlvoradaLogo({
  variant = "full",
  size = "md",
  className,
}: Props) {
  return (
    <img
      src={variant === "icon" ? alvoradaIcon : alvoradaLogo}
      alt="Alvorada - Padaria | Lanchonete | Pizzaria"
      className={cn("h-auto shrink-0 object-contain", SIZE_CLASSES[variant][size], className)}
    />
  );
}
