
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import Auth from '@/pages/Auth';
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import Contas from '@/pages/Contas';
import ContasCartoes from '@/pages/ContasCartoes';
import Bancos from '@/pages/Bancos';
import CartoesCredito from '@/pages/CartoesCredito';
import CartoesNovo from '@/pages/CartoesNovo';
import Categorias from '@/pages/Categorias';
import Investimentos from '@/pages/Investimentos';
import InvestimentosVencidos from '@/pages/InvestimentosVencidos';
import Analise from '@/pages/Analise';
import Relatorios from '@/pages/Relatorios';
import NotFound from '@/pages/NotFound';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Admin from '@/pages/Admin';
import { AccessControlWrapper } from '@/components/AccessControlWrapper';
import ChangePassword from '@/pages/ChangePassword';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
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
            <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AccessControlWrapper>
                    <Admin />
                  </AccessControlWrapper>
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
