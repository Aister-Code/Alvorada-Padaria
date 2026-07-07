import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Bike } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils.ts";

export type DadosDelivery = {
  clienteNomeSnapshot: string;
  clienteTelefoneSnapshot: string;
  enderecoEntrega: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    uf: string;
    referencia?: string;
  };
};

type Props = {
  dadosIniciais?: Partial<DadosDelivery>;
  onConfirm: (dados: DadosDelivery) => void;
  onClose: () => void;
  loading?: boolean;
};

function Campo({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass = "w-full text-sm border border-border rounded-lg px-3 py-2 bg-muted/30 focus:outline-none focus:ring-2 focus:ring-[var(--brand-orange)] text-foreground placeholder:text-muted-foreground";

export default function ModalDadosDelivery({ dadosIniciais, onConfirm, onClose, loading }: Props) {
  const [nome, setNome] = useState(dadosIniciais?.clienteNomeSnapshot ?? "");
  const [telefone, setTelefone] = useState(dadosIniciais?.clienteTelefoneSnapshot ?? "");
  const [logradouro, setLogradouro] = useState(dadosIniciais?.enderecoEntrega?.logradouro ?? "");
  const [numero, setNumero] = useState(dadosIniciais?.enderecoEntrega?.numero ?? "");
  const [complemento, setComplemento] = useState(dadosIniciais?.enderecoEntrega?.complemento ?? "");
  const [bairro, setBairro] = useState(dadosIniciais?.enderecoEntrega?.bairro ?? "");
  const [cidade, setCidade] = useState(dadosIniciais?.enderecoEntrega?.cidade ?? "Porto Velho");
  const [uf, setUf] = useState(dadosIniciais?.enderecoEntrega?.uf ?? "RO");
  const [referencia, setReferencia] = useState(dadosIniciais?.enderecoEntrega?.referencia ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!nome.trim()) e.nome = "Nome obrigatório";
    if (!telefone.trim()) e.telefone = "Telefone obrigatório";
    if (!logradouro.trim()) e.logradouro = "Logradouro obrigatório";
    if (!numero.trim()) e.numero = "Número obrigatório";
    if (!bairro.trim()) e.bairro = "Bairro obrigatório";
    if (!cidade.trim()) e.cidade = "Cidade obrigatória";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleConfirm = () => {
    if (!validate()) return;
    onConfirm({
      clienteNomeSnapshot: nome.trim(),
      clienteTelefoneSnapshot: telefone.trim(),
      enderecoEntrega: {
        cep: "",
        logradouro: logradouro.trim(),
        numero: numero.trim(),
        complemento: complemento.trim() || undefined,
        bairro: bairro.trim(),
        cidade: cidade.trim(),
        uf: uf.trim().toUpperCase() || "RO",
        referencia: referencia.trim() || undefined,
      },
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-background w-full max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col"
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center">
                <Bike size={16} className="text-sky-600 dark:text-sky-400" />
              </div>
              <h2 className="text-base font-semibold text-foreground">Dados do Delivery</h2>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer">
              <X size={18} />
            </button>
          </div>

          {/* Corpo com scroll */}
          <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
            {/* Cliente */}
            <div className="space-y-3">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Cliente</p>
              <Campo label="Nome" required>
                <input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: João Silva"
                  className={cn(inputClass, errors.nome && "border-destructive focus:ring-destructive")}
                />
                {errors.nome && <p className="text-xs text-destructive mt-1">{errors.nome}</p>}
              </Campo>
              <Campo label="Telefone / WhatsApp" required>
                <input
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="Ex: (69) 9 9999-9999"
                  className={cn(inputClass, errors.telefone && "border-destructive focus:ring-destructive")}
                  inputMode="tel"
                />
                {errors.telefone && <p className="text-xs text-destructive mt-1">{errors.telefone}</p>}
              </Campo>
            </div>

            {/* Endereço */}
            <div className="space-y-3 pt-1">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Endereço de Entrega</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <Campo label="Logradouro" required>
                    <input
                      value={logradouro}
                      onChange={(e) => setLogradouro(e.target.value)}
                      placeholder="Rua, Av..."
                      className={cn(inputClass, errors.logradouro && "border-destructive focus:ring-destructive")}
                    />
                    {errors.logradouro && <p className="text-xs text-destructive mt-1">{errors.logradouro}</p>}
                  </Campo>
                </div>
                <Campo label="Número" required>
                  <input
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    placeholder="123"
                    className={cn(inputClass, errors.numero && "border-destructive focus:ring-destructive")}
                  />
                  {errors.numero && <p className="text-xs text-destructive mt-1">{errors.numero}</p>}
                </Campo>
              </div>
              <Campo label="Complemento">
                <input
                  value={complemento}
                  onChange={(e) => setComplemento(e.target.value)}
                  placeholder="Apto, bloco, casa..."
                  className={inputClass}
                />
              </Campo>
              <Campo label="Bairro" required>
                <input
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  placeholder="Ex: Alvorada"
                  className={cn(inputClass, errors.bairro && "border-destructive focus:ring-destructive")}
                />
                {errors.bairro && <p className="text-xs text-destructive mt-1">{errors.bairro}</p>}
              </Campo>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <Campo label="Cidade" required>
                    <input
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                      placeholder="Porto Velho"
                      className={cn(inputClass, errors.cidade && "border-destructive focus:ring-destructive")}
                    />
                  </Campo>
                </div>
                <Campo label="UF">
                  <input
                    value={uf}
                    onChange={(e) => setUf(e.target.value)}
                    placeholder="RO"
                    maxLength={2}
                    className={inputClass}
                  />
                </Campo>
              </div>
              <Campo label="Referência / Ponto de entrega">
                <input
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                  placeholder="Ex: próximo ao mercado X"
                  className={inputClass}
                />
              </Campo>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-5 py-4 border-t border-border shrink-0">
            <Button variant="ghost" className="flex-1 cursor-pointer" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-sky-600 hover:bg-sky-700 text-white cursor-pointer"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? "Salvando..." : "Confirmar Entrega"}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
