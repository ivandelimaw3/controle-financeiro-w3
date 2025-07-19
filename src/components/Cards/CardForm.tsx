
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBanksOptions } from '@/hooks/useBanksOptions';

export interface CardInput {
  holder_name: string;
  card_number: string;
  expiry: string;
  cvv: string;
  card_type: string;
  card_brand: string;
  bank_id?: number;
}

interface CardFormProps {
  card?: CardInput;
  onSubmit: (data: CardInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const CardForm: React.FC<CardFormProps> = ({
  card,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const { banksOptions, isLoading: isLoadingBanks } = useBanksOptions();
  
  const [formData, setFormData] = useState<CardInput>({
    holder_name: '',
    card_number: '',
    expiry: '',
    cvv: '',
    card_type: undefined as any,
    card_brand: undefined as any,
    bank_id: undefined
  });

  useEffect(() => {
    if (card) setFormData(card);
  }, [card]);

  const handleChange = (field: keyof CardInput, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.card_type || !formData.card_brand) {
      alert('Selecione o tipo e a bandeira do cartão.');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="holder_name">Nome do titular *</Label>
        <Input
          id="holder_name"
          type="text"
          value={formData.holder_name}
          onChange={e => handleChange('holder_name', e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="card_number">Número do cartão *</Label>
        <Input
          id="card_number"
          type="text"
          value={formData.card_number}
          onChange={e => handleChange('card_number', e.target.value)}
          maxLength={19}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="expiry">Data de validade (MM/AA) *</Label>
          <Input
            id="expiry"
            type="text"
            placeholder="MM/AA"
            value={formData.expiry}
            onChange={e => handleChange('expiry', e.target.value)}
            pattern="^(0[1-9]|1[0-2])\/\d{2}$"
            required
          />
        </div>
        <div>
          <Label htmlFor="cvv">Código de segurança (CVV) *</Label>
          <Input
            id="cvv"
            type="text"
            value={formData.cvv}
            onChange={e => handleChange('cvv', e.target.value)}
            maxLength={4}
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="bank_id">Banco</Label>
        <Select
          value={formData.bank_id?.toString() ?? ''}
          onValueChange={value => handleChange('bank_id', value ? parseInt(value) : undefined)}
          disabled={isLoadingBanks}
        >
          <SelectTrigger>
            <SelectValue placeholder={isLoadingBanks ? "Carregando bancos..." : "Selecione um banco"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Nenhum banco</SelectItem>
            {banksOptions.map((bank) => (
              <SelectItem key={bank.value} value={bank.value}>
                {bank.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="card_type">Tipo do cartão *</Label>
          <Select
            value={formData.card_type ?? ''}
            onValueChange={value => handleChange('card_type', value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="credito">Crédito</SelectItem>
              <SelectItem value="debito">Débito</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="card_brand">Bandeira *</Label>
          <Select
            value={formData.card_brand ?? ''}
            onValueChange={value => handleChange('card_brand', value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a bandeira" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="visa">Visa</SelectItem>
              <SelectItem value="mastercard">MasterCard</SelectItem>
              <SelectItem value="elo">Elo</SelectItem>
              <SelectItem value="amex">American Express</SelectItem>
              <SelectItem value="hipercard">Hipercard</SelectItem>
              <SelectItem value="outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1" disabled={isLoading}>
          Cancelar
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
          disabled={isLoading || !formData.card_type || !formData.card_brand}
        >
          {isLoading ? 'Salvando...' : (card ? 'Atualizar' : 'Salvar')}
        </Button>
      </div>
    </form>
  );
};
