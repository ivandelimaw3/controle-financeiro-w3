import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/ contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export const usePreviousBalance = () => {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Verifica se estamos em janeiro
  const isJanuary = new Date().getMonth() === 0;

  const fetchPreviousBalance = async () => {
    try {
      if (!user) {
        setBalance(null);
        setLoading(false);
        return;
      }

      const currentYear = new Date().getFullYear();
      const firstDayOfYear = `${currentYear}-01-01`;

      // Buscar saldo no banco de dados
      const { data, error } = await supabase
        .from('previous_balance')
        .select('amount')
        .eq('date', firstDayOfYear)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar saldo anterior:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar o saldo anterior.",
          variant: "destructive"
        });
        setBalance(null);
        setLoading(false);
        return;
      }

      if (data) {
        setBalance(data.amount);
        setLoading(false);
        return;
      }

      // Se não encontrou saldo salvo, verifica o ano anterior
      const lastYear = currentYear - 1;
      const lastDayOfYear = `${lastYear}-12-31`;

      // Consultar a tabela account no Supabase para o último dia do ano anterior
      const {  oldData, error: oldError } = await supabase
        .from('account')
        .select('amount')
        .eq('date', lastDayOfYear)
        .single();

      if (oldError && oldError.code !== 'PGRST116') {
        console.error('Erro ao buscar saldo antigo:', oldError);
      }

      if (oldData) {
        // Se encontrou valor, salva no previous_balance
        await saveToPreviousBalanceTable(oldData.amount, firstDayOfYear);
        setBalance(oldData.amount);
      } else {
        // Não há saldo anterior
        setBalance(null);
      }
    } catch (err) {
      console.error('Erro ao buscar saldo anterior:', err);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o saldo anterior.",
        variant: "destructive"
      });
      setBalance(null);
    } finally {
      setLoading(false);
    }
  };

  const saveToPreviousBalanceTable = async (amount: number, date: string) => {
    try {
      const { error } = await supabase.from('previous_balance').upsert(
        {
          amount,
          date,
        },
        { onConflict: 'date' }
      );

      if (error) {
        throw error;
      }
    } catch (err) {
      console.error('Erro ao salvar saldo inicial:', err);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o saldo inicial.",
        variant: "destructive"
      });
    }
  };

  const updateManualBalance = async (newAmount: number) => {
    try {
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado.",
          variant: "destructive"
        });
        return;
      }

      const currentYear = new Date().getFullYear();
      const firstDayOfYear = `${currentYear}-01-01`;

      const { error } = await supabase.from('previous_balance').upsert(
        {
          amount: newAmount,
          date: firstDayOfYear,
        },
        { onConflict: 'date' }
      );

      if (error) {
        throw error;
      }

      setBalance(newAmount);
      toast({
        title: "Sucesso",
        description: "Saldo inicial atualizado com sucesso.",
      });
    } catch (err) {
      console.error('Erro ao atualizar saldo manual:', err);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o saldo inicial.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchPreviousBalance();
  }, [user]);

  return {
    balance,
    loading,
    isJanuary,
    updateManualBalance,
  };
};
