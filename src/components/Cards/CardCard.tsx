import React from 'react';
import { CreditCard, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useBanksData } from '../../hooks/useBanksData';
import { Card as CardType } from '@/hooks/useCardsData';

interface CardCardProps {
  card: CardType;
  onEdit: (card: CardType) => void;
  onDelete: (id: string) => void;
}

export const CardCard: React.FC<CardCardProps> = ({
  card,
  onEdit,
  onDelete
}) => {
  const { banks } = useBanksData();
  const bank = banks.find((b) => b.id === card.bank_id);

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

  // Função segura para formatar número do cartão
  const safeFormatCardNumber = (number: any) => {
    try {
      if (!number || typeof number !== 'string') return '**** **** **** ****';
      return number.replace(/(\d{4})(?=\d)/g, '$1 ');
    } catch (error) {
      return '**** **** **** ****';
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
                {safeFormatCardNumber(card.number)}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Validade</p>
            <p className="font-medium">{safeGetString(card.expiration_date, 'MM/AA')}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Dia Pagamento</p>
            <p className="font-medium">{safeGetNumber(card.payment_date)}º dia</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Banco</p>
            <p className="font-medium">{bank ? bank.name : 'Não informado'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Limite</p>
            <p className="font-medium">{safeFormatCurrency(card.credit_limit)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Valor Utilizado</p>
            <p className="font-medium">{safeFormatCurrency(card.used_value)}</p>
          </div>
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
        <p className="text-xs text-muted-foreground mt-1">
          Última atualização: {card.updated_at ? new Date(card.updated_at).toLocaleDateString('pt-BR') : 'N/A'}
        </p>
      </CardContent>
    </Card>
  );
};