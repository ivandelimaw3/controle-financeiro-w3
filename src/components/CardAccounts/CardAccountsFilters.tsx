
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, X } from 'lucide-react';
import { useCreditCardsData } from '@/hooks/useCreditCardsData';
import type { CardAccountFilters } from '@/hooks/useCardAccountFilters';

interface CardAccountsFiltersProps {
  filters: CardAccountFilters;
  onFiltersChange: (filters: Partial<CardAccountFilters>) => void;
  onClearFilters: () => void;
}

const categories = [
  'Alimentação',
  'Transporte',
  'Saúde',
  'Lazer',
  'Educação',
  'Casa',
  'Roupas',
  'Outros'
];

const statusOptions = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'pago', label: 'Pago' },
  { value: 'vencido', label: 'Vencido' }
];

export function CardAccountsFilters({ filters, onFiltersChange, onClearFilters }: CardAccountsFiltersProps) {
  const { creditCards } = useCreditCardsData();

  const hasActiveFilters = filters.status || filters.category || filters.creditcard || filters.search;

  return (
    <div className="bg-card rounded-lg border p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4" />
        <h3 className="font-medium">Filtros</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="ml-auto"
          >
            <X className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por descrição..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            className="pl-9"
          />
        </div>

        {/* Status */}
        <Select
          value={filters.status}
          onValueChange={(value) => onFiltersChange({ status: value === 'all' ? '' : value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {statusOptions.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Categoria */}
        <Select
          value={filters.category}
          onValueChange={(value) => onFiltersChange({ category: value === 'all' ? '' : value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todas as categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Cartão */}
        <Select
          value={filters.creditcard}
          onValueChange={(value) => onFiltersChange({ creditcard: value === 'all' ? '' : value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos os cartões" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os cartões</SelectItem>
            {creditCards.map((card) => (
              <SelectItem key={card.id} value={card.id.toString()}>
                {card.card_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
