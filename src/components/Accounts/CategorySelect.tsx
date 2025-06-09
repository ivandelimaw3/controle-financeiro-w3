
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Category } from '@/hooks/useCategoriesData';

interface CategorySelectProps {
  value: string;
  onValueChange: (value: string) => void;
  categories: Category[];
  accountType: 'receita' | 'despesa';
  onRefresh: () => void;
}

export const CategorySelect: React.FC<CategorySelectProps> = ({
  value,
  onValueChange,
  categories,
  accountType,
  onRefresh
}) => {
  const filteredCategories = categories.filter(cat => cat.type === accountType);

  return (
    <div>
      <div className="flex items-center justify-between">
        <Label htmlFor="category" className="text-slate-700">Categoria</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          className="h-6 w-6 p-0"
        >
          <RefreshCw size={14} />
        </Button>
      </div>
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
