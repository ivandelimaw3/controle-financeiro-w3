
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

      // Primeiro, tentar buscar saldo salvo na tabela saldo_mes_anterior
      const { data: savedBalance, error: savedError } = await supabase
        .from('saldo_mes_anterior')
        .select('valor, automatico')
        .eq('user_id', user.id)
        .eq('ano', year)
        .eq('mes', month)
        .maybeSingle();

      if (savedError) {
        console.error('Erro ao buscar saldo salvo:', savedError);
      }

      if (savedBalance) {
        setBalance(savedBalance.valor);
        setIsAutomatic(savedBalance.automatico);
        console.log(`Saldo anterior encontrado: ${savedBalance.valor}`);
        setLoading(false);
        return;
      }

      // Se não encontrou saldo salvo, calcular automaticamente
      let calculatedBalance = 0;

      if (month === 1) {
        // Para janeiro, buscar saldo final do ano anterior
        console.log('Janeiro detectado, buscando saldo do ano anterior...');
        
        const lastDayOfPreviousYear = `${year - 1}-12-31`;
        
        const { data: accountsData, error: accountsError } = await supabase
          .from('accounts')
          .select('amount, type, status')
          .eq('user_id', user.id)
          .lte('due_date', lastDayOfPreviousYear);

        if (accountsError) {
          console.error('Erro ao buscar contas do ano anterior:', accountsError);
        } else {
          const receitas = accountsData
            .filter(acc => acc.type === 'receita' && acc.status === 'recebido')
            .reduce((sum, acc) => sum + Number(acc.amount), 0);
          
          const despesas = accountsData
            .filter(acc => acc.type === 'despesa' && acc.status === 'pago')
            .reduce((sum, acc) => sum + Math.abs(Number(acc.amount)), 0);

          calculatedBalance = receitas - despesas;
        }
      } else {
        // Para outros meses, buscar o saldo final do mês anterior
        const prevMonth = month === 1 ? 12 : month - 1;
        const prevYear = month === 1 ? year - 1 : year;
        
        console.log(`Buscando saldo final de ${prevMonth}/${prevYear}`);
        
        // Buscar saldo anterior do mês anterior
        const { data: prevBalanceData } = await supabase
          .from('saldo_mes_anterior')
          .select('valor')
          .eq('user_id', user.id)
          .eq('ano', prevYear)
          .eq('mes', prevMonth)
          .maybeSingle();

        let prevBalance = prevBalanceData ? prevBalanceData.valor : 0;

        // Calcular movimentação do mês anterior
        const startDate = `${prevYear}-${prevMonth.toString().padStart(2, '0')}-01`;
        const endDate = month === 1 
          ? `${year}-01-01`
          : `${year}-${month.toString().padStart(2, '0')}-01`;

        const { data: accountsData, error: accountsError } = await supabase
          .from('accounts')
          .select('amount, type, status')
          .eq('user_id', user.id)
          .gte('due_date', startDate)
          .lt('due_date', endDate);

        if (accountsError) {
          console.error('Erro ao buscar contas do mês anterior:', accountsError);
        } else {
          const receitas = accountsData
            .filter(acc => acc.type === 'receita' && acc.status === 'recebido')
            .reduce((sum, acc) => sum + Number(acc.amount), 0);
          
          const despesas = accountsData
            .filter(acc => acc.type === 'despesa' && acc.status === 'pago')
            .reduce((sum, acc) => sum + Math.abs(Number(acc.amount)), 0);

          calculatedBalance = prevBalance + receitas - despesas;
        }
      }

      console.log(`Saldo calculado para ${month}/${year}: ${calculatedBalance}`);
      
      // Salvar automaticamente
      await savePreviousBalance(month, year, calculatedBalance, true);
      setBalance(calculatedBalance);
      setIsAutomatic(true);

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

      const { error } = await supabase
        .from('saldo_mes_anterior')
        .upsert({
          user_id: user.id,
          ano: year,
          mes: month,
          valor: amount,
          automatico: automatic
        }, {
          onConflict: 'user_id,ano,mes'
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
