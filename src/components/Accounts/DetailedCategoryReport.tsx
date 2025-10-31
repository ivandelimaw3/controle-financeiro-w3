import React from 'react';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/utils/formatters';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface CategoryData {
  category: string;
  color: string;
  totalReceived: number;
  totalPaid: number;
  balance: number;
  receivedCount: number;
  paidCount: number;
}

interface DetailedCategoryReportProps {
  accounts: any[];
  categories: any[];
}

export const DetailedCategoryReport: React.FC<DetailedCategoryReportProps> = ({ accounts, categories }) => {
  // Agrupar dados por categoria
  const categoryData = React.useMemo(() => {
    const dataMap = new Map<string, CategoryData>();

    // Inicializar todas as categorias
    categories.forEach(cat => {
      dataMap.set(cat.name, {
        category: cat.name,
        color: cat.color || '#3B82F6',
        totalReceived: 0,
        totalPaid: 0,
        balance: 0,
        receivedCount: 0,
        paidCount: 0
      });
    });

    // Processar contas
    accounts.forEach(acc => {
      if (acc.description === "Saldo Anterior") return;
      
      if (!dataMap.has(acc.category)) {
        dataMap.set(acc.category, {
          category: acc.category,
          color: '#94A3B8',
          totalReceived: 0,
          totalPaid: 0,
          balance: 0,
          receivedCount: 0,
          paidCount: 0
        });
      }

      const data = dataMap.get(acc.category)!;
      
      if (acc.type === 'receita' && acc.status === 'recebido') {
        data.totalReceived += acc.amount || 0;
        data.receivedCount++;
        data.balance += acc.amount || 0;
      } else if (acc.type === 'despesa' && acc.status === 'pago') {
        data.totalPaid += Math.abs(acc.amount || 0);
        data.paidCount++;
        data.balance -= Math.abs(acc.amount || 0);
      }
    });

    return Array.from(dataMap.values())
      .filter(data => data.totalReceived > 0 || data.totalPaid > 0)
      .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance));
  }, [accounts, categories]);

  // Calcular totais gerais
  const totals = React.useMemo(() => {
    return categoryData.reduce((acc, data) => ({
      totalReceived: acc.totalReceived + data.totalReceived,
      totalPaid: acc.totalPaid + data.totalPaid,
      balance: acc.balance + data.balance,
      receivedCount: acc.receivedCount + data.receivedCount,
      paidCount: acc.paidCount + data.paidCount
    }), {
      totalReceived: 0,
      totalPaid: 0,
      balance: 0,
      receivedCount: 0,
      paidCount: 0
    });
  }, [categoryData]);

  return (
    <div className="space-y-6">
      {/* Cards de Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Total Recebido</p>
              <p className="text-3xl font-bold">{formatCurrency(totals.totalReceived)}</p>
              <p className="text-xs opacity-75 mt-2">{totals.receivedCount} transações</p>
            </div>
            <TrendingUp size={40} className="opacity-80" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-red-500 to-red-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Total Pago</p>
              <p className="text-3xl font-bold">{formatCurrency(totals.totalPaid)}</p>
              <p className="text-xs opacity-75 mt-2">{totals.paidCount} transações</p>
            </div>
            <TrendingDown size={40} className="opacity-80" />
          </div>
        </Card>

        <Card className={`p-6 bg-gradient-to-br ${totals.balance >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'} text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Saldo Total</p>
              <p className="text-3xl font-bold">{formatCurrency(totals.balance)}</p>
              <p className="text-xs opacity-75 mt-2">{totals.receivedCount + totals.paidCount} transações</p>
            </div>
            <div className="text-4xl opacity-80">{totals.balance >= 0 ? '📈' : '📉'}</div>
          </div>
        </Card>
      </div>

      {/* Tabela Detalhada por Categoria */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Detalhamento por Categoria</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="text-left py-4 px-4 font-semibold text-slate-700">Categoria</th>
                <th className="text-right py-4 px-4 font-semibold text-slate-700">Recebido</th>
                <th className="text-right py-4 px-4 font-semibold text-slate-700">Pago</th>
                <th className="text-right py-4 px-4 font-semibold text-slate-700">Saldo</th>
                <th className="text-center py-4 px-4 font-semibold text-slate-700">Transações</th>
              </tr>
            </thead>
            <tbody>
              {categoryData.map((data, index) => (
                <tr 
                  key={data.category}
                  className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                  }`}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: data.color }}
                      />
                      <span className="font-medium text-slate-800">{data.category}</span>
                    </div>
                  </td>
                  <td className="text-right py-4 px-4">
                    <span className="text-green-600 font-semibold">
                      {formatCurrency(data.totalReceived)}
                    </span>
                    <span className="text-xs text-slate-500 ml-2">({data.receivedCount})</span>
                  </td>
                  <td className="text-right py-4 px-4">
                    <span className="text-red-600 font-semibold">
                      {formatCurrency(data.totalPaid)}
                    </span>
                    <span className="text-xs text-slate-500 ml-2">({data.paidCount})</span>
                  </td>
                  <td className="text-right py-4 px-4">
                    <span className={`font-bold ${data.balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                      {formatCurrency(data.balance)}
                    </span>
                  </td>
                  <td className="text-center py-4 px-4">
                    <span className="text-slate-600 font-medium">
                      {data.receivedCount + data.paidCount}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-300 bg-slate-100 font-bold">
                <td className="py-4 px-4 text-slate-800">TOTAL</td>
                <td className="text-right py-4 px-4 text-green-700">
                  {formatCurrency(totals.totalReceived)}
                </td>
                <td className="text-right py-4 px-4 text-red-700">
                  {formatCurrency(totals.totalPaid)}
                </td>
                <td className="text-right py-4 px-4">
                  <span className={totals.balance >= 0 ? 'text-blue-700' : 'text-orange-700'}>
                    {formatCurrency(totals.balance)}
                  </span>
                </td>
                <td className="text-center py-4 px-4 text-slate-800">
                  {totals.receivedCount + totals.paidCount}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
};
