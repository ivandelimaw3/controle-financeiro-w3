
import React from 'react';
import { Plus, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CardAccountsHeaderProps {
  onNewAccount: () => void;
  selectedMonth: number;
  currentYear: number;
  onNavigateMonth: (direction: 'prev' | 'next') => void;
}

export const CardAccountsHeader = ({
  onNewAccount,
  selectedMonth,
  currentYear,
  onNavigateMonth
}: CardAccountsHeaderProps) => {
  const monthDate = new Date(currentYear, selectedMonth);
  const monthName = format(monthDate, 'MMMM yyyy', { locale: ptBR });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <CreditCard className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contas Cartões</h1>
            <p className="text-gray-600">Gerencie as contas dos seus cartões de crédito</p>
          </div>
        </div>
        
        <Button onClick={onNewAccount} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Nova Conta
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigateMonth('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <h2 className="text-xl font-semibold capitalize text-gray-900">
            {monthName}
          </h2>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigateMonth('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
