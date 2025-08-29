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

export interface SaldoMesAnterior {
  id: string;
  ano: number;
  mes: number;
  valor: number;
  automatico: boolean;
  created_at: string;
  updated_at: string;
}

export const useAccountsData = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [saldoMesAnterior, setSaldoMesAnterior] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const invalidateBanksCache = () => {
    queryClient.invalidateQueries({ queryKey: ['banks'] });
  };

  // Calcular saldo final baseado nas contas do mês
  const calcularSaldoFinal = (contas: Account[], saldoAnterior: number) => {
    const totalRecebido = contas
      .filter(account => account.type === 'receita' && account.status === 'recebido')
      .reduce((sum, account) => sum + account.amount, 0);

    const totalPago = contas
      .filter(account => account.type === 'despesa' && account.status === 'pago')
      .reduce((sum, account) => sum + Math.abs(account.amount), 0);

    return saldoAnterior + totalRecebido - totalPago;
  };

  // Função para verificar saldo do último dia do ano anterior
  const verificarSaldoAnoAnterior = async (ano: number) => {
    try {
      if (!user) return 0;

      const ultimoDiaAnoAnterior = `${ano - 1}-12-31`;
      
      // Buscar última conta do ano anterior (31/12)
      const { data: ultimaConta, error } = await supabase
        .from('accounts')
        .select('amount')
        .eq('user_id', user.id)
        .eq('due_date', ultimoDiaAnoAnterior)
        .eq('status', 'recebido')
        .order('amount', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar saldo ano anterior:', error);
        return 0;
      }

      return ultimaConta?.amount || 0;
    } catch (error) {
      console.error('Erro ao verificar saldo ano anterior:', error);
      return 0;
    }
  };

  // Função para carregar saldo do mês anterior
  const fetchSaldoMesAnterior = async (ano: number, mes: number) => {
    try {
      if (!user) return 0;

      // Para janeiro, verificar se existe saldo registrado ou buscar do ano anterior
      if (mes === 1) {
        // Primeiro, verificar se já existe saldo registrado para janeiro
        const { data: saldoJaneiro } = await supabase
          .rpc('get_previous_month_balance', {
            target_user_id: user.id,
            target_year: ano,
            target_month: 1
          })
          .maybeSingle();

        if (saldoJaneiro && saldoJaneiro.valor !== null) {
          return saldoJaneiro.valor;
        }

        // Se não tem saldo registrado, buscar do ano anterior
        const saldoAnoAnterior = await verificarSaldoAnoAnterior(ano);
        
        if (saldoAnoAnterior > 0) {
          // Registrar automaticamente como saldo inicial
          await salvarSaldoMesAnterior(ano, 1, saldoAnoAnterior, true);
          return saldoAnoAnterior;
        }

        return 0;
      }

      // Para outros meses, buscar o saldo final do mês anterior
      const mesBusca = mes - 1;
      const anoBusca = ano;

      const { data, error } = await supabase
        .rpc('get_previous_month_balance', {
          target_user_id: user.id,
          target_year: anoBusca,
          target_month: mesBusca
        })
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar saldo mês anterior:', error);
        return 0;
      }

      return data?.valor || 0;
    } catch (error) {
      console.error('Erro ao buscar saldo:', error);
      return 0;
    }
  };

  // Função para salvar/atualizar saldo do mês anterior
  const salvarSaldoMesAnterior = async (ano: number, mes: number, valor: number, automatico: boolean = false) => {
    try {
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado.",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase
        .rpc('save_previous_month_balance', {
          target_user_id: user.id,
          target_year: ano,
          target_month: mes,
          balance_value: valor,
          is_automatic: automatico
        });

      if (error) throw error;
      
      setSaldoMesAnterior(valor);
      
      if (!automatico) {
        toast({
          title: "Sucesso",
          description: "Saldo do mês anterior atualizado com sucesso.",
        });
      }
      
      return data;
    } catch (error) {
      console.error('Erro ao salvar saldo:', error);
      if (!automatico) {
        toast({
          title: "Erro",
          description: "Não foi possível salvar o saldo do mês anterior.",
          variant: "destructive"
        });
      }
      throw error;
    }
  };

  // Função para verificar e atualizar automaticamente o saldo do próximo mês
  const atualizarSaldoProximoMesAutomatico = async (anoAtual: number, mesAtual: number, saldoFinal: number) => {
    try {
      if (!user) return;

      const proximoMes = mesAtual === 12 ? 1 : mesAtual + 1;
      const proximoAno = mesAtual === 12 ? anoAtual + 1 : anoAtual;

      // Verifica se já existe um saldo para o próximo mês
      const { data: saldoExistente } = await supabase
        .rpc('get_previous_month_balance', {
          target_user_id: user.id,
          target_year: proximoAno,
          target_month: proximoMes
        })
        .maybeSingle();

      // Só atualiza automaticamente se não existir saldo ou se foi calculado automaticamente antes
      if (!saldoExistente || saldoExistente.automatico) {
        await salvarSaldoMesAnterior(proximoAno, proximoMes, saldoFinal, true);
        console.log(`Saldo automático atualizado para ${proximoMes}/${proximoAno}: R$ ${saldoFinal}`);
      }
    } catch (error) {
      console.error('Erro ao atualizar saldo automático:', error);
    }
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
      
      // Calcular saldo anterior e final para o mês atual
      const hoje = new Date();
      const anoAtual = hoje.getFullYear();
      const mesAtual = hoje.getMonth() + 1;
      
      const saldoAnterior = await fetchSaldoMesAnterior(anoAtual, mesAtual);
      setSaldoMesAnterior(saldoAnterior);
      
      const saldoFinal = calcularSaldoFinal(transformedAccounts, saldoAnterior);
      
      // Atualiza automaticamente o saldo do próximo mês
      await atualizarSaldoProximoMesAutomatico(anoAtual, mesAtual, saldoFinal);
      
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
        
        // Atualizar saldo do próximo mês automaticamente
        const hoje = new Date();
        const anoAtual = hoje.getFullYear();
        const mesAtual = hoje.getMonth() + 1;
        const saldoFinal = calcularSaldoFinal([...newAccounts, ...accounts], saldoMesAnterior);
        await atualizarSaldoProximoMesAutomatico(anoAtual, mesAtual, saldoFinal);
        
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
        
        // Atualizar saldo do próximo mês automaticamente
        const hoje = new Date();
        const anoAtual = hoje.getFullYear();
        const mesAtual = hoje.getMonth() + 1;
        const saldoFinal = calcularSaldoFinal([newAccount, ...accounts], saldoMesAnterior);
        await atualizarSaldoProximoMesAutomatico(anoAtual, mesAtual, saldoFinal);
        
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
      
      // Atualizar saldo do próximo mês automaticamente
      const hoje = new Date();
      const anoAtual = hoje.getFullYear();
      const mesAtual = hoje.getMonth() + 1;
      const saldoFinal = calcularSaldoFinal(accounts, saldoMesAnterior);
      await atualizarSaldoProximoMesAutomatico(anoAtual, mesAtual, saldoFinal);

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
      
      // Atualizar saldo do próximo mês automaticamente
      const hoje = new Date();
      const anoAtual = hoje.getFullYear();
      const mesAtual = hoje.getMonth() + 1;
      const saldoFinal = calcularSaldoFinal(accounts.filter(acc => acc.id !== accountId), saldoMesAnterior);
      await atualizarSaldoProximoMesAutomatico(anoAtual, mesAtual, saldoFinal);

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
      
      // Atualizar saldo do próximo mês automaticamente
      const hoje = new Date();
      const anoAtual = hoje.getFullYear();
      const mesAtual = hoje.getMonth() + 1;
      const saldoFinal = calcularSaldoFinal(accounts, saldoMesAnterior);
      await atualizarSaldoProximoMesAutomatico(anoAtual, mesAtual, saldoFinal);
      
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
      setSaldoMesAnterior(0);
      setLoading(false);
    }
  }, [user]);

  return {
    accounts,
    loading,
    saldoMesAnterior,
    salvarSaldoMesAnterior,
    fetchSaldoMesAnterior,
    addAccount,
    updateAccount,
    deleteAccount,
    updateAccountStatus,
    refreshAccounts: fetchAccounts
  };
};
