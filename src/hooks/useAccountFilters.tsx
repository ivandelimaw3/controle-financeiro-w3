
import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Account } from '@/contexts/AccountsContext';

export const useAccountFilters = (accounts: Account[]) => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [typeFilter, setTypeFilter] = useState('todos');
  
  // Inicializar sempre no mês atual
  const today = new Date();
  const [monthFilter, setMonthFilter] = useState(today.getMonth().toString());
  const [yearFilter, setYearFilter] = useState(today.getFullYear().toString());

  // Log quando searchTerm muda
  useEffect(() => {
    console.log('SearchTerm mudou para:', searchTerm);
  }, [searchTerm]);

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
    console.log('=== INÍCIO DO FILTRO ===');
    console.log('Total de contas:', accounts.length);
    console.log('Termo de pesquisa:', `"${searchTerm}"`);
    console.log('Filtros ativos:', { searchTerm, statusFilter, typeFilter, monthFilter, yearFilter });

    const filtered = accounts
      .filter(account => {
        // Log detalhado da pesquisa
        const searchLower = searchTerm.toLowerCase().trim();
        const descriptionLower = account.description.toLowerCase();
        const categoryLower = account.category.toLowerCase();
        const paymentSourceLower = account.payment_source_name?.toLowerCase() || '';
        
        const matchesSearch = searchTerm === '' || 
                             descriptionLower.includes(searchLower) ||
                             categoryLower.includes(searchLower) ||
                             paymentSourceLower.includes(searchLower);
        
        if (searchTerm && searchTerm.length > 0) {
          console.log(`Testando conta: "${account.description}"`);
          console.log(`- Descrição: "${descriptionLower}" inclui "${searchLower}"? ${descriptionLower.includes(searchLower)}`);
          console.log(`- Categoria: "${categoryLower}" inclui "${searchLower}"? ${categoryLower.includes(searchLower)}`);
          console.log(`- Fonte Pagamento: "${paymentSourceLower}" inclui "${searchLower}"? ${paymentSourceLower.includes(searchLower)}`);
          console.log(`- Match pesquisa: ${matchesSearch}`);
        }
        
        const matchesStatus = statusFilter === 'todos' || account.status === statusFilter;
        const matchesType = typeFilter === 'todos' || account.type === typeFilter;
        
        // Filtrar por mês e ano - usar dueDate que é o campo correto
        const accountDate = new Date(account.dueDate + 'T12:00:00');
        const accountMonth = accountDate.getMonth(); // getMonth() retorna 0-11
        const accountYear = accountDate.getFullYear();
        
        // Converter monthFilter para número apenas se não for 'todos'
        const matchesMonth = monthFilter === 'todos' || accountMonth === parseInt(monthFilter);
        const matchesYear = yearFilter === 'todos' || accountYear === parseInt(yearFilter);
        
        const finalMatch = matchesSearch && matchesStatus && matchesType && matchesMonth && matchesYear;
        
        if (searchTerm && searchTerm.length > 0) {
          console.log(`- Resultado final para "${account.description}": ${finalMatch}`);
          console.log('---');
        }
        
        return finalMatch;
      })
      .sort((a, b) => {
        // Ordenar por data de vencimento de forma decrescente (mais recentes primeiro)
        return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      });

    console.log('Contas filtradas:', filtered.length);
    if (searchTerm) {
      console.log('Contas que passaram no filtro de pesquisa:', filtered.map(a => a.description));
    }
    console.log('=== FIM DO FILTRO ===');
    
    return filtered;
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
