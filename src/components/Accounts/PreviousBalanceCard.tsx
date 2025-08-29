
import React, { useState } from 'react';
import { Calendar, Edit3, Check, X, Info, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePreviousMonthBalance } from '@/hooks/usePreviousMonthBalance';
import { formatCurrency } from '@/utils/formatters';

interface PreviousBalanceCardProps {
  month: number;
  year: number;
  onBalanceChange?: (balance: number) => void;
}

export const PreviousBalanceCard: React.FC<PreviousBalanceCardProps> = ({
  month,
  year,
  onBalanceChange
}) => {
  const { previousBalance, loading, canEdit, savePreviousBalance } = usePreviousMonthBalance(year, month);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    setInputValue(previousBalance.toString());
    if (onBalanceChange) {
      onBalanceChange(previousBalance);
    }
  }, [previousBalance, onBalanceChange]);

  const handleEdit = () => {
    if (!canEdit) return;
    setInputValue(previousBalance.toString());
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setInputValue(previousBalance.toString());
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const value = parseFloat(inputValue) || 0;
      const success = await savePreviousBalance(value);
      if (success) {
        setIsEditing(false);
        if (onBalanceChange) {
          onBalanceChange(value);
        }
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const getMonthName = (month: number) => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[month - 1];
  };

  if (loading) {
    return (
      <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Calendar size={20} className="text-purple-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-600">Saldo Mês Anterior</p>
            <p className="text-lg text-slate-400">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Calendar size={20} className="text-purple-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm text-slate-600">Saldo Mês Anterior</p>
            {!canEdit && (
              <div title={`Valor calculado automaticamente baseado no saldo final de ${getMonthName(month - 1 === 0 ? 12 : month - 1)}`}>
                <Info size={14} className="text-blue-500" />
              </div>
            )}
            {month === 1 && (
              <div title="Saldo inicial do ano - pode incluir valor do ano anterior">
                <TrendingUp size={14} className="text-green-500" />
              </div>
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
                disabled={isSaving}
                autoFocus
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={handleSave}
                disabled={isSaving}
                className="p-1 h-8 w-8 text-green-600 hover:bg-green-100"
              >
                <Check size={16} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCancel}
                disabled={isSaving}
                className="p-1 h-8 w-8 text-red-600 hover:bg-red-100"
              >
                <X size={16} />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p className={`text-xl font-bold ${previousBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(previousBalance)}
              </p>
              {canEdit && (
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
          
          {!canEdit && (
            <p className="text-xs text-slate-500 mt-1">
              {month === 1 ? 'Saldo inicial do ano' : 'Calculado automaticamente'}
            </p>
          )}
          
          {canEdit && (
            <p className="text-xs text-purple-600 mt-1">
              Editável - clique no ícone para alterar
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
