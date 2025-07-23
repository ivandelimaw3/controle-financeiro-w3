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
      console.error('Erro ao formatar moeda:', error);
      return 'R$ 0,00';
    }
  };

  // Função segura para formatar número do cartão
  const safeFormatCardNumber = (number: any) => {
    try {
      if (!number || typeof number !== 'string') return '**** **** **** ****';
      return number.replace(/(\d{4})(?=\d)/g, '$1 ');
    } catch (error) {
      return '**** **** **** ****';
    }
  };

  // Função segura para formatar data de validade
  const safeFormatExpiryDate = (date: any) => {
    try {
      if (!date || typeof date !== 'string') return 'MM/AA';
      return date.replace(/(\d{2})(\d{2})/, '$1/$2');
    } catch (error) {
      return 'MM/AA';
    }
  };

  // Função segura para obter label da bandeira
  const safeGetCardBrandLabel = (brand: any) => {
    try {
      if (!brand || typeof brand !== 'string') return 'Desconhecida';
      const brands: { [key: string]: string } = {
        'visa': 'Visa',
        'mastercard': 'Mastercard',
        'elo': 'Elo',
        'amex': 'American Express',
        'hipercard': 'Hipercard',
        'discover': 'Discover'
      };
      return brands[brand.toLowerCase()] || brand;
    } catch (error) {
      return 'Desconhecida';
    }
  };

  // Função segura para obter cor da bandeira
  const safeGetCardBrandColor = (brand: any) => {
    try {
      if (!brand || typeof brand !== 'string') return 'bg-gray-600';
      const colors: { [key: string]: string } = {
        'visa': 'bg-blue-600',
        'mastercard': 'bg-red-600',
        'elo': 'bg-green-600',
        'amex': 'bg-blue-800',
        'hipercard': 'bg-purple-600',
        'discover': 'bg-orange-600'
      };
      return colors[brand.toLowerCase()] || 'bg-gray-600';
    } catch (error) {
      return 'bg-gray-600';
    }
  };

  // Função segura para obter valor numérico
  const safeGetNumber = (value: any) => {
    try {
      if (value === null || value === undefined || isNaN(value)) {
        return 0;
      }
      return Number(value);
    } catch (error) {
      return 0;
    }
  };

  // Função segura para obter string
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

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-blue-600" />
            <div>
              <CardTitle className="text-lg">
                {safeGetString(card.name, 'Nome não informado')}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {safeFormatCardNumber(card.card_number)}
              </p>
            </div>
          </div>
          <Badge className={safeGetCardBrandColor(card.card_brand)}>
            {safeGetCardBrandLabel(card.card_brand)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Validade</p>
            <p className="font-medium">{safeFormatExpiryDate(card.expiry_date)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">CVV</p>
            <p className="font-medium">***</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Banco</p>
            <p className="font-medium">{safeGetString(card.bank_name, 'Não informado')}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Data Pagamento</p>
            <p className="font-medium">{safeGetNumber(card.payment_date)}º dia</p>
          </div>
        </div>

        <div className="pt-2 border-t">
          <p className="text-sm text-muted-foreground">Débito Atual</p>
          <p className={`text-2xl font-bold ${safeGetNumber(card.current_balance) > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {safeFormatCurrency(card.current_balance)}
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