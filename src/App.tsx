import { Toaster } from "sonner";
import { Toaster as ShadcnToaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AccountsProvider } from "./contexts/AccountsContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AccessControlWrapper } from "./components/AccessControlWrapper";
import Dashboard from "./pages/Dashboard";
import Contas from "./pages/Contas";
import Categorias from "./pages/Categorias";
import Relatorios from "./pages/Relatorios";
import Bancos from "./pages/Bancos";
import Investimentos from "./pages/Investimentos";
import InvestimentosVencidos from "./pages/InvestimentosVencidos";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import Analise from "./pages/Analise";
import NotFound from "./pages/NotFound";
import CartoesCredito from "./pages/CartoesCredito";
import ChangePassword from "./pages/ChangePassword";
import ContasCartoes from './pages/ContasCartoes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AccountsProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/change-password" element={<ChangePassword />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/contas"
                element={
                  <ProtectedRoute>
                    <Contas />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/contas-cartoes"
                element={
                  <ProtectedRoute>
                    <ContasCartoes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cartoes-credito"
                element={
                  <ProtectedRoute>
                    <CartoesCredito />
                  </ProtectedRoute>
                }
              />
              <Route path="/categorias" element={
                <ProtectedRoute>
                  <AccessControlWrapper>
                    <Categorias />
                  </AccessControlWrapper>
                </ProtectedRoute>
              } />
              <Route path="/bancos" element={
                <ProtectedRoute>
                  <AccessControlWrapper>
                    <Bancos />
                  </AccessControlWrapper>
                </ProtectedRoute>
              } />
              <Route path="/investimentos" element={
                <ProtectedRoute>
                  <AccessControlWrapper>
                    <Investimentos />
                  </AccessControlWrapper>
                </ProtectedRoute>
              } />
              <Route path="/investimentos-vencidos" element={
                <ProtectedRoute>
                  <AccessControlWrapper>
                    <InvestimentosVencidos />
                  </AccessControlWrapper>
                </ProtectedRoute>
              } />
              <Route path="/analise" element={
                <ProtectedRoute>
                  <AccessControlWrapper>
                    <Analise />
                  </AccessControlWrapper>
                </ProtectedRoute>
              } />
              <Route path="/relatorios" element={
                <ProtectedRoute>
                  <AccessControlWrapper>
                    <Relatorios />
                  </AccessControlWrapper>
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AccountsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
