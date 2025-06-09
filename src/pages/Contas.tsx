import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { AccountsTable } from '@/components/Accounts/AccountsTable';
import { AccountModal } from '@/components/Accounts/AccountModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Filter, DollarSign, Loader2 } from 'lucide-react';
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

  // Calcular total baseado no filtro de tipo
  const calculateFilteredTotal = () => {
    if (typeFilter === 'todos') {
      const receitas = filteredAccounts
        .filter(account => account.type === 'receita')
        .reduce((sum, account) => sum + account.amount, 0);
      const despesas = filteredAccounts
        .filter(account => account.type === 'despesa')
        .reduce((sum, account) => sum + Math.abs(account.amount), 0);
      return receitas - despesas;
    } else if (typeFilter === 'receita') {
      return filteredAccounts
        .filter(account => account.type === 'receita')
        .reduce((sum, account) => sum + account.amount, 0);
    } else {
      return filteredAccounts
        .filter(account => account.type === 'despesa')
        .reduce((sum, account) => sum + Math.abs(account.amount), 0);
    }
  };

  const getFilteredTotalLabel = () => {
    if (typeFilter === 'todos') return 'Saldo Total';
    if (typeFilter === 'receita') return 'Total Receitas';
    return 'Total Despesas';
  };

  const getFilteredTotalColor = () => {
    const total = calculateFilteredTotal();
    if (typeFilter === 'receita') return 'text-green-600';
    if (typeFilter === 'despesa') return 'text-red-600';
    return total >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const handleSave = async (accountData: Account) => {
    if (editingAccount) {
      await updateAccount(accountData);
    } else {
      await addAccount(accountData);
    }
    setEditingAccount(undefined);
  };

  const handleEdit = (account: Account) => {
    console.log('=== handleEdit called ===');
    console.log('Account to edit:', account);
    console.log('Account ID:', account.id);
    
    // Primeiro fechar o modal se estiver aberto
    if (isModalOpen) {
      setIsModalOpen(false);
    }
    
    // Aguardar um tick para garantir que o modal fechou
    setTimeout(() => {
      console.log('Setting editing account:', account);
      setEditingAccount(account);
      
      // Aguardar outro tick para garantir que editingAccount foi definido
      setTimeout(() => {
        console.log('Opening modal for editing');
        setIsModalOpen(true);
      }, 50);
    }, 50);
  };

  const handleDelete = async (id: number) => {
    await deleteAccount(id);
  };

  const handleStatusChange = async (id: number, status: string) => {
    await updateAccountStatus(id, status as 'pendente' | 'pago' | 'recebido');
  };

  const handleNewAccount = () => {
    console.log('=== handleNewAccount called ===');
    setEditingAccount(undefined);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    console.log('=== Modal closing ===');
    setIsModalOpen(false);
    setEditingAccount(undefined);
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

          {/* Campo do Total Filtrado */}
          <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">{getFilteredTotalLabel()}</p>
                  <p className={`text-2xl font-bold ${getFilteredTotalColor()}`}>
                    {typeFilter === 'despesa' ? '' : typeFilter === 'receita' ? '+' : ''}R$ {Math.abs(calculateFilteredTotal()).toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600">
                  {filteredAccounts.length} {filteredAccounts.length === 1 ? 'conta' : 'contas'}
                </p>
              </div>
            </div>
          </div>

          <AccountsTable
            accounts={filteredAccounts}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
          />
        </div>

        <AccountModal
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
