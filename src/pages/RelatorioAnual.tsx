import React, { useState, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { MonthlyReportTable } from '@/components/Accounts/MonthlyReportTable';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAccounts } from '@/contexts/AccountsContext';
import { formatCurrency } from '@/utils/formatters';

const RelatorioAnual: React.FC = () => {
  const navigate = useNavigate();
  const { accounts } = useAccounts();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Gerar lista de anos disponíveis (últimos 5 anos + próximos 2 anos)
  const availableYears = useMemo(() => {
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 2; i++) {
      years.push(i);
    }
    return years;
  }, [currentYear]);

  // Filtrar contas do ano selecionado
  const yearAccounts = useMemo(() => {
    return accounts.filter(account => {
      const accountYear = new Date(account.dueDate).getFullYear();
      return accountYear === selectedYear;
    });
  }, [accounts, selectedYear]);

  // Calcular dados mensais
  const monthlyData = useMemo(() => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    return months.map((month, index) => {
      const monthAccounts = yearAccounts.filter(account => {
        const accountDate = new Date(account.dueDate);
        return accountDate.getMonth() === index;
      });

      // Encontrar saldo anterior para este mês
      const saldoAnteriorAccount = monthAccounts.find(account => 
        account.description === 'Saldo Anterior'
      );
      const saldoAnterior = saldoAnteriorAccount ? saldoAnteriorAccount.amount : 0;

      // Calcular receitas e despesas (excluindo saldo anterior)
      const receitas = monthAccounts
        .filter(account => 
          account.type === 'receita' && 
          account.status === 'recebido' && 
          account.description !== 'Saldo Anterior'
        )
        .reduce((sum, account) => sum + account.amount, 0);

      const despesas = monthAccounts
        .filter(account => 
          account.type === 'despesa' && 
          account.status === 'pago'
        )
        .reduce((sum, account) => sum + Math.abs(account.amount), 0);

      const saldoFinal = saldoAnterior + receitas - despesas;

      return {
        month,
        totalRecebido: receitas,
        totalPago: despesas,
        saldoFinal
      };
    });
  }, [yearAccounts]);

  // Calcular totais anuais
  const totalReceived = monthlyData.reduce((sum, data) => sum + data.totalRecebido, 0);
  const totalPaid = monthlyData.reduce((sum, data) => sum + data.totalPago, 0);
  const finalBalance = totalReceived - totalPaid;

  const handlePreviousYear = () => {
    if (selectedYear > availableYears[0]) {
      setSelectedYear(selectedYear - 1);
    }
  };

  const handleNextYear = () => {
    if (selectedYear < availableYears[availableYears.length - 1]) {
      setSelectedYear(selectedYear + 1);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/contas')}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Relatório Anual</h1>
              <p className="text-slate-600">Resumo financeiro detalhado por mês</p>
            </div>
          </div>

          {/* Seletor de Ano */}
          <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePreviousYear}
              disabled={selectedYear <= availableYears[0]}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft size={16} />
            </Button>
            <span className="px-4 py-1 text-lg font-semibold text-slate-700 min-w-[80px] text-center">
              {selectedYear}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextYear}
              disabled={selectedYear >= availableYears[availableYears.length - 1]}
              className="h-8 w-8 p-0"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <TrendingUp className="text-green-600" size={28} />
              </div>
              <div>
                <h3 className="text-slate-600 text-sm font-medium">Total Recebido</h3>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(totalReceived)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <TrendingDown className="text-red-600" size={28} />
              </div>
              <div>
                <h3 className="text-slate-600 text-sm font-medium">Total Pago</h3>
                <p className="text-3xl font-bold text-red-600">{formatCurrency(totalPaid)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <DollarSign className="text-blue-600" size={28} />
              </div>
              <div>
                <h3 className="text-slate-600 text-sm font-medium">Saldo Final</h3>
                <p className={`text-3xl font-bold ${finalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(finalBalance)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabela de Relatório Mensal */}
        <MonthlyReportTable
          monthlyData={monthlyData}
          totalReceived={totalReceived}
          totalPaid={totalPaid}
          finalBalance={finalBalance}
        />
      </div>
    </Layout>
  );
};

export default RelatorioAnual;