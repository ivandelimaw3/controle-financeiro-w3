
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { AccountsHeader } from '@/components/Accounts/AccountsHeader';
import { AccountsFilters } from '@/components/Accounts/AccountsFilters';
import { AccountsSummaryCards } from '@/components/Accounts/AccountsSummaryCards';
import { AccountsTable } from '@/components/Accounts/AccountsTable';
import { AccountModal } from '@/components/Accounts/AccountModal';
import { Loader2 } from 'lucide-react';
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

  const handleSave = async (accountData: Account) => {
    try {
      if (editingAccount?.id) {
        console.log('Contas: Atualizando conta existente:', accountData);
        await updateAccount(accountData);
      } else {
        console.log('Contas: Criando nova conta:', accountData);
        await addAccount(accountData);
      }
      
      setEditingAccount(undefined);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Contas: Erro ao salvar conta:', error);
    }
  };

  const handleEdit = (account: Account) => {
    console.log('Contas: Editando conta:', account);
    setEditingAccount(account);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    console.log('Contas: Deletando conta:', id);
    await deleteAccount(id);
  };

  const handleStatusChange = async (id: number, status: string) => {
    console.log('Contas: Mudando status da conta:', id, status);
    await updateAccountStatus(id, status as 'pendente' | 'pago' | 'recebido');
  };

  const handleNewAccount = () => {
    console.log('Contas: Abrindo modal para nova conta');
    setEditingAccount(undefined);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    console.log('Contas: Fechando modal');
    setEditingAccount(undefined);
    setIsModalOpen(false);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <AccountsHeader onNewAccount={handleNewAccount} />

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
          <AccountsFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
          />

          <AccountsSummaryCards accounts={accounts} />

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

        {isModalOpen && (
          <AccountModal
            key={editingAccount?.id || 'new'}
            isOpen={isModalOpen}
            onClose={handleModalClose}
            onSave={handleSave}
            account={editingAccount}
            categories={categories}
          />
        )}
      </div>
    </Layout>
  );
};

export default Contas;
