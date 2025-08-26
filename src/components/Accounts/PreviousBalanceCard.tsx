
import React, { useState, useEffect } from 'react';
import { Wallet, Edit3, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Account } from '@/hooks/useAccountsData';

interface PreviousBalanceCardProps {
  accounts: Account[];
  month: number;
  year: number;
  onUpdateBalance: (amount: number, month: number, year: number) => Promise<void>;
}

export const PreviousBalanceCard: React.FC<PreviousBalanceCardProps> = ({
  accounts,
  month,
  year,
  onUpdateBalance
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('0');
  const [isLoading, setIsLoading] = useState(false);

  // Função para formatar valores em reais brasileiros
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Buscar saldo anterior do mês/ano específico
  const getPreviousBalance = () => {
    const description = `Saldo Inicial - ${String(month).padStart(2, '0')}/${year}`;
    const previousBalanceAccount = accounts.find(
      account => account.description === description && 
                 account.category === 'Saldo Inicial' &&
                 account.type === 'receita'
    );
    
    return previousBalanceAccount ? previousBalanceAccount.amount : 0;
  };

  const previousBalance = getPreviousBalance();

  // Atualizar input quando o saldo anterior mudar
  useEffect(() => {
    setInputValue(previousBalance.toString());
  }, [previousBalance]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setInputValue(previousBalance.toString());
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const amount = parseFloat(inputValue) || 0;
      await onUpdateBalance(amount, month, year);
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao salvar saldo anterior:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Wallet size={20} className="text-purple-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-slate-600">Saldo Mês Anterior</p>
          {isEditing ? (
            <div className="flex items-center gap-2 mt-1">
              <Input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                className="h-8 text-lg font-bold"
                placeholder="0.00"
                step="0.01"
                disabled={isLoading}
                autoFocus
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={handleSave}
                disabled={isLoading}
                className="p-1 h-8 w-8 text-green-600 hover:bg-green-100"
              >
                <Check size={16} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCancel}
                disabled={isLoading}
                className="p-1 h-8 w-8 text-red-600 hover:bg-red-100"
              >
                <X size={16} />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p className="text-xl font-bold text-purple-600">
                {formatCurrency(previousBalance)}
              </p>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleEdit}
                className="p-1 h-8 w-8 text-slate-500 hover:bg-slate-100"
              >
                <Edit3 size={14} />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
