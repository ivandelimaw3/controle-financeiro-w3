import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CardAccountFormModal } from '@/components/CardAccounts/CardAccountFormModal';
import { CardAccountsTable } from '@/components/CardAccounts/CardAccountsTable';
import { CardAccountsSummaryCards } from '@/components/CardAccounts/CardAccountsSummaryCards';
import { MonthNavigator } from '@/components/Accounts/MonthNavigator';
import { AccountsFilters } from '@/components/Accounts/AccountsFilters';
import { useCardAccounts, CardAccount, CardAccountFormData } from '@/hooks/useCardAccounts';
import { useAccountsReminder } from '@/hooks/useAccountsReminder';

const CardAccounts = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<CardAccount | undefined>();
  const [isShowingAll, setIsShowingAll] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<number | null>(null);

  // Estado do mês/ano atual
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  // Estados dos filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [typeFilter, setTypeFilter] = useState('todos'); // Sempre despesa para cartões
  const [paymentSourceFilter, setPaymentSourceFilter] = useState('todos');
  const [monthFilter, setMonthFilter] = useState(today.getMonth().toString());
  const [yearFilter, setYearFilter] = useState(today.getFullYear().toString());

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
    status: account.status === 'pago' ? 'pago' as const : 'pendente' as const,
    type: 'despesa' as const,
    category: account.category_name || 'Sem categoria',
    payment_source_name: account.payment_source_name || '',
    created_at: account.created_at,
    updated_at: account.updated_at,
    user_id: '',
    payment_source_id: account.payment_source_id,
    payment_source: 'bank' as const,
    data_conta: account.data_conta,
    creditcards_id: account.card_id,
    bank_id: null,
    recorrente_id: null,
    parcela: null
  }));

  useAccountsReminder(cardAccountsForReminder);

  // Filtros
  const filteredCardAccounts = cardAccounts.filter(account => {
    const searchLower = searchTerm.toLowerCase().trim();
    const matchesSearch =
      searchTerm === '' ||
      account.description.toLowerCase().includes(searchLower) ||
      account.category_name?.toLowerCase().includes(searchLower) ||
      account.payment_source_name?.toLowerCase().includes(searchLower) ||
      account.card_name?.toLowerCase().includes(searchLower);

    const matchesStatus = statusFilter === 'todos' || account.status === statusFilter;

    const accountDate = new Date(account.due_date);
    const accountMonth = accountDate.getMonth();
    const accountYear = accountDate.getFullYear();

    const matchesMonth = isShowingAll || monthFilter === 'todos' || accountMonth === parseInt(monthFilter);
    const matchesYear = isShowingAll || yearFilter === 'todos' || accountYear === parseInt(yearFilter);

    return matchesSearch && matchesStatus && matchesMonth && matchesYear;
  });

  // Ações
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
    setAccountToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (accountToDelete) {
      deleteCardAccount(accountToDelete);
      setDeleteDialogOpen(false);
      setAccountToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setAccountToDelete(null);
  };

  const handleMonthChange = (startDate: Date, endDate: Date, month: number, year: number) => {
    setCurrentMonth(month);
    setCurrentYear(year);
    setMonthFilter(month.toString());
    setYearFilter(year.toString());
    setIsShowingAll(false);
  };

  const handleShowAll = () => {
    setIsShowingAll(!isShowingAll);
    if (!isShowingAll) {
      setMonthFilter('todos');
      setYearFilter('todos');
    } else {
      setMonthFilter(currentMonth.toString());
      setYearFilter(currentYear.toString());
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto p-6 space-y-6">
          
          {/* Header com Botão e Título */}
          <div className="flex items-start justify-between">
            {/* Botão totalmente à esquerda */}
            <Button
              onClick={() => handleOpenModal()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 
                         hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Conta
            </Button>
            
            {/* Título alinhado acima do card "Total Pago" */}
            <div className="flex-1 ml-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div></div> {/* Espaço vazio para o primeiro card */}
                <div className="text-center">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                    Contas Cartões
                  </h1>
                  <p className="text-slate-600 mt-1">
                    Gerencie suas contas de cartões de crédito
                  </p>
                </div>
                <div></div> {/* Espaço vazio para o terceiro card */}
                <div></div> {/* Espaço vazio para o quarto card */}
              </div>
            </div>
          </div>

          {/* Cards Informativos */}
          {!loading && (
            <CardAccountsSummaryCards 
              cardAccounts={filteredCardAccounts} 
              totalFound={filteredCardAccounts.length}
            />
          )}

          {/* Filtros */}
          <AccountsFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            paymentSourceFilter={paymentSourceFilter}
            setPaymentSourceFilter={setPaymentSourceFilter}
            monthFilter={monthFilter}
            setMonthFilter={setMonthFilter}
            yearFilter={yearFilter}
            setYearFilter={setYearFilter}
            accounts={filteredCardAccounts}
          />

          {/* Month Navigator */}
          <MonthNavigator
            currentMonth={currentMonth}
            currentYear={currentYear}
            onMonthChange={handleMonthChange}
            onShowAll={handleShowAll}
            isShowingAll={isShowingAll}
          />

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

          {/* Diálogo de Confirmação de Exclusão */}
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={cancelDelete}>
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction 
                  onClick={confirmDelete}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </Layout>
  );
};

export default CardAccounts;
