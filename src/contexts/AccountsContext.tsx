import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Account {
  id?: number;
  description: string;
  amount: number;
  category: string;
  dueDate: string;
  type: 'receita' | 'despesa';
  status: 'pendente' | 'pago' | 'recebido';
  user_id?: string;
}

interface AccountsContextType {
  accounts: Account[];
  loading: boolean;
  addAccount: (account: Account) => Promise<void>;
  updateAccount: (account: Account) => Promise<void>;
  deleteAccount: (id: number) => Promise<void>;
  updateAccountStatus: (id: number, status: 'pendente' | 'pago' | 'recebido') => Promise<void>;
  getTransactions: () => Account[];
  getTotalReceitas: () => number;
  getTotalDespesas: () => number;
  getSaldo: () => number;
  getContasPendentes: () => number;
}

const AccountsContext = createContext<AccountsContextType | undefined>(undefined);

export const useAccounts = () => {
  const context = useContext(AccountsContext);
  if (!context) {
    throw new Error('useAccounts must be used within an AccountsProvider');
  }
  return context;
};

interface AccountsProviderProps {
  children: ReactNode;
}

export const AccountsProvider: React.FC<AccountsProviderProps> = ({ children }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      console.log('Usuario logado, carregando contas:', user.id);
      fetchAccounts();
    } else {
      console.log('Usuario não logado, limpando contas');
      setAccounts([]);
      setLoading(false);
    }
  }, [user]);

  const fetchAccounts = async () => {
    try {
      console.log('Buscando contas do usuário:', user?.id);
      setLoading(true);

      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user?.id)
        .order('due_date', { ascending: false });

      if (error) {
        console.error('Erro ao carregar contas:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar contas.",
          variant: "destructive"
        });
        return;
      }

      console.log('Contas carregadas:', data);
      
      const mappedAccounts: Account[] = (data || []).map(account => ({
        id: account.id,
        description: account.description,
        amount: parseFloat(account.amount.toString()),
        category: account.category,
        dueDate: account.due_date,
        type: account.type as 'receita' | 'despesa',
        status: account.status as 'pendente' | 'pago' | 'recebido',
        user_id: account.user_id
      }));

      setAccounts(mappedAccounts);
    } catch (error) {
      console.error('Erro ao buscar contas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar contas.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addAccount = async (account: Account) => {
    try {
      console.log('Adicionando nova conta:', account);

      if (!user?.id) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('accounts')
        .insert({
          description: account.description,
          amount: account.amount,
          category: account.category,
          due_date: account.dueDate,
          type: account.type,
          status: account.status,
          user_id: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar conta:', error);
        throw error;
      }

      console.log('Conta adicionada com sucesso:', data);
      
      const newAccount: Account = {
        id: data.id,
        description: data.description,
        amount: parseFloat(data.amount.toString()),
        category: data.category,
        dueDate: data.due_date,
        type: data.type as 'receita' | 'despesa',
        status: data.status as 'pendente' | 'pago' | 'recebido',
        user_id: data.user_id
      };

      setAccounts(prev => [newAccount, ...prev]);
      
      toast({
        title: "Sucesso",
        description: "Conta adicionada com sucesso."
      });
    } catch (error) {
      console.error('Erro ao adicionar conta:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar conta.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateAccount = async (account: Account) => {
    try {
      console.log('Atualizando conta:', account);

      if (!account.id) {
        throw new Error('ID da conta é obrigatório para atualização');
      }

      const { data, error } = await supabase
        .from('accounts')
        .update({
          description: account.description,
          amount: account.amount,
          category: account.category,
          due_date: account.dueDate,
          type: account.type,
          status: account.status
        })
        .eq('id', account.id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar conta:', error);
        throw error;
      }

      console.log('Conta atualizada com sucesso:', data);
      
      const updatedAccount: Account = {
        id: data.id,
        description: data.description,
        amount: parseFloat(data.amount.toString()),
        category: data.category,
        dueDate: data.due_date,
        type: data.type as 'receita' | 'despesa',
        status: data.status as 'pendente' | 'pago' | 'recebido',
        user_id: data.user_id
      };

      setAccounts(prev => 
        prev.map(acc => acc.id === account.id ? updatedAccount : acc)
      );
      
      toast({
        title: "Sucesso",
        description: "Conta atualizada com sucesso."
      });
    } catch (error) {
      console.error('Erro ao atualizar conta:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar conta.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteAccount = async (id: number) => {
    try {
      console.log('Deletando conta:', id);

      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Erro ao deletar conta:', error);
        throw error;
      }

      console.log('Conta deletada com sucesso');
      setAccounts(prev => prev.filter(account => account.id !== id));
      
      toast({
        title: "Sucesso",
        description: "Conta deletada com sucesso."
      });
    } catch (error) {
      console.error('Erro ao deletar conta:', error);
      toast({
        title: "Erro",
        description: "Erro ao deletar conta.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateAccountStatus = async (id: number, status: 'pendente' | 'pago' | 'recebido') => {
    try {
      console.log('Atualizando status da conta:', id, status);

      const { data, error } = await supabase
        .from('accounts')
        .update({ status })
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar status:', error);
        throw error;
      }

      console.log('Status atualizado com sucesso:', data);
      
      const updatedAccount: Account = {
        id: data.id,
        description: data.description,
        amount: parseFloat(data.amount.toString()),
        category: data.category,
        dueDate: data.due_date,
        type: data.type as 'receita' | 'despesa',
        status: data.status as 'pendente' | 'pago' | 'recebido',
        user_id: data.user_id
      };

      setAccounts(prev => 
        prev.map(acc => acc.id === id ? updatedAccount : acc)
      );
      
      toast({
        title: "Sucesso",
        description: "Status da conta atualizado com sucesso."
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar status da conta.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const getTransactions = () => {
    return accounts.slice(0, 5);
  };

  const getTotalReceitas = () => {
    return accounts
      .filter(account => account.type === 'receita' && account.status === 'recebido')
      .reduce((sum, account) => sum + account.amount, 0);
  };

  const getTotalDespesas = () => {
    return accounts
      .filter(account => account.type === 'despesa' && account.status === 'pago')
      .reduce((sum, account) => sum + Math.abs(account.amount), 0);
  };

  const getSaldo = () => {
    return getTotalReceitas() - getTotalDespesas();
  };

  const getContasPendentes = () => {
    return accounts.filter(account => account.status === 'pendente').length;
  };

  return (
    <AccountsContext.Provider value={{
      accounts,
      loading,
      addAccount,
      updateAccount,
      deleteAccount,
      updateAccountStatus,
      getTransactions,
      getTotalReceitas,
      getTotalDespesas,
      getSaldo,
      getContasPendentes
    }}>
      {children}
    </AccountsContext.Provider>
  );
};
