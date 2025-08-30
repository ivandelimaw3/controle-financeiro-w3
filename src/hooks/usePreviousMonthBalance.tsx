
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const usePreviousMonthBalance = () => {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAutomatic, setIsAutomatic] = useState<boolean>(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPreviousBalance = async (month: number, year: number) => {
    try {
      if (!user) {
        setBalance(null);
        setLoading(false);
        return;
      }

      console.log(`Buscando saldo anterior para ${month}/${year}`);

      // Usar a função SQL get_previous_month_balance
      const { data, error } = await supabase.rpc('get_previous_month_balance', {
        target_user_id: user.id,
        target_year: year,
        target_month: month
      });

      if (error) {
        console.error('Erro ao buscar saldo anterior:', error);
        setBalance(null);
        setLoading(false);
        return;
      }

      if (data && data.length > 0) {
        const saldoData = data[0];
        setBalance(saldoData.valor);
        setIsAutomatic(saldoData.automatico);
        console.log(`Saldo anterior encontrado: ${saldoData.valor}`);
        setLoading(false);
        return;
      }

      // Se não encontrou saldo salvo, tentar buscar do último dia do ano anterior
      if (month === 1) {
        console.log('Janeiro detectado, buscando saldo do ano anterior...');
        
        const { data: yearEndBalance, error: yearError } = await supabase.rpc('get_previous_year_final_balance', {
          target_user_id: user.id,
          target_year: year
        });

        if (yearError) {
          console.error('Erro ao buscar saldo final do ano anterior:', yearError);
          setBalance(0);
          setIsAutomatic(true);
        } else {
          const finalBalance = yearEndBalance || 0;
          console.log(`Saldo final do ano anterior: ${finalBalance}`);
          
          // Salvar automaticamente como saldo anterior de janeiro
          await savePreviousBalance(month, year, finalBalance, true);
          setBalance(finalBalance);
          setIsAutomatic(true);
        }
      } else {
        // Para outros meses, buscar o saldo final do mês anterior
        const prevMonth = month === 1 ? 12 : month - 1;
        const prevYear = month === 1 ? year - 1 : year;
        
        console.log(`Buscando saldo final de ${prevMonth}/${prevYear}`);
        
        // Calcular saldo final do mês anterior
        const { data: accountsData, error: accountsError } = await supabase
          .from('accounts')
          .select('amount, type, status')
          .eq('user_id', user.id)
          .gte('due_date', `${prevYear}-${prevMonth.toString().padStart(2, '0')}-01`)
          .lt('due_date', `${year}-${month.toString().padStart(2, '0')}-01`);

        if (accountsError) {
          console.error('Erro ao buscar contas do mês anterior:', accountsError);
          setBalance(0);
          setIsAutomatic(true);
        } else {
          const receitas = accountsData
            .filter(acc => acc.type === 'receita' && acc.status === 'recebido')
            .reduce((sum, acc) => sum + Number(acc.amount), 0);
          
          const despesas = accountsData
            .filter(acc => acc.type === 'despesa' && acc.status === 'pago')
            .reduce((sum, acc) => sum + Math.abs(Number(acc.amount)), 0);

          // Buscar saldo anterior do mês anterior
          const { data: prevBalanceData } = await supabase.rpc('get_previous_month_balance', {
            target_user_id: user.id,
            target_year: prevYear,
            target_month: prevMonth
          });

          const prevBalance = prevBalanceData && prevBalanceData.length > 0 ? prevBalanceData[0].valor : 0;
          const finalBalance = prevBalance + receitas - despesas;
          
          console.log(`Saldo calculado para ${month}/${year}: ${finalBalance}`);
          
          // Salvar automaticamente
          await savePreviousBalance(month, year, finalBalance, true);
          setBalance(finalBalance);
          setIsAutomatic(true);
        }
      }
    } catch (err) {
      console.error('Erro ao buscar saldo anterior:', err);
      setBalance(0);
      setIsAutomatic(true);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o saldo anterior.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const savePreviousBalance = async (month: number, year: number, amount: number, automatic: boolean = false) => {
    try {
      if (!user) return false;

      const { data, error } = await supabase.rpc('save_previous_month_balance', {
        target_user_id: user.id,
        target_year: year,
        target_month: month,
        balance_value: amount,
        is_automatic: automatic
      });

      if (error) {
        console.error('Erro ao salvar saldo anterior:', error);
        toast({
          title: "Erro",
          description: "Não foi possível salvar o saldo anterior.",
          variant: "destructive"
        });
        return false;
      }

      console.log(`Saldo anterior salvo: ${amount} para ${month}/${year}`);
      return true;
    } catch (err) {
      console.error('Erro ao salvar saldo anterior:', err);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o saldo anterior.",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateManualBalance = async (month: number, year: number, newAmount: number) => {
    try {
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado.",
          variant: "destructive"
        });
        return false;
      }

      const success = await savePreviousBalance(month, year, newAmount, false);
      
      if (success) {
        setBalance(newAmount);
        setIsAutomatic(false);
        toast({
          title: "Sucesso",
          description: "Saldo anterior atualizado com sucesso.",
        });
      }
      
      return success;
    } catch (err) {
      console.error('Erro ao atualizar saldo manual:', err);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o saldo anterior.",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    balance,
    loading,
    isAutomatic,
    fetchPreviousBalance,
    updateManualBalance,
  };
};
