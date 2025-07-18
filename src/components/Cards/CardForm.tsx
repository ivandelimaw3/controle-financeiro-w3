
import React, { useState, useEffect } from 'react';
import { CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardInput } from '@/hooks/useCardsData';
import { useBanksOptions } from '@/hooks/useBanksOptions';

interface CardFormProps {
  card?: Card;
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
  const { banksOptions } = useBanksOptions();
  
  const [formData, setFormData] = useState<CardInput>({
    card_name: '',
    card_number: '',
    card_type: 'credito',
    card_brand: '',
    holder_name: '',
    expiry_date: '',
    credit_limit: 0,
    current_balance: 0,
    bank_id: undefined,
    nickname: '',
    is_active: true
  });

  useEffect(() => {
    if (card) {
      setFormData({
        card_name: card.card_name,
        card_number: card.card_number,
        card_type: card.card_type,
        card_brand: card.card_brand,
        holder_name: card.holder_name,
        expiry_date: card.expiry_date,
        credit_limit: card.credit_limit,
        current_balance: card.current_balance,
        bank_id: card.bank_id,
        nickname: card.nickname || '',
        is_active: card.is_active
      });
    }
  }, [card]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof CardInput, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        <div>
          <Label htmlFor="card_name" className="text-slate-700">
            Nome do Cartão *
          </Label>
          <Input
            id="card_name"
            type="text"
            value={formData.card_name}
            onChange={(e) => handleChange('card_name', e.target.value)}
            placeholder="Ex: Cartão Principal, Cartão Empresarial..."
            className="mt-1"
            required
          />
        </div>

        <div>
          <Label htmlFor="nickname" className="text-slate-700">
            Apelido/Nome Fantasia
          </Label>
          <Input
            id="nickname"
            type="text"
            value={formData.nickname}
            onChange={(e) => handleChange('nickname', e.target.value)}
            placeholder="Ex: Cartão de Compras, Cartão Viagem..."
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="card_number" className="text-slate-700">
              Número do Cartão *
            </Label>
            <Input
              id="card_number"
              type="text"
              value={formData.card_number}
              onChange={(e) => handleChange('card_number', e.target.value)}
              placeholder="**** **** **** 1234"
              className="mt-1"
              maxLength={19}
              required
            />
          </div>

          <div>
            <Label htmlFor="card_brand" className="text-slate-700">
              Bandeira *
            </Label>
            <Select
              value={formData.card_brand}
              onValueChange={(value) => handleChange('card_brand', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecione a bandeira" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="visa">Visa</SelectItem>
                <SelectItem value="mastercard">Mastercard</SelectItem>
                <SelectItem value="elo">Elo</SelectItem>
                <SelectItem value="amex">American Express</SelectItem>
                <SelectItem value="hipercard">Hipercard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="card_type" className="text-slate-700">
              Tipo do Cartão
            </Label>
            <Select
              value={formData.card_type}
              onValueChange={(value) => handleChange('card_type', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credito">Crédito</SelectItem>
                <SelectItem value="debito">Débito</SelectItem>
                <SelectItem value="multiplo">Múltiplo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="expiry_date" className="text-slate-700">
              Data de Vencimento *
            </Label>
            <Input
              id="expiry_date"
              type="date"
              value={formData.expiry_date}
              onChange={(e) => handleChange('expiry_date', e.target.value)}
              className="mt-1"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="holder_name" className="text-slate-700">
            Nome do Portador *
          </Label>
          <Input
            id="holder_name"
            type="text"
            value={formData.holder_name}
            onChange={(e) => handleChange('holder_name', e.target.value)}
            placeholder="Nome como impresso no cartão"
            className="mt-1"
            required
          />
        </div>

        <div>
          <Label htmlFor="bank_id" className="text-slate-700">
            Banco Associado
          </Label>
          <Select
            value={formData.bank_id?.toString() || ''}
            onValueChange={(value) => handleChange('bank_id', value ? parseInt(value) : undefined)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecione um banco (opcional)" />
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

        {formData.card_type === 'credito' && (
          <div>
            <Label htmlFor="credit_limit" className="text-slate-700">
              Limite de Crédito
            </Label>
            <p className="text-sm text-slate-500 mb-1">
              Valor atual: {formatCurrency(formData.credit_limit || 0)}
            </p>
            <Input
              id="credit_limit"
              type="number"
              step="0.01"
              value={formData.credit_limit || 0}
              onChange={(e) => handleChange('credit_limit', parseFloat(e.target.value) || 0)}
              placeholder="Ex: 5000.00"
              className="mt-1"
            />
          </div>
        )}

        <div>
          <Label htmlFor="current_balance" className="text-slate-700">
            Saldo Atual
          </Label>
          <p className="text-sm text-slate-500 mb-1">
            Valor atual: {formatCurrency(formData.current_balance || 0)}
          </p>
          <Input
            id="current_balance"
            type="number"
            step="0.01"
            value={formData.current_balance || 0}
            onChange={(e) => handleChange('current_balance', parseFloat(e.target.value) || 0)}
            placeholder="Ex: -1500.00"
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {formData.card_type === 'credito' ? 'Valor negativo indica fatura em aberto' : 'Saldo disponível no cartão'}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => handleChange('is_active', checked)}
          />
          <Label htmlFor="is_active" className="text-slate-700">
            Cartão ativo
          </Label>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
          disabled={isLoading}
        >
          {isLoading ? 'Salvando...' : (card ? 'Atualizar' : 'Salvar')}
        </Button>
      </div>
    </form>
  );
};
