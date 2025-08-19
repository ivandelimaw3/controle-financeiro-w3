// src/hooks/useCreditCardAccounts.ts
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

interface CreditCardAccount {
  id: string; // UUID
  description: string;
  amount: number;
  category_id: number | null; // BIGINT
  payment_source: 'cash' | 'bank' | 'card';
  payment_source_id: number | null; // BIGINT
  status: 'pendente' | 'pago';
  due_date: string;
  posted_at: string;
  parcela: number;
  total_parcelas: number;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: number; // BIGINT
  name: string;
  type: string;
  color: string;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

interface CreditCard {
  id: number; // BIGINT
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

  // Carregar dados iniciais
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);

        // Carregar categorias
        const {  catData, error: catError } = await supabase.from('categories').select('*');
        if (catError) throw catError;
        setCategories(catData || []);

        // Carregar cartões
        const {  cardData, error: cardError } = await supabase.from('creditcards').select('*');
        if (cardError) throw cardError;
        setCreditCards(cardData || []);

        // Carregar contas
        const {  accData, error: accError } = await supabase.from('credit_card_accounts').select('*');
        if (accError) throw accError;
        setAccounts(accData || []);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  // Atualizar contas após operações
  const refreshAccounts = async () => {
    const { data, error } = await supabase.from('credit_card_accounts').select('*');
    if (error) throw error;
    setAccounts(data || []);
  };

  const createAccount = async (accountData: Omit<CreditCardAccount, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase.from('credit_card_accounts').insert([accountData]).single();
    if (error) throw error;
    return data;
  };

  const updateAccount = async (id: string, updates: Partial<CreditCardAccount>) => {
    const { data, error } = await supabase.from('credit_card_accounts').update(updates).eq('id', id).single();
    if (error) throw error;
    return data;
  };

  const deleteAccount = async (id: string) => {
    const { error } = await supabase.from('credit_card_accounts').delete().eq('id', id);
    if (error) throw error;
  };

  return {
    accounts,
    categories,
    creditCards,
    loading,
    createAccount,
    updateAccount,
    deleteAccount,
    refreshAccounts,
  };
};
