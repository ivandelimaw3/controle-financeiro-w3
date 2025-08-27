
import React, { useState, useEffect } from 'react';
import { Wallet, Edit3, Check, X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Account } from '@/hooks/useAccountsData';

interface PreviousBalanceCardProps {
  accounts: Account[];
  month: number;
  year: number;
  onUpdateBalance: (amount: number, month: number, year: number) => Promise<void>;
  getPreviousMonthBalance: (month: number, year: number) => number;
}

export const PreviousBalanceCard: React.FC<PreviousBalanceCardProps> = ({
  accounts,
  month,
  year,
  onUpdateBalance,
  getPreviousMonthBalance
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

  // Obter saldo anterior usando a nova lógica
  const previousBalance = getPreviousMonthBalance(month, year);
  const isJanuary = month === 1;

  // Atualizar input quando o saldo anterior mudar
  useEffect(() => {
    setInputValue(previousBalance.toString());
  }, [previousBalance]);

  const handleEdit = () => {
    if (!isJanuary) {
      return; // Não permite edição para meses diferentes de janeiro
    }
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
          <div className="flex items-center gap-2">
            <p className="text-sm text-slate-600">Saldo Mês Anterior</p>
            {!isJanuary && (
              <Info 
                size={14} 
                className="text-blue-500" 
                title="Calculado automaticamente baseado no saldo final do mês anterior"
              />
            )}
          </div>
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
              {isJanuary && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleEdit}
                  className="p-1 h-8 w-8 text-slate-500 hover:bg-slate-100"
                  title="Editar saldo inicial do ano"
                >
                  <Edit3 size={14} />
                </Button>
              )}
            </div>
          )}
          {!isJanuary && (
            <p className="text-xs text-slate-500 mt-1">
              Calculado automaticamente
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
