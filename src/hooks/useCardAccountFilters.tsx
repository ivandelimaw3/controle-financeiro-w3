
import { useMemo, useState } from 'react';
import { format, parseISO, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { CardAccountData } from './useCardAccountsData';

export interface CardAccountFilters {
  status: string;
  category: string;
  creditcard: string;
  search: string;
}

export function useCardAccountFilters(cardAccounts: CardAccountData[]) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  const [filters, setFilters] = useState<CardAccountFilters>({
    status: '',
    category: '',
    creditcard: '',
    search: ''
  });

  const updateFilters = (newFilters: Partial<CardAccountFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (selectedMonth === 0) {
        setSelectedMonth(11);
        setCurrentYear(prev => prev - 1);
      } else {
        setSelectedMonth(prev => prev - 1);
      }
    } else {
      if (selectedMonth === 11) {
        setSelectedMonth(0);
        setCurrentYear(prev => prev + 1);
      } else {
        setSelectedMonth(prev => prev + 1);
      }
    }
  };

  const filteredAccounts = useMemo(() => {
    const monthStart = startOfMonth(new Date(currentYear, selectedMonth));
    const monthEnd = endOfMonth(new Date(currentYear, selectedMonth));

    return cardAccounts.filter(account => {
      // Filtro por mês
      const dueDate = parseISO(account.due_date);
      const isInMonth = isWithinInterval(dueDate, { start: monthStart, end: monthEnd });
      
      if (!isInMonth) return false;

      // Filtro por status
      if (filters.status && account.status !== filters.status) {
        return false;
      }

      // Filtro por categoria
      if (filters.category && account.category !== filters.category) {
        return false;
      }

      // Filtro por cartão
      if (filters.creditcard && account.creditcard_id.toString() !== filters.creditcard) {
        return false;
      }

      // Filtro por busca
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        return account.description.toLowerCase().includes(searchTerm) ||
               account.category.toLowerCase().includes(searchTerm) ||
               (account.creditcard?.card_name?.toLowerCase().includes(searchTerm));
      }

      return true;
    });
  }, [cardAccounts, filters, selectedMonth, currentYear]);

  return {
    filters,
    updateFilters,
    filteredAccounts,
    selectedMonth,
    currentYear,
    navigateMonth
  };
}
