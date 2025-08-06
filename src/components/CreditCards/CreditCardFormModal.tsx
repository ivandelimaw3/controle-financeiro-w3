import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, CreditCardInput } from '@/hooks/useCreditCards';

interface CreditCardFormModalProps {
  card?: CreditCard;
  onSubmit: (data: CreditCardInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const CreditCardFormModal: React.FC<CreditCardFormModalProps> = ({
  card,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<CreditCardInput>({
    card_name: '',
    card_number: '',
    holder_name: '',
    expiry_date: '',
    due_date: '',
    credit_limit: 0,
    current_value: 0,
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
        credit_limit: card.credit_limit,
        current_value: card.current_value,
        bank_name: card.bank_name || '',
        card_brand: card.card_brand,
      });
    }
  }, [card]);

  const handleChange = (field: keyof CreditCardInput, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCardNumber = (value: string) => {
    // Remove tudo que não é número e limita a 16 dígitos
    const numbers = value.replace(/\D/g, '').slice(0, 16);
    // Formata com espaços a cada 4 dígitos
    return numbers.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiryDate = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Limita a 6 dígitos (MM/AAAA)
    const limited = numbers.slice(0, 6);
    
    // Formata como MM/AAAA
    if (limited.length >= 4) {
      return `${limited.slice(0, 2)}/${limited.slice(2)}`;
    } else if (limited.length >= 2) {
      return `${limited.slice(0, 2)}/${limited.slice(2)}`;
    }
    
    return limited;
  };

  const handleExpiryDateChange = (value: string) => {
    const formatted = formatExpiryDate(value);
    handleChange('expiry_date', formatted);
  };

  const availableLimit = (formData.credit_limit || 0) - (formData.current_value || 0);

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(formData); }} className="space-y-4">
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
            type="number"
            step="0.01"
            value={formData.credit_limit}
            onChange={e => handleChange('credit_limit', parseFloat(e.target.value) || 0)}
            placeholder="5000.00"
            required
          />
        </div>
        <div>
          <Label htmlFor="current_value">Valor Atual</Label>
          <Input
            id="current_value"
            type="number"
            step="0.01"
            value={formData.current_value}
            onChange={e => handleChange('current_value', parseFloat(e.target.value) || 0)}
            placeholder="1200.00"
          />
        </div>
      </div>

      {/* Limite disponível calculado */}
      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
        <span className="text-sm font-medium text-gray-700">Limite Disponível:</span>
        <span className="text-sm font-bold text-green-600">
          {new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(availableLimit)}
        </span>
      </div>

      {/* Botões de ação */}
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
