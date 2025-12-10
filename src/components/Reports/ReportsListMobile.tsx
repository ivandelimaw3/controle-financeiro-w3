import React, { useMemo } from 'react';
import { Account } from '@/contexts/AccountsContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatCurrency } from '@/utils/formatters';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface ReportsListMobileProps {
  accounts: Account[];
}

interface CategoryGroup {
  category: string;
  accounts: Account[];
  totalReceitas: number;
  totalDespesas: number;
}

export const ReportsListMobile: React.FC<ReportsListMobileProps> = ({ accounts }) => {
  const [expandedCategories, setExpandedCategories] = React.useState<Set<string>>(new Set());

  const groupedByCategory = useMemo(() => {
    const groups: Record<string, CategoryGroup> = {};
    
    const sortedAccounts = [...accounts].sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );

    sortedAccounts.forEach(account => {
      const category = account.category || 'Sem Categoria';
      if (!groups[category]) {
        groups[category] = {
          category,
          accounts: [],
          totalReceitas: 0,
          totalDespesas: 0
        };
      }
      groups[category].accounts.push(account);
      if (account.type === 'receita') {
        groups[category].totalReceitas += Math.abs(account.amount);
      } else {
        groups[category].totalDespesas += Math.abs(account.amount);
      }
    });

    return Object.values(groups).sort((a, b) => a.category.localeCompare(b.category));
  }, [accounts]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'recebido':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'receita' ? 'text-green-600' : 'text-red-600';
  };

  const getStatusLabel = (status: string) => {
    if (status === 'pago') return 'Pago';
    if (status === 'recebido') return 'Recebido';
    return 'Pendente';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  };

  if (accounts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500 text-sm">Nenhuma conta encontrada</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-520px)]">
      <div className="space-y-3 pr-2">
        {groupedByCategory.map((group) => {
          const isExpanded = expandedCategories.has(group.category);
          const saldoCategoria = group.totalReceitas - group.totalDespesas;
          
          return (
            <div key={group.category} className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(group.category)}
                className="w-full px-3 py-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown size={18} className="text-slate-500" />
                  ) : (
                    <ChevronRight size={18} className="text-slate-500" />
                  )}
                  <span className="font-semibold text-slate-800 text-sm">{group.category}</span>
                  <span className="text-xs text-slate-500">({group.accounts.length})</span>
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  <div className="flex gap-3 text-xs">
                    {group.totalReceitas > 0 && (
                      <span className="text-green-600 font-medium">
                        +{formatCurrency(group.totalReceitas)}
                      </span>
                    )}
                    {group.totalDespesas > 0 && (
                      <span className="text-red-600 font-medium">
                        -{formatCurrency(group.totalDespesas)}
                      </span>
                    )}
                  </div>
                  <span className={`text-xs font-bold ${saldoCategoria >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    Saldo: {formatCurrency(saldoCategoria)}
                  </span>
                </div>
              </button>

              {/* Expanded Accounts */}
              {isExpanded && (
                <div className="bg-white">
                  {/* Receitas Section */}
                  {group.accounts.filter(a => a.type === 'receita').length > 0 && (
                    <div className="border-b border-slate-100">
                      <div className="px-3 py-1.5 bg-green-50 border-b border-green-100">
                        <span className="text-xs font-semibold text-green-700">Receitas</span>
                      </div>
                      {group.accounts
                        .filter(a => a.type === 'receita')
                        .map((account, index) => (
                          <div key={account.id} className="px-3 py-2 border-b border-slate-50">
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="font-medium text-slate-800 text-xs line-clamp-2 flex-1">
                                <span className="inline-flex items-center justify-center w-4 h-4 bg-green-100 text-green-700 text-[10px] font-bold rounded-full mr-1.5">
                                  {index + 1}
                                </span>
                                {account.description}
                              </h4>
                              <span className="font-bold text-sm whitespace-nowrap text-green-600">
                                +{formatCurrency(Math.abs(account.amount))}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1 ml-5">
                              <div className="flex items-center gap-2">
                                <span>{formatDate(account.dueDate)}</span>
                                <span className={`px-1.5 py-0.5 rounded-full border ${getStatusColor(account.status)}`}>
                                  {getStatusLabel(account.status)}
                                </span>
                              </div>
                              {account.payment_source_name && (
                                <span className="text-slate-400">{account.payment_source_name}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      <div className="px-3 py-1.5 bg-green-50 flex justify-between">
                        <span className="text-xs font-semibold text-green-700">Total Receitas:</span>
                        <span className="text-xs font-bold text-green-700">+{formatCurrency(group.totalReceitas)}</span>
                      </div>
                    </div>
                  )}

                  {/* Despesas Section */}
                  {group.accounts.filter(a => a.type === 'despesa').length > 0 && (
                    <div>
                      <div className="px-3 py-1.5 bg-red-50 border-b border-red-100">
                        <span className="text-xs font-semibold text-red-700">Despesas</span>
                      </div>
                      {group.accounts
                        .filter(a => a.type === 'despesa')
                        .map((account, index) => (
                          <div key={account.id} className="px-3 py-2 border-b border-slate-50">
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="font-medium text-slate-800 text-xs line-clamp-2 flex-1">
                                <span className="inline-flex items-center justify-center w-4 h-4 bg-red-100 text-red-700 text-[10px] font-bold rounded-full mr-1.5">
                                  {index + 1}
                                </span>
                                {account.description}
                              </h4>
                              <span className="font-bold text-sm whitespace-nowrap text-red-600">
                                -{formatCurrency(Math.abs(account.amount))}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1 ml-5">
                              <div className="flex items-center gap-2">
                                <span>{formatDate(account.dueDate)}</span>
                                <span className={`px-1.5 py-0.5 rounded-full border ${getStatusColor(account.status)}`}>
                                  {getStatusLabel(account.status)}
                                </span>
                              </div>
                              {account.payment_source_name && (
                                <span className="text-slate-400">{account.payment_source_name}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      <div className="px-3 py-1.5 bg-red-50 flex justify-between">
                        <span className="text-xs font-semibold text-red-700">Total Despesas:</span>
                        <span className="text-xs font-bold text-red-700">-{formatCurrency(group.totalDespesas)}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};
