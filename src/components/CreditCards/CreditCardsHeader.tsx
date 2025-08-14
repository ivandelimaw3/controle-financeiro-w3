
import React from 'react';
import { Plus, CreditCard, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CreditCardsHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onNewCard: () => void;
}

export const CreditCardsHeader: React.FC<CreditCardsHeaderProps> = ({
  searchTerm,
  onSearchChange,
  onNewCard
}) => {
  return (
    <div className="space-y-6">
      {/* Header Superior */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <CreditCard className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Controle de Cartões
            </h1>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <User className="h-5 w-5 text-gray-500" />
          <span className="text-sm text-gray-600">João Silva</span>
        </div>
      </div>

      {/* Título principal e ações */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Meus Cartões de Crédito
          </h2>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Gerencie seus cartões e acompanhe seus gastos
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar cartões..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          <Button 
            onClick={onNewCard} 
            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
            size="lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Cartão
          </Button>
        </div>
      </div>
    </div>
  );
};
