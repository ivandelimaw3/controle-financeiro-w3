
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: number;
  name: string;
  type: 'receita' | 'despesa';
  color: string;
}

const Categorias: React.FC = () => {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();
  const [formData, setFormData] = useState({ name: '', type: 'despesa' as 'receita' | 'despesa', color: '#3B82F6' });

  const [categories, setCategories] = useState<Category[]>([
    { id: 1, name: 'Trabalho', type: 'receita', color: '#10B981' },
    { id: 2, name: 'Moradia', type: 'despesa', color: '#EF4444' },
    { id: 3, name: 'Utilidades', type: 'despesa', color: '#F59E0B' },
    { id: 4, name: 'Alimentação', type: 'despesa', color: '#8B5CF6' },
    { id: 5, name: 'Transporte', type: 'despesa', color: '#EC4899' },
    { id: 6, name: 'Lazer', type: 'despesa', color: '#6366F1' },
  ]);

  const colorOptions = [
    '#3B82F6', '#10B981', '#EF4444', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'
  ];

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome da categoria é obrigatório.",
        variant: "destructive"
      });
      return;
    }

    if (editingCategory) {
      setCategories(prev => prev.map(cat => 
        cat.id === editingCategory.id 
          ? { ...formData, id: editingCategory.id }
          : cat
      ));
      toast({
        title: "Categoria atualizada",
        description: "A categoria foi atualizada com sucesso.",
      });
    } else {
      const newCategory = {
        ...formData,
        id: Math.max(...categories.map(c => c.id)) + 1
      };
      setCategories(prev => [...prev, newCategory]);
      toast({
        title: "Categoria criada",
        description: "Nova categoria adicionada com sucesso.",
      });
    }
    
    setIsModalOpen(false);
    setEditingCategory(undefined);
    setFormData({ name: '', type: 'despesa', color: '#3B82F6' });
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, type: category.type, color: category.color });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setCategories(prev => prev.filter(cat => cat.id !== id));
    toast({
      title: "Categoria excluída",
      description: "A categoria foi removida com sucesso.",
    });
  };

  const handleNewCategory = () => {
    setEditingCategory(undefined);
    setFormData({ name: '', type: 'despesa', color: '#3B82F6' });
    setIsModalOpen(true);
  };

  const receitaCategories = categories.filter(cat => cat.type === 'receita');
  const despesaCategories = categories.filter(cat => cat.type === 'despesa');

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Categorias</h1>
            <p className="text-slate-600">Organize suas transações por categorias</p>
          </div>
          <Button
            onClick={handleNewCategory}
            className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
          >
            <Plus size={20} className="mr-2" />
            Nova Categoria
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Receitas */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
            <h2 className="text-xl font-semibold text-green-700 mb-4 flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              Receitas
            </h2>
            <div className="space-y-3">
              {receitaCategories.map(category => (
                <div key={category.id} className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <span className="font-medium text-slate-800">{category.name}</span>
                  </div>
                  <div className="flex gap-2">
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
              ))}
            </div>
          </div>

          {/* Despesas */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
            <h2 className="text-xl font-semibold text-red-700 mb-4 flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              Despesas
            </h2>
            <div className="space-y-3">
              {despesaCategories.map(category => (
                <div key={category.id} className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <span className="font-medium text-slate-800">{category.name}</span>
                  </div>
                  <div className="flex gap-2">
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
              ))}
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
                  className="text-slate-400 hover:text-slate-600 transition-colors"
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
