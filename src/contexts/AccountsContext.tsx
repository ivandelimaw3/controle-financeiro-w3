
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Account {
  id: number;
  description: string;
  amount: number;
  category: string;
  dueDate: string;
  type: 'receita' | 'despesa';
  status: 'pendente' | 'pago' | 'recebido';
}

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: string;
  type: 'receita' | 'despesa';
  status: 'pendente' | 'pago' | 'recebido';
}

interface AccountsContextType {
  accounts: Account[];
  addAccount: (account: Omit<Account, 'id'>) => void;
  updateAccount: (account: Account) => void;
  deleteAccount: (id: number) => void;
  updateAccountStatus: (id: number, status: 'pendente' | 'pago' | 'recebido') => void;
  getTransactions: () => Transaction[];
  getTotalReceitas: () => number;
  getTotalDespesas: () => number;
  getSaldo: () => number;
  getContasPendentes: () => number;
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

const STORAGE_KEY = 'controle_financeiro_w3_accounts';

// Dados iniciais padrão
const defaultAccounts: Account[] = [
  {
    id: 1,
    description: 'Aluguel',
    amount: -1200,
    category: 'Moradia',
    dueDate: '2024-12-10',
    type: 'despesa',
    status: 'pago'
  },
  {
    id: 2,
    description: 'Salário',
    amount: 5000,
    category: 'Trabalho',
    dueDate: '2024-12-15',
    type: 'receita',
    status: 'recebido'
  },
  {
    id: 3,
    description: 'Conta de Luz',
    amount: -150,
    category: 'Utilidades',
    dueDate: '2024-12-20',
    type: 'despesa',
    status: 'pendente'
  },
  {
    id: 4,
    description: 'Freelance',
    amount: 800,
    category: 'Trabalho',
    dueDate: '2024-12-18',
    type: 'receita',
    status: 'pendente'
  }
];

export const AccountsProvider: React.FC<AccountsProviderProps> = ({ children }) => {
  const [accounts, setAccounts] = useState<Account[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedAccounts = JSON.parse(stored);
        // Verificar se os dados são válidos
        if (Array.isArray(parsedAccounts) && parsedAccounts.length > 0) {
          console.log('Dados carregados do localStorage:', parsedAccounts.length, 'contas');
          return parsedAccounts;
        }
      }
      console.log('Carregando dados padrão iniciais');
      return defaultAccounts;
    } catch (error) {
      console.error('Erro ao carregar dados do localStorage:', error);
      return defaultAccounts;
    }
  });

  // Salvar no localStorage sempre que accounts mudar
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
      console.log('Dados salvos no localStorage:', accounts.length, 'contas');
    } catch (error) {
      console.error('Erro ao salvar dados no localStorage:', error);
    }
  }, [accounts]);

  const addAccount = (accountData: Omit<Account, 'id'>) => {
    const newAccount = {
      ...accountData,
      id: Math.max(...accounts.map(a => a.id)) + 1
    };
    setAccounts(prev => [...prev, newAccount]);
  };

  const updateAccount = (updatedAccount: Account) => {
    setAccounts(prev => prev.map(acc => 
      acc.id === updatedAccount.id ? updatedAccount : acc
    ));
  };

  const deleteAccount = (id: number) => {
    setAccounts(prev => prev.filter(acc => acc.id !== id));
  };

  const updateAccountStatus = (id: number, status: 'pendente' | 'pago' | 'recebido') => {
    setAccounts(prev => prev.map(acc => 
      acc.id === id ? { ...acc, status } : acc
    ));
  };

  const getTransactions = (): Transaction[] => {
    return accounts.map(account => ({
      id: account.id,
      description: account.description,
      amount: account.amount,
      category: account.category,
      date: new Date(account.dueDate).toLocaleDateString('pt-BR'),
      type: account.type,
      status: account.status
    }));
  };

  const getTotalReceitas = () => {
    return accounts
      .filter(t => t.type === 'receita')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalDespesas = () => {
    return accounts
      .filter(t => t.type === 'despesa')
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
      addAccount,
      updateAccount,
      deleteAccount,
      updateAccountStatus,
      getTransactions,
      getTotalReceitas,
      getTotalDespesas,
      getSaldo,
      getContasPendentes
    }}>
      {children}
    </AccountsContext.Provider>
  );
};
