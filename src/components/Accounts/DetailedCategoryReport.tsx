import React from 'react';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/utils/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CategoryItem {
  description: string;
  amount: number;
}

interface CategoryData {
  category: string;
  color: string;
  items: CategoryItem[];
  total: number;
}

interface DetailedCategoryReportProps {
  accounts: any[];
  categories: any[];
}

export const DetailedCategoryReport: React.FC<DetailedCategoryReportProps> = ({ accounts, categories }) => {
  // Obter informações do mês atual
  const currentDate = new Date();
  const monthYear = format(currentDate, "MMMM 'de' yyyy", { locale: ptBR });
  const startOfMonth = format(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1), "dd/MM/yyyy");
  const endOfMonth = format(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0), "dd/MM/yyyy");
  const generationDate = format(currentDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });

  // Agrupar RECEITAS por categoria
  const incomeByCategory = React.useMemo(() => {
    const dataMap = new Map<string, CategoryData>();

    accounts.forEach(acc => {
      if (acc.description === "Saldo Anterior" || acc.type !== 'receita' || acc.status !== 'recebido') return;
      
      const categoryName = acc.category || 'Sem Categoria';
      const categoryColor = categories.find(c => c.name === categoryName)?.color || '#94A3B8';
      
      if (!dataMap.has(categoryName)) {
        dataMap.set(categoryName, {
          category: categoryName,
          color: categoryColor,
          items: [],
          total: 0
        });
      }

      const data = dataMap.get(categoryName)!;
      data.items.push({
        description: acc.description,
        amount: acc.amount || 0
      });
      data.total += acc.amount || 0;
    });

    return Array.from(dataMap.values()).sort((a, b) => b.total - a.total);
  }, [accounts, categories]);

  // Agrupar DESPESAS por categoria
  const expensesByCategory = React.useMemo(() => {
    const dataMap = new Map<string, CategoryData>();

    accounts.forEach(acc => {
      if (acc.description === "Saldo Anterior" || acc.type !== 'despesa' || acc.status !== 'pago') return;
      
      const categoryName = acc.category || 'Sem Categoria';
      const categoryColor = categories.find(c => c.name === categoryName)?.color || '#94A3B8';
      
      if (!dataMap.has(categoryName)) {
        dataMap.set(categoryName, {
          category: categoryName,
          color: categoryColor,
          items: [],
          total: 0
        });
      }

      const data = dataMap.get(categoryName)!;
      data.items.push({
        description: acc.description,
        amount: Math.abs(acc.amount || 0)
      });
      data.total += Math.abs(acc.amount || 0);
    });

    return Array.from(dataMap.values()).sort((a, b) => b.total - a.total);
  }, [accounts, categories]);

  // Calcular totais
  const totalIncome = incomeByCategory.reduce((sum, cat) => sum + cat.total, 0);
  const totalExpenses = expensesByCategory.reduce((sum, cat) => sum + cat.total, 0);
  const balance = totalIncome - totalExpenses;

  // TOP 3 categorias de despesa
  const top3Expenses = expensesByCategory.slice(0, 3).map(cat => ({
    category: cat.category,
    amount: cat.total,
    percentage: totalExpenses > 0 ? (cat.total / totalExpenses * 100).toFixed(1) : '0.0'
  }));

  return (
    <div className="space-y-6">
      {/* CABEÇALHO */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-purple-900 uppercase tracking-wide">Relatório Financeiro Mensal</h2>
          <div className="flex justify-center gap-8 text-sm text-slate-700">
            <div><span className="font-semibold">Mês/Ano:</span> {monthYear}</div>
            <div><span className="font-semibold">Período:</span> {startOfMonth} a {endOfMonth}</div>
            <div><span className="font-semibold">Gerado em:</span> {generationDate}</div>
          </div>
        </div>
      </Card>

      {/* SEÇÃO DE RECEITAS */}
      <Card className="p-6 border-2 border-green-200">
        <h2 className="text-2xl font-bold text-green-700 mb-6 pb-3 border-b-2 border-green-300 uppercase tracking-wide">
          📈 Receitas do Mês
        </h2>
        
        {incomeByCategory.length === 0 ? (
          <p className="text-slate-500 text-center py-8">Nenhuma receita registrada neste mês</p>
        ) : (
          <div className="space-y-6">
            {incomeByCategory.map((catData) => (
              <div key={catData.category} className="border-2 border-green-100 rounded-lg overflow-hidden">
                <div className="bg-green-50 p-4 border-b-2 border-green-200">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: catData.color }}
                    />
                    <h3 className="text-lg font-bold text-green-800 uppercase">
                      Categoria: {catData.category}
                    </h3>
                  </div>
                </div>
                
                <div className="p-4 space-y-2">
                  {catData.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b border-green-50 last:border-0">
                      <span className="text-slate-700">• {item.description}</span>
                      <span className="font-semibold text-green-700">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="bg-green-100 p-4 border-t-2 border-green-200">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-green-900 uppercase">Total {catData.category}:</span>
                    <span className="text-xl font-bold text-green-700">{formatCurrency(catData.total)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* SEÇÃO DE DESPESAS */}
      <Card className="p-6 border-2 border-red-200">
        <h2 className="text-2xl font-bold text-red-700 mb-6 pb-3 border-b-2 border-red-300 uppercase tracking-wide">
          📉 Despesas do Mês
        </h2>
        
        {expensesByCategory.length === 0 ? (
          <p className="text-slate-500 text-center py-8">Nenhuma despesa registrada neste mês</p>
        ) : (
          <div className="space-y-6">
            {expensesByCategory.map((catData) => (
              <div key={catData.category} className="border-2 border-red-100 rounded-lg overflow-hidden">
                <div className="bg-red-50 p-4 border-b-2 border-red-200">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: catData.color }}
                    />
                    <h3 className="text-lg font-bold text-red-800 uppercase">
                      Categoria: {catData.category}
                    </h3>
                  </div>
                </div>
                
                <div className="p-4 space-y-2">
                  {catData.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b border-red-50 last:border-0">
                      <span className="text-slate-700">• {item.description}</span>
                      <span className="font-semibold text-red-700">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="bg-red-100 p-4 border-t-2 border-red-200">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-red-900 uppercase">Total {catData.category}:</span>
                    <span className="text-xl font-bold text-red-700">{formatCurrency(catData.total)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* RESUMO FINAL */}
      <Card className="p-6 border-2 border-slate-300 bg-slate-50">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center uppercase tracking-wide">
          Resumo Financeiro - {monthYear}
        </h2>
        
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="border-2 border-slate-300 rounded-lg overflow-hidden">
            <div className="bg-white">
              <div className="flex justify-between items-center p-4 border-b-2 border-slate-200">
                <span className="font-bold text-slate-700 uppercase">Receitas Totais</span>
                <span className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</span>
              </div>
              <div className="flex justify-between items-center p-4 border-b-2 border-slate-200">
                <span className="font-bold text-slate-700 uppercase">Despesas Totais</span>
                <span className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</span>
              </div>
              <div className={`flex justify-between items-center p-4 ${balance >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
                <span className="font-bold text-slate-800 uppercase">Saldo do Mês</span>
                <span className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                  {formatCurrency(balance)}
                </span>
              </div>
            </div>
          </div>

          {/* TOP 3 CATEGORIAS */}
          {top3Expenses.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-bold text-slate-800 mb-4 uppercase tracking-wide">
                Top 3 Categorias de Despesa:
              </h3>
              <div className="space-y-3">
                {top3Expenses.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-white border-2 border-slate-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-slate-400">{idx + 1}.</span>
                      <span className="font-semibold text-slate-700">{item.category}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-red-600">{formatCurrency(item.amount)}</div>
                      <div className="text-sm text-slate-500">({item.percentage}%)</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
