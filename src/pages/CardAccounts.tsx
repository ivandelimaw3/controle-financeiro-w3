
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { CardAccountFormModal } from '@/components/CardAccounts/CardAccountFormModal';
import { CardAccountsTable } from '@/components/CardAccounts/CardAccountsTable';
import { useCardAccounts, CardAccount, CardAccountFormData } from '@/hooks/useCardAccounts';

const CardAccounts = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<CardAccount | undefined>();

  const {
    cardAccounts,
    loading,
    createCardAccount,
    updateCardAccount,
    deleteCardAccount,
    isCreating,
    isUpdating,
    isDeleting
  } = useCardAccounts();

  const handleOpenModal = (account?: CardAccount) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAccount(undefined);
  };

  const handleSubmit = (data: CardAccountFormData) => {
    if (editingAccount) {
      updateCardAccount({ id: editingAccount.id, data });
    } else {
      createCardAccount(data);
    }
    handleCloseModal();
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta conta?')) {
      deleteCardAccount(id);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Contas Cartões</h1>
            <p className="text-gray-600 mt-1">
              Gerencie suas contas de cartões de crédito
            </p>
          </div>
          <Button
            onClick={() => handleOpenModal()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Conta
          </Button>
        </div>

        {/* Tabela */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="text-lg text-gray-600">Carregando contas...</div>
          </div>
        ) : (
          <CardAccountsTable
            cardAccounts={cardAccounts}
            onEdit={handleOpenModal}
            onDelete={handleDelete}
            isDeleting={isDeleting}
          />
        )}

        {/* Modal */}
        <CardAccountFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          cardAccount={editingAccount}
          isLoading={isCreating || isUpdating}
        />
      </div>
    </Layout>
  );
};

export default CardAccounts;
