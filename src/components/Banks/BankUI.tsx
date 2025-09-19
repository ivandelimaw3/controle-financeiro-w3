import React from 'react';
import { Building2 } from 'lucide-react';

interface BankUIProps {
  bankName: string;
  accountNumber: string;
  agency: string;
  accountType: string;
  holderName?: string;
  balance: number;
}

export const BankUI: React.FC<BankUIProps> = ({
  bankName,
  accountNumber,
  agency,
  accountType,
  holderName,
  balance
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getBankGradient = (type: string) => {
    switch (type) {
      case 'corrente':
        return 'bg-gradient-to-br from-blue-600 to-blue-800';
      case 'poupanca':
        return 'bg-gradient-to-br from-green-600 to-green-800';
      case 'salario':
        return 'bg-gradient-to-br from-purple-600 to-purple-800';
      case 'investimento':
        return 'bg-gradient-to-br from-orange-600 to-red-600';
      default:
        return 'bg-gradient-to-br from-slate-600 to-slate-800';
    }
  };

  return (
    <div className="relative w-full max-w-xs mx-auto">
      <div className={`
        ${getBankGradient(accountType)}
        rounded-xl p-4 text-white shadow-lg
        aspect-[1.6/1] flex flex-col justify-between
        transform transition-transform hover:scale-105
        relative overflow-hidden
      `}>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-16 -top-16 w-32 h-32 rounded-full bg-white/20" />
          <div className="absolute -left-8 -bottom-8 w-24 h-24 rounded-full bg-white/10" />
        </div>

        {/* Card Header */}
        <div className="flex justify-between items-start relative z-10">
          <div className="text-xs font-medium opacity-90">
            {bankName.toUpperCase()}
          </div>
          <div className="bg-white/20 text-white border border-white/30 rounded-full px-2 py-1 text-xs">
            {accountType.toUpperCase()}
          </div>
        </div>

        {/* Bank Icon */}
        <div className="flex items-center space-x-2 relative z-10">
          <Building2 className="w-8 h-8 text-white" />
        </div>

        {/* Account Info */}
        <div className="relative z-10">
          <div className="font-mono text-sm tracking-wider mb-1">
            AG: {agency} • CC: {accountNumber}
          </div>
        </div>

        {/* Card Footer */}
        <div className="flex justify-between items-end relative z-10">
          <div className="flex-1 min-w-0">
            <div className="text-xs opacity-75 mb-1">TITULAR</div>
            <div className="font-medium text-xs truncate">
              {(holderName || bankName).toUpperCase()}
            </div>
          </div>
          <div className="text-right ml-2 flex-shrink-0">
            <div className="text-xs opacity-75 mb-1">SALDO</div>
            <div className="font-mono text-xs">{formatCurrency(balance)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};