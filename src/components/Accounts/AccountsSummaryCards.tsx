
import React from 'react';
import { Clock, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Account } from '@/contexts/AccountsContext';

interface AccountsSummaryCardsProps {
  accounts: Account[];
}

export const AccountsSummaryCards: React.FC<AccountsSummaryCardsProps> = ({ accounts }) => {
  // Função para formatar valores com vírgula
  const formatCurrency = (value: number): string => {
    return value.toFixed(2).replace('.', ',');
  };

  const calculateTotalPago = () => {
    return accounts
      .filter(account => account.type === 'despesa' && account.status === 'pago')
      .reduce((sum, account) => sum + Math.abs(account.amount), 0);
  };

  const calculateTotalRecebido = () => {
    return accounts
      .filter(account => account.type === 'receita' && account.status === 'recebido')
      .reduce((sum, account) => sum + account.amount, 0);
  };

  const calculateSaldoFinal = () => {
    return calculateTotalRecebido() - calculateTotalPago();
  };

  const calculateTotalPendente = () => {
    const receitasPendentes = accounts
      .filter(account => account.type === 'receita' && account.status === 'pendente')
      .reduce((sum, account) => sum + account.amount, 0);
    const despesasPendentes = accounts
      .filter(account => account.type === 'despesa' && account.status === 'pendente')
      .reduce((sum, account) => sum + Math.abs(account.amount), 0);
    return receitasPendentes - despesasPendentes;
  };

  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Recebido */}
      <div className="p-4 bg-green-50 rounded-xl border border-green-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <TrendingUp size={20} className="text-green-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-600">Total Recebido</p>
            <p className="text-xl font-bold text-green-600">
              R$ {formatCurrency(calculateTotalRecebido())}
            </p>
          </div>
        </div>
      </div>

      {/* Total Pago */}
      <div className="p-4 bg-red-50 rounded-xl border border-red-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <TrendingDown size={20} className="text-red-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-600">Total Pago</p>
            <p className="text-xl font-bold text-red-600">
              R$ {formatCurrency(calculateTotalPago())}
            </p>
          </div>
        </div>
      </div>

      {/* Saldo Final */}
      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <DollarSign size={20} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-600">Saldo Final</p>
            <p className={`text-xl font-bold ${calculateSaldoFinal() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {formatCurrency(calculateSaldoFinal())}
            </p>
          </div>
        </div>
      </div>

      {/* Saldo Pendente */}
      <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Clock size={20} className="text-yellow-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-600">Saldo Pendente</p>
            <p className={`text-xl font-bold ${calculateTotalPendente() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {formatCurrency(calculateTotalPendente())}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
