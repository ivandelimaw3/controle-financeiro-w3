
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

interface AccountsFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  typeFilter: string;
  setTypeFilter: (value: string) => void;
  monthFilter: string;
  setMonthFilter: (value: string) => void;
  yearFilter: string;
  setYearFilter: (value: string) => void;
  accounts: any[];
}

export const AccountsFilters: React.FC<AccountsFiltersProps> = ({
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
  accounts
}) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  
  // Gerar meses dinamicamente baseado nas contas existentes
  const getAvailableMonths = () => {
    const currentMonth = new Date().getMonth();
    const monthsFromAccounts = new Set<number>();
    
    // Adicionar meses das contas existentes
    accounts.forEach(account => {
      const accountDate = new Date(account.dueDate);
      monthsFromAccounts.add(accountDate.getMonth());
    });
    
    // Se não há contas, mostrar apenas o mês atual
    if (monthsFromAccounts.size === 0) {
      monthsFromAccounts.add(currentMonth);
    }
    
    // Converter para array ordenado iniciando do mês atual
    const sortedMonths = Array.from(monthsFromAccounts).sort((a, b) => {
      // Colocar mês atual primeiro, depois os outros em ordem
      if (a === currentMonth && b !== currentMonth) return -1;
      if (b === currentMonth && a !== currentMonth) return 1;
      return a - b;
    });
    
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    const months = [{ value: 'todos', label: 'Todos os Meses' }];
    
    sortedMonths.forEach(monthIndex => {
      months.push({
        value: monthIndex.toString(),
        label: monthNames[monthIndex]
      });
    });
    
    return months;
  };
  
  const months = getAvailableMonths();

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search size={20} className="absolute left-3 top-3 text-slate-400" />
        <Input
          placeholder="Pesquisar contas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <Select value={monthFilter} onValueChange={setMonthFilter}>
        <SelectTrigger className="w-full sm:w-48">
          <Filter size={16} className="mr-2" />
          <SelectValue placeholder="Filtrar por mês" />
        </SelectTrigger>
        <SelectContent>
          {months.map((month) => (
            <SelectItem key={month.value} value={month.value}>
              {month.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={yearFilter} onValueChange={setYearFilter}>
        <SelectTrigger className="w-full sm:w-48">
          <Filter size={16} className="mr-2" />
          <SelectValue placeholder="Filtrar por ano" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos os Anos</SelectItem>
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-full sm:w-48">
          <Filter size={16} className="mr-2" />
          <SelectValue placeholder="Filtrar por status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos os Status</SelectItem>
          <SelectItem value="pendente">Pendente</SelectItem>
          <SelectItem value="pago">Pago</SelectItem>
          <SelectItem value="recebido">Recebido</SelectItem>
        </SelectContent>
      </Select>

      <Select value={typeFilter} onValueChange={setTypeFilter}>
        <SelectTrigger className="w-full sm:w-48">
          <Filter size={16} className="mr-2" />
          <SelectValue placeholder="Filtrar por tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos os Tipos</SelectItem>
          <SelectItem value="receita">Receitas</SelectItem>
          <SelectItem value="despesa">Despesas</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
