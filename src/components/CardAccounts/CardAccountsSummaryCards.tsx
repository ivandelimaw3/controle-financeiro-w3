
import React from 'react';
import { CreditCard, CheckCircle, Clock, Calendar } from 'lucide-react';
import { CardAccount } from '@/hooks/useCardAccounts';
import { formatCurrency } from '@/utils/formatters';

interface CardAccountsSummaryCardsProps {
  cardAccounts: CardAccount[];
  totalFound: number;
  dueDays: number;
  onDueDaysChange: (days: number) => void;
}

export const CardAccountsSummaryCards: React.FC<CardAccountsSummaryCardsProps> = ({
  cardAccounts,
  totalFound,
  dueDays,
  onDueDaysChange
}) => {
  // Cálculos dos totais
  const totalAmount = cardAccounts.reduce((sum, account) => sum + account.amount, 0);
  const paidAccounts = cardAccounts.filter(account => account.status === 'pago').length;
  const pendingAccounts = cardAccounts.filter(account => account.status === 'pendente').length;
  const paidAmount = cardAccounts
    .filter(account => account.status === 'pago')
    .reduce((sum, account) => sum + account.amount, 0);
  const pendingAmount = cardAccounts
    .filter(account => account.status === 'pendente')
    .reduce((sum, account) => sum + account.amount, 0);

  // Contas vencendo nos próximos X dias (configurável)
  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + dueDays);
  
  const dueSoonAccounts = cardAccounts.filter(account => {
    const dueDate = new Date(account.due_date);
    return dueDate >= today && dueDate <= futureDate && account.status === 'pendente';
  }).length;

  return (
    <div className="mb-6">
      {/* Total de contas encontradas */}
      <div className="mb-4">
        <p className="text-sm text-slate-600">
          {totalFound} {totalFound === 1 ? 'conta encontrada' : 'contas encontradas'}
        </p>
      </div>

      {/* Cards dos resumos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total de Contas */}
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CreditCard size={20} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-600">Total Geral</p>
              <p className="text-xl font-bold text-blue-600">
                {formatCurrency(totalAmount)}
              </p>
            </div>
          </div>
        </div>

        {/* Contas Pagas */}
        <div className="p-4 bg-green-50 rounded-xl border border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-600">Total Pago</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(paidAmount)}
              </p>
            </div>
          </div>
        </div>

        {/* Contas Pendentes */}
        <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock size={20} className="text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-600">Total Pendente</p>
               <p className="text-xl font-bold text-green-600">
                {formatCurrency(pendingAmount)}
              </p>
            </div>
          </div>
        </div>

       {/* Vencendo nos Próximos X Dias */}
        <div className="p-4 bg-red-50 rounded-xl border border-red-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Calendar size={20} className="text-red-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-slate-600">Vencendo em</p>
                <select
                  value={dueDays}
                  onChange={(e) => onDueDaysChange(Number(e.target.value))}
                  className="text-xs px-2 py-1 bg-white border border-red-200 rounded focus:outline-none focus:ring-2 focus:ring-red-300"
                >
                  <option value={3}>3 dias</option>
                  <option value={5}>5 dias</option>
                  <option value={7}>7 dias</option>
                  <option value={10}>10 dias</option>
                  <option value={15}>15 dias</option>
                  <option value={30}>30 dias</option>
                </select>
              </div>
              <p className="text-xl font-bold text-red-600 mt-1">
               {dueSoonAccounts}
              </p>
              <p className="text-xs text-slate-500 mt-1">Próximos {dueDays} dias</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
