
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, FileBarChart, ArrowLeft, FileSearch } from 'lucide-react';

interface AccountsHeaderProps {
  onNewAccount: () => void;
  onReportsToggle: () => void;
  showReports: boolean;
}

export const AccountsHeader: React.FC<AccountsHeaderProps> = ({ onNewAccount, onReportsToggle, showReports }) => {
  // Reports view is now handled by ReportsMonthNavigator component
  if (showReports) {
    return null;
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 flex justify-start gap-3">
          <Button
            onClick={onNewAccount}
            className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 px-4 py-2"
          >
            <Plus size={20} className="mr-2" />
            Nova Conta
          </Button>
          
          <Button
            onClick={onReportsToggle}
            className="bg-gradient-to-r from-sky-400 to-blue-400 hover:from-sky-500 hover:to-blue-500 px-4 py-2"
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
