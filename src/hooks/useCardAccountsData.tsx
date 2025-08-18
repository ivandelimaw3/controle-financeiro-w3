
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CardAccountData {
  id: number;
  user_id: string;
  creditcard_id: number;
  description: string;
  amount: number;
  category: string;
  due_date: string;
  data_conta?: string;
  status: string;
  parcela?: string;
  recorrente_id?: string;
  created_at: string;
  updated_at: string;
  creditcard?: {
    card_name: string;
    card_number: string;
  };
}

export interface CardAccountFormData {
  creditcard_id: number;
  description: string;
  amount: number;
  category: string;
  due_date: string;
  data_conta?: string;
  status: string;
  parcela?: string;
  recorrente_id?: string;
}

export function useCardAccountsData() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: cardAccounts = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['card-accounts'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      console.log('useCardAccountsData: Buscando contas dos cartões para usuário:', user.id);

      const { data, error } = await supabase
        .from('card_accounts')
        .select(`
          *,
          creditcard:creditcards(card_name, card_number)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar contas dos cartões:', error);
        throw error;
      }
      
      console.log('useCardAccountsData: Dados encontrados:', data);
      return (data || []) as CardAccountData[];
    },
  });

  const createCardAccountMutation = useMutation({
    mutationFn: async (accountData: CardAccountFormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      console.log('Criando conta do cartão:', accountData);

      const { data, error } = await supabase
        .from('card_accounts')
        .insert({
          ...accountData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar conta:', error);
        throw error;
      }

      console.log('Conta criada com sucesso:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['creditcards'] });
      toast({
        title: "Conta criada com sucesso!",
        duration: 2000,
      });
    },
    onError: (error) => {
      console.error('Erro ao criar conta:', error);
      toast({
        title: "Erro ao criar conta",
        description: "Tente novamente",
        variant: "destructive",
        duration: 3000,
      });
    }
  });

  const updateCardAccountMutation = useMutation({
    mutationFn: async ({ id, accountData }: { id: number; accountData: CardAccountFormData }) => {
      console.log('Atualizando conta do cartão:', { id, accountData });

      const { data, error } = await supabase
        .from('card_accounts')
        .update(accountData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar conta:', error);
        throw error;
      }

      console.log('Conta atualizada com sucesso:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['creditcards'] });
      toast({
        title: "Conta atualizada com sucesso!",
        duration: 2000,
      });
    },
    onError: (error) => {
      console.error('Erro ao atualizar conta:', error);
      toast({
        title: "Erro ao atualizar conta",
        description: "Tente novamente",
        variant: "destructive",
        duration: 3000,
      });
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, currentStatus }: { id: number; currentStatus: string }) => {
      console.log('Iniciando toggle de status:', { id, currentStatus });
      
      const newStatus = currentStatus === 'pendente' ? 'pago' : 'pendente';
      
      console.log('Novo status será:', newStatus);
      
      const { data, error } = await supabase
        .from('card_accounts')
        .update({ status: newStatus })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro no toggle de status:', error);
        throw error;
      }

      console.log('Status alterado com sucesso:', data);
      return data;
    },
    onSuccess: (data, variables) => {
      console.log('onSuccess do toggle executado');
      queryClient.invalidateQueries({ queryKey: ['card-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['creditcards'] });
      
      const newStatus = variables.currentStatus === 'pendente' ? 'pago' : 'pendente';
      toast({
        title: `Status alterado para ${newStatus === 'pago' ? 'Pago' : 'Pendente'}!`,
        duration: 2000,
      });
    },
    onError: (error) => {
      console.error('Erro ao alterar status:', error);
      toast({
        title: "Erro ao alterar status",
        description: "Tente novamente",
        variant: "destructive",
        duration: 3000,
      });
    }
  });

  const deleteCardAccountMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log('Deletando conta do cartão:', id);

      const { error } = await supabase
        .from('card_accounts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar conta:', error);
        throw error;
      }

      console.log('Conta deletada com sucesso:', id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['creditcards'] });
      toast({
        title: "Conta excluída com sucesso!",
        duration: 2000,
      });
    },
    onError: (error) => {
      console.error('Erro ao excluir conta:', error);
      toast({
        title: "Erro ao excluir conta",
        description: "Tente novamente",
        variant: "destructive",
        duration: 3000,
      });
    }
  });

  return {
    cardAccounts,
    isLoading,
    error,
    isCreating: createCardAccountMutation.isPending,
    isUpdating: updateCardAccountMutation.isPending || toggleStatusMutation.isPending,
    isDeleting: deleteCardAccountMutation.isPending,
    createCardAccount: createCardAccountMutation.mutate,
    updateCardAccount: updateCardAccountMutation.mutate,
    toggleCardAccountStatus: toggleStatusMutation.mutate,
    deleteCardAccount: deleteCardAccountMutation.mutate,
    refetch,
  };
}
