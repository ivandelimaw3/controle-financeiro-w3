
import React from 'react';
import { CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card as CardType } from '@/hooks/useCardsData';

interface CardListItemProps {
  card: CardType;
  onEdit: (card: CardType) => void;
  onDelete: (id: number) => void;
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

  // Função para obter label da bandeira
  const getCardBrandLabel = (brand: string) => {
    const brands: { [key: string]: string } = {
      'visa': 'Visa',
      'mastercard': 'Mastercard',
      'elo': 'Elo',
      'amex': 'American Express',
      'hipercard': 'Hipercard',
      'discover': 'Discover'
    };
    return brands[brand?.toLowerCase()] || brand || 'Desconhecida';
  };

  // Função para mascarar número do cartão
  const maskCardNumber = (cardNumber: string) => {
    if (!cardNumber) return '**** **** **** ****';
    const cleaned = cardNumber.replace(/\s/g, '');
    if (cleaned.length < 4) return '**** **** **** ****';
    const lastFour = cleaned.slice(-4);
    return `**** **** **** ${lastFour}`;
  };

  // Função para formatar data de pagamento
  const formatPaymentDate = (day: number) => {
    if (!day || day < 1 || day > 31) return '00/00/0000';
    
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    // Se o dia já passou neste mês, usar o próximo mês
    let paymentMonth = currentMonth;
    let paymentYear = currentYear;
    
    if (day < today.getDate()) {
      paymentMonth++;
      if (paymentMonth > 11) {
        paymentMonth = 0;
        paymentYear++;
      }
    }
    
    const paymentDate = new Date(paymentYear, paymentMonth, day);
    return paymentDate.toLocaleDateString('pt-BR');
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
              {maskCardNumber(card.card_number)}
            </p>
          </div>
        </div>
        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
          {getCardBrandLabel(card.card_brand)}
        </span>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Validade:</span>
          <span>{safeGetString(card.expiry_date, 'MM/AA')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Banco:</span>
          <span>{safeGetString(card.bank_name, 'Não informado')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Vencimento:</span>
          <span className="font-mono text-xs">
            {formatPaymentDate(safeGetNumber(card.payment_date))}
          </span>
        </div>
        <div className="pt-2 border-t">
          <div className="flex justify-between">
            <span className="text-gray-600">Débito Atual:</span>
            <span className={`font-bold ${safeGetNumber(card.current_balance) > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {safeFormatCurrency(card.current_balance)}
            </span>
          </div>
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
