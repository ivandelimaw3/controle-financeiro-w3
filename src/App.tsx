
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AccountsProvider } from "@/contexts/AccountsContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AccessControlWrapper } from "@/components/AccessControlWrapper";

// Pages
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Contas from "./pages/Contas";
import ContasCartoes from "./pages/ContasCartoes";
import Bancos from "./pages/Bancos";
import CartoesCredito from "./pages/CartoesCredito";
import CartoesNovo from "./pages/CartoesNovo";
import Categorias from "./pages/Categorias";
import Investimentos from "./pages/Investimentos";
import InvestimentosVencidos from "./pages/InvestimentosVencidos";
import Analise from "./pages/Analise";
import Relatorios from "./pages/Relatorios";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import ChangePassword from "./pages/ChangePassword";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AccountsProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/change-password" element={<ChangePassword />} />
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/contas" element={<ProtectedRoute><Contas /></ProtectedRoute>} />
              <Route path="/contas-cartoes" element={<ProtectedRoute><ContasCartoes /></ProtectedRoute>} />
              <Route path="/bancos" element={<ProtectedRoute><Bancos /></ProtectedRoute>} />
              <Route path="/cartoes-credito" element={<ProtectedRoute><CartoesCredito /></ProtectedRoute>} />
              <Route path="/cartoes-novo" element={<ProtectedRoute><CartoesNovo /></ProtectedRoute>} />
              <Route path="/categorias" element={<ProtectedRoute><Categorias /></ProtectedRoute>} />
              <Route path="/investimentos" element={<ProtectedRoute><Investimentos /></ProtectedRoute>} />
              <Route path="/investimentos-vencidos" element={<ProtectedRoute><InvestimentosVencidos /></ProtectedRoute>} />
              <Route path="/analise" element={<ProtectedRoute><Analise /></ProtectedRoute>} />
              <Route path="/relatorios" element={<ProtectedRoute><Relatorios /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><AccessControlWrapper requiredRole="admin"><Admin /></AccessControlWrapper></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AccountsProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
