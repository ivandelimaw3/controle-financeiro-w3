import React from 'react';
import { CreditCard } from 'lucide-react';

interface CreditCardUIProps {
  bankName?: string;
  cardNumber: string;
  holderName?: string;
  expiry?: string;
  color?: string;
  brand?: string;
}

export const CreditCardUI: React.FC<CreditCardUIProps> = ({
  bankName = "BANCO",
  cardNumber,
  holderName = "NOME DO TITULAR", 
  expiry = "00/00",
  color = "bg-gradient-to-r from-slate-600 to-slate-800",
  brand = "CREDIT"
}) => {
  const formatCardNumber = (number: string) => {
    const cleaned = number.replace(/\D/g, '');
    const masked = cleaned.replace(/(.{4})/g, '$1 ').trim();
    // Mask all but last 4 digits
    if (cleaned.length > 4) {
      const lastFour = cleaned.slice(-4);
      const maskedPart = '**** **** **** ';
      return maskedPart + lastFour;
    }
    return masked;
  };

  const formatExpiryDate = (expiry: string) => {
    if (!expiry) return "00/00";
    
    // Se vier no formato MM/AAAA, converte para MM/AA
    if (expiry.includes('/')) {
      const [month, year] = expiry.split('/');
      if (year && year.length === 4) {
        return `${month}/${year.slice(-2)}`;
      }
      return expiry;
    }
    
    // Se for apenas números, formata como MM/AA
    const numbers = expiry.replace(/\D/g, '');
    if (numbers.length >= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(-2)}`;
    }
    
    return expiry;
  };

  const getBrandGradient = (cardBrand: string) => {
    switch (cardBrand?.toLowerCase()) {
      case 'visa':
        return 'bg-gradient-to-r from-blue-600 to-blue-800';
      case 'mastercard':
        return 'bg-gradient-to-r from-red-500 to-orange-600';
      case 'elo':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      case 'amex':
      case 'american express':
        return 'bg-gradient-to-r from-green-600 to-teal-700';
      default:
        return color;
    }
  };

  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Card Container */}
      <div className={`
        ${getBrandGradient(brand)}
        rounded-2xl p-6 text-white shadow-2xl
        aspect-[1.6/1] flex flex-col justify-between
        transform transition-transform hover:scale-105
        relative overflow-hidden
      `}>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-20 -top-20 w-40 h-40 rounded-full bg-white/20" />
          <div className="absolute -left-10 -bottom-10 w-32 h-32 rounded-full bg-white/10" />
        </div>

        {/* Card Header */}
        <div className="flex justify-between items-start relative z-10">
          <div className="text-sm font-medium opacity-90">
            {bankName.toUpperCase()}
          </div>
          <div className="text-right">
            <div className="text-xs opacity-75">{brand.toUpperCase()}</div>
          </div>
        </div>

        {/* Chip */}
        <div className="flex items-center space-x-4 relative z-10">
          <div className="w-12 h-9 rounded-md bg-gradient-to-br from-yellow-200 to-yellow-400 flex items-center justify-center border-2 border-yellow-300">
            <div className="w-6 h-4 rounded-sm bg-yellow-600 opacity-80" />
          </div>
        </div>

        {/* Card Number */}
        <div className="relative z-10">
          <div className="font-mono text-lg tracking-wider mb-1">
            {formatCardNumber(cardNumber)}
          </div>
        </div>

        {/* Card Footer */}
        <div className="flex justify-between items-end relative z-10">
          <div className="flex-1">
            <div className="text-xs opacity-75 mb-1">TITULAR</div>
            <div className="font-medium text-sm truncate">
              {holderName.toUpperCase()}
            </div>
          </div>
          <div className="text-right ml-4">
            <div className="text-xs opacity-75 mb-1">VÁLIDO ATÉ</div>
            <div className="font-mono text-sm">{formatExpiryDate(expiry)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};