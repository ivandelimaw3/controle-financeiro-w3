import React from 'react';
import { Clock, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Account } from '@/contexts/AccountsContext';
import { PreviousBalanceCard } from './PreviousBalanceCard';

interface AccountsSummaryCardsProps {
  accounts: Account[];
  previousBalance: number; // valor do saldo anterior
  onUpdatePreviousBalance: (month: number, year: number, value: number) => Promise<void>;
  getPreviousMonthBalance: (month: number, year: number) => number;
  calculateMonthFinalBalance: (month: number, year: number) => number;
  month: number;
  year: number;
}

export const AccountsSummaryCards: React.FC<AccountsSummaryCardsProps> = ({
  accounts,
  previousBalance,
  onUpdatePreviousBalance,
  getPreviousMonthBalance,
  calculateMonthFinalBalance,
  month,
  year,
}) => {
  // fallback se não vier mês/ano
  const today = new Date();
  const currentMonth = month ?? today.getMonth() + 1;
  const currentYear = year ?? today.getFullYear();

  // formatação
  const formatCurrency = (value: number): string =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

  // filtrar contas do mês atual
  const getCurrentMonthAccounts = () => {
    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0);

    return accounts.filter((account) => {
      const accountDate = new Date(account.dueDate);
      return (
        accountDate >= startDate &&
        accountDate <= endDate &&
        !(account.category === 'Saldo Inicial' && account.type === 'receita')
      );
    });
  };

  const monthAccounts = getCurrentMonthAccounts();

  const calculateTotalPago = () =>
    monthAccounts
      .filter((a) => a.type === 'despesa' && a.status === 'pago')
      .reduce((sum, a) => sum + Math.abs(a.amount), 0);

  const calculateTotalRecebido = () =>
    monthAccounts
      .filter((a) => a.type === 'receita' && a.status === 'recebido')
      .reduce((sum, a) => sum + a.amount, 0);

  const calculateSaldoFinal = () =>
    calculateMonthFinalBalance(currentMonth, currentYear);

  const calculateTotalPendente = () => {
    const receitasPendentes = monthAccounts
      .filter((a) => a.type === 'receita' && a.status === 'pendente')
      .reduce((sum, a) => sum + a.amount, 0);
    const despesasPendentes = monthAccounts
      .filter((a) => a.type === 'despesa' && a.status === 'pendente')
      .reduce((sum, a) => sum + Math.abs(a.amount), 0);
    return receitasPendentes - despesasPendentes;
  };

  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Saldo Mês Anterior */}
      <PreviousBalanceCard
        accounts={accounts}
        month={currentMonth}
        year={currentYear}
        onUpdateBalance={onUpdatePreviousBalance}
        getPreviousMonthBalance={getPreviousMonthBalance}
      />

      {/* Total Recebido */}
      <div className="p-4 bg-green-50 rounded-xl border border-green-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <TrendingUp size={20} className="text-green-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-600">Total Recebido</p>
            <p className="text-xl font-bold text-green-600">
              {formatCurrency(calculateTotalRecebido())}
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
              {formatCurrency(calculateTotalPago())}
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
            <p
              className={`text-xl font-bold ${
                calculateSaldoFinal() >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatCurrency(calculateSaldoFinal())}
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
            <p
              className={`text-xl font-bold ${
                calculateTotalPendente() >= 0
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {formatCurrency(calculateTotalPendente())}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
