
import React from 'react';
import { CreditCard, CheckCircle, Clock, Calendar } from 'lucide-react';
import { CardAccount } from '@/hooks/useCardAccounts';
import { formatCurrency } from '@/utils/formatters';

interface CardAccountsSummaryCardsProps {
  cardAccounts: CardAccount[];
}

export const CardAccountsSummaryCards: React.FC<CardAccountsSummaryCardsProps> = ({
  cardAccounts
}) => {
  // Cálculos dos totais
  const totalAccounts = cardAccounts.length;
  const totalAmount = cardAccounts.reduce((sum, account) => sum + account.amount, 0);
  const paidAccounts = cardAccounts.filter(account => account.status === 'pago').length;
  const pendingAccounts = cardAccounts.filter(account => account.status === 'pendente').length;
  const paidAmount = cardAccounts
    .filter(account => account.status === 'pago')
    .reduce((sum, account) => sum + account.amount, 0);
  const pendingAmount = cardAccounts
    .filter(account => account.status === 'pendente')
    .reduce((sum, account) => sum + account.amount, 0);

  // Contas vencendo nos próximos 7 dias
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  
  const dueSoonAccounts = cardAccounts.filter(account => {
    const dueDate = new Date(account.due_date);
    return dueDate >= today && dueDate <= nextWeek && account.status === 'pendente';
  }).length;

  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total de Contas */}
      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <CreditCard size={20} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-600">Total de Contas</p>
            <p className="text-xl font-bold text-blue-600">
              {totalAccounts}
            </p>
            <p className="text-xl font-bold text-blue-600 mt-1">
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
            <p className="text-sm text-slate-600">Contas Pagas</p>
            <p className="text-xl font-bold text-green-600">
              {paidAccounts}
            </p>
            <p className="text-xl font-bold text-green-600 mt-1">
              {formatCurrency(paidAmount)}
            </p>
          </div>
        </div>
      </div>

      {/* Contas Pendentes */}
      <div className="p-4 bg-red-50 rounded-xl border border-red-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <Clock size={20} className="text-red-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-600">Contas Pendentes</p>
            <p className="text-xl font-bold text-red-600">
              {pendingAccounts}
            </p>
            <p className="text-xl font-bold text-red-600 mt-1">
              {formatCurrency(pendingAmount)}
            </p>
          </div>
        </div>
      </div>

      {/* Vencendo Esta Semana */}
      <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Calendar size={20} className="text-yellow-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-600">Vencendo Esta Semana</p>
            <p className="text-xl font-bold text-yellow-600">
              {dueSoonAccounts}
            </p>
            <p className="text-sm text-slate-500 mt-1">Próximos 7 dias</p>
          </div>
        </div>
      </div>
    </div>
  );
};
