
import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MonthNavigatorProps {
  currentMonth: number; // 0-11 (Janeiro = 0)
  currentYear: number;
  onMonthChange: (startDate: Date, endDate: Date, month: number, year: number) => void;
}

export const MonthNavigator: React.FC<MonthNavigatorProps> = ({
  currentMonth,
  currentYear,
  onMonthChange
}) => {
  const today = new Date();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const getMonthStartEnd = (month: number, year: number) => {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0); // Último dia do mês
    return { startDate, endDate };
  };

  const handleMonthChange = (month: number, year: number) => {
    const { startDate, endDate } = getMonthStartEnd(month, year);
    onMonthChange(startDate, endDate, month, year);
  };

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

    handleMonthChange(newMonth, newYear);
  };

  const goToToday = () => {
    handleMonthChange(todayMonth, todayYear);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 p-4 bg-white rounded-2xl shadow-lg border border-slate-200">
      {/* Navegação principal com setas e botão Hoje */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth('prev')}
          className="h-9 w-9 p-0 rounded-full hover:bg-blue-50 hover:border-blue-300"
        >
          <ChevronLeft size={16} />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth('next')}
          className="h-9 w-9 p-0 rounded-full hover:bg-blue-50 hover:border-blue-300"
        >
          <ChevronRight size={16} />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={goToToday}
          className="flex items-center gap-2 h-9 px-3 rounded-full hover:bg-green-50 hover:border-green-300 hover:text-green-700"
          disabled={currentMonth === todayMonth && currentYear === todayYear}
        >
          <Calendar size={14} />
          <span className="hidden sm:inline">Hoje</span>
        </Button>

        <div className="text-lg font-semibold text-slate-800 ml-4">
          {currentYear}
        </div>
      </div>

      {/* Botões dos meses (Janeiro a Dezembro) */}
      <div className="flex flex-wrap items-center gap-2">
        {monthNames.map((monthName, index) => {
          const isActive = index === currentMonth;
          const monthShort = monthName.substring(0, 3);
          
          return (
            <Button
              key={index}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => handleMonthChange(index, currentYear)}
              className={`h-8 px-3 text-xs rounded-full transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'hover:bg-blue-50 hover:border-blue-300'
              }`}
            >
              {monthShort}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
