
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { CardAccountFormModal } from '@/components/CardAccounts/CardAccountFormModal';
import { CardAccountsTable } from '@/components/CardAccounts/CardAccountsTable';
import { CardAccountsSummaryCards } from '@/components/CardAccounts/CardAccountsSummaryCards';
import { MonthNavigator } from '@/components/Accounts/MonthNavigator';
import { useCardAccounts, CardAccount, CardAccountFormData } from '@/hooks/useCardAccounts';
import { useAccountsReminder } from '@/hooks/useAccountsReminder';

const CardAccounts = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<CardAccount | undefined>();
  const [isShowingAll, setIsShowingAll] = useState(false);
  
  // Estado do mês/ano atual
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

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

  // Ativar lembretes para contas de cartão
  const cardAccountsForReminder = cardAccounts.map(account => ({
    id: account.id,
    description: account.description,
    amount: account.amount,
    dueDate: account.due_date,
    status: account.status as 'pendente' | 'pago' | 'recebido',
    type: 'despesa' as 'receita' | 'despesa',
    category: account.category_name || 'Sem categoria',
    payment_source_name: account.payment_source_name || '',
    created_at: account.created_at,
    updated_at: account.updated_at,
    user_id: '',
    payment_source_id: account.payment_source_id,
    payment_source: account.payment_source || '',
    data_conta: account.data_conta,
    creditcards_id: account.card_id,
    bank_id: null,
    recorrente_id: null,
    parcela: null
  }));

  useAccountsReminder(cardAccountsForReminder);

  // Filtrar contas por mês/ano se não estiver mostrando todas
  const filteredCardAccounts = isShowingAll 
    ? cardAccounts 
    : cardAccounts.filter(account => {
        const accountDate = new Date(account.due_date);
        return accountDate.getMonth() === currentMonth && accountDate.getFullYear() === currentYear;
      });

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

  const handleMonthChange = (startDate: Date, endDate: Date, month: number, year: number) => {
    setCurrentMonth(month);
    setCurrentYear(year);
    setIsShowingAll(false);
  };

  const handleShowAll = () => {
    setIsShowingAll(!isShowingAll);
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

          {/* Month Navigator */}
          <MonthNavigator
            currentMonth={currentMonth}
            currentYear={currentYear}
            onMonthChange={handleMonthChange}
            onShowAll={handleShowAll}
            isShowingAll={isShowingAll}
          />

          {/* Cards Informativos */}
          {!loading && <CardAccountsSummaryCards cardAccounts={filteredCardAccounts} />}

          {/* Tabela */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl border border-white/20">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="text-lg text-slate-600">Carregando contas...</div>
              </div>
            ) : (
              <CardAccountsTable
                cardAccounts={filteredCardAccounts}
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
