
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
    <div className="flex items-center justify-center gap-4 mb-6 p-2 bg-white rounded-xl shadow-sm border border-slate-200">
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
    </div>
  );
};
