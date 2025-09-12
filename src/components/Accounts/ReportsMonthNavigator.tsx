import React from 'react';
import { ChevronLeft, ChevronRight, FileSearch, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReportsMonthNavigatorProps {
  currentMonth: number;
  currentYear: number;
  onMonthChange: (month: number, year: number) => void;
  onBackToAccounts: () => void;
}

export const ReportsMonthNavigator: React.FC<ReportsMonthNavigatorProps> = ({
  currentMonth,
  currentYear,
  onMonthChange,
  onBackToAccounts
}) => {
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const navigateMonth = (direction: 'prev' | 'next') => {
    let newMonth = currentMonth;
    let newYear = currentYear;

    if (direction === 'prev') {
      newMonth = currentMonth - 1;
      if (newMonth < 0) {
        newMonth = 11;
        newYear = currentYear - 1;
      }
    } else {
      newMonth = currentMonth + 1;
      if (newMonth > 11) {
        newMonth = 0;
        newYear = currentYear + 1;
      }
    }

    onMonthChange(newMonth, newYear);
  };

  return (
    <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="text-left flex items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <FileSearch className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Resumo Financeiro Anual</h1>
          <p className="text-sm text-slate-600">Resumo da sua situação financeira dos Últimos 12 Meses</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth('prev')}
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
          onClick={() => navigateMonth('next')}
          className="h-8 w-8 p-0 rounded-full hover:bg-blue-50 hover:border-blue-300"
        >
          <ChevronRight size={16} />
        </Button>

        <Button
          onClick={onBackToAccounts}
          variant="outline"
          className="flex items-center gap-2 ml-4 px-4 py-2 bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 border-slate-300 hover:border-slate-400 transition-all duration-200"
        >
          <ArrowLeft size={16} />
          Voltar para Contas
        </Button>
      </div>
    </div>
  );
};