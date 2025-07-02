import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import { useCategoriesData, Category } from '@/hooks/useCategoriesData';

const Categorias: React.FC = () => {
  const { categories, loading, addCategory, updateCategory, deleteCategory, refreshCategories } = useCategoriesData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();
  const [formData, setFormData] = useState({ 
    name: '', 
    type: 'despesa' as 'receita' | 'despesa', 
    color: '#3B82F6',
    parent_id: null as number | null
  });
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  const colorOptions = [
    '#3B82F6', '#10B981', '#EF4444', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'
  ];

  const toggleExpanded = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      return;
    }

    if (editingCategory) {
      await updateCategory({
        ...formData,
        id: editingCategory.id
      } as Category);
    } else {
      await addCategory({
        name: formData.name,
        type: formData.type,
        color: formData.color,
        parent_id: formData.parent_id
      });
    }
    
    setIsModalOpen(false);
    setEditingCategory(undefined);
    setFormData({ name: '', type: 'despesa', color: '#3B82F6', parent_id: null });
    refreshCategories();
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({ 
      name: category.name, 
      type: category.type, 
      color: category.color,
      parent_id: category.parent_id || null
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    await deleteCategory(id);
    refreshCategories();
  };

  const handleNewCategory = (parentId?: number) => {
    setEditingCategory(undefined);
    setFormData({ 
      name: '', 
      type: 'despesa', 
      color: '#3B82F6',
      parent_id: parentId || null
    });
    setIsModalOpen(true);
  };

  const renderCategoryTree = (category: Category, level = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);

    return (
      <div key={category.id} className="space-y-2">
        <div 
          className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
            category.type === 'receita' ? 'bg-green-50' : 'bg-red-50'
          }`}
          style={{ marginLeft: level * 20 }}
        >
          <div className="flex items-center gap-3">
            {hasChildren && (
              <button
                onClick={() => toggleExpanded(category.id)}
                className="p-1 hover:bg-white rounded transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown size={16} className="text-slate-600" />
                ) : (
                  <ChevronRight size={16} className="text-slate-600" />
                )}
              </button>
            )}
            {!hasChildren && level > 0 && <div className="w-6" />}
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: category.color }}
            />
            <span className={`font-medium text-slate-800 ${level > 0 ? 'text-sm' : 'text-base'}`}>
              {category.name}
            </span>
          </div>
          <div className="flex gap-2">
            {level === 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNewCategory(category.id)}
                className="hover:bg-green-50 text-xs"
                title="Adicionar subcategoria"
              >
                <Plus size={12} className="mr-1" />
                Sub
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEdit(category)}
              className="hover:bg-blue-50"
            >
              <Edit size={14} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(category.id)}
              className="hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-2">
            {category.children?.map(child => renderCategoryTree(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const receitaCategories = categories.filter(cat => cat.type === 'receita');
  const despesaCategories = categories.filter(cat => cat.type === 'despesa');

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-lg text-slate-600">Carregando categorias...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Categorias</h1>
            <p className="text-slate-600">Organize suas transações por categorias hierárquicas</p>
          </div>
          <Button
            onClick={() => handleNewCategory()}
            className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
          >
            <Plus size={20} className="mr-2" />
            Nova Categoria
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Despesas */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
            <h2 className="text-xl font-semibold text-red-700 mb-4 flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              📂 Despesas
            </h2>
            <div className="space-y-3">
              {despesaCategories.length === 0 ? (
                <p className="text-slate-500 text-center py-4">Nenhuma categoria de despesa encontrada</p>
              ) : (
                despesaCategories.map(category => renderCategoryTree(category))
              )}
            </div>
          </div>

          {/* Receitas */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
            <h2 className="text-xl font-semibold text-green-700 mb-4 flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              💰 Receitas
            </h2>
            <div className="space-y-3">
              {receitaCategories.length === 0 ? (
                <p className="text-slate-500 text-center py-4">Nenhuma categoria de receita encontrada</p>
              ) : (
                receitaCategories.map(category => renderCategoryTree(category))
              )}
            </div>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-slate-800">
                  {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-slate-700">Nome</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Alimentação, Trabalho..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="type" className="text-slate-700">Tipo</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: 'receita' | 'despesa') => setFormData({ ...formData, type: value })}
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

                <div>
                  <Label className="text-slate-700">Cor</Label>
                  <div className="grid grid-cols-8 gap-2 mt-2">
                    {colorOptions.map(color => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 ${
                          formData.color === color ? 'border-slate-400' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData({ ...formData, color })}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
                  >
                    {editingCategory ? 'Atualizar' : 'Criar'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Categorias;