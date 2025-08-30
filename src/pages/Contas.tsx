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
  // agora pegamos também refreshAccounts (se o contexto expõe)
  const { accounts, loading, refreshAccounts } = useAccounts() as any;
  const { user } = useAuth();

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
    setMonthFilter(month.toString());
    setYearFilter(year.toString());
  };

  // Handler para mostrar todos os meses
  const handleShowAll = () => {
    setMonthFilter('todos');
    setYearFilter('todos');
  };

  // Obter mês e ano atual - sempre inicializar no mês atual
  const today = new Date();
  const currentMonth = monthFilter === 'todos' ? today.getMonth() : parseInt(monthFilter, 10);
  const currentYear = parseInt(yearFilter, 10);
  const isShowingAll = monthFilter === 'todos';

  // --- Garantir "Saldo Anterior" automático quando o usuário navega para um mês ---
  React.useEffect(() => {
    // só tentar quando accounts carregadas e user existir
    if (!user || loading) return;

    const ensureSaldoAnteriorForViewedMonth = async () => {
      try {
        if (Number.isNaN(currentMonth) || Number.isNaN(currentYear)) return;

        // mês/ano que estamos visualizando (target)
        const targetMonth = currentMonth; // 0..11
        const targetYear = currentYear;

        // calcular mês/ano anterior
        let prevMonth = targetMonth - 1;
        let prevYear = targetYear;
        if (prevMonth < 0) {
          prevMonth = 11;
          prevYear = targetYear - 1;
        }

        // filtrar contas do mês anterior EXCLUINDO registros "Saldo Anterior"
        const prevMonthAccounts = accounts.filter(acc => {
          if (!acc.dueDate) return false;
          const d = new Date(acc.dueDate + 'T00:00:00'); // evitar timezone
          return d.getFullYear() === prevYear && d.getMonth() === prevMonth && acc.description !== 'Saldo Anterior';
        });

        // calcular saldo final do mês anterior
        const totalRecebido = prevMonthAccounts
          .filter(a => a.type === 'receita' && a.status === 'recebido')
          .reduce((s, a) => s + (a.amount || 0), 0);

        const totalPago = prevMonthAccounts
          .filter(a => a.type === 'despesa' && a.status === 'pago')
          .reduce((s, a) => s + Math.abs(a.amount || 0), 0);

        const saldoFinalPrev = totalRecebido - totalPago;

        // data alvo para o registro "Saldo Anterior" (dia 01 do mês visualizado)
        const targetDueDate = `${String(targetYear)}-${String(targetMonth + 1).padStart(2, '0')}-01`;

        // verificar se já existe um "Saldo Anterior" para essa data
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

        // criar apenas se não existir E se houver saldo diferente de zero.
        // (se preferir criar mesmo quando zero, remova a checagem saldoFinalPrev !== 0)
        if (!alreadyExists && saldoFinalPrev !== 0) {
          const type = saldoFinalPrev >= 0 ? 'receita' : 'despesa';
          const status = saldoFinalPrev >= 0 ? 'recebido' : 'pago';
          const amount = Math.abs(saldoFinalPrev);

          const { data: insertData, error: insertError } = await supabase
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
            }])
            .select();

          if (insertError) {
            console.error('Erro ao inserir Saldo Anterior:', insertError);
            return;
          }

          // Se o contexto expõe refreshAccounts, chamamos para recarregar e refletir o novo registro
          if (typeof refreshAccounts === 'function') {
            await refreshAccounts();
          } else {
            // fallback simples: atualizar localmente a lista (se accounts for mutável no contexto)
            // (se não houver refresh, o novo registro pode não aparecer até uma nova leitura)
            console.warn('refreshAccounts não disponível no contexto. O novo registro pode não aparecer até um refresh manual.');
          }
        }
      } catch (e) {
        console.error('Erro ao garantir Saldo Anterior automático:', e);
      }
    };

    ensureSaldoAnteriorForViewedMonth();
  }, [accounts, currentMonth, currentYear, user, loading, refreshAccounts]);

  // calcular previousBalance a partir de um registro "Saldo Anterior" na lista de contas
  const previousBalance = React.useMemo(() => {
    if (!accounts || accounts.length === 0) return 0;
    const found = accounts.find(acc => {
      if (!acc.dueDate) return false;
      const d = new Date(acc.dueDate + 'T00:00:00');
      return acc.description === 'Saldo Anterior' && d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });

    if (!found) return 0;
    // se for receita => valor positivo; se despesa => negativo
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
