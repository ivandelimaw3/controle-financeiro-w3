import React from 'react';
import { CreditCard as CreditCardIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreditCard as CreditCardType } from '@/hooks/useCreditCardsData';

function formatCardNumber(value: string) {
return value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim().slice(0, 19);
}

ffunction formatExpiryToMonthYear(date: string) {
  // Espera data no formato YYYY-MM ou YYYY-MM-DD
  if (!date) return '';
  const parts = date.split('-');
  if (parts.length >= 2) {
    return `${parts[1]}/${parts[0]}`;
  }
  return date;
}

interface CreditCardCardProps {
  card: CreditCardType;
  onEdit: (card: CreditCardType) => void;
  onDelete: (id: string) => void;
}

export const CreditCardCard: React.FC<CreditCardCardProps> = ({ card, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <CreditCardIcon className="h-8 w-8 text-blue-500" />
        <div>
          <div className="font-bold text-lg">{card.card_name}</div>
       </div>
      </div>
      <div className="text-slate-700">
        <div><strong>Número:</strong> {formatCardNumber(card.card_number)}</div>
        <div><strong>Validade:</strong> {formatDateBR(card.expiry_date)}</div>
        <div><strong>Vencimento:</strong> {formatDateBR(card.due_date)}</div>
        <div><strong>Valor Atual:</strong> R$ {card.current_value.toFixed(2)}</div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => onEdit(card)}>Editar</Button>
        <Button variant="destructive" onClick={() => onDelete(card.id)}>Excluir</Button>
      </div>
    </div>
  );
};
