import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, CreditCardInput } from '@/hooks/useCreditCardsData';

function formatCardNumber(value: string) {
  // Remove tudo que não for dígito e formata em blocos de 4
  return value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim().slice(0, 19);
}

function formatDateBR(value: string) {
  // Remove tudo que não for dígito e formata para DD/MM/AAAA
  let v = value.replace(/\D/g, '').slice(0, 8);
  if (v.length >= 5) return v.slice(0, 2) + '/' + v.slice(2, 4) + '/' + v.slice(4, 8);
  if (v.length >= 3) return v.slice(0, 2) + '/' + v.slice(2, 4);
  if (v.length >= 1) return v;
  return '';
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
        bank_id: card.bank_id,
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
