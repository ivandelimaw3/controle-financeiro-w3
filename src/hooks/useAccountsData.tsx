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
  saldo_anterior?: number;
}

export interface CreateAccountData extends Omit<Account, 'id' | 'parcela' | 'recorrente_id' | 'saldo_anterior'> {
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
        payment_source_name: account.payment_source_name,
        saldo_anterior: account.saldo_anterior
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
          payment_source_name: account.payment_source_name,
          saldo_anterior: account.saldo_anterior
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
          payment_source_name: data.payment_source_name,
          saldo_anterior: data.saldo_anterior
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
          payment_source_name: updatedAccount.payment_source_name,
          saldo_anterior: updatedAccount.saldo_anterior
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

  // Função para obter saldo do mês anterior usando a coluna saldo_anterior nas accounts
  const getPreviousMonthBalance = async (currentMonth: number, currentYear: number): Promise<number> => {
    try {
      if (!user) return 0;
      
      // Calcular mês e ano anterior
      let prevMonth = currentMonth - 1;
      let prevYear = currentYear;
      
      if (prevMonth < 0) {
        prevMonth = 11;
        prevYear -= 1;
      }
      
      // Formatar data para busca (YYYY-MM)
      const prevMonthStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}`;
      
      // Buscar o saldo anterior na tabela accounts filtrando por mês e ano anterior
      const { data, error } = await supabase
        .from('accounts')
        .select('saldo_anterior')
        .eq('user_id', user.id)
        .ilike('due_date', `${prevMonthStr}%`) // Filtra por mês/ano anterior
        .order('due_date', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error('Erro ao buscar saldo anterior:', error);
        return 0;
      }
      
      // Se encontrar registros, retorna o saldo anterior mais recente
      if (data && data.length > 0) {
        return data[0].saldo_anterior || 0;
      }
      
      // Se não encontrar registros, retorna 0
      return 0;
    } catch (error) {
      console.error('Erro ao buscar saldo anterior:', error);
      return 0;
    }
  };

  // Função para salvar saldo manualmente na coluna saldo_anterior
  const savePreviousMonthBalance = async (currentMonth: number, currentYear: number, balance: number): Promise<void> => {
    try {
      if (!user) return;
      
      // Calcular mês e ano anterior
      let prevMonth = currentMonth - 1;
      let prevYear = currentYear;
      
      if (prevMonth < 0) {
        prevMonth = 11;
        prevYear -= 1;
      }
      
      // Formatar data para busca (YYYY-MM)
      const prevMonthStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}`;
      
      // Atualizar todos os registros do mês anterior com o novo saldo
      const { error } = await supabase
        .from('accounts')
        .update({
          saldo_anterior: balance
        })
        .eq('user_id', user.id)
        .ilike('due_date', `${prevMonthStr}%`);
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Invalidar cache para atualizar os dados
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    } catch (error) {
      console.error('Erro ao salvar saldo anterior:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o saldo anterior.",
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
    getPreviousMonthBalance,
    savePreviousMonthBalance
  };
};

import React, { useState, useEffect } from 'react';
import { Clock, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Account, useAccountsData } from '@/hooks/useAccountsData';

interface AccountsSummaryCardsProps {
  accounts: Account[];
  month: number; // 0 a 11
  year: number;
}

export const AccountsSummaryCards: React.FC<AccountsSummaryCardsProps> = ({ accounts, month, year }) => {
  const { getPreviousMonthBalance, savePreviousMonthBalance } = useAccountsData();

  const [saldoAnterior, setSaldoAnterior] = useState<number>(0);
  const [editSaldo, setEditSaldo] = useState<boolean>(false);
  const [manualSaldo, setManualSaldo] = useState<string>('');

  useEffect(() => {
    const fetchSaldoAnterior = async () => {
      const saldo = await getPreviousMonthBalance(month, year);
      setSaldoAnterior(saldo);
      setManualSaldo(saldo.toFixed(2));
    };
    fetchSaldoAnterior();
  }, [month, year, getPreviousMonthBalance]);

  const formatCurrency = (value: number): string =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const calculateTotalPago = () =>
    accounts
      .filter(a => a.type === 'despesa' && a.status === 'pago')
      .reduce((sum, a) => sum + Math.abs(a.amount), 0);

  const calculateTotalRecebido = () =>
    accounts
      .filter(a => a.type === 'receita' && a.status === 'recebido')
      .reduce((sum, a) => sum + a.amount, 0);

  const calculateSaldoFinal = () =>
    saldoAnterior + calculateTotalRecebido() - calculateTotalPago();

  const calculateTotalPendente = () => {
    const receitasPendentes = accounts
      .filter(a => a.type === 'receita' && a.status === 'pendente')
      .reduce((sum, a) => sum + a.amount, 0);
    const despesasPendentes = accounts
      .filter(a => a.type === 'despesa' && a.status === 'pendente')
      .reduce((sum, a) => sum + Math.abs(a.amount), 0);
    return receitasPendentes - despesasPendentes;
  };

  const handleSaveManualSaldo = async () => {
    const value = parseFloat(manualSaldo.replace(',', '.'));
    await savePreviousMonthBalance(month, year, value);
    setSaldoAnterior(value);
    setEditSaldo(false);
  };

  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Saldo Mês Anterior */}
      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <Clock size={20} className="text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-600">Saldo Mês Anterior</p>
            {!editSaldo ? (
              <div className="flex items-center justify-between">
                <p className="text-xl font-bold text-gray-700">{formatCurrency(saldoAnterior)}</p>
                <button
                  className="ml-2 text-sm text-blue-600 hover:underline"
                  onClick={() => setEditSaldo(true)}
                >
                  Editar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  className="border rounded px-2 py-1 w-24 text-right"
                  value={manualSaldo}
                  onChange={e => setManualSaldo(e.target.value)}
                />
                <button
                  className="text-sm text-green-600 hover:underline"
                  onClick={handleSaveManualSaldo}
                >
                  Salvar
                </button>
                <button
                  className="text-sm text-red-600 hover:underline"
                  onClick={() => {
                    setManualSaldo(saldoAnterior.toFixed(2));
                    setEditSaldo(false);
                  }}
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Total Recebido */}
      <div className="p-4 bg-green-50 rounded-xl border border-green-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <TrendingUp size={20} className="text-green-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-600">Total Recebido</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(calculateTotalRecebido())}</p>
          </div>
        </div>
      </div>

      {/* Total Pago */}
      <div className="p-4 bg-red-50 rounded-xl border border-red-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <TrendingDown size={20} className="text-red-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-600">Total Pago</p>
            <p className="text-xl font-bold text-red-600">{formatCurrency(calculateTotalPago())}</p>
          </div>
        </div>
      </div>

      {/* Saldo Final */}
      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <DollarSign size={20} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-600">Saldo Final</p>
            <p
              className={`text-xl font-bold ${
                calculateSaldoFinal() >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatCurrency(calculateSaldoFinal())}
            </p>
          </div>
        </div>
      </div>

      {/* Saldo Pendente */}
      <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Clock size={20} className="text-yellow-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-600">Saldo Pendente</p>
            <p
              className={`text-xl font-bold ${
                calculateTotalPendente() >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatCurrency(calculateTotalPendente())}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
