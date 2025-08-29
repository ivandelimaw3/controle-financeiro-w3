import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

interface PreviousBalance {
  id?: number;
  amount: number;
  date: string; // YYYY-MM-DD
}

export const usePreviousBalance = () => {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchPreviousBalance = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const lastDayOfYear = `${currentYear - 1}-12-31`;

      const { data, error } = await supabase
        .from('account')
        .select('amount')
        .eq('date', lastDayOfYear)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar saldo anterior:', error);
        return;
      }

      if (data) {
        setBalance(data.amount);
        saveToPreviousBalanceTable(data.amount, lastDayOfYear);
      } else {
        setBalance(null); // Nenhum saldo encontrado
      }
    } catch (err) {
      console.error('Erro ao buscar saldo anterior:', err);
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

      if (error) throw error;

      console.log(`Saldo inicial salvo em ${date}`);
    } catch (err) {
      console.error('Erro ao salvar saldo inicial:', err);
    }
  };

  const updateManualBalance = async (newAmount: number) => {
    const currentYear = new Date().getFullYear();
    const firstDayOfYear = `${currentYear}-01-01`;

    try {
      const { error } = await supabase.from('previous_balance').upsert(
        {
          amount: newAmount,
          date: firstDayOfYear,
        },
        { onConflict: 'date' }
      );

      if (error) throw error;

      setBalance(newAmount);
    } catch (err) {
      console.error('Erro ao atualizar saldo manual:', err);
    }
  };

  useEffect(() => {
    fetchPreviousBalance();
  }, []);

  return {
    balance,
    loading,
    updateManualBalance,
  };
};
