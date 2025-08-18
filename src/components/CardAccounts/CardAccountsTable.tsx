
import React from 'react';
import { Edit, Trash2, Calendar, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { CardAccountData } from '@/hooks/useCardAccountsData';

interface CardAccountsTableProps {
  accounts: CardAccountData[];
  onEdit: (account: CardAccountData) => void;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}

export const CardAccountsTable = ({ accounts, onEdit, onDelete, isDeleting }: CardAccountsTableProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'pendente': 'secondary',
      'pago': 'default'
    } as const;

    const labels = {
      'pendente': 'Pendente',
      'pago': 'Pago'
    };

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (accounts.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-8 text-center">
        <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma conta encontrada</h3>
        <p className="text-gray-600">Comece adicionando uma nova conta de cartão.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Descrição</TableHead>
            <TableHead>Cartão</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Vencimento</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Parcela</TableHead>
            <TableHead className="w-32">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.map((account) => (
            <TableRow key={account.id}>
              <TableCell className="font-medium">{account.description}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4 text-gray-400" />
                  <span>{account.creditcard?.card_name || 'N/A'}</span>
                </div>
              </TableCell>
              <TableCell>{account.category}</TableCell>
              <TableCell className="font-mono">{formatCurrency(account.amount)}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>{formatDate(account.due_date)}</span>
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(account.status)}</TableCell>
              <TableCell>{account.parcela || '-'}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(account)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(account.id)}
                    disabled={isDeleting}
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
