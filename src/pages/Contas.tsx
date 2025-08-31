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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const Contas: React.FC = () => {
  const { accounts, loading, refreshAccounts } = useAccounts() as any;
  const { user } = useAuth();

  useAccountsReminder(accounts);

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

  const handleMonthChange = (startDate: Date, endDate: Date, month: number, year: number) => {
    setMonthFilter(month.toString());
    setYearFilter(year.toString());
  };

  const handleShowAll = () => {
    setMonthFilter('todos');
    setYearFilter('todos');
  };

  const today = new Date();
  const currentMonth = monthFilter === 'todos' ? today.getMonth() : parseInt(monthFilter, 10);
  const currentYear = parseInt(yearFilter, 10);
  const isShowingAll = monthFilter === 'todos';

  // --- Garantir "Saldo Anterior" automático ---
  React.useEffect(() => {
    if (!user || loading) return;

    const ensureSaldoAnteriorForViewedMonth = async () => {
      try {
        if (Number.isNaN(currentMonth) || Number.isNaN(currentYear)) return;

        const targetMonth = currentMonth;
        const targetYear = currentYear;

        let prevMonth = targetMonth - 1;
        let prevYear = targetYear;
        if (prevMonth < 0) {
          prevMonth = 11;
          prevYear = targetYear - 1;
        }

        // saldo anterior do mês anterior (se existir)
        const saldoAnteriorPrev = (() => {
          const found = accounts.find(acc => {
            if (!acc.dueDate) return false;
            const d = new Date(acc.dueDate + 'T00:00:00');
            return (
              acc.description === 'Saldo Anterior' &&
              d.getFullYear() === prevYear &&
              d.getMonth() === prevMonth
            );
          });
          if (!found) return 0;
          return found.type === 'receita'
            ? found.amount
            : -Math.abs(found.amount);
        })();

        // contas do mês anterior (sem saldo anterior)
        const prevMonthAccounts = accounts.filter(acc => {
          if (!acc.dueDate) return false;
          const d = new Date(acc.dueDate + 'T00:00:00');
          return (
            d.getFullYear() === prevYear &&
            d.getMonth() === prevMonth &&
            acc.description !== 'Saldo Anterior'
          );
        });

        const totalRecebidoPrev = prevMonthAccounts
          .filter(a => a.type === 'receita' && a.status === 'recebido')
          .reduce((s, a) => s + (a.amount || 0), 0);

        const totalPagoPrev = prevMonthAccounts
          .filter(a => a.type === 'despesa' && a.status === 'pago')
          .reduce((s, a) => s + Math.abs(a.amount || 0), 0);

        // ✅ saldo final do mês anterior
        const saldoFinalPrev = saldoAnteriorPrev + totalRecebidoPrev - totalPagoPrev;

        // data alvo: dia 01 do mês corrente
        const targetDueDate = `${String(targetYear)}-${String(targetMonth + 1).padStart(2, '0')}-01`;

        // já existe saldo anterior nesse mês?
        const { data: existing, error: checkError } = await supabase
          .from('accounts')
          .select('id')
          .eq('user_id', user.id)
          .eq('due_date', targetDueDate)
          .eq('description', 'Saldo Anterior')
          .limit(1);

        if (checkError) {
          console.error('Erro ao checar Saldo Anterior existente', checkError);
          return;
        }

        const alreadyExists = existing && existing.length > 0;

        if (!alreadyExists) {
          const type = saldoFinalPrev >= 0 ? 'receita' : 'despesa';
          const status = saldoFinalPrev >= 0 ? 'recebido' : 'pago';
          const amount = Math.abs(saldoFinalPrev);

          const { error: insertError } = await supabase
            .from('accounts')
            .insert([{
              description: 'Saldo Anterior',
              amount,
              category: 'Saldo Anterior',
              due_date: targetDueDate,
              data_conta: targetDueDate,
              type,
              status,
              user_id: user.id,
              payment_source: 'bank'
            }]);

          if (insertError) {
            console.error('Erro ao inserir Saldo Anterior:', insertError);
            return;
          }

          if (typeof refreshAccounts === 'function') {
            await refreshAccounts();
          }
        }
      } catch (e) {
        console.error('Erro ao garantir Saldo Anterior automático:', e);
      }
    };

    ensureSaldoAnteriorForViewedMonth();
  }, [accounts, currentMonth, currentYear, user, loading, refreshAccounts]);

  // saldo anterior do mês atual
  const previousBalance = React.useMemo(() => {
    if (!accounts || accounts.length === 0) return 0;
    const found = accounts.find(acc => {
      if (!acc.dueDate) return false;
      const d = new Date(acc.dueDate + 'T00:00:00');
      return (
        acc.description === 'Saldo Anterior' &&
        d.getFullYear() === currentYear &&
        d.getMonth() === currentMonth
      );
    });
    if (!found) return 0;
    return found.type === 'receita' ? found.amount : -Math.abs(found.amount);
  }, [accounts, currentMonth, currentYear]);

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
      <Layout>{renderContent()}</Layout>
    </AccessControlWrapper>
  );
};

export default Contas;
