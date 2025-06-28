
import React, { useState, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useAccounts } from '@/contexts/AccountsContext';
import { useCategoriesData } from '@/hooks/useCategoriesData';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { format, parseISO, getMonth, getYear, subMonths, isAfter, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Analise: React.FC = () => {
  const { accounts } = useAccounts();
  const { categories } = useCategoriesData();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Cores variadas para o gráfico de pizza
  const COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', 
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
  ];

  // Gerar opções de meses e anos
  const months = [
    { value: 0, label: 'Janeiro' },
    { value: 1, label: 'Fevereiro' },
    { value: 2, label: 'Março' },
    { value: 3, label: 'Abril' },
    { value: 4, label: 'Maio' },
    { value: 5, label: 'Junho' },
    { value: 6, label: 'Julho' },
    { value: 7, label: 'Agosto' },
    { value: 8, label: 'Setembro' },
    { value: 9, label: 'Outubro' },
    { value: 10, label: 'Novembro' },
    { value: 11, label: 'Dezembro' },
  ];

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    accounts.forEach(account => {
      const year = getYear(parseISO(account.dueDate));
      years.add(year);
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [accounts]);

  // Dados para gráfico de barras (últimos 6 meses)
  const barChartData = useMemo(() => {
    const now = new Date();
    const sixMonthsAgo = subMonths(now, 6);
    
    const monthlyData: { [key: string]: { receitas: number; despesas: number } } = {};
    
    // Inicializar os últimos 6 meses com valores zero
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(now, i);
      const monthKey = format(date, 'MMM yyyy', { locale: ptBR });
      monthlyData[monthKey] = { receitas: 0, despesas: 0 };
    }
    
    accounts.forEach(account => {
      const date = parseISO(account.dueDate);
      
      // Filtrar apenas contas dos últimos 6 meses
      if (isAfter(date, sixMonthsAgo) && isBefore(date, now)) {
        const monthKey = format(date, 'MMM yyyy', { locale: ptBR });
        
        if (monthlyData[monthKey]) {
          if (account.type === 'receita') {
            monthlyData[monthKey].receitas += account.amount;
          } else {
            monthlyData[monthKey].despesas += Math.abs(account.amount);
          }
        }
      }
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      receitas: data.receitas,
      despesas: data.despesas,
    }));
  }, [accounts]);

  // Dados para gráfico de pizza - filtrar por mês/ano selecionado
  const pieChartData = useMemo(() => {
    console.log('=== DEBUG GRÁFICO DE PIZZA ===');
    console.log('Mês selecionado:', selectedMonth, 'Ano selecionado:', selectedYear);
    console.log('Total de contas:', accounts.length);
    
    // Filtrar contas do mês/ano selecionado que são despesas
    const filteredAccounts = accounts.filter(account => {
      const date = parseISO(account.dueDate);
      const accountMonth = getMonth(date);
      const accountYear = getYear(date);
      
      const isExpense = account.type === 'despesa';
      const matchesMonth = accountMonth === selectedMonth;
      const matchesYear = accountYear === selectedYear;
      
      console.log(`Conta: ${account.description}, Categoria: ${account.category}, Data: ${account.dueDate}, Tipo: ${account.type}, Mês: ${accountMonth}, Ano: ${accountYear}, Passa filtro: ${isExpense && matchesMonth && matchesYear}`);
      
      return isExpense && matchesMonth && matchesYear;
    });

    console.log('Contas filtradas (despesas do período):', filteredAccounts.length);
    
    // Agrupar por categoria
    const categoryTotals: { [key: string]: number } = {};
    
    filteredAccounts.forEach(account => {
      const category = account.category;
      if (!categoryTotals[category]) {
        categoryTotals[category] = 0;
      }
      categoryTotals[category] += Math.abs(account.amount);
    });

    console.log('Totais por categoria:', categoryTotals);

    // Converter para array e adicionar cores
    const result = Object.entries(categoryTotals)
      .filter(([_, value]) => value > 0)
      .map(([name, value], index) => ({
        name,
        value,
        color: COLORS[index % COLORS.length]
      }));

    console.log('Dados finais do gráfico:', result);
    console.log('=== FIM DEBUG ===');
    
    return result;
  }, [accounts, selectedMonth, selectedYear]);

  // Calcular totais
  const totals = useMemo(() => {
    const receitas = accounts
      .filter(account => account.type === 'receita')
      .reduce((sum, account) => sum + account.amount, 0);
    
    const despesas = accounts
      .filter(account => account.type === 'despesa')
      .reduce((sum, account) => sum + Math.abs(account.amount), 0);

    return { receitas, despesas, saldo: receitas - despesas };
  }, [accounts]);

  const chartConfig = {
    receitas: {
      label: "Receitas",
      color: "#22c55e",
    },
    despesas: {
      label: "Despesas",
      color: "#ef4444",
    },
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-800">Análise Gráfica</h1>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Receitas</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {totals.receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Despesas</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                R$ {totals.despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo</CardTitle>
              <DollarSign className={`h-4 w-4 ${totals.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totals.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {totals.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Barras - Últimos 6 Meses */}
        <Card>
          <CardHeader>
            <CardTitle>Receitas vs Despesas - Últimos 6 Meses</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[300px]">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value: number) => [
                      `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                      ''
                    ]}
                  />
                  <Bar dataKey="receitas" fill="var(--color-receitas)" />
                  <Bar dataKey="despesas" fill="var(--color-despesas)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Controles e Gráfico de Pizza */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Despesas por Categoria</CardTitle>
              <div className="flex gap-4">
                <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Selecione o mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value.toString()}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Ano" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {pieChartData.length > 0 ? (
              <div className="space-y-4">
                <div className="text-sm text-slate-600">
                  Despesas de {months[selectedMonth].label} de {selectedYear}
                </div>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [
                        `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                        'Valor'
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Legenda das categorias */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                  {pieChartData.map((category, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <span className="text-sm text-slate-700">{category.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-slate-500">
                <p className="text-lg mb-2">Nenhuma despesa encontrada</p>
                <p className="text-sm text-center">
                  Não há despesas cadastradas para {months[selectedMonth].label} de {selectedYear}.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Analise;
