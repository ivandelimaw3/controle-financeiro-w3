import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';

export interface CardOption {
    id: string;
    name: string;
    current_value: number;
}

export function useCardsOptions() {
    const [user, setUser] = useState<any>(null);

    // Buscar usuário atual
    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();
    }, []);

    const {
        data: cards = [],
        isLoading: loading,
        error,
        refetch
    } = useQuery({
        queryKey: ['credit_cards'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                throw new Error('Usuário não autenticado');
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

            console.log('useCardsOptions: Dados brutos recebidos:', data);

            const transformedData = (data || [])
                .filter(card => !!card.id && typeof card.id === 'number')
                .map(card => ({
                    id: card.id.toString(),
                    name: card.card_name,
                    current_value: card.current_value || 0
                }));

            console.log('useCardsOptions: Dados transformados:', transformedData);

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
