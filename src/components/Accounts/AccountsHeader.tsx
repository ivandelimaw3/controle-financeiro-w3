
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface AccountsHeaderProps {
  onNewAccount: () => void;
}

export const AccountsHeader: React.FC<AccountsHeaderProps> = ({ onNewAccount }) => {
  return (
    <div className="flex flex-col space-y-4 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Botão Nova Conta - Mobile First */}
        <div className="w-full sm:w-auto order-2 sm:order-1">
          <Button
            onClick={onNewAccount}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 shadow-lg hover:shadow-xl transition-all duration-200"
            size="lg"
          >
            <Plus size={20} className="mr-2" />
            Nova Conta
          </Button>
        </div>
        
        {/* Título Principal */}
        <div className="text-center flex-1 order-1 sm:order-2">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-2">
            Contas
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Gerencie suas contas a pagar e receber
          </p>
        </div>
        
        {/* Espaço flexível para equilibrar o layout em desktop */}
        <div className="hidden sm:block flex-1 order-3"></div>
      </div>
    </div>
  );
};
