
import React from 'react';
import { Layout } from '@/components/Layout';
import { FinancialCard } from '@/components/Dashboard/FinancialCard';
import { RecentTransactions } from '@/components/Dashboard/RecentTransactions';
import { InvestmentsSection } from '@/components/Dashboard/InvestmentsSection';
import { DollarSign, TrendingUp, Calendar, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const totalBalance = 15000;
  const totalIncome = 5000;
  const totalExpenses = 3000;

  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <FinancialCard
          title="Saldo Total"
          value={totalBalance}
          icon={DollarSign}
          bgColor="bg-gradient-to-r from-green-500 to-green-600"
        />
        <FinancialCard
          title="Receitas"
          value={totalIncome}
          icon={TrendingUp}
          bgColor="bg-gradient-to-r from-blue-500 to-blue-600"
        />
        <FinancialCard
          title="Despesas"
          value={totalExpenses}
          icon={Calendar}
          bgColor="bg-gradient-to-r from-red-500 to-red-600"
        />
        <FinancialCard
          title="Alertas"
          value={3}
          icon={AlertCircle}
          bgColor="bg-gradient-to-r from-yellow-500 to-yellow-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentTransactions transactions={[]} />
        <InvestmentsSection />
      </div>
    </Layout>
  );
};

export default Dashboard;
