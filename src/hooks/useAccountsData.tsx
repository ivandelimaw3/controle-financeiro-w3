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
  previous_balance?: number | null;
}

export interface CreateAccountData extends Omit<Account, 'id' | 'parcela' | 'recorrente_id'> {
  qtd_parcelas?: number;
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

  // Carregar contas do Supabase
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
        payment_source_name: account.payment_source_name,
        previous_balance: account.previous_balance ? parseFloat(account.previous_balance.toString()) : null,
      }));

      setAccounts(transformedAccounts);

    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as contas.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Criar ou atualizar "Saldo Mês Anterior"
  const upsertPreviousBalance = async (value: number) => {
    try {
      if (!user) return;

      // Checar se já existe account com previous_balance
      const { data: existingData, error: fetchError } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .not('previous_balance', 'is', null)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        toast({ title: "Erro", description: "Não foi possível buscar saldo anterior.", variant: "destructive" });
        return;
      }

      if (existingData) {
        // Atualizar
        const { error: updateError } = await supabase
          .from('accounts')
          .update({ previous_balance: value, description: 'Saldo Mês Anterior', type: 'receita', status: 'recebido' })
          .eq('id', existingData.id)
          .eq('user_id', user.id);

        if (updateError) {
          toast({ title: "Erro", description: "Não foi possível atualizar saldo anterior.", variant: "destructive" });
          return;
        }

        setAccounts(prev => prev.map(acc => acc.id === existingData.id ? { ...acc, previous_balance: value } : acc));

      } else {
        // Criar
        const { data: insertData, error: insertError } = await supabase
          .from('accounts')
          .insert([{
            description: 'Saldo Mês Anterior',
            amount: value,
            category: 'Saldo Inicial',
            due_date: new Date().toISOString().split('T')[0],
            type: 'receita',
            status: 'recebido',
            user_id: user.id,
            previous_balance: value,
            payment_source: 'bank'
          }])
          .select()
          .single();

        if (insertError) {
          toast({ title: "Erro", description: "Não foi possível criar saldo anterior.", variant: "destructive" });
          return;
        }

        setAccounts(prev => [insertData as Account, ...prev]);
      }

      toast({ title: "Sucesso", description: "Saldo Mês Anterior atualizado com sucesso." });

    } catch (error) {
      toast({ title: "Erro", description: "Erro inesperado ao atualizar saldo anterior.", variant: "destructive" });
    }
  };

  // Add, update, delete, status (mantendo lógica original)
  const addAccount = async (accountData: CreateAccountData) => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('accounts')
        .insert([{
          description: accountData.description,
          amount: accountData.amount,
          category: accountData.category,
          due_date: accountData.dueDate,
          data_conta: accountData.dataConta,
          type: accountData.type,
          status: accountData.status,
          user_id: user.id,
          bank_id: accountData.bank_id,
          payment_source: 'bank',
          payment_source_id: accountData.payment_source_id,
          payment_source_name: accountData.payment_source_name,
          previous_balance: accountData.previous_balance ?? null
        }])
        .select()
        .single();

      if (error) throw error;

      setAccounts(prev => [data as Account, ...prev]);

      if (accountData.status === 'pago' || accountData.status === 'recebido') invalidateBanksCache();

      toast({ title: "Sucesso", description: "Conta criada com sucesso." });
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível criar a conta.", variant: "destructive" });
    }
  };

  const updateAccount = async (updatedAccount: Account) => {
    try {
      const { error } = await supabase
        .from('accounts')
        .update(updatedAccount)
        .eq('id', updatedAccount.id)
        .eq('user_id', user.id);

      if (error) throw error;

      setAccounts(prev => prev.map(acc => acc.id === updatedAccount.id ? updatedAccount : acc));

      if (updatedAccount.status === 'pago' || updatedAccount.status === 'recebido') invalidateBanksCache();

      toast({ title: "Sucesso", description: "Conta atualizada com sucesso." });
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível atualizar a conta.", variant: "destructive" });
    }
  };

  const deleteAccount = async (accountId: number) => {
    try {
      const accountToDelete = accounts.find(acc => acc.id === accountId);
      const { error } = await supabase.from('accounts').delete().eq('id', accountId);

      if (error) throw error;

      setAccounts(prev => prev.filter(acc => acc.id !== accountId));

      if (accountToDelete && (accountToDelete.status === 'pago' || accountToDelete.status === 'recebido')) invalidateBanksCache();

      toast({ title: "Sucesso", description: "Conta deletada com sucesso." });
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível deletar a conta.", variant: "destructive" });
    }
  };

  const updateAccountStatus = async (id: number, status: 'pendente' | 'pago' | 'recebido') => {
    try {
      if (!user) return;

      const { error } = await supabase.from('accounts').update({ status }).eq('id', id).eq('user_id', user.id);

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
    else { setAccounts([]); setLoading(false); }
  }, [user]);

  return {
    accounts,
    loading,
    addAccount,
    updateAccount,
    deleteAccount,
    updateAccountStatus,
    upsertPreviousBalance,
    refreshAccounts: fetchAccounts
  };
};
