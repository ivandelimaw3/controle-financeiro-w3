// pages/Contas.tsx
import React from 'react';
import { Layout } from '@/components/Layout';
import { AccountsHeader } from '@/components/Accounts/AccountsHeader';
import { AccountsFilters } from '@/components/Accounts/AccountsFilters';
import { AccountsSummaryCards } from '@/components/Accounts/AccountsSummaryCards';
import { AccountsTable } from '@/components/Accounts/AccountsTable';
import { AccountModal, AccountFormData } from '@/components/Accounts/AccountModal';
import { MonthNavigator } from '@/components/Accounts/MonthNavigator';
import { MonthlyReportTable } from '@/components/Accounts/MonthlyReportTable';
import { ReportsMonthNavigator } from '@/components/Accounts/ReportsMonthNavigator';
import { FinancialCard } from '@/components/Dashboard/FinancialCard';
import { AccessControlWrapper } from '@/components/AccessControlWrapper';
import { Loader2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useAccounts } from '@/contexts/AccountsContext';
import { useAccountsReminder } from '@/hooks/useAccountsReminder';
import { useAccountFilters } from '@/hooks/useAccountFilters';
import { usePaymentSourcePreviousBalance } from '@/hooks/usePaymentSourcePreviousBalance';
import { useAccountOperations } from '@/hooks/useAccountOperations';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/utils/formatters';

