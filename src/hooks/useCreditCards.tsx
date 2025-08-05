import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CreditCard {
  id: number;
  user_id: string;
  card_name: string;
  card_number: string;
  holder_name: string;
  expiry_date: string;
  due_date?: string;
  credit_limit: number;
  current_value: number;
  bank_name?: string;
  card_brand: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreditCardInput {
  card_name: string;
  card_number: string;
  holder_name: string;
  expiry_date: string;
  due_date?: string;
  credit_limit: number;
  current_value: number;
  bank_name?: string;
  card_brand?: string;
}

// Utilitários
function formatCardNumber(value: string) {
  return value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim().slice(0, 19);
}

function formatExpiryDate(value: string) {
  // De YYYY-MM para MM/YYYY, se necessário
  if (/^\d{4}-\d{2}$/.test(value)) {
    const [year, month] = value.split('-');
    return `${month}/${year}`;
  }
  return value;
}

export function useCreditCards() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Leitura dos cartões
  const {
    data: creditCards = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['credit_cards'],
    queryFn: async () => {
      console.log('Carregando cartões...');
      const userResponse = await supabase.auth.getUser();
      const user = userResponse.data.user;
      if (!user) {
        console.log('Usuário não autenticado');
        throw new Error('Usuário não autenticado');
      }

      console.log('Usuário autenticado:', user.id);
      const { data, error } = await supabase
        .from("cards")
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar cartões:', error);
        throw new Error(error.message);
      }

      console.log('Cartões carregados:', data);
      return data || [];
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0,
  });


  // Criar cartão
  const createCreditCardMutation = useMutation({
    mutationFn: async (card: CreditCardInput) => {
      console.log('Criando cartão:', card);
      const userResponse = await supabase.auth.getUser();
      const user = userResponse.data.user;
      if (!user) {
        console.log('Usuário não autenticado');
        throw new Error('Usuário não autenticado');
      }

      const formattedCard = {
        ...card,
        card_number: formatCardNumber(card.card_number),
        expiry_date: formatExpiryDate(card.expiry_date),
        user_id: user.id,
        card_brand: card.card_brand || 'visa',
        credit_limit: card.credit_limit || 0,
        current_value: card.current_value || 0,
        is_active: true,
      };

      console.log('Cartão formatado para criação:', formattedCard);

      const { data, error } = await supabase
        .from("cards")
        .insert([formattedCard])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar cartão:', error);
        throw new Error(error.message);
      }

      console.log('Cartão criado com sucesso:', data);
      return data;
    },
    onSuccess: () => {
      console.log('Create mutation onSuccess - invalidando queries');
      queryClient.invalidateQueries({ queryKey: ['credit_cards'] });
      toast({
        title: "Cartão criado!",
        description: "O cartão foi adicionado com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Create mutation onError:', error);
      toast({
        title: "Erro ao criar cartão",
        description: String(error),
        variant: "destructive",
      });
    }
  });

  // Atualizar cartão
  const updateCreditCardMutation = useMutation({
    mutationFn: async ({ id, card }: { id: number; card: CreditCardInput }) => {
      console.log('Atualizando cartão:', { id, card });
      
      const formattedCard = {
        ...card,
        card_number: formatCardNumber(card.card_number),
        expiry_date: formatExpiryDate(card.expiry_date),
        card_brand: card.card_brand || 'visa',
        credit_limit: card.credit_limit || 0,
        current_value: card.current_value || 0,
      };

      console.log('Cartão formatado:', formattedCard);

      const { data, error } = await supabase
        .from("cards")
        .update(formattedCard)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar cartão:', error);
        throw new Error(error.message);
      }

      console.log('Cartão atualizado com sucesso:', data);
      return data;
    },
    onSuccess: () => {
      console.log('Mutation onSuccess - invalidando queries');
      queryClient.invalidateQueries({ queryKey: ['credit_cards'] });
      toast({
        title: "Cartão atualizado!",
        description: "As informações foram salvas com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Mutation onError:', error);
      toast({
        title: "Erro ao atualizar cartão",
        description: String(error),
        variant: "destructive",
      });
    }
  });

  // Deletar cartão (desativar)
  const deleteCreditCardMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log('Deletando cartão:', id);
      const { error } = await supabase
        .from("cards")
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar cartão:', error);
        throw new Error(error.message);
      }

      console.log('Cartão deletado com sucesso:', id);
      return id;
    },
    onSuccess: () => {
      console.log('Delete mutation onSuccess - invalidando queries');
      queryClient.invalidateQueries({ queryKey: ['credit_cards'] });
      toast({
        title: "Cartão excluído!",
        description: "O cartão foi removido da lista.",
      });
    },
    onError: (error) => {
      console.error('Delete mutation onError:', error);
      toast({
        title: "Erro ao excluir cartão",
        description: String(error),
        variant: "destructive",
      });
    }
  });

  return {
    creditCards,
    isLoading,
    error,
    createCreditCard: createCreditCardMutation.mutateAsync,
    updateCreditCard: updateCreditCardMutation.mutateAsync,
    deleteCreditCard: deleteCreditCardMutation.mutateAsync,
    isCreating: createCreditCardMutation.isPending,
    isUpdating: updateCreditCardMutation.isPending,
    isDeleting: deleteCreditCardMutation.isPending,
    refetch,
  };
}
