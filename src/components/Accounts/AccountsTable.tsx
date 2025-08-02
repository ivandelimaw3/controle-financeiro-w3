import React from 'react';
import { Edit2, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Account {
  id: number;
  description: string;
  amount: number;
  category: string;
  dueDate: string;
  type: 'receita' | 'despesa';
  status: 'pendente' | 'pago' | 'recebido';
  parcela?: string;
  payment_source?: 'bank' | 'card';
  payment_source_id?: number;
}

interface AccountsTableProps {
  accounts: Account[];
  onEdit: (account: Account) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: string) => void;
}

export const AccountsTable: React.FC<AccountsTableProps> = ({
  accounts,
  onEdit,
  onDelete,
  onStatusChange
}) => {
  
  const handleStatusChange = (accountId: number, newStatus: string) => {
    console.log('=== AccountsTable handleStatusChange ===');
    console.log('Account ID:', accountId);
    console.log('New status:', newStatus);
    console.log('Calling onStatusChange...');
    onStatusChange(accountId, newStatus);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Data inválida';
    }
  };

  if (accounts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-600">Nenhuma conta encontrada</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-3 px-4 font-semibold text-slate-700">Descrição</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-700">Categoria</th>
            <th className="text-right py-3 px-4 font-semibold text-slate-700">Valor</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-700">Data</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
            <th className="text-center py-3 px-4 font-semibold text-slate-700">Ações</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((account) => (
            <tr key={account.id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-3 px-4">
                <div>
                  <div className="font-medium text-slate-900">{account.description}</div>
                  {account.parcela && (
                    <div className="text-sm text-slate-500">Parcela: {account.parcela}</div>
                  )}
                </div>
              </td>
              <td className="py-3 px-4">
                <span className="inline-block bg-slate-100 text-slate-700 px-2 py-1 rounded-full text-sm">
                  {account.category}
                </span>
              </td>
              <td className="py-3 px-4 text-right">
                <span className={`font-semibold ${
                  account.type === 'receita' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(Math.abs(account.amount))}
                </span>
              </td>
              <td className="py-3 px-4 text-slate-600">
                {formatDate(account.dueDate)}
              </td>
              <td className="py-3 px-4">
                <Select
                  value={account.status}
                  onValueChange={(value) => handleStatusChange(account.id, value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-yellow-500" />
                        <span>Pendente</span>
                      </div>
                    </SelectItem>
                    <SelectItem value={account.type === 'receita' ? 'recebido' : 'pago'}>
                      <div className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-500" />
                        <span>{account.type === 'receita' ? 'Recebido' : 'Pago'}</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(account)}
                  >
                    <Edit2 size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDelete(account.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
