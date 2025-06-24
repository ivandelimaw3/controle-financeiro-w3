
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();

  // Carregar contas do Supabase
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      
      // Verificar se o usuário está autenticado
      if (!user) {
        console.log('Usuário não autenticado - fetchAccounts');
        setAccounts([]);
        return;
      }

      console.log('=== DEBUG FETCH ACCOUNTS ===');
      console.log('Usuário autenticado:', user.email);
      console.log('User ID:', user.id);
      
      // Primeiro, vamos verificar se há contas sem filtro para debug
      const { data: allData, error: allError } = await supabase
        .from('accounts')
        .select('*');
      
      console.log('Total de contas na tabela (sem filtro):', allData?.length || 0);
      if (allData && allData.length > 0) {
        console.log('Primeira conta encontrada:', allData[0]);
        console.log('User IDs das contas:', allData.map(acc => acc.user_id));
      }

      // Agora buscar contas do usuário específico
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      console.log('Contas filtradas para user_id:', user.id);
      console.log('Resultado da query:', { data, error });

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
      console.log('Contas transformadas e setadas:', transformedAccounts.length, 'contas encontradas');
      console.log('=== FIM DEBUG FETCH ACCOUNTS ===');
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
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado.",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase
        .from('accounts')
        .insert([{
          description: accountData.description,
          amount: accountData.amount,
          category: accountData.category,
          due_date: accountData.dueDate,
          type: accountData.type,
          status: accountData.status,
          user_id: user.id
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
        .update({
          description: updatedAccount.description,
          amount: updatedAccount.amount,
          category: updatedAccount.category,
          due_date: updatedAccount.dueDate,
          type: updatedAccount.type,
          status: updatedAccount.status
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
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

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

  // Carregar contas quando o usuário mudar
  useEffect(() => {
    console.log('=== useEffect triggered ===');
    console.log('User state:', user ? { email: user.email, id: user.id } : 'null');
    
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
    refreshAccounts: fetchAccounts
  };
};
