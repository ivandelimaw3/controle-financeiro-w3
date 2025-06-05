
import React from 'react';
import { AlertTriangle, Calendar } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAccounts } from '@/contexts/AccountsContext';

export const ExpiringAccountsAlert: React.FC = () => {
  const { accounts } = useAccounts();

  // Calcular data de amanhã
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  // Filtrar despesas que vencem amanhã e estão pendentes
  const expiringAccounts = accounts.filter(account => {
    if (account.type !== 'despesa' || account.status !== 'pendente') {
      return false;
    }

    const dueDate = new Date(account.dueDate);
    dueDate.setHours(0, 0, 0, 0);

    return dueDate.getTime() === tomorrow.getTime();
  });

  if (expiringAccounts.length === 0) {
    return null;
  }

  const formatCurrency = (amount: number) => {
    return `R$ ${Math.abs(amount).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="flex items-center gap-2">
        <Calendar size={16} />
        Despesas Vencendo Amanhã
      </AlertTitle>
      <AlertDescription>
        <div className="mt-2 space-y-2">
          <p className="text-sm font-medium">
            {expiringAccounts.length} despesa{expiringAccounts.length > 1 ? 's' : ''} vence{expiringAccounts.length === 1 ? '' : 'm'} amanhã:
          </p>
          <div className="space-y-1">
            {expiringAccounts.map((account) => (
              <div key={account.id} className="flex justify-between items-center p-2 bg-red-50 rounded text-sm">
                <div>
                  <span className="font-medium">{account.description}</span>
                  <span className="text-red-600 ml-2">({account.category})</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-red-700">
                    {formatCurrency(account.amount)}
                  </div>
                  <div className="text-xs text-red-600">
                    {formatDate(account.dueDate)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 p-2 bg-red-100 rounded">
            <span className="font-semibold text-red-800">
              Total a vencer: {formatCurrency(
                expiringAccounts.reduce((sum, account) => sum + Math.abs(account.amount), 0)
              )}
            </span>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};
