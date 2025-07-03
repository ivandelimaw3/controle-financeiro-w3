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

      // Criar a recorrência
      const { error: recorrenciaError } = await supabase
        .from('recorrencias')
        .insert({
          ...recorrenciaData,
          user_id: user.id
        });

      if (recorrenciaError) {
        console.error('Error creating recorrencia:', recorrenciaError);
        toast.error('Erro ao criar recorrência');
        return false;
      }

      // Criar as parcelas na tabela accounts
      const valorParcela = recorrenciaData.valor / (recorrenciaData.installments || 1);
      const parcelas = [];
      
      console.log('Criando parcelas:', {
        valorTotal: recorrenciaData.valor,
        numParcelas: recorrenciaData.installments,
        valorParcela: valorParcela
      });

      for (let i = 0; i < (recorrenciaData.installments || 1); i++) {
        const dataVencimento = new Date(recorrenciaData.data_inicio);
        
        // Calcular data de vencimento baseada na frequência
        if (recorrenciaData.frequencia === 'mensal') {
          dataVencimento.setMonth(dataVencimento.getMonth() + i);
        } else if (recorrenciaData.frequencia === 'semanal') {
          dataVencimento.setDate(dataVencimento.getDate() + (i * 7));
        } else if (recorrenciaData.frequencia === 'anual') {
          dataVencimento.setFullYear(dataVencimento.getFullYear() + i);
        }

        parcelas.push({
          user_id: user.id,
          description: `${recorrenciaData.titulo} - Parcela ${i + 1}/${recorrenciaData.installments || 1}`,
          amount: valorParcela,
          due_date: dataVencimento.toISOString().split('T')[0],
          category: recorrenciaData.categoria,
          type: recorrenciaData.tipo,
          status: 'pendente'
        });
      }

      const { error: parcelasError } = await supabase
        .from('accounts')
        .insert(parcelas);

      if (parcelasError) {
        console.error('Error creating parcelas:', parcelasError);
        toast.error('Erro ao criar parcelas');
        return false;
      }

      toast.success('Recorrência e parcelas criadas com sucesso!');
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

  const fetchParcelas = async () => {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .like('description', '%Parcela%')
        .order('due_date', { ascending: true });

      if (error) {
        console.error('Error fetching parcelas:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error:', error);
      return [];
    }
  };

  const updateParcelaStatus = async (id: number, status: 'pendente' | 'pago' | 'recebido') => {
    try {
      const { error } = await supabase
        .from('accounts')
        .update({ status })
        .eq('id', id);

      if (error) {
        console.error('Error updating parcela status:', error);
        toast.error('Erro ao atualizar status da parcela');
        return false;
      }

      toast.success('Status da parcela atualizado com sucesso!');
      return true;
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao atualizar status da parcela');
      return false;
    }
  };

  return {
    recorrencias,
    loading,
    fetchRecorrencias,
    createRecorrencia,
    updateRecorrencia,
    deleteRecorrencia,
    fetchParcelas,
    updateParcelaStatus
  };
};