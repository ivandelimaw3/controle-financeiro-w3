
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { CardAccountFormModal } from '@/components/CardAccounts/CardAccountFormModal';
import { CardAccountsTable } from '@/components/CardAccounts/CardAccountsTable';
import { CardAccountsSummaryCards } from '@/components/CardAccounts/CardAccountsSummaryCards';
import { useCardAccounts, CardAccount, CardAccountFormData } from '@/hooks/useCardAccounts';

const CardAccounts = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<CardAccount | undefined>();

  const {
    cardAccounts,
    loading,
    createCardAccount,
    updateCardAccount,
    updateCardAccountStatus,
    deleteCardAccount,
    isCreating,
    isUpdating,
    isUpdatingStatus,
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

  const handleStatusChange = (id: number, status: 'pendente' | 'pago') => {
    updateCardAccountStatus({ id, status });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta conta?')) {
      deleteCardAccount(id);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                Contas Cartões
              </h1>
              <p className="text-slate-600 mt-1">
                Gerencie suas contas de cartões de crédito
              </p>
            </div>
            <Button
              onClick={() => handleOpenModal()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Conta
            </Button>
          </div>

          {/* Cards Informativos */}
          {!loading && <CardAccountsSummaryCards cardAccounts={cardAccounts} />}

          {/* Tabela */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl border border-white/20">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="text-lg text-slate-600">Carregando contas...</div>
              </div>
            ) : (
              <CardAccountsTable
                cardAccounts={cardAccounts}
                onEdit={handleOpenModal}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                isDeleting={isDeleting}
              />
            )}
          </div>

          {/* Modal */}
          <CardAccountFormModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSubmit={handleSubmit}
            cardAccount={editingAccount}
            isLoading={isCreating || isUpdating}
          />
        </div>
      </div>
    </Layout>
  );
};

export default CardAccounts;
