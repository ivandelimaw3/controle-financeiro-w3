
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface MonthlyBalance {
  id: string;
  user_id: string;
  month: number;
  year: number;
  balance: number;
  created_at: string;
  updated_at: string;
}

export const useMonthlyBalances = () => {
  const [balances, setBalances] = useState<MonthlyBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchBalances = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('monthly_balances')
        .select('*')
        .eq('user_id', user.id)
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (error) {
        console.error('Erro ao carregar saldos mensais:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os saldos mensais.",
          variant: "destructive"
        });
        return;
      }

      console.log('Saldos mensais carregados:', data);
      setBalances(data || []);
    } catch (error) {
      console.error('Erro ao carregar saldos mensais:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMonthlyBalance = (month: number, year: number): number => {
    const balance = balances.find(b => b.month === month && b.year === year);
    const result = balance ? Number(balance.balance) : 0;
    console.log(`Saldo encontrado para ${month}/${year}:`, result);
    return result;
  };

  const updateMonthlyBalance = async (amount: number, month: number, year: number): Promise<void> => {
    if (!user) return;

    try {
      console.log(`Salvando saldo ${amount} para ${month}/${year}`);
      
      const { data, error } = await supabase
        .from('monthly_balances')
        .upsert({
          user_id: user.id,
          month,
          year,
          balance: amount
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar saldo mensal:', error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o saldo mensal.",
          variant: "destructive"
        });
        return;
      }

      console.log('Saldo salvo com sucesso:', data);

      // Atualizar estado local
      setBalances(prev => {
        const existing = prev.find(b => b.month === month && b.year === year);
        if (existing) {
          return prev.map(b => 
            b.month === month && b.year === year 
              ? { ...b, balance: amount, updated_at: data.updated_at }
              : b
          );
        } else {
          return [...prev, data];
        }
      });

      toast({
        title: "Sucesso",
        description: "Saldo mensal atualizado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao atualizar saldo mensal:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o saldo mensal.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchBalances();
  }, [user]);

  return {
    balances,
    loading,
    getMonthlyBalance,
    updateMonthlyBalance,
    refreshBalances: fetchBalances
  };
};
