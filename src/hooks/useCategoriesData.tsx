
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Category {
  id: number;
  name: string;
  type: 'receita' | 'despesa';
  color: string;
}

export const useCategoriesData = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Carregar categorias do Supabase
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar categorias:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as categorias.",
          variant: "destructive"
        });
        return;
      }

      // Transformar dados do Supabase para o formato esperado
      const transformedCategories: Category[] = data.map(category => ({
        id: category.id,
        name: category.name,
        type: category.type as 'receita' | 'despesa',
        color: category.color
      }));

      setCategories(transformedCategories);
      console.log('Categorias carregadas do Supabase:', transformedCategories.length, 'categorias');
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as categorias.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Adicionar nova categoria
  const addCategory = async (categoryData: Omit<Category, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{
          name: categoryData.name,
          type: categoryData.type,
          color: categoryData.color,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar categoria:', error);
        toast({
          title: "Erro",
          description: "Não foi possível criar a categoria.",
          variant: "destructive"
        });
        return;
      }

      // Transformar e adicionar à lista local
      const newCategory: Category = {
        id: data.id,
        name: data.name,
        type: data.type as 'receita' | 'despesa',
        color: data.color
      };

      setCategories(prev => [newCategory, ...prev]);
      
      toast({
        title: "Sucesso",
        description: "Categoria criada com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a categoria.",
        variant: "destructive"
      });
    }
  };

  // Atualizar categoria
  const updateCategory = async (updatedCategory: Category) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({
          name: updatedCategory.name,
          type: updatedCategory.type,
          color: updatedCategory.color
        })
        .eq('id', updatedCategory.id);

      if (error) {
        console.error('Erro ao atualizar categoria:', error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar a categoria.",
          variant: "destructive"
        });
        return;
      }

      setCategories(prev => prev.map(cat => 
        cat.id === updatedCategory.id ? updatedCategory : cat
      ));

      toast({
        title: "Sucesso",
        description: "Categoria atualizada com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a categoria.",
        variant: "destructive"
      });
    }
  };

  // Deletar categoria
  const deleteCategory = async (id: number) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar categoria:', error);
        toast({
          title: "Erro",
          description: "Não foi possível excluir a categoria.",
          variant: "destructive"
        });
        return;
      }

      setCategories(prev => prev.filter(cat => cat.id !== id));

      toast({
        title: "Sucesso",
        description: "Categoria excluída com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a categoria.",
        variant: "destructive"
      });
    }
  };

  // Carregar categorias ao montar o componente
  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    refreshCategories: fetchCategories
  };
};
