import { useQuery } from '@tanstack/react-query'
import { supabase } from '../integrations/supabase/client'

export interface CardOption {
  id: string
  name: string
  current_balance: number
}

export function useCardsOptions() {
  const {
    data: cards = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['credit_cards'],
    queryFn: async () => {
      console.log('Iniciando busca de cartões...')
      const { data, error } = await supabase
        .from('credit_cards')
        .select('id, card_name, current_value')
        .eq('is_active', true)
        .order('card_name')
  
      console.log('Resposta da busca de cartões:', { data, error })
  
      if (error) throw error
  
      // Filtro para garantir apenas cartões com id válido
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
    // Compatibilidade com hooks que esperam estas propriedades
    cardsOptions: cards,
    isLoading: loading
  }
}