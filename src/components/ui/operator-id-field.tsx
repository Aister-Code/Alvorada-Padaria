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
      className={`flex h-11 w-full cursor-text items-center rounded-xl border ${borderClass} bg-[#e4e2d7] px-3 shadow-[0_1px_8px_rgba(78,91,29,0.045)] transition-all focus-within:border-[#5d5822]/35 focus-within:bg-[#e8e6dc] focus-within:shadow-[0_4px_18px_rgba(217,90,43,0.12)] dark:focus-within:border-[#f8c6aa]/40 dark:bg-[#696328] dark:shadow-none dark:focus-within:bg-[#696328]`}
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
            ? "h-full w-14 bg-transparent text-left text-xl font-serif tracking-[0.18em] text-[#5d5822] placeholder:text-muted-foreground/30 focus:outline-none dark:text-[#f8c6aa]"
            : "h-full w-full bg-transparent text-center text-xl font-serif tracking-[0.18em] indent-[0.18em] text-[#5d5822] placeholder:text-muted-foreground/30 placeholder:tracking-normal placeholder:indent-0 focus:outline-none dark:text-[#f8c6aa]"
        }
      />
      {operatorName && (
        <>
          <span className="mx-2 h-5 w-px bg-[#5d5822]/15 dark:bg-[#f8c6aa]/20" />
          <span className="min-w-0 flex-1 truncate text-left text-sm font-light text-[#5d5822]/90 dark:text-[#f8c6aa]/90">
            {operatorName}
          </span>
        </>
      )}
    </div>
  );
}








