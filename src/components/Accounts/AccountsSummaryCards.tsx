import React, { useEffect, useState } from 'react';
import { Clock, TrendingUp, TrendingDown, DollarSign, CheckCircle } from 'lucide-react';
import { Account, useAccountsData } from '@/hooks/useAccountsData';

interface AccountsSummaryCardsProps {
  accounts: Account[];
  month?: number;
  year?: number;
}

export const AccountsSummaryCards: React.FC<AccountsSummaryCardsProps> = ({ accounts, month, year }) => {
  const { getPreviousBalance, updateOrCreatePreviousBalance } = useAccountsData();
  const [previousBalance, setPreviousBalance] = useState<number>(0);
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState<string>('0');

  // Formatar valores em BRL
  const formatCurrency = (value: number): string =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  // Calcular valores dos cards
  const calculateTotalPago = () =>
    accounts
      .filter(acc => acc.type === 'despesa' && acc.status === 'pago')
      .reduce((sum, acc) => sum + Math.abs(acc.amount), 0);

  const calculateTotalRecebido = () =>
    accounts
      .filter(acc => acc.type === 'receita' && acc.status === 'recebido')
      .reduce((sum, acc) => sum + acc.amount, 0);

  const calculateSaldoFinal = () => calculateTotalRecebido() - calculateTotalPago();

  const calculateTotalPendente = () => {
    const receitasPendentes = accounts
      .filter(acc => acc.type === 'receita' && acc.status === 'pendente')
      .reduce((sum, acc) => sum + acc.amount, 0);
    const despesasPendentes = accounts
      .filter(acc => acc.type === 'despesa' && acc.status === 'pendente')
      .reduce((sum, acc) => sum + Math.abs(acc.amount), 0);
    return receitasPendentes - despesasPendentes;
  };

  // Carregar saldo anterior
  useEffect(() => {
    if (month != null && year != null) {
      getPreviousBalance(month, year).then(balance => {
        const value = balance?.value ?? 0;
        setPreviousBalance(value);
        setInputValue(value.toFixed(2));
      });
    }
  }, [month, year, getPreviousBalance]);

  // Salvar saldo anterior editado
  const handleSavePreviousBalance = async () => {
    const value = parseFloat(inputValue.replace(',', '.'));
    if (month != null && year != null && !isNaN(value)) {
      await updateOrCreatePreviousBalance(month, year, value);
      setPreviousBalance(value);
      setEditing(false);
    }
  };

  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Saldo Mês Anterior */}
      <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <CheckCircle size={20} className="text-purple-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-600">Saldo Mês Anterior</p>
            {editing ? (
              <div className="flex gap-2">
                <input
                  className="w-full border border-purple-300 rounded p-1 text-right"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                />
                <button
                  className="bg-purple-600 text-white px-2 rounded"
                  onClick={handleSavePreviousBalance}
                >
                  OK
                </button>
              </div>
            ) : (
              <p
                className={`text-xl font-bold ${previousBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}
                onClick={() => setEditing(true)}
              >
                {formatCurrency(previousBalance)}
              </p>
            )}
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
            <p className="text-xl font-bold text-green-600">{formatCurrency(calculateTotalRecebido())}</p>
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
            <p className="text-xl font-bold text-red-600">{formatCurrency(calculateTotalPago())}</p>
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
                calculateTotalPendente() >= 0 ? 'text-green-600' : 'text-red-600'
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
