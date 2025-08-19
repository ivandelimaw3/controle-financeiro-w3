
import React from 'react';
import { Edit, Trash2, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CardAccount } from '@/hooks/useCardAccountsData';

interface CardAccountsTableProps {
  cardAccounts: CardAccount[];
  loading: boolean;
  onEdit: (cardAccount: CardAccount) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: 'pendente' | 'pago') => void;
}

export const CardAccountsTable: React.FC<CardAccountsTableProps> = ({
  cardAccounts,
  loading,
  onEdit,
  onDelete,
  onStatusChange
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Badge variant="outline" className="text-orange-600 border-orange-600">Pendente</Badge>;
      case 'pago':
        return <Badge variant="outline" className="text-green-600 border-green-600">Pago</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Clock className="h-4 w-4 text-orange-600" />;
      case 'pago':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-500">Carregando contas de cartões...</div>
        </div>
      </div>
    );
  }

  if (cardAccounts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center py-8">
          <div className="text-gray-500 mb-2">Nenhuma conta de cartão encontrada</div>
          <div className="text-sm text-gray-400">Adicione uma nova conta para começar</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descrição
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoria
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vencimento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cardAccounts.map((cardAccount) => (
              <tr key={cardAccount.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {cardAccount.description}
                  </div>
                  {cardAccount.parcela && (
                    <div className="text-sm text-gray-500">
                      Parcela: {cardAccount.parcela}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 capitalize">
                    {cardAccount.category}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(cardAccount.amount)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatDate(cardAccount.due_date)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(cardAccount.status)}
                    <button
                      onClick={() => onStatusChange(
                        cardAccount.id,
                        cardAccount.status === 'pendente' ? 'pago' : 'pendente'
                      )}
                      className="cursor-pointer"
                    >
                      {getStatusBadge(cardAccount.status)}
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(cardAccount)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(cardAccount.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
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
