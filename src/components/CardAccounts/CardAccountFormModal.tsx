
import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CardAccount, CardAccountFormData } from '@/hooks/useCardAccounts';
import { useCategoriesData } from '@/hooks/useCategoriesData';
import { useCreditCardsOptions } from '@/hooks/useCreditCardsOptions';

interface CardAccountFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CardAccountFormData) => void;
  cardAccount?: CardAccount;
  isLoading?: boolean;
}

export const CardAccountFormModal: React.FC<CardAccountFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  cardAccount,
  isLoading = false
}) => {
  const { categories } = useCategoriesData();
  const { cards } = useCreditCardsOptions();

  const [formData, setFormData] = useState<CardAccountFormData>({
    description: '',
    amount: 0,
    due_date: '',
    category_id: 0,
    card_id: 0,
    status: 'pendente',
    payment_source: 'card',
    payment_source_id: 0,
    payment_source_name: '',
    data_conta: ''
  });

  useEffect(() => {
    if (cardAccount) {
      setFormData({
        description: cardAccount.description,
        amount: cardAccount.amount,
        due_date: cardAccount.due_date,
        category_id: cardAccount.category_id,
        card_id: cardAccount.card_id,
        status: cardAccount.status,
        payment_source: cardAccount.payment_source || 'card',
        payment_source_id: cardAccount.payment_source_id || cardAccount.card_id,
        payment_source_name: cardAccount.payment_source_name || cardAccount.card_name || '',
        data_conta: cardAccount.data_conta || ''
      });
    } else {
      setFormData({
        description: '',
        amount: 0,
        due_date: '',
        category_id: 0,
        card_id: 0,
        status: 'pendente',
        payment_source: 'card',
        payment_source_id: 0,
        payment_source_name: '',
        data_conta: ''
      });
    }
  }, [cardAccount, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof CardAccountFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCardChange = (cardId: string) => {
    const selectedCard = cards.find(card => card.id === cardId);
    if (selectedCard) {
      setFormData(prev => ({
        ...prev,
        card_id: parseInt(cardId),
        payment_source_id: parseInt(cardId),
        payment_source_name: selectedCard.name
      }));
    }
  };

  const despesaCategories = categories.filter(cat => cat.type === 'despesa');
  const selectedCard = cards.find(card => card.id === formData.card_id.toString());

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {cardAccount ? 'Editar Conta de Cartão' : 'Nova Conta de Cartão'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Descrição */}
          <div>
            <Label htmlFor="description">Descrição *</Label>
            <Input
              id="description"
              type="text"
              value={formData.description}
              onChange={e => handleChange('description', e.target.value)}
              placeholder="Descrição da conta"
              required
            />
          </div>

          {/* Data da Compra e Data de Vencimento */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="data_conta">Data da Compra</Label>
              <Input
                id="data_conta"
                type="date"
                value={formData.data_conta}
                onChange={e => handleChange('data_conta', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="due_date">Data de Vencimento *</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={e => handleChange('due_date', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Categoria */}
          <div>
            <Label htmlFor="category_id">Categoria *</Label>
            <Select 
              value={formData.category_id.toString()} 
              onValueChange={value => handleChange('category_id', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {despesaCategories.map(category => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fonte de Pagamento e Cartão de Crédito */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="payment_source">Fonte de Pagamento</Label>
              <Input
                id="payment_source"
                type="text"
                value="Cartão"
                readOnly
                className="bg-gray-100 cursor-not-allowed"
              />
            </div>
            <div>
              <Label htmlFor="card_id">Cartão de Crédito *</Label>
              <Select 
                value={formData.card_id.toString()} 
                onValueChange={handleCardChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cartão" />
                </SelectTrigger>
                <SelectContent>
                  {cards.map(card => (
                    <SelectItem key={card.id} value={card.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{card.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Mostrar informações do cartão selecionado */}
          {selectedCard && (
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-blue-700">Cartão: {selectedCard.name}</span>
                <span className="text-sm text-blue-600">
                  Usado: {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(selectedCard.current_value)}
                </span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-sm font-medium text-blue-700">Limite Disponível:</span>
                <span className="text-sm font-bold text-blue-600">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format((selectedCard.credit_limit || 0) - (selectedCard.current_value || 0))}
                </span>
              </div>
            </div>
          )}

          {/* Valor e Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Valor *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={e => handleChange('amount', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={value => handleChange('status', value as 'pendente' | 'pago')}
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

          <div className="flex space-x-3 pt-4">
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
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
