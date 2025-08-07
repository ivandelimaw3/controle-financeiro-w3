import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';

export interface CardOption {
    id: string;
    name: string;
    current_value: number;
}

export function useCardsOptions() {
    const { data: user } = supabase.auth.getUser();

    const {
        data: cards = [],
        isLoading: loading,
        error,
        refetch
    } = useQuery({
        queryKey: ['credit_cards'],
        queryFn: async () => {
            if (!user) {
                throw new Error('Usuário não autenticado');
            }

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

            return transformedData;
        },
        enabled: !!user,
        refetchOnWindowFocus: true,
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
