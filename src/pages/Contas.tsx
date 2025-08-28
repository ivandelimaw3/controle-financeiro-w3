
import React from 'react';
import { Layout } from '@/components/Layout';
import { AccountsHeader } from '@/components/Accounts/AccountsHeader';
import { AccountsFilters } from '@/components/Accounts/AccountsFilters';
import { AccountsSummaryCards } from '@/components/Accounts/AccountsSummaryCards';
import { AccountsTable } from '@/components/Accounts/AccountsTable';
import { AccountModal, AccountFormData } from '@/components/Accounts/AccountModal';
import { MonthNavigator } from '@/components/Accounts/MonthNavigator';
import { AccessControlWrapper } from '@/components/AccessControlWrapper';
import { Loader2 } from 'lucide-react';
import { useAccounts } from '@/contexts/AccountsContext';
import { useAccountsReminder } from '@/hooks/useAccountsReminder';
import { useAccountFilters } from '@/hooks/useAccountFilters';
import { useAccountOperations } from '@/hooks/useAccountOperations';
import { useMonthlyBalances } from '@/hooks/useMonthlyBalances';

const Contas: React.FC = () => {
  const { accounts, loading } = useAccounts();
  
  // Hook para gerenciar saldos mensais
  const { getMonthlyBalance, updateMonthlyBalance } = useMonthlyBalances();
  
  // Ativar sistema de lembretes para contas vencendo hoje
  useAccountsReminder(accounts);
  
  // Gerenciar filtros
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    monthFilter,
    setMonthFilter,
    yearFilter,
    setYearFilter,
    filteredAccounts
  } = useAccountFilters(accounts);

  // Gerenciar operações de contas
  const {
    isModalOpen,
    editingAccount,
    handleSave,
    handleEdit,
    handleDelete,
    handleStatusChange,
    handleNewAccount,
    handleModalClose
  } = useAccountOperations();

  const categories = ['Trabalho', 'Moradia', 'Utilidades', 'Alimentação', 'Transporte', 'Lazer'];

  // Handler para mudança de mês no navegador
  const handleMonthChange = (startDate: Date, endDate: Date, month: number, year: number) => {
    console.log('Mudança de mês:', { startDate, endDate, month, year });
    setMonthFilter(month.toString());
    setYearFilter(year.toString());
  };

  // Handler para mostrar todos os meses
  const handleShowAll = () => {
    console.log('Mostrando todos os meses');
    setMonthFilter('todos');
    setYearFilter('todos');
  };

  // Obter mês e ano atual - sempre inicializar no mês atual
  const today = new Date();
  const currentMonth = monthFilter === 'todos' ? today.getMonth() + 1 : parseInt(monthFilter);
  const currentYear = parseInt(yearFilter);
  const isShowingAll = monthFilter === 'todos';

  // Função para obter saldo do mês anterior com lógica automática
  const getPreviousMonthBalance = (month: number, year: number): number => {
    console.log(`Calculando saldo anterior para ${month}/${year}`);
    
    // Para janeiro, procurar saldo salvo ou usar 0
    if (month === 1) {
      const savedBalance = getMonthlyBalance(month, year);
      console.log(`Janeiro ${year}: saldo salvo = ${savedBalance}`);
      return savedBalance;
    }

    // Para outros meses, calcular baseado no saldo final do mês anterior
    const previousMonth = month - 1;
    const previousYear = month === 1 ? year - 1 : year;

    console.log(`Calculando para ${month}/${year} baseado em ${previousMonth}/${previousYear}`);

    // Obter contas do mês anterior que estão efetivadas (pagas/recebidas)
    const previousMonthAccounts = accounts.filter(account => {
      const dueDate = new Date(account.dueDate);
      const accountMonth = dueDate.getMonth() + 1; // getMonth() retorna 0-11
      const accountYear = dueDate.getFullYear();
      return accountMonth === previousMonth && accountYear === previousYear;
    });

    console.log(`Contas do mês ${previousMonth}/${previousYear}:`, previousMonthAccounts.length);

    // Calcular receitas e despesas efetivadas do mês anterior
    const totalRecebido = previousMonthAccounts
      .filter(account => account.type === 'receita' && account.status === 'recebido')
      .reduce((sum, account) => sum + account.amount, 0);

    const totalPago = previousMonthAccounts
      .filter(account => account.type === 'despesa' && account.status === 'pago')
      .reduce((sum, account) => sum + Math.abs(account.amount), 0);

    console.log(`Mês ${previousMonth}/${previousYear} - Recebido: ${totalRecebido}, Pago: ${totalPago}`);

    // Incluir saldo anterior do mês anterior (recursivo)
    const saldoAnteriorDoPrevious = getPreviousMonthBalance(previousMonth, previousYear);
    
    const saldoFinal = saldoAnteriorDoPrevious + totalRecebido - totalPago;
    console.log(`Saldo final ${previousMonth}/${previousYear}: ${saldoAnteriorDoPrevious} + ${totalRecebido} - ${totalPago} = ${saldoFinal}`);
    
    return saldoFinal;
  };

  const handleSubmit = (data: AccountFormData) => {
    handleSave(data);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-lg text-slate-600">Carregando contas...</span>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <AccountsHeader onNewAccount={handleNewAccount} />

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
          <AccountsFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            monthFilter={monthFilter}
            setMonthFilter={setMonthFilter}
            yearFilter={yearFilter}
            setYearFilter={setYearFilter}
            accounts={accounts}
          />

          <AccountsSummaryCards 
            accounts={filteredAccounts}
            month={!isShowingAll ? currentMonth : undefined}
            year={!isShowingAll ? currentYear : undefined}
            onUpdateBalance={updateMonthlyBalance}
            getPreviousMonthBalance={getPreviousMonthBalance}
          />

          <div className="mb-4">
            <p className="text-sm text-slate-600 text-center">
              {filteredAccounts.length} {filteredAccounts.length === 1 ? 'conta encontrada' : 'contas encontradas'}
            </p>
          </div>

          {/* Navegador de mês - logo acima da tabela */}
          <MonthNavigator
            currentMonth={currentMonth - 1} // -1 porque MonthNavigator espera 0-11
            currentYear={currentYear}
            onMonthChange={handleMonthChange}
            onShowAll={handleShowAll}
            isShowingAll={isShowingAll}
          />

          <AccountsTable
            accounts={filteredAccounts}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
          />
        </div>

        <AccountModal
          key={editingAccount?.id || 'new'}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSubmit={handleSubmit}
          account={editingAccount}
          categories={categories}
        />
      </div>
    );
  };

  return (
    <AccessControlWrapper>
      <Layout>
        {renderContent()}
      </Layout>
    </AccessControlWrapper>
  );
};

export default Contas;
