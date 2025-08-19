
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Account, CreateAccountData } from '@/hooks/useAccountsData';
import { useCategoriesData } from '@/hooks/useCategoriesData';
import { useBanksOptions } from '@/hooks/useBanksOptions';
import { useCardsOptions } from '@/hooks/useCardsOptions';

interface AccountModalProps {
  account?: Account;
  onSubmit: (data: CreateAccountData) => void;
  onClose: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  account,
  onSubmit,
  onClose
}) => {
  const { categories } = useCategoriesData();
  const { banksOptions, loading: loadingBanks } = useBanksOptions();
  const { cardsOptions, loading: loadingCards } = useCardsOptions();
  
  const [formData, setFormData] = useState<CreateAccountData>({
    description: '',
    amount: 0,
    type: 'despesa',
    category: '',
    due_date: '',
    data_conta: '',
    status: 'pendente',
    parcela: '',
    bank_id: 0,
    creditcards_id: 0,
    payment_source: 'bank',
    payment_source_id: 0,
    payment_source_name: '',
    recorrente_id: ''
  });

  useEffect(() => {
    if (account) {
      setFormData({
        description: account.description,
        amount: account.amount,
        type: account.type as 'receita' | 'despesa',
        category: account.category,
        due_date: account.due_date,
        data_conta: account.data_conta || '',
        status: account.status as 'pendente' | 'pago' | 'vencida' | 'recebido',
        parcela: account.parcela || '',
        bank_id: account.bank_id || 0,
        creditcards_id: account.creditcards_id || 0,
        payment_source: account.payment_source as 'bank',
        payment_source_id: account.payment_source_id || 0,
        payment_source_name: account.payment_source_name || '',
        recorrente_id: account.recorrente_id || ''
      });
    }
  }, [account]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.amount || !formData.category || !formData.due_date) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    onSubmit(formData);
  };

  const handleInputChange = (field: keyof CreateAccountData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getPaymentSourceOptions = () => {
    if (formData.payment_source === 'bank') {
      return banksOptions;
    } else {
      return cardsOptions;
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{account ? 'Editar Conta' : 'Nova Conta'}</span>
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
            <Label htmlFor="type">Tipo *</Label>
            <Select
              value={formData.type}
              onValueChange={(value: 'receita' | 'despesa') => handleInputChange('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="receita">Receita</SelectItem>
                <SelectItem value="despesa">Despesa</SelectItem>
              </SelectContent>
            </Select>
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
                {categories
                  .filter(cat => cat.type === formData.type)
                  .map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
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
            <Label htmlFor="payment_source">Fonte de Pagamento</Label>
            <Select
              value={formData.payment_source}
              onValueChange={(value: 'bank') => {
                handleInputChange('payment_source', value);
                handleInputChange('payment_source_id', 0);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank">Banco</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_source_id">Selecionar {formData.payment_source === 'bank' ? 'Banco' : 'Cartão'}</Label>
            <Select
              value={formData.payment_source_id?.toString() || ''}
              onValueChange={(value) => {
                const selectedId = parseInt(value);
                handleInputChange('payment_source_id', selectedId);
                
                const options = getPaymentSourceOptions();
                const selectedOption = options.find(opt => opt.id === selectedId.toString());
                handleInputChange('payment_source_name', selectedOption?.name || '');
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Selecione ${formData.payment_source === 'bank' ? 'o banco' : 'o cartão'}`} />
              </SelectTrigger>
              <SelectContent>
                {(loadingBanks || loadingCards) ? (
                  <SelectItem value="0" disabled>Carregando...</SelectItem>
                ) : (
                  getPaymentSourceOptions().map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: 'pendente' | 'pago' | 'vencida' | 'recebido') => handleInputChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="vencida">Vencida</SelectItem>
                <SelectItem value="recebido">Recebido</SelectItem>
              </SelectContent>
            </Select>
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

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {account ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
