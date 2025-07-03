import React from 'react';
import { Calendar, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDate } from '@/lib/dateUtils';

interface Parcela {
  id: number;
  description: string;
  amount: number;
  due_date: string;
  category: string;
  type: 'receita' | 'despesa';
  status: 'pendente' | 'pago' | 'recebido';
}

interface ParcelasTableProps {
  parcelas: Parcela[];
  onStatusChange: (id: number, status: string) => void;
}

export const ParcelasTable: React.FC<ParcelasTableProps> = ({
  parcelas,
  onStatusChange
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago':
      case 'recebido':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (parcelas.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
        <DollarSign size={48} className="mx-auto text-slate-400 mb-4" />
        <h3 className="text-lg font-semibold text-slate-700 mb-2">Nenhuma parcela encontrada</h3>
        <p className="text-slate-500">As parcelas das recorrências aparecerão aqui.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800">Parcelas Geradas</h3>
        <p className="text-sm text-slate-600">Controle o status das parcelas das suas recorrências</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left p-4 font-semibold text-slate-700">Descrição</th>
              <th className="text-left p-4 font-semibold text-slate-700">Categoria</th>
              <th className="text-left p-4 font-semibold text-slate-700">Valor</th>
              <th className="text-left p-4 font-semibold text-slate-700">Vencimento</th>
              <th className="text-left p-4 font-semibold text-slate-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {parcelas.map((parcela, index) => (
              <tr key={parcela.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-25'}`}>
                <td className="py-2 px-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${parcela.type === 'receita' ? 'bg-green-100' : 'bg-red-100'}`}>
                      <DollarSign size={16} className={parcela.type === 'receita' ? 'text-green-600' : 'text-red-600'} />
                    </div>
                    <span className="font-semibold text-sm text-slate-800">{parcela.description}</span>
                  </div>
                </td>
                <td className="py-2 px-4 text-slate-600">{parcela.category}</td>
                <td className="py-2 px-4">
                  <span className={`font-semibold ${parcela.type === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                    {parcela.type === 'receita' ? '+' : '-'}R$ {Math.abs(parcela.amount).toFixed(2)}
                  </span>
                </td>
                <td className="py-2 px-4">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar size={14} />
                    {formatDate(parcela.due_date)}
                  </div>
                </td>
                <td className="py-2 px-4">
                  <Select
                    value={parcela.status}
                    onValueChange={(value) => onStatusChange(parcela.id, value)}
                  >
                    <SelectTrigger className={`w-32 h-8 text-xs ${getStatusColor(parcela.status)}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value={parcela.type === 'receita' ? 'recebido' : 'pago'}>
                        {parcela.type === 'receita' ? 'Recebido' : 'Pago'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};