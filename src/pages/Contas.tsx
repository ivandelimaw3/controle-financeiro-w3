
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
    console.log(`🎯 NAVEGAÇÃO MESES - Mudando para: ${month}/${year}`);
    console.log(`   - startDate: ${startDate.toISOString()}`);
    console.log(`   - endDate: ${endDate.toISOString()}`);
    console.log(`   - month (0-based): ${month}`);
    console.log(`   - year: ${year}`);
    
    setMonthFilter(month.toString());
    setYearFilter(year.toString());
  };

  const handleShowAll = () => {
    console.log('🎯 NAVEGAÇÃO MESES - Mostrando todos os meses');
    setMonthFilter('todos');
    setYearFilter('todos');
  };

  const today = new Date();
  const currentMonth = monthFilter === 'todos' ? today.getMonth() : parseInt(monthFilter, 10);
  const currentYear = parseInt(yearFilter, 10);
  const isShowingAll = monthFilter === 'todos';

  console.log(`📊 ESTADO ATUAL DOS FILTROS:`);
  console.log(`   - monthFilter: "${monthFilter}"`);
  console.log(`   - currentMonth: ${currentMonth}`);
  console.log(`   - currentYear: ${currentYear}`);
  console.log(`   - isShowingAll: ${isShowingAll}`);

  // Função para garantir saldo anterior automático para qualquer mês/ano
  const ensurePreviousBalance = React.useCallback(async (targetMonth: number, targetYear: number) => {
    if (!user || isShowingAll) return;

    try {
      console.log(`🔄 === INICIANDO VERIFICAÇÃO SALDO ANTERIOR - MÊS ${targetMonth + 1}/${targetYear} ===`);
      
      // Data do primeiro dia do mês alvo
      const targetDate = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-01`;
      console.log(`📅 Data alvo para saldo anterior: ${targetDate}`);
      
      // Verificar se já existe saldo anterior para este mês
      const { data: existingBalance } = await supabase
        .from('accounts')
        .select('id, amount, type, description, due_date')
        .eq('user_id', user.id)
        .eq('due_date', targetDate)
        .eq('description', 'Saldo Anterior')
        .single();

      if (existingBalance) {
        console.log(`✅ Saldo anterior já existe para ${targetMonth + 1}/${targetYear}:`, existingBalance);
        console.log(`📊 Valor: ${existingBalance.type === 'receita' ? '+' : '-'}${existingBalance.amount}`);
        return;
      }

      // Calcular o saldo do mês anterior
      let prevMonth = targetMonth - 1;
      let prevYear = targetYear;
      if (prevMonth < 0) {
        prevMonth = 11;
        prevYear = targetYear - 1;
      }

      console.log(`🔍 Calculando saldo do mês anterior: ${prevMonth + 1}/${prevYear}`);

      // Buscar todas as contas do mês anterior
      const prevMonthStart = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-01`;
      const prevMonthEnd = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-31`;

      console.log(`📅 Período de busca: ${prevMonthStart} até ${prevMonthEnd}`);

      const { data: prevMonthAccounts, error: fetchError } = await supabase
        .from('accounts')
        .select('amount, type, status, description, due_date')
        .eq('user_id', user.id)
        .gte('due_date', prevMonthStart)
        .lte('due_date', prevMonthEnd);

      if (fetchError) {
        console.error('❌ Erro ao buscar contas do mês anterior:', fetchError);
        return;
      }

      console.log(`📋 Contas encontradas no mês ${prevMonth + 1}/${prevYear}:`, prevMonthAccounts?.length || 0);

      if (!prevMonthAccounts || prevMonthAccounts.length === 0) {
        console.log('⚠️ Nenhuma conta encontrada no mês anterior - saldo anterior será 0');
        return;
      }

      // Log de todas as contas do mês anterior
      console.log('📝 === CONTAS DO MÊS ANTERIOR ===');
      prevMonthAccounts.forEach(account => {
        console.log(`   ${account.description}: ${account.type} - R$ ${account.amount} (${account.status}) [${account.due_date}]`);
      });

      // Separar saldo anterior do mês anterior das contas reais
      let saldoAnteriorPrev = 0;
      const contasReais = prevMonthAccounts.filter(account => {
        if (account.description === 'Saldo Anterior') {
          saldoAnteriorPrev = account.type === 'receita' ? account.amount : -Math.abs(account.amount);
          console.log(`💰 Saldo anterior encontrado no mês ${prevMonth + 1}/${prevYear}: ${saldoAnteriorPrev}`);
          return false; // Remove da lista de contas reais
        }
        return true;
      });

      console.log(`📊 Contas reais do mês ${prevMonth + 1}/${prevYear}:`, contasReais.length);

      // Calcular totais do mês anterior
      const totalRecebido = contasReais
        .filter(a => a.type === 'receita' && a.status === 'recebido')
        .reduce((sum, a) => {
          console.log(`✅ Receita recebida: ${a.description} = R$ ${a.amount} (${a.due_date})`);
          return sum + a.amount;
        }, 0);

      const totalPago = contasReais
        .filter(a => a.type === 'despesa' && a.status === 'pago')
        .reduce((sum, a) => {
          console.log(`❌ Despesa paga: ${a.description} = R$ ${Math.abs(a.amount)} (${a.due_date})`);
          return sum + Math.abs(a.amount);
        }, 0);

      console.log(`📊 === RESUMO DO MÊS ${prevMonth + 1}/${prevYear} ===`);
      console.log(`💰 Saldo anterior: R$ ${saldoAnteriorPrev}`);
      console.log(`✅ Total recebido: R$ ${totalRecebido}`);
      console.log(`❌ Total pago: R$ ${totalPago}`);

      // Saldo final do mês anterior
      const saldoFinalPrev = saldoAnteriorPrev + totalRecebido - totalPago;
      console.log(`🏁 Saldo final do mês ${prevMonth + 1}/${prevYear}: R$ ${saldoFinalPrev}`);

      // Criar saldo anterior para o mês atual se diferente de zero
      if (Math.abs(saldoFinalPrev) > 0.01) {
        console.log(`🔄 Criando saldo anterior de R$ ${saldoFinalPrev} para ${targetDate}`);
        
        const { error } = await supabase.from('accounts').insert({
          user_id: user.id,
          description: 'Saldo Anterior',
          amount: Math.abs(saldoFinalPrev),
          category: 'Saldo Anterior',
          due_date: targetDate,
          data_conta: targetDate,
          type: saldoFinalPrev >= 0 ? 'receita' : 'despesa',
          status: saldoFinalPrev >= 0 ? 'recebido' : 'pago',
          payment_source: 'bank'
        });

        if (!error) {
          console.log('✅ Saldo anterior criado com sucesso');
          await refreshAccounts?.();
        } else {
          console.error('❌ Erro ao criar saldo anterior:', error);
        }
      } else {
        console.log('⚪ Saldo anterior é zero - não será criado');
      }
      
      console.log(`=== FIM VERIFICAÇÃO SALDO ANTERIOR - MÊS ${targetMonth + 1}/${targetYear} ===`);
    } catch (error) {
      console.error('❌ Erro ao garantir saldo anterior:', error);
    }
  }, [user, isShowingAll, refreshAccounts]);

  // Executar verificação quando mês/ano mudar
  React.useEffect(() => {
    if (!loading && !isShowingAll) {
      console.log(`🎯 useEffect triggered - verificando saldo anterior para ${currentMonth + 1}/${currentYear}`);
      ensurePreviousBalance(currentMonth, currentYear);
    }
  }, [currentMonth, currentYear, loading, ensurePreviousBalance]);

  // calcular previousBalance a partir do registro "Saldo Anterior" do mês atual
  const previousBalance = React.useMemo(() => {
    if (!accounts || accounts.length === 0 || isShowingAll) return 0;
    
    const targetDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
    const saldoAnteriorAccount = accounts.find(acc => 
      acc.dueDate === targetDate && acc.description === 'Saldo Anterior'
    );

    console.log(`💰 === CALCULANDO SALDO ANTERIOR MÊS ${currentMonth + 1}/${currentYear} ===`);
    console.log(`🎯 Buscando saldo anterior para data: ${targetDate}`);
    console.log('🔍 Conta encontrada:', saldoAnteriorAccount);

    if (!saldoAnteriorAccount) {
      console.log('⚪ Nenhum saldo anterior encontrado - retornando 0');
      return 0;
    }
    
    const balance = saldoAnteriorAccount.type === 'receita' 
      ? saldoAnteriorAccount.amount 
      : -Math.abs(saldoAnteriorAccount.amount);
      
    console.log(`💰 Saldo anterior calculado: R$ ${balance}`);
    console.log(`=== FIM CÁLCULO SALDO ANTERIOR ===`);
    
    return balance;
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
      <Layout>
        {renderContent()}
      </Layout>
    </AccessControlWrapper>
  );
};

export default Contas;
