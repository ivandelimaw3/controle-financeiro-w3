import React from 'react';
import { CreditCard as CreditCardIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreditCard as CreditCardType } from '@/hooks/useCreditCardsData';

function formatCardNumber(value: string) {
  return value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim().slice(0, 19);
}

// Função para formatar validade no padrão MM/AAAA
function formatExpiryToMonthYear(date: string) {
  if (!date) return '';
  // Aceita formatos YYYY-MM ou YYYY-MM-DD
  const parts = date.split('-');
  if (parts.length >= 2) {
    return `${parts[1]}/${parts[0]}`;
  }
  // Se já estiver no formato MM/AAAA
  if (/^\d{2}\/\d{4}$/.test(date)) return date;
  return date;
}

function formatDateBR(date: string | number) {
  if (!date) return '';
  if (typeof date === 'number') return String(date).padStart(2, '0');
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [y, m, d] = date.split('-');
    return `${d}/${m}/${y}`;
  }
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) return date;
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
          <div className="text-slate-500 text-sm">{card.bank_name}</div>
        </div>
      </div>
      <div className="text-slate-700">
        <div><strong>Número:</strong> {formatCardNumber(card.card_number)}</div>
        <div><strong>Validade:</strong> {formatExpiryToMonthYear(card.expiry_date)}</div>
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