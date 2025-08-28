import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export interface Account {
  id: number;
  description: string;
  amount: number;
  category: string;
  dueDate: string;
  dataConta?: string;
  type: 'receita' | 'despesa';
  status: 'pendente' | 'pago' | 'recebido';
  parcela?: string;
  recorrente_id?: string;
  bank_id?: number;
  payment_source: 'bank';
  payment_source_id?: number;
  payment_source_name?: string;
}

export interface CreateAccountData extends Omit<Account, 'id' | 'parcela' | 'recorrente_id'> {
  qtd_parcelas?: number;
}

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  category: string;
  dueDate: string;
  dataConta?: string;
  type: 'receita' | 'despesa';
  status: 'pendente' | 'pago' | 'recebido';
  parcela?: string;
  recorrente_id?: string;
  bank_id?: number;
  payment_source: 'bank';
  payment_source_id?: number;
  payment_source_name?: string;
}

export const useAccountsData = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const invalidateBanksCache = () => {
    queryClient.invalidateQueries({ queryKey: ['banks'] });
  };

  // ======================
  // FUNÇÕES DE SALDO ANTERIOR
  // ======================
  const getPreviousBalance = async (month: number, year: number): Promise<number> => {
    if (!user) return 0;

    const { data, error } = await supabase
      .from('previous_balance')
      .select('current_value')
      .eq('user_id', user.id)
      .eq('month', month)
      .eq('year', year)
      .single();

    if (error) {
      console.error('Erro ao buscar saldo anterior:', error);
      return 0;
    }

    return data?.current_value ?? 0;
  };

  const updateOrCreatePreviousBalance = async (month: number, year: number, value: number) => {
    if (!user) return;

    const { error } = await supabase
      .from('previous_balance')
      .upsert({
        user_id: user.id,
        month,
        year,
        current_value: value
      })
      .eq('user_id', user.id)
      .eq('month', month)
      .eq('year', year);

    if (error) {
      console.error('Erro ao atualizar ou criar saldo anterior:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o saldo anterior.',
        variant: 'destructive'
      });
    } else {
      // Atualizar saldo do mês seguinte automaticamente
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      await updateOrCreatePreviousBalance(nextMonth, nextYear, value);
    }
  };

  // ======================
  // CARREGAR CONTAS
  // ======================
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      if (!user) {
        setAccounts([]);
        return;
      }

      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar contas:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as contas.",
          variant: "destructive"
        });
        return;
      }

      const transformedAccounts: Account[] = data.map(account => ({
        id: account.id,
        description: account.description,
        amount: parseFloat(account.amount.toString()),
        category: account.category,
        dueDate: account.due_date,
        dataConta: account.data_conta,
        type: account.type as 'receita' | 'despesa',
        status: account.status as 'pendente' | 'pago' | 'recebido',
        parcela: account.parcela,
        recorrente_id: account.recorrente_id,
        bank_id: account.bank_id,
        payment_source: 'bank',
        payment_source_id: account.payment_source_id,
        payment_source_name: account.payment_source_name
      }));

      setAccounts(transformedAccounts);
    } catch (error) {
      console.error('Erro ao carregar contas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as contas.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // ======================
  // CRIAR CONTA
  // ======================
  const addAccount = async (accountData: CreateAccountData) => {
    try {
      if (!user) {
        toast({ title: "Erro", description: "Usuário não autenticado.", variant: "destructive" });
        return;
      }

      const registros: any[] = [];
      const recorrenteId = accountData.qtd_parcelas && accountData.qtd_parcelas > 1 ? crypto.randomUUID() : undefined;
      const qtd = accountData.qtd_parcelas ?? 1;
      const valorPorParcela = accountData.amount / qtd;

      for (let i = 0; i < qtd; i++) {
        const data = new Date(accountData.dueDate);
        data.setMonth(data.getMonth() + i);

        registros.push({
          description: accountData.description,
          amount: valorPorParcela,
          category: accountData.category,
          due_date: data.toISOString().split('T')[0],
          data_conta: accountData.dataConta,
          type: accountData.type,
          status: accountData.status,
          user_id: user.id,
          parcela: qtd > 1 ? `${i + 1}/${qtd}` : undefined,
          recorrente_id: recorrenteId,
          bank_id: accountData.bank_id,
          payment_source: 'bank',
          payment_source_id: accountData.payment_source_id,
          payment_source_name: accountData.payment_source_name
        });
      }

      const { data, error } = await supabase.from('accounts').insert(registros).select();

      if (error) {
        toast({ title: "Erro", description: "Não foi possível criar a conta.", variant: "destructive" });
        return;
      }

      const newAccounts: Account[] = data.map(acc => ({
        id: acc.id,
        description: acc.description,
        amount: parseFloat(acc.amount.toString()),
        category: acc.category,
        dueDate: acc.due_date,
        dataConta: acc.data_conta,
        type: acc.type,
        status: acc.status,
        parcela: acc.parcela,
        recorrente_id: acc.recorrente_id,
        bank_id: acc.bank_id,
        payment_source: 'bank',
        payment_source_id: acc.payment_source_id,
        payment_source_name: acc.payment_source_name
      }));

      setAccounts(prev => [...newAccounts, ...prev]);

      if (accountData.status === 'pago' || accountData.status === 'recebido') invalidateBanksCache();

      toast({ title: "Sucesso", description: "Conta criada com sucesso." });

    } catch (error) {
      console.error('Erro ao criar conta:', error);
      toast({ title: "Erro", description: "Não foi possível criar a conta.", variant: "destructive" });
    }
  };

  // ======================
  // ATUALIZAR CONTA
  // ======================
  const updateAccount = async (updatedAccount: Account) => {
    try {
      const { error } = await supabase
        .from('accounts')
        .update({
          description: updatedAccount.description,
          amount: updatedAccount.amount,
          category: updatedAccount.category,
          due_date: updatedAccount.dueDate,
          data_conta: updatedAccount.dataConta,
          type: updatedAccount.type,
          status: updatedAccount.status,
          bank_id: updatedAccount.bank_id,
          payment_source: 'bank',
          payment_source_id: updatedAccount.payment_source_id,
          payment_source_name: updatedAccount.payment_source_name
        })
        .eq('id', updatedAccount.id)
        .eq('user_id', user?.id);

      if (error) throw error;

      setAccounts(prev => prev.map(acc => acc.id === updatedAccount.id ? updatedAccount : acc));
      if (updatedAccount.status === 'pago' || updatedAccount.status === 'recebido') invalidateBanksCache();

      toast({ title: "Sucesso", description: "Conta atualizada com sucesso." });
    } catch (error) {
      console.error('Erro ao atualizar conta:', error);
      toast({ title: "Erro", description: "Não foi possível atualizar a conta.", variant: "destructive" });
    }
  };

  // ======================
  // DELETAR CONTA
  // ======================
  const deleteAccount = async (accountId: number) => {
    try {
      const accountToDelete = accounts.find(acc => acc.id === accountId);

      const { error } = await supabase.from('accounts').delete().eq('id', accountId);
      if (error) throw error;

      setAccounts(prev => prev.filter(acc => acc.id !== accountId));

      if (accountToDelete && (accountToDelete.status === 'pago' || accountToDelete.status === 'recebido')) invalidateBanksCache();

      toast({ title: "Sucesso", description: "Conta deletada com sucesso." });
    } catch (error) {
      console.error('Erro ao deletar conta:', error);
      toast({ title: "Erro", description: "Não foi possível deletar a conta.", variant: "destructive" });
    }
  };

  // ======================
  // ATUALIZAR STATUS
  // ======================
  const updateAccountStatus = async (id: number, status: 'pendente' | 'pago' | 'recebido') => {
    try {
      if (!user) {
        toast({ title: "Erro", description: "Usuário não autenticado.", variant: "destructive" });
        return;
      }

      const { error } = await supabase
        .from('accounts')
        .update({ status })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setAccounts(prev => prev.map(acc => acc.id === id ? { ...acc, status } : acc));
      invalidateBanksCache();

      toast({ title: "Sucesso", description: "Status da conta atualizado com sucesso." });
    } catch (error) {
      toast({ title: "Erro", description: "Erro inesperado ao atualizar status.", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (user) fetchAccounts();
    else {
      setAccounts([]);
      setLoading(false);
    }
  }, [user]);

  return {
    accounts,
    loading,
    addAccount,
    updateAccount,
    deleteAccount,
    updateAccountStatus,
    refreshAccounts: fetchAccounts,
    getPreviousBalance,
    updateOrCreatePreviousBalance
  };
};
