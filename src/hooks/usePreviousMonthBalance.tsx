
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const usePreviousMonthBalance = (year: number, month: number) => {
  const [previousBalance, setPreviousBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [canEdit, setCanEdit] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Verificar se é janeiro do ano atual (pode ser editado)
  const checkIfEditable = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    return month === 1 && year === currentYear;
  };

  // Buscar saldo do ano anterior para janeiro
  const fetchPreviousYearBalance = async () => {
    if (!user) return 0;

    try {
      // Buscar última conta do ano anterior (dezembro)
      const { data, error } = await supabase
        .from('accounts')
        .select('amount')
        .eq('user_id', user.id)
        .like('due_date', `${year - 1}-12-%`)
        .eq('status', 'recebido')
        .order('amount', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar saldo ano anterior:', error);
        return 0;
      }

      return data?.amount || 0;
    } catch (error) {
      console.error('Erro ao buscar saldo ano anterior:', error);
      return 0;
    }
  };

  // Carregar saldo do mês anterior usando a função do Supabase
  const loadPreviousBalance = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Para janeiro, verificar se já existe saldo registrado usando a função
      if (month === 1) {
        const { data: existingBalance, error } = await supabase.rpc('get_previous_month_balance', {
          target_user_id: user.id,
          target_year: year,
          target_month: 1
        });

        if (error) {
          console.error('Erro ao buscar saldo existente:', error);
        }

        if (existingBalance && existingBalance.length > 0 && existingBalance[0].valor !== null) {
          setPreviousBalance(existingBalance[0].valor);
          setCanEdit(checkIfEditable());
          setLoading(false);
          return;
        }

        // Se não existe, buscar do ano anterior
        const previousYearBalance = await fetchPreviousYearBalance();
        
        if (previousYearBalance > 0) {
          // Registrar automaticamente usando a função
          const { error: saveError } = await supabase.rpc('save_previous_month_balance', {
            target_user_id: user.id,
            target_year: year,
            target_month: 1,
            balance_value: previousYearBalance,
            is_automatic: true
          });

          if (!saveError) {
            setPreviousBalance(previousYearBalance);
            
            toast({
              title: "Saldo Inicial Detectado",
              description: `Saldo de R$ ${previousYearBalance.toFixed(2)} foi importado do ano anterior.`,
            });
          }
        } else {
          setPreviousBalance(0);
        }
        
        setCanEdit(checkIfEditable());
      } else {
        // Para outros meses, buscar do mês anterior
        const mesBusca = month === 1 ? 12 : month - 1;
        const anoBusca = month === 1 ? year - 1 : year;

        const { data, error } = await supabase.rpc('get_previous_month_balance', {
          target_user_id: user.id,
          target_year: anoBusca,
          target_month: mesBusca
        });

        if (error) {
          console.error('Erro ao buscar saldo anterior:', error);
          setPreviousBalance(0);
        } else if (data && data.length > 0) {
          setPreviousBalance(data[0].valor || 0);
        } else {
          setPreviousBalance(0);
        }
        
        setCanEdit(false); // Outros meses não são editáveis
      }
    } catch (error) {
      console.error('Erro ao carregar saldo anterior:', error);
      setPreviousBalance(0);
    } finally {
      setLoading(false);
    }
  };

  // Salvar saldo do mês anterior usando a função do Supabase
  const savePreviousBalance = async (value: number, automatic: boolean = false) => {
    if (!user) return false;

    try {
      const { error } = await supabase.rpc('save_previous_month_balance', {
        target_user_id: user.id,
        target_year: year,
        target_month: month,
        balance_value: value,
        is_automatic: automatic
      });

      if (error) {
        console.error('Erro ao salvar saldo:', error);
        if (!automatic) {
          toast({
            title: "Erro",
            description: "Não foi possível salvar o saldo.",
            variant: "destructive"
          });
        }
        return false;
      }

      setPreviousBalance(value);
      
      if (!automatic) {
        toast({
          title: "Sucesso",
          description: "Saldo do mês anterior salvo com sucesso.",
        });
      }

      return true;
    } catch (error) {
      console.error('Erro ao salvar saldo:', error);
      if (!automatic) {
        toast({
          title: "Erro",
          description: "Não foi possível salvar o saldo.",
          variant: "destructive"
        });
      }
      return false;
    }
  };

  useEffect(() => {
    loadPreviousBalance();
  }, [user, year, month]);

  return {
    previousBalance,
    loading,
    canEdit,
    savePreviousBalance,
    refreshBalance: loadPreviousBalance
  };
};
