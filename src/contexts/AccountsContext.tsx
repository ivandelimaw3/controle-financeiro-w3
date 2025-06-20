
import React, { createContext, useContext, ReactNode } from 'react';
import { useAccountsData, Account, Transaction } from '@/hooks/useAccountsData';

interface AccountsContextType {
  accounts: Account[];
  loading: boolean;
  addAccount: (account: Omit<Account, 'id'>) => Promise<void>;
  updateAccount: (account: Account) => Promise<void>;
  deleteAccount: (id: number) => Promise<void>;
  updateAccountStatus: (id: number, status: 'pendente' | 'pago' | 'recebido') => Promise<void>;
  getTransactions: () => Transaction[];
  getTotalReceitas: () => number;
  getTotalDespesas: () => number;
  getSaldo: () => number;
  getContasPendentes: () => number;
  refreshAccounts: () => Promise<void>;
}

const AccountsContext = createContext<AccountsContextType | undefined>(undefined);

export const useAccounts = () => {
  const context = useContext(AccountsContext);
  if (!context) {
    throw new Error('useAccounts must be used within an AccountsProvider');
  }
  return context;
};

interface AccountsProviderProps {
  children: ReactNode;
}

export const AccountsProvider: React.FC<AccountsProviderProps> = ({ children }) => {
  const {
    accounts,
    loading,
    addAccount,
    updateAccount,
    deleteAccount,
    updateAccountStatus,
    refreshAccounts
  } = useAccountsData();

  const getTransactions = (): Transaction[] => {
    return accounts.map(account => ({
      id: account.id,
      description: account.description,
      amount: account.amount,
      category: account.category,
      date: new Date(account.dueDate).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      type: account.type,
      status: account.status
    }));
  };

  const getTotalReceitas = () => {
    return accounts
      .filter(t => t.type === 'receita' && t.status === 'recebido')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalDespesas = () => {
    return accounts
      .filter(t => t.type === 'despesa' && t.status === 'pago')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  };

  const getSaldo = () => {
    return getTotalReceitas() - getTotalDespesas();
  };

  const getContasPendentes = () => {
    return accounts.filter(t => t.status === 'pendente').length;
  };

  return (
    <AccountsContext.Provider value={{
      accounts,
      loading,
      addAccount,
      updateAccount,
      deleteAccount,
      updateAccountStatus,
      getTransactions,
      getTotalReceitas,
      getTotalDespesas,
      getSaldo,
      getContasPendentes,
      refreshAccounts
    }}>
      {children}
    </AccountsContext.Provider>
  );
};

// Exportar tipos para compatibilidade
export type { Account, Transaction };
