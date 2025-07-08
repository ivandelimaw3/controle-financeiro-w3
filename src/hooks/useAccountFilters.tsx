
import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Account } from '@/contexts/AccountsContext';

export const useAccountFilters = (accounts: Account[]) => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [typeFilter, setTypeFilter] = useState('todos');
  // Definir o filtro de mês padrão como o mês atual
  const [monthFilter, setMonthFilter] = useState(new Date().getMonth().toString());
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
        
        // Filtrar por mês e ano
        const accountDate = new Date(account.dueDate);
        const matchesMonth = monthFilter === 'todos' || accountDate.getMonth() === parseInt(monthFilter);
        const matchesYear = yearFilter === 'todos' || accountDate.getFullYear() === parseInt(yearFilter);
        
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
