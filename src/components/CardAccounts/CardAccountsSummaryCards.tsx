
import React from 'react';
import { CreditCard, Clock, CheckCircle, DollarSign } from 'lucide-react';

interface CardAccountsSummaryCardsProps {
  totalCardAccounts: number;
  pendingCardAccounts: number;
  paidCardAccounts: number;
  totalAmount: number;
}

export const CardAccountsSummaryCards: React.FC<CardAccountsSummaryCardsProps> = ({
  totalCardAccounts,
  pendingCardAccounts,
  paidCardAccounts,
  totalAmount
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total de Contas</p>
            <p className="text-2xl font-bold text-gray-900">{totalCardAccounts}</p>
          </div>
          <div className="p-2 bg-blue-100 rounded-lg">
            <CreditCard className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Contas Pendentes</p>
            <p className="text-2xl font-bold text-orange-600">{pendingCardAccounts}</p>
          </div>
          <div className="p-2 bg-orange-100 rounded-lg">
            <Clock className="h-6 w-6 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Contas Pagas</p>
            <p className="text-2xl font-bold text-green-600">{paidCardAccounts}</p>
          </div>
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Valor Total</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
          </div>
          <div className="p-2 bg-purple-100 rounded-lg">
            <DollarSign className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  );
};
