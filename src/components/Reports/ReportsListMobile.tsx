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

  return (
    <ScrollArea className="h-[calc(100vh-520px)]">
      <div className="space-y-2 pr-2">
        {[...accounts]
          .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
          .map((account, index) => (
          <div
            key={account.id}
            className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm"
          >
            <div className="flex justify-between items-start gap-2 mb-2">
              <h3 className="font-medium text-slate-900 text-sm line-clamp-2 flex-1">
                <span className="inline-flex items-center justify-center w-5 h-5 bg-slate-200 text-slate-700 text-xs font-bold rounded-full mr-2">
                  {index + 1}
                </span>
                {account.description}
              </h3>
              <span className={`font-bold text-base whitespace-nowrap ${getTypeColor(account.type)}`}>
                {account.type === 'receita' ? '+' : '-'}{formatCurrency(Math.abs(account.amount))}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
              <span>Data: {formatDate(account.dueDate)}</span>
              <span>{account.category}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(account.status)}`}>
                {getStatusLabel(account.status)}
              </span>
              {account.payment_source_name && (
                <span className="text-xs text-slate-500">{account.payment_source_name}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
