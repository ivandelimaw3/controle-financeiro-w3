import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { FinancialCard } from '@/components/Dashboard/FinancialCard';
import { RecentTransactions } from '@/components/Dashboard/RecentTransactions';
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Loader2 } from 'lucide-react';
import { useAccounts } from '@/contexts/AccountsContext';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { 
    loading,
    getTransactions, 
    getTotalReceitas, 
    getTotalDespesas, 
    getSaldo, 
    getContasPendentes 
  } = useAccounts();

  const transactions = getTransactions();
  const totalReceitas = getTotalReceitas();
  const totalDespesas = getTotalDespesas();
  const saldo = getSaldo();
  const contasPendentes = getContasPendentes();

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
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Dashboard</h1>
          <p className="text-slate-600">Resumo da sua situação financeira</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FinancialCard
            title="Saldo Total"
            value={`R$ ${saldo.toFixed(2)}`}
            icon={DollarSign}
            trend="12%"
            trendUp={saldo > 0}
            bgColor="bg-gradient-to-r from-blue-500 to-blue-600"
          />
          <FinancialCard
            title="Receitas"
            value={`R$ ${totalReceitas.toFixed(2)}`}
            icon={TrendingUp}
            trend="8%"
            trendUp={true}
            bgColor="bg-gradient-to-r from-green-500 to-green-600"
            onClick={handleReceitasClick}
          />
          <FinancialCard
            title="Despesas"
            value={`R$ ${totalDespesas.toFixed(2)}`}
            icon={TrendingDown}
            trend="3%"
            trendUp={false}
            bgColor="bg-gradient-to-r from-red-500 to-red-600"
            onClick={handleDespesasClick}
          />
          <FinancialCard
            title="Contas Pendentes"
            value={contasPendentes.toString()}
            icon={CreditCard}
            bgColor="bg-gradient-to-r from-orange-500 to-orange-600"
            onClick={handleContasPendentesClick}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentTransactions transactions={transactions} />
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Resumo Mensal</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                <span className="text-green-700 font-medium">Receitas Previstas</span>
                <span className="text-green-700 font-bold">R$ {(totalReceitas + 800).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
                <span className="text-red-700 font-medium">Despesas Previstas</span>
                <span className="text-red-700 font-bold">R$ {(totalDespesas + 200).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                <span className="text-blue-700 font-medium">Saldo Previsto</span>
                <span className="text-blue-700 font-bold">R$ {(saldo + 600).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
