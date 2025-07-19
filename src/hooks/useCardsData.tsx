import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CardInput } from '@/components/Cards/CardForm';
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

export interface Card extends CardInput {
  id: number;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export const useCardsData = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar cartões do usuário
  const {
    data: cards = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['cards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Erro ao buscar cartões:', error);
        throw error;
      }
      return (data || []) as Card[];
    }
  });

  // Criar novo cartão
  const createCardMutation = useMutation({
    mutationFn: async (cardData: CardInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('cards')
        .insert({
          ...cardData,
          user_id: user?.id
        })
        .select()
        .single();
      if (error) {
        console.error('Erro ao criar cartão:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      toast({
        title: 'Cartão cadastrado com sucesso!',
        description: 'O cartão foi adicionado à sua lista.',
      });
    },
    onError: (error) => {
      console.error('Erro ao cadastrar cartão:', error);
      toast({
        title: 'Erro ao cadastrar cartão',
        description: 'Não foi possível cadastrar o cartão. Tente novamente.',
        variant: 'destructive',
      });
    }
  });

  // Atualizar cartão
  const updateCardMutation = useMutation({
    mutationFn: async ({ id, ...cardData }: Partial<Card> & { id: number }) => {
      const { data, error } = await supabase
        .from('cards')
        .update({ ...cardData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) {
        console.error('Erro ao atualizar cartão:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      toast({
        title: 'Cartão atualizado com sucesso!',
        description: 'As informações do cartão foram atualizadas.',
      });
    },
    onError: (error) => {
      console.error('Erro ao atualizar cartão:', error);
      toast({
        title: 'Erro ao atualizar cartão',
        description: 'Não foi possível atualizar o cartão. Tente novamente.',
        variant: 'destructive',
      });
    }
  });

  // Deletar cartão
  const deleteCardMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', id);
      if (error) {
        console.error('Erro ao deletar cartão:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      toast({
        title: 'Cartão removido com sucesso!',
        description: 'O cartão foi removido da sua lista.',
      });
    },
    onError: (error) => {
      console.error('Erro ao deletar cartão:', error);
      toast({
        title: 'Erro ao remover cartão',
        description: 'Não foi possível remover o cartão. Tente novamente.',
        variant: 'destructive',
      });
    }
  });

  return {
    cards,
    isLoading,
    error,
    refetch,
    createCard: createCardMutation.mutate,
    updateCard: updateCardMutation.mutate,
    deleteCard: deleteCardMutation.mutate,
    isCreating: createCardMutation.isPending,
    isUpdating: updateCardMutation.isPending,
    isDeleting: deleteCardMutation.isPending,
  };
}; 