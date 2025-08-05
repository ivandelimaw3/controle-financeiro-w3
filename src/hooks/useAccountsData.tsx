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
  type: 'receita' | 'despesa';
  status: 'pendente' | 'pago' | 'recebido';
  parcela?: string;
  recorrente_id?: string;
  bank_id?: number;
  card_id?: number;
  payment_source?: 'bank' | 'card';
  payment_source_id?: number;
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
  type: 'receita' | 'despesa';
  status: 'pendente' | 'pago' | 'recebido';
  parcela?: string;
  recorrente_id?: string;
  bank_id?: number;
  card_id?: number;
  payment_source?: 'bank' | 'card';
  payment_source_id?: number;
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

  const invalidateCardsCache = () => {
    queryClient.invalidateQueries({ queryKey: ['credit_cards'] });
  };

  // Carregar contas do Supabase
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

      // Transformar dados do Supabase para o formato da aplicação
      const transformedAccounts: Account[] = data.map(account => ({
        id: account.id,
        description: account.description,
        amount: parseFloat(account.amount.toString()),
        category: account.category,
        dueDate: account.due_date,
        type: account.type as 'receita' | 'despesa',
        status: account.status as 'pendente' | 'pago' | 'recebido',
        parcela: account.parcela,
        recorrente_id: account.recorrente_id,
        bank_id: account.bank_id,
        card_id: account.card_id,
        payment_source: account.payment_source as 'bank' | 'card' | undefined,
        payment_source_id: account.payment_source_id
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

  // Criar nova conta
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

      // Se tem quantidade de parcelas, criar múltiplas contas
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
            type: accountData.type,
            status: accountData.status,
            user_id: user.id,
            parcela: `${i + 1}/${accountData.qtd_parcelas}`,
            recorrente_id: recorrenteId,
            bank_id: accountData.bank_id,
            card_id: accountData.card_id,
            payment_source: accountData.payment_source,
            payment_source_id: accountData.payment_source_id
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

        // Transformar e adicionar à lista local
        const newAccounts = insertData.map(account => ({
          id: account.id,
          description: account.description,
          amount: parseFloat(account.amount.toString()),
          category: account.category,
          dueDate: account.due_date,
          type: account.type as 'receita' | 'despesa',
          status: account.status as 'pendente' | 'pago' | 'recebido',
          parcela: account.parcela,
          recorrente_id: account.recorrente_id,
          bank_id: account.bank_id,
          card_id: account.card_id,
          payment_source: account.payment_source as 'bank' | 'card' | undefined,
          payment_source_id: account.payment_source_id
        }));

        setAccounts(prev => [...newAccounts, ...prev]);
        
        // Invalidar cache dos bancos e cartões para atualizar saldos
        invalidateBanksCache();
        invalidateCardsCache();
             
        toast({
          title: "Sucesso",
          description: `${accountData.qtd_parcelas} parcelas criadas com sucesso.`,
        });
      } else {
        // Criar conta única
        const { data, error } = await supabase
          .from('accounts')
          .insert([{
            description: accountData.description,
            amount: accountData.amount,
            category: accountData.category,
            due_date: accountData.dueDate,
            type: accountData.type,
            status: accountData.status,
            user_id: user.id,
            bank_id: accountData.bank_id,
            card_id: accountData.card_id,
            payment_source: accountData.payment_source as 'bank' | 'card' | undefined,
            payment_source_id: accountData.payment_source_id
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
          status: data.status as 'pendente' | 'pago' | 'recebido',
          parcela: data.parcela,
          recorrente_id: data.recorrente_id,
          bank_id: data.bank_id,
          card_id: data.card_id,
          payment_source: data.payment_source as 'bank' | 'card' | undefined,
          payment_source_id: data.payment_source_id
        };

        setAccounts(prev => [newAccount, ...prev]);
        
        // Invalidar cache dos bancos e cartões para atualizar saldos
        invalidateBanksCache();
        invalidateCardsCache();
       
        
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
          status: updatedAccount.status,
          bank_id: updatedAccount.bank_id,
          card_id: updatedAccount.card_id,
          payment_source: updatedAccount.payment_source,
          payment_source_id: updatedAccount.payment_source_id
        })
        .eq('id', updatedAccount.id)   // ← sem ponto e vírgula
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

      // Atualizar na lista local
      setAccounts(prev => 
        prev.map(account => 
          account.id === updatedAccount.id ? updatedAccount : account
        )
      );

      // Invalidar cache dos bancos e cartões para atualizar saldos
      invalidateBanksCache();
      invalidateCardsCache();
     
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
  const deleteAccount = async (accountId: number) => {
    try {
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

      // Remover da lista local
      setAccounts(prev => prev.filter(account => account.id !== accountId));

      // Invalidar cache dos bancos e cartões para atualizar saldos
      invalidateBanksCache();
      invalidateCardsCache();
      
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
      invalidateCardsCache();
       
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
    refreshAccounts: fetchAccounts
  };
};
