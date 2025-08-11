import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { AccessControlWrapper } from '@/components/AccessControlWrapper';
import { FinancialCard } from '@/components/Dashboard/FinancialCard';
import { RecentTransactions } from '@/components/Dashboard/RecentTransactions';
import { DashboardMonthNavigator } from '@/components/Dashboard/DashboardMonthNavigator';
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Loader2 } from 'lucide-react';
import { useAccounts } from '@/contexts/AccountsContext';
import { formatCurrency } from '@/utils/formatters';

const Dashboard: React.FC = () => {
  console.log('Dashboard: component rendering');
  
  const navigate = useNavigate();
  const { 
    loading,
    getTransactions, 
    getTotalReceitas, 
    getTotalDespesas, 
    getSaldo, 
    getContasPendentes,
    accounts
  } = useAccounts();

  // Estado para controlar o mês/ano selecionado
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const transactions = getTransactions();
  const totalReceitas = getTotalReceitas();
  const totalDespesas = getTotalDespesas();
  const saldo = getSaldo();
  const contasPendentes = getContasPendentes();

  // Obter o nome do mês selecionado
  const getMonthName = (month: number) => {
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return monthNames[month];
  };

  const selectedMonthName = getMonthName(selectedMonth);

  // Calcular receitas e despesas do mês selecionado
  const getSelectedMonthReceitas = () => {
    return accounts
      .filter(account => {
        if (account.type !== 'receita' || account.status !== 'recebido') return false;
        const dueDate = new Date(account.dueDate);
        return dueDate.getMonth() === selectedMonth && dueDate.getFullYear() === selectedYear;
      })
      .reduce((sum, account) => sum + account.amount, 0);
  };

  const getSelectedMonthDespesas = () => {
    return accounts
      .filter(account => {
        if (account.type !== 'despesa' || account.status !== 'pago') return false;
        const dueDate = new Date(account.dueDate);
        return dueDate.getMonth() === selectedMonth && dueDate.getFullYear() === selectedYear;
      })
      .reduce((sum, account) => sum + Math.abs(account.amount), 0);
  };

  // Calcular receitas e despesas previstas (pendentes)
  const getReceitasPrevistas = () => {
    return accounts
      .filter(account => account.type === 'receita' && account.status === 'pendente')
      .reduce((sum, account) => sum + account.amount, 0);
  };

  const getDespesasPrevistas = () => {
    return accounts
      .filter(account => account.type === 'despesa' && account.status === 'pendente')
      .reduce((sum, account) => sum + Math.abs(account.amount), 0);
  };

  const receitasDoMes = getSelectedMonthReceitas();
  const despesasDoMes = getSelectedMonthDespesas();
  const saldoDoMes = receitasDoMes - despesasDoMes;
  const receitasPrevistas = getReceitasPrevistas();
  const despesasPrevistas = getDespesasPrevistas();
  const saldoPrevisto = receitasPrevistas - despesasPrevistas;

  console.log('Dashboard: accounts data', { 
    loading, 
    transactionsCount: transactions.length, 
    totalReceitas, 
    totalDespesas, 
    saldo, 
    contasPendentes,
    receitasDoMes,
    despesasDoMes,
    receitasPrevistas,
    despesasPrevistas,
    selectedMonth,
    selectedYear
  });

  const handleReceitasClick = () => {
    navigate('/contas?type=receita');
  };

  const handleDespesasClick = () => {
    navigate('/contas?type=despesa');
  };

  const handleContasPendentesClick = () => {
    navigate('/contas?status=pendente');
  };

  const handleMonthChange = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  if (loading) {
    console.log('Dashboard: showing loading state');
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

  console.log('Dashboard: rendering main content');

  return (
    <AccessControlWrapper>
      <Layout>
        <div className="space-y-6">
          <DashboardMonthNavigator
            currentMonth={selectedMonth}
            currentYear={selectedYear}
            onMonthChange={handleMonthChange}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FinancialCard
              title="Saldo do Mês"
              value={formatCurrency(saldoDoMes)}
              icon={DollarSign}
              trend="12%"
              trendUp={saldoDoMes > 0}
              bgColor="bg-gradient-to-r from-blue-500 to-blue-600"
              monthText={selectedMonthName}
              monthColor="text-blue-600"
            />
            <FinancialCard
              title="Receitas"
              value={formatCurrency(receitasDoMes)}
              icon={TrendingUp}
              trend="8%"
              trendUp={true}
              bgColor="bg-gradient-to-r from-green-500 to-green-600"
              onClick={handleReceitasClick}
              monthText={selectedMonthName}
              monthColor="text-green-600"
            />
            <FinancialCard
              title="Despesas"
              value={formatCurrency(despesasDoMes)}
              icon={TrendingDown}
              trend="3%"
              trendUp={false}
              bgColor="bg-gradient-to-r from-red-500 to-red-600"
              onClick={handleDespesasClick}
              monthText={selectedMonthName}
              monthColor="text-red-600"
            />
            <FinancialCard
              title="Contas Pendentes"
              value={contasPendentes.toString()}
              icon={CreditCard}
              bgColor="bg-gradient-to-r from-orange-500 to-orange-600"
              onClick={handleContasPendentesClick}
              monthText="Todas"
              monthColor="text-orange-600"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentTransactions transactions={transactions} />
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Resumo Mensal</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                  <span className="text-green-700 font-medium">Receitas Previstas</span>
                  <span className="text-green-700 font-bold">{formatCurrency(receitasPrevistas)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
                  <span className="text-red-700 font-medium">Despesas Previstas</span>
                  <span className="text-red-700 font-bold">{formatCurrency(despesasPrevistas)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                  <span className="text-blue-700 font-medium">Saldo Previsto</span>
                  <span className={`font-bold ${saldoPrevisto >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                    {formatCurrency(saldoPrevisto)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </AccessControlWrapper>
  );
};

export default Dashboard;
