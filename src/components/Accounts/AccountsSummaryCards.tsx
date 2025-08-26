import React, { useState } from 'react';
import { Clock, TrendingUp, TrendingDown, DollarSign, Calendar, Edit3 } from 'lucide-react';
import { Account } from '@/contexts/AccountsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface AccountsSummaryCardsProps {
  accounts: Account[];
  onUpdatePreviousBalance?: (amount: number) => Promise<void>;
}

export const AccountsSummaryCards: React.FC<AccountsSummaryCardsProps> = ({ 
  accounts, 
  onUpdatePreviousBalance 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Função para formatar valores em reais brasileiros
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função para obter mês/ano atual
  const getCurrentMonthYear = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  // Buscar saldo anterior do mês (conta especial tipo saldo_inicial)
  const calculateSaldoAnterior = () => {
    const currentMonthYear = getCurrentMonthYear();
    const saldoInicialAccount = accounts.find(account => 
      account.category === 'saldo_inicial' && 
      account.dueDate?.startsWith(currentMonthYear)
    );
    return saldoInicialAccount?.amount || 0;
  };

  const calculateTotalPago = () => {
    return accounts
      .filter(account => account.type === 'despesa' && account.status === 'pago')
      .reduce((sum, account) => sum + Math.abs(account.amount), 0);
  };

  const calculateTotalRecebido = () => {
    return accounts
      .filter(account => account.type === 'receita' && account.status === 'recebido')
      .reduce((sum, account) => sum + account.amount, 0);
  };

  // Saldo Final agora inclui o saldo anterior
  const calculateSaldoFinal = () => {
    const saldoAnterior = calculateSaldoAnterior();
    const saldoAtual = calculateTotalRecebido() - calculateTotalPago();
    return saldoAnterior + saldoAtual;
  };

  const calculateTotalPendente = () => {
    const receitasPendentes = accounts
      .filter(account => account.type === 'receita' && account.status === 'pendente')
      .reduce((sum, account) => sum + account.amount, 0);
    const despesasPendentes = accounts
      .filter(account => account.type === 'despesa' && account.status === 'pendente')
      .reduce((sum, account) => sum + Math.abs(account.amount), 0);
    return receitasPendentes - despesasPendentes;
  };

  // Função para lidar com a edição do saldo anterior
  const handleEditSaldoAnterior = () => {
    const currentValue = calculateSaldoAnterior();
    setEditValue(currentValue.toString());
    setIsEditing(true);
  };

  // Função para salvar o novo saldo anterior
  const handleSaveSaldoAnterior = async () => {
    if (!onUpdatePreviousBalance) return;
    
    setIsLoading(true);
    try {
      const newAmount = parseFloat(editValue.replace(',', '.')) || 0;
      await onUpdatePreviousBalance(newAmount);
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao atualizar saldo anterior:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditValue('');
  };

  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Saldo Mês Anterior - Novo Card */}
      <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Calendar size={20} className="text-purple-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">Saldo Mês Anterior</p>
              <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-purple-100"
                    onClick={handleEditSaldoAnterior}
                  >
                    <Edit3 size={12} className="text-purple-600" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Editar Saldo Mês Anterior</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Valor do Saldo Anterior
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        placeholder="0,00"
                        className="mt-1"
                        autoFocus
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={isLoading}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleSaveSaldoAnterior}
                        disabled={isLoading}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {isLoading ? 'Salvando...' : 'Salvar'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <p className={`text-xl font-bold ${calculateSaldoAnterior() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(calculateSaldoAnterior())}
            </p>
          </div>
        </div>
      </div>

      {/* Total Recebido */}
      <div className="p-4 bg-green-50 rounded-xl border border-green-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <TrendingUp size={20} className="text-green-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-600">Total Recebido</p>
            <p className="text-xl font-bold text-green-600">
              {formatCurrency(calculateTotalRecebido())}
            </p>
          </div>
        </div>
      </div>

      {/* Total Pago */}
      <div className="p-4 bg-red-50 rounded-xl border border-red-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <TrendingDown size={20} className="text-red-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-600">Total Pago</p>
            <p className="text-xl font-bold text-red-600">
              {formatCurrency(calculateTotalPago())}
            </p>
          </div>
        </div>
      </div>

      {/* Saldo Final - Agora inclui saldo anterior */}
      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <DollarSign size={20} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-600">Saldo Final</p>
            <p className={`text-xl font-bold ${calculateSaldoFinal() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(calculateSaldoFinal())}
            </p>
          </div>
        </div>
      </div>

      {/* Saldo Pendente */}
      <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Clock size={20} className="text-yellow-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-600">Saldo Pendente</p>
            <p className={`text-xl font-bold ${calculateTotalPendente() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(calculateTotalPendente())}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
