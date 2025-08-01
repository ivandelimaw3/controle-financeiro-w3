// src/hooks/useCardsOptions.tsx
export function useCardsOptions() {
  const {
    data: cards = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['credit_cards'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('credit_cards')
        .select('id, card_name, current_value')
        .eq('user_id', user.id)  // ← ADICIONAR FILTRO DE USUÁRIO
        .eq('is_active', true)
        .order('card_name')

      if (error) throw error

      const transformedData = (data || [])
        .filter(card => !!card.id && card.id !== 'undefined' && card.id !== 'null' && card.id !== '')
        .map(card => ({
          id: card.id.toString(),
          name: card.card_name,
          current_balance: card.current_value || 0
        }))
      
      return transformedData
    }
  })

  return { 
    cards, 
    loading, 
    error, 
    refetch,
    cardsOptions: cards,
    isLoading: loading
  }
}