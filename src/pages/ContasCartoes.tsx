
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { CardAccountsHeader } from '@/components/CardAccounts/CardAccountsHeader';
import { CardAccountsSummaryCards } from '@/components/CardAccounts/CardAccountsSummaryCards';
import { CardAccountsTable } from '@/components/CardAccounts/CardAccountsTable';
import { CardAccountModal } from '@/components/CardAccounts/CardAccountModal';
import { useCardAccountsData, CardAccount } from '@/hooks/useCardAccountsData';

const ContasCartoes = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingCardAccount, setEditingCardAccount] = useState<CardAccount | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const {
    cardAccounts,
    loading,
    addCardAccount,
    updateCardAccount,
    deleteCardAccount,
    updateCardAccountStatus,
    refreshCardAccounts
  } = useCardAccountsData();

  const handleAddCardAccount = () => {
    setEditingCardAccount(undefined);
    setShowModal(true);
  };

  const handleEditCardAccount = (cardAccount: CardAccount) => {
    setEditingCardAccount(cardAccount);
    setShowModal(true);
  };

  const handleDeleteCardAccount = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta conta?')) {
      await deleteCardAccount(id);
    }
  };

  const handleStatusChange = async (id: number, status: 'pendente' | 'pago') => {
    await updateCardAccountStatus(id, status);
  };

  const handleModalSubmit = async (cardAccountData: any) => {
    if (editingCardAccount) {
      await updateCardAccount({ ...editingCardAccount, ...cardAccountData });
    } else {
      await addCardAccount(cardAccountData);
    }
    setShowModal(false);
    setEditingCardAccount(undefined);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingCardAccount(undefined);
  };

  // Filtros
  const filteredCardAccounts = cardAccounts.filter(cardAccount => {
    const matchesSearch = cardAccount.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cardAccount.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || cardAccount.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || cardAccount.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Dados para o resumo
  const totalCardAccounts = cardAccounts.length;
  const pendingCardAccounts = cardAccounts.filter(ca => ca.status === 'pendente').length;
  const paidCardAccounts = cardAccounts.filter(ca => ca.status === 'pago').length;
  const totalAmount = cardAccounts.reduce((sum, ca) => sum + ca.amount, 0);

  return (
    <Layout>
      <div className="space-y-6">
        <CardAccountsHeader
          onAddCardAccount={handleAddCardAccount}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          onRefresh={refreshCardAccounts}
        />

        <CardAccountsSummaryCards
          totalCardAccounts={totalCardAccounts}
          pendingCardAccounts={pendingCardAccounts}
          paidCardAccounts={paidCardAccounts}
          totalAmount={totalAmount}
        />

        <CardAccountsTable
          cardAccounts={filteredCardAccounts}
          loading={loading}
          onEdit={handleEditCardAccount}
          onDelete={handleDeleteCardAccount}
          onStatusChange={handleStatusChange}
        />

        {showModal && (
          <CardAccountModal
            cardAccount={editingCardAccount}
            onSubmit={handleModalSubmit}
            onClose={handleModalClose}
          />
        )}
      </div>
    </Layout>
  );
};

export default ContasCartoes;
