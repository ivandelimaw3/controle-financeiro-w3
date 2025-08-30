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
import { supabase } from '@/integrations/supabase/client'; // NEW
import { useAuth } from '@/contexts/AuthContext'; // NEW

const Contas: React.FC = () => {
  const { accounts, loading } = useAccounts();
  const { user } = useAuth(); // NEW
  const [previousBalance, setPreviousBalance] = React.useState<number>(0); // NEW
  
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
  const currentMonth = monthFilter === 'todos' ? today.getMonth() : parseInt(monthFilter);
  const currentYear = parseInt(yearFilter);
  const isShowingAll = monthFilter === 'todos';

  // NEW: Buscar Saldo Anterior (dezembro do ano anterior ao ano considerado)
  React.useEffect(() => {
    const fetchPreviousBalance = async () => {
      try {
        if (!user) {
          setPreviousBalance(0);
          return;
        }
        const refYear = Number.isNaN(currentYear) ? new Date().getFullYear() : currentYear;
        const prevYear = refYear - 1;
        const start = `${prevYear}-12-01`;
        const end = `${prevYear}-12-31`;

        const { data, error } = await supabase
          .from('accounts')
          .select('amount, due_date')
          .eq('user_id', user.id)
          .gte('due_date', start)
          .lte('due_date', end)
          .order('due_date', { ascending: false })
          .limit(1);

        if (error) {
          console.error('Erro ao buscar Saldo Anterior:', error);
          setPreviousBalance(0);
          return;
        }

        if (data && data.length > 0) {
          const raw = (data[0] as any).amount;
          const amt = typeof raw === 'number' ? raw : parseFloat(String(raw));
          setPreviousBalance(Number.isFinite(amt) ? amt : 0);
        } else {
          setPreviousBalance(0);
        }
      } catch (e) {
        console.error('Erro inesperado ao obter Saldo Anterior:', e);
        setPreviousBalance(0);
      }
    };

    fetchPreviousBalance();
  }, [user, currentYear]);

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

          <AccountsSummaryCards accounts={filteredAccounts} previousBalance={previousBalance} />

          <div className="mb-4">
            <p className="text-sm text-slate-600 text-center">
              {filteredAccounts.length} {filteredAccounts.length === 1 ? 'conta encontrada' : 'contas encontradas'}
            </p>
          </div>

          {/* Navegador de mês - logo acima da tabela */}
          <MonthNavigator
            currentMonth={currentMonth}
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
