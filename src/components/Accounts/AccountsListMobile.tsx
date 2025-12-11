import React, { useState, useMemo } from 'react';
import { Account } from '@/contexts/AccountsContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatCurrency } from '@/utils/formatters';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AccountsListMobileProps {
  accounts: Account[];
  onEdit?: (account: Account) => void;
  onDelete?: (id: number) => void;
}

interface CategoryGroup {
  category: string;
  accounts: Account[];
  total: number;
  type: 'receita' | 'despesa';
}

export const AccountsListMobile: React.FC<AccountsListMobileProps> = ({ accounts, onEdit, onDelete }) => {
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Agrupar contas por categoria e tipo (mesmo estilo do desktop)
  const groupedByCategory = useMemo(() => {
    const receitas = accounts.filter(a => a.type === 'receita');
    const despesas = accounts.filter(a => a.type === 'despesa');

    // Agrupar receitas por categoria
    const receitasGroups: Record<string, CategoryGroup> = {};
    receitas.forEach(account => {
      const category = account.category || 'Sem Categoria';
      if (!receitasGroups[category]) {
        receitasGroups[category] = {
          category,
          accounts: [],
          total: 0,
          type: 'receita'
        };
      }
      receitasGroups[category].accounts.push(account);
      receitasGroups[category].total += Math.abs(account.amount);
    });

    // Agrupar despesas por categoria
    const despesasGroups: Record<string, CategoryGroup> = {};
    despesas.forEach(account => {
      const category = account.category || 'Sem Categoria';
      if (!despesasGroups[category]) {
        despesasGroups[category] = {
          category,
          accounts: [],
          total: 0,
          type: 'despesa'
        };
      }
      despesasGroups[category].accounts.push(account);
      despesasGroups[category].total += Math.abs(account.amount);
    });

    // Ordenar contas por data dentro de cada grupo
    Object.values(receitasGroups).forEach(group => {
      group.accounts.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    });
    Object.values(despesasGroups).forEach(group => {
      group.accounts.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    });

    return {
      receitas: Object.values(receitasGroups).sort((a, b) => a.category.localeCompare(b.category)),
      despesas: Object.values(despesasGroups).sort((a, b) => a.category.localeCompare(b.category))
    };
  }, [accounts]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago':
        return 'bg-red-100 text-red-700';
      case 'recebido':
        return 'bg-green-100 text-green-700';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    if (status === 'pago') return 'Pago';
    if (status === 'recebido') return 'Recebido';
    return 'Pendente';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('T')[0].split('-');
    return `${day}/${month}`;
  };

  const totalReceitas = groupedByCategory.receitas.reduce((acc, g) => acc + g.total, 0);
  const totalDespesas = groupedByCategory.despesas.reduce((acc, g) => acc + g.total, 0);

  if (accounts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500 text-sm">Nenhuma conta encontrada</p>
      </div>
    );
  }

  const handleEdit = () => {
    if (selectedAccount) {
      onEdit?.(selectedAccount);
      setSelectedAccount(null);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedAccount) {
      onDelete?.(selectedAccount.id);
    }
    setShowDeleteDialog(false);
    setSelectedAccount(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
  };

  return (
    <>
      <ScrollArea className="h-[calc(100vh-480px)]">
        <div className="space-y-4 pr-2">
          {/* RECEITAS */}
          {groupedByCategory.receitas.length > 0 && (
            <div>
              <div className="bg-green-600 text-white px-3 py-2 rounded-t-lg">
                <span className="font-bold text-sm">RECEITAS</span>
              </div>
              <div className="space-y-2 mt-2">
                {groupedByCategory.receitas.map((group) => (
                  <div key={group.category} className="bg-white rounded-lg border border-green-200 overflow-hidden">
                    {/* Category Header */}
                    <div className="px-3 py-2 bg-green-50 border-b border-green-200">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-green-800 text-sm">{group.category}</span>
                        <span className="text-xs text-green-600">({group.accounts.length} itens)</span>
                      </div>
                    </div>
                    
                    {/* Accounts List */}
                    <div className="divide-y divide-green-50">
                      {group.accounts.map((account, index) => (
                        <div 
                          key={account.id} 
                          onClick={() => setSelectedAccount(account)}
                          className="px-3 py-2 flex justify-between items-center cursor-pointer hover:bg-green-50 active:bg-green-100 transition-colors"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-[10px] text-slate-400 w-5">{index + 1}.</span>
                            <div className="flex flex-col flex-1 min-w-0">
                              <span className="text-xs text-slate-700 truncate">{account.description}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-400">{formatDate(account.dueDate)}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${getStatusColor(account.status)}`}>
                                  {getStatusLabel(account.status)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-green-600 whitespace-nowrap ml-2">
                            {formatCurrency(Math.abs(account.amount))}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Category Total */}
                    <div className="px-3 py-2 bg-green-100 flex justify-between items-center">
                      <span className="text-xs font-bold text-green-800">Subtotal:</span>
                      <span className="text-sm font-bold text-green-700">{formatCurrency(group.total)}</span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Total Receitas */}
              <div className="mt-2 px-3 py-2 bg-green-600 text-white rounded-lg flex justify-between items-center">
                <span className="font-bold text-sm">TOTAL RECEITAS:</span>
                <span className="font-bold text-sm">{formatCurrency(totalReceitas)}</span>
              </div>
            </div>
          )}

          {/* DESPESAS */}
          {groupedByCategory.despesas.length > 0 && (
            <div>
              <div className="bg-red-600 text-white px-3 py-2 rounded-t-lg">
                <span className="font-bold text-sm">DESPESAS</span>
              </div>
              <div className="space-y-2 mt-2">
                {groupedByCategory.despesas.map((group) => (
                  <div key={group.category} className="bg-white rounded-lg border border-red-200 overflow-hidden">
                    {/* Category Header */}
                    <div className="px-3 py-2 bg-red-50 border-b border-red-200">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-red-800 text-sm">{group.category}</span>
                        <span className="text-xs text-red-600">({group.accounts.length} itens)</span>
                      </div>
                    </div>
                    
                    {/* Accounts List */}
                    <div className="divide-y divide-red-50">
                      {group.accounts.map((account, index) => (
                        <div 
                          key={account.id} 
                          onClick={() => setSelectedAccount(account)}
                          className="px-3 py-2 flex justify-between items-center cursor-pointer hover:bg-red-50 active:bg-red-100 transition-colors"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-[10px] text-slate-400 w-5">{index + 1}.</span>
                            <div className="flex flex-col flex-1 min-w-0">
                              <span className="text-xs text-slate-700 truncate">{account.description}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-400">{formatDate(account.dueDate)}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${getStatusColor(account.status)}`}>
                                  {getStatusLabel(account.status)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-red-600 whitespace-nowrap ml-2">
                            {formatCurrency(Math.abs(account.amount))}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Category Total */}
                    <div className="px-3 py-2 bg-red-100 flex justify-between items-center">
                      <span className="text-xs font-bold text-red-800">Subtotal:</span>
                      <span className="text-sm font-bold text-red-700">{formatCurrency(group.total)}</span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Total Despesas */}
              <div className="mt-2 px-3 py-2 bg-red-600 text-white rounded-lg flex justify-between items-center">
                <span className="font-bold text-sm">TOTAL DESPESAS:</span>
                <span className="font-bold text-sm">{formatCurrency(totalDespesas)}</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Sheet para opções de editar/deletar */}
      <Sheet open={!!selectedAccount} onOpenChange={(open) => !open && setSelectedAccount(null)}>
        <SheetContent side="bottom" className="h-auto">
          <SheetHeader>
            <SheetTitle className="text-left">Opções</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-3 mt-6 pb-4">
            <Button
              onClick={handleEdit}
              variant="outline"
              className="w-full h-14 justify-start gap-3 text-base"
            >
              <Pencil className="h-5 w-5" />
              Editar Conta
            </Button>
            <Button
              onClick={handleDeleteClick}
              variant="outline"
              className="w-full h-14 justify-start gap-3 text-base text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-5 w-5" />
              Excluir Conta
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={(open) => !open && handleCancelDelete()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
