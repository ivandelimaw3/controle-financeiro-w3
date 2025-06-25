
import React, { useState } from 'react';
import { RefreshCw, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Category } from '@/hooks/useCategoriesData';

interface CategorySelectProps {
  value: string;
  onValueChange: (value: string) => void;
  categories: Category[];
  accountType: 'receita' | 'despesa';
  onRefresh: () => void;
  onAddCategory?: (categoryData: { name: string; type: 'receita' | 'despesa'; color: string }) => void;
}

export const CategorySelect: React.FC<CategorySelectProps> = ({
  value,
  onValueChange,
  categories,
  accountType,
  onRefresh,
  onAddCategory
}) => {
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const filteredCategories = categories.filter(cat => cat.type === accountType);

  const handleAddNewCategory = async () => {
    if (!newCategoryName.trim() || !onAddCategory) return;

    const defaultColors = {
      receita: '#10B981', // Verde para receitas
      despesa: '#EF4444'  // Vermelho para despesas
    };

    try {
      await onAddCategory({
        name: newCategoryName.trim(),
        type: accountType,
        color: defaultColors[accountType]
      });
      
      // Limpar o input e fechar
      setNewCategoryName('');
      setShowNewCategoryInput(false);
      
      // Selecionar a nova categoria automaticamente
      onValueChange(newCategoryName.trim());
      
      // Fazer refresh para garantir que a lista está atualizada
      setTimeout(() => {
        onRefresh();
      }, 100);
      
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddNewCategory();
    }
    if (e.key === 'Escape') {
      setShowNewCategoryInput(false);
      setNewCategoryName('');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <Label htmlFor="category" className="text-slate-700">Categoria</Label>
        <div className="flex gap-1">
          {onAddCategory && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowNewCategoryInput(!showNewCategoryInput)}
              className="h-6 w-6 p-0"
              title="Adicionar nova categoria"
            >
              <Plus size={14} />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className="h-6 w-6 p-0"
            title="Atualizar lista de categorias"
          >
            <RefreshCw size={14} />
          </Button>
        </div>
      </div>

      {showNewCategoryInput && (
        <div className="flex gap-2 mt-1 mb-2">
          <Input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={`Nova categoria de ${accountType}`}
            className="flex-1"
            autoFocus
          />
          <Button
            type="button"
            size="sm"
            onClick={handleAddNewCategory}
            disabled={!newCategoryName.trim()}
            className="px-3"
          >
            Adicionar
          </Button>
        </div>
      )}

      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="mt-1">
          <SelectValue placeholder="Selecione uma categoria" />
        </SelectTrigger>
        <SelectContent>
          {filteredCategories.length === 0 ? (
            <SelectItem value="" disabled>
              Nenhuma categoria de {accountType} encontrada
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
  );
};
