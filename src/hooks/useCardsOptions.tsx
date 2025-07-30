import { useState, useEffect } from 'react'
import { supabase } from '../integrations/supabase/client'

export interface CardOption {
  id: string
  name: string
  current_balance: number
}

export function useCardsOptions() {
  const [cards, setCards] = useState<CardOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCards()
  }, [])

  const fetchCards = async () => {
    try {
      setLoading(true)
      console.log('Iniciando busca de cartões...')
      const { data, error } = await supabase
        .from('cards')
        .select('id, card_name, current_balance')
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
          current_balance: card.current_balance || 0
        }))
      
      setCards(transformedData)
    } catch (err) {
      console.error('Erro ao carregar cartões:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar cartões')
    } finally {
      setLoading(false)
    }
  }

  return { 
    cards, 
    loading, 
    error, 
    refetch: fetchCards,
    // Compatibilidade com hooks que esperam estas propriedades
    cardsOptions: cards,
    isLoading: loading
  }
}