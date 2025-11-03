// pages/Contas.tsx
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
    filteredAccounts,
    hasActiveSearch
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

  const handleMonthChange = async (startDate: Date, endDate: Date, month: number, year: number) => {
    setMonthFilter(month.toString());
    setYearFilter(year.toString());
    
    // Recarregar dados para garantir que os saldos anteriores estejam atualizados
    if (typeof refreshAccounts === "function") {
      await refreshAccounts();
    }
  };

  const handleShowAll = () => {
    const currentYear = new Date().getFullYear().toString();
    setMonthFilter('todos');
    setYearFilter(currentYear); // Definir o ano atual ao invés de 'todos'
  };

  const today = new Date();
  const currentMonth = monthFilter === 'todos' ? today.getMonth() : parseInt(monthFilter, 10);
  const currentYear = yearFilter === 'todos' ? today.getFullYear() : parseInt(yearFilter, 10);
  const isShowingAll = monthFilter === 'todos';

  // Calcular saldo acumulado até um determinado mês/ano (OTIMIZADO)
  const calculateAccumulatedBalance = React.useCallback((untilMonth: number, untilYear: number) => {
    if (!accounts || accounts.length === 0) return 0;
    
    let totalRecebido = 0;
    let totalPago = 0;
    
    // Uma única iteração sobre as contas
    for (const acc of accounts) {
      if (!acc.dueDate || acc.description === "Saldo Anterior") continue;
      
      const d = new Date(acc.dueDate + "T00:00:00");
      const accYear = d.getFullYear();
      const accMonth = d.getMonth();
      
      // Verificar se está dentro do período
      if (accYear < untilYear || (accYear === untilYear && accMonth <= untilMonth)) {
        if (acc.type === "receita" && acc.status === "recebido") {
          totalRecebido += acc.amount;
        } else if (acc.type === "despesa" && acc.status === "pago") {
          totalPago += Math.abs(acc.amount);
        }
      }
    }
    
    return totalRecebido - totalPago;
  }, [accounts]);

  // Calcular previousBalance dinamicamente baseado no saldo final do mês anterior
  const previousBalance = React.useMemo(() => {
    if (!accounts || accounts.length === 0) return 0;
    
    const targetMonth = isShowingAll ? 0 : currentMonth;
    const targetYear = currentYear;
    
    // Para janeiro, calcular baseado em dezembro do ano anterior
    if (targetMonth === 0) {
      return calculateAccumulatedBalance(11, targetYear - 1);
    }
    
    // Para outros meses, calcular baseado no mês anterior do mesmo ano
    return calculateAccumulatedBalance(targetMonth - 1, targetYear);
  }, [accounts, currentMonth, currentYear, isShowingAll, calculateAccumulatedBalance]);

  // Função para obter o saldo anterior do mês anterior (para meses subsequentes)
  const getPreviousMonthBalance = React.useCallback(() => {
    if (!accounts || accounts.length === 0) return 0;
    
    // Para janeiro, usar o saldo anterior calculado
    if (currentMonth === 0) {
      return previousBalance;
    }
    
    // Para outros meses, buscar o saldo anterior do mês anterior
    const prevMonth = currentMonth - 1;
    const prevYear = currentYear;
    
    const found = accounts.find((acc: any) => {
      if (!acc.dueDate) return false;
      const d = new Date(acc.dueDate + "T00:00:00");
      return acc.description === "Saldo Anterior" && 
             d.getFullYear() === prevYear && 
             d.getMonth() === prevMonth;
    });

    if (!found) return 0;
    return found.type === "receita" ? found.amount : -Math.abs(found.amount);
  }, [accounts, currentMonth, currentYear, previousBalance]);

  // Função para calcular o saldo final do mês atual baseado no saldo anterior (OTIMIZADO)
  const calculateCurrentMonthBalance = React.useMemo(() => {
    if (!accounts || accounts.length === 0) return 0;
    
    let totalRecebido = 0;
    let totalPago = 0;
    
    // Uma única iteração
    for (const acc of accounts) {
      if (!acc.dueDate || acc.description === "Saldo Anterior") continue;
      
      const d = new Date(acc.dueDate + "T00:00:00");
      if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
        if (acc.type === "receita" && acc.status === "recebido") {
          totalRecebido += acc.amount || 0;
        } else if (acc.type === "despesa" && acc.status === "pago") {
          totalPago += Math.abs(acc.amount || 0);
        }
      }
    }

    return previousBalance + totalRecebido - totalPago;
  }, [accounts, currentMonth, currentYear, previousBalance]);

  // Função para filtrar contas para cálculos (excluindo o saldo anterior)
  const getFilteredAccountsForCalculations = React.useCallback(() => {
    if (!accounts) return [];
    
    return accounts.filter((acc: any) => {
      if (!acc.dueDate) return false;
      const d = new Date(acc.dueDate + "T00:00:00");
      
      // Se está mostrando todos os meses, incluir apenas de janeiro até o mês atual
      if (isShowingAll) {
        const today = new Date();
        const currentMonthIndex = today.getMonth(); // 0-11
        const accountMonth = d.getMonth(); // 0-11
        
        return d.getFullYear() === currentYear && 
               accountMonth <= currentMonthIndex && 
               acc.description !== "Saldo Anterior";
      }
      
      // Caso contrário, filtrar apenas o mês específico
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth && 
             acc.description !== "Saldo Anterior";
    });
  }, [accounts, currentMonth, currentYear, isShowingAll]);

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
        <AccountsHeader 
          onNewAccount={handleNewAccount}
        />

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

          {/* Atualizando o AccountsSummaryCards para incluir o saldo anterior correto */}
          <AccountsSummaryCards 
            accounts={hasActiveSearch ? filteredAccounts : getFilteredAccountsForCalculations()} 
            previousBalance={hasActiveSearch ? 0 : previousBalance} 
            isJanuary={currentMonth === 0}
          />

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
      <Layout>
        {renderContent()}
      </Layout>
    </AccessControlWrapper>
  );
};

export default Contas;
