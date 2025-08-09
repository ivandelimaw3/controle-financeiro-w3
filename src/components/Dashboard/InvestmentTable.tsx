
import React from 'react';
import { Edit, Trash2, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Investment, InvestmentInstitution, InvestmentType } from '@/hooks/useInvestmentsData';

interface InvestmentTableProps {
  investments: Investment[];
  institutions: InvestmentInstitution[];
  investmentTypes: InvestmentType[];
  onEdit: (investment: Investment) => void;
  onDelete: (id: number) => void;
}

export const InvestmentTable: React.FC<InvestmentTableProps> = ({
  investments,
  institutions,
  investmentTypes,
  onEdit,
  onDelete,
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const getCategoryLabel = (category: string) => {
    const categories: { [key: string]: string } = {
      'renda_fixa': 'Renda Fixa',
      'renda_variavel': 'Renda Variável', 
      'fundos': 'Fundos'
    };
    return categories[category] || category;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left p-4 font-semibold text-slate-700">Investimento</th>
              <th className="text-left p-4 font-semibold text-slate-700">Instituição</th>
              <th className="text-left p-4 font-semibold text-slate-700">Tipo</th>
              <th className="text-left p-4 font-semibold text-slate-700">Investido</th>
              <th className="text-left p-4 font-semibold text-slate-700">Valor Atual</th>
              <th className="text-left p-4 font-semibold text-slate-700">Rendimento</th>
              <th className="text-left p-4 font-semibold text-slate-700">Compra</th>
              <th className="text-left p-4 font-semibold text-slate-700">Vencimento</th>
              <th className="text-left p-4 font-semibold text-slate-700">Ações</th>
            </tr>
          </thead>
          <tbody>
            {investments.map((investment, index) => {
              const investedAmount = Number(investment.invested_amount);
              const currentValue = Number(investment.current_value);
              const gain = currentValue - investedAmount;
              const gainPercentage = investedAmount > 0 ? (gain / investedAmount) * 100 : 0;
              const isExpired = investment.maturity_date && new Date(investment.maturity_date) <= new Date();
              
              return (
                <tr 
                  key={investment.id} 
                  className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-slate-25'
                  } ${isExpired ? 'bg-orange-50 border-orange-200' : ''}`}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isExpired ? 'bg-orange-100' : 'bg-blue-100'
                      }`}>
                        <TrendingUp className={`h-5 w-5 ${
                          isExpired ? 'text-orange-600' : 'text-blue-600'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{investment.name}</p>
                        <p className="text-sm text-slate-500">{investment.investor_name || 'Sem investidor'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-slate-800">{investment.institution?.name}</span>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {investment.type?.name}
                    </Badge>
                    <p className="text-xs text-slate-500 mt-1">
                      {getCategoryLabel(investment.type?.category || '')}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-800">
                      {formatCurrency(investedAmount)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-800">
                      {formatCurrency(currentValue)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className={`font-semibold ${gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(Math.abs(gain))}
                      </span>
                      <span className={`text-sm ${gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {gainPercentage.toFixed(2)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600">
                    {formatDate(investment.purchase_date)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm">
                      {investment.maturity_date ? (
                        <span className={isExpired ? 'text-orange-600 font-medium' : 'text-slate-600'}>
                          {formatDate(investment.maturity_date)}
                          {isExpired && (
                            <Badge variant="destructive" className="ml-2 text-xs">
                              Vencida
                            </Badge>
                          )}
                        </span>
                      ) : (
                        <span className="text-slate-400">Sem vencimento</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(investment)}
                        className="text-slate-600 hover:text-slate-700"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(investment.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {investments.length === 0 && (
        <div className="p-8 text-center text-slate-500">
          <TrendingUp className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-lg font-medium text-slate-600 mb-2">
            Nenhum investimento encontrado
          </p>
          <p className="text-slate-500">
            Os investimentos aparecerão aqui quando adicionados.
          </p>
        </div>
      )}
    </div>
  );
};
