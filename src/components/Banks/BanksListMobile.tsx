import React from 'react';
import { Building2, Plus, Edit, Trash2 } from 'lucide-react';
import { Bank } from '@/hooks/useBanksData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/formatters';

interface BanksListMobileProps {
  banks: Bank[];
  onEdit: (bank: Bank) => void;
  onDelete: (id: number) => void;
  onAddDeposit: (bank: Bank) => void;
}

export const BanksListMobile: React.FC<BanksListMobileProps> = ({
  banks,
  onEdit,
  onDelete,
  onAddDeposit
}) => {
  const getAccountTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'corrente': 'Corrente',
      'poupanca': 'Poupança',
      'salario': 'Salário',
      'investimento': 'Investimento'
    };
    return types[type] || type;
  };

  const getStatusColor = (balance: number) => {
    return balance >= 0 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-red-100 text-red-800 border-red-200';
  };

  if (banks.length === 0) {
    return (
      <div className="text-center py-12 bg-background rounded-lg border">
        <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <div className="text-lg text-muted-foreground mb-2">Nenhum banco encontrado</div>
        <p className="text-muted-foreground text-sm">Comece adicionando sua primeira conta bancária.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {banks.map((bank) => (
        <div
          key={bank.id}
          className="bg-card border rounded-lg p-4 active:bg-accent/50 transition-colors"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: bank.color || '#3b82f6' }}
              >
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">
                  {bank.nickname || bank.name}
                </h3>
                <p className="text-sm text-muted-foreground truncate">{bank.name}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 mb-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Saldo:</span>
              <span className={`font-semibold text-base ${bank.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(bank.balance)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Tipo:</span>
              <Badge variant="secondary" className="text-xs">
                {getAccountTypeLabel(bank.account_type)}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Conta:</span>
              <span className="text-sm font-medium">{bank.account_number}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Agência:</span>
              <span className="text-sm font-medium">{bank.agency}</span>
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onAddDeposit(bank);
              }}
              className="flex-1 text-xs h-8"
            >
              <Plus className="h-3 w-3 mr-1" />
              Depósito
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(bank);
              }}
              className="flex-1 text-xs h-8"
            >
              <Edit className="h-3 w-3 mr-1" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Tem certeza que deseja excluir este banco?')) {
                  onDelete(bank.id);
                }
              }}
              className="flex-1 text-xs h-8 text-destructive border-destructive/20 hover:bg-destructive/5"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Excluir
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
