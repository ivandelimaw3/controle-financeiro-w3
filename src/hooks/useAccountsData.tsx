
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Account {
  id: number;
  description: string;
  amount: number;
  category: string;
  dueDate: string;
  type: 'receita' | 'despesa';
  status: 'pendente' | 'pago' | 'recebido';
}

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: string;
  type: 'receita' | 'despesa';
  status: 'pendente' | 'pago' | 'recebido';
}

export const useAccountsData = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Carregar contas do Supabase
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
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

      // Transformar dados do Supabase para o formato esperado
      const transformedAccounts: Account[] = data.map(account => ({
        id: account.id,
        description: account.description,
        amount: parseFloat(account.amount.toString()),
        category: account.category,
        dueDate: account.due_date,
        type: account.type as 'receita' | 'despesa',
        status: account.status as 'pendente' | 'pago' | 'recebido'
      }));

      setAccounts(transformedAccounts);
      console.log('Contas carregadas do Supabase:', transformedAccounts.length, 'contas');
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

  // Adicionar nova conta
  const addAccount = async (accountData: Omit<Account, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .insert([{
          description: accountData.description,
          amount: accountData.amount,
          category: accountData.category,
          due_date: accountData.dueDate,
          type: accountData.type,
          status: accountData.status
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

      // Transformar e adicionar à lista local
      const newAccount: Account = {
        id: data.id,
        description: data.description,
        amount: parseFloat(data.amount.toString()),
        category: data.category,
        dueDate: data.due_date,
        type: data.type as 'receita' | 'despesa',
        status: data.status as 'pendente' | 'pago' | 'recebido'
      };

      setAccounts(prev => [newAccount, ...prev]);
      
      toast({
        title: "Sucesso",
        description: "Conta criada com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a conta.",
        variant: "destructive"
      });
    }
  };

  // Atualizar conta
  const updateAccount = async (updatedAccount: Account) => {
    try {
      const { error } = await supabase
        .from('accounts')
        .update({
          description: updatedAccount.description,
          amount: updatedAccount.amount,
          category: updatedAccount.category,
          due_date: updatedAccount.dueDate,
          type: updatedAccount.type,
          status: updatedAccount.status
        })
        .eq('id', updatedAccount.id);

      if (error) {
        console.error('Erro ao atualizar conta:', error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar a conta.",
          variant: "destructive"
        });
        return;
      }

      setAccounts(prev => prev.map(acc => 
        acc.id === updatedAccount.id ? updatedAccount : acc
      ));

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

  // Deletar conta
  const deleteAccount = async (id: number) => {
    try {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar conta:', error);
        toast({
          title: "Erro",
          description: "Não foi possível excluir a conta.",
          variant: "destructive"
        });
        return;
      }

      setAccounts(prev => prev.filter(acc => acc.id !== id));

      toast({
        title: "Sucesso",
        description: "Conta excluída com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao deletar conta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a conta.",
        variant: "destructive"
      });
    }
  };

  // Atualizar status da conta
  const updateAccountStatus = async (id: number, status: 'pendente' | 'pago' | 'recebido') => {
    try {
      const { error } = await supabase
        .from('accounts')
        .update({ status })
        .eq('id', id);

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

      toast({
        title: "Sucesso",
        description: `Status alterado para ${status}.`,
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status.",
        variant: "destructive"
      });
    }
  };

  // Carregar contas ao montar o componente
  useEffect(() => {
    fetchAccounts();
  }, []);

  return {
    accounts,
    loading,
    addAccount,
    updateAccount,
    deleteAccount,
    updateAccountStatus,
    refreshAccounts: fetchAccounts
  };
};
