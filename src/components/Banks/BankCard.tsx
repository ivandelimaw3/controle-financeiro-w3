
import React from 'react';
import { Building2, Edit, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bank } from '@/hooks/useBanksData';

interface BankCardProps {
  bank: Bank;
  onEdit: (bank: Bank) => void;
  onDelete: (id: number) => void;
  onAddDeposit: (bank: Bank) => void;
}

export const BankCard: React.FC<BankCardProps> = ({
  bank,
  onEdit,
  onDelete,
  onAddDeposit
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getAccountTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'corrente': 'Corrente',
      'poupanca': 'Poupança',
      'salario': 'Salário',
      'investimento': 'Investimento'
    };
    return types[type] || type;
  };

  const getBankGradient = (type: string) => {
    switch (type) {
      case 'corrente':
        return 'bg-gradient-to-r from-blue-600 to-blue-800';
      case 'poupanca':
        return 'bg-gradient-to-r from-green-600 to-green-800';
      case 'salario':
        return 'bg-gradient-to-r from-purple-600 to-purple-800';
      case 'investimento':
        return 'bg-gradient-to-r from-orange-600 to-red-600';
      default:
        return 'bg-gradient-to-r from-slate-600 to-slate-800';
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300">
      {/* Visual Bank Card */}
      <div className="relative w-full max-w-xs mx-auto mb-4">
        <div className={`
          ${getBankGradient(bank.account_type)}
          rounded-xl p-4 text-white shadow-lg
          aspect-[1.6/1] flex flex-col justify-between
          transform transition-transform hover:scale-105
          relative overflow-hidden text-xs
        `}>
          
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-16 -top-16 w-32 h-32 rounded-full bg-white/20" />
            <div className="absolute -left-8 -bottom-8 w-24 h-24 rounded-full bg-white/10" />
          </div>

          {/* Card Header */}
          <div className="flex justify-between items-start relative z-10">
            <div className="text-xs font-medium opacity-90">
              {bank.name.toUpperCase()}
            </div>
            <Badge variant="outline" className="bg-white/20 text-white border-white/30">
              {getAccountTypeLabel(bank.account_type)}
            </Badge>
          </div>

          {/* Bank Icon */}
          <div className="flex items-center space-x-2 relative z-10">
            <Building2 className="w-8 h-6 text-white" />
          </div>

          {/* Account Info */}
          <div className="relative z-10">
            <div className="font-mono text-sm tracking-wider mb-1">
              AG: {bank.agency} • CC: {bank.account_number}
            </div>
          </div>

          {/* Card Footer */}
          <div className="flex justify-between items-end relative z-10">
            <div className="flex-1 min-w-0">
              <div className="text-xs opacity-75 mb-1">TITULAR</div>
              <div className="font-medium text-xs truncate">
                {(bank.nickname || bank.name).toUpperCase()}
              </div>
            </div>
            <div className="text-right ml-2 flex-shrink-0">
              <div className="text-xs opacity-75 mb-1">SALDO</div>
              <div className="font-mono text-xs">{formatCurrency(bank.balance)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Details */}
      <div className="space-y-3">
        <div className="text-center">
          <h3 className="font-semibold text-gray-800">
            {bank.nickname || bank.name}
          </h3>
          {bank.nickname && (
            <p className="text-sm text-gray-600">{bank.name}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="text-center">
            <p className="text-gray-500">Agência</p>
            <p className="font-medium">{bank.agency}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500">Conta</p>
            <p className="font-medium">{bank.account_number}</p>
          </div>
        </div>

        <div className="text-center pt-2 border-t">
          <p className="text-sm text-gray-500">Saldo Atual</p>
          <p className={`text-2xl font-bold ${bank.balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
            {formatCurrency(bank.balance)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Atualizado: {formatDate(bank.updated_at)}
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddDeposit(bank)}
            className="flex-1"
          >
            <Plus className="h-4 w-4 mr-1" />
            Depósito
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(bank)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(bank.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
