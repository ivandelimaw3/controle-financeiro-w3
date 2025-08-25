import React from 'react';
import { Clock, TrendingUp, TrendingDown, DollarSign, History } from 'lucide-react';
import { Account } from '@/contexts/AccountsContext';

interface AccountsSummaryCardsProps {
  accounts: Account[];
}

export const AccountsSummaryCards: React.FC<AccountsSummaryCardsProps> = ({ accounts }) => {
  // Função para formatar valores em reais brasileiros
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
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

  const getSaldoAnterior = () => {
    if (!accounts || accounts.length === 0) return 0;
    // pega o primeiro valor de saldo_anterior encontrado
    const saldoAnterior = accounts[0].saldo_anterior;
    return saldoAnterior ? Number(saldoAnterior) : 0;
  };

  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Saldo Mês Anterior */}
<div 
  className="p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
  onClick={() => {
    const newValue = prompt(
      'Digite o saldo do mês anterior:',
      getSaldoAnterior().toString()
    );
    if (newValue !== null && !isNaN(Number(newValue))) {
      // Aqui você pode chamar a função do hook para salvar no banco
      console.log('Novo saldo manual:', Number(newValue));
      // Ex: savePreviousMonthBalance(month, year, Number(newValue))
    }
  }}
  title="Clique para editar o saldo do mês anterior"
>
  <div className="flex items-center gap-3">
    <div className="p-2 bg-gray-100 rounded-lg">
      <History size={20} className="text-gray-600" />
    </div>
    <div className="flex-1">
      <p className="text-sm text-slate-600">Saldo Mês Anterior</p>
      <p className="text-xl font-bold text-gray-700">
        {formatCurrency(getSaldoAnterior())}
      </p>
    </div>
  </div>
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
  );
};
