import React from "react";
import { Layout } from "@/components/Layout";
import { AccountsHeader } from "@/components/Accounts/AccountsHeader";
import { AccountsFilters } from "@/components/Accounts/AccountsFilters";
import { AccountsSummaryCards } from "@/components/Accounts/AccountsSummaryCards";
import { AccountsTable } from "@/components/Accounts/AccountsTable";
import { AccountModal, type AccountFormData } from "@/components/Accounts/AccountModal";
import { MonthNavigator } from "@/components/Accounts/MonthNavigator";
import { AccessControlWrapper } from "@/components/AccessControlWrapper";
import { Loader2 } from "lucide-react";
import { useAccountsData } from "@/hooks/useAccountsData";
import { useAccountsReminder } from "@/hooks/useAccountsReminder";
import { useAccountFilters } from "@/hooks/useAccountFilters";
import { useAccountOperations } from "@/hooks/useAccountOperations";

const Contas: React.FC = () => {
  const { 
    accounts, 
    loading, 
    upsertPreviousBalance,
    getPreviousMonthBalance,
    calculateMonthFinalBalance
  } = useAccountsData();

  useAccountsReminder(accounts);

  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    monthFilter,
    setMonthFilter,
    yearFilter,
    setYearFilter,
    filteredAccounts,
  } = useAccountFilters(accounts);

  const {
    isModalOpen,
    editingAccount,
    handleSave,
    handleEdit,
    handleDelete,
    handleStatusChange,
    handleNewAccount,
    handleModalClose,
  } = useAccountOperations();

  const categories = ["Trabalho", "Moradia", "Utilidades", "Alimentação", "Transporte", "Lazer"];

  const today = new Date();
  const currentMonth = monthFilter && monthFilter !== "todos" ? parseInt(monthFilter) : today.getMonth() + 1;
  const currentYear = yearFilter && yearFilter !== "todos" ? parseInt(yearFilter) : today.getFullYear();
  const isShowingAll = monthFilter === "todos";

  const handleMonthChange = (startDate: Date, endDate: Date, month: number, year: number) => {
    setMonthFilter(month.toString());
    setYearFilter(year.toString());
  };

  const handleShowAll = () => {
    setMonthFilter("todos");
    setYearFilter("todos");
  };

  const handleSubmit = (data: AccountFormData) => {
    handleSave(data);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-lg text-slate-600">Carregando contas...</span>
          </div>
        </div>
      );
    }

    return (
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
            monthFilter={monthFilter}
            setMonthFilter={setMonthFilter}
            yearFilter={yearFilter}
            setYearFilter={setYearFilter}
            accounts={accounts}
          />

          <AccountsSummaryCards
            accounts={filteredAccounts}
            previousBalance={getPreviousMonthBalance(currentMonth, currentYear)}
            onUpdatePreviousBalance={upsertPreviousBalance}
            getPreviousMonthBalance={getPreviousMonthBalance}
            calculateMonthFinalBalance={calculateMonthFinalBalance}
            month={currentMonth}
            year={currentYear}
          />

          <div className="mb-4">
            <p className="text-sm text-slate-600 text-center">
              {filteredAccounts.length} {filteredAccounts.length === 1 ? "conta encontrada" : "contas encontradas"}
            </p>
          </div>

          <MonthNavigator
            currentMonth={currentMonth - 1}
            currentYear={currentYear}
            onMonthChange={handleMonthChange}
            onShowAll={handleShowAll}
            isShowingAll={isShowingAll}
          />

          <AccountsTable
            accounts={filteredAccounts}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
          />
        </div>

        <AccountModal
          key={editingAccount?.id || "new"}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSubmit={handleSubmit}
          account={editingAccount}
          categories={categories}
        />
      </div>
    );
  };

  return (
    <AccessControlWrapper>
      <Layout>{renderContent()}</Layout>
    </AccessControlWrapper>
  );
};

export default Contas;
