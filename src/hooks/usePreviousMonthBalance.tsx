
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
      const { data, error } = await supabase
        .rpc('get_previous_year_final_balance', {
          target_user_id: user.id,
          target_year: year
        });

      if (error) {
        console.error('Erro ao buscar saldo ano anterior:', error);
        return 0;
      }

      return data || 0;
    } catch (error) {
      console.error('Erro ao buscar saldo ano anterior:', error);
      return 0;
    }
  };

  // Carregar saldo do mês anterior
  const loadPreviousBalance = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Para janeiro, implementar lógica especial
      if (month === 1) {
        // Primeiro verificar se já existe saldo registrado
        const { data: existingBalance } = await supabase
          .rpc('get_previous_month_balance', {
            target_user_id: user.id,
            target_year: year,
            target_month: 1
          })
          .maybeSingle();

        if (existingBalance && existingBalance.valor !== null) {
          setPreviousBalance(existingBalance.valor);
          setCanEdit(checkIfEditable());
          setLoading(false);
          return;
        }

        // Se não existe, buscar do ano anterior
        const previousYearBalance = await fetchPreviousYearBalance();
        
        if (previousYearBalance > 0) {
          // Registrar automaticamente
          await savePreviousBalance(previousYearBalance, true);
          setPreviousBalance(previousYearBalance);
          
          toast({
            title: "Saldo Inicial Detectado",
            description: `Saldo de R$ ${previousYearBalance.toFixed(2)} foi importado do ano anterior.`,
          });
        } else {
          setPreviousBalance(0);
        }
        
        setCanEdit(checkIfEditable());
      } else {
        // Para outros meses, buscar do mês anterior
        const { data } = await supabase
          .rpc('get_previous_month_balance', {
            target_user_id: user.id,
            target_year: month === 1 ? year - 1 : year,
            target_month: month === 1 ? 12 : month - 1
          })
          .maybeSingle();

        setPreviousBalance(data?.valor || 0);
        setCanEdit(false); // Outros meses não são editáveis
      }
    } catch (error) {
      console.error('Erro ao carregar saldo anterior:', error);
      setPreviousBalance(0);
    } finally {
      setLoading(false);
    }
  };

  // Salvar saldo do mês anterior
  const savePreviousBalance = async (value: number, automatic: boolean = false) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .rpc('save_previous_month_balance', {
          target_user_id: user.id,
          target_year: year,
          target_month: month,
          balance_value: value,
          is_automatic: automatic
        });

      if (error) throw error;

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
