import React from 'react';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DetailedReportNavigatorProps {
  onBackToAccounts: () => void;
}

export const DetailedReportNavigator: React.FC<DetailedReportNavigatorProps> = ({
  onBackToAccounts
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="text-left flex items-center gap-3">
          <Button
            onClick={onBackToAccounts}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 h-9 px-3 rounded-lg hover:bg-slate-100 border-slate-300"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Voltar</span>
          </Button>
          <div className="p-2 bg-purple-50 rounded-lg">
            <FileText className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-1">Relatório Detalhado por Categorias</h1>
            <p className="text-sm text-slate-600">Análise detalhada de receitas e despesas por categoria</p>
          </div>
        </div>
      </div>
    </div>
  );
};
