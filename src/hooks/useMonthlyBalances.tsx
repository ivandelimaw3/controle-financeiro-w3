
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
    if (!user) {
      console.error('Usuário não autenticado');
      return;
    }

    try {
      console.log(`Salvando saldo ${amount} para ${month}/${year} - User ID: ${user.id}`);
      
      // Verificar se já existe um registro
      const { data: existing } = await supabase
        .from('monthly_balances')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', month)
        .eq('year', year)
        .single();

      let result;
      
      if (existing) {
        console.log('Atualizando registro existente:', existing.id);
        // Atualizar registro existente
        result = await supabase
          .from('monthly_balances')
          .update({ balance: amount })
          .eq('id', existing.id)
          .select()
          .single();
      } else {
        console.log('Criando novo registro');
        // Criar novo registro
        result = await supabase
          .from('monthly_balances')
          .insert({
            user_id: user.id,
            month,
            year,
            balance: amount
          })
          .select()
          .single();
      }

      const { data, error } = result;

      if (error) {
        console.error('Erro ao salvar saldo mensal:', error);
        toast({
          title: "Erro",
          description: "Não foi possível salvar o saldo mensal.",
          variant: "destructive"
        });
        return;
      }

      console.log('Saldo salvo com sucesso:', data);

      // Atualizar estado local
      setBalances(prev => {
        const existingIndex = prev.findIndex(b => b.month === month && b.year === year);
        if (existingIndex >= 0) {
          const newBalances = [...prev];
          newBalances[existingIndex] = { ...newBalances[existingIndex], balance: amount, updated_at: data.updated_at };
          return newBalances;
        } else {
          return [...prev, data];
        }
      });

      toast({
        title: "Sucesso",
        description: "Saldo mensal atualizado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao salvar saldo mensal:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o saldo mensal.",
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
