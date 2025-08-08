
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();

  // Buscar cartões usando React Query
  const {
    data: creditCards = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['credit_cards'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from("cards")
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar cartões:', error);
        throw error;
      }
      
      return data || [];
    }
  });

  // Criar cartão usando React Query Mutation
  const createCreditCardMutation = useMutation({
    mutationFn: async (card: CreditCardInput) => {
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

      const { data, error } = await supabase
        .from("cards")
        .insert([formattedCard])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit_cards'] });
      queryClient.invalidateQueries({ queryKey: ['credit_cards', queryClient.getQueryData(['auth', 'user'])?.id] });
    },
    onError: (error) => {
      console.error('Erro ao criar cartão:', error);
    }
  });

  // Atualizar cartão usando React Query Mutation
  const updateCreditCardMutation = useMutation({
    mutationFn: async (card: CreditCard) => {
      const formattedCard = {
        card_name: card.card_name,
        card_number: formatCardNumber(card.card_number),
        holder_name: card.holder_name,
        expiry_date: formatExpiryDate(card.expiry_date),
        due_date: card.due_date,
        credit_limit: card.credit_limit || 0,
        current_value: card.current_value || 0,
        bank_name: card.bank_name,
        card_brand: card.card_brand || 'visa',
      };

      const { data, error } = await supabase
        .from("cards")
        .update(formattedCard)
        .eq('id', card.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit_cards'] });
      queryClient.invalidateQueries({ queryKey: ['credit_cards', queryClient.getQueryData(['auth', 'user'])?.id] });
    },
    onError: (error) => {
      console.error('Erro ao atualizar cartão:', error);
    }
  });

  // Deletar cartão usando React Query Mutation
  const deleteCreditCardMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("cards")
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit_cards'] });
      queryClient.invalidateQueries({ queryKey: ['credit_cards', queryClient.getQueryData(['auth', 'user'])?.id] });
    },
    onError: (error) => {
      console.error('Erro ao excluir cartão:', error);
    }
  });

  // Funções wrapper para manter compatibilidade
  const addCard = async (card: CreditCardInput) => {
    return createCreditCardMutation.mutateAsync(card);
  };

  const updateCard = async (card: CreditCard) => {
    return updateCreditCardMutation.mutateAsync(card);
  };

  const deleteCard = async (id: number) => {
    return deleteCreditCardMutation.mutateAsync(id);
  };

  return {
    cards: creditCards,
    loading: isLoading,
    error,
    addCard,
    updateCard,
    deleteCard,
    refetch,
    // Manter compatibilidade com nomes antigos
    creditCards,
    isLoading,
    createCreditCard: addCard,
    updateCreditCard: updateCard,
    deleteCreditCard: deleteCard,
    isCreating: createCreditCardMutation.isPending,
    isUpdating: updateCreditCardMutation.isPending,
    isDeleting: deleteCreditCardMutation.isPending,
  };
}
