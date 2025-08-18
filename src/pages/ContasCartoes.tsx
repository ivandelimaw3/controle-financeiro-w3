
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { CardAccountsHeader } from '@/components/CardAccounts/CardAccountsHeader';
import { CardAccountsFilters } from '@/components/CardAccounts/CardAccountsFilters';
import { CardAccountsSummaryCards } from '@/components/CardAccounts/CardAccountsSummaryCards';
import { CardAccountsTable } from '@/components/CardAccounts/CardAccountsTable';
import { CardAccountModal } from '@/components/CardAccounts/CardAccountModal';
import { useCardAccountsData } from '@/hooks/useCardAccountsData';
import { useCardAccountFilters } from '@/hooks/useCardAccountFilters';

const ContasCartoes = () => {
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  const {
    cardAccounts,
    isLoading,
    error,
    createCardAccount,
    updateCardAccount,
    toggleCardAccountStatus,
    deleteCardAccount,
    isCreating,
    isUpdating,
    isDeleting
  } = useCardAccountsData();

  const {
    filters,
    updateFilters,
    clearFilters,
    filteredAccounts,
    selectedMonth,
    currentYear,
    navigateMonth
  } = useCardAccountFilters(cardAccounts);

  const handleCreateAccount = async (accountData) => {
    try {
      await createCardAccount(accountData);
      setShowAccountForm(false);
    } catch (error) {
      console.error('Erro ao criar conta do cartão:', error);
    }
  };

  const handleUpdateAccount = async (accountData) => {
    if (editingAccount) {
      try {
        await updateCardAccount({ id: editingAccount.id, accountData });
        setShowAccountForm(false);
        setEditingAccount(null);
      } catch (error) {
        console.error('Erro ao atualizar conta do cartão:', error);
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    console.log('Chamando handleToggleStatus:', { id, currentStatus });
    try {
      await toggleCardAccountStatus({ id, currentStatus });
    } catch (error) {
      console.error('Erro ao alterar status da conta:', error);
    }
  };

  const handleDeleteAccount = async (id) => {
    if (confirm('Tem certeza que deseja excluir esta conta?')) {
      try {
        await deleteCardAccount(id);
      } catch (error) {
        console.error('Erro ao excluir conta do cartão:', error);
      }
    }
  };

  const handleEditAccount = (account) => {
    setEditingAccount(account);
    setShowAccountForm(true);
  };

  const openNewAccountForm = () => {
    setEditingAccount(null);
    setShowAccountForm(true);
  };

  const closeAccountForm = () => {
    setShowAccountForm(false);
    setEditingAccount(null);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando contas dos cartões...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <CardAccountsHeader
          onNewAccount={openNewAccountForm}
          selectedMonth={selectedMonth}
          currentYear={currentYear}
          onNavigateMonth={navigateMonth}
        />

        <CardAccountsFilters
          filters={filters}
          onFiltersChange={updateFilters}
          onClearFilters={clearFilters}
        />

        <CardAccountsSummaryCards accounts={filteredAccounts} />

        <CardAccountsTable
          accounts={filteredAccounts}
          onEdit={handleEditAccount}
          onDelete={handleDeleteAccount}
          onToggleStatus={handleToggleStatus}
          isDeleting={isDeleting}
          isUpdating={isUpdating}
        />
      </div>

      <CardAccountModal
        isOpen={showAccountForm}
        onClose={closeAccountForm}
        account={editingAccount}
        onSubmit={editingAccount ? handleUpdateAccount : handleCreateAccount}
        isLoading={isCreating || isUpdating}
      />
    </Layout>
  );
};

export default ContasCartoes;
