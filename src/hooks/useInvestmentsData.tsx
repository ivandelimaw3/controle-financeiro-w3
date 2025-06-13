
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
  maturity_date?: string | null;
  investor_name?: string | null;
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

  console.log('useInvestmentsData: user', user);
  console.log('useInvestmentsData: loading', loading);
  console.log('useInvestmentsData: investments count', investments.length);

  const fetchInvestments = async () => {
    if (!user) {
      console.log('fetchInvestments: no user, skipping');
      return;
    }

    console.log('fetchInvestments: starting fetch for user', user.id);
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

      if (error) {
        console.error('fetchInvestments error:', error);
        throw error;
      }
      
      console.log('fetchInvestments: received data', data);
      setInvestments(data || []);
    } catch (error) {
      console.error('Erro ao buscar investimentos:', error);
      toast.error('Erro ao carregar investimentos');
    }
  };

  const fetchInstitutions = async () => {
    if (!user) {
      console.log('fetchInstitutions: no user, skipping');
      return;
    }

    console.log('fetchInstitutions: starting fetch for user', user.id);
    try {
      const { data, error } = await supabase
        .from('investment_institutions')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) {
        console.error('fetchInstitutions error:', error);
        throw error;
      }
      
      console.log('fetchInstitutions: received data', data);
      setInstitutions(data || []);
    } catch (error) {
      console.error('Erro ao buscar instituições:', error);
    }
  };

  const fetchTypes = async () => {
    if (!user) {
      console.log('fetchTypes: no user, skipping');
      return;
    }

    console.log('fetchTypes: starting fetch');
    try {
      const { data, error } = await supabase
        .from('investment_types')
        .select('*')
        .or(`user_id.eq.${user.id},user_id.eq.00000000-0000-0000-0000-000000000000`)
        .order('name');

      if (error) {
        console.error('fetchTypes error:', error);
        throw error;
      }
      
      console.log('fetchTypes: received data', data);
      setTypes(data || []);
    } catch (error) {
      console.error('Erro ao buscar tipos:', error);
    }
  };

  const addInvestment = async (investment: Omit<Investment, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    console.log('addInvestment: adding investment', investment);
    try {
      const { data, error } = await supabase
        .from('investments')
        .insert([{ ...investment, user_id: user.id }])
        .select()
        .single();

      if (error) {
        console.error('addInvestment error:', error);
        throw error;
      }
      
      console.log('addInvestment: success', data);
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
    console.log('updateInvestment: updating investment', id, updates);
    try {
      const { error } = await supabase
        .from('investments')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('updateInvestment error:', error);
        throw error;
      }
      
      console.log('updateInvestment: success');
      await fetchInvestments();
      toast.success('Investimento atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar investimento:', error);
      toast.error('Erro ao atualizar investimento');
      throw error;
    }
  };

  const deleteInvestment = async (id: number) => {
    console.log('deleteInvestment: deleting investment', id);
    try {
      const { error } = await supabase
        .from('investments')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('deleteInvestment error:', error);
        throw error;
      }
      
      console.log('deleteInvestment: success');
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

    console.log('addInstitution: adding institution', name);
    try {
      const { data, error } = await supabase
        .from('investment_institutions')
        .insert([{ name, user_id: user.id }])
        .select()
        .single();

      if (error) {
        console.error('addInstitution error:', error);
        throw error;
      }
      
      console.log('addInstitution: success', data);
      await fetchInstitutions();
      toast.success('Instituição adicionada com sucesso!');
      return data;
    } catch (error) {
      console.error('Erro ao adicionar instituição:', error);
      toast.error('Erro ao adicionar instituição');
      throw error;
    }
  };

  const addType = async (name: string, category: string) => {
    if (!user) return;

    console.log('addType: adding type', name, category);
    try {
      const { data, error } = await supabase
        .from('investment_types')
        .insert([{ name, category, user_id: user.id }])
        .select()
        .single();

      if (error) {
        console.error('addType error:', error);
        throw error;
      }
      
      console.log('addType: success', data);
      await fetchTypes();
      toast.success('Tipo de investimento adicionado com sucesso!');
      return data;
    } catch (error) {
      console.error('Erro ao adicionar tipo:', error);
      toast.error('Erro ao adicionar tipo');
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      console.log('useInvestmentsData: useEffect triggered for user', user.id);
      const loadData = async () => {
        setLoading(true);
        await Promise.all([
          fetchInvestments(),
          fetchInstitutions(),
          fetchTypes()
        ]);
        setLoading(false);
        console.log('useInvestmentsData: loading complete');
      };
      
      loadData();
    } else {
      console.log('useInvestmentsData: no user, setting loading to false');
      setLoading(false);
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
    addType,
    refetch: () => Promise.all([fetchInvestments(), fetchInstitutions(), fetchTypes()])
  };
};
