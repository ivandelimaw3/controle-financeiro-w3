
import React from 'react';
import { Clock, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Account } from '@/contexts/AccountsContext';
import { PreviousBalanceCard } from './PreviousBalanceCard';
import { formatCurrency } from '@/utils/formatters';

interface AccountsSummaryCardsProps {
  accounts: Account[];
  month?: number;
  year?: number;
  onUpdateBalance?: (amount: number, month: number, year: number) => Promise<void>;
  getPreviousMonthBalance?: (month: number, year: number) => number;
}

export const AccountsSummaryCards: React.FC<AccountsSummaryCardsProps> = ({ 
  accounts, 
  month, 
  year, 
  onUpdateBalance, 
  getPreviousMonthBalance 
}) => {
  
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
    const totalRecebido = calculateTotalRecebido();
    const totalPago = calculateTotalPago();
    
    // Incluir o saldo anterior no cálculo
    if (getPreviousMonthBalance && month !== undefined && year !== undefined) {
      const saldoAnterior = getPreviousMonthBalance(month, year);
      const saldoFinal = saldoAnterior + totalRecebido - totalPago;
      console.log(`Calculando Saldo Final: ${saldoAnterior} + ${totalRecebido} - ${totalPago} = ${saldoFinal}`);
      return saldoFinal;
    }
    
    // Fallback para cálculo sem saldo anterior
    return totalRecebido - totalPago;
  };

  const calculateTotalPendente = () => {
    const receitasPendentes = accounts
      .filter(account => account.type === 'receita' && account.status === 'pendente')
      .reduce((sum, account) => sum + account.amount, 0);
    const despesasPendentes = accounts
      .filter(account => account.type === 'despesa' && account.status === 'pendente')
      .reduce((sum, account) => sum + Math.abs(account.amount), 0);
    
    // Para o saldo pendente, também incluir o saldo anterior se disponível
    if (getPreviousMonthBalance && month !== undefined && year !== undefined) {
      const saldoAnterior = getPreviousMonthBalance(month, year);
      return saldoAnterior + receitasPendentes - despesasPendentes;
    }
    
    return receitasPendentes - despesasPendentes;
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Card de Saldo Mês Anterior - só mostra se temos as props necessárias */}
      {onUpdateBalance && getPreviousMonthBalance && month !== undefined && year !== undefined && (
        <PreviousBalanceCard
          month={month}
          year={year}
          onUpdateBalance={onUpdateBalance}
          getPreviousMonthBalance={getPreviousMonthBalance}
        />
      )}

      {/* Cards de resumo existentes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

        {/* Saldo Final - agora inclui saldo anterior */}
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign size={20} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-600">Saldo Final</p>
              <p className={`text-xl font-bold ${calculateSaldoFinal() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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
              <p className={`text-xl font-bold ${calculateTotalPendente() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(calculateTotalPendente())}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
