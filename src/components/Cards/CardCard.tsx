import React from 'react';
import { CreditCard, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card as CardType } from '@/hooks/useCardsData';

interface CardCardProps {
  card: CardType;
  onEdit: (card: CardType) => void;
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
    }).format(value || 0);
  };

  const formatCardNumber = (number: string) => {
    if (!number) return '**** **** **** ****';
    return number.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiryDate = (date: string) => {
    if (!date) return 'MM/AA';
    return date.replace(/(\d{2})(\d{2})/, '$1/$2');
  };

  const getCardBrandLabel = (brand: string) => {
    const brands: { [key: string]: string } = {
      'visa': 'Visa',
      'mastercard': 'Mastercard',
      'elo': 'Elo',
      'amex': 'American Express',
      'hipercard': 'Hipercard',
      'discover': 'Discover'
    };
    return brands[brand.toLowerCase()] || brand;
  };

  const getCardBrandColor = (brand: string) => {
    const colors: { [key: string]: string } = {
      'visa': 'bg-blue-600',
      'mastercard': 'bg-red-600',
      'elo': 'bg-green-600',
      'amex': 'bg-blue-800',
      'hipercard': 'bg-purple-600',
      'discover': 'bg-orange-600'
    };
    return colors[brand.toLowerCase()] || 'bg-gray-600';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-blue-600" />
            <div>
              <CardTitle className="text-lg">
                {card.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {formatCardNumber(card.card_number)}
              </p>
            </div>
          </div>
          <Badge className={getCardBrandColor(card.card_brand)}>
            {getCardBrandLabel(card.card_brand)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Validade</p>
            <p className="font-medium">{formatExpiryDate(card.expiry_date)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">CVV</p>
            <p className="font-medium">***</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Banco</p>
            <p className="font-medium">{card.bank_name || 'Não informado'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Data Pagamento</p>
            <p className="font-medium">{card.payment_date || 0}º dia</p>
          </div>
        </div>

        <div className="pt-2 border-t">
          <p className="text-sm text-muted-foreground">Débito Atual</p>
          <p className={`text-2xl font-bold ${(card.current_balance || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {formatCurrency(card.current_balance)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Última atualização: {card.updated_at ? new Date(card.updated_at).toLocaleDateString('pt-BR') : 'N/A'}
          </p>
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
    </Card>
  );
}; 