import React from 'react';
import { DollarSign, TrendingUp, Building2, CheckCircle } from 'lucide-react';
import { Investment } from '@/hooks/useInvestmentsData';
import { formatCurrency } from '@/utils/formatters';

interface InvestmentsSummaryCardsMobileProps {
  investments: Investment[];
}

export const InvestmentsSummaryCardsMobile: React.FC<InvestmentsSummaryCardsMobileProps> = ({
  investments
}) => {
  const totalInvested = investments.reduce((sum, inv) => sum + Number(inv.invested_amount), 0);
  const totalCurrent = investments.reduce((sum, inv) => sum + Number(inv.current_value), 0);
  const totalGain = totalCurrent - totalInvested;
  const gainPercentage = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;
  const totalInvestments = investments.length;

  return (
    <div className="flex flex-col gap-2">
      {/* Total Investido */}
      <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
        <div className="flex items-center gap-2">
          <DollarSign size={16} className="text-blue-600" />
          <span className="text-xs font-medium text-slate-600">Total Investido</span>
        </div>
        <span className="text-sm font-bold text-slate-800">{formatCurrency(totalInvested)}</span>
      </div>

      {/* Valor Atual */}
      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-green-600" />
          <span className="text-xs font-medium text-slate-600">Valor Atual</span>
        </div>
        <span className="text-sm font-bold text-slate-800">{formatCurrency(totalCurrent)}</span>
      </div>

      {/* Rendimentos */}
      <div className={`flex items-center justify-between rounded-lg px-3 py-2 ${
        totalGain >= 0 
          ? 'bg-emerald-50 border border-emerald-200' 
          : 'bg-red-50 border border-red-200'
      }`}>
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className={totalGain >= 0 ? 'text-emerald-600' : 'text-red-600'} />
          <span className="text-xs font-medium text-slate-600">Rendimentos</span>
        </div>
        <span className={`text-sm font-bold ${totalGain >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          {formatCurrency(totalGain)}
        </span>
      </div>

      {/* Investimentos */}
      <div className="flex items-center justify-between bg-purple-50 border border-purple-200 rounded-lg px-3 py-2">
        <div className="flex items-center gap-2">
          <Building2 size={16} className="text-purple-600" />
          <span className="text-xs font-medium text-slate-600">Investimentos</span>
        </div>
        <span className="text-sm font-bold text-slate-800">{totalInvestments}</span>
      </div>

      {/* Rentabilidade */}
      <div className={`flex items-center justify-between rounded-lg px-3 py-2 ${
        gainPercentage >= 0 
          ? 'bg-emerald-50 border border-emerald-200' 
          : 'bg-red-50 border border-red-200'
      }`}>
        <div className="flex items-center gap-2">
          <CheckCircle size={16} className={gainPercentage >= 0 ? 'text-emerald-600' : 'text-red-600'} />
          <span className="text-xs font-medium text-slate-600">Rentabilidade</span>
        </div>
        <span className={`text-sm font-bold ${gainPercentage >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          {gainPercentage.toFixed(2)}%
        </span>
      </div>
    </div>
  );
};
