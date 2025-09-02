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

  // --- Garantir "Saldo Anterior" automático para qualquer mês ---
  React.useEffect(() => {
    if (!user || loading) return;

    const ensureSaldoAnteriorForMonth = async () => {
      try {
        if (Number.isNaN(currentMonth) || Number.isNaN(currentYear)) return;

        const targetMonth = currentMonth; // 0..11
        const targetYear = currentYear;

        // Para janeiro, vamos verificar se já existe saldo anterior do ano anterior
        if (targetMonth === 0) {
          // Calcular mês/ano anterior (dezembro do ano anterior)
          const prevMonth = 11;
          const prevYear = targetYear - 1;

          // Range do mês anterior (dezembro)
          const prevStart = new Date(prevYear, prevMonth, 1).toISOString().split("T")[0];
          const prevEnd = new Date(prevYear, prevMonth + 1, 0).toISOString().split("T")[0];

          // Buscar todos os lançamentos do mês anterior
          const { data: prevRows, error: prevErr } = await supabase
            .from("accounts")
            .select("amount, type, status, description, due_date")
            .eq("user_id", user.id)
            .gte("due_date", prevStart)
            .lte("due_date", prevEnd);

          if (prevErr) {
            console.error("[SaldoAnterior] erro ao buscar contas do mês anterior:", prevErr);
            return;
          }

          const allPrevAccounts = (prevRows || []) as any[];

          // Saldo anterior já lançado no mês anterior
          let saldoAnteriorPrev = 0;
          const saldoAnteriorRow = allPrevAccounts.find(a => a.description === "Saldo Anterior");
          if (saldoAnteriorRow) {
            saldoAnteriorPrev =
              saldoAnteriorRow.type === "receita"
                ? saldoAnteriorRow.amount
                : -Math.abs(saldoAnteriorRow.amount);
          }

          // Contas reais
          const prevMonthAccounts = allPrevAccounts.filter(a => a.description !== "Saldo Anterior");

          const totalRecebidoPrev = prevMonthAccounts
            .filter(a => a.type === "receita" && a.status === "recebido")
            .reduce((s, a) => s + (a.amount || 0), 0);

          const totalPagoPrev = prevMonthAccounts
            .filter(a => a.type === "despesa" && a.status === "pago")
            .reduce((s, a) => s + Math.abs(a.amount || 0), 0);

          // ✅ Saldo final do mês anterior
          const saldoFinalPrev = saldoAnteriorPrev + totalRecebidoPrev - totalPagoPrev;

          // Data alvo para o "Saldo Anterior" do mês atual (janeiro)
          const targetDueDate = new Date(targetYear, targetMonth, 1).toISOString().split("T")[0];

          const { data: existing, error: checkError } = await supabase
            .from("accounts")
            .select("id")
            .eq("user_id", user.id)
            .eq("due_date", targetDueDate)
            .eq("description", "Saldo Anterior")
            .limit(1);

          if (checkError) {
            console.error("[SaldoAnterior] erro ao checar existência:", checkError);
            return;
          }

          const alreadyExists = existing && existing.length > 0;
          if (!alreadyExists) {
            const insertPayload = {
              description: "Saldo Anterior",
              amount: Math.abs(saldoFinalPrev),
              category: "Saldo Anterior",
              due_date: targetDueDate,
              data_conta: targetDueDate,
              type: saldoFinalPrev >= 0 ? "receita" : "despesa",
              status: saldoFinalPrev >= 0 ? "recebido" : "pago",
              user_id: user.id,
              payment_source: "bank"
            };

            const { error: insertError } = await supabase.from("accounts").insert([insertPayload]);

            if (insertError) {
              console.error("[SaldoAnterior] erro ao inserir:", insertError);
              return;
            }

            if (typeof refreshAccounts === "function") {
              await refreshAccounts();
            }
          }
        } else {
          // Para meses diferentes de janeiro, verificar se já existe saldo anterior para esse mês
          // Se não existir, criar com valor zero
          const targetDueDate = new Date(targetYear, targetMonth, 1).toISOString().split("T")[0];

          const { data: existing, error: checkError } = await supabase
            .from("accounts")
            .select("id")
            .eq("user_id", user.id)
            .eq("due_date", targetDueDate)
            .eq("description", "Saldo Anterior")
            .limit(1);

          if (checkError) {
            console.error("[SaldoAnterior] erro ao checar existência:", checkError);
            return;
          }

          const alreadyExists = existing && existing.length > 0;
          if (!alreadyExists) {
            // Criar saldo anterior com valor zero para meses após janeiro
            const insertPayload = {
              description: "Saldo Anterior",
              amount: 0,
              category: "Saldo Anterior",
              due_date: targetDueDate,
              data_conta: targetDueDate,
              type: "receita",
              status: "recebido",
              user_id: user.id,
              payment_source: "bank"
            };

            const { error: insertError } = await supabase.from("accounts").insert([insertPayload]);

            if (insertError) {
              console.error("[SaldoAnterior] erro ao inserir:", insertError);
              return;
            }

            if (typeof refreshAccounts === "function") {
              await refreshAccounts();
            }
          }
        }
      } catch (err) {
        console.error("[SaldoAnterior] exceção inesperada:", err);
      }
    };

    ensureSaldoAnteriorForMonth();
  }, [currentMonth, currentYear, user, loading, refreshAccounts]);

  // Calcular previousBalance a partir do registro "Saldo Anterior" do mês atual
  const previousBalance = React.useMemo(() => {
    if (!accounts || accounts.length === 0) return 0;
    const found = accounts.find(acc => {
      if (!acc.dueDate) return false;
      const d = new Date(acc.dueDate + "T00:00:00");
      return acc.description === "Saldo Anterior" && d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });

    if (!found) return 0;
    return found.type === "receita" ? found.amount : -Math.abs(found.amount);
  }, [accounts, currentMonth, currentYear]);

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

  // Função para calcular o saldo final do mês atual baseado no saldo anterior
  const calculateCurrentMonthBalance = React.useMemo(() => {
    if (!accounts || accounts.length === 0) return 0;
    
    // Filtrar apenas contas do mês atual (exceto o saldo anterior)
    const currentMonthAccounts = accounts.filter((acc: any) => {
      if (!acc.dueDate) return false;
      const d = new Date(acc.dueDate + "T00:00:00");
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth && 
             acc.description !== "Saldo Anterior";
    });

    const totalRecebido = currentMonthAccounts
      .filter((acc: any) => acc.type === "receita" && acc.status === "recebido")
      .reduce((sum: number, acc: any) => sum + (acc.amount || 0), 0);

    const totalPago = currentMonthAccounts
      .filter((acc: any) => acc.type === "despesa" && acc.status === "pago")
      .reduce((sum: number, acc: any) => sum + Math.abs(acc.amount || 0), 0);

    return previousBalance + totalRecebido - totalPago;
  }, [accounts, currentMonth, currentYear, previousBalance]);

  // Função para filtrar contas para cálculos (excluindo o saldo anterior)
  const getFilteredAccountsForCalculations = React.useCallback(() => {
    if (!accounts) return [];
    
    return accounts.filter((acc: any) => {
      if (!acc.dueDate) return false;
      const d = new Date(acc.dueDate + "T00:00:00");
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth && 
             acc.description !== "Saldo Anterior";
    });
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

          {/* Atualizando o AccountsSummaryCards para incluir o saldo anterior correto */}
          <AccountsSummaryCards 
            accounts={getFilteredAccountsForCalculations()} 
            previousBalance={getPreviousMonthBalance()} 
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
