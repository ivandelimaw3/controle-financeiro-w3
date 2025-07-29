import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CreditCard {
  id: string;
  user_id: string;
  card_name: string;
  card_number: string;
  expiry_date: string; // text
  current_value: number; // numeric
  created_at: string;
  updated_at: string;
  bank_name: string | null; // character varying, nullable
  due_date: string | null; // text, nullable
  credit_limit: number | null; // numeric, nullable
}

export interface CreditCardInput {
  card_name: string;
  card_number: string;
  expiry_date: string; // text
  current_value: number; // numeric
  bank_name?: string; // character varying, optional
  due_date?: string; // text, optional
  credit_limit?: number; // numeric, optional
}

function formatCardNumber(value: string) {
  return value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim().slice(0, 19);
}

export function useCreditCardsData() {
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
        .from("cards")
        .select(`
          id,
          user_id,
          card_name,
          card_number,
          expiry_date,
          current_value,
          created_at,
          updated_at,
          bank_name,
          due_date,
          credit_limit
        `);
      
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
        setError('Usuário não autenticado');
        setIsCreating(false);
        return;
      }

      const formattedCard = {
        ...card,
        card_number: formatCardNumber(card.card_number),
        user_id: user.id,
        // Garantir que os campos obrigatórios estejam presentes
        current_value: card.current_value || 0,
        bank_name: card.bank_name || null,
        due_date: card.due_date || null,
        expiry_date: card.expiry_date || '',
        credit_limit: card.credit_limit || null
      };

      console.log('Enviando cartão para o Supabase:', formattedCard);
      
      const { error } = await supabase.from("cards").insert([formattedCard]);
      
      if (error) {
        console.error('Erro ao criar cartão:', error);
        setError(error);
      } else {
        await fetchCreditCards();
      }
    } catch (err) {
      console.error('Erro inesperado ao criar cartão:', err);
      setError(err);
    }
    setIsCreating(false);
  }

  async function updateCreditCard(card: CreditCard & { id: string }) {
    setIsUpdating(true);
    try {
      const formattedCard = {
        ...card,
        card_number: formatCardNumber(card.card_number),
        // Garantir que os campos obrigatórios estejam presentes
        current_value: card.current_value || 0,
        bank_name: card.bank_name || null,
        due_date: card.due_date || null,
        expiry_date: card.expiry_date || '',
        credit_limit: card.credit_limit || null
      };

      const { error } = await supabase
        .from("cards")
        .update(formattedCard)
        .eq("id", card.id);
      
      if (error) {
        console.error('Erro ao atualizar cartão:', error);
        setError(error);
      } else {
        await fetchCreditCards();
      }
    } catch (err) {
      console.error('Erro inesperado ao atualizar cartão:', err);
      setError(err);
    }
    setIsUpdating(false);
  }

  async function deleteCreditCard(id: string) {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("cards")
        .delete()
        .eq("id", id);
      
      if (error) {
        console.error('Erro ao deletar cartão:', error);
        setError(error);
      } else {
        await fetchCreditCards();
      }
    } catch (err) {
      console.error('Erro inesperado ao deletar cartão:', err);
      setError(err);
    }
    setIsDeleting(false);
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
    fetchCreditCards,
  };
}