
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CardInput {
  name: string
  card_number: string
  expiry_date: string
  cvv: string
  card_brand: string
  current_balance: number
  bank_id?: number
  payment_date: number
  user_id?: string
}

export interface Card extends CardInput {
  id: number;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  bank_name?: string;
}

export const useCardsData = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar cartões do usuário
  const {
    data: cards = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['cards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cards')
        .select(`
          id,
          user_id,
          name,
          card_number,
          expiry_date,
          cvv,
          card_brand,
          current_balance,
          bank_id,
          payment_date,
          created_at,
          updated_at,
          banks (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar cartões:', error);
        throw error;
      }
      
      // Transformar os dados para incluir o nome do banco
      const transformedData = (data || []).map(card => {
        console.log('Card data:', card);
        const transformedCard = {
          ...card,
          bank_name: card.banks?.name || 'Não informado',
          current_balance: card.current_balance !== null && card.current_balance !== undefined ? Number(card.current_balance) : 0,
          payment_date: card.payment_date !== null && card.payment_date !== undefined ? Number(card.payment_date) : 0
        };
        console.log('Transformed card:', transformedCard);
        return transformedCard;
      });
      
      console.log('Transformed data:', transformedData);
      return transformedData as Card[];
    }
  });

  // Criar novo cartão
  const createCardMutation = useMutation({
    mutationFn: async (cardData: CardInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Dados do cartão a serem inseridos:', { ...cardData, user_id: user?.id });
      
      // Mapear os dados para o formato esperado pelo banco
      const dbCardData = {
        name: cardData.name,
        card_number: cardData.card_number,
        expiry_date: cardData.expiry_date,
        cvv: cardData.cvv,
        card_brand: cardData.card_brand,
        current_balance: cardData.current_balance,
        bank_id: cardData.bank_id,
        payment_date: cardData.payment_date,
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
      console.log('Cartão criado com sucesso:', data);
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
    mutationFn: async ({ id, ...cardData }: Partial<Card> & { id: number }) => {
      console.log('Dados para atualização do cartão:', { id, ...cardData });
      
      // Mapear os dados para o formato esperado pelo banco
      const dbCardData = {
        name: cardData.name,
        card_number: cardData.card_number,
        expiry_date: cardData.expiry_date,
        cvv: cardData.cvv,
        card_brand: cardData.card_brand,
        current_balance: cardData.current_balance,
        bank_id: cardData.bank_id,
        payment_date: cardData.payment_date,
        updated_at: new Date().toISOString()
      };
      
      console.log('Dados formatados para o banco:', dbCardData);
      
      const { data, error } = await supabase
        .from('cards')
        .update(dbCardData)
        .eq('id', id)
        .select()
        .single();
      if (error) {
        console.error('Erro ao atualizar cartão:', error);
        throw error;
      }
      console.log('Cartão atualizado com sucesso:', data);
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
    mutationFn: async (id: number) => {
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
