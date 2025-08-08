
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';

export interface BankOption {
  id: string;
  name: string;
  balance: number;
}

export function useBanksOptions() {
  const {
    data: banks = [],
    isLoading,
    error,
    refetch
  } = useQuery<BankOption[]>({
    queryKey: ['banks'],
    queryFn: async () => {
      console.log('useBanksOptions: Iniciando busca de bancos...');
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('useBanksOptions: Erro de autenticação:', userError);
        throw userError;
      }
      
      if (!user) {
        console.log('useBanksOptions: Usuário não autenticado');
        return [];
      }

      console.log('useBanksOptions: Buscando bancos para usuário:', user.id);

      const { data, error } = await supabase
        .from('banks')
        .select('id, name, balance')
        .eq('user_id', user.id)
        .order('name');

      if (error) {
        console.error('useBanksOptions: Erro ao carregar bancos:', error);
        throw error;
      }

      console.log('useBanksOptions: Dados brutos do banco:', data);

      // Garantir que o ID seja sempre string
      const transformedData = (data || []).map(bank => ({
        id: String(bank.id),
        name: bank.name,
        balance: bank.balance || 0
      }));

      console.log('useBanksOptions: Dados transformados:', transformedData);
      console.log('useBanksOptions: IDs após transformação:', transformedData.map(b => `${b.id} (${typeof b.id})`));
      
      return transformedData;
    },
    enabled: true,
    refetchOnWindowFocus: false,
    staleTime: 30000, // 30 segundos
    gcTime: 300000, // 5 minutos
    retry: 2
  });

  return {
    banks,
    loading: isLoading,
    error,
    refetch,
    // Compatibilidade com hooks que esperam estas propriedades
    banksOptions: banks,
    isLoading
  };
}
