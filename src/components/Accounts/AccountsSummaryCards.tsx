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

export interface PreviousBalance {
  id: number;
  month: number;
  year: number;
  value: number;
  created_at: string;
  updated_at: string;
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

  // ------------------- CONTAS -------------------
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        console.log('Usuário não autenticado - fetchAccounts');
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
      console.log(`Contas carregadas: ${transformedAccounts.length} contas encontradas`);
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

  const addAccount = async (accountData: CreateAccountData) => {
    try {
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado.",
          variant: "destructive"
        });
        return;
      }

      if (accountData.qtd_parcelas && accountData.qtd_parcelas > 1) {
        const recorrenteId = crypto.randomUUID();
        const registros = [];
        const valorPorParcela = accountData.amount / accountData.qtd_parcelas;

        for (let i = 0; i < accountData.qtd_parcelas; i++) {
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
            parcela: `${i + 1}/${accountData.qtd_parcelas}`,
            recorrente_id: recorrenteId,
            bank_id: accountData.bank_id,
            payment_source: 'bank',
            payment_source_id: accountData.payment_source_id,
            payment_source_name: accountData.payment_source_name
          });
        }

        const { data: insertData, error } = await supabase
          .from('accounts')
          .insert(registros)
          .select();

        if (error) {
          console.error('Erro ao criar parcelas:', error);
          toast({
            title: "Erro",
            description: "Não foi possível criar as parcelas.",
            variant: "destructive"
          });
          return;
        }

        const newAccounts = insertData.map(account => ({
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
          payment_source: 'bank' as const,
          payment_source_id: account.payment_source_id,
          payment_source_name: account.payment_source_name
        }));

        setAccounts(prev => [...newAccounts, ...prev]);
        
        if (accountData.status === 'pago' || accountData.status === 'recebido') {
          invalidateBanksCache();
        }
               
        toast({
          title: "Sucesso",
          description: `${accountData.qtd_parcelas} parcelas criadas com sucesso.`,
        });
      } else {
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
            payment_source_name: accountData.payment_source_name
          }])
          .select()
          .single();

        if (error) {
          console.error('Erro ao criar conta:', error);
          toast({
            title: "Erro",
            description: "Não foi possível criar a conta.",
            variant: "destructive"
          });
          return;
        }

        const newAccount: Account = {
          id: data.id,
          description: data.description,
          amount: parseFloat(data.amount.toString()),
          category: data.category,
          dueDate: data.due_date,
          dataConta: data.data_conta,
          type: data.type as 'receita' | 'despesa',
          status: data.status as 'pendente' | 'pago' | 'recebido',
          parcela: data.parcela,
          recorrente_id: data.recorrente_id,
          bank_id: data.bank_id,
          payment_source: 'bank',
          payment_source_id: data.payment_source_id,
          payment_source_name: data.payment_source_name
        };

        setAccounts(prev => [newAccount, ...prev]);
        
        if (accountData.status === 'pago' || accountData.status === 'recebido') {
          invalidateBanksCache();
        }
        
        toast({
          title: "Sucesso",
          description: "Conta criada com sucesso.",
        });
      }
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a conta.",
        variant: "destructive"
      });
    }
  };

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
        .eq('user_id', user.id); 

      if (error) {
        console.error('Erro ao atualizar conta:', error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar a conta.",
          variant: "destructive"
        });
        return;
      }

      setAccounts(prev => 
        prev.map(account => 
          account.id === updatedAccount.id ? updatedAccount : account
        )
      );

      if (updatedAccount.status === 'pago' || updatedAccount.status === 'recebido') {
        invalidateBanksCache();
      }

      toast({
        title: "Sucesso",
        description: "Conta atualizada com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao atualizar conta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a conta.",
        variant: "destructive"
      });
    }
  };

  const deleteAccount = async (accountId: number) => {
    try {
      const accountToDelete = accounts.find(acc => acc.id === accountId);
      
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', accountId);

      if (error) {
        console.error('Erro ao deletar conta:', error);
        toast({
          title: "Erro",
          description: "Não foi possível deletar a conta.",
          variant: "destructive"
        });
        return;
      }

      setAccounts(prev => prev.filter(account => account.id !== accountId));

      if (accountToDelete && (accountToDelete.status === 'pago' || accountToDelete.status === 'recebido')) {
        invalidateBanksCache();
      }

      toast({
        title: "Sucesso",
        description: "Conta deletada com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao deletar conta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível deletar a conta.",
        variant: "destructive"
      });
    }
  };

  const updateAccountStatus = async (id: number, status: 'pendente' | 'pago' | 'recebido') => {
    try {
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado.",
          variant: "destructive"
        });
        return;
      }
      const { error } = await supabase
        .from('accounts')
        .update({ status })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao atualizar status:', error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o status.",
          variant: "destructive"
        });
        return;
      }

     setAccounts(prev => prev.map(acc => 
        acc.id === id ? { ...acc, status } : acc
      ));
      
      invalidateBanksCache();
        
      toast({
        title: "Sucesso",
        description: "Status da conta atualizado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar status.",
        variant: "destructive"
      });
    }
  };

  // ------------------- SALDO MÊS ANTERIOR -------------------
  const getPreviousBalance = async (month: number, year: number): Promise<PreviousBalance | null> => {
    try {
      const { data, error } = await supabase
        .from('previous_balances')
        .select('*')
        .eq('month', month)
        .eq('year', year)
        .single();

      if (error && error.code !== 'PGRST116') return null;

      return data || null;
    } catch (err) {
      console.error('Erro inesperado ao buscar saldo anterior:', err);
      return null;
    }
  };

  const updateOrCreatePreviousBalance = async (month: number, year: number, value: number) => {
    const existing = await getPreviousBalance(month, year);

    if (!existing) {
      const { data, error } = await supabase
        .from('previous_balances')
        .insert([{ month, year, value }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar saldo anterior:', error);
        return null;
      }

      return data;
    } else {
      const { data, error } = await supabase
        .from('previous_balances')
        .update({ value, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar saldo anterior:', error);
        return null;
      }

      return data;
    }
  };

  const propagateBalanceToNextMonth = async (month: number, year: number, saldoFinal: number) => {
    let nextMonth = month + 1;
    let nextYear = year;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }
    await updateOrCreatePreviousBalance(nextMonth, nextYear, saldoFinal);
  };
  // -----------------------------------------------------------

  useEffect(() => {
    if (user) {
      fetchAccounts();
    } else {
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
    updateOrCreatePreviousBalance,
    propagateBalanceToNextMonth
  };
};
