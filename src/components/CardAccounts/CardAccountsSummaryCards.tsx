
import React from 'react';
import { CreditCard, Calendar, CheckCircle, Clock } from 'lucide-react';
import { CardAccount } from '@/hooks/useCardAccounts';

interface CardAccountsSummaryCardsProps {
  cardAccounts: CardAccount[];
}

export const CardAccountsSummaryCards: React.FC<CardAccountsSummaryCardsProps> = ({
  cardAccounts
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

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
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total de Contas</p>
            <p className="text-2xl font-bold text-gray-900">{totalAccounts}</p>
            <p className="text-sm text-gray-500 mt-1">
              {formatCurrency(totalAmount)}
            </p>
          </div>
          <div className="p-2 bg-blue-100 rounded-lg">
            <CreditCard className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Contas Pagas */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Contas Pagas</p>
            <p className="text-2xl font-bold text-green-600">{paidAccounts}</p>
            <p className="text-sm text-gray-500 mt-1">
              {formatCurrency(paidAmount)}
            </p>
          </div>
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>

      {/* Contas Pendentes */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Contas Pendentes</p>
            <p className="text-2xl font-bold text-orange-600">{pendingAccounts}</p>
            <p className="text-sm text-gray-500 mt-1">
              {formatCurrency(pendingAmount)}
            </p>
          </div>
          <div className="p-2 bg-orange-100 rounded-lg">
            <Clock className="h-6 w-6 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Vencendo Esta Semana */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Vencendo Esta Semana</p>
            <p className="text-2xl font-bold text-yellow-600">{dueSoonAccounts}</p>
            <p className="text-sm text-gray-500 mt-1">Próximos 7 dias</p>
          </div>
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Calendar className="h-6 w-6 text-yellow-600" />
          </div>
        </div>
      </div>
    </div>
  );
};
