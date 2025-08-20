
import React from 'react';
import { CreditCard, Calendar, CheckCircle, Clock } from 'lucide-react';
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {/* Total de Contas */}
      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">Total de Contas</p>
            <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {totalAccounts}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {formatCurrency(totalAmount)}
            </p>
          </div>
          <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
            <CreditCard className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Contas Pagas */}
      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">Contas Pagas</p>
            <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {paidAccounts}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {formatCurrency(paidAmount)}
            </p>
          </div>
          <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>

      {/* Contas Pendentes */}
      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">Contas Pendentes</p>
            <p className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              {pendingAccounts}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {formatCurrency(pendingAmount)}
            </p>
          </div>
          <div className="p-3 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl">
            <Clock className="h-6 w-6 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Vencendo Esta Semana */}
      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">Vencendo Esta Semana</p>
            <p className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
              {dueSoonAccounts}
            </p>
            <p className="text-sm text-slate-500 mt-1">Próximos 7 dias</p>
          </div>
          <div className="p-3 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-xl">
            <Calendar className="h-6 w-6 text-yellow-600" />
          </div>
        </div>
      </div>
    </div>
  );
};
