import React from 'react';
import { Account } from '@/contexts/AccountsContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatCurrency } from '@/utils/formatters';

interface ReportsListMobileProps {
  accounts: Account[];
}

export const ReportsListMobile: React.FC<ReportsListMobileProps> = ({ accounts }) => {
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

  // Agrupar contas por categoria e tipo
  const groupedAccounts = accounts.reduce((acc, account) => {
    const key = `${account.category}-${account.type}`;
    if (!acc[key]) {
      acc[key] = {
        category: account.category,
        type: account.type,
        accounts: []
      };
    }
    acc[key].accounts.push(account);
    return acc;
  }, {} as Record<string, { category: string; type: string; accounts: Account[] }>);

  // Ordenar grupos: primeiro receitas, depois despesas, e alfabeticamente por categoria
  const sortedGroups = Object.values(groupedAccounts).sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'receita' ? -1 : 1;
    }
    return a.category.localeCompare(b.category);
  });

  return (
    <ScrollArea className="h-[calc(100vh-520px)]">
      <div className="space-y-3 pr-2">
        {sortedGroups.map((group, groupIndex) => {
          const groupTotal = group.accounts.reduce((sum, acc) => sum + Math.abs(acc.amount), 0);
          const sortedAccounts = [...group.accounts].sort(
            (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          );

          return (
            <div key={`${group.category}-${group.type}-${groupIndex}`} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              {/* Cabeçalho do grupo */}
              <div className={`px-3 py-2 ${group.type === 'receita' ? 'bg-green-50 border-b border-green-200' : 'bg-red-50 border-b border-red-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{group.category}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${group.type === 'receita' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {group.type === 'receita' ? 'Receita' : 'Despesa'}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {group.accounts.length} {group.accounts.length === 1 ? 'item' : 'itens'}
                  </span>
                </div>
              </div>

              {/* Itens do grupo */}
              <div className="divide-y divide-slate-100">
                {sortedAccounts.map((account, index) => (
                  <div key={account.id} className="px-3 py-2">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h3 className="font-medium text-slate-900 text-xs line-clamp-2 flex-1">
                        <span className="inline-flex items-center justify-center w-4 h-4 bg-slate-200 text-slate-700 text-[10px] font-bold rounded-full mr-1">
                          {index + 1}
                        </span>
                        {account.description}
                      </h3>
                      <span className={`font-bold text-sm whitespace-nowrap ${getTypeColor(account.type)}`}>
                        {account.type === 'receita' ? '+' : '-'}{formatCurrency(Math.abs(account.amount))}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-500">
                      <span>Data: {formatDate(account.dueDate)}</span>
                      <div className="flex items-center gap-2">
                        {account.payment_source_name && (
                          <span>{account.payment_source_name}</span>
                        )}
                        <span className={`px-1.5 py-0.5 rounded-full border ${getStatusColor(account.status)}`}>
                          {getStatusLabel(account.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total do grupo */}
              <div className={`px-3 py-2 ${group.type === 'receita' ? 'bg-green-100' : 'bg-red-100'}`}>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-700">Total {group.category}:</span>
                  <span className={`text-sm font-bold ${getTypeColor(group.type)}`}>
                    {group.type === 'receita' ? '+' : '-'}{formatCurrency(groupTotal)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};
