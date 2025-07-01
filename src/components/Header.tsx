
import React from 'react';
import { User, LogOut, Clock, Star, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export const Header: React.FC = () => {
  const { user, userStatus, signOut } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso."
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao fazer logout.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = () => {
    if (!userStatus) {
      return (
        <Badge variant="secondary" className="text-xs">
          <Clock className="w-3 h-3 mr-1" />
          Carregando...
        </Badge>
      );
    }

    if (userStatus.is_premium) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 text-xs">
          <Star className="w-3 h-3 mr-1" />
          Premium
        </Badge>
      );
    }

    if (userStatus.is_trial_active) {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200 text-xs">
          <Clock className="w-3 h-3 mr-1" />
          Trial ({userStatus.days_remaining} dias)
        </Badge>
      );
    }

    return (
      <Badge variant="destructive" className="text-xs">
        <AlertTriangle className="w-3 h-3 mr-1" />
        Expirado
      </Badge>
    );
  };

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Controle Financeiro W3
          </h1>
          <p className="text-sm text-slate-500">Gestão Financeira</p>
        </div>
        
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
            <User size={16} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-slate-700">Usuário</p>
              {getStatusBadge()}
            </div>
            <p className="text-xs text-slate-500">{user?.email || 'user@example.com'}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="text-slate-400 hover:text-red-500 transition-colors"
            title="Sair"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
