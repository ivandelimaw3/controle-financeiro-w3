
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreditCardsOptions } from '@/hooks/useCreditCardsOptions';
import { useCategoriesData } from '@/hooks/useCategoriesData';
import { useToast } from '@/hooks/use-toast';
import type { CardAccountData, CardAccountFormData } from '@/hooks/useCardAccountsData';

interface CardAccountFormProps {
  account?: CardAccountData | null;
  onSubmit: (data: CardAccountFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const CardAccountForm = ({ account, onSubmit, onCancel, isLoading }: CardAccountFormProps) => {
  const { cards } = useCreditCardsOptions();
  const { categories } = useCategoriesData();
  const { toast } = useToast();

  const [formData, setFormData] = useState<CardAccountFormData>({
    creditcard_id: 0,
    description: '',
    amount: 0,
    category: '',
    due_date: '',
    data_conta: '',
    status: 'pendente',
    parcela: '',
    recorrente_id: ''
  });

  useEffect(() => {
    if (account) {
      setFormData({
        creditcard_id: account.creditcard_id,
        description: account.description,
        amount: account.amount,
        category: account.category,
        due_date: account.due_date,
        data_conta: account.data_conta || '',
        status: account.status,
        parcela: account.parcela || '',
        recorrente_id: account.recorrente_id || ''
      });
    }
  }, [account]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.creditcard_id || formData.creditcard_id === 0) {
      toast({
        title: "Erro de validação",
        description: "Selecione um cartão de crédito",
        variant: "destructive",
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: "Erro de validação", 
        description: "Preencha a descrição",
        variant: "destructive",
      });
      return;
    }

    if (!formData.category) {
      toast({
        title: "Erro de validação",
        description: "Selecione uma categoria",
        variant: "destructive",
      });
      return;
    }

    if (formData.amount <= 0) {
      toast({
        title: "Erro de validação",
        description: "O valor deve ser maior que zero",
        variant: "destructive",
      });
      return;
    }

    if (!formData.due_date) {
      toast({
        title: "Erro de validação",
        description: "Selecione a data de vencimento",
        variant: "destructive",
      });
      return;
    }

    console.log('Submetendo dados do formulário:', formData);
    onSubmit(formData);
  };

  const handleChange = (field: keyof CardAccountFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="creditcard_id">Cartão de Crédito *</Label>
        <Select
          value={formData.creditcard_id.toString()}
          onValueChange={(value) => handleChange('creditcard_id', parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um cartão" />
          </SelectTrigger>
          <SelectContent>
            {cards.map((card) => (
              <SelectItem key={card.id} value={card.id}>
                {card.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição *</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Descrição da conta"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Categoria *</Label>
        <Select
          value={formData.category}
          onValueChange={(value) => handleChange('category', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.name}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Valor *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
            placeholder="0,00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="due_date">Data de Vencimento *</Label>
          <Input
            id="due_date"
            type="date"
            value={formData.due_date}
            onChange={(e) => handleChange('due_date', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="data_conta">Data da Conta</Label>
          <Input
            id="data_conta"
            type="date"
            value={formData.data_conta}
            onChange={(e) => handleChange('data_conta', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="pago">Pago</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="parcela">Parcela</Label>
        <Input
          id="parcela"
          value={formData.parcela}
          onChange={(e) => handleChange('parcela', e.target.value)}
          placeholder="Ex: 1/12"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : account ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
};
