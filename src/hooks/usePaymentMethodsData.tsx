import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PaymentMethod {
  id: string;
  user_id: string;
  name: string;
  type: 'cartao_credito' | 'cartao_debito' | 'pix' | 'transferencia' | 'dinheiro' | 'boleto';
  created_at: string;
  updated_at: string;
}

export const usePaymentMethodsData = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching payment methods:', error);
        toast.error('Erro ao carregar métodos de pagamento');
        return;
      }

      setPaymentMethods((data || []) as PaymentMethod[]);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao carregar métodos de pagamento');
    } finally {
      setLoading(false);
    }
  };

  const createPaymentMethod = async (paymentMethodData: Omit<PaymentMethod, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Usuário não autenticado');
        return false;
      }

      const { error } = await supabase
        .from('payment_methods')
        .insert({
          ...paymentMethodData,
          user_id: user.id
        });

      if (error) {
        console.error('Error creating payment method:', error);
        toast.error('Erro ao criar método de pagamento');
        return false;
      }

      toast.success('Método de pagamento criado com sucesso!');
      await fetchPaymentMethods();
      return true;
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao criar método de pagamento');
      return false;
    }
  };

  const updatePaymentMethod = async (id: string, paymentMethodData: Partial<PaymentMethod>) => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .update(paymentMethodData)
        .eq('id', id);

      if (error) {
        console.error('Error updating payment method:', error);
        toast.error('Erro ao atualizar método de pagamento');
        return false;
      }

      toast.success('Método de pagamento atualizado com sucesso!');
      await fetchPaymentMethods();
      return true;
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao atualizar método de pagamento');
      return false;
    }
  };

  const deletePaymentMethod = async (id: string) => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting payment method:', error);
        toast.error('Erro ao deletar método de pagamento');
        return false;
      }

      toast.success('Método de pagamento deletado com sucesso!');
      await fetchPaymentMethods();
      return true;
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao deletar método de pagamento');
      return false;
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  return {
    paymentMethods,
    loading,
    fetchPaymentMethods,
    createPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod
  };
};