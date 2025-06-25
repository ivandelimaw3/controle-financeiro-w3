
import React from 'react';
import { Building2, Edit, Trash2, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bank } from '@/hooks/useBanksData';

interface BankCardProps {
  bank: Bank;
  onEdit: (bank: Bank) => void;
  onDelete: (id: number) => void;
  onAddDeposit: (bank: Bank) => void;
}

export const BankCard: React.FC<BankCardProps> = ({
  bank,
  onEdit,
  onDelete,
  onAddDeposit
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getAccountTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'corrente': 'Corrente',
      'poupanca': 'Poupança',
      'salario': 'Salário',
      'investimento': 'Investimento'
    };
    return types[type] || type;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-blue-600" />
            <div>
              <CardTitle className="text-lg">
                {bank.nickname || bank.name}
              </CardTitle>
              {bank.nickname && (
                <p className="text-sm text-muted-foreground">{bank.name}</p>
              )}
            </div>
          </div>
          <Badge variant="secondary">
            {getAccountTypeLabel(bank.account_type)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Agência</p>
            <p className="font-medium">{bank.agency}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Conta</p>
            <p className="font-medium">{bank.account_number}</p>
          </div>
        </div>

        <div className="pt-2 border-t">
          <p className="text-sm text-muted-foreground">Saldo Atual</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(bank.balance)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Última atualização: {formatDate(bank.updated_at)}
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddDeposit(bank)}
            className="flex-1"
          >
            <Plus className="h-4 w-4 mr-1" />
            Depósito
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(bank)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(bank.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
