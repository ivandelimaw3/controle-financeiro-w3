
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Investment } from '@/hooks/useInvestmentsData';
import { Edit, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface InvestmentTableProps {
  investments: Investment[];
  onEdit: (investment: Investment) => void;
  onDelete: (id: number) => void;
}

export const InvestmentTable: React.FC<InvestmentTableProps> = ({
  investments,
  onEdit,
  onDelete
}) => {
  const calculateReturn = (invested: number, current: number) => {
    return ((current - invested) / invested) * 100;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800">Meus Investimentos</h3>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Investidor</TableHead>
              <TableHead>Investimento</TableHead>
              <TableHead>Instituição</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Investido</TableHead>
              <TableHead className="text-right">Valor Atual</TableHead>
              <TableHead className="text-right">Rentabilidade</TableHead>
              <TableHead className="text-right">Compra</TableHead>
              <TableHead className="text-right">Vencimento</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {investments.map((investment) => {
              const returnPercentage = calculateReturn(investment.invested_amount, investment.current_value);
              const isPositive = returnPercentage >= 0;
              
              return (
                <TableRow key={investment.id}>
                  <TableCell className="font-medium">
                    {investment.investor_name || '-'}
                  </TableCell>
                  <TableCell className="font-medium">{investment.name}</TableCell>
                  <TableCell>{investment.institution?.name}</TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-600">
                      {investment.type?.name}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(investment.invested_amount)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(investment.current_value)}</TableCell>
                  <TableCell className="text-right">
                    <div className={`flex items-center justify-end gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      <span className="font-medium">
                        {returnPercentage.toFixed(2)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-sm text-slate-600">
                    {format(new Date(investment.purchase_date), 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell className="text-right text-sm text-slate-600">
                    {investment.maturity_date 
                      ? format(new Date(investment.maturity_date), 'dd/MM/yyyy', { locale: ptBR })
                      : '-'
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(investment)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(investment.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      
      {investments.length === 0 && (
        <div className="p-8 text-center text-slate-500">
          Nenhum investimento cadastrado ainda.
        </div>
      )}
    </div>
  );
};
