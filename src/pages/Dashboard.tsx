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
  const navigate = useNavigate();
  const { loading, accounts, getTransactions } = useAccounts();

  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  // --- Função auxiliar: filtra contas do mês/ano selecionado (sem Saldo Anterior)
  const getFilteredAccountsForCalculations = () => {
    return accounts.filter((account) => {
      const dueDate = new Date(account.dueDate);
      return (
        dueDate.getMonth() === selectedMonth &&
        dueDate.getFullYear() === selectedYear &&
        account.description !== "Saldo Anterior"
      );
    });
  };

  // --- Pega saldo anterior do mês (se existir conta "Saldo Anterior")
  const getPreviousBalance = () => {
    const saldoAnterior = accounts.find(
      (acc) =>
        acc.description === "Saldo Anterior" &&
        new Date(acc.dueDate).getMonth() === selectedMonth &&
        new Date(acc.dueDate).getFullYear() === selectedYear
    );
    return saldoAnterior ? saldoAnterior.type === 'receita' ? saldoAnterior.amount : -Math.abs(saldoAnterior.amount) : 0;
  };

  // --- Total Recebido
 const getMonthReceitas = () => {
  const monthAccounts = getFilteredAccountsForCalculations();
  return monthAccounts
    .filter((acc) => acc.type === "receita" && acc.status === "recebido")
    .reduce((sum, acc) => sum + (acc.amount || 0), 0);
};

 const getMonthDespesas = () => {
  return accounts
    .filter(account => {
      if (account.type !== 'despesa' || account.status.toLowerCase() !== 'pago') return false;
      const dueDate = new Date(account.dueDate + "T00:00:00");
      return dueDate.getMonth() === selectedMonth && dueDate.getFullYear() === selectedYear;
    })
    .reduce((sum, account) => sum + Math.abs(account.amount || 0), 0);
};

  // --- Saldo Final
  const getMonthSaldoFinal = () => {
  // 1️⃣ Saldo anterior do mês
  const previous = accounts.find(acc => {
    if (!acc.dueDate) return false;
    const d = new Date(acc.dueDate + "T00:00:00");
    return acc.description === "Saldo Anterior" &&
           d.getMonth() === selectedMonth &&
           d.getFullYear() === selectedYear;
  });
  
  const previousBalance = previous
    ? (previous.type === "receita" ? previous.amount : -Math.abs(previous.amount))
    : 0;

  // 2️⃣ Total Recebido e Total Pago
  const totalRecebido = getMonthReceitas();
  const totalPago = getMonthDespesas();

  // 3️⃣ Saldo final
  return previousBalance + totalRecebido - totalPago;
};

  // Obter nome do mês
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho','Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const selectedMonthName = monthNames[selectedMonth];

  const transactions = getTransactions();

  const handleMonthChange = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  const handleReceitasClick = () => navigate('/contas?type=receita');
  const handleDespesasClick = () => navigate('/contas?type=despesa');
  const handleContasPendentesClick = () => navigate('/contas?status=pendente');

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
          <DashboardMonthNavigator
            currentMonth={selectedMonth}
            currentYear={selectedYear}
            onMonthChange={handleMonthChange}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FinancialCard
              title="Saldo do Mês"
              value={formatCurrency(getMonthSaldoFinal())}
              icon={DollarSign}
              bgColor={getMonthSaldoFinal() >= 0 ? "bg-gradient-to-r from-blue-500 to-blue-600" : "bg-gradient-to-r from-red-500 to-red-600"}
              monthText={selectedMonthName}
              monthColor="text-blue-600"
            />
            <FinancialCard
              title="Total Recebido"
              value={formatCurrency(getMonthReceitas())}
              icon={TrendingUp}
              onClick={handleReceitasClick}
              bgColor="bg-gradient-to-r from-green-500 to-green-600"
              monthText={selectedMonthName}
              monthColor="text-green-600"
            />
            <FinancialCard
              title="Total Pago"
              value={formatCurrency(getMonthDespesas())}
              icon={TrendingDown}
              onClick={handleDespesasClick}
              bgColor="bg-gradient-to-r from-red-500 to-red-600"
              monthText={selectedMonthName}
              monthColor="text-red-600"
            />
            <FinancialCard
              title="Contas Pendentes"
              value={accounts.filter(acc => acc.status === "pendente" && new Date(acc.dueDate).getMonth() === selectedMonth && new Date(acc.dueDate).getFullYear() === selectedYear).length.toString()}
              icon={CreditCard}
              onClick={handleContasPendentesClick}
              bgColor="bg-gradient-to-r from-orange-500 to-orange-600"
              monthText={selectedMonthName}
              monthColor="text-orange-600"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentTransactions transactions={transactions} />
          </div>
        </div>
      </Layout>
    </AccessControlWrapper>
  );
};

export default Dashboard;
