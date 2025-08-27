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
  dataConta?: string;
  type: 'receita' | 'despesa';
  status: 'pendente' | 'pago' | 'recebido';
  parcela?: string;
  recorrente_id?: string;
  bank_id?: number;
  payment_source: 'bank';
  payment_source_id?: number;
  payment_source_name?: string;
}

export interface CreateAccountData extends Omit<Account, 'id' | 'parcela' | 'recorrente_id'> {
  qtd_parcelas?: number;
}

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  category: string;
  dueDate: string;
  dataConta?: string;
  type: 'receita' | 'despesa';
  status: 'pendente' | 'pago' | 'recebido';
  parcela?: string;
  recorrente_id?: string;
  bank_id?: number;
  payment_source: 'bank';
  payment_source_id?: number;
  payment_source_name?: string;
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

  // Carregar contas do Supabase
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        console.log('Usuário não autenticado - fetchAccounts');
        setAccounts([]);
        return;
      }

      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar contas:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as contas.",
          variant: "destructive"
        });
        return;
      }

      // Transformar dados do Supabase para o formato da aplicação
      const transformedAccounts: Account[] = data.map(account => ({
        id: account.id,
        description: account.description,
        amount: parseFloat(account.amount.toString()),
        category: account.category,
        dueDate: account.due_date,
        dataConta: account.data_conta,
        type: account.type as 'receita' | 'despesa',
        status: account.status as 'pendente' | 'pago' | 'recebido',
        parcela: account.parcela,
        recorrente_id: account.recorrente_id,
        bank_id: account.bank_id,
        payment_source: 'bank',
        payment_source_id: account.payment_source_id,
        payment_source_name: account.payment_source_name
      }));

      setAccounts(transformedAccounts);
      console.log(`Contas carregadas: ${transformedAccounts.length} contas encontradas`);
    } catch (error) {
      console.error('Erro ao carregar contas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as contas.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Calcular saldo final de um mês específico
  const calculateMonthFinalBalance = (month: number, year: number) => {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Último dia do mês
    
    // Filtrar contas do mês específico (exceto saldo inicial)
    const monthAccounts = accounts.filter(account => {
      const accountDate = new Date(account.dueDate);
      return accountDate >= startDate && 
             accountDate <= endDate &&
             !(account.category === 'Saldo Inicial' && account.type === 'receita');
    });

    // Calcular receitas e despesas do mês
    const totalReceitas = monthAccounts
      .filter(account => account.type === 'receita' && account.status === 'recebido')
      .reduce((sum, account) => sum + account.amount, 0);

    const totalDespesas = monthAccounts
      .filter(account => account.type === 'despesa' && account.status === 'pago')
      .reduce((sum, account) => sum + Math.abs(account.amount), 0);

    // Obter saldo anterior do mês
    const previousBalance = getPreviousMonthBalance(month, year);

    return previousBalance + totalReceitas - totalDespesas;
  };

  // Obter saldo do mês anterior (automaticamente do saldo final do mês passado)
  const getPreviousMonthBalance = (month: number, year: number): number => {
    let previousMonth = month - 1;
    let previousYear = year;

    if (previousMonth < 1) {
      previousMonth = 12;
      previousYear = year - 1;
    }

    // Se for janeiro, buscar saldo inicial manual do ano
    if (month === 1) {
      const description = `Saldo Inicial - 01/${year}`;
      const initialBalanceAccount = accounts.find(
        account => account.description === description && 
                   account.category === 'Saldo Inicial' &&
                   account.type === 'receita'
      );
      return initialBalanceAccount ? initialBalanceAccount.amount : 0;
    }

    // Para outros meses, calcular saldo final do mês anterior
    return calculateMonthFinalBalance(previousMonth, previousYear);
  };

  // Upsert saldo inicial (apenas para janeiro ou correções manuais)
  const upsertPreviousBalance = async (amount: number, month: number, year: number) => {
    try {
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado.",
          variant: "destructive"
        });
        return;
      }

      // Só permitir edição manual para janeiro (saldo inicial do ano)
      if (month !== 1) {
        toast({
          title: "Informação",
          description: "O saldo anterior é calculado automaticamente baseado no mês anterior. Só é possível editar manualmente o saldo inicial de janeiro.",
          variant: "default"
        });
        return;
      }

      // Criar identificador único para o saldo inicial do ano
      const description = `Saldo Inicial - ${String(month).padStart(2, '0')}/${year}`;
      const dueDate = `${year}-${String(month).padStart(2, '0')}-01`;

      // Verificar se já existe um registro de saldo inicial para este ano
      const { data: existingBalance, error: searchError } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('description', description)
        .eq('type', 'receita')
        .eq('category', 'Saldo Inicial')
        .single();

      if (searchError && searchError.code !== 'PGRST116') {
        console.error('Erro ao buscar saldo anterior:', searchError);
        toast({
          title: "Erro",
          description: "Não foi possível verificar saldo anterior.",
          variant: "destructive"
        });
        return;
      }

      if (existingBalance) {
        // Atualizar registro existente
        const { error: updateError } = await supabase
          .from('accounts')
          .update({
            amount: amount,
            previous_balance: amount,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingBalance.id);

        if (updateError) {
          console.error('Erro ao atualizar saldo anterior:', updateError);
          toast({
            title: "Erro",
            description: "Não foi possível atualizar o saldo anterior.",
            variant: "destructive"
          });
          return;
        }

        // Atualizar na lista local
        setAccounts(prev =>
          prev.map(account =>
            account.id === existingBalance.id
              ? { ...account, amount: amount }
              : account
          )
        );

        toast({
          title: "Sucesso",
          description: "Saldo inicial do ano atualizado com sucesso.",
        });
      } else {
        // Criar novo registro
        const { data: newBalance, error: insertError } = await supabase
          .from('accounts')
          .insert([{
            description: description,
            amount: amount,
            category: 'Saldo Inicial',
            due_date: dueDate,
            type: 'receita',
            status: 'recebido',
            user_id: user.id,
            previous_balance: amount,
            payment_source: 'bank'
          }])
          .select()
          .single();

        if (insertError) {
          console.error('Erro ao criar saldo anterior:', insertError);
          toast({
            title: "Erro",
            description: "Não foi possível criar o saldo anterior.",
            variant: "destructive"
          });
          return;
        }

        // Transformar e adicionar à lista local
        const newAccount: Account = {
          id: newBalance.id,
          description: newBalance.description,
          amount: parseFloat(newBalance.amount.toString()),
          category: newBalance.category,
          dueDate: newBalance.due_date,
          dataConta: newBalance.data_conta,
          type: newBalance.type as 'receita' | 'despesa',
          status: newBalance.status as 'pendente' | 'pago' | 'recebido',
          parcela: newBalance.parcela,
          recorrente_id: newBalance.recorrente_id,
          bank_id: newBalance.bank_id,
          payment_source: 'bank',
          payment_source_id: newBalance.payment_source_id,
          payment_source_name: newBalance.payment_source_name
        };

        setAccounts(prev => [newAccount, ...prev]);

        toast({
          title: "Sucesso",
          description: "Saldo inicial do ano criado com sucesso.",
        });
      }

      // Invalidar cache dos bancos
      invalidateBanksCache();

    } catch (error) {
      console.error('Erro ao processar saldo anterior:', error);
      toast({
        title: "Erro",
        description: "Não foi possível processar o saldo anterior.",
        variant: "destructive"
      });
    }
  };

  // Criar nova conta
  const addAccount = async (accountData: CreateAccountData) => {
    try {
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado.",
          variant: "destructive"
        });
        return;
      }

      // Se tem quantidade de parcelas, criar múltiplas contas
      if (accountData.qtd_parcelas && accountData.qtd_parcelas > 1) {
        const recorrenteId = crypto.randomUUID();
        const registros = [];
        const valorPorParcela = accountData.amount / accountData.qtd_parcelas;

        for (let i = 0; i < accountData.qtd_parcelas; i++) {
          const data = new Date(accountData.dueDate);
          data.setMonth(data.getMonth() + i);

          registros.push({
            description: accountData.description,
            amount: valorPorParcela,
            category: accountData.category,
            due_date: data.toISOString().split('T')[0],
            data_conta: accountData.dataConta,
            type: accountData.type,
            status: accountData.status,
            user_id: user.id,
            parcela: `${i + 1}/${accountData.qtd_parcelas}`,
            recorrente_id: recorrenteId,
            bank_id: accountData.bank_id,
            payment_source: 'bank',
            payment_source_id: accountData.payment_source_id,
            payment_source_name: accountData.payment_source_name
          });
        }

        const { data: insertData, error } = await supabase
          .from('accounts')
          .insert(registros)
          .select();

        if (error) {
          console.error('Erro ao criar parcelas:', error);
          toast({
            title: "Erro",
            description: "Não foi possível criar as parcelas.",
            variant: "destructive"
          });
          return;
        }

        // Transformar e adicionar à lista local
        const newAccounts = insertData.map(account => ({
          id: account.id,
          description: account.description,
          amount: parseFloat(account.amount.toString()),
          category: account.category,
          dueDate: account.due_date,
          dataConta: account.data_conta,
          type: account.type as 'receita' | 'despesa',
          status: account.status as 'pendente' | 'pago' | 'recebido',
          parcela: account.parcela,
          recorrente_id: account.recorrente_id,
          bank_id: account.bank_id,
          payment_source: 'bank' as const,
          payment_source_id: account.payment_source_id,
          payment_source_name: account.payment_source_name
        }));

        setAccounts(prev => [...newAccounts, ...prev]);
        
        // SÓ invalidar cache se a conta for paga/recebida
        if (accountData.status === 'pago' || accountData.status === 'recebido') {
          invalidateBanksCache();
        }
               
        toast({
          title: "Sucesso",
          description: `${accountData.qtd_parcelas} parcelas criadas com sucesso.`,
        });
      } else {
        // Criar conta única
        const { data, error } = await supabase
          .from('accounts')
          .insert([{
            description: accountData.description,
            amount: accountData.amount,
            category: accountData.category,
            due_date: accountData.dueDate,
            data_conta: accountData.dataConta,
            type: accountData.type,
            status: accountData.status,
            user_id: user.id,
            bank_id: accountData.bank_id,
            payment_source: 'bank',
            payment_source_id: accountData.payment_source_id,
            payment_source_name: accountData.payment_source_name
          }])
          .select()
          .single();

        if (error) {
          console.error('Erro ao criar conta:', error);
          toast({
            title: "Erro",
            description: "Não foi possível criar a conta.",
            variant: "destructive"
          });
          return;
        }

        // Transformar e adicionar à lista local
        const newAccount: Account = {
          id: data.id,
          description: data.description,
          amount: parseFloat(data.amount.toString()),
          category: data.category,
          dueDate: data.due_date,
          dataConta: data.data_conta,
          type: data.type as 'receita' | 'despesa',
          status: data.status as 'pendente' | 'pago' | 'recebido',
          parcela: data.parcela,
          recorrente_id: data.recorrente_id,
          bank_id: data.bank_id,
          payment_source: 'bank',
          payment_source_id: data.payment_source_id,
          payment_source_name: data.payment_source_name
        };

        setAccounts(prev => [newAccount, ...prev]);
        
        // SÓ invalidar cache se a conta for paga/recebida
        if (accountData.status === 'pago' || accountData.status === 'recebido') {
          invalidateBanksCache();
        }
        
        toast({
          title: "Sucesso",
          description: "Conta criada com sucesso.",
        });
      }
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a conta.",
        variant: "destructive"
      });
    }
  };

  // Atualizar conta
  const updateAccount = async (updatedAccount: Account) => {
    try {
      const { error } = await supabase
        .from('accounts')
        .update({
          description: updatedAccount.description,
          amount: updatedAccount.amount,
          category: updatedAccount.category,
          due_date: updatedAccount.dueDate,
          data_conta: updatedAccount.dataConta,
          type: updatedAccount.type,
          status: updatedAccount.status,
          bank_id: updatedAccount.bank_id,
          payment_source: 'bank',
          payment_source_id: updatedAccount.payment_source_id,
          payment_source_name: updatedAccount.payment_source_name
        })
        .eq('id', updatedAccount.id)
        .eq('user_id', user.id); 

      if (error) {
        console.error('Erro ao atualizar conta:', error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar a conta.",
          variant: "destructive"
        });
        return;
      }

      // Atualizar na lista local
      setAccounts(prev => 
        prev.map(account => 
          account.id === updatedAccount.id ? updatedAccount : account
        )
      );

      // SÓ invalidar cache se a conta for paga/recebida
      if (updatedAccount.status === 'pago' || updatedAccount.status === 'recebido') {
        invalidateBanksCache();
      }

      toast({
        title: "Sucesso",
        description: "Conta atualizada com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao atualizar conta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a conta.",
        variant: "destructive"
      });
    }
  };

  // Deletar conta
  const deleteAccount = async (accountId: number) => {
    try {
      // Buscar a conta antes de deletar para verificar se precisa reverter saldo
      const accountToDelete = accounts.find(acc => acc.id === accountId);
      
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', accountId);

      if (error) {
        console.error('Erro ao deletar conta:', error);
        toast({
          title: "Erro",
          description: "Não foi possível deletar a conta.",
          variant: "destructive"
        });
        return;
      }

      // Remover da lista local
      setAccounts(prev => prev.filter(account => account.id !== accountId));

      // Se a conta deletada era paga/recebida, invalidar cache para reverter saldo
      if (accountToDelete && (accountToDelete.status === 'pago' || accountToDelete.status === 'recebido')) {
        invalidateBanksCache();
      }

      toast({
        title: "Sucesso",
        description: "Conta deletada com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao deletar conta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível deletar a conta.",
        variant: "destructive"
      });
    }
  };

  // Atualizar status da conta
  const updateAccountStatus = async (id: number, status: 'pendente' | 'pago' | 'recebido') => {
    try {
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado.",
          variant: "destructive"
        });
        return;
      }
      const { error } = await supabase
        .from('accounts')
        .update({ status })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao atualizar status:', error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o status.",
          variant: "destructive"
        });
        return;
      }

      // Atualizar na lista local
     setAccounts(prev => prev.map(acc => 
        acc.id === id ? { ...acc, status } : acc
      ));
      
      // SEMPRE invalidar cache quando status muda (pode afetar saldo)
      invalidateBanksCache();
        
      toast({
        title: "Sucesso",
        description: "Status da conta atualizado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar status.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchAccounts();
    } else {
      setAccounts([]);
      setLoading(false);
    }
  }, [user]);

  return {
    accounts,
    loading,
    addAccount,
    updateAccount,
    deleteAccount,
    updateAccountStatus,
    refreshAccounts: fetchAccounts,
    upsertPreviousBalance,
    getPreviousMonthBalance,
    calculateMonthFinalBalance
  };
};
