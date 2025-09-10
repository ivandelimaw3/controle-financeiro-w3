import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/utils/formatters';

interface MonthlyData {
  month: string;
  totalRecebido: number;
  totalPago: number;
  saldoFinal: number;
}

interface MonthlyReportTableProps {
  monthlyData: MonthlyData[];
  totalReceived: number;
  totalPaid: number;
  finalBalance: number;
}

export const MonthlyReportTable: React.FC<MonthlyReportTableProps> = ({
  monthlyData,
  totalReceived,
  totalPaid,
  finalBalance
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
      <h2 className="text-xl font-semibold text-slate-800 mb-4">Relatório dos Últimos 12 Meses</h2>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left font-semibold text-slate-700">Mês</TableHead>
              <TableHead className="text-right font-semibold text-green-600">Total Recebido</TableHead>
              <TableHead className="text-right font-semibold text-red-600">Total Pago</TableHead>
              <TableHead className="text-right font-semibold text-slate-700">Saldo Final</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {monthlyData.map((data, index) => (
              <TableRow key={index} className="hover:bg-slate-50">
                <TableCell className="font-medium text-slate-700">{data.month}</TableCell>
                <TableCell className="text-right text-green-600 font-medium">
                  {formatCurrency(data.totalRecebido)}
                </TableCell>
                <TableCell className="text-right text-red-600 font-medium">
                  {formatCurrency(data.totalPago)}
                </TableCell>
                <TableCell className={`text-right font-semibold ${
                  data.saldoFinal >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(data.saldoFinal)}
                </TableCell>
              </TableRow>
            ))}
            
            {/* Linha de totais */}
            <TableRow className="border-t-2 border-slate-300 bg-slate-50">
              <TableCell className="font-bold text-slate-800 text-lg">TOTAIS GERAIS</TableCell>
              <TableCell className="text-right text-green-600 font-bold text-lg">
                {formatCurrency(totalReceived)}
              </TableCell>
              <TableCell className="text-right text-red-600 font-bold text-lg">
                {formatCurrency(totalPaid)}
              </TableCell>
              <TableCell className={`text-right font-bold text-lg ${
                finalBalance >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(finalBalance)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};