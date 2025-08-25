import React, { useMemo } from 'react';
import { Clock, TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { Account } from '@/contexts/AccountsContext';

interface AccountsSummaryCardsProps {
  allAccounts: Account[];
  filteredAccounts: Account[];
  monthFilter: string;
  yearFilter: string;
}

export const AccountsSummaryCards: React.FC<AccountsSummaryCardsProps> = ({ allAccounts, filteredAccounts, monthFilter, yearFilter }) => {
  // Função para formatar valores em reais brasileiros
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const totalPago = useMemo(() => {
    return filteredAccounts
      .filter(account => account.type === 'despesa' && account.status === 'pago')
      .reduce((sum, account) => sum + Math.abs(account.amount), 0);
  }, [filteredAccounts]);

  const totalRecebido = useMemo(() => {
    return filteredAccounts
      .filter(account => account.type === 'receita' && account.status === 'recebido')
      .reduce((sum, account) => sum + account.amount, 0);
  }, [filteredAccounts]);

  const saldoFinal = useMemo(() => {
    return totalRecebido - totalPago;
  }, [totalRecebido, totalPago]);

  const totalPendente = useMemo(() => {
    const receitasPendentes = filteredAccounts
      .filter(account => account.type === 'receita' && account.status === 'pendente')
      .reduce((sum, account) => sum + account.amount, 0);
    const despesasPendentes = filteredAccounts
      .filter(account => account.type === 'despesa' && account.status === 'pendente')
      .reduce((sum, account) => sum + Math.abs(account.amount), 0);
    return receitasPendentes - despesasPendentes;
  }, [filteredAccounts]);

  const previousMonthBalance = useMemo(() => {
    if (monthFilter === 'todos' || yearFilter === 'todos') {
      return 0;
    }

    const currentMonth = parseInt(monthFilter, 10);
    const currentYear = parseInt(yearFilter, 10);

    // Encontra a primeira conta que corresponde ao mês e ano selecionados
    const accountForCurrentMonth = allAccounts.find(account => {
      // Adiciona 'T12:00:00' para evitar problemas de fuso horário que podem mudar o dia
      const accountDate = new Date(account.dueDate + 'T12:00:00');
      return accountDate.getMonth() === currentMonth && accountDate.getFullYear() === currentYear;
    });

    // Retorna o saldo_anterior dessa conta, ou 0 se não encontrar ou se o valor for nulo.
    return accountForCurrentMonth?.saldo_anterior ?? 0;
  }, [allAccounts, monthFilter, yearFilter]);

  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Total Recebido */}
      <div className="p-4 bg-green-50 rounded-xl border border-green-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <TrendingUp size={20} className="text-green-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-600">Total Recebido</p>
            <p className="text-xl font-bold text-green-600">
              {formatCurrency(totalRecebido)}
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
              {formatCurrency(totalPago)}
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
            <p className={`text-xl font-bold ${saldoFinal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(saldoFinal)}
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
            <p className={`text-xl font-bold ${totalPendente >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalPendente)}
            </p>
          </div>
        </div>
      </div>

      {/* Saldo Mês Anterior */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 rounded-lg">
            <Calendar size={20} className="text-slate-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-600">Saldo Mês Anterior</p>
            <p className={`text-xl font-bold ${previousMonthBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(previousMonthBalance)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
