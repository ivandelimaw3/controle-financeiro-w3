
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CardAccount, CreateCardAccountData } from '@/hooks/useCardAccountsData';
import { useCreditCardsOptions } from '@/hooks/useCreditCardsOptions';

interface CardAccountModalProps {
  cardAccount?: CardAccount;
  onSubmit: (data: CreateCardAccountData) => void;
  onClose: () => void;
}

export const CardAccountModal: React.FC<CardAccountModalProps> = ({
  cardAccount,
  onSubmit,
  onClose
}) => {
  const { cardsOptions, loading: loadingCards } = useCreditCardsOptions();
  
  const [formData, setFormData] = useState<CreateCardAccountData>({
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
    if (cardAccount) {
      setFormData({
        creditcard_id: cardAccount.creditcard_id,
        description: cardAccount.description,
        amount: cardAccount.amount,
        category: cardAccount.category,
        due_date: cardAccount.due_date,
        data_conta: cardAccount.data_conta || '',
        status: cardAccount.status,
        parcela: cardAccount.parcela || '',
        recorrente_id: cardAccount.recorrente_id || ''
      });
    }
  }, [cardAccount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.creditcard_id || !formData.description || !formData.amount || !formData.category || !formData.due_date) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    onSubmit(formData);
  };

  const handleInputChange = (field: keyof CreateCardAccountData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{cardAccount ? 'Editar Conta de Cartão' : 'Nova Conta de Cartão'}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="creditcard_id">Cartão de Crédito *</Label>
            <Select
              value={formData.creditcard_id.toString()}
              onValueChange={(value) => handleInputChange('creditcard_id', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o cartão" />
              </SelectTrigger>
              <SelectContent>
                {loadingCards ? (
                  <SelectItem value="0" disabled>Carregando cartões...</SelectItem>
                ) : (
                  cardsOptions.map((card) => (
                    <SelectItem key={card.id} value={card.id}>
                      {card.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Digite a descrição da conta"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
              placeholder="0,00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleInputChange('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alimentacao">Alimentação</SelectItem>
                <SelectItem value="transporte">Transporte</SelectItem>
                <SelectItem value="lazer">Lazer</SelectItem>
                <SelectItem value="saude">Saúde</SelectItem>
                <SelectItem value="educacao">Educação</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="due_date">Data de Vencimento *</Label>
            <Input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) => handleInputChange('due_date', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="data_conta">Data da Conta</Label>
            <Input
              id="data_conta"
              type="date"
              value={formData.data_conta}
              onChange={(e) => handleInputChange('data_conta', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parcela">Parcela</Label>
            <Input
              id="parcela"
              value={formData.parcela}
              onChange={(e) => handleInputChange('parcela', e.target.value)}
              placeholder="Ex: 1/12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: 'pendente' | 'pago') => handleInputChange('status', value)}
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

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {cardAccount ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
