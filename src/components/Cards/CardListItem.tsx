import React from 'react';
import { CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card as CardType } from '@/hooks/useCardsData';

interface CardListItemProps {
  card: CardType;
  onEdit: (card: CardType) => void;
  onDelete: (id: string) => void;
}

export const CardListItem: React.FC<CardListItemProps> = ({
  card,
  onEdit,
  onDelete
}) => {
  // Função segura para formatar moeda
  const safeFormatCurrency = (value: any) => {
    try {
      if (value === null || value === undefined || isNaN(value)) {
        return 'R$ 0,00';
      }
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(Number(value));
    } catch (error) {
      return 'R$ 0,00';
    }
  };

  // Função segura para obter valores string
  const safeGetString = (value: any, defaultValue: string = '') => {
    try {
      if (value === null || value === undefined) {
        return defaultValue;
      }
      return String(value);
    } catch (error) {
      return defaultValue;
    }
  };

  // Função segura para obter valores numéricos
  const safeGetNumber = (value: any, defaultValue: number = 0) => {
    try {
      if (value === null || value === undefined || isNaN(value)) {
        return defaultValue;
      }
      return Number(value);
    } catch (error) {
      return defaultValue;
    }
  };

  // Função para mascarar número do cartão (mostra só os 4 últimos)
  const maskCardNumber = (cardNumber: string) => {
    if (!cardNumber) return '**** **** **** ****';
    const cleaned = cardNumber.replace(/\s/g, '');
    if (cleaned.length < 4) return '**** **** **** ****';
    const lastFour = cleaned.slice(-4);
    return `**** **** **** ${lastFour}`;
  };

  return (
    <div className="border rounded-lg p-4 bg-white hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <CreditCard className="h-6 w-6 text-blue-600" />
          <div>
            <h3 className="font-bold text-lg">
              {safeGetString(card.name, 'Nome não informado')}
            </h3>
            <p className="text-sm text-gray-600 font-mono">
              {maskCardNumber(card.number)}
            </p>
          </div>
        </div>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Validade:</span>
          <span>{safeGetString(card.expiration_date, 'MM/AA')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Banco:</span>
          <span>{safeGetString(card.bank_name, 'Não informado')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Dia do Pagamento:</span>
          <span className="font-mono text-xs">
            {safeGetNumber(card.payment_date)}º dia
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Limite:</span>
          <span>{safeFormatCurrency(card.credit_limit)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Valor Utilizado:</span>
          <span>{safeFormatCurrency(card.used_value)}</span>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(card)}
          className="flex-1"
        >
          Editar
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(card.id)}
          className="text-red-600 hover:text-red-700"
        >
          Excluir
        </Button>
      </div>
    </div>
  );
};