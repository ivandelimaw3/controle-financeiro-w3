
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { AccountsTable } from '@/components/Accounts/AccountsTable';
import { AccountModal } from '@/components/Accounts/AccountModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Filter, DollarSign, Loader2, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAccounts, Account } from '@/contexts/AccountsContext';

const Contas: React.FC = () => {
  const { toast } = useToast();
  const location = useLocation();
  const { 
    accounts, 
    loading,
    addAccount, 
    updateAccount, 
    deleteAccount, 
    updateAccountStatus 
  } = useAccounts();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [typeFilter, setTypeFilter] = useState('todos');

  const categories = ['Trabalho', 'Moradia', 'Utilidades', 'Alimentação', 'Transporte', 'Lazer'];

  // Aplicar filtros da URL ao carregar a página
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const statusParam = searchParams.get('status');
    const typeParam = searchParams.get('type');
    
    if (statusParam === 'pendente') {
      setStatusFilter('pendente');
    }
    
    if (typeParam === 'receita') {
      setTypeFilter('receita');
    } else if (typeParam === 'despesa') {
      setTypeFilter('despesa');
    }
  }, [location.search]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-lg text-slate-600">Carregando contas...</span>
          </div>
        </div>
      </Layout>
    );
  }

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || account.status === statusFilter;
    const matchesType = typeFilter === 'todos' || account.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Calcular totais
  const calculateTotalPago = () => {
    return accounts
      .filter(account => account.type === 'despesa' && account.status === 'pago')
      .reduce((sum, account) => sum + Math.abs(account.amount), 0);
  };

  const calculateTotalRecebido = () => {
    return accounts
      .filter(account => account.type === 'receita' && account.status === 'recebido')
      .reduce((sum, account) => sum + account.amount, 0);
  };

  const calculateTotalPendente = () => {
    const receitasPendentes = accounts
      .filter(account => account.type === 'receita' && account.status === 'pendente')
      .reduce((sum, account) => sum + account.amount, 0);
    const despesasPendentes = accounts
      .filter(account => account.type === 'despesa' && account.status === 'pendente')
      .reduce((sum, account) => sum + Math.abs(account.amount), 0);
    return receitasPendentes - despesasPendentes;
  };

  const handleSave = async (accountData: Account) => {
    try {
      if (editingAccount?.id) {
        console.log('Atualizando conta existente:', accountData);
        await updateAccount(accountData);
      } else {
        console.log('Criando nova conta:', accountData);
        await addAccount(accountData);
      }
      
      setEditingAccount(undefined);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erro ao salvar conta:', error);
    }
  };

  const handleEdit = (account: Account) => {
    console.log('=== handleEdit chamado ===');
    console.log('Conta original:', account);
    
    // Criar uma cópia limpa da conta para edição
    const accountToEdit: Account = {
      id: account.id,
      description: account.description,
      amount: account.amount,
      category: account.category,
      dueDate: account.dueDate,
      type: account.type,
      status: account.status
    };
    
    console.log('Conta preparada para edição:', accountToEdit);
    
    setEditingAccount(accountToEdit);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    await deleteAccount(id);
  };

  const handleStatusChange = async (id: number, status: string) => {
    await updateAccountStatus(id, status as 'pendente' | 'pago' | 'recebido');
  };

  const handleNewAccount = () => {
    console.log('=== handleNewAccount chamado ===');
    setEditingAccount(undefined);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    console.log('=== Modal fechando ===');
    setEditingAccount(undefined);
    setIsModalOpen(false);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Contas</h1>
            <p className="text-slate-600">Gerencie suas contas a pagar e receber</p>
          </div>
          <Button
            onClick={handleNewAccount}
            className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
          >
            <Plus size={20} className="mr-2" />
            Nova Conta
          </Button>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search size={20} className="absolute left-3 top-3 text-slate-400" />
              <Input
                placeholder="Pesquisar contas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter size={16} className="mr-2" />
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="recebido">Recebido</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter size={16} className="mr-2" />
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Tipos</SelectItem>
                <SelectItem value="receita">Receitas</SelectItem>
                <SelectItem value="despesa">Despesas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cards de Totais */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Pago */}
            <div className="p-4 bg-red-50 rounded-xl border border-red-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <TrendingDown size={20} className="text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-600">Total Pago</p>
                  <p className="text-xl font-bold text-red-600">
                    R$ {calculateTotalPago().toFixed(2)}
                  </p>
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
                  <p className="text-xl font-bold text-green-600">
                    R$ {calculateTotalRecebido().toFixed(2)}
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
                  <p className={`text-xl font-bold ${calculateTotalPendente() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    R$ {calculateTotalPendente().toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm text-slate-600 text-center">
              {filteredAccounts.length} {filteredAccounts.length === 1 ? 'conta encontrada' : 'contas encontradas'}
            </p>
          </div>

          <AccountsTable
            accounts={filteredAccounts}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
          />
        </div>

        <AccountModal
          key={editingAccount?.id || 'new'}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSave={handleSave}
          account={editingAccount}
          categories={categories}
        />
      </div>
    </Layout>
  );
};

export default Contas;
