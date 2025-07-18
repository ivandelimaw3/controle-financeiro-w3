
import React from 'react';
import { CreditCard, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Card as UICard, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/hooks/useCardsData';

interface CardCardProps {
  card: Card;
  onEdit: (card: Card) => void;
  onDelete: (id: number) => void;
}

export const CardCard: React.FC<CardCardProps> = ({
  card,
  onEdit,
  onDelete
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const getCardTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'credito': 'Crédito',
      'debito': 'Débito',
      'multiplo': 'Múltiplo'
    };
    return types[type] || type;
  };

  const getCardBrandLabel = (brand: string) => {
    const brands: { [key: string]: string } = {
      'visa': 'Visa',
      'mastercard': 'Mastercard',
      'elo': 'Elo',
      'amex': 'American Express',
      'hipercard': 'Hipercard'
    };
    return brands[brand] || brand;
  };

  const maskCardNumber = (number: string) => {
    if (number.length <= 4) return number;
    return '**** **** **** ' + number.slice(-4);
  };

  const isExpiringSoon = () => {
    const expiryDate = new Date(card.expiry_date);
    const today = new Date();
    const diffInMonths = (expiryDate.getFullYear() - today.getFullYear()) * 12 + (expiryDate.getMonth() - today.getMonth());
    return diffInMonths <= 3;
  };

  return (
    <UICard className={`hover:shadow-lg transition-shadow ${!card.is_active ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-blue-600" />
            <div>
              <CardTitle className="text-lg">
                {card.nickname || card.card_name}
              </CardTitle>
              {card.nickname && (
                <p className="text-sm text-muted-foreground">{card.card_name}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary">
              {getCardTypeLabel(card.card_type)}
            </Badge>
            {!card.is_active && (
              <Badge variant="destructive">
                Inativo
              </Badge>
            )}
            {isExpiringSoon() && (
              <Badge variant="destructive">
                Vencendo
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Número</p>
            <p className="font-medium">{maskCardNumber(card.card_number)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Bandeira</p>
            <p className="font-medium">{getCardBrandLabel(card.card_brand)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Portador</p>
            <p className="font-medium">{card.holder_name}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Vencimento</p>
            <p className="font-medium">{formatDate(card.expiry_date)}</p>
          </div>
        </div>

        {card.card_type === 'credito' && card.credit_limit > 0 && (
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground">Limite de Crédito</p>
            <p className="text-lg font-bold text-blue-600">
              {formatCurrency(card.credit_limit)}
            </p>
          </div>
        )}

        <div className="pt-2 border-t">
          <p className="text-sm text-muted-foreground">
            {card.card_type === 'credito' ? 'Fatura Atual' : 'Saldo Atual'}
          </p>
          <p className={`text-2xl font-bold ${
            card.current_balance < 0 ? 'text-red-600' : 'text-green-600'
          }`}>
            {formatCurrency(card.current_balance)}
          </p>
          {card.card_type === 'credito' && card.credit_limit > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Disponível: {formatCurrency(card.credit_limit + card.current_balance)}
            </p>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(card)}
            className="flex-1"
          >
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(card.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </UICard>
  );
};
