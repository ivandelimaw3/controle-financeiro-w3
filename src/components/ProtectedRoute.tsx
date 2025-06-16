
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUsageControl } from '@/hooks/useUsageControl';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { TrialExpiredScreen } from './TrialExpiredScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { usageData, loading: usageLoading, canUseApp } = useUsageControl();

  if (authLoading || usageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-lg text-slate-600">Carregando...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Verificar se o usuário pode usar o app (trial ativo ou premium)
  if (!canUseApp) {
    return <TrialExpiredScreen />;
  }

  return <>{children}</>;
};
