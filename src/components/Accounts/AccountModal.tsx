
import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Tag, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCategoriesData } from '@/hooks/useCategoriesData';

interface Account {
  id?: number;
  description: string;
  amount: number;
  category: string;
  dueDate: string;
  type: 'receita' | 'despesa';
  status: 'pendente' | 'pago' | 'recebido';
}

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (account: Account) => void;
  account?: Account;
  categories?: string[]; // Manter para compatibilidade, mas usar as do hook
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  onSave,
  account
}) => {
  const { categories: categoriesFromDB, refreshCategories } = useCategoriesData();
  const [formData, setFormData] = useState<Account>({
    description: '',
    amount: 0,
    category: '',
    dueDate: '',
    type: 'despesa',
    status: 'pendente'
  });

  // Atualizar formData quando account mudar
  useEffect(() => {
    if (account) {
      setFormData({
        ...account,
        amount: Math.abs(account.amount) // Sempre mostrar valor positivo no formulário
      });
    } else {
      setFormData({
        description: '',
        amount: 0,
        category: '',
        dueDate: '',
        type: 'despesa',
        status: 'pendente'
      });
    }
  }, [account]);

  // Recarregar categorias quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      refreshCategories();
    }
  }, [isOpen, refreshCategories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ajustar o valor baseado no tipo antes de salvar
    const finalAmount = formData.type === 'despesa' ? -Math.abs(formData.amount) : Math.abs(formData.amount);
    
    onSave({
      ...formData,
      amount: finalAmount
    });
    onClose();
  };

  // Filtrar categorias baseado no tipo selecionado
  const filteredCategories = categoriesFromDB.filter(cat => cat.type === formData.type);

  const handleRefreshCategories = () => {
    refreshCategories();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-800">
            {account ? 'Editar Conta' : 'Nova Conta'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                    category: '' // Limpar categoria ao mudar tipo
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

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="category" className="text-slate-700">Categoria</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRefreshCategories}
                className="h-6 w-6 p-0"
              >
                <RefreshCw size={14} />
              </Button>
            </div>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.length === 0 ? (
                  <SelectItem value="" disabled>
                    Nenhuma categoria de {formData.type} encontrada
                  </SelectItem>
                ) : (
                  filteredCategories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        ></div>
                        {category.name}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

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
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
            >
              {account ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
