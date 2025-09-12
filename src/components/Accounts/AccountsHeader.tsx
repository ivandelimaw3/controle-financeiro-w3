
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, FileBarChart, ArrowLeft, FileSearch } from 'lucide-react';

interface AccountsHeaderProps {
  onNewAccount: () => void;
  onReportsToggle: () => void;
  showReports: boolean;
}

export const AccountsHeader: React.FC<AccountsHeaderProps> = ({ onNewAccount, onReportsToggle, showReports }) => {
  if (showReports) {
    return (
      <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="text-left flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <FileSearch className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-1">Resumo Financeiro</h1>
            <p className="text-sm text-slate-600">Resumo da sua situação financeira</p>
          </div>
        </div>
        
        <Button
          onClick={onReportsToggle}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Voltar para Contas
        </Button>
      </div>
    );
  }

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
            onClick={onReportsToggle}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          >
            <FileBarChart size={20} className="mr-2" />
            Relatórios
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
