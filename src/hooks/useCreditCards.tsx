import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CreditCard {
  id: number;
  user_id: string;
  card_name: string;
  card_number: string;
  holder_name: string;
  expiry_date: string;
  due_date?: string;
  credit_limit: number;
  current_value: number;
  bank_name?: string;
  card_brand: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreditCardInput {
  card_name: string;
  card_number: string;
  holder_name: string;
  expiry_date: string;
  due_date?: string;
  credit_limit: number;
  current_value: number;
  bank_name?: string;
  card_brand?: string;
}

function formatCardNumber(value: string) {
  return value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim().slice(0, 19);
}

function formatExpiryDate(value: string) {
  // Converte de YYYY-MM para MM/YYYY
  if (value.includes('-')) {
    const [year, month] = value.split('-');
    return `${month}/${year}`;
  }
  return value;
}

export function useCreditCards() {
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchCreditCards();
  }, []);

  async function fetchCreditCards() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("credit_cards")
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar cartões:', error);
        setError(error);
      } else {
        setCreditCards(data || []);
      }
    } catch (err) {
      console.error('Erro inesperado ao buscar cartões:', err);
      setError(err);
    }
    setIsLoading(false);
  }

  async function createCreditCard(card: CreditCardInput) {
    setIsCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const formattedCard = {
        ...card,
        card_number: formatCardNumber(card.card_number),
        expiry_date: formatExpiryDate(card.expiry_date),
        user_id: user.id,
        card_brand: card.card_brand || 'visa',
        credit_limit: card.credit_limit || 0,
        current_value: card.current_value || 0,
        is_active: true,
      };

      const { error } = await supabase
        .from("credit_cards")
        .insert([formattedCard]);

      if (error) {
        throw error;
      }

      await fetchCreditCards();
    } catch (err) {
      console.error('Erro ao criar cartão:', err);
      setError(err);
      throw err;
    } finally {
      setIsCreating(false);
    }
  }

  async function updateCreditCard(id: number, card: CreditCardInput) {
    setIsUpdating(true);
    try {
      const formattedCard = {
        ...card,
        card_number: formatCardNumber(card.card_number),
        expiry_date: formatExpiryDate(card.expiry_date),
        card_brand: card.card_brand || 'visa',
        credit_limit: card.credit_limit || 0,
        current_value: card.current_value || 0,
      };

      const { error } = await supabase
        .from("credit_cards")
        .update(formattedCard)
        .eq('id', id);

      if (error) {
        throw error;
      }

      await fetchCreditCards();
    } catch (err) {
      console.error('Erro ao atualizar cartão:', err);
      setError(err);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }

  async function deleteCreditCard(id: number) {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("credit_cards")
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        throw error;
      }

      await fetchCreditCards();
    } catch (err) {
      console.error('Erro ao excluir cartão:', err);
      setError(err);
      throw err;
    } finally {
      setIsDeleting(false);
    }
  }

  return {
    creditCards,
    isLoading,
    error,
    isCreating,
    isUpdating,
    isDeleting,
    createCreditCard,
    updateCreditCard,
    deleteCreditCard,
    refetch: fetchCreditCards,
  };
}