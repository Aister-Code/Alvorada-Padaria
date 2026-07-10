import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Eye, EyeOff, Sun, Moon, X } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import AlvoradaLogo from "@/components/branding/AlvoradaLogo.tsx";
import OperatorIdField from "@/components/ui/operator-id-field.tsx";


function hashPin(pin: string) {
  return `pin_${pin}`;
}

type OperatorSession = {
  operatorId: string;
  name: string;
  role: string;
};

type Props = {
  onOperatorLogin: (session: OperatorSession) => void;
};


export default function LoginPage({ onOperatorLogin }: Props) {
  const [userId, setUserId] = useState("");
  const [userIdFinalized, setUserIdFinalized] = useState(false);
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetId, setResetId] = useState("");
  const [resetIdFinalized, setResetIdFinalized] = useState(false);
  const [resetPin, setResetPin] = useState("");
  const [resetPin2, setResetPin2] = useState("");
  const [showResetPin, setShowResetPin] = useState(false);
  const [showResetPin2, setShowResetPin2] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const loginMutation = useMutation(api.auth.operators.loginOperator);
  const seedOps = useMutation(api.auth.operators.seedOperators);
  const ensureSystemOps = useMutation(api.auth.operators.ensureSystemOperators);
  const requestReset = useMutation(api.auth.pinReset.requestReset);
  const loginOperator = useQuery(
    api.venda.operadores.resolveOperatorConvexId,
    userId.length === 3 ? { operatorId: userId.padStart(3, "0") } : "skip",
  );
  const resetOperator = useQuery(
    api.venda.operadores.resolveOperatorConvexId,
    resetId.length === 3 ? { operatorId: resetId.padStart(3, "0") } : "skip",
  );
  const userRef = useRef<HTMLInputElement>(null);
  const pinRef = useRef<HTMLInputElement>(null);
  const resetIdRef = useRef<HTMLInputElement>(null);
  const resetPinRef = useRef<HTMLInputElement>(null);
  const resetPin2Ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    seedOps().catch(() => {});
    ensureSystemOps().catch(() => {});
    // Auto-focus no primeiro campo conforme RIA-MISSION-001
    userRef.current?.focus();
  }, [seedOps]);

  useEffect(() => {
    if (showResetModal) {
      setTimeout(() => resetIdRef.current?.focus(), 50);
    }
  }, [showResetModal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || pin.length !== 4) return;
    setError("");
    setLoading(true);
    try {
      const result = await loginMutation({
        operatorId: userId.padStart(3, "0"),
        pinHash: hashPin(pin),
      });
      if (result.success && "operator" in result && result.operator) {
        onOperatorLogin(result.operator);
      } else {
        setError("Usuário ou senha incorretos.");
        setPin("");
        setTimeout(() => userRef.current?.focus(), 50);
      }
    } catch {
      setError("Erro ao conectar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const resetValid =
    resetId.length === 3 &&
    resetPin.length === 4 &&
    resetPin === resetPin2 &&
    resetOperator !== null &&
    resetOperator !== undefined;

  const handleRequestReset = async () => {
    if (!resetValid) return;
    setResetLoading(true);
    try {
      const res = await requestReset({
        operatorId: resetId.padStart(3, "0"),
        newPinHash: hashPin(resetPin),
      });
      if (res.success) {
        setShowResetModal(false);
        toast.success("Solicitação enviada. Aguarde aprovação do gerente.");
      } else {
        toast.error("Usuário não encontrado.");
      }
    } catch {
      toast.error("Erro ao enviar. Tente novamente.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f3c4a2] text-[#685c20] dark:bg-[#685c20] dark:text-[#f3c4a2] px-6 relative overflow-hidden">

      {/* Alternância Claro/Escuro — segundo plano, canto superior direito */}
      <button
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="absolute top-5 right-5 p-2 text-[#685c20]/45 hover:text-[#685c20] transition-colors cursor-pointer dark:text-[#f3c4a2]/45 dark:hover:text-[#f3c4a2]"
        aria-label="Alternar tema"
      >
        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      {/* Formulário */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" as const }}
        className="w-full max-w-xs flex flex-col items-center"
      >
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <AlvoradaLogo size="lg" className="w-56 max-w-full" />
        </div>

        {/* Campo Usuário */}
        <div className="w-[18rem] max-w-full space-y-1 mb-3.5">
          <label className="block px-1 text-[10px] font-medium uppercase tracking-[0.08em] text-[#685c20]/86 dark:text-[#f3c4a2]/80">
            Usuário
          </label>
          <OperatorIdField
            value={userId}
            operator={loginOperator}
            finalized={userIdFinalized}
            inputRef={userRef}
            borderClass="border-transparent"
            onValueChange={setUserId}
            onFinalizedChange={setUserIdFinalized}
            onNext={() => pinRef.current?.focus()}
            onClear={() => setError("")}
          />
          {userIdFinalized && userId.length === 3 && loginOperator === null && (
            <p className="text-[11px] text-destructive px-1">
              Operador não encontrado.
            </p>
          )}
        </div>

        {/* Campo Senha */}
        <div className="w-[18rem] max-w-full space-y-1 mb-5">
          <label className="block px-1 text-[10px] font-medium uppercase tracking-[0.08em] text-[#685c20]/86 dark:text-[#f3c4a2]/80">
            Senha
          </label>
          <div className="relative">
            <input
              ref={pinRef}
              type={showPin ? "text" : "password"}
              inputMode="numeric"
              maxLength={4}
              placeholder="••••"
              value={pin}
              autoComplete="off"
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, "").slice(0, 4));
                setError("");
              }}
              className="w-full h-11 px-11 rounded-xl border border-transparent bg-[#f6d0b4] text-center text-xl font-serif tracking-[0.22em] indent-[0.22em] text-[#685c20] shadow-[0_1px_8px_rgba(78,91,29,0.045)] placeholder:text-[#685c20]/25 placeholder:tracking-normal placeholder:indent-0 transition-all focus:bg-[#f8dcc8] focus:border-[#685c20]/35 focus:outline-none focus:shadow-[0_4px_18px_rgba(217,90,43,0.12)] dark:focus:border-[#f3c4a2]/40 dark:bg-[#756c2c] dark:text-[#f3c4a2] dark:shadow-none dark:placeholder:text-[#f3c4a2]/25 dark:focus:bg-[#756c2c]"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPin((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#685c20]/45 hover:text-[#685c20] transition-colors cursor-pointer dark:text-[#f3c4a2]/45 dark:hover:text-[#f3c4a2]"
              aria-label={showPin ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mensagem de erro */}
        <AnimatePresence>
          {error && (
            <motion.p
              key={error}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs text-center mb-4 text-destructive"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Botão Entrar — ação principal */}
        <button
          type="submit"
          disabled={loading || !userId || pin.length !== 4}
          className="cursor-pointer inline-flex items-center justify-center w-[18rem] max-w-full h-11 rounded-xl bg-[#f04a2a] text-white font-semibold uppercase text-sm shadow-none hover:bg-[#ef3b24] active:scale-[0.98] transition-all disabled:opacity-75 disabled:cursor-not-allowed mb-5"
        >
          <span className="tracking-[0.12em] indent-[0.12em]">
            {loading ? "Entrando..." : "Entrar"}
          </span>
        </button>

        {/* Esqueci a senha — segundo plano */}
        <button
          type="button"
          onClick={() => {
            setShowResetModal(true);
            setResetId("");
            setResetIdFinalized(false);
            setResetPin("");
            setResetPin2("");
            setShowResetPin(false);
            setShowResetPin2(false);
          }}
          className="cursor-pointer text-xs font-light text-[#685c20]/68 hover:text-[#685c20] underline underline-offset-4 transition-colors dark:text-[#f3c4a2]/50 dark:hover:text-[#f3c4a2]"
        >
          Esqueci a senha
        </button>
      </motion.form>

      {/* Modal — Redefinir PIN */}
      <AnimatePresence>
        {showResetModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#685c20]/55 flex items-center justify-center px-6 z-50"
            onClick={() => setShowResetModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.2, ease: "easeOut" as const }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xs rounded-2xl border border-transparent bg-[#f3c4a2] p-6 shadow-[0_24px_60px_rgba(7,24,13,0.22)] dark:bg-[#756c2c] dark:shadow-[0_24px_70px_rgba(0,0,0,0.45)]"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-semibold tracking-wide text-[#685c20] dark:text-[#f3c4a2]">Redefinir PIN</h2>
                <button onClick={() => setShowResetModal(false)} className="cursor-pointer text-[#685c20]/68 hover:text-[#685c20] transition-colors dark:text-[#f3c4a2]/68 dark:hover:text-[#f3c4a2]">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs font-medium text-[#685c20]/70 dark:text-[#f3c4a2]/72 mb-5 leading-relaxed">
                Informe seu ID e o novo PIN. Após envio, aguarde aprovação do gerente.
              </p>

              <div className="space-y-3">
                {/* ID do operador */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-medium text-[#685c20]/86 dark:text-[#f3c4a2]/80 tracking-widest uppercase">
                    Usuário
                  </label>
                  <OperatorIdField
                    value={resetId}
                    operator={resetOperator}
                    finalized={resetIdFinalized}
                    inputRef={resetIdRef}
                    borderClass="border-transparent"
                    onValueChange={setResetId}
                    onFinalizedChange={setResetIdFinalized}
                    onNext={() => setTimeout(() => resetPinRef.current?.focus(), 0)}
                  />
                  {resetIdFinalized && resetId.length === 3 && (
                    resetOperator === null ? (
                      <p className="text-[11px] text-destructive px-1">
                        Operador não encontrado.
                      </p>
                    ) : resetOperator === undefined ? (
                      <p className="text-[11px] text-muted-foreground px-1">
                        Buscando operador...
                      </p>
                    ) : null
                  )}
                </div>

                {/* Novo PIN */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-medium text-[#685c20]/86 dark:text-[#f3c4a2]/80 tracking-widest uppercase">
                    Novo PIN
                  </label>
                  <div className="relative">
                    <input
                      ref={resetPinRef}
                      type={showResetPin ? "text" : "password"}
                      inputMode="numeric"
                      maxLength={4}
                      placeholder="••••"
                      value={resetPin}
                      autoComplete="off"
                      onChange={(e) => setResetPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && resetPin.length === 4) {
                          e.preventDefault();
                          resetPin2Ref.current?.focus();
                        }
                      }}
                      className="w-full h-11 px-11 rounded-xl border border-transparent bg-[#f6d0b4] text-center text-xl tracking-[0.5em] indent-[0.5em] text-[#685c20] shadow-[0_1px_8px_rgba(78,91,29,0.045)] placeholder:text-[#685c20]/25 placeholder:tracking-normal placeholder:indent-0 transition-all focus:bg-[#f8dcc8] focus:border-[#685c20]/35 focus:outline-none focus:shadow-[0_4px_18px_rgba(217,90,43,0.12)] dark:focus:border-[#f3c4a2]/40 dark:bg-[#756c2c] dark:text-[#f3c4a2] dark:shadow-none dark:placeholder:text-[#f3c4a2]/25 dark:focus:bg-[#756c2c]"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowResetPin((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#685c20]/45 hover:text-[#685c20] transition-colors cursor-pointer dark:text-[#f3c4a2]/45 dark:hover:text-[#f3c4a2]"
                      aria-label={showResetPin ? "Ocultar novo PIN" : "Mostrar novo PIN"}
                    >
                      {showResetPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirmar PIN */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-medium text-[#685c20]/86 dark:text-[#f3c4a2]/80 tracking-widest uppercase">
                    Confirmar PIN
                  </label>
                  <div className="relative">
                    <input
                      ref={resetPin2Ref}
                      type={showResetPin2 ? "text" : "password"}
                      inputMode="numeric"
                      maxLength={4}
                      placeholder="••••"
                      value={resetPin2}
                      autoComplete="off"
                      onChange={(e) => setResetPin2(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && resetValid && !resetLoading) {
                          e.preventDefault();
                          void handleRequestReset();
                        }
                      }}
                      className="w-full h-11 px-11 rounded-xl border border-transparent bg-[#f6d0b4] text-center text-xl tracking-[0.5em] indent-[0.5em] text-[#685c20] shadow-[0_1px_8px_rgba(78,91,29,0.045)] placeholder:text-[#685c20]/25 placeholder:tracking-normal placeholder:indent-0 transition-all focus:bg-[#f8dcc8] focus:border-[#685c20]/35 focus:outline-none focus:shadow-[0_4px_18px_rgba(217,90,43,0.12)] dark:focus:border-[#f3c4a2]/40 dark:bg-[#756c2c] dark:text-[#f3c4a2] dark:shadow-none dark:placeholder:text-[#f3c4a2]/25 dark:focus:bg-[#756c2c]"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowResetPin2((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#685c20]/45 hover:text-[#685c20] transition-colors cursor-pointer dark:text-[#f3c4a2]/45 dark:hover:text-[#f3c4a2]"
                      aria-label={showResetPin2 ? "Ocultar confirmação do PIN" : "Mostrar confirmação do PIN"}
                    >
                      {showResetPin2 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                disabled={resetLoading || !resetValid}
                onClick={() => void handleRequestReset()}
                className="cursor-pointer w-full h-11 mt-5 rounded-xl bg-[#f04a2a] text-white text-sm font-semibold tracking-[0.15em] uppercase shadow-none hover:bg-[#ef3b24] active:scale-[0.98] transition-all disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {resetLoading ? "Enviando..." : "Solicitar"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rodapé RondônIA Apps */}
      <p className="absolute bottom-5 text-[9px] text-[#685c20]/52 tracking-[0.25em] select-none dark:text-[#f3c4a2]/30">
        RondônIA Apps
      </p>
    </div>
  );
}















