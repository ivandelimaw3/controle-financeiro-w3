
import React from 'react';
import { ChevronLeft, ChevronRight, Calendar, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MonthNavigatorProps {
  currentMonth: number; // 1-12 (Janeiro = 1)
  currentYear: number;
  onMonthChange: (startDate: Date, endDate: Date, month: number, year: number) => void;
  onShowAll: () => void;
  isShowingAll: boolean;
}

export const MonthNavigator: React.FC<MonthNavigatorProps> = ({
  currentMonth,
  currentYear,
  onMonthChange,
  onShowAll,
  isShowingAll
}) => {
  const today = new Date();
  const todayMonth = today.getMonth() + 1; // getMonth() retorna 0-11, precisamos 1-12
  const todayYear = today.getFullYear();

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const getMonthStartEnd = (month: number, year: number) => {
    // month vem como 1-12, mas Date precisa de 0-11
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Último dia do mês
    return { startDate, endDate };
  };

  const handleMonthChange = (month: number, year: number) => {
    const { startDate, endDate } = getMonthStartEnd(month, year);
    onMonthChange(startDate, endDate, month, year);
  };

  const handleNavigation = (direction: 'prev' | 'next') => {
    let newMonth = currentMonth;
    let newYear = currentYear;

    if (direction === 'prev') {
      newMonth = currentMonth - 1;
      if (newMonth < 1) {
        newMonth = 12;
        newYear = currentYear - 1;
      }
    } else {
      newMonth = currentMonth + 1;
      if (newMonth > 12) {
        newMonth = 1;
        newYear = currentYear + 1;
      }
    }

    handleMonthChange(newMonth, newYear);
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200 mb-6">
      {/* Navegação Principal */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleNavigation('prev')}
          className="h-9 px-3 bg-white hover:bg-blue-50 border-blue-200"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="text-lg font-semibold text-slate-800">
          {currentYear}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handleNavigation('next')}
          className="h-9 px-3 bg-white hover:bg-blue-50 border-blue-200"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Controles Centrais */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleMonthChange(todayMonth, todayYear)}
          className="h-8 px-3 bg-white hover:bg-blue-50 border-blue-200 text-xs"
        >
          <Calendar className="h-3 w-3 mr-1" />
          Hoje
        </Button>

        <div className="text-xl font-bold text-blue-700">
          {isShowingAll ? 'Todos os Meses' : monthNames[currentMonth - 1]}
        </div>

        <Button
          variant={isShowingAll ? "default" : "outline"}
          size="sm"
          onClick={onShowAll}
          className={`h-8 px-3 text-xs ${
            isShowingAll 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-white hover:bg-blue-50 border-blue-200'
          }`}
        >
          <List className="h-3 w-3 mr-1" />
          Todos
        </Button>
      </div>

      {/* Botões dos meses (Janeiro a Dezembro) */}
      <div className="flex flex-wrap items-center gap-2">
        {monthNames.map((monthName, index) => {
          const monthNumber = index + 1; // Converter índice 0-11 para 1-12
          const isActive = monthNumber === currentMonth && !isShowingAll;
          const monthShort = monthName.substring(0, 3);
          
          return (
            <Button
              key={monthNumber}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => handleMonthChange(monthNumber, currentYear)}
              className={`h-8 px-3 text-xs rounded-full transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-white hover:bg-blue-50 border-blue-200 text-slate-600'
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
