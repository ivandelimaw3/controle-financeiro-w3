// src/components/AccountsSummaryCards.tsx
import React, { useState, useEffect } from 'react';
import { Clock, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Account, useAccountsData } from '@/hooks/useAccountsData';

interface AccountsSummaryCardsProps {
  accounts: Account[];
  month: number; // 0 a 11
  year: number;
}

export const AccountsSummaryCards: React.FC<AccountsSummaryCardsProps> = ({ accounts, month, year }) => {
  const { getPreviousMonthBalance, savePreviousMonthBalance } = useAccountsData();

  const [saldoAnterior, setSaldoAnterior] = useState<number>(0);
  const [editSaldo, setEditSaldo] = useState<boolean>(false);
  const [manualSaldo, setManualSaldo] = useState<string>('0.00');

  useEffect(() => {
    const fetchSaldoAnterior = async () => {
      const saldo = await getPreviousMonthBalance(month, year);
      setSaldoAnterior(saldo);
      setManualSaldo(saldo.toFixed(2));
    };
    fetchSaldoAnterior();
  }, [month, year, getPreviousMonthBalance]);

  const formatCurrency = (value: number): string =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const calculateTotalPago = () =>
    accounts
      .filter(a => a.type === 'despesa' && a.status === 'pago')
      .reduce((sum, a) => sum + Math.abs(a.amount), 0);

  const calculateTotalRecebido = () =>
    accounts
      .filter(a => a.type === 'receita' && a.status === 'recebido')
      .reduce((sum, a) => sum + a.amount, 0);

  const calculateSaldoFinal = () =>
    saldoAnterior + calculateTotalRecebido() - calculateTotalPago();

  const calculateTotalPendente = () => {
    const receitasPendentes = accounts
      .filter(a => a.type === 'receita' && a.status === 'pendente')
      .reduce((sum, a) => sum + a.amount, 0);
    const despesasPendentes = accounts
      .filter(a => a.type === 'despesa' && a.status === 'pendente')
      .reduce((sum, a) => sum + Math.abs(a.amount), 0);
    return receitasPendentes - despesasPendentes;
  };

  const handleSaveManualSaldo = async () => {
    const value = parseFloat(manualSaldo.replace(/\./g, '').replace(',', '.'));
    if (!isNaN(value)) {
      await savePreviousMonthBalance(month, year, value);
      setSaldoAnterior(value);
      setEditSaldo(false);
    }
  };

  const handleManualSaldoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Permitir apenas números e vírgula/decimal
    const cleanedValue = value.replace(/[^\d,]/g, '');
    
    // Limitar para 2 casas decimais
    if (cleanedValue.includes(',')) {
      const parts = cleanedValue.split(',');
      if (parts.length > 2) {
        const newCleanedValue = parts[0] + ',' + parts.slice(1).join('');
        setManualSaldo(newCleanedValue);
      } else {
        setManualSaldo(cleanedValue);
      }
    } else {
      setManualSaldo(cleanedValue);
    }
  };

  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Saldo Mês Anterior */}
      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <Clock size={20} className="text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-600">Saldo Mês Anterior</p>
            {!editSaldo ? (
              <div className="flex items-center justify-between">
                <p className="text-xl font-bold text-gray-700">{formatCurrency(saldoAnterior)}</p>
                <button
                  className="ml-2 text-sm text-blue-600 hover:underline"
                  onClick={() => setEditSaldo(true)}
                >
                  Editar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  className="border rounded px-2 py-1 w-24 text-right"
                  value={manualSaldo}
                  onChange={handleManualSaldoChange}
                  placeholder="0,00"
                  autoFocus
                />
                <button
                  className="text-sm text-green-600 hover:underline"
                  onClick={handleSaveManualSaldo}
                >
                  Salvar
                </button>
                <button
                  className="text-sm text-red-600 hover:underline"
                  onClick={() => {
                    setManualSaldo(saldoAnterior.toFixed(2));
                    setEditSaldo(false);
                  }}
                >
                  Cancelar
                </button>
              </div>
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
