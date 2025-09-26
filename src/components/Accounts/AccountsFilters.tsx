
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';
import { useBanksData } from '@/hooks/useBanksData';
import { useCreditCards } from '@/hooks/useCreditCards';

interface AccountsFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  typeFilter: string;
  setTypeFilter: (value: string) => void;
  paymentSourceFilter: string;
  setPaymentSourceFilter: (value: string) => void;
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
  paymentSourceFilter,
  setPaymentSourceFilter,
  monthFilter,
  setMonthFilter,
  yearFilter,
  setYearFilter,
  accounts
}) => {
  const { banks } = useBanksData();
  const { creditCards } = useCreditCards();
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  
  // Definir todos os meses do ano com o mesmo padrão
  const months = [
    { value: 'todos', label: 'Todos os Meses' },
    { value: '0', label: 'Janeiro' },
    { value: '1', label: 'Fevereiro' },
    { value: '2', label: 'Março' },
    { value: '3', label: 'Abril' },
    { value: '4', label: 'Maio' },
    { value: '5', label: 'Junho' },
    { value: '6', label: 'Julho' },
    { value: '7', label: 'Agosto' },
    { value: '8', label: 'Setembro' },
    { value: '9', label: 'Outubro' },
    { value: '10', label: 'Novembro' },
    { value: '11', label: 'Dezembro' }
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-4 mb-6">
      {/* Campo de pesquisa com largura fixa em telas maiores */}
      <div className="relative w-full lg:w-80 lg:flex-shrink-0">
        <Search size={20} className="absolute left-3 top-3 text-slate-400 pointer-events-none z-10" />
        <Input
          placeholder="Pesquisar contas..."
          value={searchTerm}
          onChange={(e) => {
            console.log('Pesquisa digitada:', e.target.value);
            setSearchTerm(e.target.value);
          }}
          className="pl-10 w-full min-w-0"
        />
      </div>
      
      {/* Container para os filtros */}
      <div className="flex flex-col sm:flex-row gap-4 flex-1">
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

        <Select value={paymentSourceFilter} onValueChange={setPaymentSourceFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter size={16} className="mr-2" />
            <SelectValue placeholder="Filtrar por fonte" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as Fontes</SelectItem>
            {banks.map((bank) => (
              <SelectItem key={`bank_${bank.id}`} value={`bank_${bank.id}`}>
                {bank.nickname || bank.name}
              </SelectItem>
            ))}
            {creditCards.map((card) => (
              <SelectItem key={`card_${card.id}`} value={`card_${card.id}`}>
                {card.card_name}
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
    </div>
  );
};
