
import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CardAccount } from '@/hooks/useCardAccounts';

interface CardAccountsTableProps {
  cardAccounts: CardAccount[];
  onEdit: (cardAccount: CardAccount) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: 'pendente' | 'pago') => void;
  isDeleting?: boolean;
}

export const CardAccountsTable: React.FC<CardAccountsTableProps> = ({
  cardAccounts,
  onEdit,
  onDelete,
  onStatusChange,
  isDeleting = false
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago':
        return 'bg-green-100 text-green-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (cardAccounts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-lg text-gray-600 mb-4">Nenhuma conta encontrada</div>
        <p className="text-gray-500">Comece adicionando sua primeira conta de cartão.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Descrição</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Vencimento</TableHead>
            <TableHead>Data Compra</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Fonte Pagamento</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cardAccounts.map((account) => (
            <TableRow key={account.id}>
              <TableCell className="font-medium">
                {account.description}
              </TableCell>
              <TableCell>
                {formatCurrency(account.amount)}
              </TableCell>
              <TableCell>
                {formatDate(account.due_date)}
              </TableCell>
              <TableCell>
                {account.data_conta ? formatDate(account.data_conta) : '-'}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: account.category_color || '#3B82F6' }}
                  />
                  {account.category_name || 'Sem categoria'}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <div className="font-medium">
                    {account.payment_source === 'card' ? 'Cartão' : account.payment_source || 'Cartão'}
                  </div>
                  <div className="text-gray-500">
                    {account.payment_source_name || account.card_name || 'Cartão não encontrado'}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Select
                  value={account.status}
                  onValueChange={(value) => onStatusChange(account.id, value as 'pendente' | 'pago')}
                >
                  <SelectTrigger className={`w-32 h-8 text-xs ${getStatusColor(account.status)}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="pago">Pago</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(account)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(account.id)}
                    disabled={isDeleting}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
