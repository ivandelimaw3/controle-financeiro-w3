
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, BarChart3 } from 'lucide-react';

interface AccountsHeaderProps {
  onNewAccount: () => void;
}

export const AccountsHeader: React.FC<AccountsHeaderProps> = ({ onNewAccount }) => {
  const navigate = useNavigate();

  const handleShowReport = () => {
    navigate('/relatorio-contas');
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 flex justify-start gap-3">
          <Button
            onClick={onNewAccount}
            className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
          >
            <Plus size={20} className="mr-2" />
            Nova Conta
          </Button>
          
          <Button
            variant="outline"
            onClick={handleShowReport}
            className="flex items-center gap-2 bg-orange-100 text-orange-700 border border-orange-200 hover:bg-orange-200 hover:text-orange-800"
          >
            <BarChart3 size={16} />
            Relatório
          </Button>
        </div>
        
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Contas</h1>
          <p className="text-slate-600">Gerencie suas contas a pagar e receber</p>
        </div>
        
        <div className="flex-1"></div>
      </div>
    </div>
  );
};
