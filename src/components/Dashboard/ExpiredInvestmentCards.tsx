
import React from 'react';
import { AlertTriangle, Calendar, Building2, TrendingUp, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ExpiredInvestment {
  id: number;
  name: string;
  invested_amount: number;
  current_value: number;
  maturity_date: string | null;
  investor_name?: string | null;
  institution?: { name: string };
  type?: { name: string };
}

interface ExpiredInvestmentCardsProps {
  expiredInvestments: ExpiredInvestment[];
}

export const ExpiredInvestmentCards: React.FC<ExpiredInvestmentCardsProps> = ({
  expiredInvestments
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString + 'T00:00:00');
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    } catch (error) {
      return dateString;
    }
  };

  if (expiredInvestments.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-orange-100 rounded-full">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-orange-800">
            {expiredInvestments.length} Aplicação{expiredInvestments.length > 1 ? 'ões' : ''} Vencida{expiredInvestments.length > 1 ? 's' : ''}
          </h3>
          <p className="text-sm text-orange-700">
            Aplicações que já atingiram sua data de vencimento
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {expiredInvestments.map((investment) => {
          const investedAmount = Number(investment.invested_amount);
          const currentValue = Number(investment.current_value);
          const gain = currentValue - investedAmount;
          const gainPercentage = investedAmount > 0 ? (gain / investedAmount) * 100 : 0;
          const isPositive = gain >= 0;
          
          return (
            <div key={investment.id} className="bg-white border border-orange-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-800 text-sm truncate" title={investment.name}>
                    {investment.name}
                  </h4>
                  {investment.investor_name && (
                    <p className="text-xs text-slate-600 mt-1">{investment.investor_name}</p>
                  )}
                </div>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs flex-shrink-0 ml-2">
                  Vencida
                </Badge>
              </div>
              
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <Building2 size={12} className="text-slate-400" />
                  <span className="text-slate-600 truncate">{investment.institution?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={12} className="text-orange-500" />
                  <span className="text-orange-600 font-medium">
                    {formatDate(investment.maturity_date!)}
                  </span>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-slate-500">Valor Atual</p>
                    <p className="font-bold text-sm text-slate-800">{formatCurrency(currentValue)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Rendimento</p>
                    <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      <span>{gainPercentage.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
