
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Investment {
  id: number;
  institution_id: number;
  type_id: number;
  name: string;
  invested_amount: number;
  current_value: number;
  yield_percentage: number | null;
  purchase_date: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  institution?: {
    id: number;
    name: string;
  };
  type?: {
    id: number;
    name: string;
    category: string;
  };
}

export interface InvestmentInstitution {
  id: number;
  name: string;
  user_id: string;
}

export interface InvestmentType {
  id: number;
  name: string;
  category: string;
  user_id: string;
}

export const useInvestmentsData = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [institutions, setInstitutions] = useState<InvestmentInstitution[]>([]);
  const [types, setTypes] = useState<InvestmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchInvestments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('investments')
        .select(`
          *,
          institution:investment_institutions(id, name),
          type:investment_types(id, name, category)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvestments(data || []);
    } catch (error) {
      console.error('Erro ao buscar investimentos:', error);
      toast.error('Erro ao carregar investimentos');
    }
  };

  const fetchInstitutions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('investment_institutions')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setInstitutions(data || []);
    } catch (error) {
      console.error('Erro ao buscar instituições:', error);
    }
  };

  const fetchTypes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('investment_types')
        .select('*')
        .order('name');

      if (error) throw error;
      setTypes(data || []);
    } catch (error) {
      console.error('Erro ao buscar tipos:', error);
    }
  };

  const addInvestment = async (investment: Omit<Investment, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('investments')
        .insert([{ ...investment, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      await fetchInvestments();
      toast.success('Investimento adicionado com sucesso!');
      return data;
    } catch (error) {
      console.error('Erro ao adicionar investimento:', error);
      toast.error('Erro ao adicionar investimento');
      throw error;
    }
  };

  const updateInvestment = async (id: number, updates: Partial<Investment>) => {
    try {
      const { error } = await supabase
        .from('investments')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      await fetchInvestments();
      toast.success('Investimento atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar investimento:', error);
      toast.error('Erro ao atualizar investimento');
      throw error;
    }
  };

  const deleteInvestment = async (id: number) => {
    try {
      const { error } = await supabase
        .from('investments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchInvestments();
      toast.success('Investimento removido com sucesso!');
    } catch (error) {
      console.error('Erro ao remover investimento:', error);
      toast.error('Erro ao remover investimento');
      throw error;
    }
  };

  const addInstitution = async (name: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('investment_institutions')
        .insert([{ name, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      await fetchInstitutions();
      toast.success('Instituição adicionada com sucesso!');
      return data;
    } catch (error) {
      console.error('Erro ao adicionar instituição:', error);
      toast.error('Erro ao adicionar instituição');
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      const loadData = async () => {
        setLoading(true);
        await Promise.all([
          fetchInvestments(),
          fetchInstitutions(),
          fetchTypes()
        ]);
        setLoading(false);
      };
      
      loadData();
    }
  }, [user]);

  return {
    investments,
    institutions,
    types,
    loading,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    addInstitution,
    refetch: () => Promise.all([fetchInvestments(), fetchInstitutions(), fetchTypes()])
  };
};
