import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CardInput {
  name: string;
  number: string;
  expiration_date: string;
  payment_date: number;
  credit_limit: number;
  used_value: number;
  bank_id: number;
  user_id?: string;
}

export interface Card extends CardInput {
  id: string;
  created_at?: string;
  updated_at?: string;
  bank_name?: string;
}

export const useCardsData = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar cartões do usuário autenticado
  const {
    data: cards = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['cards'],
    queryFn: async () => {
      // Obter usuário autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) {
        return [];
      }

      const { data, error } = await supabase
        .from('cards')
        .select(`
          id,
          user_id,
          name,
          number,
          expiration_date,
          payment_date,
          credit_limit,
          used_value,
          bank_id,
          created_at,
          updated_at,
          banks (
            id,
            name
          )
        `)
        .eq('user_id', user.id) // <-- FILTRO PELO USUÁRIO AUTENTICADO
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar cartões:', error);
        throw error;
      }

      // Transformar os dados para incluir o nome do banco
      const transformedData = (data || []).map(card => ({
        ...card,
        bank_name: card.banks?.name || 'Não informado',
        payment_date: card.payment_date !== null && card.payment_date !== undefined ? Number(card.payment_date) : 0,
        credit_limit: card.credit_limit !== null && card.credit_limit !== undefined ? Number(card.credit_limit) : 0,
        used_value: card.used_value !== null && card.used_value !== undefined ? Number(card.used_value) : 0,
      }));

      return transformedData as Card[];
    }
  });

  // Criar novo cartão
  const createCardMutation = useMutation({
    mutationFn: async (cardData: CardInput) => {
      const { data: { user } } = await supabase.auth.getUser();

      const dbCardData = {
        name: cardData.name,
        number: cardData.number,
        expiration_date: cardData.expiration_date,
        payment_date: cardData.payment_date,
        credit_limit: cardData.credit_limit,
        used_value: cardData.used_value,
        bank_id: cardData.bank_id,
        user_id: user?.id
      };

      const { data, error } = await supabase
        .from('cards')
        .insert(dbCardData)
        .select()
        .single();
      if (error) {
        console.error('Erro ao criar cartão:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      toast({
        title: 'Cartão cadastrado com sucesso!',
        description: 'O cartão foi adicionado à sua lista.',
      });
    },
    onError: (error) => {
      console.error('Erro ao cadastrar cartão:', error);
      toast({
        title: 'Erro ao cadastrar cartão',
        description: 'Não foi possível cadastrar o cartão. Tente novamente.',
        variant: 'destructive',
      });
    }
  });

  // Atualizar cartão
  const updateCardMutation = useMutation({
    mutationFn: async ({ id, ...cardData }: Partial<Card> & { id: string }) => {
      const dbCardData: any = {};

      if (cardData.name !== undefined) dbCardData.name = cardData.name;
      if (cardData.number !== undefined) dbCardData.number = cardData.number;
      if (cardData.expiration_date !== undefined) dbCardData.expiration_date = cardData.expiration_date;
      if (cardData.payment_date !== undefined) dbCardData.payment_date = cardData.payment_date;
      if (cardData.credit_limit !== undefined) dbCardData.credit_limit = cardData.credit_limit;
      if (cardData.used_value !== undefined) dbCardData.used_value = cardData.used_value;
      if (cardData.bank_id !== undefined) dbCardData.bank_id = cardData.bank_id;

      dbCardData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('cards')
        .update(dbCardData)
        .eq('id', id)
        .select(`
          id,
          user_id,
          name,
          number,
          expiration_date,
          payment_date,
          credit_limit,
          used_value,
          bank_id,
          created_at,
          updated_at,
          banks (
            id,
            name
          )
        `)
        .single();
      if (error) {
        console.error('Erro ao atualizar cartão:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      toast({
        title: 'Cartão atualizado com sucesso!',
        description: 'As informações do cartão foram atualizadas.',
      });
    },
    onError: (error) => {
      console.error('Erro ao atualizar cartão:', error);
      toast({
        title: 'Erro ao atualizar cartão',
        description: 'Não foi possível atualizar o cartão. Tente novamente.',
        variant: 'destructive',
      });
    }
  });

  // Deletar cartão
  const deleteCardMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', id);
      if (error) {
        console.error('Erro ao deletar cartão:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      toast({
        title: 'Cartão removido com sucesso!',
        description: 'O cartão foi removido da sua lista.',
      });
    },
    onError: (error) => {
      console.error('Erro ao deletar cartão:', error);
      toast({
        title: 'Erro ao remover cartão',
        description: 'Não foi possível remover o cartão. Tente novamente.',
        variant: 'destructive',
      });
    }
  });

  return {
    cards,
    isLoading,
    error,
    refetch,
    createCard: createCardMutation.mutate,
    updateCard: updateCardMutation.mutate,
    deleteCard: deleteCardMutation.mutate,
    isCreating: createCardMutation.isPending,
    isUpdating: updateCardMutation.isPending,
    isDeleting: deleteCardMutation.isPending,
  };
};