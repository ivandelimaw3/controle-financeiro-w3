
import React from 'react';
import { Edit, Trash2, Calendar, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Account } from '@/contexts/AccountsContext';

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
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago':
      case 'recebido':
        return 'bg-green-100 text-green-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    
    try {
      // Trata a data como local para evitar problemas de timezone
      const date = new Date(dateString + 'T00:00:00');
      if (isNaN(date.getTime())) return '-';
      
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      console.error('Error formatting date:', error);
      return '-';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left p-4 font-semibold text-slate-700">Descrição</th>
              <th className="text-left p-4 font-semibold text-slate-700">Categoria</th>
              <th className="text-left p-4 font-semibold text-slate-700">Valor</th>
              <th className="text-left p-4 font-semibold text-slate-700">Vencimento</th>
              <th className="text-left p-4 font-semibold text-slate-700">Status</th>
              <th className="text-left p-4 font-semibold text-slate-700">Ações</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account, index) => (
              <tr key={account.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-25'}`}>
                <td className="py-2 px-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${account.type === 'receita' ? 'bg-green-100' : 'bg-red-100'}`}>
                      <DollarSign size={16} className={account.type === 'receita' ? 'text-green-600' : 'text-red-600'} />
                    </div>
                    <span className="font-semibold text-sm text-slate-800">{account.description}</span>
                  </div>
                </td>
                <td className="py-2 px-4 text-slate-600">{account.category}</td>
                <td className="py-2 px-4">
                  <span className={`font-semibold ${account.type === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                    {account.type === 'receita' ? '+' : '-'}R$ {Math.abs(account.amount).toFixed(2)}
                  </span>
                </td>
                <td className="py-2 px-4">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar size={14} />
                    {formatDate(account.dueDate)}
                  </div>
                </td>
                <td className="py-2 px-4">
                  <Select
                    value={account.status}
                    onValueChange={(value) => onStatusChange(account.id, value)}
                  >
                    <SelectTrigger className={`w-32 h-8 text-xs ${getStatusColor(account.status)}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value={account.type === 'receita' ? 'recebido' : 'pago'}>
                        {account.type === 'receita' ? 'Recebido' : 'Pago'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="py-2 px-4">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(account)}
                      className="hover:bg-blue-50 hover:border-blue-300"
                    >
                      <Edit size={14} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(account.id)}
                      className="hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
