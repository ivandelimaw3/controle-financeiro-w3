import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatCurrency } from '@/utils/formatters';
import { CardAccount } from '@/hooks/useCardAccounts';

interface CardAccountsListMobileProps {
  cardAccounts: CardAccount[];
  onEdit?: (account: CardAccount) => void;
}

export const CardAccountsListMobile: React.FC<CardAccountsListMobileProps> = ({ cardAccounts, onEdit }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    if (status === 'pago') return 'Pago';
    return 'Pendente';
  };

  if (cardAccounts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500 text-sm">Nenhuma conta encontrada</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-480px)]">
      <div className="space-y-2 pr-4">
        {cardAccounts.map((account) => (
          <div
            key={account.id}
            onClick={() => onEdit?.(account)}
            className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm cursor-pointer hover:bg-slate-50 active:bg-slate-100 transition-colors"
          >
            <div className="flex justify-between items-start gap-2 mb-2">
              <h3 className="font-medium text-slate-900 text-sm line-clamp-2 flex-1">
                {account.description}
              </h3>
              <span className="font-bold text-base whitespace-nowrap text-red-600">
                {formatCurrency(Math.abs(account.amount))}
              </span>
            </div>
            <div className="flex justify-between items-center gap-2 text-xs text-slate-500 mb-2">
              <span>{account.card_name || 'Sem cartão'}</span>
              <span>{account.category_name || 'Sem categoria'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(account.status)}`}>
                {getStatusLabel(account.status)}
              </span>
              <span className="text-xs text-slate-500">
                Venc: {new Date(account.due_date).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
