// CartaoForm-banks.tsx - Componente adaptado para a tabela banks

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CreditCard, Save, X, Building2, Hash } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { CartaoCredito, CartaoCreditoForm, Bank, FormErrors } from './types-banks';

interface CartaoFormProps {
  cartao?: CartaoCredito | null;
  banks: Bank[];
  onSubmit: (data: CartaoCreditoForm) => Promise<boolean>;
  onCancel: () => void;
  loading?: boolean;
}

export const CartaoForm: React.FC<CartaoFormProps> = ({
  cartao,
  banks,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState<CartaoCreditoForm>({
    nome_cartao: '',
    numero_cartao: '',
    data_validade: '',
    bank_id: 0,
    data_pagamento: 1,
    valor_atual: 0
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preencher formulário se estiver editando
  useEffect(() => {
    if (cartao) {
      setFormData({
        nome_cartao: cartao.nome_cartao,
        numero_cartao: cartao.numero_cartao,
        data_validade: cartao.data_validade,
        bank_id: cartao.bank_id,
        data_pagamento: cartao.data_pagamento,
        valor_atual: cartao.valor_atual
      });
    }
  }, [cartao]);

  // Validar formulário
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.nome_cartao.trim()) {
      newErrors.nome_cartao = 'Nome do cartão é obrigatório';
    }

    if (!formData.numero_cartao.trim()) {
      newErrors.numero_cartao = 'Número do cartão é obrigatório';
    } else if (!/^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/.test(formData.numero_cartao.replace(/\s/g, ''))) {
      newErrors.numero_cartao = 'Número do cartão deve ter 16 dígitos';
    }

    if (!formData.data_validade) {
      newErrors.data_validade = 'Data de validade é obrigatória';
    } else {
      const today = new Date();
      const validade = new Date(formData.data_validade);
      if (validade <= today) {
        newErrors.data_validade = 'Data de validade deve ser futura';
      }
    }

    if (!formData.bank_id || formData.bank_id === 0) {
      newErrors.bank_id = 'Conta bancária é obrigatória';
    }

    if (formData.data_pagamento < 1 || formData.data_pagamento > 31) {
      newErrors.data_pagamento = 'Data de pagamento deve estar entre 1 e 31';
    }

    if (formData.valor_atual < 0) {
      newErrors.valor_atual = 'Valor atual não pode ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Formatar número do cartão
  const formatCardNumber = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    const formatted = numbers.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted.substring(0, 19); // Máximo 16 dígitos + 3 espaços
  };

  // Manipular mudanças nos campos
  const handleInputChange = (field: keyof CartaoCreditoForm, value: string | number) => {
    if (field === 'numero_cartao' && typeof value === 'string') {
      value = formatCardNumber(value);
    }

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Submeter formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const success = await onSubmit(formData);
      if (success) {
        // Limpar formulário se for criação
        if (!cartao) {
          setFormData({
            nome_cartao: '',
            numero_cartao: '',
            data_validade: '',
            bank_id: 0,
            data_pagamento: 1,
            valor_atual: 0
          });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Formatar exibição da conta bancária
  const formatBankDisplay = (bank: Bank): string => {
    return `${bank.name} - ${bank.nickname || bank.account_type} (${bank.agency}/${bank.account_number})`;
  };

  const isEditing = !!cartao;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          {isEditing ? 'Editar Cartão' : 'Novo Cartão de Crédito'}
        </CardTitle>
        <CardDescription>
          {isEditing 
            ? 'Atualize as informações do seu cartão de crédito'
            : 'Preencha os dados para cadastrar um novo cartão de crédito'
          }
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome do Cartão */}
          <div className="space-y-2">
            <Label htmlFor="nome_cartao">Nome do Cartão *</Label>
            <Input
              id="nome_cartao"
              type="text"
              placeholder="Ex: Cartão Principal, Cartão Reserva..."
              value={formData.nome_cartao}
              onChange={(e) => handleInputChange('nome_cartao', e.target.value)}
              className={errors.nome_cartao ? 'border-red-500' : ''}
            />
            {errors.nome_cartao && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.nome_cartao}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Número do Cartão */}
          <div className="space-y-2">
            <Label htmlFor="numero_cartao">Número do Cartão *</Label>
            <Input
              id="numero_cartao"
              type="text"
              placeholder="1234 5678 9012 3456"
              value={formData.numero_cartao}
              onChange={(e) => handleInputChange('numero_cartao', e.target.value)}
              className={errors.numero_cartao ? 'border-red-500' : ''}
              maxLength={19}
            />
            {errors.numero_cartao && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.numero_cartao}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Data de Validade e Conta Bancária */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_validade">Data de Validade *</Label>
              <Input
                id="data_validade"
                type="date"
                value={formData.data_validade}
                onChange={(e) => handleInputChange('data_validade', e.target.value)}
                className={errors.data_validade ? 'border-red-500' : ''}
              />
              {errors.data_validade && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.data_validade}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bank_id">Conta Bancária *</Label>
              <Select
                value={formData.bank_id.toString()}
                onValueChange={(value) => handleInputChange('bank_id', parseInt(value))}
              >
                <SelectTrigger className={errors.bank_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione a conta bancária" />
                </SelectTrigger>
                <SelectContent>
                  {banks.map((bank) => (
                    <SelectItem key={bank.id} value={bank.id.toString()}>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <span className="truncate">{formatBankDisplay(bank)}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.bank_id && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.bank_id}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* Data de Pagamento e Valor Atual */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_pagamento">Dia do Pagamento *</Label>
              <Input
                id="data_pagamento"
                type="number"
                min="1"
                max="31"
                placeholder="Ex: 15"
                value={formData.data_pagamento}
                onChange={(e) => handleInputChange('data_pagamento', parseInt(e.target.value) || 1)}
                className={errors.data_pagamento ? 'border-red-500' : ''}
              />
              {errors.data_pagamento && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.data_pagamento}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor_atual">Valor Atual (R$)</Label>
              <Input
                id="valor_atual"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.valor_atual}
                onChange={(e) => handleInputChange('valor_atual', parseFloat(e.target.value) || 0)}
                className={errors.valor_atual ? 'border-red-500' : ''}
              />
              {errors.valor_atual && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.valor_atual}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* Informação sobre contas bancárias */}
          {banks.length === 0 && (
            <Alert>
              <Building2 className="h-4 w-4" />
              <AlertDescription>
                Nenhuma conta bancária encontrada. Você precisa cadastrar pelo menos uma conta bancária antes de criar um cartão de crédito.
              </AlertDescription>
            </Alert>
          )}

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading || isSubmitting || banks.length === 0}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Cadastrar')}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading || isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

