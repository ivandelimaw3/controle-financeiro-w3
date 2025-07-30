import { Toaster } from "sonner";
import { Toaster as ShadcnToaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AccountsProvider } from "./contexts/AccountsContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Contas from "./pages/Contas";
import Categorias from "./pages/Categorias";
import Relatorios from "./pages/Relatorios";
import Bancos from "./pages/Bancos";
import Investimentos from "./pages/Investimentos";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import Analise from "./pages/Analise";
import NotFound from "./pages/NotFound";
import CartoesNovo from "./pages/CartoesNovo";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <AccountsProvider>
              <div className="min-h-screen">
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/contas" element={
                    <ProtectedRoute>
                      <Contas />
                    </ProtectedRoute>
                  } />
                  <Route path="/categorias" element={
                    <ProtectedRoute>
                      <Categorias />
                    </ProtectedRoute>
                  } />
                  <Route path="/bancos" element={
                    <ProtectedRoute>
                      <Bancos />
                    </ProtectedRoute>
                  } />
                  <Route path="/investimentos" element={
                    <ProtectedRoute>
                      <Investimentos />
                    </ProtectedRoute>
                  } />
                  <Route path="/cartoes-novo" element={
                    <ProtectedRoute>
                      <CartoesNovo />
                    </ProtectedRoute>
                  } />
                  <Route path="/analise" element={
                    <ProtectedRoute>
                      <Analise />
                    </ProtectedRoute>
                  } />
                  <Route path="/relatorios" element={
                    <ProtectedRoute>
                      <Relatorios />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin" element={
                    <ProtectedRoute>
                      <Admin />
                    </ProtectedRoute>
                  } />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Toaster 
                  duration={2000}
                  closeButton={true}
                />
                <ShadcnToaster />
              </div>
            </AccountsProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
