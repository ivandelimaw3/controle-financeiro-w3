
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

  // Gerar meses para paginação (2 antes e 2 depois)
  const generatePaginationMonths = () => {
    const months = [];
    for (let i = -2; i <= 2; i++) {
      let month = currentMonth + i;
      let year = currentYear;

      if (month < 0) {
        month = 12 + month;
        year = currentYear - 1;
      } else if (month > 11) {
        month = month - 12;
        year = currentYear + 1;
      }

      months.push({ month, year, offset: i });
    }
    return months;
  };

  const paginationMonths = generatePaginationMonths();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 p-4 bg-white rounded-2xl shadow-lg border border-slate-200">
      {/* Navegação principal com setas */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth('prev')}
          className="h-9 w-9 p-0 rounded-full hover:bg-blue-50 hover:border-blue-300"
        >
          <ChevronLeft size={16} />
        </Button>

        <div className="text-lg font-semibold text-slate-800 min-w-[140px] text-center">
          {monthNames[currentMonth]} {currentYear}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth('next')}
          className="h-9 w-9 p-0 rounded-full hover:bg-blue-50 hover:border-blue-300"
        >
          <ChevronRight size={16} />
        </Button>
      </div>

      {/* Paginação numérica */}
      <div className="flex items-center gap-2">
        {paginationMonths.map(({ month, year, offset }) => {
          const isActive = offset === 0;
          const monthShort = monthNames[month].substring(0, 3);
          
          return (
            <Button
              key={`${month}-${year}`}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => handleMonthChange(month, year)}
              className={`h-8 px-3 text-xs rounded-full transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'hover:bg-blue-50 hover:border-blue-300'
              }`}
            >
              {monthShort}
              {year !== currentYear && (
                <span className="ml-1 text-xs opacity-70">
                  '{year.toString().slice(-2)}
                </span>
              )}
            </Button>
          );
        })}
      </div>

      {/* Botão Hoje */}
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
    </div>
  );
};
