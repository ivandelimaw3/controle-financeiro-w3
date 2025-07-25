import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CreditCard {
  id: string;
  user_id: string;
  card_name: string;
  card_number: string;
  expiry_date: string; // date (YYYY-MM-DD)
  bank_id: number;
  current_value: number;
  created_at: string;
  updated_at: string;
  bank_name: string;
  due_date: string; // date (YYYY-MM-DD)
}

export interface CreditCardInput {
  card_name: string;
  card_number: string;
  expiry_date: string; // YYYY-MM-DD
  bank_id: number;
  current_value: number;
  bank_name: string;
  due_date: string; // YYYY-MM-DD
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
    const { data, error } = await supabase
      .from("cards")
      .select("id,user_id,card_name,card_number,expiry_date,current_value,created_at,updated_at,bank_name,due_date");
    if (!error) setCreditCards(data || []);
    else setError(error);
    setIsLoading(false);
  }

  async function createCreditCard(card: CreditCardInput) {
    setIsCreating(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsCreating(false);
      setError('Usuário não autenticado');
      return;
    }
    const formattedCard = {
      ...card,
      card_number: formatCardNumber(card.card_number),
      user_id: user.id,
    };
    console.log('Enviando cartão para o Supabase:', formattedCard);
    const { error } = await supabase.from("cards").insert([formattedCard]);
    if (!error) await fetchCreditCards();
    setIsCreating(false);
    if (error) setError(error);
  }

  async function updateCreditCard(card: CreditCard & { id: string }) {
    setIsUpdating(true);
    const formattedCard = {
      ...card,
      card_number: formatCardNumber(card.card_number),
    };
    const { error } = await supabase
      .from("cards")
      .update(formattedCard)
      .eq("id", card.id);
    if (!error) await fetchCreditCards();
    setIsUpdating(false);
    if (error) setError(error);
  }

  async function deleteCreditCard(id: string) {
    setIsDeleting(true);
    const { error } = await supabase
      .from("cards")
      .delete()
      .eq("id", id);
    if (!error) await fetchCreditCards();
    setIsDeleting(false);
    if (error) setError(error);
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
