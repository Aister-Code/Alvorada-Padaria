
type Props = {
  className?: string;
  variant?: "light" | "dark";
};

export default function AlvoradaLogo({ className, variant = "light" }: Props) {
  const nameColor = variant === "dark" ? "#F0C4A0" : "#4E5B1D";
  const iconColor = variant === "dark" ? "#F0C4A0" : "#E8532B";

  return (
    <svg
      viewBox="0 0 280 148"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Alvorada — Padaria | Lanchonete | Pizzaria"
    >
      <defs>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=Poppins:wght@300&display=swap');`}</style>
      </defs>

      <g transform="translate(140, 4)">
        <text
          x="0"
          y="52"
          textAnchor="middle"
          fontFamily="'Cormorant Garamond', Georgia, serif"
          fontSize="56"
          fontWeight="600"
          fill={iconColor}
        >
          A
        </text>
        <line x1="-22" y1="30" x2="22" y2="26" stroke={iconColor} strokeWidth="1.3" strokeLinecap="round"/>
        <line x1="22" y1="26" x2="26" y2="20" stroke={iconColor} strokeWidth="1.1" strokeLinecap="round"/>
        <ellipse cx="-14" cy="24" rx="4" ry="1.6" fill={iconColor} transform="rotate(-55 -14 24)"/>
        <ellipse cx="-6"  cy="22" rx="4" ry="1.6" fill={iconColor} transform="rotate(-55 -6 22)"/>
        <ellipse cx="2"   cy="20" rx="4" ry="1.6" fill={iconColor} transform="rotate(-55 2 20)"/>
        <ellipse cx="10"  cy="18" rx="4" ry="1.6" fill={iconColor} transform="rotate(-55 10 18)"/>
        <ellipse cx="-10" cy="33" rx="4" ry="1.6" fill={iconColor} transform="rotate(-55 -10 33)"/>
        <ellipse cx="-2"  cy="31" rx="4" ry="1.6" fill={iconColor} transform="rotate(-55 -2 31)"/>
        <ellipse cx="6"   cy="29" rx="4" ry="1.6" fill={iconColor} transform="rotate(-55 6 29)"/>
        <ellipse cx="14"  cy="27" rx="4" ry="1.6" fill={iconColor} transform="rotate(-55 14 27)"/>
        <path d="M-22,30 Q-28,36 -26,44" stroke={iconColor} strokeWidth="1.1" strokeLinecap="round" fill="none"/>
      </g>

      <text
        x="140"
        y="104"
        textAnchor="middle"
        fontFamily="'Cormorant Garamond', Georgia, serif"
        fontSize="44"
        fontWeight="600"
        letterSpacing="4"
        fill={nameColor}
      >
        ALVORADA
      </text>

      <text
        x="140"
        y="124"
        textAnchor="middle"
        fontFamily="'Poppins', Arial, sans-serif"
        fontSize="8.5"
        fontWeight="300"
        letterSpacing="3"
        fill={nameColor}
      >
        PADARIA | LANCHONETE | PIZZARIA
      </text>
    </svg>
  );
}
