import React from 'react';
import { ChevronLeft, ChevronRight, FileSearch, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReportsMonthNavigatorProps {
  currentYear: number;
  onYearChange: (year: number) => void;
  onBackToAccounts: () => void;
}

export const ReportsMonthNavigator: React.FC<ReportsMonthNavigatorProps> = ({
  currentYear,
  onYearChange,
  onBackToAccounts
}) => {
  const navigateYear = (direction: 'prev' | 'next') => {
    const newYear = direction === 'prev' ? currentYear - 1 : currentYear + 1;
    onYearChange(newYear);
  };

  return (
    <div className="mb-6 space-y-4">
      <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="text-left flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <FileSearch className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-1">Resumo Financeiro Anual</h1>
            <p className="text-sm text-slate-600">Resumo da sua situação financeira dos Últimos 12 Meses</p>
          </div>
        </div>
        
        <Button
          onClick={onBackToAccounts}
          variant="outline"
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 border-slate-300 hover:border-slate-400 transition-all duration-200"
        >
          <ArrowLeft size={16} />
          Voltar para Contas
        </Button>
      </div>

      <div className="flex items-center justify-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-slate-200">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateYear('prev')}
          className="h-8 w-8 p-0 rounded-full hover:bg-blue-50 hover:border-blue-300"
        >
          <ChevronLeft size={16} />
        </Button>

        <div className="text-xl font-bold text-slate-800 min-w-[180px] text-center">
          {currentYear}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateYear('next')}
          className="h-8 w-8 p-0 rounded-full hover:bg-blue-50 hover:border-blue-300"
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
};