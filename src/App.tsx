
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useState } from "react";
import { DefaultProviders } from "./components/providers/default.tsx";
import AuthCallback from "./pages/auth/Callback.tsx";
import LoginPage from "./pages/login/page.tsx";
import DashboardPage from "./pages/dashboard/page.tsx";
import UsuariosPage from "./pages/dashboard/usuarios/page.tsx";
import VendaPage from "./pages/venda/page.tsx";
import AdminPage from "./pages/admin/page.tsx";
import AcompanhamentoPage from "./pages/acompanhamento/page.tsx";
import NotFound from "./pages/NotFound.tsx";
import CaixaPage from "./pages/caixa/page.tsx";
import WhatsAppReceptionPage from "./pages/whatsapp/page.tsx";

export type OperatorSession = {
  operatorId: string;
  name: string;
  role: string;
  units?: string[];
};

type AppPage = "dashboard" | "usuarios" | "venda" | "acompanhamento" | "caixa" | "delivery" | "whatsapp";

const SESSION_KEY = "alvorada_operator_session";

function loadSession(): OperatorSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OperatorSession;
  } catch {
    return null;
  }
}

function saveSession(op: OperatorSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(op));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export default function App() {
  const [operator, setOperator] = useState<OperatorSession | null>(() => loadSession());
  const [currentPage, setCurrentPage] = useState<AppPage>("dashboard");

  const handleLogin = (op: OperatorSession) => {
    saveSession(op);
    setOperator(op);
    setCurrentPage("dashboard");
  };

  const handleLogout = () => {
    clearSession();
    setOperator(null);
    setCurrentPage("dashboard");
  };

  const navigate = (page: AppPage) => {
    setCurrentPage(page);
  };

  return (
    <DefaultProviders>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              operator ? (
                currentPage === "usuarios" ? (
                  <UsuariosPage operator={operator} onBack={() => navigate("dashboard")} />
                ) : currentPage === "venda" ? (
                  <VendaPage operator={operator} onBack={() => navigate("dashboard")} />
                ) : currentPage === "acompanhamento" || currentPage === "delivery" ? (
                  <AcompanhamentoPage
                    operator={operator}
                    onBack={() => navigate("dashboard")}
                    initialAba={currentPage === "delivery" ? "delivery" : "pedidos"}
                  />
                ) : currentPage === "caixa" ? (
                  <CaixaPage operator={operator} onBack={() => navigate("dashboard")} />
                ) : currentPage === "whatsapp" ? (
                  <WhatsAppReceptionPage
                    operator={operator}
                    onBack={() => navigate("dashboard")}
                    onLogout={handleLogout}
                    onStartOrder={() => navigate("venda")}
                  />
                ) : (
                  <DashboardPage
                    operator={operator}
                    onLogout={handleLogout}
                    onNavigate={navigate}
                  />
                )
              ) : (
                <LoginPage onOperatorLogin={handleLogin} />
              )
            }
          />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </DefaultProviders>
  );
}
