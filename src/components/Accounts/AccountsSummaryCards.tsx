
import React from 'react';
import { Clock, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Account } from '@/contexts/AccountsContext';

interface AccountsSummaryCardsProps {
  accounts: Account[];
  previousBalance?: number;
}

export const AccountsSummaryCards: React.FC<AccountsSummaryCardsProps> = ({ accounts, previousBalance = 0 }) => {
  const formatCurrency = (value: number): string =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  // Separar contas do mês (excluindo Saldo Anterior)
  const monthAccounts = accounts.filter(acc => 
    acc.description !== 'Saldo Anterior' && 
    !acc.description.toLowerCase().includes('saldo anterior')
  );

  // Calcular totais do mês atual
  const totalRecebido = monthAccounts
    .filter(a => a.type === 'receita' && a.status === 'recebido')
    .reduce((sum, a) => sum + (a.amount || 0), 0);

  const totalPago = monthAccounts
    .filter(a => a.type === 'despesa' && a.status === 'pago')
    .reduce((sum, a) => sum + Math.abs(a.amount || 0), 0);

  // Calcular pendentes do mês
  const receitasPendentes = monthAccounts
    .filter(a => a.type === 'receita' && a.status === 'pendente')
    .reduce((sum, a) => sum + (a.amount || 0), 0);

  const despesasPendentes = monthAccounts
    .filter(a => a.type === 'despesa' && a.status === 'pendente')
    .reduce((sum, a) => sum + Math.abs(a.amount || 0), 0);

  const saldoPendente = receitasPendentes - despesasPendentes;

  // Saldo Final = Saldo Anterior + Total Recebido - Total Pago
  const saldoFinal = previousBalance + totalRecebido - totalPago;

  // Saldo Final com Pendentes = Saldo Final + Saldo Pendente
  const saldoFinalComPendentes = saldoFinal + saldoPendente;

  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Valor Saldo Anterior */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 rounded-lg">
            <DollarSign size={20} className="text-slate-700" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-600">Valor Saldo Anterior</p>
            <p className={`text-xl font-bold ${previousBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(previousBalance)}
            </p>
          </div>
        </div>
      </div>

      {/* Total Recebido */}
      <div className="p-4 bg-green-50 rounded-xl border border-green-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <TrendingUp size={20} className="text-green-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-600">Total Recebido</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(totalRecebido)}</p>
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
            <p className="text-xl font-bold text-red-600">{formatCurrency(totalPago)}</p>
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
            <p className="text-xs text-slate-500 mt-1">
              Com pendentes: {formatCurrency(saldoFinalComPendentes)}
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
            <p className={`text-xl font-bold ${saldoPendente >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(saldoPendente)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              R: {formatCurrency(receitasPendentes)} | D: {formatCurrency(despesasPendentes)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
