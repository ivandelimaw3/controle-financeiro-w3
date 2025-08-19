// src/hooks/useCreditCardAccounts.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export interface CreditCardAccount {
  id: string; // UUID
  description: string;
  amount: number;
  category_id: number | null; 
  payment_source: 'cash' | 'bank' | 'card';
  payment_source_id: number | null;
  status: 'pendente' | 'pago';
  due_date: string;
  posted_at: string;
  parcela: number;
  total_parcelas: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  type: string;
  color: string;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreditCard {
  id: number;
  user_id: string;
  card_name: string;
  card_number: string;
  holder_name: string;
  expiry_date: string;
  due_date: string | null;
  credit_limit: number;
  current_value: number;
  bank_name: string | null;
  card_brand: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useCreditCardAccounts = () => {
  const [accounts, setAccounts] = useState<CreditCardAccount[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const invalidateCardsCache = () => {
    queryClient.invalidateQueries({ queryKey: ['creditcards'] });
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      if (!user) {
        setAccounts([]);
        setCategories([]);
        setCreditCards([]);
        return;
      }

      // Categorias
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id);

      if (catError) throw catError;
      setCategories(catData ?? []);

      // Cartões
      const { data: cardData, error: cardError } = await supabase
        .from('creditcards')
        .select('*')
        .eq('user_id', user.id);

      if (cardError) throw cardError;
      setCreditCards(cardData ?? []);

      // Contas de cartões
      const { data: accData, error: accError } = await supabase
        .from('credit_card_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (accError) throw accError;
      setAccounts(accData ?? []);
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createAccount = async (
    accountData: Omit<CreditCardAccount, 'id' | 'created_at' | 'updated_at'>
  ) => {
    try {
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from('credit_card_accounts')
        .insert([{ ...accountData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      setAccounts(prev => [data, ...prev]);

      if (accountData.status === 'pago') {
        invalidateCardsCache();
      }

      toast({
        title: "Sucesso",
        description: "Conta criada com sucesso."
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a conta.",
        variant: "destructive"
      });
    }
  };

  const updateAccount = async (id: string, updates: Partial<CreditCardAccount>) => {
    try {
      const { data, error } = await supabase
        .from('credit_card_accounts')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;

      setAccounts(prev => prev.map(acc => acc.id === id ? data : acc));

      if (updates.status === 'pago') {
        invalidateCardsCache();
      }

      toast({
        title: "Sucesso",
        description: "Conta atualizada com sucesso."
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a conta.",
        variant: "destructive"
      });
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      const accountToDelete = accounts.find(acc => acc.id === id);

      const { error } = await supabase
        .from('credit_card_accounts')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      setAccounts(prev => prev.filter(acc => acc.id !== id));

      if (accountToDelete?.status === 'pago') {
        invalidateCardsCache();
      }

      toast({
        title: "Sucesso",
        description: "Conta deletada com sucesso."
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Não foi possível deletar a conta.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      setAccounts([]);
      setCategories([]);
      setCreditCards([]);
      setLoading(false);
    }
  }, [user]);

  return {
    accounts,
    categories,
    creditCards,
    loading,
    createAccount,
    updateAccount,
    deleteAccount,
    refreshAccounts: fetchData
  };
};
