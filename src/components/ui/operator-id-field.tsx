import type { RefObject } from "react";

type OperatorLookup = {
  name: string;
} | null | undefined;

type OperatorIdFieldProps = {
  value: string;
  operator: OperatorLookup;
  finalized: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  borderClass?: string;
  onValueChange: (value: string) => void;
  onFinalizedChange: (value: boolean) => void;
  onNext: () => void;
  onClear?: () => void;
};

export default function OperatorIdField({
  value,
  operator,
  finalized,
  inputRef,
  borderClass = "border-border",
  onValueChange,
  onFinalizedChange,
  onNext,
  onClear,
}: OperatorIdFieldProps) {
  const operatorName = finalized && value.length === 3 && operator ? operator.name : "";

  const finalize = () => {
    if (value.length === 3) {
      onFinalizedChange(true);
      return true;
    }
    onFinalizedChange(false);
    return false;
  };

  return (
    <div
      className={`flex h-11 w-full cursor-text items-center rounded-xl border ${borderClass} bg-secondary px-3 focus-within:ring-2 focus-within:ring-ring transition-all`}
      onPointerDown={(e) => {
        if (e.target !== inputRef.current) e.preventDefault();
        onFinalizedChange(false);
        requestAnimationFrame(() => inputRef.current?.focus());
      }}
    >
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        maxLength={3}
        placeholder="001"
        value={value}
        autoComplete="off"
        onFocus={() => onFinalizedChange(false)}
        onBlur={() => {
          finalize();
        }}
        onChange={(e) => {
          const nextValue = e.target.value.replace(/\D/g, "");
          onValueChange(nextValue);
          onFinalizedChange(nextValue.length === 3);
          onClear?.();
          if (nextValue.length === 3) {
            setTimeout(onNext, 50);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && value.length > 0) {
            e.preventDefault();
            if (finalize()) onNext();
          }
        }}
        className={
          operatorName
            ? "h-full w-14 bg-transparent text-left text-xl font-serif tracking-[0.18em] text-foreground placeholder:text-muted-foreground/30 focus:outline-none"
            : "h-full w-full bg-transparent text-center text-xl font-serif tracking-[0.18em] indent-[0.18em] text-foreground placeholder:text-muted-foreground/30 placeholder:tracking-normal placeholder:indent-0 focus:outline-none"
        }
      />
      {operatorName && (
        <>
          <span className="mx-2 h-5 w-px bg-border" />
          <span className="min-w-0 flex-1 truncate text-left text-sm text-foreground">
            {operatorName}
          </span>
        </>
      )}
    </div>
  );
}
