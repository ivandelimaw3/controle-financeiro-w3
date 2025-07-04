
import React from 'react';
import { Calendar, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CategorySelect } from './CategorySelect';
import { Category } from '@/hooks/useCategoriesData';

interface Account {
  id?: number;
  description: string;
  amount: number;
  category: string;
  dueDate: string;
  type: 'receita' | 'despesa';
  status: 'pendente' | 'pago' | 'recebido';
  parcela?: string;
  recorrente_id?: string;
  qtd_parcelas?: number;
}

interface AccountFormProps {
  formData: Account;
  setFormData: React.Dispatch<React.SetStateAction<Account>>;
  categories: Category[];
  onRefreshCategories: () => void;
  onAddCategory?: (categoryData: { name: string; type: 'receita' | 'despesa'; color: string }) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEditing: boolean;
}

export const AccountForm: React.FC<AccountFormProps> = ({
  formData,
  setFormData,
  categories,
  onRefreshCategories,
  onAddCategory,
  onSubmit,
  onCancel,
  isEditing
}) => {
  // Verificação de segurança
  if (!formData) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Erro: Dados do formulário não encontrados</p>
        <Button onClick={onCancel} className="mt-4">
          Fechar
        </Button>
      </div>
    );
  }

  const formatCurrencyInput = (value: number): string => {
    if (isNaN(value) || value === null || value === undefined || value === 0) {
      return '';
    }
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const parseCurrencyInput = (inputValue: string): number => {
    if (!inputValue) return 0;
    
    // Remove todos os caracteres que não são dígitos
    const digitsOnly = inputValue.replace(/\D/g, '');
    
    // Se não há dígitos, retorna 0
    if (!digitsOnly) return 0;
    
    // Converte para número dividindo por 100 (para considerar os centavos)
    const numericValue = parseInt(digitsOnly) / 100;
    
    return numericValue;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Parse do valor digitado
    const numericValue = parseCurrencyInput(inputValue);
    
    // Atualiza o estado com o valor numérico
    setFormData({ ...formData, amount: numericValue });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, description: e.target.value });
  };

  const handleTypeChange = (value: 'receita' | 'despesa') => {
    setFormData({ 
      ...formData, 
      type: value,
      category: '' // Reset category when changing type
    });
  };

  const handleCategoryChange = (value: string) => {
    setFormData({ ...formData, category: value });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, dueDate: e.target.value });
  };

  const handleParcellasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    setFormData({ ...formData, qtd_parcelas: value });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="description" className="text-slate-700">Descrição</Label>
        <Input
          id="description"
          type="text"
          value={formData.description || ''}
          onChange={handleDescriptionChange}
          placeholder="Ex: Aluguel, Salário..."
          className="mt-1"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="amount" className="text-slate-700">Valor</Label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-3 text-slate-400 text-sm font-medium">R$</span>
            <Input
              id="amount"
              type="text"
              value={formatCurrencyInput(formData.amount || 0)}
              onChange={handleAmountChange}
              className="pl-10"
              placeholder="0,00"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="type" className="text-slate-700">Tipo</Label>
          <Select
            value={formData.type || 'despesa'}
            onValueChange={handleTypeChange}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="receita">Receita</SelectItem>
              <SelectItem value="despesa">Despesa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <CategorySelect
        value={formData.category || ''}
        onValueChange={handleCategoryChange}
        categories={categories || []}
        accountType={formData.type || 'despesa'}
        onRefresh={onRefreshCategories}
        onAddCategory={onAddCategory}
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dueDate" className="text-slate-700">Data de Início</Label>
          <div className="relative mt-1">
            <Calendar size={16} className="absolute left-3 top-3 text-slate-400" />
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate || ''}
              onChange={handleDateChange}
              className="pl-10"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="qtd_parcelas" className="text-slate-700">Parcelas</Label>
          <Input
            id="qtd_parcelas"
            type="number"
            min="1"
            max="60"
            value={formData.qtd_parcelas || 1}
            onChange={handleParcellasChange}
            className="mt-1"
            placeholder="1"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Cancelar
        </Button>
          <Button
            type="submit"
            className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
          >
            {isEditing ? 'Atualizar' : 
             (formData.qtd_parcelas && formData.qtd_parcelas > 1) ? 
             `Criar ${formData.qtd_parcelas} Parcelas` : 
             'Criar'}
          </Button>
      </div>
    </form>
  );
};
