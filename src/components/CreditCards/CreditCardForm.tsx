import React, { useEffect, useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Label } from '../ui/Label';

function formatCardNumber(value: string) {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{4})(?=\d)/g, '$1 ')
    .trim();
}

interface CreditCard {
  card_name: string;
  card_number: string;
  expiry_date: string;
  current_value: number;
  bank_name?: string;
  due_date: string;
}

interface CreditCardInput {
  card_name: string;
  card_number: string;
  expiry_date: string;
  current_value: number;
  bank_name?: string;
  due_date: string;
}

interface CreditCardFormProps {
  card?: CreditCard;
  onSubmit: (data: CreditCardInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const CreditCardForm: React.FC<CreditCardFormProps> = ({
  card,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<CreditCardInput>({
    card_name: '',
    card_number: '',
    expiry_date: '',
    current_value: 0,
    bank_name: '',
    due_date: '',
  });

  useEffect(() => {
    if (card) {
      setFormData({
        card_name: card.card_name,
        card_number: card.card_number,
        expiry_date: card.expiry_date,
        current_value: card.current_value,
        bank_name: card.bank_name || '',
        due_date: card.due_date,
      });
    }
  }, [card]);

  const handleChange = (field: keyof CreditCardInput, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(formData); }} className="space-y-4">
      <div>
        <Label htmlFor="card_name">Nome no Cartão *</Label>
        <Input
          id="card_name"
          type="text"
          value={formData.card_name}
          onChange={e => handleChange('card_name', e.target.value)}
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
          onChange={e => handleChange('card_number', formatCardNumber(e.target.value))}
          required
        />
        <span className="text-xs text-muted-foreground">Apenas números, máximo 16 dígitos</span>
      </div>
      <div>
        <Label htmlFor="expiry_date">Validade (MM-AAAA) *</Label>
        <Input
          id="expiry_date"
          type="date"
          value={formData.expiry_date}
          onChange={e => handleChange('expiry_date', e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="due_date">Dia de Vencimento *</Label>
        <Input
          id="due_date"
          type="date"
          value={formData.due_date}
          onChange={e => handleChange('due_date', e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="bank_name">Nome do Banco</Label>
        <Input
          id="bank_name"
          type="text"
          value={formData.bank_name}
          onChange={e => handleChange('bank_name', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="current_value">Valor Atual *</Label>
        <Input
          id="current_value"
          type="number"
          step="0.01"
          value={formData.current_value}
          onChange={e => handleChange('current_value', Number(e.target.value))}
          required
        />
      </div>
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1" disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600" disabled={isLoading}>
          {isLoading ? 'Salvando...' : (card ? 'Atualizar' : 'Salvar')}
        </Button>
      </div>
    </form>
  );
};
