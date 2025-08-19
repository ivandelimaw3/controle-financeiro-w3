
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CardAccount {
  id: number;
  user_id: string;
  creditcard_id: number;
  description: string;
  amount: number;
  category: string;
  due_date: string;
  data_conta?: string;
  status: 'pendente' | 'pago';
  parcela?: string;
  recorrente_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCardAccountData {
  creditcard_id: number;
  description: string;
  amount: number;
  category: string;
  due_date: string;
  data_conta?: string;
  status?: 'pendente' | 'pago';
  parcela?: string;
  recorrente_id?: string;
}

export function useCardAccountsData() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: cardAccounts = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['card-accounts'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('card_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar contas de cartão:', error);
        throw error;
      }
      
      return data as CardAccount[];
    }
  });

  const addCardAccountMutation = useMutation({
    mutationFn: async (cardAccountData: CreateCardAccountData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('card_accounts')
        .insert({
          ...cardAccountData,
          user_id: user.id,
          status: cardAccountData.status || 'pendente'
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['creditcards'] });
      toast({
        title: "Conta de cartão criada com sucesso!",
        duration: 2000,
      });
    },
    onError: (error) => {
      console.error('Erro ao criar conta de cartão:', error);
      toast({
        title: "Erro ao criar conta de cartão",
        description: "Tente novamente",
        variant: "destructive",
        duration: 3000,
      });
    }
  });

  const updateCardAccountMutation = useMutation({
    mutationFn: async (cardAccount: CardAccount) => {
      const { data, error } = await supabase
        .from('card_accounts')
        .update({
          creditcard_id: cardAccount.creditcard_id,
          description: cardAccount.description,
          amount: cardAccount.amount,
          category: cardAccount.category,
          due_date: cardAccount.due_date,
          data_conta: cardAccount.data_conta,
          status: cardAccount.status,
          parcela: cardAccount.parcela,
          recorrente_id: cardAccount.recorrente_id
        })
        .eq('id', cardAccount.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['creditcards'] });
      toast({
        title: "Conta de cartão atualizada com sucesso!",
        duration: 2000,
      });
    },
    onError: (error) => {
      console.error('Erro ao atualizar conta de cartão:', error);
      toast({
        title: "Erro ao atualizar conta de cartão",
        description: "Tente novamente",
        variant: "destructive",
        duration: 3000,
      });
    }
  });

  const deleteCardAccountMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('card_accounts')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['creditcards'] });
      toast({
        title: "Conta de cartão excluída com sucesso!",
        duration: 2000,
      });
    },
    onError: (error) => {
      console.error('Erro ao excluir conta de cartão:', error);
      toast({
        title: "Erro ao excluir conta de cartão",
        description: "Tente novamente",
        variant: "destructive",
        duration: 3000,
      });
    }
  });

  const updateCardAccountStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: 'pendente' | 'pago' }) => {
      const { data, error } = await supabase
        .from('card_accounts')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['creditcards'] });
      toast({
        title: "Status atualizado com sucesso!",
        duration: 2000,
      });
    },
    onError: (error) => {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro ao atualizar status",
        description: "Tente novamente",
        variant: "destructive",
        duration: 3000,
      });
    }
  });

  const addCardAccount = async (cardAccountData: CreateCardAccountData) => {
    await addCardAccountMutation.mutateAsync(cardAccountData);
  };

  const updateCardAccount = async (cardAccount: CardAccount) => {
    await updateCardAccountMutation.mutateAsync(cardAccount);
  };

  const deleteCardAccount = async (id: number) => {
    await deleteCardAccountMutation.mutateAsync(id);
  };

  const updateCardAccountStatus = async (id: number, status: 'pendente' | 'pago') => {
    await updateCardAccountStatusMutation.mutateAsync({ id, status });
  };

  const refreshCardAccounts = async () => {
    await refetch();
  };

  return {
    cardAccounts,
    loading,
    addCardAccount,
    updateCardAccount,
    deleteCardAccount,
    updateCardAccountStatus,
    refreshCardAccounts
  };
}
