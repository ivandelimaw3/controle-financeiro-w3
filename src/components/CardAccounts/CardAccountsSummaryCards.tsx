
import React from 'react';
import { CreditCard, CheckCircle, Clock, Calendar, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { CardAccount } from '@/hooks/useCardAccounts';
import { formatCurrency } from '@/utils/formatters';
import { Button } from '@/components/ui/button';

interface CardAccountsSummaryCardsProps {
  cardAccounts: CardAccount[];
  totalFound: number;
  currentMonth: number;
  currentYear: number;
  onMonthChange: (direction: 'prev' | 'next') => void;
}

export const CardAccountsSummaryCards: React.FC<CardAccountsSummaryCardsProps> = ({
  cardAccounts,
  totalFound,
  currentMonth,
  currentYear,
  onMonthChange
}) => {
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  // Cálculos dos totais
  const totalAmount = cardAccounts.reduce((sum, account) => sum + account.amount, 0);
  const paidAccounts = cardAccounts.filter(account => account.status === 'pago').length;
  const pendingAccounts = cardAccounts.filter(account => account.status === 'pendente').length;
  const paidAmount = cardAccounts
    .filter(account => account.status === 'pago')
    .reduce((sum, account) => sum + account.amount, 0);
  const pendingAmount = cardAccounts
    .filter(account => account.status === 'pendente')
    .reduce((sum, account) => sum + account.amount, 0);

  // Contas vencendo nos próximos 7 dias
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  
  const dueSoonAccounts = cardAccounts.filter(account => {
    const dueDate = new Date(account.due_date);
    return dueDate >= today && dueDate <= nextWeek && account.status === 'pendente';
  }).length;

  return (
    <div className="mb-6">
      {/* Card principal com título e navegador */}
      <div className="mb-4 p-4 bg-white rounded-xl shadow-sm border border-slate-200">
        {/* Header section */}
        <div className="flex items-center justify-between">
          <div className="text-left flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 mb-1">Contas de Cartão</h1>
              <p className="text-sm text-slate-600">Gerencie suas contas de cartão de crédito</p>
            </div>
          </div>
          
          {/* Desktop month navigator */}
          <div className="hidden md:flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMonthChange('prev')}
              className="h-8 w-8 p-0 rounded-full hover:bg-blue-50 hover:border-blue-300"
            >
              <ChevronLeft size={16} />
            </Button>

            <div className="text-xl font-bold text-slate-800 min-w-[180px] text-center">
              {monthNames[currentMonth]} {currentYear}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onMonthChange('next')}
              className="h-8 w-8 p-0 rounded-full hover:bg-blue-50 hover:border-blue-300"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>

        {/* Mobile month navigator */}
        <div className="md:hidden flex items-center justify-center gap-3 mt-4 pt-4 border-t border-slate-200">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMonthChange('prev')}
            className="h-8 w-8 p-0 rounded-full hover:bg-blue-50 hover:border-blue-300"
          >
            <ChevronLeft size={16} />
          </Button>

          <div className="text-lg font-bold text-slate-800 min-w-[160px] text-center">
            {monthNames[currentMonth]} {currentYear}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onMonthChange('next')}
            className="h-8 w-8 p-0 rounded-full hover:bg-blue-50 hover:border-blue-300"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      {/* Total de contas encontradas */}
      <div className="mb-4">
        <p className="text-sm text-slate-600">
          {totalFound} {totalFound === 1 ? 'conta encontrada' : 'contas encontradas'}
        </p>
      </div>

      {/* Cards dos resumos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total de Contas */}
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CreditCard size={20} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-600">Total Geral</p>
              <p className="text-xl font-bold text-blue-600">
                {formatCurrency(totalAmount)}
              </p>
            </div>
          </div>
        </div>

        {/* Contas Pagas */}
        <div className="p-4 bg-green-50 rounded-xl border border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-600">Total Pago</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(paidAmount)}
              </p>
            </div>
          </div>
        </div>

        {/* Contas Pendentes */}
        <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock size={20} className="text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-600">Total Pendente</p>
               <p className="text-xl font-bold text-green-600">
                {formatCurrency(pendingAmount)}
              </p>
            </div>
          </div>
        </div>

       {/* Vencendo Esta Semana */}
        <div className="p-4 bg-red-50 rounded-xl border border-red-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Calendar size={20} className="text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-600">Vencendo Esta Semana</p>
              <p className="text-xl font-bold text-red-600">
               {dueSoonAccounts}
              </p>
              <p className="text-sm text-slate-500 mt-1">Próximos 7 dias</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
