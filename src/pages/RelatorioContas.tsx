import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowLeft, BarChart3 } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { MonthlyReportTable } from '@/components/Accounts/MonthlyReportTable';
import { AccessControlWrapper } from '@/components/AccessControlWrapper';
import { useAccounts } from '@/contexts/AccountsContext';
import { Loader2 } from 'lucide-react';

const RelatorioContas: React.FC = () => {
  const navigate = useNavigate();
  const { accounts, loading } = useAccounts() as any;
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Calcular dados mensais para o ano selecionado
  const calculateMonthlyData = useMemo(() => {
    if (!accounts || accounts.length === 0) return [];

    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const monthlyData = [];

    // Calcular 12 meses para o ano selecionado
    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      const targetMonth = monthIndex;
      const targetYear = selectedYear;

      // Filtrar contas do mês/ano específico
      const accountsFromMonth = accounts.filter((account: any) => {
        const accountDate = new Date(account.dueDate);
        const accountMonth = accountDate.getMonth();
        const accountYear = accountDate.getFullYear();
        return accountMonth === targetMonth && accountYear === targetYear && account.description !== 'Saldo Anterior';
      });

      // Calcular receitas do mês (apenas recebidas)
      const receitasRecebidas = accountsFromMonth
        .filter((account: any) => account.type === 'receita' && account.status === 'recebido')
        .reduce((sum: number, account: any) => sum + account.amount, 0);

      // Calcular despesas do mês (apenas pagas)
      const despesasPagas = accountsFromMonth
        .filter((account: any) => account.type === 'despesa' && account.status === 'pago')
        .reduce((sum: number, account: any) => sum + Math.abs(account.amount), 0);

      // Calcular saldo final do mês
      const saldoFinal = receitasRecebidas - despesasPagas;

      monthlyData.push({
        month: monthNames[monthIndex],
        totalRecebido: receitasRecebidas,
        totalPago: despesasPagas,
        saldoFinal
      });
    }

    return monthlyData;
  }, [accounts, selectedYear]);

  // Calcular totais gerais do ano
  const calculateYearlyTotals = useMemo(() => {
    if (calculateMonthlyData.length === 0) {
      return { totalReceived: 0, totalPaid: 0, finalBalance: 0 };
    }

    const totalReceived = calculateMonthlyData.reduce((sum, data) => sum + data.totalRecebido, 0);
    const totalPaid = calculateMonthlyData.reduce((sum, data) => sum + data.totalPago, 0);
    const finalBalance = totalReceived - totalPaid;

    return { totalReceived, totalPaid, finalBalance };
  }, [calculateMonthlyData]);

  const navigateYear = (direction: 'prev' | 'next') => {
    const newYear = direction === 'prev' ? selectedYear - 1 : selectedYear + 1;
    setSelectedYear(newYear);
  };

  const handleBackToContas = () => {
    navigate('/contas');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-lg text-slate-600">Carregando dados...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <AccessControlWrapper>
      <Layout>
        <div className="space-y-6">
          {/* Header com filtro por ano e botão voltar */}
          <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackToContas}
                className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300"
              >
                <ArrowLeft size={16} />
                Voltar
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 mb-1">Relatório Anual</h1>
                  <p className="text-sm text-slate-600">Resumo financeiro detalhado por mês</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateYear('prev')}
                className="h-8 w-8 p-0 rounded-full hover:bg-blue-50 hover:border-blue-300"
              >
                <ChevronLeft size={16} />
              </Button>

              <div className="text-xl font-bold text-slate-800 min-w-[100px] text-center">
                {selectedYear}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateYear('next')}
                className="h-8 w-8 p-0 rounded-full hover:bg-blue-50 hover:border-blue-300"
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>

          {/* Tabela com cards e dados mensais */}
          <MonthlyReportTable
            monthlyData={calculateMonthlyData}
            totalReceived={calculateYearlyTotals.totalReceived}
            totalPaid={calculateYearlyTotals.totalPaid}
            finalBalance={calculateYearlyTotals.finalBalance}
          />
        </div>
      </Layout>
    </AccessControlWrapper>
  );
};

export default RelatorioContas;