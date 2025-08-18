
import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreditCardsOptions } from '@/hooks/useCreditCardsOptions';
import { useCategoriesData } from '@/hooks/useCategoriesData';
import type { CardAccountFilters } from '@/hooks/useCardAccountFilters';

interface CardAccountsFiltersProps {
  filters: CardAccountFilters;
  onFiltersChange: (filters: Partial<CardAccountFilters>) => void;
}

export const CardAccountsFilters = ({ filters, onFiltersChange }: CardAccountsFiltersProps) => {
  const { cards } = useCreditCardsOptions();
  const { categories } = useCategoriesData();

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
      <div className="flex items-center space-x-2">
        <Filter className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Filtros</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar contas..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            className="pl-10"
          />
        </div>

        <Select
          value={filters.status}
          onValueChange={(value) => onFiltersChange({ status: value === 'all' ? '' : value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="pago">Pago</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.category}
          onValueChange={(value) => onFiltersChange({ category: value === 'all' ? '' : value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.name}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.creditcard}
          onValueChange={(value) => onFiltersChange({ creditcard: value === 'all' ? '' : value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Cartão" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os cartões</SelectItem>
            {cards.map((card) => (
              <SelectItem key={card.id} value={card.id}>
                {card.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onFiltersChange({
              status: '',
              category: '',
              creditcard: '',
              search: ''
            })}
          >
            Limpar
          </Button>
        </div>
      </div>
    </div>
  );
};
