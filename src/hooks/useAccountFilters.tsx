
import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Account } from '@/contexts/AccountsContext';

export const useAccountFilters = (accounts: Account[]) => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [typeFilter, setTypeFilter] = useState('todos');
  // Definir o filtro de mês padrão como "todos" para mostrar todas as contas
  const [monthFilter, setMonthFilter] = useState('todos');
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());

  // Aplicar filtros da URL ao carregar a página
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const statusParam = searchParams.get('status');
    const typeParam = searchParams.get('type');
    
    if (statusParam === 'pendente') {
      setStatusFilter('pendente');
    }
    
    if (typeParam === 'receita') {
      setTypeFilter('receita');
    } else if (typeParam === 'despesa') {
      setTypeFilter('despesa');
    }
  }, [location.search]);

  const filteredAccounts = useMemo(() => {
    return accounts
      .filter(account => {
        const matchesSearch = account.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             account.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'todos' || account.status === statusFilter;
        const matchesType = typeFilter === 'todos' || account.type === typeFilter;
        
        // Filtrar por mês e ano - usar dueDate que é o campo correto
        const accountDate = new Date(account.dueDate);
        const accountMonth = accountDate.getMonth(); // getMonth() retorna 0-11
        const accountYear = accountDate.getFullYear();
        
        const matchesMonth = monthFilter === 'todos' || accountMonth === parseInt(monthFilter);
        const matchesYear = yearFilter === 'todos' || accountYear === parseInt(yearFilter);
        
        console.log('Filtering account:', {
          description: account.description,
          dueDate: account.dueDate,
          accountMonth: accountMonth,
          filterMonth: monthFilter,
          filterMonthParsed: parseInt(monthFilter),
          matchesMonth,
          accountYear: accountYear,
          filterYear: yearFilter,
          filterYearParsed: parseInt(yearFilter),
          matchesYear,
          finalMatch: matchesSearch && matchesStatus && matchesType && matchesMonth && matchesYear
        });
        
        return matchesSearch && matchesStatus && matchesType && matchesMonth && matchesYear;
      })
      .sort((a, b) => {
        // Ordenar por data de vencimento de forma decrescente (mais recentes primeiro)
        return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      });
  }, [accounts, searchTerm, statusFilter, typeFilter, monthFilter, yearFilter]);

  return {
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
    filteredAccounts
  };
};
