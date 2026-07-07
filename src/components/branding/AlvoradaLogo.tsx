import { cn } from "@/lib/utils.ts";
import alvoradaIconDark from "@/assets/branding/alvorada-icon-v1-dark.png";
import alvoradaIcon from "@/assets/branding/alvorada-icon-v1.png";
import alvoradaLogoDark from "@/assets/branding/alvorada-logo-v1-dark.png";
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
  const lightSrc = variant === "icon" ? alvoradaIcon : alvoradaLogo;
  const darkSrc = variant === "icon" ? alvoradaIconDark : alvoradaLogoDark;
  const classes = cn("h-auto shrink-0 object-contain", SIZE_CLASSES[variant][size], className);

  return (
    <>
      <img
        src={lightSrc}
        alt="Alvorada - Padaria | Lanchonete | Pizzaria"
        className={cn(classes, "dark:hidden")}
      />
      <img
        src={darkSrc}
        alt="Alvorada - Padaria | Lanchonete | Pizzaria"
        className={cn(classes, "hidden dark:block")}
      />
    </>
  );
}
