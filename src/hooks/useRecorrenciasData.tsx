import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Recorrencia {
  id: string;
  user_id: string;
  tipo: 'receita' | 'despesa';
  titulo: string;
  valor: number;
  categoria: string;
  data_inicio: string;
  frequencia: 'mensal' | 'semanal' | 'anual';
  proxima_execucao: string;
  bank_id?: number;
  payment_method_id?: string;
  installments?: number;
  created_at: string;
  updated_at: string;
}

export const useRecorrenciasData = () => {
  const [recorrencias, setRecorrencias] = useState<Recorrencia[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecorrencias = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('recorrencias')
        .select('*')
        .order('proxima_execucao', { ascending: true });

      if (error) {
        console.error('Error fetching recorrencias:', error);
        toast.error('Erro ao carregar recorrências');
        return;
      }

      setRecorrencias((data || []) as Recorrencia[]);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao carregar recorrências');
    } finally {
      setLoading(false);
    }
  };

  const createRecorrencia = async (recorrenciaData: Omit<Recorrencia, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Usuário não autenticado');
        return false;
      }

      const { error } = await supabase
        .from('recorrencias')
        .insert({
          ...recorrenciaData,
          user_id: user.id
        });

      if (error) {
        console.error('Error creating recorrencia:', error);
        toast.error('Erro ao criar recorrência');
        return false;
      }

      toast.success('Recorrência criada com sucesso!');
      await fetchRecorrencias();
      return true;
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao criar recorrência');
      return false;
    }
  };

  const updateRecorrencia = async (id: string, recorrenciaData: Partial<Recorrencia>) => {
    try {
      const { error } = await supabase
        .from('recorrencias')
        .update(recorrenciaData)
        .eq('id', id);

      if (error) {
        console.error('Error updating recorrencia:', error);
        toast.error('Erro ao atualizar recorrência');
        return false;
      }

      toast.success('Recorrência atualizada com sucesso!');
      await fetchRecorrencias();
      return true;
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao atualizar recorrência');
      return false;
    }
  };

  const deleteRecorrencia = async (id: string) => {
    try {
      const { error } = await supabase
        .from('recorrencias')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting recorrencia:', error);
        toast.error('Erro ao deletar recorrência');
        return false;
      }

      toast.success('Recorrência deletada com sucesso!');
      await fetchRecorrencias();
      return true;
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao deletar recorrência');
      return false;
    }
  };

  useEffect(() => {
    fetchRecorrencias();
  }, []);

  return {
    recorrencias,
    loading,
    fetchRecorrencias,
    createRecorrencia,
    updateRecorrencia,
    deleteRecorrencia
  };
};