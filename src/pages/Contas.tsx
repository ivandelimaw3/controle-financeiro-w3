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
          // Para meses diferentes de janeiro, SEMPRE recalcular e atualizar o saldo anterior
          const targetDueDate = new Date(targetYear, targetMonth, 1).toISOString().split("T")[0];

          // Calcular o saldo final do mês anterior
          const prevMonth = targetMonth - 1;
          const prevYear = targetYear;
          
          // Buscar todas as contas do mês anterior
          const prevStart = new Date(prevYear, prevMonth, 1).toISOString().split("T")[0];
          const prevEnd = new Date(prevYear, prevMonth + 1, 0).toISOString().split("T")[0];

          const { data: prevRows, error: prevErr } = await supabase
            .from("accounts")
            .select("amount, type, status, description")
            .eq("user_id", user.id)
            .gte("due_date", prevStart)
            .lte("due_date", prevEnd);

          if (prevErr) {
            console.error("[SaldoAnterior] erro ao buscar contas do mês anterior:", prevErr);
            return;
          }

          const allPrevAccounts = (prevRows || []) as any[];

          // Calcular o saldo final do mês anterior
          let saldoAnteriorPrev = 0;
          const saldoAnteriorRow = allPrevAccounts.find(a => a.description === "Saldo Anterior");
          if (saldoAnteriorRow) {
            saldoAnteriorPrev =
              saldoAnteriorRow.type === "receita"
                ? saldoAnteriorRow.amount
                : -Math.abs(saldoAnteriorRow.amount);
          }

          // Contas reais do mês anterior
          const prevMonthAccounts = allPrevAccounts.filter(a => a.description !== "Saldo Anterior");

          const totalRecebidoPrev = prevMonthAccounts
            .filter(a => a.type === "receita" && a.status === "recebido")
            .reduce((s, a) => s + (a.amount || 0), 0);

          const totalPagoPrev = prevMonthAccounts
            .filter(a => a.type === "despesa" && a.status === "pago")
            .reduce((s, a) => s + Math.abs(a.amount || 0), 0);

          // Saldo final do mês anterior (este é o saldo anterior correto para o mês atual)
          const saldoFinalPrev = saldoAnteriorPrev + totalRecebidoPrev - totalPagoPrev;

          // Verificar se já existe saldo anterior para este mês
          const { data: existing, error: checkError } = await supabase
            .from("accounts")
            .select("id, amount, type")
            .eq("user_id", user.id)
            .eq("due_date", targetDueDate)
            .eq("description", "Saldo Anterior")
            .limit(1);

          if (checkError) {
            console.error("[SaldoAnterior] erro ao checar existência:", checkError);
            return;
          }

          const existingBalance = existing && existing.length > 0 ? existing[0] : null;
          const currentStoredBalance = existingBalance 
            ? (existingBalance.type === "receita" ? existingBalance.amount : -Math.abs(existingBalance.amount))
            : 0;

          // Se o saldo calculado é diferente do armazenado, atualizar
          if (Math.abs(saldoFinalPrev - currentStoredBalance) > 0.01) {
            console.log(`🔄 Atualizando saldo anterior de ${targetMonth + 1}/${targetYear}: ${currentStoredBalance} → ${saldoFinalPrev}`);
            
            // Remover saldo anterior existente se houver
            if (existingBalance) {
              await supabase
                .from("accounts")
                .delete()
                .eq("user_id", user.id)
                .eq("due_date", targetDueDate)
                .eq("description", "Saldo Anterior");
            }

            // Criar novo saldo anterior com valor correto (se não for zero)
            if (Math.abs(saldoFinalPrev) > 0.01) {
              const insertPayload = {
                description: "Saldo Anterior",
                amount: Math.abs(saldoFinalPrev),
                category: "Saldo Anterior",
                due_date: targetDueDate,
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
            }

            // Recarregar dados
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

  // Calcular previousBalance a partir do registro "Saldo Anterior"
  const previousBalance = React.useMemo(() => {
    if (!accounts || accounts.length === 0) return 0;
    
    // Se está mostrando todos os meses, sempre usar o saldo anterior de janeiro
    // Caso contrário, usar o saldo anterior do mês atual
    const targetMonth = isShowingAll ? 0 : currentMonth;
    const targetYear = currentYear;
    
    const found = accounts.find(acc => {
      if (!acc.dueDate) return false;
      const d = new Date(acc.dueDate + "T00:00:00");
      return acc.description === "Saldo Anterior" && 
             d.getFullYear() === targetYear && 
             d.getMonth() === targetMonth;
    });

    if (!found) return 0;
    return found.type === "receita" ? found.amount : -Math.abs(found.amount);
  }, [accounts, currentMonth, currentYear, isShowingAll]);

  // Função para filtrar contas para cálculos dos cards (usando as mesmas contas da tabela)
  const getFilteredAccountsForCalculations = React.useCallback(() => {
    // Usar exatamente as mesmas contas da tabela, sem excluir "Saldo Anterior"
    return filteredAccounts;
  }, [filteredAccounts]);

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
            previousBalance={previousBalance} 
          />

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

          <AccountModal
            isOpen={isModalOpen}
            onClose={handleModalClose}
            onSubmit={handleSubmit}
            account={editingAccount}
            categories={categories}
          />
        </div>
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