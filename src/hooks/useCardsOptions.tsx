
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';

export function useCardsOptions() {
  const {
    data: cards = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['credit_cards'], // Usando a mesma queryKey para sincronizar
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Usuário não autenticado');

      console.log('useCardsOptions: Buscando cartões para usuário:', user.id);

      const { data, error } = await supabase
        .from('cards')
        .select('id, card_name, current_value')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('card_name');

      if (error) {
        console.error('useCardsOptions: Erro ao carregar cartões:', error);
        throw error;
      }

      const transformedData = (data || [])
        .filter(card => !!card.id && typeof card.id === 'number')
        .map(card => ({
          id: card.id.toString(),
          name: card.card_name,
          current_value: card.current_value || 0
        }));
      
      console.log('useCardsOptions: Cartões transformados:', transformedData);
      return transformedData;
    },
    refetchOnWindowFocus: true,
    staleTime: 0 // Sempre considerar os dados como obsoletos
  });

  return { 
    cards, 
    loading, 
    error, 
    refetch,
    cardsOptions: cards,
    isLoading: loading
  };
}
