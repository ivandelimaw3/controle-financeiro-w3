
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface AccountsHeaderProps {
  onNewAccount: () => void;
}

export const AccountsHeader: React.FC<AccountsHeaderProps> = ({ onNewAccount }) => {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Contas</h1>
          <div className="flex items-center gap-4">
            <p className="text-slate-600">Gerencie suas contas a pagar e receber</p>
            <Button
              onClick={onNewAccount}
              className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
            >
              <Plus size={20} className="mr-2" />
              Nova Conta
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
