import React from 'react';
import { CreditCard, Edit, Trash2 } from 'lucide-react';
import { Card as UICard, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CardInput } from './CardForm';

interface CardCardProps {
  card: CardInput & { id: number };
  onEdit: (card: CardInput & { id: number }) => void;
  onDelete: (id: number) => void;
}

export const CardCard: React.FC<CardCardProps> = ({ card, onEdit, onDelete }) => {
  const maskCardNumber = (number: string) => {
    if (number.length <= 4) return number;
    return '**** **** **** ' + number.slice(-4);
  };

  return (
    <UICard className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <CreditCard className="h-8 w-8 text-blue-600" />
          <div>
            <CardTitle className="text-lg">
              {card.holder_name}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{card.card_brand} - {card.card_type === 'credito' ? 'Crédito' : 'Débito'}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-sm">
          <span className="font-medium">Número:</span> {maskCardNumber(card.card_number)}
        </div>
        <div className="text-sm">
          <span className="font-medium">Validade:</span> {card.expiry}
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(card)} className="flex-1">
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
          <Button variant="outline" size="sm" onClick={() => onDelete(card.id)} className="text-red-600 hover:text-red-700">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </UICard>
  );
}; 