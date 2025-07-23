// useCartoes-banks.ts - Hook adaptado para a tabela banks

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { 
  CartaoCredito, 
  CartaoCreditoForm, 
  CartaoCreditoCreate, 
  CartaoCreditoUpdate,
  Bank,
  CartaoFilters,
  SortOptions 
} from './types-banks';

export const useCartoes = () => {
  const [cartoes, setCartoes] = useState<CartaoCredito[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Buscar todos os cartões do usuário
  const fetchCartoes = async (filters?: CartaoFilters, sort?: SortOptions) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
  .from("cartoes_credito")
  .select(`
    *,
    bank_id:banks(id, name, agency, account_number, account_type, nickname, balance)
  `);

      // Aplicar filtros
      if (filters?.bank_id) {
        query = query.eq('bank_id', filters.bank_id);
      }
      if (filters?.data_pagamento) {
        query = query.eq('data_pagamento', filters.data_pagamento);
      }
      if (filters?.valor_min !== undefined) {
        query = query.gte('valor_atual', filters.valor_min);
      }
      if (filters?.valor_max !== undefined) {
        query = query.lte('valor_atual', filters.valor_max);
      }

      // Aplicar ordenação
      if (sort) {
        query = query.order(sort.field, { ascending: sort.direction === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      setCartoes(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar cartões';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Buscar contas bancárias do usuário
  const fetchBanks = async () => {
    try {
      const { data, error } = await supabase
        .from('banks')
        .select('*')
        .order('name');

      if (error) throw error;

      setBanks(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar contas bancárias';
      console.error('Erro ao buscar contas bancárias:', errorMessage);
    }
  };

  // Criar novo cartão
  const createCartao = async (cartaoData: CartaoCreditoForm): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const newCartao: CartaoCreditoCreate = {
        ...cartaoData,
        user_id: user.id,
      };

      const { error } = await supabase
        .from('cartoes_credito')
        .insert([newCartao]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Cartão cadastrado com sucesso!",
      });

      await fetchCartoes(); // Recarregar lista
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar cartão';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar cartão existente
  const updateCartao = async (cartaoData: CartaoCreditoUpdate): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { id, ...updateData } = cartaoData;

      const { error } = await supabase
        .from('cartoes_credito')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Cartão atualizado com sucesso!",
      });

      await fetchCartoes(); // Recarregar lista
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar cartão';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Deletar cartão
  const deleteCartao = async (cartaoId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('cartoes_credito')
        .delete()
        .eq('id', cartaoId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Cartão removido com sucesso!",
      });

      await fetchCartoes(); // Recarregar lista
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar cartão';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Buscar cartão por ID
  const getCartaoById = async (cartaoId: string): Promise<CartaoCredito | null> => {
    try {
      const { data, error } = await supabase
        .from('cartoes_credito')
        .select(`
          *,
          bank:banks(id, name, agency, account_number, account_type, nickname, balance)
        `)
        .eq('id', cartaoId)
        .single();

      if (error) throw error;

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar cartão';
      setError(errorMessage);
      return null;
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    fetchCartoes();
    fetchBanks();
  }, []);

  return {
    cartoes,
    banks,
    loading,
    error,
    fetchCartoes,
    fetchBanks,
    createCartao,
    updateCartao,
    deleteCartao,
    getCartaoById,
  };
};

