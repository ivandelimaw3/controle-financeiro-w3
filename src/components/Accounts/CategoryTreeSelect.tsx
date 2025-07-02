import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Category } from '@/hooks/useCategoriesData';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface CategoryTreeSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  categories: Category[];
  accountType: 'receita' | 'despesa';
  onRefresh: () => void;
  onAddCategory?: (categoryData: { name: string; type: 'receita' | 'despesa'; color: string; parent_id?: number }) => void;
}

export const CategoryTreeSelect: React.FC<CategoryTreeSelectProps> = ({
  value,
  onValueChange,
  categories,
  accountType,
  onRefresh,
  onAddCategory
}) => {
  const [openGroups, setOpenGroups] = useState<Set<number>>(new Set());
  const [showNewCategoryInput, setShowNewCategoryInput] = useState<number | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');

  const filteredCategories = categories.filter(cat => cat.type === accountType);

  const toggleGroup = (categoryId: number) => {
    const newOpenGroups = new Set(openGroups);
    if (newOpenGroups.has(categoryId)) {
      newOpenGroups.delete(categoryId);
    } else {
      newOpenGroups.add(categoryId);
    }
    setOpenGroups(newOpenGroups);
  };

  const handleAddNewCategory = async (parentId?: number) => {
    if (!newCategoryName.trim() || !onAddCategory) return;

    const parentCategory = parentId ? categories.find(c => c.id === parentId) : null;
    const defaultColors = {
      receita: '#10B981',
      despesa: '#EF4444'
    };

    try {
      await onAddCategory({
        name: newCategoryName.trim(),
        type: accountType,
        color: parentCategory?.color || defaultColors[accountType],
        parent_id: parentId
      });
      
      setNewCategoryName('');
      setShowNewCategoryInput(null);
      onValueChange(newCategoryName.trim());
      
      setTimeout(() => {
        onRefresh();
      }, 100);
      
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, parentId?: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddNewCategory(parentId);
    }
    if (e.key === 'Escape') {
      setShowNewCategoryInput(null);
      setNewCategoryName('');
    }
  };

  const renderCategoryItem = (category: Category, isSubcategory = false) => (
    <div key={category.id} className={`${isSubcategory ? 'ml-6' : ''}`}>
      <div 
        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
          value === category.name 
            ? 'bg-blue-100 border-2 border-blue-500' 
            : 'hover:bg-slate-100 border border-transparent'
        }`}
        onClick={() => onValueChange(category.name)}
      >
        <div className="flex items-center gap-3 flex-1">
          {!isSubcategory && category.children && category.children.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleGroup(category.id);
              }}
              className="p-1 hover:bg-slate-200 rounded"
            >
              {openGroups.has(category.id) ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>
          )}
          {isSubcategory && <div className="w-4" />}
          <div 
            className="w-4 h-4 rounded-full flex-shrink-0" 
            style={{ backgroundColor: category.color }}
          />
          <span className={`font-medium ${isSubcategory ? 'text-sm' : 'text-base'} text-slate-800`}>
            {category.name}
          </span>
        </div>
        {onAddCategory && !isSubcategory && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setShowNewCategoryInput(category.id);
            }}
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
            title="Adicionar subcategoria"
          >
            <Plus size={12} />
          </Button>
        )}
      </div>

      {/* Input para nova subcategoria */}
      {showNewCategoryInput === category.id && (
        <div className="flex gap-2 mt-2 ml-6">
          <Input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => handleKeyPress(e, category.id)}
            placeholder={`Nova subcategoria de ${category.name.replace(/^[🏠🍽️🚗💡👨‍⚕️🏫🛍️🧾💼🎉🐶👶❓💰]\s*/, '')}`}
            className="flex-1 text-sm"
            autoFocus
          />
          <Button
            type="button"
            size="sm"
            onClick={() => handleAddNewCategory(category.id)}
            disabled={!newCategoryName.trim()}
            className="px-3 text-xs"
          >
            Adicionar
          </Button>
        </div>
      )}

      {/* Subcategorias */}
      {category.children && category.children.length > 0 && openGroups.has(category.id) && (
        <div className="mt-2 space-y-1">
          {category.children.map(child => renderCategoryItem(child, true))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-slate-700 font-medium">Categoria</Label>
        <div className="flex gap-1">
          {onAddCategory && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowNewCategoryInput(0)}
              className="h-8 px-2 text-xs"
              title="Adicionar categoria principal"
            >
              <Plus size={14} className="mr-1" />
              Nova
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className="h-8 px-2 text-xs"
            title="Atualizar lista de categorias"
          >
            <RefreshCw size={14} />
          </Button>
        </div>
      </div>

      {/* Input para nova categoria principal */}
      {showNewCategoryInput === 0 && (
        <div className="flex gap-2 p-3 bg-slate-50 rounded-lg">
          <Input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => handleKeyPress(e)}
            placeholder={`Nova categoria principal de ${accountType}`}
            className="flex-1"
            autoFocus
          />
          <Button
            type="button"
            size="sm"
            onClick={() => handleAddNewCategory()}
            disabled={!newCategoryName.trim()}
            className="px-3"
          >
            Adicionar
          </Button>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-lg p-4 max-h-80 overflow-y-auto">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            Nenhuma categoria de {accountType} encontrada
          </div>
        ) : (
          <div className="space-y-2 group">
            {filteredCategories.map(category => renderCategoryItem(category))}
          </div>
        )}
      </div>

      {value && (
        <div className="text-sm text-slate-600 bg-blue-50 p-2 rounded-lg">
          <strong>Selecionado:</strong> {value}
        </div>
      )}
    </div>
  );
};