
import React from 'react';
import { ChevronLeft, ChevronRight, FileSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardMonthNavigatorProps {
  currentMonth: number;
  currentYear: number;
  onMonthChange: (month: number, year: number) => void;
}

export const DashboardMonthNavigator: React.FC<DashboardMonthNavigatorProps> = ({
  currentMonth,
  currentYear,
  onMonthChange
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
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 p-4 sm:p-6 bg-white rounded-xl shadow-sm border border-slate-200 gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <FileSearch className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1">
            Resumo Financeiro
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Resumo da sua situação financeira
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth('prev')}
          className="h-8 w-8 p-0 rounded-full hover:bg-blue-50 hover:border-blue-300 flex-shrink-0"
        >
          <ChevronLeft size={16} />
        </Button>

        <div className="text-lg sm:text-xl font-bold text-slate-800 min-w-[140px] sm:min-w-[180px] text-center">
          <span className="block sm:hidden text-base">
            {monthNames[currentMonth].substring(0, 3)} {currentYear}
          </span>
          <span className="hidden sm:block">
            {monthNames[currentMonth]} {currentYear}
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth('next')}
          className="h-8 w-8 p-0 rounded-full hover:bg-blue-50 hover:border-blue-300 flex-shrink-0"
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
};
