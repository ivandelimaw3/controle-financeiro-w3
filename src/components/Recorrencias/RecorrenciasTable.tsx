import React from 'react';
import { Edit, Trash2, Calendar, DollarSign, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Recorrencia } from '@/hooks/useRecorrenciasData';
import { formatDate } from '@/lib/dateUtils';

interface RecorrenciasTableProps {
  recorrencias: Recorrencia[];
  onEdit: (recorrencia: Recorrencia) => void;
  onDelete: (id: string) => void;
  onStatusChange?: (recorrenciaId: string, status: string) => void;
}

export const RecorrenciasTable: React.FC<RecorrenciasTableProps> = ({
  recorrencias,
  onEdit,
  onDelete,
  onStatusChange
}) => {
  const getFrequenciaLabel = (frequencia: string) => {
    switch (frequencia) {
      case 'semanal': return 'Semanal';
      case 'mensal': return 'Mensal';
      case 'anual': return 'Anual';
      default: return frequencia;
    }
  };

  const getTipoColor = (tipo: string) => {
    return tipo === 'receita' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

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

  if (recorrencias.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
        <RotateCcw size={48} className="mx-auto text-slate-400 mb-4" />
        <h3 className="text-lg font-semibold text-slate-700 mb-2">Nenhuma recorrência encontrada</h3>
        <p className="text-slate-500">Crie sua primeira recorrência para automatizar suas finanças.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
           <thead className="bg-slate-50 border-b border-slate-200">
             <tr>
               <th className="text-left p-4 font-semibold text-slate-700">Título</th>
               <th className="text-left p-4 font-semibold text-slate-700">Tipo</th>
               <th className="text-left p-4 font-semibold text-slate-700">Valor da Parcela</th>
               <th className="text-left p-4 font-semibold text-slate-700">Categoria</th>
               <th className="text-left p-4 font-semibold text-slate-700">Frequência</th>
               <th className="text-left p-4 font-semibold text-slate-700">Próxima Execução</th>
               <th className="text-left p-4 font-semibold text-slate-700">Status</th>
               <th className="text-left p-4 font-semibold text-slate-700">Ações</th>
             </tr>
           </thead>
          <tbody>
            {recorrencias.map((recorrencia, index) => (
              <tr key={recorrencia.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-25'}`}>
                <td className="py-2 px-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${recorrencia.tipo === 'receita' ? 'bg-green-100' : 'bg-red-100'}`}>
                      <DollarSign size={16} className={recorrencia.tipo === 'receita' ? 'text-green-600' : 'text-red-600'} />
                    </div>
                    <span className="font-semibold text-sm text-slate-800">{recorrencia.titulo}</span>
                  </div>
                </td>
                 <td className="py-2 px-4">
                   <Badge className={getTipoColor(recorrencia.tipo)}>
                     {recorrencia.tipo === 'receita' ? 'Receita' : 'Despesa'}
                   </Badge>
                 </td>
                 <td className="py-2 px-4">
                   <span className={`font-semibold ${recorrencia.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                     {recorrencia.tipo === 'receita' ? '+' : '-'}R$ {Math.abs(recorrencia.valor / (recorrencia.installments || 1)).toFixed(2)}
                   </span>
                 </td>
                 <td className="py-2 px-4 text-slate-600">{recorrencia.categoria}</td>
                 <td className="py-2 px-4">
                   <Badge variant="outline">{getFrequenciaLabel(recorrencia.frequencia)}</Badge>
                 </td>
                 <td className="py-2 px-4">
                   <div className="flex items-center gap-2 text-slate-600">
                     <Calendar size={14} />
                     {formatDate(recorrencia.proxima_execucao)}
                   </div>
                 </td>
                  <td className="py-2 px-4">
                    {onStatusChange ? (
                      <Select
                        value={recorrencia.status || 'pendente'}
                        onValueChange={(value) => onStatusChange(recorrencia.id, value)}
                      >
                        <SelectTrigger className={`w-32 h-8 text-xs ${getStatusColor(recorrencia.status || 'pendente')}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pendente">Pendente</SelectItem>
                          <SelectItem value={recorrencia.tipo === 'receita' ? 'recebido' : 'pago'}>
                            {recorrencia.tipo === 'receita' ? 'Recebido' : 'Pago'}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge className={getStatusColor(recorrencia.status || 'pendente')}>
                        {recorrencia.status === 'pago' ? 'Pago' : recorrencia.status === 'recebido' ? 'Recebido' : 'Pendente'}
                      </Badge>
                    )}
                  </td>
                 <td className="py-2 px-4">
                   <div className="flex gap-2">
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => onEdit(recorrencia)}
                       className="hover:bg-blue-50 hover:border-blue-300"
                     >
                       <Edit size={14} />
                     </Button>
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => onDelete(recorrencia.id)}
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