const Contas: React.FC = () => {
  const { accounts, loading, refreshAccounts } = useAccounts() as any;
  const { user } = useAuth();
  const [isShowingReport, setIsShowingReport] = React.useState(false);
  const [reportMonth, setReportMonth] = React.useState(new Date().getMonth());
  const [reportYear, setReportYear] = React.useState(new Date().getFullYear());

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
    hasActiveSearch,
    isSearchingForPaymentSource
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
    setIsShowingReport(false);
    
    // Recarregar dados para garantir que os saldos anteriores estejam atualizados
    if (typeof refreshAccounts === "function") {
      await refreshAccounts();
    }
  };

  const handleShowAll = () => {
    const currentYear = new Date().getFullYear().toString();
    setMonthFilter('todos');
    setYearFilter(currentYear); // Definir o ano atual ao invés de 'todos'
    setIsShowingReport(false);
  };

  const handleShowReport = () => {
    setIsShowingReport(true);
    setMonthFilter('todos');
    setYearFilter('todos');
  };
  
  const handleBackToAccounts = () => {
    const now = new Date();
    setMonthFilter(now.getMonth().toString());
    setYearFilter(now.getFullYear().toString());
    setIsShowingReport(false);
  };
  
  const handleReportYearChange = (year: number) => {
    setReportYear(year);
  };

  // Calcular dados mensais para o ano selecionado
  const calculateMonthlyData = React.useMemo(() => {
    if (!accounts || accounts.length === 0 || !isShowingReport) return [];

    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // 0-11 (janeiro=0)
    const monthlyData = [];
    const targetYear = reportYear;

    // Calcular 12 meses para o ano selecionado
    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      const targetMonth = monthIndex;

      // Se o ano for futuro ou se for ano atual mas mês posterior ao atual, preencher com zeros
      if (targetYear > currentYear || (targetYear === currentYear && monthIndex > currentMonth)) {
        monthlyData.push({
          month: monthNames[monthIndex],
          totalRecebido: 0,
          totalPago: 0,
          saldoFinal: 0
        });
        continue;
      }
      
      // Filtrar contas do mês específico
      const monthAccounts = accounts.filter((acc: any) => {
        if (!acc.dueDate) return false;
        const d = new Date(acc.dueDate + "T00:00:00");
        return d.getFullYear() === targetYear && d.getMonth() === targetMonth;
      });

      // Separar saldo anterior das contas reais
      const saldoAnteriorAccount = monthAccounts.find((acc: any) => acc.description === "Saldo Anterior");
      const realAccounts = monthAccounts.filter((acc: any) => acc.description !== "Saldo Anterior");

      // Calcular saldo anterior
      const saldoAnterior = saldoAnteriorAccount 
        ? (saldoAnteriorAccount.type === "receita" ? saldoAnteriorAccount.amount : -Math.abs(saldoAnteriorAccount.amount))
        : 0;

      // Calcular totais do mês (incluindo saldo anterior no total recebido)
      const totalRecebido = realAccounts
        .filter((acc: any) => acc.type === "receita" && acc.status === "recebido")
        .reduce((sum: number, acc: any) => sum + (acc.amount || 0), 0) + Math.max(0, saldoAnterior);

      const totalPago = realAccounts
        .filter((acc: any) => acc.type === "despesa" && acc.status === "pago")
        .reduce((sum: number, acc: any) => sum + Math.abs(acc.amount || 0), 0);

      // Saldo final = saldo anterior + recebido - pago
      const saldoFinal = saldoAnterior + (totalRecebido - Math.max(0, saldoAnterior)) - totalPago;

      monthlyData.push({
        month: monthNames[targetMonth],
        totalRecebido,
        totalPago,
        saldoFinal
      });
    }

    return monthlyData;
  }, [accounts, isShowingReport, reportYear]);

  // Calcular totais gerais do ano selecionado
  const calculateTotalsReport = React.useMemo(() => {
    if (calculateMonthlyData.length === 0) {
      return { totalReceived: 0, totalPaid: 0, finalBalance: 0 };
    }

    const totalReceived = calculateMonthlyData.reduce((sum, data) => sum + data.totalRecebido, 0);
    const totalPaid = calculateMonthlyData.reduce((sum, data) => sum + data.totalPago, 0);
    
    // O saldo final deve ser o saldo do último mês com dados (mês atual ou último mês do ano)
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    // Se é o ano atual, usar o mês atual, senão usar dezembro
    const lastMonthIndex = reportYear === currentYear ? currentMonth : 11;
    const finalBalance = calculateMonthlyData[lastMonthIndex]?.saldoFinal || 0;

    return { totalReceived, totalPaid, finalBalance };
  }, [calculateMonthlyData, reportYear]);

  const today = new Date();
  const currentMonth = monthFilter === 'todos' ? today.getMonth() : parseInt(monthFilter, 10);
  const currentYear = yearFilter === 'todos' ? today.getFullYear() : parseInt(yearFilter, 10);
  const isShowingAll = monthFilter === 'todos' && !isShowingReport;

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

  // Usar o hook para saldo anterior por fonte de pagamento
  const paymentSourcePreviousBalance = usePaymentSourcePreviousBalance({
    accounts,
    searchTerm,
    currentMonth,
    currentYear,
    isSearchingForPaymentSource
  });

  // Calcular previousBalance sempre correto para o mês/ano selecionado
  const previousBalance = React.useMemo(() => {
    if (!accounts || accounts.length === 0) return 0;
    
    console.log(`💰 CALCULANDO PREVIOUS BALANCE FINAL:`);
    console.log(`   Mês: ${currentMonth + 1}/${currentYear}`);
    console.log(`   É pesquisa por fonte: ${isSearchingForPaymentSource}`);
    console.log(`   Termo pesquisa: "${searchTerm}"`);
    
    // Se está pesquisando por fonte específica, usar o saldo calculado dessa fonte
    if (isSearchingForPaymentSource) {
      console.log(`   Usando saldo da fonte específica: ${paymentSourcePreviousBalance}`);
      return paymentSourcePreviousBalance;
    }
    
    // Caso contrário, buscar o saldo anterior do mês selecionado
    const targetMonth = currentMonth;
    const targetYear = currentYear;
    
    const saldoAnteriorAccount = accounts.find(acc => {
      if (!acc.dueDate || acc.description !== "Saldo Anterior") return false;
      const accDate = new Date(acc.dueDate + "T00:00:00");
      return accDate.getFullYear() === targetYear && 
             accDate.getMonth() === targetMonth;
    });

    const balance = saldoAnteriorAccount 
      ? (saldoAnteriorAccount.type === "receita" ? saldoAnteriorAccount.amount : -Math.abs(saldoAnteriorAccount.amount))
      : 0;
      
    console.log(`   Saldo anterior geral encontrado: ${balance}`);
    return balance;
  }, [accounts, currentMonth, currentYear, isSearchingForPaymentSource, paymentSourcePreviousBalance, searchTerm]);

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
        {isShowingReport ? (
          <ReportsMonthNavigator
            currentYear={reportYear}
            onYearChange={handleReportYearChange}
            onBackToAccounts={handleBackToAccounts}
          />
        ) : (
          <AccountsHeader 
            onNewAccount={handleNewAccount} 
            onReportsToggle={handleShowReport}
            showReports={false}
          />
        )}

        {isShowingReport ? (
          <>
            {/* Cards de resumo para relatórios */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <FinancialCard
                title="Total Recebido"
                value={formatCurrency(calculateTotalsReport.totalReceived)}
                icon={TrendingUp}
                bgColor="bg-green-500"
              />
              <FinancialCard
                title="Total Pago"
                value={formatCurrency(calculateTotalsReport.totalPaid)}
                icon={TrendingDown}
                bgColor="bg-red-500"
              />
              <FinancialCard
                title="Saldo Final"
                value={formatCurrency(calculateTotalsReport.finalBalance)}
                icon={DollarSign}
                bgColor={calculateTotalsReport.finalBalance >= 0 ? 'bg-green-500' : 'bg-red-500'}
              />
            </div>

            {/* Tabela de relatório mensal */}
            <MonthlyReportTable
              monthlyData={calculateMonthlyData}
              totalReceived={calculateTotalsReport.totalReceived}
              totalPaid={calculateTotalsReport.totalPaid}
              finalBalance={calculateTotalsReport.finalBalance}
            />
          </>
        ) : (
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

            {/* Cards de resumo sempre com valores corretos */}
            <AccountsSummaryCards 
              accounts={filteredAccounts} 
              previousBalance={previousBalance}
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
              onShowReport={handleShowReport}
              isShowingReport={isShowingReport}
            />

            <AccountsTable
              accounts={filteredAccounts}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          </div>
        )}

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
