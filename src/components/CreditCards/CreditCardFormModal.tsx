import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, CreditCardInput } from '@/hooks/useCreditCards';

interface CreditCardFormModalProps {
  card?: CreditCard;
  onSubmit: (data: CreditCardInput & { id?: number }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const CreditCardFormModal: React.FC<CreditCardFormModalProps> = ({
  card,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    card_name: '',
    card_number: '',
    holder_name: '',
    expiry_date: '',
    due_date: '',
    credit_limit: '',
    current_value: '',
    bank_name: '',
    card_brand: 'visa',
  });

  useEffect(() => {
    if (card) {
      setFormData({
        card_name: card.card_name,
        card_number: card.card_number,
        holder_name: card.holder_name,
        expiry_date: card.expiry_date,
        due_date: card.due_date || '',
        credit_limit: card.credit_limit.toString(),
        current_value: card.current_value.toString(),
        bank_name: card.bank_name || '',
        card_brand: card.card_brand,
      });
    }
  }, [card]);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 16);
    return numbers.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiryDate = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 6);
    if (numbers.length >= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    } else if (numbers.length >= 2) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    }
    return numbers;
  };

  const handleExpiryDateChange = (value: string) => {
    const formatted = formatExpiryDate(value);
    handleChange('expiry_date', formatted);
  };

  const availableLimit = (parseFloat(formData.credit_limit) || 0) - (parseFloat(formData.current_value) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const credit_limit = parseFloat(formData.credit_limit) || 0;
    const current_value = parseFloat(formData.current_value) || 0;

    if (current_value > credit_limit) {
      alert('O valor atual não pode ser maior que o limite de crédito.');
      return;
    }

    const dataToSubmit: CreditCardInput & { id?: number } = {
      ...formData,
      credit_limit,
      current_value,
    };

    if (card?.id) {
      dataToSubmit.id = card.id;
    }

    onSubmit(dataToSubmit);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="holder_name">Nome do Usuário *</Label>
        <Input
          id="holder_name"
          type="text"
          value={formData.holder_name}
          onChange={e => handleChange('holder_name', e.target.value)}
          placeholder="Nome do titular do cartão"
          required
        />
      </div>

      <div>
        <Label htmlFor="card_name">Nome do Cartão *</Label>
        <Input
          id="card_name"
          type="text"
          value={formData.card_name}
          onChange={e => handleChange('card_name', e.target.value)}
          placeholder="Ex: Nubank Roxinho"
          required
        />
      </div>

      <div>
        <Label htmlFor="card_number">Número do Cartão *</Label>
        <Input
          id="card_number"
          type="text"
          maxLength={19}
          value={formatCardNumber(formData.card_number)}
          onChange={e => handleChange('card_number', e.target.value.replace(/\D/g, ''))}
          placeholder="1234 5678 9012 3456"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="expiry_date">Data de Validade *</Label>
          <Input
            id="expiry_date"
            type="text"
            maxLength={7}
            value={formData.expiry_date}
            onChange={e => handleExpiryDateChange(e.target.value)}
            placeholder="MM/AAAA"
            required
          />
        </div>
        <div>
          <Label htmlFor="due_date">Dia do Vencimento</Label>
          <Input
            id="due_date"
            type="text"
            value={formData.due_date}
            onChange={e => handleChange('due_date', e.target.value)}
            placeholder="Dia 20"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="credit_limit">Limite de Crédito *</Label>
          <Input
            id="credit_limit"
            type="text"
            inputMode="decimal"
            value={formData.credit_limit}
            onChange={e => handleChange('credit_limit', e.target.value)}
            placeholder="5000.00"
            required
          />
        </div>
        <div>
          <Label htmlFor="current_value">Valor Atual</Label>
          <Input
            id="current_value"
            type="text"
            inputMode="decimal"
            value={formData.current_value}
            onChange={e => handleChange('current_value', e.target.value)}
            placeholder="1200.00"
          />
        </div>
      </div>

      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
        <span className="text-sm font-medium text-gray-700">Limite Disponível:</span>
        <span className="text-sm font-bold text-green-600">
          {new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(availableLimit)}
        </span>
      </div>

      <div className="flex space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
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
          {isLoading ? 'Salvando...' : 'Salvar Cartão'}
        </Button>
      </div>
    </form>
  );
};
