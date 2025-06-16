import React from 'react';
import { Layout } from '@/components/Layout';
import { FinancialCard } from '@/components/Dashboard/FinancialCard';
import { RecentTransactions } from '@/components/Dashboard/RecentTransactions';
import { InvestmentsSection } from '@/components/Dashboard/InvestmentsSection';
import { useAccountsData } from '@/hooks/useAccountsData';
import { DollarSign, TrendingUp, Calendar, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const { accounts, loading } = useAccountsData();

  const totalBalance = React.useMemo(() => {
    return accounts.reduce((acc, account) => acc + account.balance, 0);
  }, [accounts]);

  const totalIncome = 5000;
  const totalExpenses = 3000;

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <FinancialCard
          title="Saldo Total"
          amount={totalBalance}
          icon={DollarSign}
          bgColor="bg-gradient-to-r from-green-500 to-green-600"
        />
        <FinancialCard
          title="Receitas"
          amount={totalIncome}
          icon={TrendingUp}
          bgColor="bg-gradient-to-r from-blue-500 to-blue-600"
        />
        <FinancialCard
          title="Despesas"
          amount={totalExpenses}
          icon={Calendar}
          bgColor="bg-gradient-to-r from-red-500 to-red-600"
        />
        <FinancialCard
          title="Alertas"
          amount={3}
          icon={AlertCircle}
          bgColor="bg-gradient-to-r from-yellow-500 to-yellow-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentTransactions />
        <InvestmentsSection />
      </div>
    </Layout>
  );
};

export default Dashboard;
