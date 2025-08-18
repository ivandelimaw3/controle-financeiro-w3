
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Contas from '@/pages/Contas';
import ContasCartoes from '@/pages/ContasCartoes';
import Relatorios from '@/pages/Relatorios';
import Categorias from '@/pages/Categorias';
import Bancos from '@/pages/Bancos';
import CartoesCredito from '@/pages/CartoesCredito';
import CartoesNovo from '@/pages/CartoesNovo';
import Investimentos from '@/pages/Investimentos';
import InvestimentosVencidos from '@/pages/InvestimentosVencidos';
import Analise from '@/pages/Analise';
import Admin from '@/pages/Admin';
import ChangePassword from '@/pages/ChangePassword';
import NotFound from '@/pages/NotFound';
import { AccountsProvider } from '@/contexts/AccountsContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AccountsProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/change-password" element={<ChangePassword />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  }
                />
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
                  path="/relatorios"
                  element={
                    <ProtectedRoute>
                      <Relatorios />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/categorias"
                  element={
                    <ProtectedRoute>
                      <Categorias />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bancos"
                  element={
                    <ProtectedRoute>
                      <Bancos />
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
                <Route
                  path="/cartoes-credito/novo"
                  element={
                    <ProtectedRoute>
                      <CartoesNovo />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/investimentos"
                  element={
                    <ProtectedRoute>
                      <Investimentos />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/investimentos-vencidos"
                  element={
                    <ProtectedRoute>
                      <InvestimentosVencidos />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analise"
                  element={
                    <ProtectedRoute>
                      <Analise />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <Admin />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Toaster />
          </Router>
        </AccountsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
