import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { AccessControlWrapper } from '@/components/AccessControlWrapper';
import { FinancialCard } from '@/components/Dashboard/FinancialCard';
import { RecentTransactions } from '@/components/Dashboard/RecentTransactions';
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Loader2 } from 'lucide-react';
import { useAccounts } from '@/contexts/AccountsContext';

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

  const transactions = getTransactions();
  const totalReceitas = getTotalReceitas();
  const totalDespesas = getTotalDespesas();
  const saldo = getSaldo();
  const contasPendentes = getContasPendentes();

  // Obter o nome do mês atual
  const getCurrentMonthName = () => {
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const currentMonth = new Date().getMonth();
    return monthNames[currentMonth];
  };

  const currentMonthName = getCurrentMonthName();

  // Calcular receitas e despesas do mês corrente
  const getCurrentMonthReceitas = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return accounts
      .filter(account => {
        if (account.type !== 'receita' || account.status !== 'recebido') return false;
        const dueDate = new Date(account.dueDate);
        return dueDate.getMonth() === currentMonth && dueDate.getFullYear() === currentYear;
      })
      .reduce((sum, account) => sum + account.amount, 0);
  };

  const getCurrentMonthDespesas = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return accounts
      .filter(account => {
        if (account.type !== 'despesa' || account.status !== 'pago') return false;
        const dueDate = new Date(account.dueDate);
        return dueDate.getMonth() === currentMonth && dueDate.getFullYear() === currentYear;
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

  const receitasDoMes = getCurrentMonthReceitas();
  const despesasDoMes = getCurrentMonthDespesas();
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
    despesasPrevistas
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
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Painel de Negócios</h1>
                <p className="text-slate-600">Resumo da sua situação financeira</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FinancialCard
              title="Saldo Total"
              value={`R$ ${saldo.toFixed(2)}`}
              icon={DollarSign}
              trend="12%"
              trendUp={saldo > 0}
              bgColor="bg-gradient-to-r from-blue-500 to-blue-600"
              monthText={currentMonthName}
              monthColor="text-blue-600"
            />
            <FinancialCard
              title="Receitas"
              value={`R$ ${receitasDoMes.toFixed(2)}`}
              icon={TrendingUp}
              trend="8%"
              trendUp={true}
              bgColor="bg-gradient-to-r from-green-500 to-green-600"
              onClick={handleReceitasClick}
              monthText={currentMonthName}
              monthColor="text-green-600"
            />
            <FinancialCard
              title="Despesas"
              value={`R$ ${despesasDoMes.toFixed(2)}`}
              icon={TrendingDown}
              trend="3%"
              trendUp={false}
              bgColor="bg-gradient-to-r from-red-500 to-red-600"
              onClick={handleDespesasClick}
              monthText={currentMonthName}
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
                  <span className="text-green-700 font-bold">R$ {receitasPrevistas.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
                  <span className="text-red-700 font-medium">Despesas Previstas</span>
                  <span className="text-red-700 font-bold">R$ {despesasPrevistas.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                  <span className="text-blue-700 font-medium">Saldo Previsto</span>
                  <span className={`font-bold ${saldoPrevisto >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                    R$ {saldoPrevisto.toFixed(2)}
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
