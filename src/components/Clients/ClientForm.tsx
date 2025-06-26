
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Client } from '@/hooks/useClientsData';

interface ClientFormProps {
  client?: Client;
  onSubmit: (data: Omit<Client, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

// Função para aplicar máscara de telefone
const formatPhone = (value: string) => {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');
  
  // Aplica a máscara (11)99999-9999
  if (numbers.length <= 2) {
    return `(${numbers}`;
  } else if (numbers.length <= 7) {
    return `(${numbers.slice(0, 2)})${numbers.slice(2)}`;
  } else {
    return `(${numbers.slice(0, 2)})${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  }
};

// Função para aplicar máscara de CPF
const formatCPF = (value: string) => {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');
  
  // Aplica a máscara 000.000.000-00
  if (numbers.length <= 3) {
    return numbers;
  } else if (numbers.length <= 6) {
    return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  } else if (numbers.length <= 9) {
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  } else {
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  }
};

export const ClientForm: React.FC<ClientFormProps> = ({ 
  client, 
  onSubmit, 
  onCancel, 
  isLoading 
}) => {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: {
      name: client?.name || '',
      email: client?.email || '',
      phone: client?.phone || '',
      cpf: client?.cpf || '',
      address: client?.address || '',
    }
  });

  const phoneValue = watch('phone');
  const cpfValue = watch('cpf');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setValue('phone', formatted);
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setValue('cpf', formatted);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome *</Label>
        <Input
          id="name"
          {...register('name', { required: 'Nome é obrigatório' })}
          placeholder="Nome do cliente"
        />
        {errors.name && (
          <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          placeholder="email@exemplo.com"
        />
      </div>

      <div>
        <Label htmlFor="phone">Telefone</Label>
        <Input
          id="phone"
          value={phoneValue}
          onChange={handlePhoneChange}
          placeholder="(11) 99999-9999"
          maxLength={14}
        />
      </div>

      <div>
        <Label htmlFor="cpf">CPF</Label>
        <Input
          id="cpf"
          value={cpfValue}
          onChange={handleCPFChange}
          placeholder="000.000.000-00"
          maxLength={14}
        />
      </div>

      <div>
        <Label htmlFor="address">Endereço</Label>
        <Textarea
          id="address"
          {...register('address')}
          placeholder="Endereço completo do cliente"
          rows={3}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
        >
          {isLoading ? 'Salvando...' : client ? 'Atualizar' : 'Adicionar'}
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
