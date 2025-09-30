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

  // --- Garantir "Saldo Anterior" automático por fonte de pagamento ---
  React.useEffect(() => {
    if (!user || loading) return;

    const ensureSaldoAnteriorPorFonte = async () => {
      try {
        if (Number.isNaN(currentMonth) || Number.isNaN(currentYear)) return;

        const targetMonth = currentMonth;
        const targetYear = currentYear;

        // Calcular mês/ano anterior
        const prevMonth = targetMonth === 0 ? 11 : targetMonth - 1;
        const prevYear = targetMonth === 0 ? targetYear - 1 : targetYear;

        // Range do mês anterior
        const prevStart = new Date(prevYear, prevMonth, 1).toISOString().split("T")[0];
        const prevEnd = new Date(prevYear, prevMonth + 1, 0).toISOString().split("T")[0];

        // Buscar todas as contas do mês anterior
        const { data: prevRows, error: prevErr } = await supabase
          .from("accounts")
          .select("amount, type, status, description, payment_source_id, payment_source_name")
          .eq("user_id", user.id)
          .gte("due_date", prevStart)
          .lte("due_date", prevEnd);

        if (prevErr) {
          console.error("[SaldoAnteriorPorFonte] erro ao buscar contas do mês anterior:", prevErr);
          return;
        }

        const allPrevAccounts = (prevRows || []) as any[];

        // Agrupar por fonte de pagamento (incluindo null para contas sem fonte)
        const fontes = new Map<string, { id: number | null; name: string | null }>();
        allPrevAccounts.forEach(acc => {
          if (acc.description !== 'Saldo Anterior') {
            const key = acc.payment_source_id ? `${acc.payment_source_id}` : 'null';
            if (!fontes.has(key)) {
              fontes.set(key, { 
                id: acc.payment_source_id || null, 
                name: acc.payment_source_name || null 
              });
            }
          }
        });

        // Para cada fonte, calcular saldo final do mês anterior
        for (const [fonteKey, fonte] of fontes.entries()) {
          // Buscar saldo anterior da fonte no mês anterior
          const saldoAnteriorPrevRow = allPrevAccounts.find(
            a => a.description === 'Saldo Anterior' && 
            (fonte.id ? a.payment_source_id === fonte.id : !a.payment_source_id)
          );
          
          let saldoAnteriorPrev = 0;
          if (saldoAnteriorPrevRow) {
            saldoAnteriorPrev = saldoAnteriorPrevRow.type === 'receita'
              ? saldoAnteriorPrevRow.amount
              : -Math.abs(saldoAnteriorPrevRow.amount);
          }

          // Contas reais da fonte no mês anterior
          const prevMonthAccountsFonte = allPrevAccounts.filter(
            a => a.description !== 'Saldo Anterior' && 
            (fonte.id ? a.payment_source_id === fonte.id : !a.payment_source_id)
          );

          const totalRecebidoPrev = prevMonthAccountsFonte
            .filter(a => a.type === 'receita' && a.status === 'recebido')
            .reduce((s, a) => s + (a.amount || 0), 0);

          const totalPagoPrev = prevMonthAccountsFonte
            .filter(a => a.type === 'despesa' && a.status === 'pago')
            .reduce((s, a) => s + Math.abs(a.amount || 0), 0);

          // Saldo final desta fonte no mês anterior
          const saldoFinalFonte = saldoAnteriorPrev + totalRecebidoPrev - totalPagoPrev;

          // Verificar se já existe saldo anterior desta fonte no mês atual
          const targetDueDate = new Date(targetYear, targetMonth, 1).toISOString().split("T")[0];

          let existing, checkError;
          
          if (fonte.id) {
            const result = await supabase
              .from("accounts")
              .select("id, amount, type")
              .eq("user_id", user.id)
              .eq("due_date", targetDueDate)
              .eq("description", "Saldo Anterior")
              .eq("payment_source_id", fonte.id)
              .limit(1);
            existing = result.data;
            checkError = result.error;
          } else {
            const result = await supabase
              .from("accounts")
              .select("id, amount, type")
              .eq("user_id", user.id)
              .eq("due_date", targetDueDate)
              .eq("description", "Saldo Anterior")
              .is("payment_source_id", null)
              .limit(1);
            existing = result.data;
            checkError = result.error;
          }

          if (checkError) {
            console.error("[SaldoAnteriorPorFonte] erro ao checar existência:", checkError);
            continue;
          }

          const existingBalance = existing && existing.length > 0 ? existing[0] : null;
          const currentStoredBalance = existingBalance
            ? (existingBalance.type === 'receita' ? existingBalance.amount : -Math.abs(existingBalance.amount))
            : 0;

          // Se o saldo calculado é diferente do armazenado, atualizar
          if (Math.abs(saldoFinalFonte - currentStoredBalance) > 0.01) {
            const fonteName = fonte.name || 'Sem fonte';
            console.log(`🔄 Atualizando saldo anterior de ${fonteName} em ${targetMonth + 1}/${targetYear}: ${currentStoredBalance} → ${saldoFinalFonte}`);

            // Remover saldo anterior existente se houver
            if (existingBalance) {
              await supabase
                .from("accounts")
                .delete()
                .eq("id", existingBalance.id);
            }

            // Criar novo saldo anterior com valor correto (se não for zero)
            if (Math.abs(saldoFinalFonte) > 0.01) {
              const insertPayload: any = {
                description: "Saldo Anterior",
                amount: Math.abs(saldoFinalFonte),
                category: "Saldo Anterior",
                due_date: targetDueDate,
                data_conta: targetDueDate,
                type: saldoFinalFonte >= 0 ? "receita" : "despesa",
                status: saldoFinalFonte >= 0 ? "recebido" : "pago",
                user_id: user.id,
                payment_source: "bank"
              };

              if (fonte.id) {
                insertPayload.payment_source_id = fonte.id;
                insertPayload.payment_source_name = fonte.name;
              }

              const { error: insertError } = await supabase.from("accounts").insert([insertPayload]);

              if (insertError) {
                console.error("[SaldoAnteriorPorFonte] erro ao inserir:", insertError);
                continue;
              }
            }

            // Recarregar dados
            if (typeof refreshAccounts === "function") {
              await refreshAccounts();
            }
          }
        }
      } catch (err) {
        console.error("[SaldoAnteriorPorFonte] exceção inesperada:", err);
      }
    };

    const timeoutId = setTimeout(() => {
      ensureSaldoAnteriorPorFonte();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [currentMonth, currentYear, user, loading]);

  // Calcular previousBalance a partir dos registros "Saldo Anterior" (soma de todas as fontes)
  const previousBalance = React.useMemo(() => {
    if (!accounts || accounts.length === 0) return 0;
    
    // Se está mostrando todos os meses, sempre usar o saldo anterior de janeiro
    // Caso contrário, usar o saldo anterior do mês atual
    const targetMonth = isShowingAll ? 0 : currentMonth;
    const targetYear = currentYear;
    
    // Buscar TODOS os registros de "Saldo Anterior" do mês/ano alvo
    const saldosAnteriores = accounts.filter(acc => {
      if (!acc.dueDate) return false;
      const d = new Date(acc.dueDate + "T00:00:00");
      return acc.description === "Saldo Anterior" && 
             d.getFullYear() === targetYear && 
             d.getMonth() === targetMonth;
    });

    // Somar todos os saldos anteriores (cada fonte tem seu próprio registro)
    return saldosAnteriores.reduce((sum, acc) => {
      const value = acc.type === "receita" ? acc.amount : -Math.abs(acc.amount);
      return sum + value;
    }, 0);
  }, [accounts, currentMonth, currentYear, isShowingAll]);

  // Função para obter o saldo anterior do mês anterior (para meses subsequentes)
  const getPreviousMonthBalance = React.useCallback(() => {
    if (!accounts || accounts.length === 0) return 0;
    
    // Para janeiro, usar o saldo anterior calculado
    if (currentMonth === 0) {
      return previousBalance;
    }
    
    // Para outros meses, buscar TODOS os saldos anteriores do mês anterior (uma entrada por fonte)
    const prevMonth = currentMonth - 1;
    const prevYear = currentYear;
    
    const saldosAnteriores = accounts.filter((acc: any) => {
      if (!acc.dueDate) return false;
      const d = new Date(acc.dueDate + "T00:00:00");
      return acc.description === "Saldo Anterior" && 
             d.getFullYear() === prevYear && 
             d.getMonth() === prevMonth;
    });

    // Somar todos os saldos anteriores
    return saldosAnteriores.reduce((sum, acc) => {
      const value = acc.type === "receita" ? acc.amount : -Math.abs(acc.amount);
      return sum + value;
    }, 0);
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
