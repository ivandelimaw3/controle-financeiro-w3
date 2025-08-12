
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardMonthNavigatorProps {
  currentMonth: number;
  currentYear: number;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

export const DashboardMonthNavigator: React.FC<DashboardMonthNavigatorProps> = ({
  currentMonth,
  currentYear,
  onPreviousMonth,
  onNextMonth
}) => {
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const formatMonth = (month: number, year: number) => {
    return `${monthNames[month]} ${year}`;
  };

  const isCurrentMonth = () => {
    const now = new Date();
    return currentMonth === now.getMonth() && currentYear === now.getFullYear();
  };

  const isNextMonthDisabled = () => {
    const now = new Date();
    const currentDate = new Date(currentYear, currentMonth);
    const nextMonth = new Date(currentDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    return nextMonth > now;
  };

  const getPreviousMonth = () => {
    const prevDate = new Date(currentYear, currentMonth - 1);
    return formatMonth(prevDate.getMonth(), prevDate.getFullYear());
  };

  const getNextMonth = () => {
    const nextDate = new Date(currentYear, currentMonth + 1);
    return formatMonth(nextDate.getMonth(), nextDate.getFullYear());
  };

  return (
    <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="text-left">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Resumo Financeiro</h1>
        <p className="text-sm text-slate-600">Resumo da sua situação financeira</p>
      </div>
      
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onPreviousMonth}
          className="flex items-center gap-2 hover:bg-slate-50"
          title={`Ir para ${getPreviousMonth()}`}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Anterior</span>
        </Button>
        
        <div className="text-center min-w-[140px]">
          <div className="text-lg font-semibold text-slate-800">
            {formatMonth(currentMonth, currentYear)}
          </div>
          {isCurrentMonth() && (
            <div className="text-xs text-blue-600 font-medium">Mês Atual</div>
          )}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onNextMonth}
          disabled={isNextMonthDisabled()}
          className="flex items-center gap-2 hover:bg-slate-50 disabled:opacity-50"
          title={isNextMonthDisabled() ? "Não é possível navegar para o futuro" : `Ir para ${getNextMonth()}`}
        >
          <span className="hidden sm:inline">Próximo</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
