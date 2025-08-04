import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export interface Account {
  id: number;
  description: string;
  amount: number;
  category: string;
  dueDate: string;
  type: 'receita' | 'despesa';
  status: 'pendente' | 'pago' | 'recebido';
  parcela?: string;
  recorrente_id?: string;
  payment_source?: 'bank' | 'card';
  payment_source_id?: number;
  bank_id?: number;
  card_id?: number;
}

export interface CreateAccountData extends Omit<Account, 'id' | 'parcela' | 'recorrente_id'> {
  qtd_parcelas?: number;
}

export const useAccountsData = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const invalidateBanksCache = () => {
    queryClient.invalidateQueries({ queryKey: ['banks'] });
  };

  const invalidateCardsCache = () => {
    queryClient.invalidateQueries({ queryKey: ['cards'] });
  };

  const fetchAccounts = async () => {
    try {
      setLoading(true);

      if (!user) {
        setAccounts([]);
        return;
      }

      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar as contas.',
          variant: 'destructive'
        });
        return;
      }

      const transformed: Account[] = data.map((acc) => ({
        id: acc.id,
        description: acc.description,
        amount: parseFloat(acc.amount.toString()),
        category: acc.category,
        dueDate: acc.due_date,
        type: acc.type,
        status: acc.status,
        parcela: acc.parcela,
        recorrente_id: acc.recorrente_id,
        payment_source: acc.payment_source,
        payment_source_id: acc.payment_source_id,
        bank_id: acc.bank_id,
        card_id: acc.card_id
      }));

      setAccounts(transformed);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as contas.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addAccount = async (accountData: CreateAccountData) => {
    try {
      if (!user) {
        toast({
          title: 'Erro',
          description: 'Usuário não autenticado.',
          variant: 'destructive'
        });
        return;
      }

      if (accountData.qtd_parcelas && accountData.qtd_parcelas > 1) {
        const recorrenteId = crypto.randomUUID();
        const parcelas = [];
        const valorParcela = accountData.amount / accountData.qtd_parcelas;

        for (let i = 0; i < accountData.qtd_parcelas; i++) {
          const data = new Date(accountData.dueDate);
          data.setMonth(data.getMonth() + i);

          parcelas.push({
            description: accountData.description,
            amount: valorParcela,
            category: accountData.category,
            due_date: data.toISOString().split('T')[0],
            type: accountData.type,
            status: accountData.status,
            user_id: user.id,
            parcela: `${i + 1}/${accountData.qtd_parcelas}`,
            recorrente_id: recorrenteId,
            payment_source: accountData.payment_source,
            payment_source_id: accountData.payment_source_id,
            bank_id: accountData.bank_id,
            card_id: accountData.card_id
          });
        }

        const { data: insertData, error } = await supabase
          .from('accounts')
          .insert(parcelas)
          .select();

        if (error) {
          toast({
            title: 'Erro',
            description: 'Não foi possível criar as parcelas.',
            variant: 'destructive'
          });
          return;
        }

        const newAccounts: Account[] = insertData.map((acc) => ({
          id: acc.id,
          description: acc.description,
          amount: parseFloat(acc.amount.toString()),
          category: acc.category,
          dueDate: acc.due_date,
          type: acc.type,
          status: acc.status,
          parcela: acc.parcela,
          recorrente_id: acc.recorrente_id,
          payment_source: acc.payment_source,
          payment_source_id: acc.payment_source_id,
          bank_id: acc.bank_id,
          card_id: acc.card_id
        }));

        setAccounts((prev) => [...newAccounts, ...prev]);
        invalidateBanksCache();
        invalidateCardsCache();

        toast({
          title: 'Sucesso',
          description: `${accountData.qtd_parcelas} parcelas criadas com sucesso.`
        });
      } else {
        const { data, error } = await supabase
          .from('accounts')
          .insert([{
            description: accountData.description,
            amount: accountData.amount,
            category: accountData.category,
            due_date: accountData.dueDate,
            type: accountData.type,
            status: accountData.status,
            user_id: user.id,
            payment_source: accountData.payment_source,
            payment_source_id: accountData.payment_source_id,
            bank_id: accountData.bank_id,
            card_id: accountData.card_id
          }])
          .select()
          .single();

        if (error || !data) {
          toast({
            title: 'Erro',
            description: 'Não foi possível criar a conta.',
            variant: 'destructive'
          });
          return;
        }

        const newAccount: Account = {
          id: data.id,
          description: data.description,
          amount: parseFloat(data.amount.toString()),
          category: data.category,
          dueDate: data.due_date,
          type: data.type,
          status: data.status,
          parcela: data.parcela,
          recorrente_id: data.recorrente_id,
          payment_source: data.payment_source,
          payment_source_id: data.payment_source_id,
          bank_id: data.bank_id,
          card_id: data.card_id
        };

        setAccounts((prev) => [newAccount, ...prev]);
        invalidateBanksCache();
        invalidateCardsCache();

        toast({
          title: 'Sucesso',
          description: 'Conta criada com sucesso.'
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro inesperado ao criar conta.',
        variant: 'destructive'
      });
    }
  };

  const updateAccountStatus = async (id: number, status: 'pendente' | 'pago' | 'recebido') => {
    try {
      if (!user) {
        toast({
          title: 'Erro',
          description: 'Usuário não autenticado.',
          variant: 'destructive'
        });
        return;
      }

      const current = accounts.find((acc) => acc.id === id);
      if (!current) {
        toast({
          title: 'Erro',
          description: 'Conta não encontrada.',
          variant: 'destructive'
        });
        return;
      }

      const { error } = await supabase
        .from('accounts')
        .update({ status })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        toast({
          title: 'Erro',
          description: `Erro ao atualizar status: ${error.message}`,
          variant: 'destructive'
        });
        return;
      }

      setAccounts((prev) => prev.map((acc) => acc.id === id ? { ...acc, status } : acc));

      if (current.payment_source === 'bank') invalidateBanksCache();
      if (current.payment_source === 'card') invalidateCardsCache();

      toast({
        title: 'Sucesso',
        description: 'Status atualizado com sucesso.'
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro inesperado ao atualizar status.',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    if (user) fetchAccounts();
    else {
      setAccounts([]);
      setLoading(false);
    }
  }, [user]);

  return {
    accounts,
    loading,
    addAccount,
    updateAccountStatus,
    refreshAccounts: fetchAccounts
  };
};
