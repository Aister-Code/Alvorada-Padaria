import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Eye, EyeOff, Sun, Moon, X } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { useTheme } from "next-themes";
import { toast } from "sonner";


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
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetId, setResetId] = useState("");
  const [resetPin, setResetPin] = useState("");
  const [resetPin2, setResetPin2] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const loginMutation = useMutation(api.auth.operators.loginOperator);
  const seedOps = useMutation(api.auth.operators.seedOperators);
  const ensureSystemOps = useMutation(api.auth.operators.ensureSystemOperators);
  const requestReset = useMutation(api.auth.pinReset.requestReset);
  const userRef = useRef<HTMLInputElement>(null);
  const pinRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    seedOps().catch(() => {});
    ensureSystemOps().catch(() => {});
    // Auto-focus no primeiro campo conforme RIA-MISSION-001
    userRef.current?.focus();
  }, [seedOps]);

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
        userRef.current?.focus();
      }
    } catch {
      setError("Erro ao conectar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 relative overflow-hidden">

      {/* Textura de fundo sutil */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 1.5px 1.5px, currentColor 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Alternância Claro/Escuro — segundo plano, canto superior direito */}
      <button
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="absolute top-5 right-5 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
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
        <img
          src="https://hercules-cdn.com/file_HPjTSRmu0Y2UO4eTkNA5IUvH"
          alt="Alvorada"
          className="w-36 h-36 rounded-3xl object-cover mb-8 shadow-lg"
        />

        {/* Campo Usuário */}
        <div className="w-full space-y-1.5 mb-4">
          <label className="block text-[10px] font-medium text-muted-foreground tracking-widest uppercase px-1">
            Usuário
          </label>
          <input
            ref={userRef}
            type="text"
            inputMode="numeric"
            maxLength={3}
            placeholder="001"
            value={userId}
            autoComplete="off"
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              setUserId(val);
              setError("");
              // Cursor vai automaticamente para o PIN ao completar 3 dígitos
              if (val.length === 3) {
                setTimeout(() => pinRef.current?.focus(), 50);
              }
            }}
            className="w-full h-12 px-4 rounded-xl bg-secondary border border-border text-foreground text-center text-2xl font-serif tracking-[0.4em] placeholder:text-muted-foreground/30 placeholder:text-base placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          />
        </div>

        {/* Campo Senha */}
        <div className="w-full space-y-1.5 mb-6">
          <label className="block text-[10px] font-medium text-muted-foreground tracking-widest uppercase px-1">
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
              className="w-full h-12 px-4 pr-11 rounded-xl bg-secondary border border-border text-foreground text-center text-2xl tracking-[0.5em] placeholder:text-muted-foreground/30 placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPin((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
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
          className="cursor-pointer w-full h-12 rounded-xl bg-primary text-primary-foreground font-medium tracking-[0.2em] uppercase text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-35 disabled:cursor-not-allowed mb-5"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        {/* Esqueci a senha — segundo plano */}
        <button
          type="button"
          onClick={() => { setShowResetModal(true); setResetId(userId); setResetPin(""); setResetPin2(""); }}
          className="cursor-pointer text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
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
            className="fixed inset-0 bg-black/50 flex items-center justify-center px-6 z-50"
            onClick={() => setShowResetModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.2, ease: "easeOut" as const }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xs bg-background rounded-2xl p-6 shadow-xl border border-border"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-semibold tracking-wide">Redefinir PIN</h2>
                <button onClick={() => setShowResetModal(false)} className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-muted-foreground mb-5 leading-relaxed">
                Informe seu ID e o novo PIN. Após envio, aguarde aprovação do gerente.
              </p>

              <div className="space-y-3">
                {/* ID do operador */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-medium text-muted-foreground tracking-widest uppercase">
                    Usuário
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={3}
                    placeholder="001"
                    value={resetId}
                    autoComplete="off"
                    onChange={(e) => setResetId(e.target.value.replace(/\D/g, ""))}
                    className="w-full h-11 px-4 rounded-xl bg-secondary border border-border text-foreground text-center text-xl font-serif tracking-[0.4em] placeholder:text-muted-foreground/30 placeholder:text-sm placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  />
                </div>

                {/* Novo PIN */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-medium text-muted-foreground tracking-widest uppercase">
                    Novo PIN
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="••••"
                    value={resetPin}
                    autoComplete="off"
                    onChange={(e) => setResetPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    className="w-full h-11 px-4 rounded-xl bg-secondary border border-border text-foreground text-center text-xl tracking-[0.5em] placeholder:text-muted-foreground/30 placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  />
                </div>

                {/* Confirmar PIN */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-medium text-muted-foreground tracking-widest uppercase">
                    Confirmar PIN
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="••••"
                    value={resetPin2}
                    autoComplete="off"
                    onChange={(e) => setResetPin2(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    className="w-full h-11 px-4 rounded-xl bg-secondary border border-border text-foreground text-center text-xl tracking-[0.5em] placeholder:text-muted-foreground/30 placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  />
                </div>
              </div>

              <button
                disabled={resetLoading || resetId.length < 1 || resetPin.length !== 4 || resetPin !== resetPin2}
                onClick={async () => {
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
                }}
                className="cursor-pointer w-full h-11 mt-5 rounded-xl bg-primary text-primary-foreground text-sm font-medium tracking-[0.15em] uppercase hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-35 disabled:cursor-not-allowed"
              >
                {resetLoading ? "Enviando..." : "Solicitar"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rodapé RondonIA Apps */}
      <p className="absolute bottom-5 text-[9px] text-muted-foreground/40 tracking-[0.25em] uppercase select-none">
        RondonIA Apps
      </p>
    </div>
  );
}
