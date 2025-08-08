
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';

export interface CardOption {
    id: string;
    name: string;
    current_value: number;
}

export function useCardsOptions() {
    const {
        data: cards = [],
        isLoading,
        error,
        refetch
    } = useQuery<CardOption[]>({
        queryKey: ['credit_cards'],
        queryFn: async () => {
            console.log('useCardsOptions: Iniciando busca de cartões...');
            
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError) {
                console.error('useCardsOptions: Erro de autenticação:', userError);
                throw userError;
            }
            
            if (!user) {
                console.log('useCardsOptions: Usuário não autenticado');
                return [];
            }

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

            console.log('useCardsOptions: Dados brutos do banco:', data);

            const transformedData = (data || []).map(card => ({
                id: String(card.id),
                name: card.card_name,
                current_value: card.current_value ?? 0
            }));

            console.log('useCardsOptions: Dados transformados:', transformedData);
            return transformedData;
        },
        enabled: true, // Sempre habilitado
        refetchOnWindowFocus: false,
        staleTime: 30000, // 30 segundos
        gcTime: 300000, // 5 minutos
        retry: 2
    });

    return {
        cards,
        loading: isLoading,
        error,
        refetch,
        cardsOptions: cards
    };
}
