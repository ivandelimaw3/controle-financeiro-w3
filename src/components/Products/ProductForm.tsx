
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Product } from '@/hooks/useProductsData';

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: Omit<Product, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({ 
  product, 
  onSubmit, 
  onCancel, 
  isLoading 
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: product?.name || '',
      type: product?.type || '',
      model: product?.model || '',
      manufacturer: product?.manufacturer || '',
      serial_number: product?.serial_number || '',
      observations: product?.observations || '',
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome *</Label>
        <Input
          id="name"
          {...register('name', { required: 'Nome é obrigatório' })}
          placeholder="Nome do produto"
        />
        {errors.name && (
          <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="type">Tipo *</Label>
        <Input
          id="type"
          {...register('type', { required: 'Tipo é obrigatório' })}
          placeholder="Ex: Smartphone, Notebook, TV"
        />
        {errors.type && (
          <p className="text-sm text-red-600 mt-1">{errors.type.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="model">Modelo</Label>
        <Input
          id="model"
          {...register('model')}
          placeholder="Modelo do produto"
        />
      </div>

      <div>
        <Label htmlFor="manufacturer">Fabricante</Label>
        <Input
          id="manufacturer"
          {...register('manufacturer')}
          placeholder="Fabricante do produto"
        />
      </div>

      <div>
        <Label htmlFor="serial_number">Número de Série</Label>
        <Input
          id="serial_number"
          {...register('serial_number')}
          placeholder="Número de série do produto"
        />
      </div>

      <div>
        <Label htmlFor="observations">Observações</Label>
        <Textarea
          id="observations"
          {...register('observations')}
          placeholder="Observações sobre o produto"
          rows={3}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
        >
          {isLoading ? 'Salvando...' : product ? 'Atualizar' : 'Adicionar'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
};
