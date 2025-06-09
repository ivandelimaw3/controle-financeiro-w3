
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
}

interface AccountFormProps {
  formData: Account;
  setFormData: React.Dispatch<React.SetStateAction<Account>>;
  categories: Category[];
  onRefreshCategories: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEditing: boolean;
}

export const AccountForm: React.FC<AccountFormProps> = ({
  formData,
  setFormData,
  categories,
  onRefreshCategories,
  onSubmit,
  onCancel,
  isEditing
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="description" className="text-slate-700">Descrição</Label>
        <Input
          id="description"
          type="text"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Ex: Aluguel, Salário..."
          className="mt-1"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="amount" className="text-slate-700">Valor</Label>
          <div className="relative mt-1">
            <DollarSign size={16} className="absolute left-3 top-3 text-slate-400" />
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              className="pl-10"
              placeholder="0,00"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="type" className="text-slate-700">Tipo</Label>
          <Select
            value={formData.type}
            onValueChange={(value: 'receita' | 'despesa') => {
              setFormData({ 
                ...formData, 
                type: value,
                category: ''
              });
            }}
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
        value={formData.category}
        onValueChange={(value) => setFormData({ ...formData, category: value })}
        categories={categories}
        accountType={formData.type}
        onRefresh={onRefreshCategories}
      />

      <div>
        <Label htmlFor="dueDate" className="text-slate-700">Data de Vencimento</Label>
        <div className="relative mt-1">
          <Calendar size={16} className="absolute left-3 top-3 text-slate-400" />
          <Input
            id="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            className="pl-10"
            required
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
          {isEditing ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
};
